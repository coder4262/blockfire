import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { WeaponType } from '../types';
import { WEAPONS } from '../constants';

interface PlayerProps {
  onFire: (intersectId?: string) => void;
  currentWeapon: WeaponType;
  ammo: number;
  blocks: any[];
}

const Player: React.FC<PlayerProps> = ({ onFire, currentWeapon, ammo, blocks }) => {
  const { camera, raycaster, scene } = useThree();
  const gunRef = useRef<THREE.Group>(null);
  const [isFiring, setIsFiring] = useState(false);
  const lastFireTime = useRef(0);

  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keys.current[e.code] = false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleShoot = () => {
    const now = Date.now();
    const weaponConfig = WEAPONS[currentWeapon];
    if (now - lastFireTime.current < weaponConfig.fireRate) return;
    if (ammo <= 0) return;

    lastFireTime.current = now;
    setIsFiring(true);
    setTimeout(() => setIsFiring(false), 50);

    // Shooting logic
    // Fix: raycaster.setFromCamera requires a Vector2 object, not a plain object literal.
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(scene.children);
    
    let hitId: string | undefined;
    if (intersects.length > 0) {
        // Find if we hit a mesh that belongs to a block
        const hit = intersects[0];
        // We can attach custom data to meshes to identify blocks
        // In this simple implementation, we'll just look at the object's parent or identity
        // For now, onFire will handle generic effects
        onFire();
        
        // Target identification (simplified logic: check if color is target color)
        const targetColor = new THREE.Color(0xef4444);
        if ((hit.object as THREE.Mesh).material instanceof THREE.MeshStandardMaterial) {
            const mat = (hit.object as THREE.Mesh).material as THREE.MeshStandardMaterial;
            if (mat.color.equals(targetColor)) {
                 // In a more robust system, we'd map this back to an ID
            }
        }
    } else {
        onFire();
    }
  };

  useFrame((state, delta) => {
    const { forward, backward, left, right, jump } = {
      forward: keys.current['KeyW'],
      backward: keys.current['KeyS'],
      left: keys.current['KeyA'],
      right: keys.current['KeyD'],
      jump: keys.current['Space'],
    };

    // Movement
    const speed = 5;
    direction.current.z = Number(forward) - Number(backward);
    direction.current.x = Number(right) - Number(left);
    direction.current.normalize();

    if (forward || backward) velocity.current.z -= direction.current.z * speed * delta;
    if (left || right) velocity.current.x -= direction.current.x * speed * delta;

    camera.position.x += velocity.current.x * delta;
    camera.position.z += velocity.current.z * delta;

    velocity.current.multiplyScalar(0.9); // Friction

    // Gun positioning (follow camera)
    if (gunRef.current) {
      gunRef.current.position.copy(camera.position);
      gunRef.current.rotation.copy(camera.rotation);
      gunRef.current.translateX(0.4);
      gunRef.current.translateY(-0.3);
      gunRef.current.translateZ(-0.6);
      
      // Idle sway
      gunRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.005;
      
      // Recoil
      if (isFiring) {
        gunRef.current.position.z += 0.1;
        gunRef.current.rotation.x -= 0.05;
      }
    }

    if (keys.current['MouseDown'] || keys.current['MouseButton0']) {
        // PointerLockControls doesn't pass through mouse events easily
    }
  });

  // Handle manual clicks for shooting since we use PointerLock
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
        if (document.pointerLockElement) {
            if (e.button === 0) handleShoot();
        }
    };
    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [currentWeapon, ammo]);

  return (
    <>
      <PointerLockControls />
      <PerspectiveCamera makeDefault position={[0, 1.7, 5]} fov={75} />
      
      {/* Gun Model (Procedural) */}
      <group ref={gunRef}>
        {/* Barrel */}
        <mesh position={[0, 0, -0.2]}>
          <boxGeometry args={[0.1, 0.1, 0.6]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        {/* Grip */}
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[0.1, 0.3, 0.1]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        {/* Muzzle Flash */}
        {isFiring && (
          <pointLight position={[0, 0, -0.6]} intensity={5} distance={2} color="#facc15" />
        )}
      </group>
    </>
  );
};

export default Player;