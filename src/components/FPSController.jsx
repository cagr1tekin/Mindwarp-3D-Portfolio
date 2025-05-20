import { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { elevatorWorldPosition } from './SpawnElevator';

export default function FPSController({
  moveSpeed = 5,
  bounds = 200,
  initialPosition = [0, -35, -5000],
  initialLookAt = [0, -35, -5010],
  jumpForce = 10,
  gravity = 20,
  bobbingSpeed = 14,
  bobbingAmount = 0.05,
  elevatorDone = false
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
    running: false,
    bobbingTime: 0
  });

  const isInElevator = moveState.current.grounded && !elevatorDone;
  const [locked, setLocked] = useState(false);
  const [spawned, setSpawned] = useState(false);
  const yaw = useRef(0);
  const pitch = useRef(0);
  const cameraDirection = useRef(new THREE.Vector3());
  const characterHeight = 10; // karakterin boyu, ihtiyaca göre 30-40 arası ayarla
  const spawnY = elevatorWorldPosition.y + 5 + characterHeight; // 5: zemin kalınlığı

  // 🔒 Mouse kontrolü
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!locked) return;
      yaw.current -= e.movementX * 0.002;
      pitch.current -= e.movementY * 0.002;
      pitch.current = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pitch.current));
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [locked]);

  
  // 📍 Başlangıç pozisyonu
  useEffect(() => {
    if (!spawned && elevatorWorldPosition.y !== 0) {
      camera.position.set(
        elevatorWorldPosition.x,
        spawnY,
        elevatorWorldPosition.z
      );
      camera.lookAt(
        elevatorWorldPosition.x,
        spawnY,
        elevatorWorldPosition.z - 10
      );
      console.log("🎯 Kamera spawn:", camera.position);
      setSpawned(true);
    }
  }, [spawned]);
  
  
  

  // 🔘 Pointer lock
  useEffect(() => {
    const handleClick = () => {
      if (document.pointerLockElement !== document.body) {
        document.body.requestPointerLock();
      }
    };
    const handleLockChange = () => {
      setLocked(document.pointerLockElement === document.body);
      console.log("🖱 Pointer lock durumu:", document.pointerLockElement);

    };
    window.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => {
      window.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handleLockChange);
    };
  }, []);

  // ⌨️ Klavye kontrolleri
  useEffect(() => {
    const onKeyDown = (e) => {
      console.log("⬇️ Tuş basıldı:", e.code);

      if ((e.ctrlKey || e.metaKey) && ['KeyW', 'KeyR'].includes(e.code)) return e.preventDefault();
      switch (e.code) {
        case 'KeyW': moveState.current.forward = true; break;
        case 'KeyS': moveState.current.backward = true; break;
        case 'KeyA': moveState.current.left = true; break;
        case 'KeyD': moveState.current.right = true; break;
        case 'Space': moveState.current.jumping = true; break;
        case 'ShiftLeft': case 'ShiftRight': moveState.current.running = true; break;
      }
    };
    const onKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': moveState.current.forward = false; break;
        case 'KeyS': moveState.current.backward = false; break;
        case 'KeyA': moveState.current.left = false; break;
        case 'KeyD': moveState.current.right = false; break;
        case 'Space': moveState.current.jumping = false; break;
        case 'ShiftLeft': case 'ShiftRight': moveState.current.running = false; break;
      }
    };
    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // 🎮 Hareket sistemi
  useFrame((state, delta) => {
    const quat = new THREE.Quaternion();
    quat.setFromEuler(new THREE.Euler(pitch.current, yaw.current + Math.PI, 0, 'YXZ'));
    camera.quaternion.copy(quat);

    // 🛗 Eğer zıplamıyorsa ve havadaysa → Asansörle beraber hareket et
    if (isInElevator) {
      const offset = new THREE.Vector3(0, 8, 0); // kafa hizası
      camera.position.copy(elevatorWorldPosition.clone().add(offset));
      // 👇 Yalnızca yönü ayarla, pozisyon sabit değilse bile bakış aynı kalsın
      const quat = new THREE.Quaternion();
      quat.setFromEuler(new THREE.Euler(pitch.current, yaw.current + Math.PI, 0, 'YXZ'));
      camera.quaternion.copy(quat);
    }

    // 🎯 Yön vektörleri
    camera.getWorldDirection(cameraDirection.current);
    cameraDirection.current.y = 0;
    cameraDirection.current.normalize();
    const right = new THREE.Vector3().crossVectors(cameraDirection.current, camera.up).normalize();

    const moveZ = (moveState.current.forward ? 1 : 0) - (moveState.current.backward ? 1 : 0);
    const moveX = (moveState.current.right ? 1 : 0) - (moveState.current.left ? 1 : 0);
    const speedMultiplier = moveState.current.running ? 2 : 1;

    // ⛓ Yere temas kontrolü
    const ray = new THREE.Raycaster();
    ray.set(camera.position.clone().add(new THREE.Vector3(0, 1, 0)), new THREE.Vector3(0, -1, 0));
    const hits = ray.intersectObjects(state.scene.children, true);
    const groundHit = hits.find(i => i.distance < 5.5);

    if (groundHit) {
      moveState.current.grounded = true;
      camera.position.y = Math.max(camera.position.y, groundHit.point.y);
    } else {
      moveState.current.grounded = false;
    }

    // 👟 Bobbing efekti
    if ((moveX || moveZ) && moveState.current.grounded) {
      moveState.current.bobbingTime += delta * bobbingSpeed * speedMultiplier;
      const offset = Math.sin(moveState.current.bobbingTime) * bobbingAmount;
      camera.position.y += offset;
    }

    // ➡ Hareket
    const moveVec = new THREE.Vector3()
      .add(cameraDirection.current.clone().multiplyScalar(moveZ))
      .add(right.clone().multiplyScalar(moveX))
      .normalize()
      .multiplyScalar(moveSpeed * speedMultiplier * delta);

    const cubeCenter = new THREE.Vector3(0, 0, -5000);
    const half = bounds;
    const next = camera.position.clone().add(moveVec);

    if (next.x >= cubeCenter.x - half && next.x <= cubeCenter.x + half)
      camera.position.x = next.x;
    if (next.z >= cubeCenter.z - half && next.z <= cubeCenter.z + half)
      camera.position.z = next.z;

    // 🆙 Zıplama
    if (moveState.current.jumping && moveState.current.grounded) {
      moveState.current.velocity.y = jumpForce;
      moveState.current.grounded = false;
    }

    // ⬇ Yerçekimi
    if (!moveState.current.grounded) {
      moveState.current.velocity.y -= gravity * delta;
      camera.position.y += moveState.current.velocity.y * delta;
    }

    // 🔁 Düşüşten sonra sıfırlama
    if (camera.position.y < -100) {
      camera.position.set(elevatorWorldPosition.x, spawnY, elevatorWorldPosition.z);
      moveState.current.velocity.set(0, 0, 0);
    }
  });

  return null;
}
