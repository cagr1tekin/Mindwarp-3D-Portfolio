import { useGLTF } from "@react-three/drei";
import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function SpaceGLB() {
  const { scene } = useGLTF("/need_some_space.glb");
  const ref = useRef();

  useEffect(() => {
    if (scene && ref.current) {
      // Modeli kopyala (orijinal model bozulmasın)
      const clonedScene = scene.clone();
      
      // Tüm materyalleri texture'ları koruyarak güncelle
      clonedScene.traverse((child) => {
        if (child.isMesh) {
          // Orijinal materyal özelliklerini koru
          const originalMat = child.material;
          
          // Materyal güncelleme (texture'ları koru)
          if (Array.isArray(originalMat)) {
            child.material = originalMat.map(mat => {
              return new THREE.MeshStandardMaterial({
                map: mat.map,
                normalMap: mat.normalMap,
                roughnessMap: mat.roughnessMap,
                metalnessMap: mat.metalnessMap,
                emissiveMap: mat.emissiveMap,
                color: mat.color ? mat.color.clone() : new THREE.Color(0x5500ff),
                emissive: new THREE.Color(0x5500ff),
                emissiveIntensity: 0.3,
                metalness: 0.4,
                roughness: 0.6
              });
            });
          } else {
            child.material = new THREE.MeshStandardMaterial({
              map: originalMat.map,
              normalMap: originalMat.normalMap,
              roughnessMap: originalMat.roughnessMap,
              metalnessMap: originalMat.metalnessMap,
              emissiveMap: originalMat.emissiveMap,
              color: originalMat.color ? originalMat.color.clone() : new THREE.Color(0x5500ff),
              emissive: new THREE.Color(0x5500ff),
              emissiveIntensity: 0.3,
              metalness: 0.4,
              roughness: 0.6
            });
          }
          
          // Frustum culling'i devre dışı bırak (büyük modeller için)
          child.frustumCulled = false;
        }
      });
      
      // Modelin ölçeğini ayarla - daha küçült
      clonedScene.scale.set(50, 50, 50);
      
      // Modeli konumlandır - daha uzağa taşı
      clonedScene.position.set(2000, 1500, -3000);
      clonedScene.rotation.set(Math.PI / 6, Math.PI / 3, 0);
      
      // Referans modeli grupla
      ref.current.add(clonedScene);
      console.log("[SpaceGLB] Model yüklendi ve pozisyonu güncellendi");
    }
  }, [scene]);

  return <group ref={ref} />;
}