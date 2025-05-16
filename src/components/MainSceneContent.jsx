import { OrbitControls } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import SkyEnvironmentGLB from "./SkyEnvironmentGLB";
import SpiralPortal from "./SpiralPortal";
import MemoryRoom from "./MemoryRoom";
import LightspeedEffect from "./LightspeedEffect";

export default function MainSceneContent({ portalActive }) {
  const controlsRef = useRef();
  const { camera, scene } = useThree();
  const [showPortal, setShowPortal] = useState(false);
  const [nextScene, setNextScene] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [lightspeedActive, setLightspeedActive] = useState(false);
  const [cameraShaking, setCameraShaking] = useState(false);
  const originalCameraPos = useRef(null);
  
  // Anılar odası pozisyonu - ileri doğru, kullanıcının baktığı yönde
  const memoryRoomPosition = new THREE.Vector3(0, 0, -5000);
  
  // App'den gelen portalActive değiştiğinde buradaki showPortal state'ini güncelle
  useEffect(() => {
    if (portalActive) {
      setShowPortal(true);
    }
  }, [portalActive]);

  // Kamera titreşimini her karede güncelle
  useFrame((state, delta) => {
    if (cameraShaking && camera) {
      // Titreşim şiddeti - zamana bağlı olarak değişir
      const intensity = 0.06 * (1 + Math.sin(state.clock.elapsedTime * 12) * 0.5);
      
      // Random titreşim ekle
      camera.position.x += (Math.random() - 0.5) * intensity;
      camera.position.y += (Math.random() - 0.5) * intensity;
      
      // Sarsıntılı dönme efekti
      camera.rotation.z += (Math.random() - 0.5) * intensity * 0.08;
      
      // Titreşimi sönümle (düzelt)
      if (originalCameraPos.current) {
        camera.position.x = THREE.MathUtils.lerp(
          camera.position.x, 
          originalCameraPos.current.x, 
          delta * 5
        );
        camera.position.y = THREE.MathUtils.lerp(
          camera.position.y, 
          originalCameraPos.current.y, 
          delta * 5
        );
      }
    }
  });

  // Portal tıklaması
  const handlePortalClick = () => {
    // Başlangıç kamera pozisyonunu kaydet
    originalCameraPos.current = camera.position.clone();
    
    // Geçiş başlat
    setTransitioning(true);
    setLightspeedActive(true);
    setCameraShaking(true);
    
    // Kontrolleri geçici olarak devre dışı bırak
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }
    
    // Kamera animasyonları (daha dramatik seri hareketler)
    const timeline = gsap.timeline({
      onComplete: () => {
        // Anılar odasına vardığımızda
        setNextScene(true);
        setTransitioning(false);
        setLightspeedActive(false);
        setCameraShaking(false);
        
        // Kontrolleri tekrar etkinleştir
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
          controlsRef.current.target.copy(memoryRoomPosition);
          controlsRef.current.update();
        }
      }
    });
    
    // 1. Spiral portala doğru yaklaşma
    timeline.to(camera.position, {
      z: camera.position.z - 10,
      duration: 0.8,
      ease: "power2.in"
    });
    
    // 2. FOV genişletme (görüş açısı) - çarpıcı hız hissi
    timeline.to(camera, {
      fov: 100, // Çok geniş açı
      duration: 1,
      ease: "power3.in",
      onUpdate: () => camera.updateProjectionMatrix()
    }, "-=0.5");
    
    // 3. Ana hareket - çok hızlı ilerleme
    timeline.to(camera.position, {
      x: memoryRoomPosition.x,
      y: memoryRoomPosition.y, 
      z: memoryRoomPosition.z,
      duration: 2.5,
      ease: "power4.in",
      onComplete: () => {
        // Tam küpün içine yerleş ve çevreye bak
        camera.position.set(
          memoryRoomPosition.x, 
          memoryRoomPosition.y, 
          memoryRoomPosition.z
        );
        
        // Bak küpün duvarına doğru
        // İlk başta ön duvara bakıyoruz (negatif z yönünde)
        camera.lookAt(memoryRoomPosition.x, memoryRoomPosition.y, memoryRoomPosition.z - 30);
        camera.updateProjectionMatrix();
        
        // Anı odasına vardığında atmosfer sesini başlat
        const audioManager = document.getElementById('audio-manager');
        if (audioManager) {
          audioManager.dispatchEvent(new CustomEvent('playMemoryAmbience'));
        }
        
        // Debug bilgisi
        console.log("Kamera anı odasına ulaştı:", camera.position);
      }
    }, "-=0.3");
    
    // 4. FOV'u normale döndür ve hafif bir yavaşlama
    timeline.to(camera, {
      fov: 60,
      duration: 0.7,
      ease: "power1.out",
      onUpdate: () => camera.updateProjectionMatrix()
    }, "-=0.5");
    
    // Ekran efektleri - koyu mor dıştan içe solma
    createScreenEffects();
  };
  
  // Ekran efektleri - koyu mor dıştan içe solma
  const createScreenEffects = () => {
    // Ana konteyner
    const effectsContainer = document.createElement('div');
    effectsContainer.id = 'warp-effects';
    effectsContainer.style.position = 'fixed';
    effectsContainer.style.top = '0';
    effectsContainer.style.left = '0';
    effectsContainer.style.width = '100%';
    effectsContainer.style.height = '100%';
    effectsContainer.style.pointerEvents = 'none';
    effectsContainer.style.zIndex = '1000';
    effectsContainer.style.overflow = 'hidden';
    document.body.appendChild(effectsContainer);
    
    // Koyu mor dıştan içe solma efekti
    const purpleVignette = document.createElement('div');
    purpleVignette.style.position = 'absolute';
    purpleVignette.style.top = '0';
    purpleVignette.style.left = '0';
    purpleVignette.style.width = '100%';
    purpleVignette.style.height = '100%';
    purpleVignette.style.background = 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(46,0,76,0.4) 70%, rgba(76,0,130,0.7) 100%)';
    purpleVignette.style.opacity = '0';
    purpleVignette.style.transition = 'opacity 1.5s ease-in-out';
    effectsContainer.appendChild(purpleVignette);
    
    // Işık kırılmaları (chromatic aberration)
    const chromaticAberration = document.createElement('div');
    chromaticAberration.style.position = 'absolute';
    chromaticAberration.style.top = '0';
    chromaticAberration.style.left = '0';
    chromaticAberration.style.width = '100%';
    chromaticAberration.style.height = '100%';
    chromaticAberration.style.backgroundColor = 'transparent';
    chromaticAberration.style.opacity = '0';
    chromaticAberration.style.transition = 'opacity 0.5s ease-in-out';
    chromaticAberration.style.mixBlendMode = 'screen';
    chromaticAberration.style.filter = 'url(#chromatic-aberration)';
    effectsContainer.appendChild(chromaticAberration);
    
    // SVG filtre tanımları
    const svgFilter = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgFilter.style.position = 'absolute';
    svgFilter.style.width = '0';
    svgFilter.style.height = '0';
    svgFilter.setAttribute('aria-hidden', 'true');
    
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'chromatic-aberration');
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    
    // Kırmızı kanal
    const feOffset1 = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
    feOffset1.setAttribute('in', 'SourceGraphic');
    feOffset1.setAttribute('dx', '1.5');
    feOffset1.setAttribute('dy', '0');
    feOffset1.setAttribute('result', 'red');
    filter.appendChild(feOffset1);
    
    // Kırmızı filtre
    const feColorMatrix1 = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
    feColorMatrix1.setAttribute('in', 'red');
    feColorMatrix1.setAttribute('type', 'matrix');
    feColorMatrix1.setAttribute('values', '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0');
    feColorMatrix1.setAttribute('result', 'red-channel');
    filter.appendChild(feColorMatrix1);
    
    // Mavi kanal
    const feOffset2 = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
    feOffset2.setAttribute('in', 'SourceGraphic');
    feOffset2.setAttribute('dx', '-1.5');
    feOffset2.setAttribute('dy', '0');
    feOffset2.setAttribute('result', 'blue');
    filter.appendChild(feOffset2);
    
    // Mavi filtre
    const feColorMatrix2 = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
    feColorMatrix2.setAttribute('in', 'blue');
    feColorMatrix2.setAttribute('type', 'matrix');
    feColorMatrix2.setAttribute('values', '0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0');
    feColorMatrix2.setAttribute('result', 'blue-channel');
    filter.appendChild(feColorMatrix2);
    
    // Yeşil filtre (orjinal konum)
    const feColorMatrix3 = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
    feColorMatrix3.setAttribute('in', 'SourceGraphic');
    feColorMatrix3.setAttribute('type', 'matrix');
    feColorMatrix3.setAttribute('values', '0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0');
    feColorMatrix3.setAttribute('result', 'green-channel');
    filter.appendChild(feColorMatrix3);
    
    // Kanalları birleştir
    const feBlend1 = document.createElementNS('http://www.w3.org/2000/svg', 'feBlend');
    feBlend1.setAttribute('in', 'red-channel');
    feBlend1.setAttribute('in2', 'green-channel');
    feBlend1.setAttribute('mode', 'screen');
    feBlend1.setAttribute('result', 'red-green');
    filter.appendChild(feBlend1);
    
    const feBlend2 = document.createElementNS('http://www.w3.org/2000/svg', 'feBlend');
    feBlend2.setAttribute('in', 'red-green');
    feBlend2.setAttribute('in2', 'blue-channel');
    feBlend2.setAttribute('mode', 'screen');
    filter.appendChild(feBlend2);
    
    defs.appendChild(filter);
    svgFilter.appendChild(defs);
    document.body.appendChild(svgFilter);
    
    // Koyu mor dıştan içe solma efekti aktifleştir
    setTimeout(() => {
      purpleVignette.style.opacity = '1';
    }, 300);
    
    // Renk kırılması
    setTimeout(() => {
      chromaticAberration.style.opacity = '0.4';
      
      // Hareket efekti
      const moveInterval = setInterval(() => {
        const offsetX = (Math.random() - 0.5) * 8;
        feOffset1.setAttribute('dx', `${offsetX}`);
        feOffset2.setAttribute('dx', `${-offsetX}`);
      }, 100);
      
      // Temizle
      setTimeout(() => {
        clearInterval(moveInterval);
        chromaticAberration.style.opacity = '0';
      }, 3000);
    }, 800);
    
    // Yıldız ışık hattı efektleri - mor tonlarda
    for (let i = 0; i < 25; i++) {
      createPurpleStar(effectsContainer, i);
    }
    
    // Flash efekti - koyu mor
    setTimeout(() => {
      const flash = document.createElement('div');
      flash.style.position = 'absolute';
      flash.style.top = '0';
      flash.style.left = '0';
      flash.style.width = '100%';
      flash.style.height = '100%';
      flash.style.background = 'linear-gradient(45deg, rgba(76,0,153,0.9), rgba(128,0,128,0.9))';
      flash.style.opacity = '0';
      flash.style.transition = 'opacity 0.2s ease-in-out';
      effectsContainer.appendChild(flash);
      
      setTimeout(() => {
        flash.style.opacity = '0.9';
        setTimeout(() => {
          flash.style.opacity = '0';
          
          // Küçük yanıp sönmeler - mor tonlarda
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              flash.style.opacity = '0.3';
              setTimeout(() => {
                flash.style.opacity = '0';
              }, 100);
            }, 200 + i * 300);
          }
        }, 150);
      }, 50);
    }, 2500);
    
    // Temizle
    setTimeout(() => {
      document.body.removeChild(effectsContainer);
      document.body.removeChild(svgFilter);
    }, 5000);
  };
  
  // Yıldız ışık hattı efekti oluştur - koyu mor
  function createPurpleStar(container, index) {
    const star = document.createElement('div');
    star.style.position = 'absolute';
    star.style.top = '50%';
    star.style.left = '50%';
    
    // Başlangıç konumu ve açı
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 100 + 60;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    
    star.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    star.style.width = '2px';
    star.style.height = '2px';
    
    // Koyu mor yıldızlar
    const purpleShade = Math.floor(Math.random() * 3);
    let starColor;
    
    if (purpleShade === 0) {
      starColor = 'rgba(120, 40, 180, 0.9)'; // Mor
    } else if (purpleShade === 1) {
      starColor = 'rgba(100, 20, 150, 0.9)'; // Koyu mor
    } else {
      starColor = 'rgba(150, 60, 220, 0.9)'; // Açık mor
    }
    
    star.style.backgroundColor = starColor;
    star.style.borderRadius = '50%';
    star.style.opacity = '0';
    star.style.boxShadow = `0 0 4px 2px ${starColor.replace('0.9', '0.7')}`;
    container.appendChild(star);
    
    // Animasyon başlat
    setTimeout(() => {
      // Yıldız görünür olsun
      star.style.opacity = '1';
      
      // Merkeze doğru hareket animasyonu
      star.style.transition = `all ${Math.random() * 1 + 1.5}s linear`;
      
      setTimeout(() => {
        // Merkeze doğru hızla çek
        star.style.transform = 'translate(-50%, -50%)';
        star.style.width = '1px';
        star.style.height = '150px';
        star.style.boxShadow = `0 0 10px 5px ${starColor.replace('0.9', '0.8')}`;
      }, Math.random() * 500 + 800);
    }, Math.random() * 1000 + 500);
  }
  
  // Passive wheel event listener uyarısını gidermek için basit çözüm
  useEffect(() => {
    // Sadece uyarıyı bastırmak için passive wheel listener ekle
    const addPassiveListener = () => {
      if (typeof window !== 'undefined' && window.document) {
        window.document.addEventListener('wheel', () => {}, { passive: true });
      }
    };
    
    addPassiveListener();
    
    return () => {
      // Cleanup gerekmiyor, passive listener performansı etkilemez
    };
  }, []);
  
  return (
    <>
      {/* GLB Skybox modeli */}
      <SkyEnvironmentGLB />
      
      {/* Işık hızı efekti - sadece main scene'i etkile */}
      <group position={[0, 0, 0]}>
        <LightspeedEffect active={lightspeedActive} duration={5} />
      </group>
      
      {/* Portal - korundu, yolculuğa başlangıç noktası */}
      {!nextScene && (
        <SpiralPortal active={showPortal} onClick={handlePortalClick} />
      )}
      
      {/* Anılar odası - ileri doğru, kullanıcının baktığı yönde */}
      <group position={memoryRoomPosition}>
        <MemoryRoom visible={nextScene} />
      </group>
      
      {/* Kamera kontrolleri - Kullanıcının kamerayı çevirebilmesi için */}
      <OrbitControls 
        ref={controlsRef}
        makeDefault
        enableZoom={true}
        enablePan={true}
        minDistance={10}
        maxDistance={5000}
        rotateSpeed={-0.5}
        panSpeed={-0.5}
        zoomSpeed={0.8}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI - 0.1}
        dampingFactor={0.05}
        enableDamping={true}
      />
    </>
  );
} 