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

  useEffect(() => {
    if (portalActive) setShowPortal(true);
  }, [portalActive]);

  const handlePortalClick = () => {
    // Kamera yaklaşsın
    gsap.to(camera.position, {
      duration: 1.5,
      z: camera.position.z - 45,
      ease: "power2.inOut",
    });

    // App'e video geçişini bildir
    if (onRequestVideoStart) onRequestVideoStart();
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

      {/* TPS kontrol - sadece MainScene'de */}
      {!portalActive && (
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
)}

    </>
  );
}
