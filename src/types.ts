export type CardType = 'Attack' | 'Skill' | 'Power' | 'Curse';
export type StatusEffectType = 'Weak' | 'Vulnerable' | 'Poison' | 'Strength' | 'Dexterity' | 'Ritual' | 'Burn' | 'Focus';
export type NodeType = 'combat' | 'elite' | 'boss' | 'shop' | 'rest' | 'event' | 'treasure';
export type CharacterId = 'ironclad' | 'defect';
export type OrbType = 'Lightning' | 'Frost' | 'Dark' | 'Plasma';

export interface CardEffect {
  type: 'damage' | 'block' | 'status' | 'draw' | 'energy' | 'heal' | 'orb' | 'evoke' | 'special';
  value: number;
  target?: 'self' | 'enemy' | 'all_enemies';
  status?: StatusEffectType;
  special?: string;
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  cost: number | 'X';
  description: string;
  effects: CardEffect[];
  upgraded: boolean;
  exhausts: boolean;
  innate?: boolean;
  retain?: boolean;
  ethereal?: boolean;
  characterId: CharacterId;
  baseId: string;
}

export interface StatusEffect {
  type: StatusEffectType;
  value: number;
}

export interface Character {
  id: CharacterId;
  name: string;
  maxHp: number;
  currentHp: number;
  block: number;
  energy: number;
  maxEnergy: number;
  deck: Card[];
  hand: Card[];
  drawPile: Card[];
  discardPile: Card[];
  exhaustPile: Card[];
  relics: Relic[];
  potions: Potion[];
  statusEffects: StatusEffect[];
  orbs?: Orb[];
  maxOrbs?: number;
  focus?: number;
}

export interface Orb {
  type: OrbType;
  passive: number;
  evoke: number;
}

export interface Enemy {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  block: number;
  intent: EnemyIntent;
  statusEffects: StatusEffect[];
  movePattern: EnemyMove[];
  currentMoveIndex: number;
  isAlive: boolean;
}

export interface EnemyMove {
  type: 'attack' | 'defend' | 'buff' | 'debuff' | 'special';
  value?: number;
  status?: StatusEffectType;
  statusValue?: number;
  description: string;
}

export interface EnemyIntent {
  type: 'attack' | 'defend' | 'buff' | 'debuff' | 'unknown';
  value?: number;
}

export interface Relic {
  id: string;
  name: string;
  description: string;
  tier: 'Starter' | 'Common' | 'Uncommon' | 'Rare' | 'Boss' | 'Special';
  trigger: string;
  price?: number;
}

export interface Potion {
  id: string;
  name: string;
  description: string;
  price?: number;
}

export interface MapNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  connections: string[];
  visited: boolean;
  available: boolean;
  row: number;
  col: number;
}

export interface GameRun {
  character: Character;
  currentFloor: number;
  currentAct: number;
  map: MapNode[];
  currentNodeId: string | null;
  gold: number;
  score: number;
  enemiesSlain: number;
  damageDealt: number;
  turnsPlayed: number;
}

export type GameScreen =
  | 'menu'
  | 'character_select'
  | 'map'
  | 'combat'
  | 'elite_combat'
  | 'boss_combat'
  | 'shop'
  | 'rest'
  | 'event'
  | 'reward'
  | 'treasure'
  | 'game_over'
  | 'victory';

export interface CombatState {
  enemies: Enemy[];
  turn: number;
  phase: 'player' | 'enemy' | 'reward';
  energyUsed: number;
  isAnimating: boolean;
  selectedCardIndex: number | null;
  combatLog: string[];
  goldReward: number;
  cardRewards: Card[];
  relicReward: Relic | null;
}
