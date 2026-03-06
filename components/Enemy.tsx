import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Enemy } from '../types';

interface EnemyComponentProps {
  enemy: Enemy;
}

const EnemyComponent: React.FC<EnemyComponentProps> = ({ enemy }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [isFiring, setIsFiring] = useState(false);

  useEffect(() => {
    if (enemy.lastFire) {
      setIsFiring(true);
      const timer = setTimeout(() => setIsFiring(false), 50);
      return () => clearTimeout(timer);
    }
  }, [enemy.lastFire]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.lerp(new THREE.Vector3(...enemy.pos), 0.1);
      meshRef.current.rotation.set(...enemy.rot);
    }
  });

  return (
    <group ref={meshRef} name={enemy.id} userData={{ type: 'enemy', id: enemy.id }}>
      {/* Body */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.6, 1.8, 0.6]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.9, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#f87171" />
      </mesh>

      {/* Weapon representation */}
      <mesh position={[0.4, 1.2, -0.4]}>
        <boxGeometry args={enemy.weapon === 'awm' ? [0.1, 0.1, 1.2] : [0.1, 0.1, 0.8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      {/* Health Bar */}
      <mesh position={[0, 2.3, 0]}>
        <planeGeometry args={[0.8, 0.1]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh position={[-(0.8 * (1 - enemy.health / 100)) / 2, 2.3, 0.01]}>
        <planeGeometry args={[0.8 * (enemy.health / 100), 0.1]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* Muzzle Flash */}
      {isFiring && (
        <pointLight position={[0.4, 1.2, -1.2]} intensity={10} distance={5} color="#fbbf24" />
      )}
    </group>
  );
};

export default EnemyComponent;
