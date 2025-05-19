import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import MainSceneContent from "./components/MainSceneContent";
import CharacterModel from "./components/CharacterModel";
import FPSMonitor from "./components/FPSMonitor";
import AudioManager from "./components/AudioManager";
import VideoMemory from "./components/VideoMemory";
import MemoryRoom from "./components/MemoryRoom";
import BlackFade from "./components/BlackFade";

import "./App.css";

export default function App() {
  const [portalActive, setPortalActive] = useState(false);
  const [playVideo, setPlayVideo] = useState(false);
  const [showMemoryRoom, setShowMemoryRoom] = useState(false);
  const [showBlack, setShowBlack] = useState(false);

  const FADE_DURATION = 1000;
  const VIDEO_DURATION = 5500;

  const handleEnterMyMindClick = () => {
    setPortalActive(true);
  };

  const handlePortalClick = () => {
    setShowBlack(true);

    setTimeout(() => {
      setPlayVideo(true);
      setShowBlack(false);
    }, FADE_DURATION);

    setTimeout(() => {
      setShowBlack(true);
    }, FADE_DURATION + VIDEO_DURATION - 1000);

    setTimeout(() => {
      setPlayVideo(false);
      setShowMemoryRoom(true);
    }, FADE_DURATION + VIDEO_DURATION);

    setTimeout(() => {
      setShowBlack(false);
    }, FADE_DURATION + VIDEO_DURATION + FADE_DURATION);
  };

  useEffect(() => {
    const options = { passive: true };
    const emptyScroll = () => {};
    document.addEventListener("wheel", emptyScroll, options);
    return () => {
      document.removeEventListener("wheel", emptyScroll, options);
    };
  }, []);

  return (
    <div className="container">
      <AudioManager id="audio-manager" />
      <FPSMonitor visible={true} />

      <BlackFade show={showBlack} duration={1500} />

      {playVideo && <VideoMemory />}

      <Canvas
        className="main-canvas"
        camera={{ position: [0, 0, 50], fov: 60, near: 0.1, far: 50000 }}
        gl={{
          alpha: false,
          antialias: true,
          logarithmicDepthBuffer: false,
          precision: "mediump",
          powerPreference: "high-performance",
        }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={1.3} />
        <directionalLight position={[50, 50, 50]} intensity={1.8} color="#ffffff" />
        <Suspense fallback={<></>}>
  {!showMemoryRoom && (
    <MainSceneContent
      portalActive={portalActive}
      onRequestVideoStart={handlePortalClick}
    />
  )}
  {showMemoryRoom && <MemoryRoom visible={true} />}
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
          zIndex: 9999,
          background: "transparent",
          pointerEvents: "auto",
        }}
        gl={{
          alpha: true,
          antialias: true,
          precision: "mediump",
          powerPreference: "high-performance",
        }}
        dpr={[1, 1.5]}
        camera={{ position: [6, 1, 5], fov: 30 }}
      >
        <ambientLight intensity={2.2} color="#ffffff" />
        <directionalLight position={[0, 5, 5]} intensity={2} color="#ffffff" />
        <Suspense fallback={null}>
          <CharacterModel />
        </Suspense>
      </Canvas>

      {!portalActive && (
        <div className="enter-button">
          <button onClick={handleEnterMyMindClick}>Enter My Mind</button>
        </div>
      )}
    </div>
  );
}
