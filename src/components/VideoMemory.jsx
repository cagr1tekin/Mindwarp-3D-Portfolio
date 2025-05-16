import { useRef, useEffect, useState } from "react";
import { useVideoTexture } from "@react-three/drei";
import * as THREE from "three";

export default function VideoMemory({ videoSrc, position, rotation }) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  // Video dokusu yükleme işleminde hata yakalama
  let videoTexture;
  try {
    videoTexture = useVideoTexture(videoSrc, {
      crossOrigin: 'anonymous',
      muted: true,
      loop: true,
      start: true,
      unsuspend: "canplay",
      playsInline: true
    });
    
    // Video başarıyla yüklendiyse
    useEffect(() => {
      setVideoLoaded(true);
    }, [videoTexture]);
  } catch (error) {
    console.warn(`Video dokusu yüklenemedi: ${videoSrc}`, error);
  }
  
  // Video yüklenemezse renk dokusu kullan
  if (!videoLoaded) {
    return (
      <mesh position={position} rotation={rotation}>
        <planeGeometry args={[16, 9]} />
        <meshBasicMaterial color="#4a2d99" side={THREE.BackSide} />
      </mesh>
    );
  }
  
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[16, 9]} />
      <meshBasicMaterial map={videoTexture} toneMapped={false} side={THREE.BackSide} />
    </mesh>
  );
}
