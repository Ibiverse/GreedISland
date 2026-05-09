import { Howl } from 'howler';

/**
 * Centralized audio manager. All sounds defined in one place.
 * Missing files don't crash — Howler logs and skips them.
 *
 * Volume settings persist to localStorage so they survive refresh.
 */

type SfxKey =
  | 'card_draw' | 'card_play' | 'card_select' | 'button'
  | 'hit_light' | 'hit_heavy' | 'block' | 'heal' | 'death'
  | 'attack_slash' | 'attack_magic' | 'attack_special'
  | 'energy_use' | 'turn_end' | 'victory' | 'defeat' | 'gold' | 'level_up';

type MusicKey = 'menu' | 'combat' | 'boss' | 'shop' | 'rest';

const SFX_FILES: Record<SfxKey, string[]> = {
  card_draw:      ['/sounds/sfx/card_draw.wav'],
  card_play:      ['/sounds/sfx/card_play.wav'],
  card_select:    ['/sounds/sfx/card_select.wav'],
  button:         ['/sounds/sfx/button.wav'],
  hit_light:      ['/sounds/sfx/hit_light.wav'],
  hit_heavy:      ['/sounds/sfx/hit_heavy.wav'],
  block:          ['/sounds/sfx/block.wav'],
  heal:           ['/sounds/sfx/heal.wav'],
  death:          ['/sounds/sfx/death.wav'],
  attack_slash:   ['/sounds/sfx/attack_slash.wav'],
  attack_magic:   ['/sounds/sfx/attack_magic.wav'],
  attack_special: ['/sounds/sfx/attack_special.wav'],
  energy_use:     ['/sounds/sfx/energy_use.wav'],
  turn_end:       ['/sounds/sfx/turn_end.wav'],
  victory:        ['/sounds/sfx/victory.wav'],
  defeat:         ['/sounds/sfx/defeat.wav'],
  gold:           ['/sounds/sfx/gold.wav'],
  level_up:       ['/sounds/sfx/level_up.wav'],
};

// Howler tries each src in order, falls through to the next on load failure.
// Drop in either .mp3 or .wav — whichever exists wins.
const MUSIC_FILES: Record<MusicKey, string[]> = {
  menu:   ['/sounds/music/menu.mp3',   '/sounds/music/menu.wav'],
  combat: ['/sounds/music/combat.mp3', '/sounds/music/combat.wav'],
  boss:   ['/sounds/music/boss.mp3',   '/sounds/music/boss.wav'],
  shop:   ['/sounds/music/shop.mp3',   '/sounds/music/shop.wav'],
  rest:   ['/sounds/music/rest.mp3',   '/sounds/music/rest.wav'],
};

class AudioManager {
  private sfxCache = new Map<SfxKey, Howl>();
  private musicCache = new Map<MusicKey, Howl>();
  private currentMusic: { key: MusicKey; howl: Howl } | null = null;
  private musicVol = 0.4;
  private sfxVol = 0.6;
  private muted = false;

  constructor() {
    // Restore volume from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('audio_settings') || '{}');
      if (typeof saved.musicVol === 'number') this.musicVol = saved.musicVol;
      if (typeof saved.sfxVol === 'number')   this.sfxVol   = saved.sfxVol;
      if (typeof saved.muted === 'boolean')   this.muted    = saved.muted;
    } catch {/* ignore */}
  }

  private save() {
    try {
      localStorage.setItem('audio_settings', JSON.stringify({
        musicVol: this.musicVol, sfxVol: this.sfxVol, muted: this.muted,
      }));
    } catch {/* ignore */}
  }

  /** Play a one-shot sound effect. Safe to call before file loads. */
  sfx(key: SfxKey, opts: { rate?: number; volume?: number } = {}) {
    if (this.muted) return;
    let howl = this.sfxCache.get(key);
    if (!howl) {
      howl = new Howl({
        src: SFX_FILES[key],
        volume: this.sfxVol * (opts.volume ?? 1),
        preload: true,
        onloaderror: () => { /* missing file → silent */ },
        onplayerror: () => { /* ignore */ },
      });
      this.sfxCache.set(key, howl);
    }
    const id = howl.play();
    if (opts.rate) howl.rate(opts.rate, id);
    if (opts.volume != null) howl.volume(this.sfxVol * opts.volume, id);
  }

  /** Switch background music. Crossfades from current track. */
  playMusic(key: MusicKey) {
    // Same key: if it's already playing, do nothing.
    // If it stopped for any reason (autoplay block, finished, etc.), restart it.
    if (this.currentMusic?.key === key) {
      const h = this.currentMusic.howl;
      if (!this.muted && !h.playing()) {
        h.play();
        h.fade(0, this.musicVol, 600);
      }
      return;
    }

    // Fade out current
    if (this.currentMusic) {
      const old = this.currentMusic.howl;
      old.fade(old.volume(), 0, 800);
      setTimeout(() => old.stop(), 800);
    }

    let howl = this.musicCache.get(key);
    if (!howl) {
      howl = new Howl({
        src: MUSIC_FILES[key],
        loop: true,
        volume: 0,
        html5: true,
        onloaderror: (_id, err) => console.warn(`[audio] music ${key} load error:`, err),
        onplayerror: (_id, err) => {
          console.warn(`[audio] music ${key} play error (likely autoplay blocked):`, err);
          // Re-try on first user interaction
          howl!.once('unlock', () => howl!.play());
        },
      });
      this.musicCache.set(key, howl);
    }
    if (!this.muted) {
      howl.play();
      howl.fade(0, this.musicVol, 1000);
    }
    this.currentMusic = { key, howl };
  }

  /** Call this from a user-interaction handler (e.g. button click) to unlock audio. */
  unlock() {
    if (this.currentMusic && !this.muted) {
      const h = this.currentMusic.howl;
      if (!h.playing()) {
        h.play();
        h.fade(0, this.musicVol, 600);
      }
    }
  }

  stopMusic() {
    if (this.currentMusic) {
      const old = this.currentMusic.howl;
      old.fade(old.volume(), 0, 600);
      setTimeout(() => old.stop(), 600);
      this.currentMusic = null;
    }
  }

  setMusicVolume(v: number) {
    this.musicVol = Math.max(0, Math.min(1, v));
    if (this.currentMusic && !this.muted) this.currentMusic.howl.volume(this.musicVol);
    this.save();
  }

  setSfxVolume(v: number) {
    this.sfxVol = Math.max(0, Math.min(1, v));
    this.save();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (m) {
      if (this.currentMusic) this.currentMusic.howl.volume(0);
    } else {
      if (this.currentMusic) this.currentMusic.howl.volume(this.musicVol);
    }
    this.save();
  }

  getSettings() {
    return { musicVol: this.musicVol, sfxVol: this.sfxVol, muted: this.muted };
  }
}

export const audio = new AudioManager();

// Make available in browser console for testing: window.audio
if (typeof window !== 'undefined') (window as { audio?: AudioManager }).audio = audio;
