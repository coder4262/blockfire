
export type BlockType = 'grass' | 'dirt' | 'stone' | 'wood' | 'glass' | 'target';

export interface Block {
  id: string;
  pos: [number, number, number];
  type: BlockType;
}

export type WeaponType = 'pistol' | 'rifle' | 'sniper';

export interface Weapon {
  name: string;
  type: WeaponType;
  ammo: number;
  maxAmmo: number;
  fireRate: number; // ms
  damage: number;
  recoil: number;
}

export interface GameState {
  blocks: Block[];
  score: number;
  currentWeapon: WeaponType;
  ammo: Record<WeaponType, number>;
  isPaused: boolean;
  isGameOver: boolean;
}
