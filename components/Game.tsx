import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars, Environment, ContactShadows } from '@react-three/drei';
import Player from './Player';
import Cube from './Cube';
import { useStore } from '../hooks/useStore';

const Game: React.FC = () => {
  const { blocks, addBlock, removeBlock, currentWeapon, ammo, fireWeapon, score } = useStore();

  return (
    <div className="w-full h-full bg-slate-900">
      <Canvas shadows>
        <Sky sunPosition={[100, 10, 100]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        
        <Suspense fallback={null}>
          <Player 
            onFire={fireWeapon} 
            currentWeapon={currentWeapon} 
            ammo={ammo[currentWeapon]} 
            blocks={blocks}
          />
          
          <group>
            {blocks.map(block => (
              /* Fix: explicitly pass position from block.pos to match CubeProps interface */
              <Cube 
                key={block.id} 
                id={block.id}
                type={block.type}
                position={block.pos}
                removeBlock={removeBlock} 
                addBlock={addBlock} 
              />
            ))}
          </group>

          {/* Infinite Floor Plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
          
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Game;