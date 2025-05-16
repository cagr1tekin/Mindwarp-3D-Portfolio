import { useGLTF } from "@react-three/drei";
import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function SpaceModel() {
  const { scene } = useGLTF("/Mindwarp-3D-Portfolio/need_some_space.glb");
  const ref = useRef();

  useEffect(() => {
    if (scene && ref.current) {
      // Modeli kopyala
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
                color: mat.color ? mat.color.clone() : new THREE.Color(0x0088ff),
                emissive: new THREE.Color(0x0055aa),
                emissiveIntensity: 0.15,
                metalness: 0.3,
                roughness: 0.7
              });
            });
          } else {
            child.material = new THREE.MeshStandardMaterial({
              map: originalMat.map,
              normalMap: originalMat.normalMap,
              roughnessMap: originalMat.roughnessMap,
              metalnessMap: originalMat.metalnessMap,
              emissiveMap: originalMat.emissiveMap,
              color: originalMat.color ? originalMat.color.clone() : new THREE.Color(0x0088ff),
              emissive: new THREE.Color(0x0055aa),
              emissiveIntensity: 0.15,
              metalness: 0.3,
              roughness: 0.7
            });
          }
          
          // Frustum culling'i devre dışı bırak (büyük modeller için)
          child.frustumCulled = false;
        }
      });
      
      // Modelin ölçeğini ayarla - istenildiği gibi 2000
      clonedScene.scale.set(2000, 2000, 2000);
      
      // Modelin merkezini hesapla ve canvas merkezine hizala
      // Önce modelin boundingbox'ını hesaplayalım
      const box = new THREE.Box3().setFromObject(clonedScene);
      const center = new THREE.Vector3();
      box.getCenter(center);
      
      // Modeli merkeze konumlandır
      clonedScene.position.sub(center); // Modelin kendi merkezini orijine getir
      
      // Referans modeli grupla
      ref.current.add(clonedScene);
      console.log("[SpaceModel] Model yüklendi, ölçek: 2000, konum: merkez");
    }
  }, [scene]);

  // Group'u merkeze yerleştir
  return <group ref={ref} position={[0, 0, 0]} />;
}
