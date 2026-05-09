import type { Enemy } from '../types';

function makeEnemy(base: Omit<Enemy, 'isAlive' | 'currentMoveIndex' | 'block' | 'statusEffects' | 'intent'>): Enemy {
  const first = base.movePattern[0];
  return {
    ...base,
    block: 0,
    statusEffects: [],
    isAlive: true,
    currentMoveIndex: 0,
    intent: { type: first.type === 'attack' ? 'attack' : first.type === 'defend' ? 'defend' : 'buff', value: first.value },
  };
}

export type EnemyTemplate = Omit<Enemy, 'isAlive' | 'currentMoveIndex' | 'block' | 'statusEffects' | 'intent'> & { hpRange?: [number, number] };

export const ENEMY_TEMPLATES: Record<string, EnemyTemplate> = {
  cultist: {
    id: 'cultist', name: 'Cultist',
    maxHp: 48, currentHp: 48,
    movePattern: [
      { type: 'buff', description: 'Incantation (Ritual +3)', status: 'Ritual', statusValue: 3 },
      { type: 'attack', value: 6, description: 'Dark Strike (6)' },
    ],
  },
  jaw_worm: {
    id: 'jaw_worm', name: 'Jaw Worm',
    maxHp: 44, currentHp: 44,
    movePattern: [
      { type: 'attack', value: 11, description: 'Chomp (11)' },
      { type: 'defend', description: 'Thrash (Gain 6 Block)', value: 6 },
      { type: 'attack', value: 7, description: 'Bellow (7 + 5 Block)', statusValue: 5 },
    ],
  },
  louse_red: {
    id: 'louse_red', name: 'Red Louse',
    maxHp: 12, currentHp: 12,
    movePattern: [
      { type: 'attack', value: 5, description: 'Bite (5)' },
      { type: 'attack', value: 5, description: 'Bite (5)' },
      { type: 'buff', description: 'Curl Up (Strength +3)', status: 'Strength', statusValue: 3 },
    ],
  },
  louse_green: {
    id: 'louse_green', name: 'Green Louse',
    maxHp: 14, currentHp: 14,
    movePattern: [
      { type: 'attack', value: 6, description: 'Bite (6)' },
      { type: 'debuff', description: 'Spit Web (Weak 2)', status: 'Weak', statusValue: 2 },
    ],
  },
  acid_slime_m: {
    id: 'acid_slime_m', name: 'Acid Slime',
    maxHp: 65, currentHp: 65,
    movePattern: [
      { type: 'debuff', description: 'Corrosive Spit (Weak 1)', status: 'Weak', statusValue: 1 },
      { type: 'attack', value: 10, description: 'Tackle (10)' },
      { type: 'debuff', description: 'Lick (Weak 1)', status: 'Weak', statusValue: 1 },
    ],
  },
  spike_slime_m: {
    id: 'spike_slime_m', name: 'Spike Slime',
    maxHp: 28, currentHp: 28,
    movePattern: [
      { type: 'debuff', description: 'Flame Tackle (Frail 1)', status: 'Vulnerable', statusValue: 1 },
      { type: 'attack', value: 8, description: 'Lunge (8)' },
    ],
  },
  fungus_beast: {
    id: 'fungus_beast', name: 'Fungus Beast',
    maxHp: 30, currentHp: 30,
    movePattern: [
      { type: 'buff', description: 'Grow (+3 Strength)', status: 'Strength', statusValue: 3 },
      { type: 'attack', value: 6, description: 'Bite (6)' },
      { type: 'attack', value: 6, description: 'Bite (6)' },
    ],
  },
  snake_plant: {
    id: 'snake_plant', name: 'Snake Plant',
    maxHp: 75, currentHp: 75,
    movePattern: [
      { type: 'attack', value: 7, description: 'Chomp (7)' },
      { type: 'buff', description: 'Ritual (+3 Str)', status: 'Ritual', statusValue: 3 },
      { type: 'attack', value: 7, description: 'Chomp (7)' },
    ],
  },
  // Elites
  gremlin_nob: {
    id: 'gremlin_nob', name: 'Gremlin Nob',
    maxHp: 85, currentHp: 85,
    movePattern: [
      { type: 'buff', description: 'Bellow (+2 Str, Skill dmg)', status: 'Strength', statusValue: 2 },
      { type: 'attack', value: 14, description: 'Skull Bash (14)' },
      { type: 'attack', value: 8, description: 'Rush (8)' },
    ],
  },
  lagavulin: {
    id: 'lagavulin', name: 'Lagavulin',
    maxHp: 112, currentHp: 112,
    movePattern: [
      { type: 'special', description: 'Sleep (No action)', value: 0 },
      { type: 'special', description: 'Sleep (No action)', value: 0 },
      { type: 'attack', value: 18, description: 'Siphon Soul (18, -1 Str -1 Dex)' },
    ],
  },
  // Boss
  slime_boss: {
    id: 'slime_boss', name: 'Slime Boss',
    maxHp: 140, currentHp: 140,
    movePattern: [
      { type: 'attack', value: 16, description: 'Goop Spray (Apply Slimed)' },
      { type: 'defend', value: 0, description: 'Preparing (no action)' },
      { type: 'attack', value: 35, description: 'Slam (35)' },
    ],
  },
  the_guardian: {
    id: 'the_guardian', name: 'The Guardian',
    maxHp: 240, currentHp: 240,
    movePattern: [
      { type: 'attack', value: 9, description: 'Charging Up (9)' },
      { type: 'attack', value: 11, description: 'Fierce Bash (11)' },
      { type: 'defend', value: 30, description: 'Roll Attack (30 Block)' },
      { type: 'attack', value: 9, description: 'Twin Slam (9x2)' },
    ],
  },
  hexaghost: {
    id: 'hexaghost', name: 'Hexaghost',
    maxHp: 250, currentHp: 250,
    movePattern: [
      { type: 'special', description: 'Activate (Divider)', value: 0 },
      { type: 'attack', value: 2, description: 'Inferno (6x2)' },
      { type: 'attack', value: 3, description: 'Sear (3x6)' },
      { type: 'buff', description: 'Inflame (+2 Burn)', value: 0, status: 'Burn', statusValue: 2 },
    ],
  },
};

export function spawnEnemy(id: string, hpVariance = 0): Enemy {
  const template = ENEMY_TEMPLATES[id];
  if (!template) throw new Error(`Unknown enemy: ${id}`);
  const hp = template.maxHp + Math.floor(Math.random() * hpVariance * 2) - hpVariance;
  return makeEnemy({ ...template, maxHp: hp, currentHp: hp, id: `${id}_${Date.now()}` });
}

export function getAct1Encounters(): string[][] {
  return [
    ['cultist'],
    ['jaw_worm'],
    ['louse_red', 'louse_green'],
    ['acid_slime_m'],
    ['spike_slime_m', 'louse_red'],
    ['fungus_beast'],
    ['snake_plant'],
  ];
}

export function getEliteEncounters(): string[][] {
  return [
    ['gremlin_nob'],
    ['lagavulin'],
  ];
}

export function getBossEncounters(): string[] {
  return ['slime_boss', 'the_guardian', 'hexaghost'];
}
