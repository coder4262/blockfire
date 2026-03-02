
import React, { useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { BLOCK_COLORS } from '../constants';
import { BlockType } from '../types';

interface CubeProps {
  position: [number, number, number];
  type: BlockType;
  id: string;
  removeBlock: (id: string) => void;
  addBlock: (x: number, y: number, z: number) => void;
}

const Cube: React.FC<CubeProps> = ({ position, type, id, removeBlock, addBlock }) => {
  const [hovered, setHovered] = useState(false);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const { x, y, z } = e.point;
    const clickedFace = Math.floor(e.faceIndex! / 2);

    if (e.button === 0) { // Left click: Break or Shoot
       // Handled via Raycaster in Player for shooting
    } else if (e.button === 2) { // Right click: Build
      const [px, py, pz] = position;
      if (clickedFace === 0) addBlock(px + 1, py, pz);
      else if (clickedFace === 1) addBlock(px - 1, py, pz);
      else if (clickedFace === 2) addBlock(px, py + 1, pz);
      else if (clickedFace === 3) addBlock(px, py - 1, pz);
      else if (clickedFace === 4) addBlock(px, py, pz + 1);
      else if (clickedFace === 5) addBlock(px, py, pz - 1);
    }
  };

  return (
    <mesh
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onPointerDown={handleClick}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={hovered ? '#fff' : BLOCK_COLORS[type] || '#fff'}
        transparent={type === 'glass'}
        opacity={type === 'glass' ? 0.6 : 1.0}
        map={null} // Simplified for demo
      />
    </mesh>
  );
};

export default Cube;
