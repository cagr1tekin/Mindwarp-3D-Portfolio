import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import MainSceneContent from "./components/MainSceneContent";
import CharacterModel from "./components/CharacterModel";
import FPSMonitor from "./components/FPSMonitor";
import AudioManager from "./components/AudioManager";

import "./App.css";

export default function App() {
  // console.log("[App] Component renderlandı");
  const [portalActive, setPortalActive] = useState(false);

  const handleEnterMyMindClick = () => {
    setPortalActive(true);
  };
  
  // Wheel event listener uyarılarını engellemek için
  useEffect(() => {
    // Passive wheel event uyarısını engelle
    const options = {
      passive: true
    };

    // Ana document'e passive wheel listener ekle
    document.addEventListener('wheel', () => {}, options);
    
    return () => {
      document.removeEventListener('wheel', () => {}, options);
    };
  }, []);

  return (
    <div className="container">
      <AudioManager id="audio-manager" />
      <FPSMonitor visible={true} />
      
      <Canvas
        className="main-canvas"
        camera={{ position: [0, 0, 50], fov: 60, near: 0.1, far: 50000 }}
        gl={{ 
          alpha: false,
          antialias: true,
          logarithmicDepthBuffer: false,
          precision: "mediump",
          powerPreference: "high-performance"
        }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={1.3} />
        <directionalLight position={[50, 50, 50]} intensity={1.8} color="#ffffff" />
        <Suspense fallback={<></>}>
          <MainSceneContent portalActive={portalActive} />
        </Suspense>
      </Canvas>

      <Canvas
        className="character-canvas"
        style={{
          position: "absolute",
          bottom: "-200px",
          left: "0",
          width: "350px",
          height: "600px",
          zIndex: 50,
          background: "transparent",
          pointerEvents: "auto",
        }}
        gl={{ 
          alpha: true, 
          antialias: true,
          precision: "mediump",
          powerPreference: "high-performance"
        }}
        dpr={[1, 1.5]}
        camera={{ position: [6, 1, 5], fov: 30 }}
      >
        <ambientLight intensity={2.2} color="#ffffff" />
        <directionalLight 
          position={[0, 5, 5]} 
          intensity={2} 
          color="#ffffff" 
        />
        <Suspense fallback={null}>
          <CharacterModel />
        </Suspense>
      </Canvas>

      {!portalActive && (
        <div className="enter-button">
          <button onClick={handleEnterMyMindClick}>
            Enter My Mind
          </button>
        </div>
      )}
    </div>
  );
}