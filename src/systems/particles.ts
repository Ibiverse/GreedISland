/**
 * PixiJS-powered particle system. One global instance shared across the game.
 * Coordinates are in CSS pixels relative to the canvas's parent element.
 */
import { Application, Container, Graphics, BlurFilter } from 'pixi.js';

interface Particle {
  obj: Graphics;
  vx: number; vy: number;
  ax: number; ay: number;
  rotVel: number;
  scaleVel: number;
  life: number;
  maxLife: number;
  fadePower: number;     // higher = lingers full opacity longer, then drops fast
}

let app: Application | null = null;
let layer: Container | null = null;
const particles: Particle[] = [];

// ── Setup / teardown ────────────────────────────────────────────────────────

export async function initParticles(host: HTMLElement) {
  if (app) return;  // singleton

  try {
    const newApp = new Application();
    await newApp.init({
      backgroundColor: 0x000000,
      backgroundAlpha: 0,
      resizeTo: host,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    });

    // Force-set the background to fully transparent in case init options were ignored
    newApp.renderer.background.alpha = 0;

    Object.assign(newApp.canvas.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      background: 'transparent',
    });
    host.appendChild(newApp.canvas);

    const newLayer = new Container();
    newApp.stage.addChild(newLayer);

    newApp.ticker.add((ticker) => {
      update(ticker.deltaMS / 1000);
    });

    app = newApp;
    layer = newLayer;
  } catch (err) {
    console.error('[particles] PIXI init failed, particles disabled:', err);
    app = null;
    layer = null;
  }
}

export function destroyParticles() {
  if (!app) return;
  for (const p of particles) {
    try { p.obj.destroy(); } catch {/* ignore */}
  }
  particles.length = 0;
  try {
    app.destroy({ removeView: true }, { children: true });
  } catch (err) {
    console.warn('[particles] destroy error:', err);
  }
  app = null;
  layer = null;
}

function update(dt: number) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.vx += p.ax * dt;
    p.vy += p.ay * dt;
    p.obj.x += p.vx * dt;
    p.obj.y += p.vy * dt;
    p.obj.rotation += p.rotVel * dt;
    if (p.scaleVel) {
      p.obj.scale.x = Math.max(0, p.obj.scale.x + p.scaleVel * dt);
      p.obj.scale.y = p.obj.scale.x;
    }
    p.life -= dt;
    p.obj.alpha = Math.max(0, Math.pow(p.life / p.maxLife, p.fadePower));
    if (p.life <= 0) {
      layer?.removeChild(p.obj);
      p.obj.destroy();
      particles.splice(i, 1);
    }
  }
}

function spawn(g: Graphics, opts: Partial<Particle>) {
  if (!layer) return;
  layer.addChild(g);
  particles.push({
    obj: g,
    vx: opts.vx ?? 0, vy: opts.vy ?? 0,
    ax: opts.ax ?? 0, ay: opts.ay ?? 0,
    rotVel: opts.rotVel ?? 0,
    scaleVel: opts.scaleVel ?? 0,
    life: opts.maxLife ?? 1,
    maxLife: opts.maxLife ?? 1,
    fadePower: opts.fadePower ?? 1,
  });
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

// ── Effect recipes ──────────────────────────────────────────────────────────

/** Yellow-white sparks bursting outward, gravity pulls down. */
export function fxHitSpark(x: number, y: number, count = 14, color = 0xffd84a) {
  if (!layer) return;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = rand(180, 380);
    const size = rand(2, 5);
    const g = new Graphics().circle(0, 0, size).fill({ color: i % 4 === 0 ? 0xffffff : color });
    g.x = x; g.y = y;
    spawn(g, {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 50,
      ay: 800,
      maxLife: rand(0.35, 0.6),
      scaleVel: -2,
      fadePower: 0.7,
    });
  }
}

/** Big chunky blood-red impact for heavy hits. */
export function fxBigImpact(x: number, y: number) {
  fxHitSpark(x, y, 24, 0xff5a3a);
  if (!layer) return;
  // Shock ring
  const ring = new Graphics().circle(0, 0, 8).stroke({ width: 4, color: 0xffffff });
  ring.x = x; ring.y = y;
  spawn(ring, { maxLife: 0.35, scaleVel: 18, fadePower: 1.5 });
}

/** Lightning bolt from (x1,y1) to (x2,y2) with glow + spark burst at end. */
export function fxLightning(x1: number, y1: number, x2: number, y2: number) {
  if (!layer) return;

  function makeBolt(jitter: number) {
    const segments = 10;
    const path: { x: number; y: number }[] = [{ x: x1, y: y1 }];
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const bx = x1 + (x2 - x1) * t;
      const by = y1 + (y2 - y1) * t;
      const dx = -(y2 - y1), dy = (x2 - x1);
      const norm = Math.hypot(dx, dy) || 1;
      const off = (Math.random() - 0.5) * 2 * jitter;
      path.push({ x: bx + (dx / norm) * off, y: by + (dy / norm) * off });
    }
    path.push({ x: x2, y: y2 });
    return path;
  }

  // Outer glow
  const glow = new Graphics();
  const glowPath = makeBolt(28);
  glowPath.forEach((p, i) => i === 0 ? glow.moveTo(p.x, p.y) : glow.lineTo(p.x, p.y));
  glow.stroke({ width: 18, color: 0x66aaff, alpha: 0.45, cap: 'round', join: 'round' });
  glow.filters = [new BlurFilter({ strength: 4 })];
  spawn(glow, { maxLife: 0.35, fadePower: 2 });

  // Inner bright bolt
  const bolt = new Graphics();
  const boltPath = makeBolt(22);
  boltPath.forEach((p, i) => i === 0 ? bolt.moveTo(p.x, p.y) : bolt.lineTo(p.x, p.y));
  bolt.stroke({ width: 5, color: 0xffffff, cap: 'round', join: 'round' });
  spawn(bolt, { maxLife: 0.18, fadePower: 1 });

  // Mid layer (cyan)
  const mid = new Graphics();
  const midPath = makeBolt(20);
  midPath.forEach((p, i) => i === 0 ? mid.moveTo(p.x, p.y) : mid.lineTo(p.x, p.y));
  mid.stroke({ width: 9, color: 0x88ddff, cap: 'round', join: 'round' });
  spawn(mid, { maxLife: 0.25, fadePower: 1.6 });

  // Sparks at impact point
  fxHitSpark(x2, y2, 18, 0xaaeeff);
}

/** Rising fire/embers at a position — for melee attacks landing. */
export function fxFire(x: number, y: number, count = 14) {
  if (!layer) return;
  for (let i = 0; i < count; i++) {
    const speed = rand(80, 200);
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
    const size = rand(3, 7);
    const colors = [0xffaa00, 0xff5500, 0xffdd44, 0xff7711];
    const color = colors[(Math.random() * colors.length) | 0];
    const g = new Graphics().circle(0, 0, size).fill({ color });
    g.x = x + rand(-15, 15);
    g.y = y + rand(-5, 5);
    g.filters = [new BlurFilter({ strength: 1 })];
    spawn(g, {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      ay: -120,  // slight upward acceleration (heat rises)
      maxLife: rand(0.5, 0.9),
      scaleVel: -1.2,
      fadePower: 0.9,
    });
  }
}

/** Floating cyan energy orbs rising from a position — for skill cards. */
export function fxEnergyOrbs(x: number, y: number, count = 8, color = 0x66ddff) {
  if (!layer) return;
  for (let i = 0; i < count; i++) {
    const size = rand(4, 8);
    const g = new Graphics().circle(0, 0, size).fill({ color });
    g.x = x + rand(-25, 25);
    g.y = y + rand(-10, 10);
    g.filters = [new BlurFilter({ strength: 2 })];
    spawn(g, {
      vx: rand(-30, 30),
      vy: rand(-150, -80),
      ay: 60,
      maxLife: rand(0.7, 1.2),
      scaleVel: -0.6,
      fadePower: 0.8,
    });
  }
}

/** Blue shield-shimmer flash when block absorbs a hit. */
export function fxBlock(x: number, y: number) {
  if (!layer) return;
  // Expanding ring
  const ring = new Graphics().circle(0, 0, 20).stroke({ width: 4, color: 0x66ddff });
  ring.x = x; ring.y = y;
  ring.filters = [new BlurFilter({ strength: 2 })];
  spawn(ring, { maxLife: 0.4, scaleVel: 8, fadePower: 1.2 });

  // Soft glow flash
  const glow = new Graphics().circle(0, 0, 60).fill({ color: 0x4488ff, alpha: 0.5 });
  glow.x = x; glow.y = y;
  glow.filters = [new BlurFilter({ strength: 8 })];
  spawn(glow, { maxLife: 0.3, scaleVel: -2, fadePower: 2 });

  // Few sparkles
  fxHitSpark(x, y, 8, 0xaaddff);
}

/** Particles rising in a column when an enemy dies. */
export function fxDeath(x: number, y: number) {
  if (!layer) return;
  for (let i = 0; i < 30; i++) {
    const size = rand(3, 7);
    const g = new Graphics().circle(0, 0, size).fill({ color: 0x9999cc });
    g.x = x + rand(-40, 40);
    g.y = y + rand(-30, 30);
    g.filters = [new BlurFilter({ strength: 1.5 })];
    spawn(g, {
      vx: rand(-20, 20),
      vy: rand(-150, -50),
      ay: -30,
      maxLife: rand(0.8, 1.4),
      scaleVel: -0.8,
      fadePower: 1.2,
    });
  }
}

/** Spell circle expanding under the caster's feet — for power cards. */
export function fxSpellCircle(x: number, y: number, color = 0xff66cc) {
  if (!layer) return;
  for (let r = 0; r < 3; r++) {
    const ring = new Graphics().circle(0, 0, 30).stroke({ width: 3, color });
    ring.x = x; ring.y = y;
    ring.filters = [new BlurFilter({ strength: 1 })];
    setTimeout(() => spawn(ring, { maxLife: 0.6, scaleVel: 6, fadePower: 1.5 }), r * 120);
  }
  // Burst of energy orbs from the circle
  fxEnergyOrbs(x, y, 12, color);
}

/** Slash arc — quick streak of sparks for slash attacks. */
export function fxSlash(x: number, y: number, dirRight: boolean) {
  if (!layer) return;
  // Curved sweep of sparks
  const baseAngle = dirRight ? 0 : Math.PI;
  for (let i = 0; i < 20; i++) {
    const t = i / 20;
    const a = baseAngle + (t - 0.5) * 1.2;
    const speed = rand(280, 450);
    const size = rand(2, 5);
    const g = new Graphics().circle(0, 0, size).fill({ color: i < 4 ? 0xffffff : 0xffe888 });
    g.x = x; g.y = y;
    spawn(g, {
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed * 0.4,
      ay: 400,
      maxLife: rand(0.25, 0.45),
      scaleVel: -3,
      fadePower: 0.7,
    });
  }
}
