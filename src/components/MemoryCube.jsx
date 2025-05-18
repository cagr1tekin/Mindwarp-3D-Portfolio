import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

export default function MemoryCube({ size = 100, position = [0, 0, -5000] }) {
  const groupRef = useRef();
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      "/Mindwarp-3D-Portfolio/memories/memory3.png", // Her yüze aynı doku
      (tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        setTexture(tex);
      },
      undefined,
      (error) => {
        console.error("Doku yüklenemedi:", error);
      }
    );
  }, []);

  if (!texture) return null;

  const materials = [
    // Right
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, transparent: true, opacity: 0.2 }),
    // Left
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, transparent: true, opacity: 0.2 }),
    // Top
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, transparent: true, opacity: 0.1 }),
    // Bottom (taban)
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, transparent: true, opacity: 0.5 }),
    // Front
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, transparent: true, opacity: 0.2 }),
    // Back
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, transparent: true, opacity: 0.2 })
  ];
  

  return (
    <group ref={groupRef} position={position}>
      <mesh>
  <boxGeometry args={[size, size, size]} />
  {materials.map((mat, i) => (
    <primitive attach={`material-${i}`} object={mat} key={i} />
  ))}
</mesh>

    </group>
  );
}
