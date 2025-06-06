import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

export default function MemoryCylinder({ radius = 64, height = 100, position = [0, 0, -5000] }) {
  const groupRef = useRef();
  const [texture, setTexture] = useState(null);
  const [floorTexture, setFloorTexture] = useState(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();

    loader.load(
      "./memoryroom_panel.png",
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.repeat.set(-1, 1);  // ✅ Yazıyı ters çeviriyoruz
        tex.center.set(0.5, 0.5);
        tex.anisotropy = 16;
        setTexture(tex);
      },
      undefined,
      (err) => console.error("Doku yüklenemedi:", err)
    );

    loader.load(
      "./memories/memory3.png",
      (floorTex) => {
        floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
        floorTex.repeat.set(1, 1);
        setFloorTexture(floorTex);
      }
    );
  }, []);

  if (!texture || !floorTexture) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* Yan duvar */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[radius, radius, height, 64, 1, true]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} transparent opacity={0.8} />
      </mesh>

      {/* Taban */}
      <mesh position={[0, -height / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 64]} />
        <meshBasicMaterial map={floorTexture} side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
