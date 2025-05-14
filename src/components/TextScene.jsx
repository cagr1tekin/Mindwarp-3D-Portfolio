import { Text } from "@react-three/drei";

export default function TextScene({ text }) {
  return (
    <Text
      position={[0, 0, 0]}
      fontSize={1.2}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
} 