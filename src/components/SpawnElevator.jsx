import { useLoader, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

export default function SpawnElevator({ cubeSize = 100, cubePosition = [0, 0, -5000] }) {
  const gltf = useLoader(GLTFLoader, "./elevator_s7ntech2.glb");
  const mixer = useRef();

  useEffect(() => {
    if (gltf.animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(gltf.scene);
      const action = mixer.current.clipAction(gltf.animations[0]);
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.timeScale = -1;
      action.play();
      action.time = action.getClip().duration;
    }
  }, [gltf]);

  useFrame((state, delta) => {
    mixer.current?.update(delta);
  });

  const z = cubePosition[2] - cubeSize / 2; // C kenarı
  const y = cubePosition[1] - cubeSize / 2 + 0.1;
  const x = cubePosition[0];

  return (
    <primitive
      object={gltf.scene}
      position={[x, y, z]}
      rotation={[0, Math.PI, 0]}
      scale={[8, 8, 8]}
    />
  );
}
