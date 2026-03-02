import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Player } from '../types';

interface OtherPlayerProps {
  player: Player;
}

const OtherPlayer: React.FC<OtherPlayerProps> = ({ player }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [isFiring, setIsFiring] = useState(false);

  useEffect(() => {
    if (player.lastFire) {
      setIsFiring(true);
      const timer = setTimeout(() => setIsFiring(false), 50);
      return () => clearTimeout(timer);
    }
  }, [player.lastFire]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.lerp(new THREE.Vector3(...player.pos), 0.1);
      meshRef.current.rotation.set(...player.rot);
    }
  });

  return (
    <group ref={meshRef}>
      {/* Body */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.6, 1.8, 0.6]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.9, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#60a5fa" />
      </mesh>

      {/* Gun representation for other player */}
      <mesh position={[0.4, 0.8, -0.4]}>
        <boxGeometry args={[0.1, 0.1, 0.6]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Muzzle Flash */}
      {isFiring && (
        <pointLight position={[0.4, 0.8, -1.0]} intensity={5} distance={2} color="#facc15" />
      )}
    </group>
  );
};

export default OtherPlayer;
