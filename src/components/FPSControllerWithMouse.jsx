import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';

export default function FPSControllerWithMouse({
  moveSpeed = 5,
  bounds = 200,
  initialPosition = [0, 0, -5000],
  jumpForce = 15,
  gravity = 20
}) {
  const { camera, gl } = useThree();
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    velocity: new THREE.Vector3(),
    grounded: true
  });

  const yaw = useRef(0);
  const pitch = useRef(0);
  const sensitivity = 0.002;

  useEffect(() => {
    // Başlangıç pozisyon
    camera.position.set(...initialPosition);

    // Mouse lock ve hareket takibi
    const dom = gl.domElement;
    dom.addEventListener('click', () => dom.requestPointerLock());

    const onMouseMove = (e) => {
      if (document.pointerLockElement === dom) {
        yaw.current -= e.movementX * sensitivity;
        pitch.current -= e.movementY * sensitivity;
        pitch.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch.current));
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  }, [gl, camera]);

  useEffect(() => {
    const handleKey = (val, pressed) => {
      switch (val.code) {
        case 'KeyW': moveState.current.forward = pressed; break;
        case 'KeyS': moveState.current.backward = pressed; break;
        case 'KeyA': moveState.current.left = pressed; break;
        case 'KeyD': moveState.current.right = pressed; break;
      }
    };

    const down = (e) => handleKey(e, true);
    const up = (e) => handleKey(e, false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useFrame((_, delta) => {
    // Kamera yönünü hesapla
    const direction = new THREE.Vector3();
    direction.x = Math.sin(yaw.current) * Math.cos(pitch.current);
    direction.y = Math.sin(pitch.current);
    direction.z = Math.cos(yaw.current) * Math.cos(pitch.current);
    camera.lookAt(camera.position.clone().add(direction));

    // Yatay hareket (XZ düzlemi)
    const move = new THREE.Vector3();
    const forward = new THREE.Vector3(direction.x, 0, direction.z).normalize();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    if (moveState.current.forward) move.add(forward);
    if (moveState.current.backward) move.sub(forward);
    if (moveState.current.right) move.add(right);
    if (moveState.current.left) move.sub(right);

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(moveSpeed * delta);
      camera.position.add(move);
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

  return null;
}
