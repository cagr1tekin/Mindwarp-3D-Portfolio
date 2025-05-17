import React, { useState, useEffect } from 'react';
import { Text } from "@react-three/drei";
import MemoryCube from "./MemoryCube";
import { useThree } from "@react-three/fiber";
import FPSController from './FPSController';

export default function MemoryRoom({ visible = true }) {
  const { camera } = useThree();
  const [insideCube, setInsideCube] = useState(false);
  
  // Kamera konumunu kontrol et
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const halfSize = CUBE_SIZE / 2;
        const [cx, cy, cz] = CUBE_POSITION;
  
        const inside =
          camera.position.x >= cx - halfSize && camera.position.x <= cx + halfSize &&
          camera.position.y >= cy - halfSize && camera.position.y <= cy + halfSize &&
          camera.position.z >= cz - halfSize && camera.position.z <= cz + halfSize;
  
        // sadece `inside`'a göre karar ver
        setInsideCube(inside);
  
      } catch (error) {
        console.error("Kamera pozisyonu kontrol hatası:", error);
      }
    }, 500);
  
    return () => clearInterval(interval);
  }, [camera]);
  

  if (!visible) return null;

  const CUBE_SIZE = 100;
  const CUBE_POSITION = [0, 0, -5000];
  
  return (
    <group>
      <MemoryCube size={CUBE_SIZE} position={CUBE_POSITION} />
      
      {/* FPS Kontrolcüsü - Küp boyutuna göre sınırlandırılmış */}
      <FPSController
  bounds={CUBE_SIZE / 2 - 5}
  initialPosition={[0, -CUBE_SIZE / 2 + 10, -5000]}
  initialLookAt={[0, -CUBE_SIZE / 2 + 10, -4990]}
  moveSpeed={30}
/>

    </group>
  );
} 