import { useLoader, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

// Dışa FPSController için pozisyon aktar
export const elevatorWorldPosition = new THREE.Vector3();


export default function SpawnElevator({ cubeSize = 100, cubePosition = [0, 0, -5000], onAnimationDone }) {
  const gltf = useLoader(GLTFLoader, "./elevator_s7ntech2.glb");
  const mixer = useRef();
  const rigidRef = useRef();
  const targetMesh = useRef();
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    if (!gltf?.scene || gltf.animations.length === 0) return;

    mixer.current = new THREE.AnimationMixer(gltf.scene);
    const action = mixer.current.clipAction(gltf.animations[0]);
    action.setLoop(THREE.LoopOnce);
    action.clampWhenFinished = true;
    action.timeScale = -1; // ters oynatma
    action.play();
    action.time = action.getClip().duration; // sondan başlat

    mixer.current.addEventListener("finished", () => {
        setAnimationDone(true);
        if (onAnimationDone) onAnimationDone(); // callback çalıştır

      });
      

    gltf.scene.traverse((child) => {
      if (child.name === "arc1Base") {
        targetMesh.current = child;
      }
    });
  }, [gltf]);

  useFrame(() => {
    mixer.current?.update(1 / 60);

    if (!animationDone && rigidRef.current && targetMesh.current) {
      // Hedef pozisyonu al
      targetMesh.current.getWorldPosition(elevatorWorldPosition);
      rigidRef.current.setNextKinematicTranslation(elevatorWorldPosition);
    }
  });

  // Asansör grubunun pozisyonu
  const [x, y, z] = [
    cubePosition[0],
    cubePosition[1] - cubeSize / 2 + 0.1,
    cubePosition[2] - cubeSize / 2
  ];

  return (
    <group position={[x, y, z]}>
      {/* GLB modeli */}
      <primitive object={gltf.scene} rotation={[0, Math.PI, 0]} scale={[8, 8, 8]} />

      {/* Bardak collider yapısı */}
{!animationDone && (
  <RigidBody ref={rigidRef} type="kinematicPosition" colliders={false}>
    
    {/* Yan çeper */}
    <mesh position={[0, 5, 0]} visible={false}>
  <cylinderGeometry args={[4.5, 4.5, 10, 32, 1, true]} />
</mesh>

    {/* Taban */}
    <mesh position={[0, 0, 0]} visible={false}>
      <cylinderGeometry args={[4.5, 4.5, 0.5, 32]} />
    </mesh>

  </RigidBody>
)}

    </group>
  );
}
