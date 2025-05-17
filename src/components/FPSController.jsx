import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function FPSController({
  moveSpeed = 5,
  bounds = 200,
  initialPosition = [0, -48.3, -5000],
  initialLookAt = [0, -48.3, -4990],
  jumpForce = 15,
  gravity = 20
}) {
  const { camera } = useThree();

  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jumping: false,
    grounded: true,
    velocity: new THREE.Vector3(),
    running: false,   // ← SHIFT
    crouching: false  // ← CTRL
  });
  

  // Kamera yönü için vektörler
  const cameraDirection = useRef(new THREE.Vector3());
  const moveVector = useRef(new THREE.Vector3());
  const tempVector = useRef(new THREE.Vector3());
  const frameCount = useRef(0);

  // Başlangıç pozisyon ve bakış yönü
  useEffect(() => {
    try {


      camera.position.set(...initialPosition);
      camera.lookAt(...initialLookAt);
      camera.updateProjectionMatrix();


    } catch (error) {
      console.error('Kamera ayarları sırasında hata:', error);
    }
  }, [camera, initialPosition, initialLookAt]);

  // Tuş olayları
  useEffect(() => {
    const onKeyDown = (e) => {
        // Kritik tarayıcı kısayollarını engelle
        if ((e.ctrlKey || e.metaKey) && ['KeyW', 'KeyR'].includes(e.code)) {
          e.preventDefault();
          console.log("⚠️ Tarayıcı kısayolu engellendi:", e.code);
          return;
        }
      
        switch (e.code) {
          case 'KeyW': moveState.current.forward = true; break;
          case 'KeyS': moveState.current.backward = true; break;
          case 'KeyA': moveState.current.left = true; break;
          case 'KeyD': moveState.current.right = true; break;
          case 'Space': moveState.current.jumping = true; break;
          case 'ShiftLeft':
          case 'ShiftRight': moveState.current.running = true; break;
        }
      };
      
  
    const onKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': moveState.current.forward = false; break;
        case 'KeyS': moveState.current.backward = false; break;
        case 'KeyA': moveState.current.left = false; break;
        case 'KeyD': moveState.current.right = false; break;
        case 'Space': moveState.current.jumping = false; break;
        case 'ShiftLeft':
        case 'ShiftRight': moveState.current.running = false; break;
      }
    };
  
    // 🔧 Passive false!
    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);
  
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);
  


  useFrame((state, delta) => {
    camera.getWorldDirection(cameraDirection.current);
    cameraDirection.current.y = 0;
    cameraDirection.current.normalize();
  
    const rightDirection = new THREE.Vector3().crossVectors(cameraDirection.current, camera.up).normalize();
  
    // Tuş kombinasyonları
    const moveZ = (moveState.current.forward ? 1 : 0) - (moveState.current.backward ? 1 : 0);
    const moveX = (moveState.current.right ? 1 : 0) - (moveState.current.left ? 1 : 0);
    const speedMultiplier = moveState.current.running ? 2.0 : 1.0;
  
    const moveDelta = new THREE.Vector3()
      .add(cameraDirection.current.clone().multiplyScalar(moveZ))
      .add(rightDirection.clone().multiplyScalar(moveX))
      .normalize()
      .multiplyScalar(moveSpeed * speedMultiplier * delta);
  
    // Sınır kontrolü
    const cubeCenter = new THREE.Vector3(0, initialPosition[1], -5000);
    const halfSize = bounds;
    const minX = cubeCenter.x - halfSize;
    const maxX = cubeCenter.x + halfSize;
    const minZ = cubeCenter.z - halfSize;
    const maxZ = cubeCenter.z + halfSize;
  
    const nextPos = camera.position.clone().add(moveDelta);
  
    if (nextPos.x >= minX && nextPos.x <= maxX) {
      camera.position.x = nextPos.x;
    }
  
    if (nextPos.z >= minZ && nextPos.z <= maxZ) {
      camera.position.z = nextPos.z;
    }
  
    // Zıplama
    if (moveState.current.jumping && moveState.current.grounded) {
      moveState.current.velocity.y = jumpForce;
      moveState.current.grounded = false;
    }
  
    // Yerçekimi
    if (!moveState.current.grounded) {
      moveState.current.velocity.y -= gravity * delta;
      camera.position.y += moveState.current.velocity.y * delta;
  
      if (camera.position.y <= initialPosition[1]) {
        camera.position.y = initialPosition[1];
        moveState.current.velocity.y = 0;
        moveState.current.grounded = true;
      }
    }
  });
  
  // 💡 Sayfa kapanmasını engelle (örneğin yanlışlıkla Ctrl+W basıldığında)
useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // Modern tarayıcılar bunu istiyor
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);


  return null;
}
