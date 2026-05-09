import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/sprites');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function drawPixelRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/**
 * Draw a simple humanoid figure at (cx, baseY).
 * direction: 1 = faces right, -1 = faces left
 * frame: 0-7 walk cycle offset
 * colors: { skin, hair, body, legs, accent }
 * pose: 'idle' | 'attack' | 'hurt' | 'dead'
 */
function drawCharacter(ctx, cx, baseY, scale, colors, frame, pose = 'idle', direction = 1) {
  const s = scale;
  const bobY = pose === 'idle' ? Math.sin(frame * Math.PI / 3) * s : 0;
  const legSwing = pose === 'idle' || pose === 'attack' ? Math.sin(frame * Math.PI / 4) * s * 2 : 0;

  // Hurt: lean back
  const leanX = pose === 'hurt' ? direction * -s * 3 : 0;
  const leanY = pose === 'hurt' ? -s : 0;

  // Attack: lean forward with arm extended
  const attackLean = pose === 'attack' ? direction * s * 4 : 0;
  const armExtend = pose === 'attack' ? s * 6 : 0;

  // Dead: fall
  if (pose === 'dead') {
    ctx.save();
    ctx.translate(cx, baseY - s * 5);
    ctx.rotate(direction * Math.PI / 2);
    drawPixelRect(ctx, -s * 6, -s * 2, s * 12, s * 4, colors.body);
    drawPixelRect(ctx, -s * 2, -s * 2, s * 4, s * 4, colors.skin);
    ctx.restore();
    return;
  }

  const bx = cx + leanX + attackLean;
  const by = baseY + bobY + leanY;

  // Legs
  const legColor = colors.legs;
  const lLegX = bx - s * 2 + legSwing * direction;
  const rLegX = bx + s     - legSwing * direction;
  drawPixelRect(ctx, lLegX, by - s * 6, s * 2, s * 6, legColor);
  drawPixelRect(ctx, rLegX, by - s * 6, s * 2, s * 6, legColor);
  // Feet
  drawPixelRect(ctx, lLegX - s, by - s * 1, s * 3, s, colors.accent);
  drawPixelRect(ctx, rLegX - s, by - s * 1, s * 3, s, colors.accent);

  // Body
  drawPixelRect(ctx, bx - s * 3, by - s * 12, s * 6, s * 6, colors.body);

  // Arms
  const armY = by - s * 11;
  const lArmEndX = bx - s * 5 - armExtend * direction;
  const rArmEndX = bx + s * 5 + armExtend * direction;
  drawPixelRect(ctx, lArmEndX, armY + legSwing * 0.5, s * 2, s * 4, colors.skin);
  drawPixelRect(ctx, rArmEndX - s * 2, armY - legSwing * 0.5, s * 2, s * 4, colors.skin);

  // Weapon/fist for attack
  if (pose === 'attack') {
    const fistX = direction === 1 ? rArmEndX : lArmEndX - s * 2;
    drawPixelRect(ctx, fistX, armY - legSwing * 0.5, s * 3, s * 3, colors.accent);
    // Energy glow
    ctx.fillStyle = colors.glow || colors.accent;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(fistX + s, armY + s, s * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Head
  drawPixelRect(ctx, bx - s * 2, by - s * 16, s * 4, s * 4, colors.skin);

  // Hair
  drawPixelRect(ctx, bx - s * 2, by - s * 17, s * 4, s * 2, colors.hair);
  // Hair spikes
  drawPixelRect(ctx, bx - s * 3, by - s * 18, s, s * 2, colors.hair);
  drawPixelRect(ctx, bx,         by - s * 18, s, s * 2, colors.hair);
  drawPixelRect(ctx, bx + s * 2, by - s * 17, s, s, colors.hair);

  // Eyes
  const eyeOffX = direction === 1 ? s : -s;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(Math.round(bx + eyeOffX - s), Math.round(by - s * 15), Math.round(s), Math.round(s));
  ctx.fillStyle = '#111111';
  ctx.fillRect(Math.round(bx + eyeOffX - s + (direction > 0 ? 1 : 0)), Math.round(by - s * 15), Math.round(Math.max(1, s * 0.5)), Math.round(s));

  // Hurt flash
  if (pose === 'hurt') {
    ctx.fillStyle = 'rgba(255,50,50,0.4)';
    ctx.fillRect(Math.round(bx - s * 5), Math.round(by - s * 18), Math.round(s * 10), Math.round(s * 18));
  }
}

// ─── Sheet generator ─────────────────────────────────────────────────────────

function makeSheet(filename, fw, fh, bgColor, rows, charColors, direction = 1) {
  const COLS = 8;
  const canvas = createCanvas(fw * COLS, fh * rows.length);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  rows.forEach((rowDef, rowIdx) => {
    const y0 = rowIdx * fh;
    const { pose, count, fps } = rowDef;

    for (let f = 0; f < count; f++) {
      const x0 = f * fw;
      const cx = x0 + fw / 2;
      const cy = y0 + fh;

      drawCharacter(ctx, cx, cy - 4, fw / 22, charColors, f, pose, direction);
    }
  });

  writeFileSync(join(OUT, filename), canvas.toBuffer('image/png'));
  console.log(`✓ ${filename}  (${canvas.width}x${canvas.height})`);
}

// ─── GON (Ironclad replacement) ──────────────────────────────────────────────
// Sheet layout: 8 cols × 8 rows, each frame 79×77

const GON_COLORS = {
  skin:   '#e8a882',
  hair:   '#1a7a1a',   // dark green spiky hair
  body:   '#2d7a2d',   // green outfit
  legs:   '#8b4513',   // brown pants/boots
  accent: '#ffd700',   // gold wristbands
  glow:   '#7fff00',   // green energy
};

makeSheet('gon.png', 79, 77, '#7878b0', [
  { pose: 'idle',   count: 8 },   // row 0 — idle bob
  { pose: 'idle',   count: 6 },   // row 1 — victory (same as idle for placeholder)
  { pose: 'idle',   count: 8 },   // row 2 — walk
  { pose: 'idle',   count: 6 },   // row 3 — run
  { pose: 'hurt',   count: 3 },   // row 4 — hurt
  { pose: 'dead',   count: 5 },   // row 5 — death
  { pose: 'idle',   count: 6 },   // row 6 — special charge
  { pose: 'attack', count: 6 },   // row 7 — attack 1
  { pose: 'attack', count: 6 },   // row 8 — attack 2
  { pose: 'attack', count: 8 },   // row 9 — special attack
], GON_COLORS, 1);

// ─── DEFECT (white-hair replacement) ─────────────────────────────────────────
// Sheet layout: 8 cols × 10 rows, each frame 120×65

const DEFECT_COLORS = {
  skin:   '#d4c5b5',
  hair:   '#e8e8f0',   // silver/white hair
  body:   '#2a2a3e',   // dark outfit
  legs:   '#1a1a2e',   // dark pants
  accent: '#00bfff',   // electric blue
  glow:   '#00ffff',   // cyan orb glow
};

makeSheet('defect.png', 120, 65, '#000000', [
  { pose: 'idle',   count: 4 },   // row 0
  { pose: 'idle',   count: 5 },   // row 1 — walk
  { pose: 'idle',   count: 4 },   // row 2 — victory
  { pose: 'attack', count: 5 },   // row 3 — attack
  { pose: 'attack', count: 6 },   // row 4 — orb channel
  { pose: 'attack', count: 6 },   // row 5 — attack 2
  { pose: 'idle',   count: 4 },   // row 6 — power up
  { pose: 'hurt',   count: 3 },   // row 7 — hurt
  { pose: 'dead',   count: 5 },   // row 8 — death
  { pose: 'attack', count: 6 },   // row 9 — special
  { pose: 'attack', count: 6 },   // row 10 — special 2
], DEFECT_COLORS, 1);

// ─── KURORO LUCIFER (enemy) ───────────────────────────────────────────────────
// Sheet layout: 8 cols × 14 rows, each frame 100×100

const KURORO_COLORS = {
  skin:   '#c8a878',
  hair:   '#1a1a1a',   // black hair
  body:   '#f0f0f0',   // white shirt / dark coat
  legs:   '#1a1a1a',   // black pants
  accent: '#8b0000',   // dark red blood nen
  glow:   '#4b0082',   // indigo dark nen
};

makeSheet('kuroro.png', 100, 100, '#3a8a7a', [
  { pose: 'idle',   count: 3 },   // row 0 — idle
  { pose: 'idle',   count: 6 },   // row 1 — walk
  { pose: 'idle',   count: 3 },   // row 2 — taunt
  { pose: 'attack', count: 4 },   // row 3 — attack 1
  { pose: 'attack', count: 4 },   // row 4 — dash attack
  { pose: 'attack', count: 5 },   // row 5 — attack 2
  { pose: 'attack', count: 4 },   // row 6 — combo
  { pose: 'hurt',   count: 3 },   // row 7 — hurt
  { pose: 'hurt',   count: 3 },   // row 8 — stagger
  { pose: 'dead',   count: 5 },   // row 9 — death
  { pose: 'attack', count: 4 },   // row 10 — skill
  { pose: 'attack', count: 4 },   // row 11 — special
  { pose: 'attack', count: 4 },   // row 12 — nen ability
  { pose: 'idle',   count: 3 },   // row 13 — stance
], KURORO_COLORS, -1);  // enemy faces left

console.log('\n✅ All sprite sheets generated in public/sprites/');
console.log('   Drop in real PNG files with the same names to upgrade the visuals.\n');
