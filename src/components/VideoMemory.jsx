// components/VideoMemory.jsx
import { useEffect, useRef } from "react";
import "../styles/VideoMemory.css";

export default function VideoMemory({ onFinish }) {
  const videoRef = useRef();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
  
    video.playbackRate = 2;
    video.play();
  
    // Tam süresini bekleyip sonra bile oynasın
    const timer = setTimeout(() => {
      video.pause();
      if (onFinish) onFinish();
    }, 5500); // 11 saniyenin 2x'i
  
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="video-overlay">
      <video
        ref={videoRef}
        src="./public/tunnelEfect.mp4"
        muted
        autoPlay
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}
