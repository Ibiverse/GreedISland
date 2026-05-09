import gsap from 'gsap';

/**
 * GSAP-based combat juice. Each function does one effect and cleans up after itself.
 */

// ── Screen shake ────────────────────────────────────────────────────────────
export function screenShake(target: HTMLElement | null, intensity = 8, duration = 0.4) {
  if (!target) return;
  const tl = gsap.timeline();
  const shakes = 6;
  for (let i = 0; i < shakes; i++) {
    const x = (Math.random() - 0.5) * 2 * intensity * (1 - i / shakes);
    const y = (Math.random() - 0.5) * 2 * intensity * (1 - i / shakes);
    tl.to(target, { x, y, duration: duration / shakes, ease: 'power1.inOut' });
  }
  tl.to(target, { x: 0, y: 0, duration: 0.05 });
}

// ── Sprite hit reaction (knockback + flash) ────────────────────────────────
export function spriteHit(target: HTMLElement | null, fromLeft: boolean) {
  if (!target) return;
  const dx = fromLeft ? 14 : -14;
  gsap.timeline()
    .to(target, { x: dx, duration: 0.08, ease: 'power3.out' })
    .to(target, { x: dx * 0.4, duration: 0.06, ease: 'power1.in' })
    .to(target, { x: 0, duration: 0.18, ease: 'elastic.out(1, 0.4)' });
}

// ── Sprite attack lunge (player attacking) ──────────────────────────────────
export function spriteLunge(target: HTMLElement | null, dirRight: boolean) {
  if (!target) return;
  const dx = dirRight ? 50 : -50;
  gsap.timeline()
    .to(target, { x: dx, duration: 0.12, ease: 'power2.out' })
    .to(target, { x: 0, duration: 0.4, ease: 'power3.out' });
}

// ── Card hand entry stagger ─────────────────────────────────────────────────
export function dealHand(cards: HTMLElement[]) {
  if (!cards.length) return;
  // Kill any in-flight animations on these elements first (prevents StrictMode
  // double-fire from leaving cards stuck off-screen).
  gsap.killTweensOf(cards);
  gsap.fromTo(cards,
    {
      y: 200,
      opacity: 0,
      rotation: (i: number) => (i - cards.length / 2) * 12,
    },
    {
      y: 0,
      opacity: 1,
      rotation: 0,
      duration: 0.45,
      stagger: 0.06,
      ease: 'back.out(1.4)',
      clearProps: 'all',  // hand control back to framer-motion / CSS after
    }
  );
}

// ── Card "yeet" toward enemy on play, then poof ────────────────────────────
export function yeetCard(card: HTMLElement | null, targetX: number, targetY: number, onDone?: () => void) {
  if (!card) { onDone?.(); return; }
  const r = card.getBoundingClientRect();
  const dx = targetX - (r.left + r.width / 2);
  const dy = targetY - (r.top + r.height / 2);
  gsap.timeline({ onComplete: onDone })
    .to(card, { y: -120, scale: 1.15, duration: 0.18, ease: 'power2.out' })
    .to(card, { x: dx, y: dy, scale: 0.6, rotation: 720, duration: 0.35, ease: 'power3.in' })
    .to(card, { opacity: 0, scale: 1.4, duration: 0.15 });
}

// ── Floating damage number with arc ─────────────────────────────────────────
export function floatDamage(host: HTMLElement | null, value: number, kind: 'damage' | 'block' | 'heal' = 'damage') {
  if (!host) return;
  const el = document.createElement('div');
  el.textContent = (kind === 'damage' ? '-' : kind === 'heal' ? '+' : '') + Math.abs(value);
  el.className = 'absolute pointer-events-none font-bold select-none';

  const palette = {
    damage: { color: '#ff3a3a', stroke: '#460000' },
    block:  { color: '#5ad6ff', stroke: '#00324a' },
    heal:   { color: '#3aff8a', stroke: '#003a1a' },
  }[kind];

  Object.assign(el.style, {
    color: palette.color,
    fontSize: kind === 'damage' && value >= 10 ? '40px' : '28px',
    left: '50%',
    top: '20%',
    transform: 'translate(-50%, -50%)',
    textShadow: `0 0 4px ${palette.stroke}, 2px 2px 0 ${palette.stroke}, -2px -2px 0 ${palette.stroke}, 2px -2px 0 ${palette.stroke}, -2px 2px 0 ${palette.stroke}`,
    zIndex: '100',
    fontFamily: 'Georgia, serif',
  });

  // Ensure host is positioned so absolute children land correctly
  const computed = getComputedStyle(host);
  if (computed.position === 'static') host.style.position = 'relative';

  host.appendChild(el);

  const dx = (Math.random() - 0.5) * 60;
  gsap.timeline({ onComplete: () => el.remove() })
    .from(el, { scale: 0, duration: 0.18, ease: 'back.out(2)' })
    .to(el, { x: dx, y: -90, duration: 0.9, ease: 'power2.out' }, 0)
    .to(el, { opacity: 0, duration: 0.4, ease: 'power1.in' }, 0.6);
}

// ── Energy orb pulse on use ─────────────────────────────────────────────────
export function pulseElement(target: HTMLElement | null) {
  if (!target) return;
  gsap.fromTo(target,
    { scale: 1.5, filter: 'brightness(2)' },
    { scale: 1, filter: 'brightness(1)', duration: 0.3, ease: 'power2.out' }
  );
}
