import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { 
  EffectComposer, 
  Bloom, 
  Vignette, 
  ChromaticAberration
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import gsap from 'gsap';
import * as THREE from 'three';

export default function DimensionTransition({ active, onTransitionComplete }) {
  const { camera } = useThree();
  const [intensity, setIntensity] = useState(0);
  const [transitionPhase, setTransitionPhase] = useState(0);
  const lightRef = useRef();
  const sunRef = useRef();
  
  // Geçiş fazları: 
  // 0 = başlangıç
  // 1 = spiral büyüme ve kamera hareketi
  // 2 = parlama efekti
  // 3 = yeni sahneye geçiş
  
  // Geçiş başladığında efektleri tetikle
  useEffect(() => {
    if (active && transitionPhase === 0) {
      // Başlangıç pozisyonunu kaydet
      const initialCameraPos = camera.position.clone();
      
      // Faz 1: Portal büyüme ve kamera hareketi
      setTransitionPhase(1);
      
      // Kamera pozisyonunu ileri doğru ilerlet - süreyi uzattık (3 -> 5)
      gsap.to(camera.position, {
        z: camera.position.z - 20, 
        duration: 5,
        ease: "power2.inOut",
        onComplete: () => {
          // Faz 2: Parlama efekti
          setTransitionPhase(2);
          
          // Işık yoğunluğunu arttır - süreyi uzattık (1.5 -> 2.5)
          gsap.to(lightRef.current, {
            intensity: 10,
            duration: 2.5,
            ease: "power4.in",
            onComplete: () => {
              // Bloom yoğunluğunu arttır - süreyi uzattık (0.5 -> 1)
              gsap.to(sunRef.current.scale, {
                x: 5, y: 5, z: 5,
                duration: 1,
                ease: "power4.in",
                onComplete: () => {
                  // Faz 3: Yeni sahneye geçiş
                  setTransitionPhase(3);
                  
                  // Başlangıç kamera pozisyonuna dön (Anı Odası için hazırlık) - süreyi uzattık (1 -> 2)
                  gsap.to(camera.position, {
                    x: 0, y: 0, z: 10,
                    duration: 2,
                    ease: "power2.out",
                    onComplete: () => {
                      // Geçiş tamamlandı, üst bileşene bildir
                      if (onTransitionComplete) {
                        onTransitionComplete();
                      }
                    }
                  });
                }
              });
            }
          });
        }
      });
      
      // Kamerayı hafifçe çevir - süreyi uzattık (3 -> 5)
      gsap.to(camera.rotation, {
        z: camera.rotation.z + Math.PI * 0.1,
        duration: 5, 
        ease: "power1.inOut"
      });
    }
  }, [active, camera, transitionPhase, onTransitionComplete]);
  
  // Her karede efektleri güncelle - yoğunluk artışını yavaşlattık
  useFrame((state, delta) => {
    if (active) {
      // Faz 1 ve 2 için yoğunluğu daha yavaş artır (0.5 -> 0.2)
      if (transitionPhase === 1 || transitionPhase === 2) {
        setIntensity(prev => Math.min(prev + delta * 0.2, 1.5));
      }
      
      // Faz 3 için yoğunluğu daha yavaş azalt (0.5 -> 0.2)
      if (transitionPhase === 3) {
        setIntensity(prev => Math.max(prev - delta * 0.2, 0));
      }
      
      // Kamerayı boyutlar arası geçiş hissi için hafifçe salla
      // Daha hafif sallantı (0.05 -> 0.02)
      if (transitionPhase === 2) {
        camera.rotation.z += Math.sin(state.clock.elapsedTime * 5) * delta * 0.02;
      }
    }
  });
  
  // Sahnede olmayan / görünmeyen nesneler
  return active ? (
    <>
      {/* Boyutlar arası geçiş ışık kaynağı */}
      <mesh ref={sunRef} position={[0, 0, -15]} frustumCulled={false}>
        <sphereGeometry args={[1, 12, 12]} /> {/* çözünürlüğü düşürdük (16,16 -> 12,12) */}
        <meshBasicMaterial color={new THREE.Color(0.9, 0.9, 1)} transparent opacity={0.8} />
      </mesh>
      
      {/* Geçiş ışığı */}
      <pointLight 
        ref={lightRef} 
        position={[0, 0, -15]} 
        color={new THREE.Color(0.6, 0.6, 1)} 
        intensity={0.1} 
        distance={50}
      />
    
      {/* Post-processing efektleri - sayısını azalttık ve hafifleştirdik */}
      <EffectComposer enabled={active} multisampling={0}>
        {/* Işıldama efekti - daha küçük kernel boyutu */}
        <Bloom 
          intensity={intensity * 1.2} 
          luminanceThreshold={0.3} 
          luminanceSmoothing={0.7} 
          kernelSize={KernelSize.MEDIUM} /* LARGE -> MEDIUM */
        />
        
        {/* Kromatik aberasyon (renk kayması) */}
        <ChromaticAberration 
          offset={[intensity * 0.003, intensity * 0.003]} /* 0.005 -> 0.003 */
          blendFunction={BlendFunction.NORMAL}
          opacity={intensity * 0.8} /* intensity -> intensity * 0.8 */
        />
        
        {/* Ekran kenarlarını karart */}
        <Vignette 
          offset={0.5} 
          darkness={intensity * 0.4} /* 0.5 -> 0.4 */
          eskil={false} 
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </>
  ) : null;
} 