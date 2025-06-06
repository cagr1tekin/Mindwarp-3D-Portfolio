import React, { useState, useEffect, useRef } from 'react';
import { useThree, useLoader, useFrame } from "@react-three/fiber";
import * as THREE from 'three';

import SpawnElevator from "./SpawnElevator";
import PortalElevator from "./PortalElevator";
import MemoryCylinder from "./MemoryCylinder";
import FPSController from './FPSController';
import HologramPoliceRobot from './HologramPoliceRobot';

export default function MemoryRoom({ visible = true }) {
  const { camera } = useThree();
  const [insideArea, setInsideArea] = useState(false);
  const [elevatorAnimationDone, setElevatorAnimationDone] = useState(false);
  const [portalBind, setPortalBind] = useState(false);

  const CYLINDER_RADIUS = 64;
  const CYLINDER_HEIGHT = 100;
  const CYLINDER_POSITION = [0, 0, -5000];

  // 🌎 Dönen küre componenti
  function PanoramicSkySphere({ radius = 5000, texturePath = './m11.jpg', position = [0, 0, -5000] }) {
    const texture = useLoader(THREE.TextureLoader, texturePath);
    const sphereRef = useRef();

    useFrame((state, delta) => {
      if (sphereRef.current) {
        sphereRef.current.rotation.y += delta * 0.07; // dönme hızı
      }
    });

    return (
      <mesh ref={sphereRef} position={position}>
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

  useEffect(() => {
    const checkInterval = setInterval(() => {
      try {
        const center = new THREE.Vector3(...CYLINDER_POSITION);
        const distance = camera.position.distanceTo(center);
        setInsideArea(distance < 5);
      } catch (err) {
        console.error("🚫 Kamera pozisyonu kontrol hatası:", err);
      }
    }, 500);
    return () => clearInterval(checkInterval);
  }, [camera, insideArea]);

  if (!visible) return null;

  return (
    <group>
      <PanoramicSkySphere
        radius={5000}
        texturePath="./m11.jpg"
        position={CYLINDER_POSITION}
      />

      <pointLight
        position={[0, -48, -5000]}
        intensity={2}
        distance={300}
        color="#ffffff"
      />

      <MemoryCylinder
        radius={CYLINDER_RADIUS}
        height={CYLINDER_HEIGHT}
        position={CYLINDER_POSITION}
      />

      <HologramPoliceRobot />
      <HologramPoliceRobot />
      <HologramPoliceRobot
        position={[0, -CYLINDER_HEIGHT / 2 + 1, -5020]}
        rotation={[0, Math.PI, 0]}
        scale={[2, 2, 2]}
        emissiveIntensity={3}
      />

      <SpawnElevator
        cubeSize={CYLINDER_HEIGHT}
        cubePosition={CYLINDER_POSITION}
        onAnimationDone={() => setElevatorAnimationDone(true)}
      />

      <PortalElevator
        cubeSize={CYLINDER_HEIGHT}
        cubePosition={CYLINDER_POSITION}
        onTeleport={() => {
          console.log("🌀 Teleport gerçekleşti!");
        }}
      />

      <FPSController
        bounds={CYLINDER_RADIUS - 1}
        initialPosition={[0, -35, -5000]}
        initialLookAt={[0, -35, -5010]}
        moveSpeed={25}
        elevatorDone={elevatorAnimationDone}
        controlsEnabled={true}
        portalBind={portalBind}
      />
    </group>
  );
}
