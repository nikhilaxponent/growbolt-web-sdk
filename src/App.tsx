import React from "react";
import "./ui/styles.css";
import SDKLauncher from "./ui/SDKLauncher";

export default function App() {
  return (
    <div style={{ fontFamily: "Inter, system-ui, Arial", padding: 20 }}>
      <SDKLauncher />
    </div>
  );
}
