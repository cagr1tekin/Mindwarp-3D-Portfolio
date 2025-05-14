import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

export default function SkyEnvironment() {
  const { scene } = useThree();
  
  useEffect(() => {
    // Tamamen siyah arka plan ayarla
    scene.background = new THREE.Color("#000000");
    
    console.log("[SkyEnvironment] Siyah arka plan ayarlandı");
    
    // Temizleme fonksiyonu
    return () => {
      // Herhangi bir temizleme işlemi gerekirse
    };
  }, [scene]);

  // Bu bileşen bir şey render etmez, sadece efekt çalıştırır
  return null;
} 