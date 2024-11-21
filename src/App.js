import React, { useRef, useEffect, useState, useCallback } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// General Object Component
const ObjectComponent = React.forwardRef(
  (
    { position, scale, rotation, color, geometry, onClick, isSelected },
    ref
  ) => {
    const meshRef = useRef();
    const outlineRef = useRef();

    useEffect(() => {
      if (meshRef.current && isSelected) {
        const geometry = meshRef.current.geometry;
        const edges = new THREE.EdgesGeometry(geometry, 12);
        if (outlineRef.current) {
          outlineRef.current.geometry = edges;
        }
      }
    }, [isSelected]);

    return (
      <group position={position} scale={scale} rotation={rotation} ref={ref}>
        <mesh ref={meshRef} onClick={onClick}>
          {geometry}
          <meshStandardMaterial color={color} />
        </mesh>

        {isSelected && (
          <>
            <lineSegments ref={outlineRef}>
              <edgesGeometry attach="geometry" />
              <lineBasicMaterial
                attach="material"
                color="yellow"
                linewidth={1}
                transparent={true}
                opacity={1}
              />
            </lineSegments>

            <mesh scale={[1.07, 1.07, 1.07]}>
              {geometry}
              <meshBasicMaterial
                color="darkorange"
                transparent={true}
                opacity={2}
                side={THREE.BackSide}
              />
            </mesh>
          </>
        )}
      </group>
    );
  }
);

// Scene Component
const Scene = () => {
  const [objects, setObjects] = useState([
    {
      id: 1,
      position: [0, 0, 0],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
      color: "blue",
      geometry: <boxGeometry args={[1, 1, 1]} />,
    },
    {
      id: 2,
      position: [3, 0, 0],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
      color: "lightblue",
      geometry: <sphereGeometry args={[0.5, 32, 32]} />,
    },
    {
      id: 3,
      position: [-3, 0, 0],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
      color: "grey",
      geometry: <cylinderGeometry args={[0.5, 0.5, 1, 32]} />,
    },
    {
      id: 4,
      position: [2, 2, 0],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
      color: "lightgreen",
      geometry: <boxGeometry args={[1, 1, 1]} />,
    },
    {
      id: 5,
      position: [-1, 2, 0],
      scale: [1, 1, 1],
      rotation: [0, 0, 0],
      color: "lightblue",
      geometry: <cylinderGeometry args={[0.5, 0.5, 1, 32]} />,
    },
  ]);

  const { camera } = useThree();
  const objectRefs = useRef({});
  const [activeObjectId, setActiveObjectId] = useState(null);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [transformMode, setTransformMode] = useState(null);
  const [activeAxes, setActiveAxes] = useState([]);

  const initialTransform = useRef({
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    scale: new THREE.Vector3(),
  });
  const deltaTransform = useRef({
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    scale: new THREE.Vector3(1, 1, 1),
  });

  const updateObject = useCallback((id, updateFn) => {
    setObjects((prev) =>
      prev.map((obj) => (obj.id === id ? updateFn(obj) : obj))
    );
  }, []);

  // Duplication functionality
  const handleDuplicateObject = useCallback(() => {
    if (activeObjectId !== null) {
      const objectToDuplicate = objects.find(
        (obj) => obj.id === activeObjectId
      );
      if (objectToDuplicate) {
        const getNextId = () => {
          return objects.length > 0
            ? Math.max(...objects.map((obj) => obj.id)) + 1
            : 1;
        };

        const newObject = {
          ...objectToDuplicate,
          id: getNextId(),
          position: [
            objectToDuplicate.position[0] + 1,
            objectToDuplicate.position[1],
            objectToDuplicate.position[2],
          ],
        };
        setObjects((prevObjects) => [...prevObjects, newObject]);
        setActiveObjectId(newObject.id);
      }
    }
  }, [activeObjectId, objects]);

  // Delete functionality
  const handleDeleteObject = useCallback(() => {
    if (activeObjectId !== null) {
      setObjects((prevObjects) =>
        prevObjects.filter((obj) => obj.id !== activeObjectId)
      );
      setActiveObjectId(null);
    }
  }, [activeObjectId]);

  const handleMouseMove = useCallback(
    (event) => {
      if (!isGrabbing || !activeObjectId) return;

      const movementX = event.movementX;
      const movementY = -event.movementY;
      const movementScale = 0.01 * (camera.position.z / 5);
      const rotationScale = 0.01;
      const scaleScale = 0.01;

      const activeObject = objects.find((obj) => obj.id === activeObjectId);
      if (!activeObject) return;

      switch (transformMode) {
        case "translate": {
          deltaTransform.current.position.set(0, 0, 0);

          if (activeAxes.length === 0 || activeAxes.includes("x")) {
            deltaTransform.current.position.x = movementX * movementScale;
          }
          if (activeAxes.length === 0 || activeAxes.includes("y")) {
            deltaTransform.current.position.y = movementY * movementScale;
          }
          if (activeAxes.includes("z")) {
            deltaTransform.current.position.z =
              (movementX + movementY) * movementScale;
          }

          const newPosition = new THREE.Vector3(...activeObject.position).add(
            deltaTransform.current.position
          );
          updateObject(activeObjectId, (obj) => ({
            ...obj,
            position: [newPosition.x, newPosition.y, newPosition.z],
          }));
          break;
        }

        case "rotate": {
          const rotationDelta = new THREE.Euler();

          if (activeAxes.length === 0) {
            rotationDelta.x = movementY * rotationScale;
            rotationDelta.y = movementX * rotationScale;
          } else {
            if (activeAxes.includes("x"))
              rotationDelta.x = (movementX + movementY) * rotationScale;
            if (activeAxes.includes("y"))
              rotationDelta.y = (movementX + movementY) * rotationScale;
            if (activeAxes.includes("z"))
              rotationDelta.z = (movementX + movementY) * rotationScale;
          }

          const currentRotation = new THREE.Euler(...activeObject.rotation);
          currentRotation.x += rotationDelta.x;
          currentRotation.y += rotationDelta.y;
          currentRotation.z += rotationDelta.z;

          updateObject(activeObjectId, (obj) => ({
            ...obj,
            rotation: [currentRotation.x, currentRotation.y, currentRotation.z],
          }));
          break;
        }

        case "scale": {
          const scaleFactor = 1 + (movementX + movementY) * scaleScale;
          const newScale = new THREE.Vector3(...activeObject.scale);

          if (activeAxes.length === 0) {
            newScale.multiplyScalar(scaleFactor);
          } else {
            if (activeAxes.includes("x")) newScale.x *= scaleFactor;
            if (activeAxes.includes("y")) newScale.y *= scaleFactor;
            if (activeAxes.includes("z")) newScale.z *= scaleFactor;
          }

          updateObject(activeObjectId, (obj) => ({
            ...obj,
            scale: [newScale.x, newScale.y, newScale.z],
          }));
          break;
        }
        default:
          console.warn(`Unhandled mode`);
          break;
      }
    },
    [
      isGrabbing,
      activeObjectId,
      transformMode,
      activeAxes,
      camera.position.z,
      updateObject,
      objects,
    ]
  );

  const startTransform = useCallback(
    (mode) => {
      if (!isGrabbing) {
        setIsGrabbing(true);
      }
      setTransformMode(mode);
      setActiveAxes([]);
      const activeObject = objects.find((obj) => obj.id === activeObjectId);
      if (activeObject) {
        initialTransform.current = {
          position: new THREE.Vector3(...activeObject.position),
          rotation: new THREE.Euler(...activeObject.rotation),
          scale: new THREE.Vector3(...activeObject.scale),
        };
      }
    },
    [isGrabbing, objects, activeObjectId]
  );

  const endTransform = useCallback(
    (confirm = true) => {
      if (!confirm && activeObjectId) {
        const initial = initialTransform.current;
        updateObject(activeObjectId, (obj) => ({
          ...obj,
          position: [
            initial.position.x,
            initial.position.y,
            initial.position.z,
          ],
          rotation: [
            initial.rotation.x,
            initial.rotation.y,
            initial.rotation.z,
          ],
          scale: [initial.scale.x, initial.scale.y, initial.scale.z],
        }));
      }
      setIsGrabbing(false);
      setTransformMode(null);
      setActiveAxes([]);
    },
    [activeObjectId, updateObject]
  );


  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!activeObjectId) return;

      const isShiftPressed = event.shiftKey;

      switch (event.key.toLowerCase()) {
        case "delete":
          handleDeleteObject();
          break;
        case "d":
          if (event.ctrlKey) {
            event.preventDefault();
            handleDuplicateObject();
          }
          break;
        case "g":
          if (!isGrabbing) {
            startTransform("translate");
          }
          break;
        case "r":
          if (!isGrabbing) {
            startTransform("rotate");
          }
          break;
        case "s":
          if (!isGrabbing) {
            startTransform("scale");
          }
          break;
        case "x":
          if (isGrabbing) {
            if (isShiftPressed) {
              setActiveAxes(["y", "z"]);
            } else {
              setActiveAxes((prev) =>
                prev.includes("x") ? prev.filter((axis) => axis !== "x") : ["x"]
              );
            }
            event.preventDefault();
          }
          break;
        case "y":
          if (isGrabbing) {
            if (isShiftPressed) {
              setActiveAxes(["x", "z"]);
            } else {
              setActiveAxes((prev) =>
                prev.includes("y") ? prev.filter((axis) => axis !== "y") : ["y"]
              );
            }
            event.preventDefault();
          }
          break;
        case "z":
          if (isGrabbing) {
            if (isShiftPressed) {
              setActiveAxes(["x", "y"]);
            } else {
              setActiveAxes((prev) =>
                prev.includes("z") ? prev.filter((axis) => axis !== "z") : ["z"]
              );
            }
            event.preventDefault();
          }
          break;
        case "escape":
          if (isGrabbing) {
            endTransform(false);
          }
          break;
        case "enter":
          if (isGrabbing) {
            endTransform(true);
          }
          break;
        default:
          console.warn(`Unhandled key: ${event.key}`);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeObjectId,
    isGrabbing,
    handleDeleteObject,
    handleDuplicateObject,
    startTransform,
    endTransform,
  ]);

  useEffect(() => {
    if (isGrabbing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", () => endTransform(true));
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", () => endTransform(true));
    };
  }, [isGrabbing, handleMouseMove, endTransform]);


  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[1, 1, 1]} />
      {objects.map((obj) => (
        <ObjectComponent
          key={obj.id}
          ref={(el) => (objectRefs.current[obj.id] = el)}
          position={obj.position}
          scale={obj.scale}
          rotation={obj.rotation}
          color={obj.color}
          onClick={() => !isGrabbing && setActiveObjectId(obj.id)}
          isSelected={obj.id === activeObjectId}
          geometry={obj.geometry}
        />
      ))}
      <OrbitControls
        enableDamping={true}
        dampingFactor={0.25}
        enableZoom={true}
        enablePan={true}
        enabled={!isGrabbing}
        target={[0, 0, 0]}
      />
    </>
  );
};

const App = () => {
  return (
    <Canvas
      style={{ width: "100vw", height: "100vh" }}
      camera={{ position: [0, 0, 5], fov: 75 }}
    >
      <Scene />
    </Canvas>
  );
};

export default App;
