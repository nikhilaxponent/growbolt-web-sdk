import React from "react";
import "./ui/styles.css";
import SDKLauncher from "./ui/SDKLauncher";
import SDKContext from "./ui/context/SDKContext";
import type { SDKService } from "./types/service";

// In dev mode (main.tsx), ./index is imported first which sets window.GrowBolt.
// We read it at render time (not module-eval time) to guarantee it's set.
export default function App() {
  const devSdk = (window as { GrowBolt?: SDKService }).GrowBolt ?? null;

  return (
    <div style={{ fontFamily: "Rethink Sans, Inter, system-ui, Arial", padding: 20 }}>
      <SDKContext.Provider value={devSdk}>
        <SDKLauncher />
      </SDKContext.Provider>
    </div>
  );
}
