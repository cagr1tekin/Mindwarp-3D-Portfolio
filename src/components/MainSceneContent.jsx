import { OrbitControls } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import SkyEnvironmentGLB from "./SkyEnvironmentGLB";
import SpiralPortal from "./SpiralPortal";
import LightspeedEffect from "./LightspeedEffect";

export default function MainSceneContent({ portalActive, onRequestVideoStart }) {
  const controlsRef = useRef();
  const { camera } = useThree();
  const [showPortal, setShowPortal] = useState(false);
  const [lightspeedActive, setLightspeedActive] = useState(false);
  const [cameraShaking, setCameraShaking] = useState(false);
  const originalCameraPos = useRef(null);

  useEffect(() => {
    if (portalActive) {
      setShowPortal(true);
    }
  }, [portalActive]);

  useFrame((state, delta) => {
    if (cameraShaking) {
      const intensity = 0.06 * (1 + Math.sin(state.clock.elapsedTime * 12) * 0.5);
      camera.position.x += (Math.random() - 0.5) * intensity;
      camera.position.y += (Math.random() - 0.5) * intensity;
      camera.rotation.z += (Math.random() - 0.5) * intensity * 0.08;

      if (originalCameraPos.current) {
        camera.position.x = THREE.MathUtils.lerp(
          camera.position.x,
          originalCameraPos.current.x,
          delta * 5
        );
        camera.position.y = THREE.MathUtils.lerp(
          camera.position.y,
          originalCameraPos.current.y,
          delta * 5
        );
      }
    }
  });

  // Portala tıklanınca kamerayı yaklaştır ve App'e haber ver
  const handlePortalClick = () => {
    const targetZ = camera.position.z - 45;

    gsap.to(camera.position, {
      duration: 1.5,
      z: targetZ,
      ease: "power2.inOut",
      onComplete: () => {
        if (onRequestVideoStart) {
          onRequestVideoStart(); // App'e bildir: video başlasın, blackfade açsın
        }
      }
    });
  };

  return (
    <>
      <SkyEnvironmentGLB />

      {!portalActive && (
        <group position={[0, 0, 0]}>
          <LightspeedEffect active={lightspeedActive} duration={5} />
        </group>
      )}

      {showPortal && (
        <SpiralPortal active={true} onClick={handlePortalClick} />
      )}

      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        dampingFactor={0.05}
        enableDamping={true}
        rotateSpeed={-0.5}
        zoomSpeed={0.8}
        panSpeed={-0.5}
      />
    </>
  );
}
