// art.js — every picture in the game is drawn here with canvas paths:
// the turkey, the farmer, the farm, the barn, the kitchen and the sky.
// No image files, no borrowed art: all original vector drawing.

export const W = 1280;
export const H = 720;
export const GROUND_Y = 620;

/** Stage palettes: farmyard morning, barn dusk, kitchen night. */
export const STAGES = [
  { name: 'THE FARMYARD', sky: ['#ffd98a', '#ffb347'], sun: '#fff3b0', hills: '#8fae5d', ground: '#b98a4a', groundDark: '#a1763a' },
  { name: 'THE BARN', sky: ['#e8a06a', '#c96f3f'], sun: '#ffe9a8', hills: '#6f7d4a', ground: '#9c6f3c', groundDark: '#875f31' },
  { name: 'THE KITCHEN', sky: ['#7a5a8c', '#4a3560'], sun: '#ffd9a0', hills: '#3f4a3a', ground: '#7d5a3c', groundDark: '#6b4a30' },
];

/** Draw the sky, sun, clouds and hills for a stage, scrolling with `off`. */
export function drawBackground(ctx, stage, off, t) {
  const s = STAGES[stage];
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, s.sky[0]);
  sky.addColorStop(1, s.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y + 2);
  // Sun with a warm glow.
  ctx.fillStyle = s.sun;
  ctx.beginPath();
  ctx.arc(1080, 110, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.arc(1080, 110, 84, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Drifting clouds.
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < 4; i++) {
    const cx = (((i * 430 - off * 0.15) % 1500) + 1500) % 1500 - 110;
    const cy = 70 + i * 46;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 74, 22, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 52, cy + 8, 52, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Rolling hills.
  ctx.fillStyle = s.hills;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= W; x += 40) {
    const y = GROUND_Y - 46 - Math.sin((x + off * 0.4) / 260) * 26;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, GROUND_Y);
  ctx.closePath();
  ctx.fill();
  // Ground.
  ctx.fillStyle = s.ground;
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  ctx.fillStyle = s.groundDark;
  for (let x = 0; x < W; x += 90) {
    const gx = x - (off % 90);
    ctx.fillRect(gx, GROUND_Y + 52, 46, 6);
  }
  // Stage dressing: barn silhouette in the barn stage, kitchen window glow at night.
  if (stage === 1) {
    ctx.fillStyle = '#7a3b22';
    ctx.fillRect(880 - ((off * 0.6) % 1600), 430, 190, 190);
    ctx.fillStyle = '#5d2b18';
    ctx.beginPath();
    ctx.moveTo(870 - ((off * 0.6) % 1600), 432);
    ctx.lineTo(975 - ((off * 0.6) % 1600), 360);
    ctx.lineTo(1080 - ((off * 0.6) % 1600), 432);
    ctx.closePath();
    ctx.fill();
  }
  if (stage === 2) {
    ctx.fillStyle = 'rgba(255, 220, 130, 0.16)';
    ctx.fillRect(0, 0, W, GROUND_Y);
    void t;
  }
}

/** Draw Gus the turkey at (x, y) — y is the ground contact point. */
export function drawTurkey(ctx, x, y, opts) {
  const run = opts.runPhase || 0;
  const duck = !!opts.duck;
  const legSwing = Math.sin(run * 10) * 10;
  const bob = duck ? 0 : Math.abs(Math.sin(run * 10)) * 3;
  ctx.save();
  ctx.translate(x, y - bob);
  if (duck) ctx.scale(1.25, 0.62);
  // Tail feathers.
  ctx.fillStyle = '#8a5a2b';
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.rotate(i * 0.32);
    ctx.beginPath();
    ctx.ellipse(-26, -34, 9, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#c98a3d';
  for (let i = -1; i <= 1; i++) {
    ctx.save();
    ctx.rotate(i * 0.3);
    ctx.beginPath();
    ctx.ellipse(-22, -30, 6, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Legs.
  ctx.strokeStyle = '#e8a33d';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, -12);
  ctx.lineTo(-6 + legSwing, 0);
  ctx.moveTo(6, -12);
  ctx.lineTo(6 - legSwing, 0);
  ctx.stroke();
  // Body.
  ctx.fillStyle = '#a06830';
  ctx.beginPath();
  ctx.ellipse(0, -32, 34, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c98a3d';
  ctx.beginPath();
  ctx.ellipse(4, -26, 26, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wing.
  ctx.fillStyle = '#7a4a1f';
  ctx.beginPath();
  ctx.ellipse(-4, -32, 20, 12, -0.5, 0, Math.PI * 2);
  ctx.fill();
  // Neck and head.
  ctx.fillStyle = '#a06830';
  ctx.fillRect(22, -66, 12, 30);
  ctx.fillStyle = '#d97b6c';
  ctx.beginPath();
  ctx.arc(30, -70, 13, 0, Math.PI * 2);
  ctx.fill();
  // Beak, wattle, eye.
  ctx.fillStyle = '#f2b705';
  ctx.beginPath();
  ctx.moveTo(40, -72);
  ctx.lineTo(54, -67);
  ctx.lineTo(40, -63);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.ellipse(36, -58, 4, 7, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath();
  ctx.arc(33, -74, 3.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(34.4, -75.4, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Draw Farmer Bram at (x, y) with his pitchfork, mid-stride. */
export function drawFarmer(ctx, x, y, runPhase, searching) {
  const legSwing = Math.sin(runPhase * 9) * 12;
  ctx.save();
  ctx.translate(x, y);
  // Legs (blue overalls).
  ctx.strokeStyle = '#2f4d7a';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-4, -34);
  ctx.lineTo(-4 + legSwing, 0);
  ctx.moveTo(4, -34);
  ctx.lineTo(4 - legSwing, 0);
  ctx.stroke();
  // Body: red plaid shirt.
  ctx.fillStyle = '#b03a2e';
  ctx.beginPath();
  ctx.ellipse(0, -58, 24, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7a241b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-20, -66);
  ctx.lineTo(20, -50);
  ctx.moveTo(-20, -50);
  ctx.lineTo(20, -66);
  ctx.stroke();
  // Arms reaching forward, one gripping the pitchfork.
  ctx.strokeStyle = '#e8b48a';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(8, -72);
  ctx.lineTo(34, -58);
  ctx.moveTo(-8, -72);
  ctx.lineTo(-26, -56);
  ctx.stroke();
  // Pitchfork.
  ctx.strokeStyle = '#8a6d3b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(36, -92);
  ctx.lineTo(30, -20);
  ctx.stroke();
  ctx.strokeStyle = '#c0c0c0';
  ctx.lineWidth = 3;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(36 + i * 7, -92);
    ctx.lineTo(36 + i * 7, -108);
    ctx.stroke();
  }
  // Head with straw hat.
  ctx.fillStyle = '#e8b48a';
  ctx.beginPath();
  ctx.arc(0, -96, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.ellipse(0, -104, 26, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -108, 13, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eyes: angry when chasing, puzzled when searching.
  ctx.fillStyle = '#1c1c1c';
  if (searching) {
    ctx.beginPath();
    ctx.arc(-5, -98, 2.4, 0, Math.PI * 2);
    ctx.arc(5, -98, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1c1c1c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -88, 5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-9, -102);
    ctx.lineTo(-1, -98);
    ctx.moveTo(9, -102);
    ctx.lineTo(1, -98);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-5, -96, 2.2, 0, Math.PI * 2);
    ctx.arc(5, -96, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // Moustache.
  ctx.fillStyle = '#5d3a1a';
  ctx.fillRect(-10, -88, 20, 4);
  ctx.restore();
}

/** Draw a wooden fence obstacle. */
export function drawFence(ctx, x, y, w, h) {
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(x, y - h, 8, h);
  ctx.fillRect(x + w - 8, y - h, 8, h);
  ctx.fillStyle = '#a1763a';
  ctx.fillRect(x, y - h + 6, w, 10);
  ctx.fillRect(x, y - h + 26, w, 10);
}

/** Draw a hay bale. */
export function drawHayBale(ctx, x, y, r) {
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  ctx.arc(x, y - r, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b9832e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y - r, r * 0.7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y - r, r * 0.4, 0, Math.PI * 2);
  ctx.stroke();
}

/** Draw a haystack the turkey can hide in. */
export function drawHaystack(ctx, x, y, w, h) {
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w / 2, y - h);
  ctx.lineTo(x + w, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b9832e';
  ctx.lineWidth = 2;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + (w * i) / 4, y - 6);
    ctx.lineTo(x + (w * i) / 4 - 8, y - h + 14);
    ctx.stroke();
  }
}

/** Draw a glowing oven (kitchen hazard). */
export function drawOven(ctx, x, y, w, h, t) {
  const flicker = Math.sin(t * 9) * 4;
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(x, y - h, w, h);
  ctx.fillStyle = '#555';
  ctx.fillRect(x, y - h, w, 10);
  // Fire glow in the oven window.
  const glow = ctx.createRadialGradient(x + w / 2, y - h / 2, 4, x + w / 2, y - h / 2, 44 + flicker);
  glow.addColorStop(0, 'rgba(255, 190, 60, 0.95)');
  glow.addColorStop(1, 'rgba(255, 90, 20, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 18, y - h - 18, w + 36, h + 36);
  ctx.fillStyle = '#ff7b1c';
  ctx.fillRect(x + 12, y - h + 22, w - 24, h - 40);
  ctx.fillStyle = '#ffd23d';
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y - h + 28);
  ctx.lineTo(x + w / 2 - 12, y - 16);
  ctx.lineTo(x + w / 2 + 12, y - 16);
  ctx.closePath();
  ctx.fill();
  // Dials.
  ctx.fillStyle = '#eee';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x + 18 + i * 16, y - h + 10, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Draw a falling carving knife. */
export function drawKnife(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = '#c0c8d0';
  ctx.beginPath();
  ctx.moveTo(0, -34);
  ctx.lineTo(10, -6);
  ctx.lineTo(6, 22);
  ctx.lineTo(-6, 22);
  ctx.lineTo(-10, -6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5d3a1a';
  ctx.fillRect(-7, 22, 14, 18);
  ctx.restore();
}

/** Draw a corn cob collectible, bobbing gently. */
export function drawCorn(ctx, x, y, t) {
  const bob = Math.sin(t * 4 + x) * 4;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.fillStyle = '#2f7d32';
  ctx.beginPath();
  ctx.ellipse(-12, -8, 10, 5, -0.7, 0, Math.PI * 2);
  ctx.ellipse(12, -8, 10, 5, 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd23d';
  ctx.beginPath();
  ctx.ellipse(0, -14, 10, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8a33d';
  for (let i = -1; i <= 1; i++) {
    ctx.fillRect(i * 6 - 1, -30, 2, 32);
  }
  ctx.restore();
}

/** Draw a gravy puddle that slows the turkey. */
export function drawPuddle(ctx, x, y, w) {
  ctx.fillStyle = 'rgba(120, 72, 20, 0.75)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y - 4, w / 2, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 220, 150, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2 - 10, y - 6, 16, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Draw the forest gate — the finish line of the escape. */
export function drawForestGate(ctx, x, y) {
  ctx.fillStyle = '#2f5d23';
  ctx.fillRect(x - 10, y - 240, 20, 240);
  ctx.fillRect(x + 150, y - 240, 20, 240);
  ctx.fillStyle = '#3f7d32';
  ctx.beginPath();
  ctx.moveTo(x - 26, y - 238);
  ctx.quadraticCurveTo(x + 80, y - 320, x + 186, y - 238);
  ctx.lineTo(x + 186, y - 210);
  ctx.quadraticCurveTo(x + 80, y - 280, x - 26, y - 210);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff3b0';
  ctx.font = 'bold 26px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FREEDOM', x + 80, y - 252);
  ctx.textAlign = 'left';
}
