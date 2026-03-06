import { useState, useCallback, useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';
import { Block, BlockType, WeaponType, Player, GameMessage, Enemy } from '../types';
import { WEAPONS } from '../constants';

export const useStore = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [enemies, setEnemies] = useState<Record<string, Enemy>>({});
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<'pvp' | 'pvai'>('pvai');
  const [health, setHealth] = useState(100);
  const [isDead, setIsDead] = useState(false);
  const [lastDamageTime, setLastDamageTime] = useState(0);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('pistol');
  const [ammo, setAmmo] = useState<Record<WeaponType, number>>({
    pistol: WEAPONS.pistol.maxAmmo,
    rifle: WEAPONS.rifle.maxAmmo,
    sniper: WEAPONS.sniper.maxAmmo,
    ak47: WEAPONS.ak47.maxAmmo,
    awm: WEAPONS.awm.maxAmmo,
  });
  const [myId, setMyId] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const message: GameMessage = JSON.parse(event.data);
      const { type, payload, senderId } = message;

      switch (type) {
        case 'init':
          setMyId(payload.id);
          setBlocks(payload.blocks);
          setPlayers(payload.players);
          setEnemies(payload.enemies || {});
          setScore(payload.score);
          setMode(payload.mode || 'pvai');
          break;
        case 'player_update':
          if (senderId) {
            setPlayers(prev => ({ ...prev, [senderId]: payload }));
          } else if (payload.id === myId) {
            // Server-forced update (e.g. respawn)
            setHealth(payload.health);
            setIsDead(false);
          }
          break;
        case 'player_damage':
          if (payload.id === myId) {
            setHealth(payload.health);
            setLastDamageTime(Date.now());
          } else {
            setPlayers(prev => {
              if (!prev[payload.id]) return prev;
              return { ...prev, [payload.id]: { ...prev[payload.id], health: payload.health } };
            });
          }
          break;
        case 'player_death':
          if (payload === myId) {
            setIsDead(true);
            setHealth(0);
          } else {
            setPlayers(prev => {
              const next = { ...prev };
              if (next[payload]) next[payload].health = 0;
              return next;
            });
          }
          break;
        case 'player_leave':
          setPlayers(prev => {
            const next = { ...prev };
            delete next[payload];
            return next;
          });
          break;
        case 'block_add':
          setBlocks(prev => [...prev, payload]);
          break;
        case 'block_remove':
          setBlocks(prev => prev.filter(b => b.id !== payload));
          break;
        case 'enemy_spawn':
          setEnemies(prev => ({ ...prev, [payload.id]: payload }));
          break;
        case 'enemy_update':
          setEnemies(prev => {
            const next = { ...prev };
            payload.forEach((e: Enemy) => {
              if (next[e.id]) {
                next[e.id] = { ...next[e.id], ...e };
              } else {
                next[e.id] = e;
              }
            });
            return next;
          });
          break;
        case 'enemy_fire':
          setEnemies(prev => {
            if (!prev[payload.enemyId]) return prev;
            return {
              ...prev,
              [payload.enemyId]: { ...prev[payload.enemyId], lastFire: Date.now() }
            };
          });
          break;
        case 'enemy_death':
          setEnemies(prev => {
            const next = { ...prev };
            delete next[payload];
            return next;
          });
          break;
        case 'fire':
          if (senderId && senderId !== myId) {
            setPlayers(prev => {
              if (!prev[senderId]) return prev;
              return {
                ...prev,
                [senderId]: { ...prev[senderId], lastFire: Date.now() }
              };
            });
          }
          break;
        case 'score_update':
          setScore(payload);
          break;
        case 'mode_change':
          setMode(payload);
          break;
        case 'explosion':
          // We could trigger a local effect here if we had an effect system
          break;
      }
    };

    return () => {
      socket.close();
    };
  }, []); // Only run on mount

  const sendMessage = useCallback((type: string, payload: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  const updateMyPlayer = useCallback((pos: [number, number, number], rot: [number, number, number], isAds: boolean = false) => {
    if (!myId) return;
    sendMessage('player_update', { pos, rot, currentWeapon, isAds });
  }, [myId, currentWeapon, sendMessage]);

  const addBlock = useCallback((x: number, y: number, z: number, type: BlockType = 'grass') => {
    sendMessage('block_add', { pos: [x, y, z], type });
  }, [sendMessage]);

  const removeBlock = useCallback((id: string) => {
    sendMessage('block_remove', id);
  }, [sendMessage]);

  const fireWeapon = useCallback(() => {
    setAmmo(prev => {
        if (prev[currentWeapon] <= 0) return prev;
        sendMessage('fire', { weapon: currentWeapon });
        return { ...prev, [currentWeapon]: prev[currentWeapon] - 1 };
    });
  }, [currentWeapon, sendMessage]);

  const reloadWeapon = useCallback(() => {
    setAmmo(prev => ({ ...prev, [currentWeapon]: WEAPONS[currentWeapon].maxAmmo }));
  }, [currentWeapon]);

  const switchWeapon = useCallback((type: WeaponType) => {
    setCurrentWeapon(type);
  }, []);

  const switchMode = useCallback((newMode: 'pvp' | 'pvai') => {
    sendMessage('mode_change', newMode);
  }, [sendMessage]);

  const damagePlayer = useCallback((id: string, damage: number) => {
    sendMessage('player_damage', { id, damage });
  }, [sendMessage]);

  const triggerExplosion = useCallback((pos: [number, number, number], radius: number, damage: number) => {
    sendMessage('explosion', { pos, radius, damage });
  }, [sendMessage]);

  return {
    blocks,
    players,
    enemies,
    myId,
    addBlock,
    removeBlock,
    score,
    mode,
    health,
    isDead,
    lastDamageTime,
    currentWeapon,
    ammo,
    fireWeapon,
    reloadWeapon,
    switchWeapon,
    switchMode,
    damagePlayer,
    triggerExplosion,
    updateMyPlayer,
  };
};
