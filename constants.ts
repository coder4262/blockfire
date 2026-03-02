
import { Weapon, WeaponType } from './types';

export const WEAPONS: Record<WeaponType, Weapon> = {
  pistol: {
    name: 'P1-Voxel',
    type: 'pistol',
    ammo: 12,
    maxAmmo: 12,
    fireRate: 400,
    damage: 20,
    recoil: 0.05,
  },
  rifle: {
    name: 'AR-Block',
    type: 'rifle',
    ammo: 30,
    maxAmmo: 30,
    fireRate: 100,
    damage: 15,
    recoil: 0.03,
  },
  sniper: {
    name: 'S-Voxel-7',
    type: 'sniper',
    ammo: 5,
    maxAmmo: 5,
    fireRate: 1200,
    damage: 100,
    recoil: 0.2,
  }
};

export const BLOCK_COLORS: Record<string, string> = {
  grass: '#4ade80',
  dirt: '#78350f',
  stone: '#71717a',
  wood: '#92400e',
  glass: '#bfdbfe',
  target: '#ef4444',
};
