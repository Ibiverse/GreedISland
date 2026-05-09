/**
 * Procedurally synthesizes all SFX + simple music as WAV files.
 * Pure Node.js, no audio libraries — writes raw 16-bit mono PCM.
 *
 * Run: node scripts/generate-audio.mjs
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SFX_DIR   = join(__dirname, '../public/sounds/sfx');
const MUSIC_DIR = join(__dirname, '../public/sounds/music');
mkdirSync(SFX_DIR,   { recursive: true });
mkdirSync(MUSIC_DIR, { recursive: true });

const SR = 44100;

// ── WAV writer ──────────────────────────────────────────────────────────────
function writeWav(filepath, samples) {
  const N = samples.length;
  const dataBytes = N * 2;
  const buf = Buffer.alloc(44 + dataBytes);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataBytes, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);          // PCM
  buf.writeUInt16LE(1, 22);          // mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);     // byte rate
  buf.writeUInt16LE(2, 32);          // block align
  buf.writeUInt16LE(16, 34);         // bits/sample
  buf.write('data', 36);
  buf.writeUInt32LE(dataBytes, 40);
  for (let i = 0; i < N; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32700), 44 + i * 2);
  }
  writeFileSync(filepath, buf);
}

// ── DSP helpers ─────────────────────────────────────────────────────────────
const TWO_PI = Math.PI * 2;
const noise  = () => Math.random() * 2 - 1;
const sine   = (f, t) => Math.sin(TWO_PI * f * t);
const square = (f, t) => (Math.sin(TWO_PI * f * t) >= 0 ? 1 : -1);
const tri    = (f, t) => 2 * Math.abs(2 * (t * f - Math.floor(t * f + 0.5))) - 1;
const saw    = (f, t) => 2 * (t * f - Math.floor(t * f + 0.5));
const expDec = (t, rate) => Math.exp(-t * rate);

function arEnv(t, totalDur, attack = 0.01, release = 0.1) {
  if (t < attack) return t / attack;
  const remaining = totalDur - t;
  if (remaining < release) return Math.max(0, remaining / release);
  return 1;
}

// One-pole lowpass filter state
function makeLP() {
  let last = 0;
  return (input, cutoff) => {
    last = last + cutoff * (input - last);
    return last;
  };
}

function makeHP() {
  let lastIn = 0, lastOut = 0;
  return (input, cutoff) => {
    const out = (1 - cutoff) * (lastOut + input - lastIn);
    lastIn = input; lastOut = out;
    return out;
  };
}

// Synth a buffer with a per-sample function
function synth(durSec, fn) {
  const N = Math.floor(SR * durSec);
  const out = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    out[i] = fn(t, i, N);
  }
  return out;
}

// ── SFX definitions ────────────────────────────────────────────────────────

function sfx_card_draw() {
  // Quick rising whoosh
  const lp = makeLP();
  return synth(0.20, t => {
    const cutoff = 0.04 + t * 8;
    const filtered = lp(noise(), Math.min(cutoff, 0.95));
    const env = expDec(t, 14);
    return filtered * env * 0.6;
  });
}

function sfx_card_play() {
  // Snappy "thwip" — pitched downward sweep + click
  return synth(0.18, t => {
    const f = 800 - t * 1200;
    const click = expDec(t, 80) * (Math.random() * 0.5);
    const tone  = sine(Math.max(80, f), t) * expDec(t, 12) * 0.5;
    return (click + tone) * 0.7;
  });
}

function sfx_card_select() {
  return synth(0.08, t => sine(700, t) * expDec(t, 30) * 0.3);
}

function sfx_button() {
  // Wood click
  const hp = makeHP();
  return synth(0.06, t => {
    const click = noise() * expDec(t, 100);
    return hp(click, 0.7) * 0.6;
  });
}

function sfx_hit_light() {
  // Punchy mid hit
  const lp = makeLP();
  return synth(0.18, t => {
    const body = sine(180 - t * 200, t) * expDec(t, 20);
    const crack = noise() * expDec(t, 40) * 0.6;
    return lp(body + crack, 0.4) * 0.85;
  });
}

function sfx_hit_heavy() {
  // Deeper impact, longer tail, with body resonance
  const lp = makeLP();
  return synth(0.45, t => {
    const sub  = sine(60, t) * expDec(t, 6);
    const body = sine(140 - t * 60, t) * expDec(t, 14);
    const crack = noise() * expDec(t, 25) * 0.5;
    return lp(sub + body + crack, 0.35) * 0.9;
  });
}

function sfx_block() {
  // Metallic clang — multiple sine partials + noise
  return synth(0.35, t => {
    const env = expDec(t, 8);
    const partials = sine(800, t) + 0.6 * sine(1300, t) + 0.4 * sine(2100, t) + 0.3 * sine(3500, t);
    const transient = noise() * expDec(t, 60) * 0.5;
    return (partials * 0.18 + transient) * env;
  });
}

function sfx_heal() {
  // Sparkly upward sweep, two octaves
  return synth(0.55, t => {
    const f = 440 + t * 800;
    const a = sine(f, t) + 0.5 * sine(f * 2, t) * sine(6, t);  // chorus tremolo
    const env = arEnv(t, 0.55, 0.05, 0.4);
    return a * 0.25 * env;
  });
}

function sfx_death() {
  // Descending wail
  return synth(0.7, t => {
    const f = 220 - t * 200;
    const tone = saw(Math.max(40, f), t) * 0.4;
    const env = expDec(t, 3);
    return tone * env * 0.5;
  });
}

function sfx_attack_slash() {
  // Whoosh — bandpassed noise sweep
  const lp = makeLP();
  const hp = makeHP();
  return synth(0.22, t => {
    const c = 0.05 + t * 10;
    const n = lp(noise(), Math.min(c, 0.9));
    const out = hp(n, 0.4);
    const env = arEnv(t, 0.22, 0.02, 0.18);
    return out * env * 0.7;
  });
}

function sfx_attack_magic() {
  // Rising chime
  return synth(0.4, t => {
    const f = 440 * Math.pow(2, t * 1.2);
    const tone = sine(f, t) + 0.4 * sine(f * 1.5, t) + 0.25 * sine(f * 2, t);
    const shimmer = sine(2000 + t * 4000, t) * 0.15 * expDec(t, 6);
    const env = arEnv(t, 0.4, 0.03, 0.3);
    return (tone * 0.18 + shimmer) * env;
  });
}

function sfx_attack_special() {
  // Big power chord with sub
  return synth(0.6, t => {
    const sub = sine(80, t) * 0.5;
    const ch  = saw(110, t) * 0.25 + saw(165, t) * 0.25 + saw(220, t) * 0.25;
    const env = expDec(t, 4);
    return (sub + ch) * env * 0.55;
  });
}

function sfx_energy_use() {
  // Quick electric zap
  return synth(0.15, t => {
    const f = 1200 - t * 800;
    const fm = sine(f + sine(40, t) * 200, t);
    const env = expDec(t, 18);
    return fm * env * 0.35;
  });
}

function sfx_turn_end() {
  // Low whoosh down
  const lp = makeLP();
  return synth(0.4, t => {
    const c = 0.5 - t * 0.6;
    const n = lp(noise(), Math.max(0.05, c));
    const env = expDec(t, 5);
    return n * env * 0.6;
  });
}

function sfx_victory() {
  // Ascending arpeggio
  const notes = [261.6, 329.6, 392.0, 523.3];  // C E G C
  return synth(1.2, t => {
    let total = 0;
    notes.forEach((f, i) => {
      const startT = i * 0.18;
      if (t >= startT) {
        const localT = t - startT;
        const env = expDec(localT, 4);
        total += sine(f, t) * env * 0.25;
      }
    });
    return total;
  });
}

function sfx_defeat() {
  // Sad descending tone
  return synth(1.5, t => {
    const f = 220 * Math.pow(0.5, t * 0.7);
    const tone = sine(f, t) * 0.4 + sine(f * 1.5, t) * 0.15;
    const env = expDec(t, 1.5);
    return tone * env * 0.5;
  });
}

function sfx_gold() {
  // Coin clink — two high pings
  return synth(0.3, t => {
    let s = 0;
    if (t < 0.15) {
      const env = expDec(t, 18);
      s += sine(2400, t) * env * 0.25;
      s += sine(3600, t) * env * 0.15;
    }
    if (t > 0.06 && t < 0.3) {
      const lt = t - 0.06;
      const env = expDec(lt, 18);
      s += sine(3000, t) * env * 0.25;
      s += sine(4500, t) * env * 0.15;
    }
    return s;
  });
}

function sfx_level_up() {
  // Ascending sparkle
  return synth(0.7, t => {
    const f = 440 + t * 1200;
    const tone = sine(f, t) + 0.5 * sine(f * 2, t);
    const sparkle = sine(4000 + sine(8, t) * 800, t) * 0.2 * expDec(t, 3);
    const env = expDec(t, 2.5);
    return (tone * 0.18 + sparkle) * env;
  });
}

// ── Music: simple ambient loops ────────────────────────────────────────────

// Simple chord pad with detuned saws
function chordPad(durSec, freqs, volume = 0.12) {
  const lp = makeLP();
  return synth(durSec, t => {
    let s = 0;
    freqs.forEach(f => {
      // Detuned dual saw
      s += saw(f, t) * 0.5;
      s += saw(f * 1.005, t) * 0.5;
    });
    s /= freqs.length;
    s = lp(s, 0.08);  // smooth low-pass
    // Slow LFO on amplitude for breathing
    const breathe = 0.85 + 0.15 * sine(0.2, t);
    return s * volume * breathe;
  });
}

function music_menu() {
  // 32-second loop, gentle minor chord pad
  const dur = 32;
  // C minor → Ab major → G minor → C minor (each 8s)
  const N = Math.floor(SR * dur);
  const out = new Float32Array(N);
  const chords = [
    [130.8, 155.6, 196.0],   // Cm
    [103.8, 130.8, 155.6],   // Ab
    [98.0, 116.5, 146.8],    // Gm
    [130.8, 155.6, 196.0],   // Cm
  ];
  for (let c = 0; c < chords.length; c++) {
    const start = Math.floor(c * (dur / chords.length) * SR);
    const segLen = Math.floor((dur / chords.length) * SR);
    const segData = chordPad(dur / chords.length, chords[c], 0.12);
    for (let i = 0; i < segLen && start + i < N; i++) {
      // Crossfade at boundaries to avoid clicks
      const fadeIn  = i < SR * 0.3 ? i / (SR * 0.3) : 1;
      const fadeOut = i > segLen - SR * 0.3 ? (segLen - i) / (SR * 0.3) : 1;
      out[start + i] += segData[i] * Math.min(fadeIn, fadeOut);
    }
  }
  return out;
}

function music_combat() {
  // 24-second darker loop with rhythmic pulse
  const dur = 24;
  const N = Math.floor(SR * dur);
  const out = new Float32Array(N);
  const lp = makeLP();
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    // Bass drone (Em)
    const bass = saw(82.4, t) * 0.18;
    // Pad chord (E G B)
    const pad = (saw(164.8, t) + saw(196.0, t) + saw(246.9, t)) / 3 * 0.1;
    // Rhythmic pulse on quarter notes (120bpm = 0.5s/beat)
    const beat = (t % 0.5) / 0.5;
    const pulse = beat < 0.05 ? sine(60, t) * (0.05 - beat) / 0.05 * 0.6 : 0;

    let s = bass + pad + pulse;
    s = lp(s, 0.18);

    // Crossfade boundaries
    const fadeIn  = t < 0.5 ? t / 0.5 : 1;
    const fadeOut = t > dur - 0.5 ? (dur - t) / 0.5 : 1;
    out[i] = s * Math.min(fadeIn, fadeOut) * 0.9;
  }
  return out;
}

function music_boss() {
  // 24-second tense, dissonant
  const dur = 24;
  const N = Math.floor(SR * dur);
  const out = new Float32Array(N);
  const lp = makeLP();
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    // Heavy detuned bass — F minor ish
    const sub = sine(43.6, t) * 0.25;
    const bass = (saw(87.3, t) + saw(87.7, t)) * 0.5 * 0.18;
    // Dissonant high stab every 2 beats
    const stabPhase = (t % 1.0);
    const stab = stabPhase < 0.08 ? square(370, t) * (0.08 - stabPhase) / 0.08 * 0.08 : 0;
    // Slow tremolo
    const trem = 0.7 + 0.3 * sine(0.5, t);

    let s = (sub + bass) * trem + stab;
    s = lp(s, 0.18);

    const fadeIn  = t < 0.5 ? t / 0.5 : 1;
    const fadeOut = t > dur - 0.5 ? (dur - t) / 0.5 : 1;
    out[i] = s * Math.min(fadeIn, fadeOut);
  }
  return out;
}

function music_shop() {
  // 16s gentle major pad
  return chordPad(16, [261.6, 329.6, 392.0], 0.12);
}

function music_rest() {
  // 16s warm minor pad
  return chordPad(16, [220, 261.6, 329.6], 0.12);
}

// ── Generate all ────────────────────────────────────────────────────────────
const SFX = {
  card_draw:      sfx_card_draw,
  card_play:      sfx_card_play,
  card_select:    sfx_card_select,
  button:         sfx_button,
  hit_light:      sfx_hit_light,
  hit_heavy:      sfx_hit_heavy,
  block:          sfx_block,
  heal:           sfx_heal,
  death:          sfx_death,
  attack_slash:   sfx_attack_slash,
  attack_magic:   sfx_attack_magic,
  attack_special: sfx_attack_special,
  energy_use:     sfx_energy_use,
  turn_end:       sfx_turn_end,
  victory:        sfx_victory,
  defeat:         sfx_defeat,
  gold:           sfx_gold,
  level_up:       sfx_level_up,
};

const MUSIC = {
  menu:   music_menu,
  combat: music_combat,
  boss:   music_boss,
  shop:   music_shop,
  rest:   music_rest,
};

console.log('Generating SFX…');
for (const [name, fn] of Object.entries(SFX)) {
  const samples = fn();
  const out = join(SFX_DIR, name + '.wav');
  writeWav(out, samples);
  console.log(`  ✓ sfx/${name}.wav  (${(samples.length / SR).toFixed(2)}s)`);
}

console.log('\nGenerating music loops (this may take ~5s)…');
for (const [name, fn] of Object.entries(MUSIC)) {
  const samples = fn();
  const out = join(MUSIC_DIR, name + '.wav');
  writeWav(out, samples);
  const mb = (samples.length * 2 / 1024 / 1024).toFixed(1);
  console.log(`  ✓ music/${name}.wav  (${(samples.length / SR).toFixed(0)}s, ${mb}MB)`);
}

console.log('\n✅ All audio synthesized. Reload the game to hear it.');
console.log('   Replace any file with a real one whenever you want.');
