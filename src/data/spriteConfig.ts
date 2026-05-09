export interface SpriteAnimDef {
  row: number;
  yPx?: number;        // absolute y-pixel offset (overrides row * frameHeight)
  frameCount: number;
  fps?: number;
  startCol?: number;
}

export interface SpriteSheetConfig {
  src: string;
  frameWidth: number;
  frameHeight: number;
  sheetCols: number;   // total columns in the sprite sheet
  scale?: number;
  bgColor?: string;
  animations: Record<string, SpriteAnimDef>;
}

// Gon Freecss — tight-cropped idle sheet
// gon_idle.png: 160×107 (4 frames of 40×107)
// scale 3.2 → display ~128×342px (matches Killua ~345px)
export const GON_SPRITE: SpriteSheetConfig = {
  src: '/sprites/gon_idle.png',
  frameWidth: 40,
  frameHeight: 107,
  sheetCols: 4,
  scale: 3.2,
  bgColor: 'transparent',
  animations: {
    idle:    { row: 0, frameCount: 4, fps: 4 },
    walk:    { row: 0, frameCount: 4, fps: 4 },
    attack:  { row: 0, frameCount: 4, fps: 4 },
    attack2: { row: 0, frameCount: 4, fps: 4 },
    hurt:    { row: 0, frameCount: 4, fps: 4 },
    death:   { row: 0, frameCount: 4, fps: 4 },
    special: { row: 0, frameCount: 4, fps: 4 },
    victory: { row: 0, frameCount: 4, fps: 4 },
  },
};

// Killua — extracted front-view from Aseprite showcase (148×406, single frame)
// CSS breathing animation handles idle motion; scale 0.85 → ~126×345px display
export const DEFECT_SPRITE: SpriteSheetConfig = {
  src: '/sprites/killua_clean.png',
  frameWidth: 148,
  frameHeight: 406,
  sheetCols: 1,
  scale: 0.85,
  bgColor: 'transparent',
  animations: {
    idle:    { row: 0, frameCount: 1, fps: 1 },
    walk:    { row: 0, frameCount: 1, fps: 1 },
    attack:  { row: 0, frameCount: 1, fps: 1 },
    attack2: { row: 0, frameCount: 1, fps: 1 },
    hurt:    { row: 0, frameCount: 1, fps: 1 },
    death:   { row: 0, frameCount: 1, fps: 1 },
    special: { row: 0, frameCount: 1, fps: 1 },
    victory: { row: 0, frameCount: 1, fps: 1 },
  },
};

// Kuroro Lucifer — single tight-cropped pose for all enemies
// kuroro_idle.png: 54×98 (one clean standing frame)
// scale 3.5 → display ~189×343px; per-enemy scale multiplier applied in EnemyComponent
export const KURORO_SPRITE: SpriteSheetConfig = {
  src: '/sprites/kuroro_idle.png',
  frameWidth: 54,
  frameHeight: 98,
  sheetCols: 1,
  scale: 5.0,
  bgColor: 'transparent',
  animations: {
    idle:    { row: 0, frameCount: 1, fps: 1 },
    walk:    { row: 0, frameCount: 1, fps: 1 },
    attack:  { row: 0, frameCount: 1, fps: 1 },
    attack2: { row: 0, frameCount: 1, fps: 1 },
    hurt:    { row: 0, frameCount: 1, fps: 1 },
    death:   { row: 0, frameCount: 1, fps: 1 },
    special: { row: 0, frameCount: 1, fps: 1 },
    taunt:   { row: 0, frameCount: 1, fps: 1 },
  },
};
