// main.js — Turkey Run: the game loop, states, input, HUD and the
// deterministic screenshot scenes (?shot=title|play|barn|kitchen|end).

import { W, H, GROUND_Y, STAGES, drawBackground, drawTurkey, drawFarmer } from './art.js';
import { Turkey } from './turkey.js';
import { Farmer } from './farmer.js';
import { World, ESCAPE_DISTANCE_M } from './world.js';
import { SoundBank } from './audio.js';
import { makeRng } from './rng.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(location.search);
const SHOT = params.get('shot');
const SEED = Number(params.get('seed') || '7');

const sounds = new SoundBank();
const turkey = new Turkey();
const farmer = new Farmer();
let world = new World(makeRng(SEED));

let state = 'title'; // title | play | paused | caught | escaped
let score = 0;
let cornCount = 0;
let lives = 3;
let bestDistance = 0;
let lastTime = 0;
let elapsed = 0;

// Clickable buttons, refreshed every frame ({id, x, y, w, h}).
let buttons = [];

function resetGame(seed) {
  turkey.reset();
  farmer.reset();
  world = new World(makeRng(seed === undefined ? (Date.now() % 2147483647) : seed));
  score = 0;
  cornCount = 0;
  lives = 3;
  elapsed = 0;
  state = 'play';
  sounds.unlock();
  sounds.startMusic();
}

function startGame() {
  resetGame();
}

function endGame(escaped) {
  state = escaped ? 'escaped' : 'caught';
  sounds.stopMusic();
  if (escaped) sounds.escaped();
  else sounds.caught();
  bestDistance = Math.max(bestDistance, Math.floor(world.distanceM));
}

/** A hit: lose a life, the farmer lunges closer, brief invulnerability. */
function takeHit(kind) {
  const now = performance.now();
  if (turkey.invulnerable) return;
  lives -= 1;
  turkey.invulnerableUntil = now + 1500;
  turkey.slowUntil = now + 600;
  farmer.stumble();
  sounds.thud();
  if (lives <= 0) endGame(false);
}

function update(dt) {
  if (state !== 'play') return;
  elapsed += dt;
  turkey.update(dt, world.speed);
  const events = world.update(dt, turkey, farmer, sounds);
  if (events.corn > 0) {
    cornCount += events.corn;
    score += events.corn * 10;
  }
  if (events.hid) {
    farmer.loseTrail();
    score += 15;
  }
  if (events.hit) takeHit(events.hit);
  farmer.update(dt, turkey.x, { slowed: turkey.slowed });
  score = Math.max(score, Math.floor(world.distanceM) + cornCount * 10);
  if (farmer.gapTo() <= 44) {
    endGame(false);
    return;
  }
  if (world.distanceM >= ESCAPE_DISTANCE_M) {
    endGame(true);
  }
}

// ---------------------------------------------------------------- drawing

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawButton(id, x, y, w, h, label) {
  buttons.push({ id, x, y, w, h });
  ctx.fillStyle = '#b03a2e';
  roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = '#7a241b';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 28px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2 + 1);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function drawHud() {
  ctx.fillStyle = 'rgba(43, 26, 14, 0.55)';
  roundRect(16, 14, 1248, 56, 12);
  ctx.fill();
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 26px "Trebuchet MS", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(`SCORE ${score}`, 34, 44);
  ctx.fillText(`${Math.floor(world.distanceM)} m`, 330, 44);
  ctx.fillText(STAGES[world.stage].name, 560, 44);
  ctx.fillText(`🌽 ${cornCount}`, 880, 44);
  // Lives as hearts.
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < lives ? '#e84a5f' : 'rgba(255,255,255,0.25)';
    const hx = 1060 + i * 44;
    ctx.beginPath();
    ctx.arc(hx, 38, 12, 0, Math.PI * 2);
    ctx.arc(hx + 20, 38, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx - 10, 42);
    ctx.lineTo(hx + 10, 66);
    ctx.lineTo(hx + 30, 42);
    ctx.closePath();
    ctx.fill();
  }
  // Farmer proximity: a red warning bar when he is close.
  const gap = farmer.gapTo();
  if (gap < 200) {
    const warn = gap < 110 ? '⚠ FARMER RIGHT BEHIND YOU!' : '⚠ THE FARMER IS CLOSING IN!';
    ctx.fillStyle = gap < 110 ? '#ff3b30' : '#ffb020';
    ctx.font = 'bold 24px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(warn, W / 2, 108);
    ctx.textAlign = 'left';
  }
  ctx.textBaseline = 'alphabetic';
  // Mute button.
  buttons.push({ id: 'mute', x: 1200, y: 84, w: 56, h: 40 });
  ctx.fillStyle = 'rgba(43, 26, 14, 0.55)';
  roundRect(1200, 84, 56, 40, 8);
  ctx.fill();
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(sounds.muted ? '✕ ♪' : '♪', 1228, 112);
  ctx.textAlign = 'left';
}

function drawTitle() {
  ctx.fillStyle = 'rgba(43, 26, 14, 0.25)';
  ctx.fillRect(0, 0, W, H);
  drawTurkey(ctx, 300, 560, { runPhase: 1.2 });
  drawFarmer(ctx, 940, GROUND_Y, 0.6, true);
  ctx.fillStyle = '#fff3d6';
  ctx.textAlign = 'center';
  ctx.font = 'bold 96px "Trebuchet MS", sans-serif';
  ctx.fillText('TURKEY RUN', W / 2, 190);
  ctx.font = 'bold 34px "Trebuchet MS", sans-serif';
  ctx.fillStyle = '#ffd23d';
  ctx.fillText('The Great Thanksgiving Escape', W / 2, 245);
  ctx.fillStyle = '#fff3d6';
  ctx.font = '24px "Trebuchet MS", sans-serif';
  ctx.fillText('Farmer Bram is coming for dinner. Outrun him through the farmyard,', W / 2, 320);
  ctx.fillText('the barn and the kitchen — dodge the oven and the carving knives,', W / 2, 352);
  ctx.fillText('grab the corn, hide in the haystacks, and reach the forest gate.', W / 2, 384);
  ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
  ctx.fillText('SPACE / CLICK — jump      ↓ — duck & hide      P — pause      M — mute', W / 2, 440);
  if (bestDistance > 0) {
    ctx.font = '22px "Trebuchet MS", sans-serif';
    ctx.fillText(`Best escape so far: ${bestDistance} m`, W / 2, 478);
  }
  drawButton('start', W / 2 - 130, 510, 260, 64, '▶  START RUN');
  ctx.textAlign = 'left';
}

function drawEnd(escaped) {
  ctx.fillStyle = escaped ? 'rgba(20, 60, 20, 0.55)' : 'rgba(60, 10, 10, 0.6)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 84px "Trebuchet MS", sans-serif';
  ctx.fillText(escaped ? 'ESCAPED!' : 'CAUGHT!', W / 2, 240);
  ctx.font = '30px "Trebuchet MS", sans-serif';
  ctx.fillText(
    escaped
      ? 'Gus slips through the forest gate — no Thanksgiving dinner today!'
      : 'Farmer Bram got you... and the oven was already warm.',
    W / 2, 310,
  );
  ctx.font = 'bold 28px "Trebuchet MS", sans-serif';
  ctx.fillText(`Score ${score}   ·   Distance ${Math.floor(world.distanceM)} m   ·   Corn ${cornCount}`, W / 2, 380);
  if (bestDistance > 0) {
    ctx.font = '24px "Trebuchet MS", sans-serif';
    ctx.fillText(`Best escape: ${bestDistance} m`, W / 2, 424);
  }
  drawButton('restart', W / 2 - 140, 480, 280, 64, '↻  RUN AGAIN');
  ctx.textAlign = 'left';
}

function drawPaused() {
  ctx.fillStyle = 'rgba(43, 26, 14, 0.55)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff3d6';
  ctx.textAlign = 'center';
  ctx.font = 'bold 64px "Trebuchet MS", sans-serif';
  ctx.fillText('PAUSED', W / 2, 340);
  ctx.font = '26px "Trebuchet MS", sans-serif';
  ctx.fillText('Press P or click to keep running.', W / 2, 400);
  ctx.textAlign = 'left';
}

function draw(t) {
  buttons = [];
  ctx.clearRect(0, 0, W, H);
  drawBackground(ctx, world.stage, world.scroll, t);
  world.draw(ctx, t);
  if (state === 'title') {
    drawTitle();
    return;
  }
  // The turkey: flicker while invulnerable after a hit.
  const flicker = turkey.invulnerable && Math.floor(t * 12) % 2 === 0;
  if (!flicker) {
    drawTurkey(ctx, turkey.x, turkey.y, { runPhase: turkey.runPhase, duck: turkey.ducking });
  }
  drawFarmer(ctx, farmer.x, GROUND_Y, farmer.runPhase, farmer.searching);
  drawHud();
  if (state === 'paused') drawPaused();
  else if (state === 'caught') drawEnd(false);
  else if (state === 'escaped') drawEnd(true);
}

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
  lastTime = now;
  update(dt);
  draw(now / 1000);
  requestAnimationFrame(frame);
}

// ---------------------------------------------------------------- input

function pressJump() {
  sounds.unlock();
  if (state === 'title') { startGame(); return; }
  if (state === 'caught' || state === 'escaped') { startGame(); return; }
  if (state === 'paused') { state = 'play'; return; }
  turkey.jump(sounds);
}

function clickButton(id) {
  if (id === 'start' || id === 'restart') { sounds.unlock(); startGame(); return true; }
  if (id === 'mute') { sounds.toggleMute(); return true; }
  return false;
}

window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
    e.preventDefault();
    pressJump();
  } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
    e.preventDefault();
    turkey.setDuck(true, sounds);
  } else if (e.code === 'KeyP') {
    if (state === 'play') state = 'paused';
    else if (state === 'paused') state = 'play';
  } else if (e.code === 'KeyM') {
    sounds.toggleMute();
  } else if (e.code === 'KeyR') {
    if (state !== 'title') startGame();
  } else if (e.code === 'Enter') {
    pressJump();
  }
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowDown' || e.code === 'KeyS') turkey.setDuck(false, sounds);
});

function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  const cx = (e.clientX - r.left) * (W / r.width);
  const cy = (e.clientY - r.top) * (H / r.height);
  return { x: cx, y: cy };
}
canvas.addEventListener('pointerdown', (e) => {
  const p = canvasPoint(e);
  for (const b of buttons) {
    if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
      if (clickButton(b.id)) return;
    }
  }
  if (state === 'paused') { state = 'play'; return; }
  pressJump();
});

// ---------------------------------------------------------------- deterministic screenshot scenes

function setupShot(name) {
  // Every shot is a fixed render of the game's own code: seeded RNG,
  // frozen positions, no audio, no animation loop.
  world = new World(makeRng(SEED));
  turkey.reset();
  farmer.reset();
  score = 0;
  cornCount = 0;
  lives = 3;
  if (name === 'title') {
    state = 'title';
    draw(1.2);
    return;
  }
  if (name === 'end') {
    state = 'escaped';
    world.distanceM = ESCAPE_DISTANCE_M;
    world.scroll = ESCAPE_DISTANCE_M * 50;
    score = 1240;
    cornCount = 23;
    lives = 2;
    draw(1.2);
    return;
  }
  // Play scenes: farmyard, barn and kitchen mid-run.
  state = 'play';
  const scene = {
    play: { d: 120, farmerGap: 230, turkeyAir: 120 },
    barn: { d: 380, farmerGap: 170, turkeyAir: 0 },
    kitchen: { d: 720, farmerGap: 120, turkeyAir: 60 },
  }[name] || { d: 120, farmerGap: 230, turkeyAir: 0 };
  world.distanceM = scene.d;
  world.scroll = scene.d * 50;
  world.items = [];
  const s = world.scroll;
  const stage = world.stage;
  if (stage === 0) {
    world.items.push({ kind: 'fence', x: s + 620, w: 74, h: 62 });
    world.items.push({ kind: 'haybale', x: s + 880, w: 64, h: 64 });
    world.items.push({ kind: 'corn', x: s + 520, y: GROUND_Y - 40, taken: false });
    world.items.push({ kind: 'corn', x: s + 564, y: GROUND_Y - 80, taken: false });
    world.items.push({ kind: 'corn', x: s + 608, y: GROUND_Y - 40, taken: false });
    world.items.push({ kind: 'haystack', x: s + 1020, w: 110, h: 92 });
  } else if (stage === 1) {
    world.items.push({ kind: 'knife', x: s + 700, y: 180, vy: 0, angle: 0.2, stuck: false });
    world.items.push({ kind: 'fence', x: s + 900, w: 74, h: 62 });
    world.items.push({ kind: 'corn', x: s + 480, y: GROUND_Y - 40, taken: false });
    world.items.push({ kind: 'corn', x: s + 524, y: GROUND_Y - 80, taken: false });
    world.items.push({ kind: 'haystack', x: s + 1060, w: 110, h: 92 });
  } else {
    world.items.push({ kind: 'oven', x: s + 640, w: 96, h: 110 });
    world.items.push({ kind: 'knife', x: s + 900, y: 120, vy: 0, angle: -0.25, stuck: false });
    world.items.push({ kind: 'oven', x: s + 1040, w: 96, h: 110 });
    world.items.push({ kind: 'corn', x: s + 500, y: GROUND_Y - 40, taken: false });
    world.items.push({ kind: 'corn', x: s + 544, y: GROUND_Y - 80, taken: false });
  }
  turkey.y = GROUND_Y - scene.turkeyAir;
  turkey.onGround = scene.turkeyAir === 0;
  turkey.runPhase = 2.1;
  farmer.gap = scene.farmerGap;
  farmer.x = turkey.x - farmer.gap;
  farmer.runPhase = 1.4;
  score = Math.floor(scene.d) + 120;
  cornCount = 12;
  draw(1.2);
}

// ---------------------------------------------------------------- boot

if (SHOT) {
  setupShot(SHOT);
} else {
  lastTime = performance.now();
  requestAnimationFrame(frame);
}
