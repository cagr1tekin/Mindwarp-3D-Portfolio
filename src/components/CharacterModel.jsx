import { useGLTF, OrbitControls } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from 'gsap';

export default function CharacterModel() {
  // Model yükleme
  const { scene } = useGLTF("/Mindwarp-3D-Portfolio/sample.glb");
  const groupRef = useRef();
  const modelRef = useRef();
  const [modelLoaded, setModelLoaded] = useState(false);
  const controlsRef = useRef();
  const rotationRef = useRef({
    initial: Math.PI * 1.1, // Başlangıçta karakterin arkası dönük (180 derece ters)
    target: Math.PI * 0.4  // Şu anki final rotasyon
  });

  useEffect(() => {
    if (!scene) return;
    
    // Debug logları geliştirme aşamasında yardımcı olur ancak performansı etkileyebilir
    // console.log("Model yükleme başladı:", scene);
    
    try {
      // Sahne klonla
      const clonedScene = scene.clone(true);
      
      // Görünürlük optimizasyonları
      clonedScene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = false; // Gölge hesaplamasını kapat
          child.receiveShadow = false;
          child.material.side = THREE.FrontSide; // Sadece ön yüzleri render et
          child.frustumCulled = true; // Görüş alanı dışındaki nesneleri render etme
          
          // Materyal rengini değiştir
          if (child.material) {
            // Gereksiz logları kaldır
            // console.log("Materyal bulundu:", child.name, child.material.type);
            
            // Materyalin klonunu oluştur ve rengini değiştir
            const newMaterial = child.material.clone();
            newMaterial.color.set("#FFFFFF");
            
            // Materyal optimizasyonları
            newMaterial.flatShading = true; // Basit gölgelendirme
            newMaterial.dithering = false;
            newMaterial.roughness = 0.8;
            newMaterial.metalness = 0.2;
            
            child.material = newMaterial;
          }
        }
      });
      
      // Ölçek ve pozisyon
      clonedScene.scale.set(3.5, 3.5, 3.5);
      clonedScene.rotation.y = rotationRef.current.initial; // Başlangıçta arkası dönük
      clonedScene.position.set(0, -2, 0); // Merkeze (0,0,0) pozisyonuna yerleştir
      
      // Modeli gruba ekle
      modelRef.current = clonedScene;
      
      // Önce mevcut içeriği temizle
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0]);
      }
      
      // Yeni modeli ekle
      groupRef.current.add(clonedScene);
      
      // Grubu merkeze al
      groupRef.current.position.set(0, 2, 0);
      
      // Model yüklendi bilgisini güncelle
      setModelLoaded(true);
      // console.log("Model yüklendi ve sahneye eklendi!");
      
      // 1 saniye sonra yavaşça dönme animasyonu başlat
      setTimeout(() => {
        gsap.to(clonedScene.rotation, {
          y: rotationRef.current.target,
          duration: 1.2,
          ease: "power2.inOut"
        });
      }, 1300);
      
    } catch (error) {
      console.error("Model yükleme hatası:", error);
    }
  }, [scene]);

  // Kameranın daha iyi pozisyonlanması için frame işleyici
  useFrame((state) => {
    // Performans optimizasyonu için kontrolleri sadece gerçekten gerektiğinde güncelle
    if (modelLoaded && controlsRef.current && controlsRef.current.enabled) {
      controlsRef.current.update();
    }
  });

  // Passive wheel event listener uyarısını gidermek için
  useEffect(() => {
    if (controlsRef.current && controlsRef.current.domElement) {
      const wheelEvent = controlsRef.current.domElement.onwheel;
      controlsRef.current.domElement.onwheel = null;
      
      controlsRef.current.domElement.addEventListener('wheel', (e) => {
        if (wheelEvent) wheelEvent(e);
      }, { passive: true });
      
      // Temizleme işlevi
      return () => {
        if (controlsRef.current && controlsRef.current.domElement) {
          controlsRef.current.domElement.onwheel = null;
        }
      };
    }
  }, [modelLoaded]);

  // Node isimlerini almak için yardımcı fonksiyon
  function getNodeNames(object) {
    const names = [];
    object.traverse((node) => {
      names.push({
        name: node.name,
        type: node.type,
        isObject3D: node instanceof THREE.Object3D,
        isMesh: node instanceof THREE.Mesh,
        position: node.position ? [node.position.x, node.position.y, node.position.z] : null
      });
    });
    return names;
  }

  return (
    <group>
      {/* Ana model grubu */}
      <group ref={groupRef} position={[0, 0.1, 0]}>
        {/* Boş durumda görünecek yedek obje */}
        <mesh visible={!modelLoaded} position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      </group>
      
      {/* Kamera kontrolü - Tamamen serbest döndürme */}
      <OrbitControls 
        ref={controlsRef}
        makeDefault
        target={[0, 0, 0]} // Döndürme merkezi
        enableZoom={false} // Zoom etkinleştir
        enablePan={true} // Pan etkinleştir
        minDistance={2} // Minimum zoom mesafesi
        maxDistance={10} // Maximum zoom mesafesi
        rotateSpeed={0.7} // Döndürme hızı
        panSpeed={0.5} // Pan hızı
        zoomSpeed={0.7} // Zoom hızı
        minPolarAngle={0} // Tam yukarı görüntü
        maxPolarAngle={Math.PI} // Tam aşağı görüntü
        dampingFactor={0.05} // Yumuşak dönüş
        enableDamping={true} // Yumuşak dönüş etkin
        enableRotate={true} // Döndürmeyi etkinleştir
      />
    </group>
  );
}

// Modeli önbelleğe al
useGLTF.preload("/Mindwarp-3D-Portfolio/sample.glb");
