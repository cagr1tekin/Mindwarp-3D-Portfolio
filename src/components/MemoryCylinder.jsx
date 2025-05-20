import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

export default function MemoryCylinder({ radius = 50, height = 100, position = [0, 0, -5000] }) {
  const groupRef = useRef();
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      "./memories/memory3.png",
      (tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        setTexture(tex);
      },
      undefined,
      (error) => console.error("Doku yüklenemedi:", error)
    );
  }, []);

  if (!texture) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* Silindirin yan yüzeyi */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[radius, radius, height, 64, 1, true]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} transparent opacity={0.4} />
      </mesh>

      {/* Silindirin tabanı */}
      <mesh position={[0, -height / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 64]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}