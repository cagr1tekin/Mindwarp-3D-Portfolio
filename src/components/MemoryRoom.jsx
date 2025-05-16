import React, { useState, useEffect } from 'react';
import { Text } from "@react-three/drei";
import MemoryCube from "./MemoryCube";
import { useThree } from "@react-three/fiber";

export default function MemoryRoom({ visible = true }) {
  const { camera } = useThree();
  const [insideCube, setInsideCube] = useState(false);
  
  // Kamera konumunu kontrol et
  useEffect(() => {
    // Kamera pozisyonunu takip etmek için bir temizleyici
    const interval = setInterval(() => {
      try {
        // Küpün merkezi yaklaşık olarak [0, 0, -5000] ise
        const distanceToCenter = Math.sqrt(
          Math.pow(camera.position.x - 0, 2) +
          Math.pow(camera.position.y - 0, 2) +
          Math.pow(camera.position.z - (-5000), 2)
        );
        
        // Eğer küpün içindeyse (küp boyutu 100 ise - daha büyük küp)
        if (distanceToCenter < 50) {
          if (!insideCube) {
            setInsideCube(true);
            console.log("Anı odasına girdi!", camera.position);
          }
        } else if (insideCube) {
          setInsideCube(false);
          console.log("Anı odasından çıktı!");
        }
      } catch (error) {
        console.error("Kamera pozisyonu kontrol hatası:", error);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [camera, insideCube]);

  if (!visible) return null;

  return (
    <group>
      <MemoryCube size={100} position={[0, 0, 0]} />
      
      
      
    </group>
  );
} 