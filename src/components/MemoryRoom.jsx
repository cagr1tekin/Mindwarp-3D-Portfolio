import SpawnElevator from "./SpawnElevator";
import PortalElevator from "./PortalElevator";// en üste ekle
import React, { useState, useEffect } from 'react';
import MemoryCube from "./MemoryCube";
import { useThree, useLoader } from "@react-three/fiber";
import FPSController from './FPSController';
import * as THREE from 'three';

import HologramPoliceRobot from './HologramPoliceRobot';

export default function MemoryRoom({ visible = true }) {
  const { camera } = useThree();
  const [insideCube, setInsideCube] = useState(false);

  function PanoramicSkySphere({ radius = 5000, texturePath = './public/m11.jpg', position = [0, 0, -5000] }) {
    const texture = useLoader(THREE.TextureLoader, texturePath);
    
    return (
      <mesh position={position}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </mesh>
    );
  }
  

  useEffect(() => {
    const handleClick = () => {
      if (document.body.requestPointerLock) {
        document.body.requestPointerLock();
      }
    };
  
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);
  
  
  
  // Kamera konumunu kontrol et
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const distanceToCenter = Math.sqrt(
          Math.pow(camera.position.x - 0, 2) +
          Math.pow(camera.position.y - 0, 2) +
          Math.pow(camera.position.z - (-5000), 2)
        );
        
        if (distanceToCenter < 5) {
          if (!insideCube) {
            setInsideCube(true);
          }
        } else if (insideCube) {
          setInsideCube(false);
        }
      } catch (error) {
        console.error("Kamera pozisyonu kontrol hatası:", error);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [camera, insideCube]);

  if (!visible) return null;

  const CUBE_SIZE = 100;
  const CUBE_POSITION = [0, 0, -5000];
  
  return (
    <group>
<PanoramicSkySphere 
  radius={5000} 
  texturePath="./public/m11.jpg" 
  position={[0, 0, -5000]} // küple aynı merkezde olacak
/>
<pointLight position={[0, -48, -5000]} intensity={2} distance={300} color="#ffffff" />

      <MemoryCube size={CUBE_SIZE} position={CUBE_POSITION} />
      
      <HologramPoliceRobot 
       
      />
      
      <HologramPoliceRobot 

      />
      
      <HologramPoliceRobot 
  position={[0, -CUBE_SIZE / 2 + 1, -5020]}
  rotation={[0, Math.PI, 0]}
  scale={[2, 2, 2]}
  emissiveIntensity={3}
/>

<SpawnElevator 
  cubeSize={CUBE_SIZE} 
  cubePosition={CUBE_POSITION}
/>
<PortalElevator
  cubeSize={CUBE_SIZE}
  cubePosition={CUBE_POSITION}
  onTeleport={() => {
    console.log("🌀 Teleport gerçekleşti!");
    // sahne geçişi, video oynatma gibi şeyleri burada yap
  }}
/>
      <FPSController
        bounds={CUBE_SIZE / 2 - 1}
        initialPosition={[0, -CUBE_SIZE / 2 + 10, -5000]}
        initialLookAt={[0, -CUBE_SIZE / 2 + 10, -5000]}
        moveSpeed={25}
      />
    </group>
  );
} 