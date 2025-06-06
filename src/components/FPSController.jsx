import { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { elevatorWorldPosition } from './SpawnElevator';

export default function FPSController({
  moveSpeed = 5,
  bounds = 200,
  jumpForce = 10,
  gravity = 20,
  bobbingSpeed = 14,
  bobbingAmount = 0.05,
  elevatorDone = false,
  controlsEnabled = true,
  portalBind = false  // 👈 Ekledik
}) {
  const { camera } = useThree();

  const moveState = useRef({
    forward: false, backward: false, left: false, right: false,
    velocity: new THREE.Vector3(), running: false, bobbingTime: 0
  });

  const isInElevator = !elevatorDone;
  const [locked, setLocked] = useState(false);
  const [spawned, setSpawned] = useState(false);
  const yaw = useRef(0), pitch = useRef(0);
  const cameraDirection = useRef(new THREE.Vector3());
  const characterHeight = 10;
  const spawnY = elevatorWorldPosition.y + 0.5 + characterHeight;

  const grounded = useRef(false);
  const groundBuffer = useRef(0);
  const jumpCooldown = useRef(false);

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

  useEffect(() => {
    if (!spawned && elevatorWorldPosition.y !== 0) {
      camera.position.set(elevatorWorldPosition.x, spawnY, elevatorWorldPosition.z);
      camera.lookAt(elevatorWorldPosition.x, spawnY, elevatorWorldPosition.z - 10);
      setSpawned(true);
    }
  }, [spawned]);

  useEffect(() => {
    const handleClick = () => {
      if (document.pointerLockElement !== document.body)
        document.body.requestPointerLock();
    };
    const handleLockChange = () => {
      setLocked(document.pointerLockElement === document.body);
    };
    window.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => {
      window.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handleLockChange);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['KeyW', 'KeyR'].includes(e.code)) return e.preventDefault();
      switch (e.code) {
        case 'KeyW': moveState.current.forward = true; break;
        case 'KeyS': moveState.current.backward = true; break;
        case 'KeyA': moveState.current.left = true; break;
        case 'KeyD': moveState.current.right = true; break;
        case 'Space': handleJump(); break;
        case 'ShiftLeft': case 'ShiftRight': moveState.current.running = true; break;
      }
    };
    const onKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': moveState.current.forward = false; break;
        case 'KeyS': moveState.current.backward = false; break;
        case 'KeyA': moveState.current.left = false; break;
        case 'KeyD': moveState.current.right = false; break;
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

  function handleJump() {
    if (grounded.current && !jumpCooldown.current) {
      moveState.current.velocity.y = jumpForce;
      grounded.current = false;
      jumpCooldown.current = true;
      setTimeout(() => { jumpCooldown.current = false; }, 200);
    }
  }

  useFrame((state, delta) => {
    if (!controlsEnabled || portalBind) return;  // 🧨 WASD kilidi burada

    const quat = new THREE.Quaternion();
    quat.setFromEuler(new THREE.Euler(pitch.current, yaw.current + Math.PI, 0, 'YXZ'));
    camera.quaternion.copy(quat);

    if (isInElevator) {
      const offset = new THREE.Vector3(0, 8, 0);
      camera.position.copy(elevatorWorldPosition.clone().add(offset));
      camera.quaternion.copy(quat);
      return;
    }

    camera.getWorldDirection(cameraDirection.current);
    cameraDirection.current.y = 0;
    cameraDirection.current.normalize();
    const right = new THREE.Vector3().crossVectors(cameraDirection.current, camera.up).normalize();

    const moveZ = (moveState.current.forward ? 1 : 0) - (moveState.current.backward ? 1 : 0);
    const moveX = (moveState.current.right ? 1 : 0) - (moveState.current.left ? 1 : 0);
    const speedMultiplier = moveState.current.running ? 2 : 1;

    if (!isInElevator) {
      const ray = new THREE.Raycaster();
      ray.set(camera.position.clone().add(new THREE.Vector3(0, 1, 0)), new THREE.Vector3(0, -1, 0));
      const hits = ray.intersectObjects(state.scene.children, true);
      const groundHit = hits.find(i => i.distance < 5.5);
      if (groundHit) { groundBuffer.current = 5; camera.position.y = Math.max(camera.position.y, groundHit.point.y); }
      else if (groundBuffer.current > 0) { groundBuffer.current--; }
      grounded.current = groundBuffer.current > 0;
    }

    if ((moveX || moveZ) && grounded.current) {
      moveState.current.bobbingTime += delta * bobbingSpeed * speedMultiplier;
      const offset = Math.sin(moveState.current.bobbingTime) * bobbingAmount;
      camera.position.y += offset;
    }

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

    if (!grounded.current) {
      moveState.current.velocity.y -= gravity * delta;
      camera.position.y += moveState.current.velocity.y * delta;
    }

    if (camera.position.y < -100) {
      camera.position.set(elevatorWorldPosition.x, spawnY, elevatorWorldPosition.z);
      moveState.current.velocity.set(0, 0, 0);
    }
  });

  return null;
}
