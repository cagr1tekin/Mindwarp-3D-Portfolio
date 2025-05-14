import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

export default function LightspeedEffect({ active, duration = 5 }) {
  const groupRef = useRef();
  const tunnelRef = useRef();
  const progressRef = useRef(0);
  const startTimeRef = useRef(0);
  const { camera } = useThree();
  
  // Cihaz performansına göre parçacık sayısını belirle
  const particleCount = useMemo(() => {
    // Varsayılan parçacık sayısı
    let count = 6000;
    
    // Mobil cihaz veya düşük güçlü CPU tespiti
    if (typeof navigator !== 'undefined') {
      // CPU çekirdek sayısına göre ayarla
      if (navigator.hardwareConcurrency) {
        if (navigator.hardwareConcurrency <= 4) {
          count = 3000; // Düşük güçlü cihazlar
        } else if (navigator.hardwareConcurrency <= 6) {
          count = 4500; // Orta seviye cihazlar
        }
      }
      
      // Mobil cihaz tespiti
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        count = Math.min(count, 3000); // Mobil cihazlarda maksimum 3000
      }
    }
    
    return count;
  }, []);
  
  // Neon çubukları oluştur
  const neonTubes = useMemo(() => {
    const tubes = [];
    const tubeCount = Math.min(particleCount / 5, 300); // Daha az sayıda tüp, daha iyi performans
    
    for (let i = 0; i < tubeCount; i++) {
      // Z pozisyonu (derinlik)
      const z = -(Math.random() * 1200);
      
      // X ve Y pozisyonları (rastgele dağılım)
      const radius = Math.random() * 150 + 10;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      // Çubuk uzunluğu ve kalınlığı
      const length = Math.random() * 20 + 5;
      const thickness = Math.random() * 0.8 + 0.2;
      
      // Hafif eğim (Z eksenine tam paralel değil)
      const tiltX = (Math.random() - 0.5) * Math.PI * 0.1;
      const tiltY = (Math.random() - 0.5) * Math.PI * 0.1;
      
      // Renk seçimi
      let color;
      const colorChoice = Math.random();
      
      if (colorChoice < 0.35) {
        // Mor neon
        color = new THREE.Color(0.7, 0.2, 1.0);
      } else if (colorChoice < 0.7) {
        // Pembe neon
        color = new THREE.Color(1.0, 0.3, 0.8);
      } else if (colorChoice < 0.85) {
        // Mavi neon
        color = new THREE.Color(0.3, 0.5, 1.0);
      } else {
        // Açık mor
        color = new THREE.Color(0.6, 0.4, 0.8);
      }
      
      // Parlaklık (daha uzakta daha az parlak)
      const distance = Math.abs(z);
      const brightness = Math.max(0.5, 1.0 - distance / 1200);
      color.multiplyScalar(brightness);
      
      tubes.push({
        position: new THREE.Vector3(x, y, z),
        rotation: new THREE.Euler(tiltX, tiltY, Math.random() * Math.PI * 2),
        length,
        thickness,
        color
      });
    }
    
    return tubes;
  }, [particleCount]);
  
  // Işık parçacıkları oluştur
  const particles = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Işık parçacıklarının başlangıç pozisyonları
    for (let i = 0; i < particleCount; i++) {
      // Silindirik koordinatlar oluştur - daha geniş bir dağılım
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 20 + 2; 
      
      // Derinlik farklı gruplarda olsun - bazı parçacıklar çok uzakta
      let z;
      if (i % 4 === 0) {
        z = Math.random() * -1000; // Çok uzak parçacıklar
      } else if (i % 4 === 1) {
        z = Math.random() * -500; // Uzak parçacıklar
      } else if (i % 4 === 2) {
        z = Math.random() * -300; // Orta mesafe
      } else {
        z = Math.random() * -150; // Yakın parçacıklar
      }
      
      // Kartezyen koordinatlara dönüştür
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = z;
      
      // Renkli parçacıklar (mor, pembe, mavi tonları)
      const colorChoice = Math.random();
      
      if (colorChoice < 0.5) {
        // Koyu mor tonları - ağırlıklı renk
        const intensity = Math.random() * 0.4 + 0.6;
        colors[i * 3] = intensity * 0.6;     // R
        colors[i * 3 + 1] = intensity * 0.2;  // G
        colors[i * 3 + 2] = intensity * 0.9;  // B
      } else if (colorChoice < 0.8) {
        // Pembe-mor tonları
        const intensity = Math.random() * 0.4 + 0.6;
        colors[i * 3] = intensity * 0.8;     // R
        colors[i * 3 + 1] = intensity * 0.1;  // G
        colors[i * 3 + 2] = intensity * 0.8;  // B
      } else {
        // Mavi tonları - daha az
        const intensity = Math.random() * 0.4 + 0.6;
        colors[i * 3] = intensity * 0.3;     // R
        colors[i * 3 + 1] = intensity * 0.4;  // G
        colors[i * 3 + 2] = intensity;        // B
      }
      
      // Farklı boyutlar - küçültülmüş parçacıklar (neon çubuklar ön planda olacak)
      sizes[i] = Math.random() * 1.5 + 0.5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return { geometry, particleCount };
  }, [particleCount]);
  
  // Spiral tünel mesh'i - daha geniş ve uzun
  const tunnelMesh = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(25, 50, 1500, 36, 60, true);
    
    // Geometriyi döndür ve pozisyonlandır
    geometry.rotateX(Math.PI / 2);
    
    // UV koordinatlarını ayarla
    const uvs = geometry.attributes.uv;
    for (let i = 0; i < uvs.count; i++) {
      uvs.setXY(i, uvs.getX(i) * 5, uvs.getY(i));
    }
    
    // Materyal - koyu mor tonlar
    const material = new THREE.MeshBasicMaterial({
      side: THREE.BackSide, 
      transparent: true,
      opacity: 0, // Başlangıçta görünmez, GSAP ile animasyon yapılacak
      wireframe: false,
      map: createSpiralTexture(),
      blending: THREE.AdditiveBlending
    });
    
    return { geometry, material };
  }, []);
  
  // Spiral doku oluştur
  function createSpiralTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Arka planı temizle
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Gradient oluştur (koyu mor tonları)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(180,80,255,0.7)');   // Açık mor
    gradient.addColorStop(0.3, 'rgba(120,60,200,0.6)'); // Orta mor
    gradient.addColorStop(0.6, 'rgba(80,30,150,0.5)');  // Koyu mor
    gradient.addColorStop(1, 'rgba(50,10,100,0.4)');    // Çok koyu mor
    
    // Spiral çizgileri çiz
    const spiralCount = 8;
    const lineWidth = 6;
    
    for (let s = 0; s < spiralCount; s++) {
      ctx.strokeStyle = gradient;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      
      const offset = (s / spiralCount) * Math.PI * 2;
      
      for (let i = 0; i < canvas.height; i += 2) {
        const angle = (i / canvas.height) * Math.PI * 12 + offset;
        const radius = (canvas.width / 3) - (i / canvas.height) * (canvas.width / 4);
        
        const x = canvas.width / 2 + Math.cos(angle) * radius;
        const y = i;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
    }
    
    // Parlaklık efekti
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.3;
    ctx.drawImage(canvas, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 3);
    
    return texture;
  }
  
  // Dalgalı ışık çizgileri - mor tonlara uyum için renk değişikliği
  const warpLines = useMemo(() => {
    const lineCount = 100; // Daha az çizgi (neon çubuklar olduğu için)
    const lines = [];
    
    for (let i = 0; i < lineCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 15 + Math.random() * 35;
      const lineGeometry = new THREE.BufferGeometry();
      
      // Her çizgi için daha fazla nokta
      const points = [];
      const pointCount = 30;
      
      for (let j = 0; j < pointCount; j++) {
        const z = -500 + j * 16;
        
        // Spiral şekli oluşturmak için açıyı arttır
        const currentAngle = angle + (j / pointCount) * Math.PI * 0.7;
        
        // Daha belirgin dalgalanma
        const waveStrength = 0.18 + Math.random() * 0.12;
        const radiusVariation = radius * (1 + Math.sin(j * 0.5) * waveStrength);
        
        const x = Math.cos(currentAngle) * radiusVariation;
        const y = Math.sin(currentAngle) * radiusVariation;
        points.push(new THREE.Vector3(x, y, z));
      }
      
      lineGeometry.setFromPoints(points);
      
      // Renkleri koyu mora kaydır
      let color;
      const colorChoice = Math.random();
      
      if (colorChoice < 0.6) {
        // Koyu mor tonları - ağırlıklı
        color = new THREE.Color(
          0.5 + Math.random() * 0.3,
          0.1 + Math.random() * 0.2,
          0.7 + Math.random() * 0.3
        );
      } else if (colorChoice < 0.85) {
        // Şarap kırmızısı/mor tonları
        color = new THREE.Color(
          0.6 + Math.random() * 0.3,
          0.05 + Math.random() * 0.15,
          0.4 + Math.random() * 0.3
        );
      } else {
        // Mavi-mor tonları (daha az)
        color = new THREE.Color(
          0.3 + Math.random() * 0.2,
          0.2 + Math.random() * 0.2,
          0.7 + Math.random() * 0.3
        );
      }
      
      lines.push({ 
        geometry: lineGeometry, 
        color,
        width: Math.random() * 2.5 + 1 // Daha kalın çizgiler
      });
    }
    
    return lines;
  }, []);
  
  // Tünel animasyonu
  useEffect(() => {
    if (active && tunnelRef.current) {
      // Tünel opacity animasyonu - sadece GSAP ile kontrol ediliyor
      gsap.to(tunnelRef.current.material, {
        opacity: 0.8,
        duration: 2,
        ease: "power2.in"
      });
      
      // Animasyon tamamlandığında temizle
      return () => {
        if (tunnelRef.current) {
          tunnelRef.current.material.opacity = 0;
        }
        
        // Animasyon değerlerini sıfırla
        progressRef.current = 0;
        startTimeRef.current = 0;
      };
    }
  }, [active]);
  
  // Her frame'de güncelle
  useFrame((state, delta) => {
    if (!active || !groupRef.current) return;
    
    if (startTimeRef.current === 0) {
      startTimeRef.current = state.clock.elapsedTime;
    }
    
    // Animasyon ilerlemesi (0-1 arası)
    const elapsed = state.clock.elapsedTime - startTimeRef.current;
    progressRef.current = Math.min(elapsed / duration, 1);
    
    // Eğer animasyon tamamlandıysa parçacıkları gizle
    if (progressRef.current === 1) {
      groupRef.current.visible = false;
      return; // Daha fazla işlem yapma
    }
    
    // Kamerayı hafifçe ileri doğru hareket ettir - hareket hissi için
    camera.position.z -= delta * 30 * progressRef.current;
    
    // Parçacıkları güncelle
    updateParticles(delta, state);
    
    // Grup rotasyonu - daha dramatik dönüş efekti
    groupRef.current.rotation.z += delta * 0.25 * (0.5 + progressRef.current);
    
    // Tünel animasyonu
    if (tunnelRef.current) {
      // Tünel döndürme - sarmal hareketi
      tunnelRef.current.rotation.z += delta * 0.4;
      
      // Tünel texture animasyonu
      if (tunnelRef.current.material.map) {
        tunnelRef.current.material.map.offset.y -= delta * 0.7;
      }
    }
    
    // Neon çubukları döndür (hafif dinamik hareket)
    groupRef.current.children.forEach(child => {
      if (child.userData.isNeonTube) {
        child.rotation.z += delta * 0.2 * (Math.random() * 0.5 + 0.5);
      }
    });
  });
  
  // Parçacıkları güncelle
  const updateParticles = (delta, state) => {
    const positions = particles.geometry.attributes.position;
    const sizes = particles.geometry.attributes.size;
    const colors = particles.geometry.attributes.color;
    
    // Parçacıkları güncelle - daha agresif hareket
    for (let i = 0; i < particles.particleCount; i++) {
      // Uzaklığa göre farklı hızlar
      const zPos = positions.array[i * 3 + 2];
      const distanceFactor = Math.abs(zPos) / 100;
      
      // Parçacıkları ileri doğru hızlandır - daha hızlı
      const speed = 150 + progressRef.current * 600 * distanceFactor;
      positions.array[i * 3 + 2] += delta * speed;
      
      // Eğer parçacık çok ilerlediyse başa sar
      if (positions.array[i * 3 + 2] > 20) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * 40 * progressRef.current; // İlerleme arttıkça daha geniş
        
        positions.array[i * 3] = Math.cos(angle) * radius; // X
        positions.array[i * 3 + 1] = Math.sin(angle) * radius; // Y
        
        // Farklı uzaklıklara gönder (derinlik hissi)
        if (i % 5 === 0) {
          positions.array[i * 3 + 2] = -1000; // Çok geriye
        } else if (i % 5 === 1) {
          positions.array[i * 3 + 2] = -600; // Uzağa
        } else if (i % 5 === 2) {
          positions.array[i * 3 + 2] = -400; // Orta mesafe
        } else {
          positions.array[i * 3 + 2] = -200 - Math.random() * 150; // Normal uzaklık
        }
        
        // Parçacık boyutunu büyüt
        sizes.array[i] = Math.random() * 3.5 + 1.5 + progressRef.current * 5;
        
        // Renkleri mor tonlara uyumla
        const colorType = Math.floor(Math.random() * 3);
        
        if (colorType === 0) {
          // Koyu mor tonları
          colors.array[i * 3] = 0.5 + Math.random() * 0.3; // R
          colors.array[i * 3 + 1] = 0.1 + Math.random() * 0.2; // G
          colors.array[i * 3 + 2] = 0.7 + Math.random() * 0.3; // B
        } else if (colorType === 1) {
          // Pembe-mor tonları
          colors.array[i * 3] = 0.7 + Math.random() * 0.3; // R
          colors.array[i * 3 + 1] = 0.05 + Math.random() * 0.15; // G
          colors.array[i * 3 + 2] = 0.6 + Math.random() * 0.3; // B
        } else {
          // Mavi-mor tonları
          colors.array[i * 3] = 0.3 + Math.random() * 0.2; // R
          colors.array[i * 3 + 1] = 0.1 + Math.random() * 0.3; // G
          colors.array[i * 3 + 2] = 0.8 + Math.random() * 0.2; // B
        }
      }
      
      // Parçacık boyutunu hareket hızına göre ayarla (daha dramatik uzama efekti)
      const speedFactor = zPos < 0 ? Math.abs(zPos) / 50 : 0;
      sizes.array[i] = Math.max(sizes.array[i], sizes.array[i] * (1 + speedFactor * progressRef.current * 3));
    }
    
    positions.needsUpdate = true;
    sizes.needsUpdate = true;
    colors.needsUpdate = true;
  };
  
  // Bileşen aktif değilse görünmez
  if (!active) return null;
  
  return (
    <group ref={groupRef}>
      {/* Spiral tünel efekti */}
      <mesh ref={tunnelRef} position={[0, 0, -750]}>
        <primitive object={tunnelMesh.geometry} attach="geometry" />
        <primitive object={tunnelMesh.material} attach="material" />
      </mesh>
      
      {/* Ana parçacıklar */}
      <points frustumCulled={false}>
        <primitive object={particles.geometry} attach="geometry" />
        <pointsMaterial
          size={2}
          vertexColors={true}
          transparent={true}
          opacity={0.8}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation={true}
        />
      </points>
      
      {/* Neon çubuklar - gittiğimiz yöne paralel */}
      {neonTubes.map((tube, index) => (
        <mesh 
          key={`tube-${index}`} 
          position={tube.position} 
          rotation={tube.rotation}
          userData={{ isNeonTube: true }}
        >
          <boxGeometry args={[tube.thickness, tube.thickness, tube.length]} />
          <meshBasicMaterial 
            color={tube.color} 
            transparent={true} 
            opacity={0.9}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      
      {/* Işık halkaları - koyu mor tonda */}
      <mesh position={[0, 0, -300]} rotation={[Math.PI/2, 0, 0]}>
        <ringGeometry args={[25, 28, 64]} />
        <meshBasicMaterial 
          color="#6040aa" 
          transparent 
          opacity={0.6} 
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      <mesh position={[0, 0, -500]} rotation={[Math.PI/2, 0, 0]}>
        <ringGeometry args={[35, 39, 64]} />
        <meshBasicMaterial 
          color="#4a2080" 
          transparent 
          opacity={0.5} 
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      <mesh position={[0, 0, -800]} rotation={[Math.PI/2, 0, 0]}>
        <ringGeometry args={[45, 50, 64]} />
        <meshBasicMaterial 
          color="#3a1060" 
          transparent 
          opacity={0.4} 
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Işık çizgileri */}
      {warpLines.map((line, index) => (
        <line key={index}>
          <primitive object={line.geometry} attach="geometry" />
          <lineBasicMaterial 
            color={line.color} 
            opacity={0.8} 
            transparent 
            blending={THREE.AdditiveBlending}
            linewidth={line.width}
          />
        </line>
      ))}
    </group>
  );
} 