
import React, { useEffect } from 'react';
import Game from './components/Game';
import UIOverlay from './components/UIOverlay';
import { useStore } from './hooks/useStore';
import { WeaponType } from './types';

const App: React.FC = () => {
  const { 
    score, 
    currentWeapon, 
    ammo, 
    switchWeapon, 
    reloadWeapon 
  } = useStore();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '1') switchWeapon('pistol');
      if (e.key === '2') switchWeapon('rifle');
      if (e.key === '3') switchWeapon('sniper');
      if (e.key === '4') switchWeapon('ak47');
      if (e.key === '5') switchWeapon('awm');
      if (e.key === 'r' || e.key === 'R') reloadWeapon();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [switchWeapon, reloadWeapon]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Game Layer */}
      <div className="absolute inset-0">
        <Game />
      </div>

      {/* UI Overlay */}
      <UIOverlay 
        score={score} 
        currentWeapon={currentWeapon} 
        ammo={ammo}
        onSwitchWeapon={switchWeapon}
        onReload={reloadWeapon}
      />

      {/* Start Prompt overlay if not locked */}
      <div 
        id="instructions-overlay"
        className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity pointer-events-none opacity-0"
        style={{ pointerEvents: 'none' }}
      >
        <div className="text-center p-12 border-4 border-red-600 bg-black max-w-lg">
            <h2 className="text-5xl font-black italic mb-4 text-white">CLICK TO DEPLOY</h2>
            <p className="text-red-400 mb-8 uppercase tracking-widest text-sm">Secure the perimeter. Eliminate block targets.</p>
            <div className="grid grid-cols-2 gap-4 text-white/60 text-xs uppercase font-bold text-left">
                <div>[WASD] Movement</div>
                <div>[LMB] Fire Weapon</div>
                <div>[RMB] Place Block</div>
                <div>[1-6] Switch Slot</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;
