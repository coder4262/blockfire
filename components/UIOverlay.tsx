
import React, { useEffect, useState } from 'react';
import { WeaponType } from '../types';
import { WEAPONS } from '../constants';
import { getTacticalBriefing } from '../services/geminiService';

interface UIOverlayProps {
  score: number;
  currentWeapon: WeaponType;
  ammo: Record<WeaponType, number>;
  onSwitchWeapon: (type: WeaponType) => void;
  onReload: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ score, currentWeapon, ammo, onSwitchWeapon, onReload }) => {
  const [briefing, setBriefing] = useState("Initializing tactical interface...");
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  useEffect(() => {
    const updateBriefing = async () => {
      setLoadingBriefing(true);
      const msg = await getTacticalBriefing(score, WEAPONS[currentWeapon].name);
      setBriefing(msg);
      setLoadingBriefing(false);
    };

    const interval = setInterval(updateBriefing, 30000); // Every 30s
    updateBriefing();
    return () => clearInterval(interval);
  }, [score, currentWeapon]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 select-none font-mono text-white">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="bg-black/60 p-4 border-l-4 border-red-600 backdrop-blur-md">
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">BlockFire</h1>
          <p className="text-red-400 text-xs">VOXEL WARFARE v1.0.4</p>
        </div>
        
        <div className="bg-black/60 p-4 border-r-4 border-blue-500 backdrop-blur-md text-right">
          <div className="text-sm text-blue-400 uppercase">Score</div>
          <div className="text-3xl font-bold font-mono tracking-widest">{score.toLocaleString().padStart(6, '0')}</div>
        </div>
      </div>

      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-8 h-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-white/80"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-white/80"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-white/80"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-white/80"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-between items-end gap-4">
        {/* Tactical Briefing */}
        <div className="max-w-md bg-black/80 p-4 border-b-4 border-yellow-500 backdrop-blur-lg">
          <div className="flex items-center gap-2 mb-1 text-xs text-yellow-500 font-bold uppercase">
            <i className="fas fa-satellite-dish animate-pulse"></i>
            Tactical Feed
          </div>
          <p className={`text-sm ${loadingBriefing ? 'opacity-50' : 'opacity-100'} transition-opacity italic`}>
            &gt; {briefing}
          </p>
        </div>

        {/* Weapons and Ammo */}
        <div className="flex flex-col gap-4 items-end pointer-events-auto">
          <div className="flex gap-2">
            {(['pistol', 'rifle', 'sniper'] as WeaponType[]).map((type) => (
              <button
                key={type}
                onClick={() => onSwitchWeapon(type)}
                className={`p-3 w-32 border-2 transition-all backdrop-blur-md ${
                  currentWeapon === type 
                    ? 'bg-red-600/40 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                    : 'bg-black/40 border-white/20 text-white/40 hover:border-white/40'
                }`}
              >
                <div className="text-[10px] uppercase font-bold mb-1 opacity-60">Slot {type === 'pistol' ? '1' : type === 'rifle' ? '2' : '3'}</div>
                <div className="text-sm font-black truncate">{WEAPONS[type].name}</div>
              </button>
            ))}
          </div>

          <div className="bg-black/80 p-6 border-b-8 border-red-600 w-full max-w-xs backdrop-blur-xl">
             <div className="flex justify-between items-end">
                <div>
                    <div className="text-xs text-red-400 uppercase font-black mb-1">Munitions</div>
                    <div className="text-5xl font-black font-mono tracking-tighter flex items-baseline gap-2">
                        <span>{ammo[currentWeapon]}</span>
                        <span className="text-xl text-white/30">/ {WEAPONS[currentWeapon].maxAmmo}</span>
                    </div>
                </div>
                <button 
                    onClick={onReload}
                    className="bg-white/10 hover:bg-white/20 px-3 py-1 text-[10px] font-bold uppercase border border-white/20"
                >
                    Reload (R)
                </button>
             </div>
             <div className="mt-4 h-2 bg-white/10 overflow-hidden">
                <div 
                    className="h-full bg-red-600 transition-all duration-300" 
                    style={{ width: `${(ammo[currentWeapon] / WEAPONS[currentWeapon].maxAmmo) * 100}%` }}
                ></div>
             </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-24 left-6 text-[10px] text-white/40 bg-black/20 p-2 border border-white/10">
        [W/A/S/D] MOVE <br/>
        [SPACE] JUMP <br/>
        [LMB] FIRE <br/>
        [RMB] BUILD <br/>
        [1-3] SWAP <br/>
        [R] RELOAD <br/>
        [ESC] UNLOCK MOUSE
      </div>
    </div>
  );
};

export default UIOverlay;
