import { useRef, useState, useEffect, useMemo } from "react";
import { DoubleSide, TextureLoader, FrontSide, BackSide, Color } from "three";

export default function MemoryCube({ size = 100, position = [0, 0, -5000] }) {
  const groupRef = useRef();
  const [textures, setTextures] = useState({});
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  
  // Dokuları yükle
  useEffect(() => {
    const loader = new TextureLoader();
    const textureFiles = {
      front: "/memories/memory1.jpg",
      back: "/memories/memory2.jpg",
      top: "/memories/memory3.jpg",
      bottom: "/memories/memory4.jpg",
      left: "/memories/memory5.jpg",
      right: "/memories/memory6.jpg",
    };
    
    const loadedTextures = {};
    let loadedCount = 0;
    const textureCount = Object.keys(textureFiles).length;
    
    // Her bir dokuyu yükle
    Object.entries(textureFiles).forEach(([key, path]) => {
      loader.load(
        path,
        (texture) => {
          loadedTextures[key] = texture;
          loadedCount++;
          
          if (loadedCount === textureCount) {
            setTextures(loadedTextures);
            setTexturesLoaded(true);
          }
        },
        undefined,
        (error) => {
          console.warn(`Doku yüklenemedi: ${path}`, error);
          loadedCount++;
          
          if (loadedCount === textureCount) {
            setTexturesLoaded(true);
          }
        }
      );
    });
  }, []);
  
  // Basitleştirilmiş küp - dokular yüklenmeden önce düz renkli
  if (!texturesLoaded) {
    return (
      <group ref={groupRef} position={position}>
        {/* Ön yüz */}
        <mesh position={[0, 0, size/2]} rotation={[0, 0, 0]}>
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial color="#6a40bf" side={DoubleSide} />
        </mesh>
        
        {/* Arka yüz */}
        <mesh position={[0, 0, -size/2]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial color="#4a2d99" side={DoubleSide} />
        </mesh>
        
        {/* Üst yüz */}
        <mesh position={[0, size/2, 0]} rotation={[Math.PI/2, 0, 0]}>
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial color="#8750e8" side={DoubleSide} />
        </mesh>
        
        {/* Alt yüz */}
        <mesh position={[0, -size/2, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial color="#5730a3" side={DoubleSide} />
        </mesh>
        
        {/* Sol yüz */}
        <mesh position={[-size/2, 0, 0]} rotation={[0, Math.PI/2, 0]}>
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial color="#7645cc" side={DoubleSide} />
        </mesh>
        
        {/* Sağ yüz */}
        <mesh position={[size/2, 0, 0]} rotation={[0, -Math.PI/2, 0]}>
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial color="#4f2d8c" side={DoubleSide} />
        </mesh>
        
        {/* İç aydınlatma ve efektler */}
        <ambientLight intensity={1.0} color="#ffffff" />
        <MemoryParticles count={300} size={size} />
      </group>
    );
  }
  
  // Dokular yüklendikten sonra texture'lı küp
  return (
    <group ref={groupRef} position={position}>
      {/* Ön yüz - Çift taraflı */}
      <mesh position={[0, 0, size/2]} rotation={[0, 0, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial 
          map={textures.front} 
          side={DoubleSide} 
          emissive={new Color("#333333")}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Arka yüz - Çift taraflı */}
      <mesh position={[0, 0, -size/2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial 
          map={textures.back} 
          side={DoubleSide} 
          emissive={new Color("#333333")}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Üst yüz - Çift taraflı */}
      <mesh position={[0, size/2, 0]} rotation={[Math.PI/2, 0, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial 
          map={textures.top} 
          side={DoubleSide} 
          emissive={new Color("#333333")}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Alt yüz - Çift taraflı */}
      <mesh position={[0, -size/2, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial 
          map={textures.bottom} 
          side={DoubleSide}
          emissive={new Color("#333333")}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Sol yüz - Çift taraflı */}
      <mesh position={[-size/2, 0, 0]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial 
          map={textures.left} 
          side={DoubleSide}
          emissive={new Color("#333333")}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Sağ yüz - Çift taraflı */}
      <mesh position={[size/2, 0, 0]} rotation={[0, -Math.PI/2, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial 
          map={textures.right} 
          side={DoubleSide}
          emissive={new Color("#333333")}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* İç aydınlatma ve efektler */}
      <ambientLight intensity={1.0} color="#ffffff" />
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#ffffff" distance={size} decay={1} />
      <pointLight position={[size/4, size/4, size/4]} intensity={0.5} color="#8a6cd4" distance={size/2} />
      <pointLight position={[-size/4, -size/4, -size/4]} intensity={0.5} color="#5dacff" distance={size/2} />
      
      {/* Sis - hafif mor */}
      <fog attach="fog" args={['#30124e', size/4, size]} />
      
      {/* Parçacıklar */}
      <MemoryParticles count={300} size={size} />
    </group>
  );
}

// Anı parçacıkları bileşeni
function MemoryParticles({ count, size }) {
  // Basitleştirilmiş parçacık sistemi
  const positions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < count; i++) {
      positions.push(
        (Math.random() - 0.5) * size * 0.9,
        (Math.random() - 0.5) * size * 0.9,
        (Math.random() - 0.5) * size * 0.9
      );
    }
    return new Float32Array(positions);
  }, [count, size]);
  
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.8}
        color="#ffffff"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}
