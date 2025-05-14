import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function SpiralPortal({ onClick, active }) {
  const meshRef = useRef();
  const particlesRef = useRef();
  const [scale, setScale] = useState(0);
  const [particles, setParticles] = useState([]);
  const [geometryCreated, setGeometryCreated] = useState(false);
  
  const PARTICLE_COUNT = 100; // Sabit parçacık sayısı

  // Parçacıkları oluştur
  useEffect(() => {
    if (active) {
      setScale(0); // baştan başlat
      
      // Spiral etrafında parçacıklar oluştur
      const newParticles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        newParticles.push({
          position: new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5
          ),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05
          ),
          size: Math.random() * 0.1 + 0.05
        });
      }
      setParticles(newParticles);
      setGeometryCreated(false); // Yeni particles oluşturulduğunda geometry'nin yeniden oluşturulmasını sağla
    }
  }, [active]);
  
  // Geometry'yi bir kez oluştur
  useEffect(() => {
    if (active && particles.length > 0 && particlesRef.current && !geometryCreated) {
      // Yeni bir BufferGeometry oluştur
      const geometry = new THREE.BufferGeometry();
      
      // Position attribute için array
      const positions = new Float32Array(PARTICLE_COUNT * 3);
      // Size attribute için array
      const sizes = new Float32Array(PARTICLE_COUNT);
      
      // Başlangıç değerlerini ata
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        if (i < particles.length) {
          const p = particles[i];
          positions[i * 3] = p.position.x;
          positions[i * 3 + 1] = p.position.y;
          positions[i * 3 + 2] = p.position.z;
          sizes[i] = p.size;
        }
      }
      
      // Buffer attribute'ları ayarla
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      
      // Eski geometry'yi temizle ve yerine yenisini koy
      if (particlesRef.current.geometry) {
        particlesRef.current.geometry.dispose();
      }
      particlesRef.current.geometry = geometry;
      
      setGeometryCreated(true);
    }
  }, [active, particles, geometryCreated]);

  useFrame((state, delta) => {
    if (!active || !meshRef.current) return;

    // Ana portal - yavaşça büyüsün
    if (scale < 1.5) {
      setScale((prev) => Math.min(prev + 0.015, 1.5));
      meshRef.current.scale.set(scale, scale, scale);
      meshRef.current.rotation.z += 0.03;
    }
    
    // Portal pulsasyonu (hafif titreşim)
    if (meshRef.current.material) {
      meshRef.current.material.emissiveIntensity = 2 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
    
    // Parçacıkları güncelle
    if (particlesRef.current && particlesRef.current.geometry && geometryCreated) {
      const positions = particlesRef.current.geometry.attributes.position;
      const sizes = particlesRef.current.geometry.attributes.size;
      
      if (positions && sizes && positions.count === PARTICLE_COUNT) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          if (i < particles.length) {
            // Portal etrafında dönsün
            const angle = state.clock.elapsedTime * 0.5 + i * 0.01;
            const radius = 1.5 + Math.sin(i * 0.5) * 0.5;
            
            positions.array[i * 3] = Math.cos(angle) * radius * scale;
            positions.array[i * 3 + 1] = Math.sin(angle) * radius * scale;
            positions.array[i * 3 + 2] = (Math.sin(i + state.clock.elapsedTime) * 0.2) * scale;
            
            // Boyut titreşimi
            sizes.array[i] = particles[i].size * (1 + Math.sin(state.clock.elapsedTime * 3 + i) * 0.3) * scale;
          }
        }
        
        positions.needsUpdate = true;
        sizes.needsUpdate = true;
      }
    }
  });

  return active ? (
    <group>
      {/* Ana spiral portal */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        position={[0, 0, 0]}
      >
        <torusGeometry args={[1.5, 0.15, 16, 100]} />
        <meshStandardMaterial 
          color="cyan" 
          emissive="blue" 
          emissiveIntensity={2}
          side={THREE.DoubleSide}
          transparent={true}
          opacity={0.8}
        />
      </mesh>
      
      {/* Parçacıklar */}
      <points ref={particlesRef}>
        <pointsMaterial
          size={0.1}
          color="aqua"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={true}
        />
      </points>
      
      {/* İç merkez ışık */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5 * scale, 32, 32]} />
        <meshBasicMaterial color="white" transparent opacity={0.9} />
      </mesh>
      
      {/* Ortam ışığı */}
      <pointLight position={[0, 0, 0]} distance={10} intensity={2} color="cyan" />
    </group>
  ) : null;
} 