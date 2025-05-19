import { useLoader, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

export default function PortalElevator({ cubeSize = 100, cubePosition = [0, 0, -5000], onTeleport }) {
  const gltf = useLoader(GLTFLoader, "./elevator_s7ntech1.glb"); // ← YOLU DÜZELT!
  const portalRef = useRef();
  const mixer = useRef();

  useEffect(() => {
    if (!gltf || !gltf.scene) return;

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.position.set(0, 0, 0);
      }
    });

    if (gltf.animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(gltf.scene);
      const action = mixer.current.clipAction(gltf.animations[0]);
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.timeScale = 1;
      action.play();
    }
  }, [gltf]);

  useFrame(({ camera }, delta) => {
    mixer.current?.update(delta);

    if (portalRef.current) {
      const portalBox = new THREE.Box3().setFromObject(portalRef.current);
      if (portalBox.containsPoint(camera.position)) {
        onTeleport?.();
      }
    }
  });

  const z = cubePosition[2] + cubeSize / 2;
  const y = cubePosition[1] - cubeSize / 2 + 0.1;
  const x = cubePosition[0];

  return gltf ? (
    <primitive
      ref={portalRef}
      object={gltf.scene}
      position={[x, y, z]}
      rotation={[0, 0, 0]}
      scale={[8, 8, 8]}
    />
  ) : null;
}
