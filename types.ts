
export type BlockType = 'grass' | 'dirt' | 'stone' | 'wood' | 'glass' | 'target' | 'sandbag';

export type GameMode = 'pvp' | 'pvai';

export interface Block {
  id: string;
  pos: [number, number, number];
  type: BlockType;
}

export type WeaponType = 'pistol' | 'rifle' | 'sniper' | 'ak47' | 'awm' | 'shotgun' | 'smg' | 'rocket';

export interface Enemy {
  id: string;
  pos: [number, number, number];
  rot: [number, number, number];
  health: number;
  weapon: WeaponType;
  lastFire: number;
}

export interface Projectile {
  id: string;
  pos: [number, number, number];
  vel: [number, number, number];
  ownerId: string;
  type: WeaponType;
}

export interface Weapon {
  name: string;
  type: WeaponType;
  ammo: number;
  maxAmmo: number;
  fireRate: number; // ms
  damage: number;
  recoil: number;
}

export interface Player {
  id: string;
  pos: [number, number, number];
  rot: [number, number, number];
  currentWeapon: WeaponType;
  health: number;
  lastUpdate: number;
  lastFire?: number;
}

export type MessageType = 
  | 'init' 
  | 'player_update' 
  | 'player_join' 
  | 'player_leave' 
  | 'block_add' 
  | 'block_remove' 
  | 'fire' 
  | 'score_update'
  | 'player_damage'
  | 'player_death'
  | 'enemy_spawn'
  | 'enemy_update'
  | 'enemy_fire'
  | 'enemy_death'
  | 'mode_change'
  | 'explosion';

export interface GameMessage {
  type: MessageType;
  payload: any;
  senderId?: string;
}

export interface GameState {
  blocks: Block[];
  players: Record<string, Player>;
  enemies: Record<string, Enemy>;
  projectiles: Projectile[];
  score: number;
  mode: GameMode;
}
