import { useGLTF } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function HologramPoliceRobot({ 
  position = [0, 0, 0],
  scale = [1, 1, 1],
  rotation = [0, 0, 0],
  hoverAmount = 0.5,
  hoverSpeed = 1.5
}) {
  const { scene } = useGLTF('./hologram_police_robots.glb');
  const groupRef = useRef();
  const initialY = useRef(position[1]);
  const time = useRef(0);

  useFrame((state, delta) => {
    if (groupRef.current) {
      time.current += delta;
      const newY = initialY.current + Math.sin(time.current * hoverSpeed) * hoverAmount;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale} rotation={rotation}>
      <pointLight position={[0, 3, 0]} intensity={2} distance={10} color="white" />
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('./hologram_police_robots.glb');
