
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
  },
  ak47: {
    name: 'AK-47-Voxel',
    type: 'ak47',
    ammo: 30,
    maxAmmo: 30,
    fireRate: 120,
    damage: 25,
    recoil: 0.04,
  },
  awm: {
    name: 'AWM-Voxel',
    type: 'awm',
    ammo: 5,
    maxAmmo: 5,
    fireRate: 1500,
    damage: 150,
    recoil: 0.25,
  },
  shotgun: {
    name: 'SG-8-Voxel',
    type: 'shotgun',
    ammo: 8,
    maxAmmo: 8,
    fireRate: 800,
    damage: 60,
    recoil: 0.15,
  },
  smg: {
    name: 'SMG-Voxel-X',
    type: 'smg',
    ammo: 45,
    maxAmmo: 45,
    fireRate: 60,
    damage: 8,
    recoil: 0.02,
  },
  rocket: {
    name: 'RL-Voxel-99',
    type: 'rocket',
    ammo: 1,
    maxAmmo: 1,
    fireRate: 2000,
    damage: 200,
    recoil: 0.3,
  }
};

export const BLOCK_COLORS: Record<string, string> = {
  grass: '#4ade80',
  dirt: '#78350f',
  stone: '#71717a',
  wood: '#92400e',
  glass: '#bfdbfe',
  target: '#ef4444',
  sandbag: '#d4d4d8',
};
