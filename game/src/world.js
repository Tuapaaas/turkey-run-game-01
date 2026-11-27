// world.js — the road ahead: stages, obstacle spawning, corn, haystacks,
// knives, ovens and collisions. The world scrolls left while the turkey
// stays near x=280; distance is measured in metres (50 px = 1 m).

import { GROUND_Y, W, drawFence, drawHayBale, drawHaystack, drawOven, drawKnife, drawCorn, drawPuddle, drawForestGate } from './art.js';
import { intBetween, pick } from './rng.js';

export const ESCAPE_DISTANCE_M = 1000; // reaching the forest gate wins
const PX_PER_M = 50;

function stageAt(distanceM) {
  if (distanceM < 300) return 0; // farmyard
  if (distanceM < 650) return 1; // barn
  return 2; // kitchen
}

function stageSpawnTable(stage) {
  if (stage === 0) return ['fence', 'fence', 'haybale', 'pumpkin', 'cornrow', 'haystack', 'cornrow', 'fence'];
  if (stage === 1) return ['fence', 'knife', 'haybale', 'knife', 'cornrow', 'haystack', 'fence', 'puddle', 'knife'];
  return ['oven', 'knife', 'oven', 'puddle', 'knife', 'cornrow', 'oven', 'haystack', 'knife'];
}

export class World {
  constructor(rng) {
    this.rng = rng;
    this.reset();
  }

  reset() {
    this.distanceM = 0;
    this.scroll = 0;
    this.items = []; // {kind, x, ...} x is world px; screen x = x - scroll
    this.nextSpawnM = 18;
    this.gateShown = false;
    this.speed = 320;
  }

  get stage() {
    return stageAt(this.distanceM);
  }

  /** Base run speed grows with distance, and the kitchen is fastest. */
  baseSpeed() {
    return 320 + Math.min(160, this.distanceM * 0.16);
  }

  spawnAhead() {
    while (this.nextSpawnM < this.distanceM + 30) {
      const table = stageSpawnTable(this.stage);
      const kind = pick(this.rng, table);
      const x = this.nextSpawnM * PX_PER_M;
      this.spawn(kind, x);
      const gap = intBetween(this.rng, 9, 16) + this.stage * 2;
      this.nextSpawnM += gap;
    }
  }

  spawn(kind, x) {
    if (kind === 'cornrow') {
      const n = intBetween(this.rng, 3, 5);
      for (let i = 0; i < n; i++) {
        this.items.push({ kind: 'corn', x: x + i * 44, y: GROUND_Y - 40 - (i % 2) * 40, taken: false });
      }
      return;
    }
    if (kind === 'knife') {
      this.items.push({ kind: 'knife', x, y: -30, vy: 0, angle: (this.rng() - 0.5) * 0.9, stuck: false });
      return;
    }
    const defs = {
      fence: { w: 74, h: 62 },
      haybale: { w: 64, h: 64 },
      pumpkin: { w: 56, h: 46 },
      haystack: { w: 110, h: 92 },
      oven: { w: 96, h: 110 },
      puddle: { w: 120, h: 12 },
    };
    const d = defs[kind];
    this.items.push({ kind, x, w: d.w, h: d.h });
  }

  /** Move the world; returns events for main.js (hits, pickups, escapes). */
  update(dt, turkey, farmer, sounds) {
    this.speed = this.baseSpeed() * (turkey.slowed ? 0.55 : 1);
    const stepPx = this.speed * dt;
    this.scroll += stepPx;
    this.distanceM = this.scroll / PX_PER_M;
    this.spawnAhead();

    const events = { hit: null, corn: 0, hid: false };
    const box = turkey.box();
    const now = performance.now();

    for (const it of this.items) {
      const sx = it.x - this.scroll;
      if (sx < -260 || sx > W + 400) continue;
      if (it.kind === 'corn') {
        if (!it.taken && Math.abs(sx - turkey.x) < 46 && Math.abs(it.y - (turkey.y - 44)) < 52) {
          it.taken = true;
          events.corn += 1;
          if (sounds) sounds.corn();
        }
        continue;
      }
      if (it.kind === 'knife') {
        if (!it.stuck) {
          // Hold still while off-screen: the knife drops only once the
          // turkey can see it coming, or it would land long before it arrives.
          if (sx < 1000) {
            it.vy += 1500 * dt;
            it.y += it.vy * dt;
          }
          if (it.y >= GROUND_Y - 8) {
            it.y = GROUND_Y - 8;
            it.stuck = true;
            it.stuckAt = now;
          }
        }
        // A knife hurts only while it is falling or freshly stuck.
        if (!it.stuck || now - (it.stuckAt || 0) < 500) {
          if (Math.abs(sx - turkey.x) < 34 && it.y > turkey.y - 110 && it.y < turkey.y + 6) {
            events.hit = 'knife';
          }
        }
        continue;
      }
      if (it.kind === 'haystack') {
        // Ducking inside a haystack hides the turkey from the farmer.
        if (turkey.ducking && sx - 10 < turkey.x && turkey.x < sx + it.w + 10) {
          if (!turkey.hidden) events.hid = true;
          turkey.hidden = true;
        }
        continue;
      }
      if (it.kind === 'puddle') {
        if (turkey.onGround && sx < turkey.x + 20 && turkey.x < sx + it.w) {
          turkey.slowUntil = now + 700;
        }
        continue;
      }
      // Solid obstacles: fence, hay bale, pumpkin, oven.
      const top = GROUND_Y - it.h;
      const overlapX = box.x + box.w > sx && box.x < sx + it.w;
      const overlapY = box.y + box.h > top + 6 && box.y < GROUND_Y;
      if (overlapX && overlapY && !turkey.invulnerable) {
        events.hit = it.kind;
      }
    }
    // Drop items far behind.
    this.items = this.items.filter((it) => it.x - this.scroll > -300);
    return events;
  }

  draw(ctx, t) {
    // Forest gate stands at the 1000 m mark.
    const gateX = ESCAPE_DISTANCE_M * PX_PER_M - this.scroll;
    if (gateX > -240 && gateX < W + 240) {
      drawForestGate(ctx, gateX, GROUND_Y);
    }
    for (const it of this.items) {
      const sx = it.x - this.scroll;
      if (sx < -260 || sx > W + 260) continue;
      if (it.kind === 'corn') {
        if (!it.taken) drawCorn(ctx, sx, it.y, t);
      } else if (it.kind === 'knife') {
        drawKnife(ctx, sx, it.y, it.angle);
      } else if (it.kind === 'fence') {
        drawFence(ctx, sx, GROUND_Y, it.w, it.h);
      } else if (it.kind === 'haybale') {
        drawHayBale(ctx, sx, GROUND_Y, it.w / 2);
      } else if (it.kind === 'haystack') {
        drawHaystack(ctx, sx, GROUND_Y, it.w, it.h);
      } else if (it.kind === 'oven') {
        drawOven(ctx, sx, GROUND_Y, it.w, it.h, t);
      } else if (it.kind === 'puddle') {
        drawPuddle(ctx, sx, GROUND_Y, it.w);
      }
    }
  }
}
