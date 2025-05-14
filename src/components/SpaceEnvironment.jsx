import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export default function SpaceEnvironment() {
  const starsRef = useRef();
  const starsCount = 20000;
  const starSize = 0.5;
  
  // InstancedMesh oluştur
  useEffect(() => {
    if (starsRef.current) {
      const dummy = new THREE.Object3D();
      
      // Her bir yıldız için pozisyon ve ölçeği ayarla
      for (let i = 0; i < starsCount; i++) {
        // Rastgele pozisyon oluştur
        const radius = 2000 + Math.random() * 1000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        dummy.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        );
        
        // Rastgele ölçek
        const scale = Math.random() * 0.6 + 0.2;
        dummy.scale.set(scale, scale, scale);
        
        // Rastgele rotasyon
        dummy.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        
        // Matrisi güncelle
        dummy.updateMatrix();
        
        // Matrisi InstancedMesh'e ayarla
        starsRef.current.setMatrixAt(i, dummy.matrix);
      }
      
      // Buffer'ları güncelle
      starsRef.current.instanceMatrix.needsUpdate = true;
    }
  }, []);
  
  // Yıldızları hafifçe hareket ettir
  useFrame((state, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.005;
    }
  });
  
  return (
    <instancedMesh
      ref={starsRef}
      args={[null, null, starsCount]} // geometry, material, instance sayısı
    >
      <sphereGeometry args={[starSize, 4, 4]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent={true}
        opacity={0.8}
        toneMapped={false}
      />
    </instancedMesh>
  );
} 