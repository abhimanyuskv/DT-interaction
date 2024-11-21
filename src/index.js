import React from "react";
import ReactDOM from "react-dom/client";
import InteractionSystem from "./App"; // Adjust the import path if needed
import "./index.css"; // Optional: if you have any global styles

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <InteractionSystem/>
  </React.StrictMode>
);
