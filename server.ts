import express from 'express';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import { nanoid } from 'nanoid';
import { Block, Player, GameMessage, Enemy, WeaponType } from './types';

const PORT = 3000;

async function startServer() {
  const app = express();
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  const wss = new WebSocketServer({ server });

  // Initial state
  let blocks: Block[] = [
    { id: nanoid(), pos: [0, 0, -5], type: 'target' },
    { id: nanoid(), pos: [2, 1, -8], type: 'target' },
    { id: nanoid(), pos: [-2, 2, -10], type: 'target' },
    { id: nanoid(), pos: [5, 0, -12], type: 'target' },
    { id: nanoid(), pos: [-4, 0, -6], type: 'target' },
  ];
  let players: Record<string, Player> = {};
  let enemies: Record<string, Enemy> = {};
  let score = 0;

  const broadcast = (message: GameMessage, excludeId?: string) => {
    const data = JSON.stringify(message);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        if (excludeId && (client as any).id === excludeId) return;
        client.send(data);
      }
    });
  };

  // Enemy Spawner
  const spawnEnemyNest = () => {
    const x = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40 - 20;
    const y = 0;

    // Create sandbags
    const nestBlocks: Block[] = [
      { id: nanoid(), pos: [x - 1, y, z - 1], type: 'sandbag' },
      { id: nanoid(), pos: [x, y, z - 1], type: 'sandbag' },
      { id: nanoid(), pos: [x + 1, y, z - 1], type: 'sandbag' },
      { id: nanoid(), pos: [x - 1, y + 1, z - 1], type: 'sandbag' },
      { id: nanoid(), pos: [x + 1, y + 1, z - 1], type: 'sandbag' },
    ];

    blocks.push(...nestBlocks);
    nestBlocks.forEach(b => broadcast({ type: 'block_add', payload: b }));

    const enemyId = nanoid();
    const weapon: WeaponType = Math.random() > 0.5 ? 'ak47' : 'awm';
    enemies[enemyId] = {
      id: enemyId,
      pos: [x, y, z],
      rot: [0, 0, 0],
      health: 100,
      weapon,
      lastFire: 0,
    };

    broadcast({ type: 'enemy_spawn', payload: enemies[enemyId] });
  };

  // Spawn initial nests
  for (let i = 0; i < 3; i++) spawnEnemyNest();

  // Enemy AI Loop
  setInterval(() => {
    const playerIds = Object.keys(players);
    if (playerIds.length === 0) return;

    Object.values(enemies).forEach(enemy => {
      // Find nearest player
      let nearestPlayer: Player | null = null;
      let minDist = Infinity;

      playerIds.forEach(id => {
        const p = players[id];
        const dist = Math.sqrt(
          Math.pow(p.pos[0] - enemy.pos[0], 2) +
          Math.pow(p.pos[2] - enemy.pos[2], 2)
        );
        if (dist < minDist) {
          minDist = dist;
          nearestPlayer = p;
        }
      });

      if (nearestPlayer && minDist < 30) {
        // Aim at player
        const dx = (nearestPlayer as Player).pos[0] - enemy.pos[0];
        const dz = (nearestPlayer as Player).pos[2] - enemy.pos[2];
        const angle = Math.atan2(dx, dz);
        enemy.rot[1] = angle;

        // Shoot
        const now = Date.now();
        const fireRate = enemy.weapon === 'ak47' ? 500 : 2000;
        if (now - enemy.lastFire > fireRate) {
          enemy.lastFire = now;
          broadcast({ 
            type: 'enemy_fire', 
            payload: { enemyId: enemy.id, weapon: enemy.weapon, targetPos: (nearestPlayer as Player).pos } 
          });
        }
      }
    });

    broadcast({ type: 'enemy_update', payload: Object.values(enemies) });
  }, 100);

  // Periodic Spawner
  setInterval(() => {
    if (Object.keys(enemies).length < 10) {
      spawnEnemyNest();
    }
  }, 10000);

  wss.on('connection', (ws: WebSocket) => {
    const id = nanoid();
    (ws as any).id = id;

    console.log(`Player joined: ${id}`);

    // Send initial state
    ws.send(JSON.stringify({
      type: 'init',
      payload: { id, blocks, players, enemies, score }
    }));

    ws.on('message', (data: string) => {
      try {
        const message: GameMessage = JSON.parse(data);
        message.senderId = id;

        switch (message.type) {
          case 'player_update':
            players[id] = { ...message.payload, id, lastUpdate: Date.now() };
            broadcast({ type: 'player_update', payload: players[id], senderId: id }, id);
            break;

          case 'block_add':
            const newBlock: Block = { ...message.payload, id: nanoid() };
            blocks.push(newBlock);
            broadcast({ type: 'block_add', payload: newBlock, senderId: id });
            break;

          case 'block_remove':
            const blockId = message.payload;
            
            // Check if it's an enemy being hit (if we use block_remove for enemies too)
            if (enemies[blockId]) {
                enemies[blockId].health -= 50;
                if (enemies[blockId].health <= 0) {
                    delete enemies[blockId];
                    score += 500;
                    broadcast({ type: 'enemy_death', payload: blockId });
                    broadcast({ type: 'score_update', payload: score });
                }
                return;
            }

            const blockIndex = blocks.findIndex(b => b.id === blockId);
            if (blockIndex !== -1) {
              const block = blocks[blockIndex];
              if (block.type === 'target') {
                score += 100;
                broadcast({ type: 'score_update', payload: score });
              }
              blocks.splice(blockIndex, 1);
              broadcast({ type: 'block_remove', payload: blockId, senderId: id });
            }
            break;

          case 'fire':
            broadcast({ type: 'fire', payload: message.payload, senderId: id }, id);
            break;
        }
      } catch (e) {
        console.error('Failed to parse message', e);
      }
    });

    ws.on('close', () => {
      console.log(`Player left: ${id}`);
      delete players[id];
      broadcast({ type: 'player_leave', payload: id, senderId: id });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }
}

startServer();
