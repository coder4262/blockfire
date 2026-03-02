
import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { Block, BlockType, WeaponType } from '../types';
import { WEAPONS } from '../constants';

const INITIAL_BLOCKS: Block[] = [
  { id: nanoid(), pos: [0, 0, -5], type: 'target' },
  { id: nanoid(), pos: [2, 1, -8], type: 'target' },
  { id: nanoid(), pos: [-2, 2, -10], type: 'target' },
  { id: nanoid(), pos: [5, 0, -12], type: 'target' },
  { id: nanoid(), pos: [-4, 0, -6], type: 'target' },
];

export const useStore = () => {
  const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS);
  const [score, setScore] = useState(0);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('pistol');
  const [ammo, setAmmo] = useState<Record<WeaponType, number>>({
    pistol: WEAPONS.pistol.maxAmmo,
    rifle: WEAPONS.rifle.maxAmmo,
    sniper: WEAPONS.sniper.maxAmmo,
  });

  const addBlock = useCallback((x: number, y: number, z: number, type: BlockType = 'grass') => {
    setBlocks(prev => [...prev, { id: nanoid(), pos: [x, y, z], type }]);
  }, []);

  const removeBlock = useCallback((id: string) => {
    setBlocks(prev => {
        const block = prev.find(b => b.id === id);
        if (block?.type === 'target') setScore(s => s + 100);
        return prev.filter(b => b.id !== id);
    });
  }, []);

  const fireWeapon = useCallback(() => {
    setAmmo(prev => {
        if (prev[currentWeapon] <= 0) return prev;
        return { ...prev, [currentWeapon]: prev[currentWeapon] - 1 };
    });
  }, [currentWeapon]);

  const reloadWeapon = useCallback(() => {
    setAmmo(prev => ({ ...prev, [currentWeapon]: WEAPONS[currentWeapon].maxAmmo }));
  }, [currentWeapon]);

  const switchWeapon = useCallback((type: WeaponType) => {
    setCurrentWeapon(type);
  }, []);

  const resetBlocks = useCallback(() => {
    setBlocks(INITIAL_BLOCKS);
    setScore(0);
  }, []);

  return {
    blocks,
    addBlock,
    removeBlock,
    score,
    currentWeapon,
    ammo,
    fireWeapon,
    reloadWeapon,
    switchWeapon,
    resetBlocks,
  };
};
