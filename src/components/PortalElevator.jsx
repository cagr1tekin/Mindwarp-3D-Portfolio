import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";

export default function PortalElevator({ cubeSize = 100, cubePosition = [0, 0, -5000], onFinish, disableControls }) {
  const { camera } = useThree();
  const gltf = useLoader(GLTFLoader, "./elevator_s7ntech1.glb");
  const portalRef = useRef();
  const rigidRef = useRef();
  const targetMesh = useRef();
  const colliderRef = useRef();
  const mixer = useRef();
  const action = useRef();
  const [animationStarted, setAnimationStarted] = useState(false);
  const [binded, setBinded] = useState(false);
  const verticalOffset = 10;
  const bindOffset = 2;

  useEffect(() => {
    mixer.current = new THREE.AnimationMixer(gltf.scene);
    action.current = mixer.current.clipAction(gltf.animations[0]);
    action.current.setLoop(THREE.LoopOnce);
    action.current.clampWhenFinished = true;
    action.current.timeScale = 1;

    action.current.getMixer().addEventListener("finished", () => {
      if (onFinish) onFinish();
    });

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
      if (child.name === "arc1Base") {
        targetMesh.current = child;
      }
    });
  }, [gltf, onFinish]);

  useFrame((state, delta) => {
    if (animationStarted) {
      mixer.current?.update(delta);
    }

    // Asansör rigidbody kinematik hareketi:
    if (rigidRef.current && targetMesh.current) {
      const worldPos = new THREE.Vector3();
      targetMesh.current.getWorldPosition(worldPos);
      rigidRef.current.setNextKinematicTranslation({
        x: worldPos.x,
        y: worldPos.y + verticalOffset,
        z: worldPos.z
      });
    }

    // Kamera rigidbodyye bind olunca artık RigidBody'nin pozisyonunu takip etsin:
    if (binded && rigidRef.current) {
      const bodyPos = rigidRef.current.translation();
      camera.position.set(bodyPos.x, bodyPos.y + bindOffset, bodyPos.z);
      camera.lookAt(bodyPos.x, bodyPos.y + bindOffset, bodyPos.z - 10);
    }

    // Bind algılama
    if (!animationStarted && colliderRef.current) {
      const colliderPos = new THREE.Vector3();
      colliderRef.current.getWorldPosition(colliderPos);
      const distance = colliderPos.distanceTo(camera.position);

      if (distance < 7) {
        if (disableControls) disableControls();
        action.current.play();
        setAnimationStarted(true);
        setBinded(true);
      }
    }
  });

  const z = cubePosition[2] + cubeSize / 2;
  const y = cubePosition[1] - cubeSize / 2 + 0.1;
  const x = cubePosition[0];

  return gltf ? (
    <group position={[x, y, z]}>
      <primitive ref={portalRef} object={gltf.scene} rotation={[0, 0, 0]} scale={[8, 8, 8]} />
      <RigidBody ref={rigidRef} type="kinematicPosition" colliders={false}>
        <mesh position={[0, -2, 0]} ref={colliderRef}>
          <cylinderGeometry args={[5, 5, 10, 32]} />
          <meshStandardMaterial color="orange" transparent opacity={0.3} />
        </mesh>
      </RigidBody>
    </group>
  ) : null;
}
