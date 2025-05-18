import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import MainSceneContent from "./components/MainSceneContent";
import CharacterModel from "./components/CharacterModel";
import FPSMonitor from "./components/FPSMonitor";
import AudioManager from "./components/AudioManager";
import VideoMemory from "./components/VideoMemory";
import MemoryRoom from "./components/MemoryRoom";
import BlackFade from "./components/BlackFade"; // 🔴 BU ÖNEMLİ

import "./App.css";

export default function App() {
  const [portalActive, setPortalActive] = useState(false);
  const [playVideo, setPlayVideo] = useState(false);
  const [showMemoryRoom, setShowMemoryRoom] = useState(false);
  const [showBlack, setShowBlack] = useState(false); // 🔴 BU EKSİKTİ

  // Başlatma butonuna basınca portal açılır
  const handleEnterMyMindClick = () => {
    setPortalActive(true);
  };

  // Portala tıklanınca video başlar ve sahne geçişi yapılır
  const handlePortalClick = () => {
    setShowBlack(true); // Siyahlık başlar
    setTimeout(() => {
      setPlayVideo(true); // Video başlat
      setShowBlack(false); // Siyah kaybolur
    }, 1000);

    setTimeout(() => {
      setShowBlack(true); // Video biterken tekrar siyah
    }, 6000); // 5sn video + fadeout için buffer

    setTimeout(() => {
      setPlayVideo(false);
      setShowBlack(false);
      setShowMemoryRoom(true); // Video bitti, anı odasına geç
    }, 7500); // Toplam 7.5sn → siyahlık kalkar, odadayız
  };

  // Mouse wheel uyarısını engelle
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

      {/* 🎵 Arka Plan Ses ve FPS */}
      <AudioManager id="audio-manager" />
      <FPSMonitor visible={true} />

      {/* 🎞️ Video Overlay + Siyah Geçiş */}
      {showBlack && (
  <BlackFade
    show={showBlack}
    onFadeOut={() => {
      // FadeOut tamamlanınca yapılacak işlemler
      console.log("fade out bitti");
    }}
  />
)}
      {playVideo && <VideoMemory />}

      {/* 🌌 Ana Sahne */}
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
          <MainSceneContent
            portalActive={portalActive}
            onRequestVideoStart={handlePortalClick}
          />
          {showMemoryRoom && <MemoryRoom visible={true} />}
        </Suspense>
      </Canvas>

      {/* 🧑 Karakter Sahnesi */}
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

      {/* 🚪 Portal Giriş Butonu */}
      {!portalActive && (
        <div className="enter-button">
          <button onClick={handleEnterMyMindClick}>Enter My Mind</button>
        </div>
      )}
    </div>
  );
}
