import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

export default function TunnelEffect({ active, phase }) {
  const groupRef = useRef();
  const tunnelRef = useRef();
  const starsRef = useRef();
  
  // Tünel dokusunu oluştur - daha düşük çözünürlük (512x512 -> 256x256)
  const tunnelTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Gradyan arka plan
    const gradient = context.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 10,
      canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, 'rgba(100, 200, 255, 0.8)');
    gradient.addColorStop(0.1, 'rgba(50, 150, 255, 0.4)');
    gradient.addColorStop(0.4, 'rgba(20, 100, 200, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 50, 100, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dalgalanma çizgileri - daha az çizgi (20 -> 10)
    context.strokeStyle = 'rgba(180, 255, 255, 0.5)';
    context.lineWidth = 2;
    
    for (let i = 0; i < 10; i++) {
      const radius = 25 + i * 20;
      context.beginPath();
      context.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
      context.stroke();
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  // Rastgele yıldızlar oluştur
  const createRandomStars = (count) => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Silindir şeklinde bir hacim içinde konumlandır (tünel boyunca)
      const radius = Math.random() * 5 + 5;
      const theta = Math.random() * Math.PI * 2;
      const z = Math.random() * 50 - 100; // Tünel uzunluğu boyunca
      
      // Silindirik koordinatları kartezyen koordinatlara dönüştür
      positions[i * 3] = radius * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(theta);
      positions[i * 3 + 2] = z;
      
      // Rastgele boyutlar
      sizes[i] = Math.random() * 0.5 + 0.1;
      
      // Mavi-beyaz tonlarında renkler
      const blueIntensity = Math.random() * 0.5 + 0.5;
      colors[i * 3] = blueIntensity * 0.8; // R
      colors[i * 3 + 1] = blueIntensity * 0.9; // G
      colors[i * 3 + 2] = blueIntensity; // B
    }
    
    return { positions, sizes, colors };
  };
  
  // Yıldız miktarı ve özellikleri - daha az yıldız (500 -> 200)
  const starsData = useMemo(() => createRandomStars(200), []);
  
  // Aktifleştiğinde animasyonları başlat
  useEffect(() => {
    if (active && groupRef.current) {
      // Görünür yap - süre uzatıldı (1 -> 2)
      gsap.to(groupRef.current.scale, {
        x: 1, y: 1, z: 1,
        duration: 2,
        ease: "power2.out",
        delay: 0.5
      });
      
      if (tunnelRef.current) {
        // Tünel başlangıçta saydamlığını arttır - süre uzatıldı (2 -> 3)
        gsap.to(tunnelRef.current.material, {
          opacity: 0.7,
          duration: 3,
          ease: "power1.inOut"
        });
      }
    }
  }, [active]);
  
  // Her karede tüneli güncelle
  useFrame((state, delta) => {
    if (active && groupRef.current) {
      // Grup rotasyonu - daha yavaş dönüş (0.1 -> 0.05)
      groupRef.current.rotation.z += delta * 0.05;
      
      if (tunnelRef.current) {
        // İlerleme hissi vermek için UVs - daha yavaş hareket (0.2 -> 0.1)
        tunnelRef.current.material.map.offset.y -= delta * 0.1;
        
        // Faz 2-3'te tüneli genişlet - daha yavaş genişleme (0.5 -> 0.2)
        if (phase === 2) {
          tunnelRef.current.scale.x += delta * 0.2;
          tunnelRef.current.scale.y += delta * 0.2;
        }
        
        // Faz 3'te saydamlığı azalt (kaybolma) - daha yavaş solma (0.5 -> 0.2)
        if (phase === 3) {
          tunnelRef.current.material.opacity = Math.max(0, tunnelRef.current.material.opacity - delta * 0.2);
        }
      }
      
      // Yıldızları ileri doğru hareket ettir - daha az güncelleme (her kare yerine her 2 karede bir)
      if (starsRef.current && starsRef.current.geometry.attributes.position && state.clock.elapsedTime % 0.05 < 0.025) {
        const positions = starsRef.current.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          // İleri doğru hareket - daha yavaş (20 -> 10)
          positions.array[i * 3 + 2] += delta * 10;
          
          // Tünelden çıktıysa başa sar (sonsuz tünel etkisi)
          if (positions.array[i * 3 + 2] > 20) {
            positions.array[i * 3 + 2] = -100;
          }
        }
        positions.needsUpdate = true;
      }
    }
  });
  
  return active ? (
    <group 
      ref={groupRef}
      position={[0, 0, -50]}
      scale={[0.01, 0.01, 0.01]} // Başlangıçta küçük
    >
      {/* Tünel - daha az geometri detayı (32 -> 16) */}
      <mesh ref={tunnelRef} frustumCulled={false}>
        <cylinderGeometry args={[10, 10, 100, 16, 1, true]} />
        <meshBasicMaterial 
          side={THREE.BackSide}
          map={tunnelTexture}
          transparent={true}
          opacity={0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Yıldızlar/parçacıklar */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starsData.positions.length / 3}
            array={starsData.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={starsData.sizes.length}
            array={starsData.sizes}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-color"
            count={starsData.colors.length / 3}
            array={starsData.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.5}
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation={true}
        />
      </points>
    </group>
  ) : null;
} 