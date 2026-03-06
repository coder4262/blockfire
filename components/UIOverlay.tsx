
import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { WeaponType } from '../types';
import { WEAPONS } from '../constants';
import { getTacticalBriefing } from '../services/geminiService';

interface UIOverlayProps {
  score: number;
  health: number;
  isDead: boolean;
  lastDamageTime: number;
  mode: 'pvp' | 'pvai';
  currentWeapon: WeaponType;
  ammo: Record<WeaponType, number>;
  onSwitchWeapon: (type: WeaponType) => void;
  onReload: () => void;
  onSwitchMode: (mode: 'pvp' | 'pvai') => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  score, 
  health, 
  isDead, 
  lastDamageTime, 
  mode,
  currentWeapon, 
  ammo, 
  onSwitchWeapon, 
  onReload,
  onSwitchMode
}) => {
  const [briefing, setBriefing] = useState("Initializing tactical interface...");
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [showVignette, setShowVignette] = useState(false);
  const [displayedHealth, setDisplayedHealth] = useState(health);
  const [displayedScore, setDisplayedScore] = useState(score);

  useEffect(() => {
    const timer = setInterval(() => {
        setDisplayedHealth(prev => THREE.MathUtils.lerp(prev, health, 0.1));
        setDisplayedScore(prev => Math.floor(THREE.MathUtils.lerp(prev, score, 0.1)));
    }, 16);
    return () => clearInterval(timer);
  }, [health, score]);

  useEffect(() => {
    if (lastDamageTime > 0) {
      setShowVignette(true);
      const timer = setTimeout(() => setShowVignette(false), 200);
      return () => clearTimeout(timer);
    }
  }, [lastDamageTime]);

  useEffect(() => {
    const updateBriefing = async () => {
      setIsBriefingLoading(true);
      const msg = await getTacticalBriefing(score, WEAPONS[currentWeapon].name);
      setBriefing(msg);
      setIsBriefingLoading(false);
    };

    const interval = setInterval(updateBriefing, 30000); // Every 30s
    updateBriefing();
    return () => clearInterval(interval);
  }, [score, currentWeapon]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 select-none font-mono text-white">
      {/* Damage Vignette */}
      <div 
        className={`absolute inset-0 bg-red-600/20 transition-opacity duration-200 pointer-events-none ${showVignette ? 'opacity-100' : 'opacity-0'}`}
        style={{ boxShadow: 'inset 0 0 150px rgba(220, 38, 38, 0.5)' }}
      />

      {/* Death Screen */}
      {isDead && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] pointer-events-auto">
            <h2 className="text-7xl font-black italic text-red-600 mb-4 animate-pulse">Wasted</h2>
            <p className="text-white/60 uppercase tracking-widest">Re-deploying in 3 seconds...</p>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="bg-black/60 p-4 border-l-4 border-red-600 backdrop-blur-md">
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">BlockFire</h1>
          <p className="text-red-400 text-xs">VOXEL WARFARE v1.0.4</p>
        </div>
        
        <div className="bg-black/60 p-4 border-r-4 border-blue-500 backdrop-blur-md text-right">
          <div className="text-sm text-blue-400 uppercase">Score</div>
          <div className="text-3xl font-bold font-mono tracking-widest">{displayedScore.toLocaleString().padStart(6, '0')}</div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="absolute top-24 right-6 flex flex-col gap-2 pointer-events-auto">
        <div className="text-[10px] text-white/40 uppercase font-bold text-right">Game Mode</div>
        <div className="flex gap-1">
            <button 
                onClick={() => onSwitchMode('pvai')}
                className={`px-4 py-1 text-xs font-bold uppercase transition-all border ${mode === 'pvai' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-black/40 border-white/10 text-white/40 hover:border-white/30'}`}
            >
                PvAI
            </button>
            <button 
                onClick={() => onSwitchMode('pvp')}
                className={`px-4 py-1 text-xs font-bold uppercase transition-all border ${mode === 'pvp' ? 'bg-red-600 border-red-400 text-white' : 'bg-black/40 border-white/10 text-white/40 hover:border-white/30'}`}
            >
                PvP
            </button>
        </div>
      </div>

      {/* Health Bar */}
      <div className="absolute bottom-40 left-6 w-64 pointer-events-auto">
        <div className="flex justify-between items-end mb-1">
            <div className="text-xs font-black uppercase text-red-500">Vitality</div>
            <div className="text-xl font-black">{Math.round(displayedHealth)}%</div>
        </div>
        <div className="h-4 bg-black/60 border border-white/10 p-0.5">
            <div 
                className={`h-full transition-all duration-300 ${displayedHealth < 30 ? 'bg-red-600 animate-pulse' : 'bg-red-500'}`}
                style={{ width: `${displayedHealth}%` }}
            />
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
          <p className={`text-sm ${isBriefingLoading ? 'opacity-50' : 'opacity-100'} transition-opacity italic`}>
            &gt; {briefing}
          </p>
        </div>

        {/* Weapons and Ammo */}
        <div className="flex flex-col gap-4 items-end pointer-events-auto">
          <div className="flex gap-2 flex-wrap justify-end max-w-2xl">
            {(['pistol', 'rifle', 'sniper', 'ak47', 'awm', 'shotgun', 'smg', 'rocket'] as WeaponType[]).map((type, index) => (
              <button
                key={type}
                onClick={() => onSwitchWeapon(type)}
                className={`p-3 w-24 border-2 transition-all backdrop-blur-md mb-2 ${
                  currentWeapon === type 
                    ? 'bg-red-600/40 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                    : 'bg-black/40 border-white/20 text-white/40 hover:border-white/40'
                }`}
              >
                <div className="text-[10px] uppercase font-bold mb-1 opacity-60">Slot {index + 1}</div>
                <div className="text-[10px] font-black truncate">{WEAPONS[type].name}</div>
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
        [1-8] SWAP <br/>
        [R] RELOAD <br/>
        [ESC] UNLOCK MOUSE
      </div>
    </div>
  );
};

export default UIOverlay;
