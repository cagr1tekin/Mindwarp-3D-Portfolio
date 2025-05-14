import React from 'react';
import { Text } from "@react-three/drei";

export default function MemoryRoom({ visible = false }) {
  // Component sadece visible prop'u true olduğunda render edilsin
  if (!visible) return null;
  
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      
      <Text
        position={[0, 0, 0]}
        fontSize={1.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Anılarıma Hoşgeldin...
      </Text>
      
      {/* Buraya daha sonra eklenecek anı odası içeriği */}
    </>
  );
} 