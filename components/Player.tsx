import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { WeaponType } from '../types';
import { WEAPONS } from '../constants';

interface PlayerProps {
  onFire: (intersectId?: string) => void;
  onUpdate: (pos: [number, number, number], rot: [number, number, number], isAds: boolean) => void;
  currentWeapon: WeaponType;
  ammo: number;
  blocks: any[];
  removeBlock: (id: string) => void;
  isDead: boolean;
  mode: 'pvp' | 'pvai';
  damagePlayer: (id: string, damage: number) => void;
  triggerExplosion: (pos: [number, number, number], radius: number, damage: number) => void;
}

const Player: React.FC<PlayerProps> = ({ onFire, onUpdate, currentWeapon, ammo, blocks, removeBlock, isDead, mode, damagePlayer, triggerExplosion }) => {
  const { camera, raycaster, scene } = useThree();
  const gunRef = useRef<THREE.Group>(null);
  const [isFiring, setIsFiring] = useState(false);
  const [isAds, setIsAds] = useState(false);
  const lastFireTime = useRef(0);
  const adsFactor = useRef(0); // 0 to 1

  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const keys = useRef<Record<string, boolean>>({});
  const headBobActive = useRef(0);
  const gunSway = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keys.current[e.code] = false);
    const handleMouseMove = (e: MouseEvent) => {
        if (document.pointerLockElement) {
            const sensitivity = isAds ? 0.0005 : 0.001;
            gunSway.current.x = THREE.MathUtils.lerp(gunSway.current.x, e.movementX * sensitivity, 0.1);
            gunSway.current.y = THREE.MathUtils.lerp(gunSway.current.y, e.movementY * sensitivity, 0.1);
        }
    };
    const handleMouseDown = (e: MouseEvent) => {
        if (document.pointerLockElement) {
            if (e.button === 0) handleShoot();
            if (e.button === 2) setIsAds(true);
        }
    };
    const handleMouseUp = (e: MouseEvent) => {
        if (e.button === 2) setIsAds(false);
    };
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [currentWeapon, ammo, isAds]);

  const handleShoot = () => {
    if (isDead) return;
    const now = Date.now();
    const weaponConfig = WEAPONS[currentWeapon];
    if (now - lastFireTime.current < weaponConfig.fireRate) return;
    if (ammo <= 0) return;

    lastFireTime.current = now;
    setIsFiring(true);
    setTimeout(() => setIsFiring(false), 50);

    // Recoil effect
    if (gunRef.current) {
        gunRef.current.position.z += 0.15;
        gunRef.current.rotation.x -= 0.1;
    }

    // Shooting logic
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        const hit = intersects[0];
        const blockId = hit.object.userData?.id;
        const type = hit.object.userData?.type;
        const weaponConfig = WEAPONS[currentWeapon];
        
        if (currentWeapon === 'rocket') {
            const impactPos = hit.point;
            triggerExplosion([impactPos.x, impactPos.y, impactPos.z], 5, weaponConfig.damage);
            onFire();
            return;
        }

        if (blockId) {
            if (type === 'enemy') {
                removeBlock(blockId);
                onFire(blockId);
            } else if (type === 'player' && mode === 'pvp') {
                damagePlayer(blockId, weaponConfig.damage);
                onFire(blockId);
            } else {
                removeBlock(blockId);
                onFire(blockId);
            }
        } else {
            onFire();
        }
    } else {
        onFire();
    }
  };

  useFrame((state, delta) => {
    if (isDead) {
        velocity.current.set(0, 0, 0);
        return;
    }
    const { forward, backward, left, right, jump } = {
      forward: keys.current['KeyW'],
      backward: keys.current['KeyS'],
      left: keys.current['KeyA'],
      right: keys.current['KeyD'],
      jump: keys.current['Space'],
    };

    // Movement
    const speed = 25; // Increased base speed for smoother acceleration
    direction.current.z = Number(forward) - Number(backward);
    direction.current.x = Number(right) - Number(left);
    direction.current.normalize();

    if (forward || backward) velocity.current.z -= direction.current.z * speed * delta;
    if (left || right) velocity.current.x -= direction.current.x * speed * delta;

    camera.position.x += velocity.current.x * delta;
    camera.position.z += velocity.current.z * delta;

    velocity.current.multiplyScalar(0.85); // Slightly more friction for control

    // Head Bobbing
    const isMoving = forward || backward || left || right;
    if (isMoving && !isAds) {
        headBobActive.current += delta * 10;
        camera.position.y = 1.7 + Math.sin(headBobActive.current) * 0.05;
    } else {
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.7, 0.1);
    }

    // ADS Interpolation
    const targetAdsFactor = isAds ? 1 : 0;
    adsFactor.current = THREE.MathUtils.lerp(adsFactor.current, targetAdsFactor, 0.2);
    
    // FOV adjustment
    const baseFov = 75;
    const adsFov = 40;
    if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = THREE.MathUtils.lerp(baseFov, adsFov, adsFactor.current);
        camera.updateProjectionMatrix();
    }

    // Send update to server
    onUpdate(
      [camera.position.x, camera.position.y, camera.position.z],
      [camera.rotation.x, camera.rotation.y, camera.rotation.z],
      isAds
    );

    // Gun positioning (follow camera)
    if (gunRef.current) {
      // Smoothly follow camera
      const targetPos = camera.position.clone();
      gunRef.current.position.lerp(targetPos, 0.4);
      
      // Smoothly match rotation
      const targetQuat = camera.quaternion.clone();
      gunRef.current.quaternion.slerp(targetQuat, 0.4);

      // Offset to right/bottom (interpolated for ADS)
      const offsetX = THREE.MathUtils.lerp(0.4, 0, adsFactor.current);
      const offsetY = THREE.MathUtils.lerp(-0.35, -0.2, adsFactor.current);
      const offsetZ = THREE.MathUtils.lerp(-0.6, -0.4, adsFactor.current);

      gunRef.current.translateX(offsetX);
      gunRef.current.translateY(offsetY);
      gunRef.current.translateZ(offsetZ);
      
      // Idle sway (breathing) - reduced in ADS
      const swayScale = 1 - adsFactor.current * 0.8;
      gunRef.current.position.y += Math.sin(state.clock.elapsedTime * 1.5) * 0.003 * swayScale;
      gunRef.current.position.x += Math.cos(state.clock.elapsedTime * 0.75) * 0.002 * swayScale;

      // Movement sway - reduced in ADS
      if (isMoving) {
          gunRef.current.position.y += Math.sin(headBobActive.current) * 0.01 * swayScale;
          gunRef.current.position.x += Math.cos(headBobActive.current * 0.5) * 0.01 * swayScale;
      }

      // Mouse sway (lag behind)
      gunRef.current.position.x -= gunSway.current.x * 0.5;
      gunRef.current.position.y += gunSway.current.y * 0.5;
      gunSway.current.multiplyScalar(0.9); // Decay sway
      
      // Recoil recovery
      if (!isFiring) {
          // Handled by lerp/slerp above mostly, but can add extra recovery if needed
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
        {currentWeapon === 'rocket' ? (
            <group rotation={[Math.PI / 2, 0, 0]}>
                {/* Rocket Launcher Tube */}
                <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.15, 0.15, 1.2, 8]} />
                    <meshStandardMaterial color="#444" />
                </mesh>
                {/* Shoulder Rest */}
                <mesh position={[0, -0.5, 0.1]}>
                    <boxGeometry args={[0.2, 0.2, 0.2]} />
                    <meshStandardMaterial color="#222" />
                </mesh>
            </group>
        ) : (
            <>
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
            </>
        )}
        {/* Muzzle Flash */}
        {isFiring && (
          <pointLight position={[0, 0, -0.6]} intensity={5} distance={2} color="#facc15" />
        )}
      </group>
    </>
  );
};

export default Player;