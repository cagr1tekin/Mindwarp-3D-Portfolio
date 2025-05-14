import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

export default function SkyEnvironmentGLB() {
  const { scene } = useThree();
  
  // Texture yüklemeyi useMemo ile optimize edelim - sadece bir kez çalışır
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);

  useEffect(() => {
    // PNG dosyasını yükle - düşük çözünürlükte olduğundan emin olun
    textureLoader.load("/deep_space_skybox.png", (texture) => {
      // Dokuyu panoramik olarak ayarla (küresel görünüm için)
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.generateMipmaps = false; // Mipmap oluşturmayı kapat (performans için)
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      
      // Arka planı doğrudan doku olarak ayarla
      scene.background = texture;
      
      // Sahne arka planının parlaklığını azalt
      scene.background.colorSpace = THREE.SRGBColorSpace;
      scene.background.offset.set(0, 0); // Orijinal konumda tut
      scene.background.repeat.set(2, 2); // Tekrarlamayı artır - daha geniş uzay görünümü
      scene.background.anisotropy = 1; // Anisotropiyi düşür (performans için)
      
      // console.log("[SkyEnvironmentGLB] Panoramik skybox yüklendi (optimize edildi)");
    });
    
    // Temizlik fonksiyonu
    return () => {
      if (scene.background && scene.background.isTexture) {
        scene.background.dispose();
        scene.background = new THREE.Color("black");
      }
    };
  }, [scene, textureLoader]);

  // Bu bileşen görünür bir öğe render etmez, sadece scene.background'u ayarlar
  return null;
} 