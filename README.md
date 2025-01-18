# DT-interaction

This project demonstrates interactive 3D object manipulation in a React application using `react-three/fiber` and `@react-three/drei`. Users can manipulate 3D objects in a scene, including transformations like **translation**, **scaling**, and **rotation**. Additionally, objects can be duplicated, deleted, and selected, with intuitive controls for **zooming**, **panning**, and **orbiting** the scene.

## Features

- **3D Object Manipulation**: Translate, rotate, and scale 3D objects.
- **Keyboard Shortcuts**:
  - **D (Ctrl+D)**: Duplicate the selected object.
  - **Delete**: Delete the selected object.
  - **G**: Enable translation mode (move the object).
  - **R**: Enable rotation mode.
  - **S**: Enable scaling mode.
  - **X, Y, Z**: Restrict transformations to specific axes.
  - **Shift + X, Y, Z**: Allow transformation across two axes at once.
  - **Escape**: Cancel the transformation and revert the changes.
  - **Enter**: Confirm the transformation.
- **Orbit, Zoom, Pan**: Use the mouse or trackpad to navigate the 3D scene.
- **Outline Effect**: Selected objects are outlined in yellow for better visibility.
  
## Technologies Used

- **React**: JavaScript library for building user interfaces.
- **react-three/fiber**: A React renderer for Three.js, allowing for declarative 3D graphics in React.
- **@react-three/drei**: A set of useful abstractions and components for `react-three/fiber`.
- **Three.js**: 3D graphics library that powers the 3D objects and transformations.

## Live Demo

https://dt-interaction.vercel.app/

## Installation

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/abhimanyuskv/DT-interaction.git
   cd DT-interaction

2. Install the dependencies:
   ```bash
   npm install

3. Start the development server:
   ```bash
   npm start

4. Visit the application in your browser at http://localhost:3000.




