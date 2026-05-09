import type { Relic } from '../types';

export const ALL_RELICS: Relic[] = [
  // Starter
  { id: 'burning_blood', name: 'Burning Blood', description: 'At the end of combat, heal 6 HP.', tier: 'Starter', trigger: 'combat_end' },
  { id: 'cracked_core', name: 'Cracked Core', description: 'At the start of each combat, Channel 1 Lightning orb.', tier: 'Starter', trigger: 'combat_start' },
  // Common
  { id: 'ring_of_snake', name: 'Ring of the Snake', description: 'At the start of each combat, draw 2 additional cards.', tier: 'Common', trigger: 'combat_start', price: 150 },
  { id: 'bag_of_marbles', name: 'Bag of Marbles', description: 'At the start of each combat, apply 1 Vulnerable to ALL enemies.', tier: 'Common', trigger: 'combat_start', price: 150 },
  { id: 'vajra', name: 'Vajra', description: 'At the start of each combat, gain 1 Strength.', tier: 'Common', trigger: 'combat_start', price: 150 },
  { id: 'anchor', name: 'Anchor', description: 'At the start of each combat, gain 10 Block.', tier: 'Common', trigger: 'combat_start', price: 150 },
  { id: 'bronze_scales', name: 'Bronze Scales', description: 'Whenever you take damage, deal 3 damage back.', tier: 'Common', trigger: 'on_damage', price: 150 },
  { id: 'centennial_puzzle', name: 'Centennial Puzzle', description: 'The first time you lose HP each combat, draw 3 cards.', tier: 'Common', trigger: 'first_damage', price: 150 },
  // Uncommon
  { id: 'oddly_smooth_stone', name: 'Oddly Smooth Stone', description: 'At the start of each combat, gain 1 Dexterity.', tier: 'Uncommon', trigger: 'combat_start', price: 200 },
  { id: 'gremlin_horn', name: 'Gremlin Horn', description: 'Whenever an enemy dies, gain 1 Energy and draw 1 card.', tier: 'Uncommon', trigger: 'enemy_die', price: 200 },
  { id: 'paper_frog', name: 'Paper Frog', description: 'Whenever you enter a Rest Site, heal an additional 5 HP.', tier: 'Uncommon', trigger: 'rest', price: 200 },
  { id: 'dead_branch', name: 'Dead Branch', description: 'Whenever you Exhaust a card, add a random card to your hand.', tier: 'Uncommon', trigger: 'exhaust', price: 200 },
  { id: 'bag_of_preparation', name: 'Bag of Preparation', description: 'At the start of each combat, draw 2 additional cards.', tier: 'Uncommon', trigger: 'combat_start', price: 200 },
  // Rare
  { id: 'coffee_dripper', name: 'Coffee Dripper', description: 'Gain 1 Energy each turn. You can no longer Rest at Rest Sites.', tier: 'Rare', trigger: 'turn_start', price: 250 },
  { id: 'lizard_tail', name: 'Lizard Tail', description: 'When you would die, heal to 50% of your max HP instead. (Works once.)', tier: 'Rare', trigger: 'would_die', price: 250 },
  { id: 'philosophers_stone', name: "Philosopher's Stone", description: 'Gain 1 Energy each turn. ALL enemies start with 1 Strength.', tier: 'Rare', trigger: 'turn_start', price: 250 },
  // Boss
  { id: 'runic_dome', name: 'Runic Dome', description: 'Gain 1 extra Energy each turn. You can no longer see enemy intent.', tier: 'Boss', trigger: 'turn_start' },
  { id: 'fusion_hammer', name: 'Fusion Hammer', description: 'Gain 1 extra Energy each turn. You can no longer Smith at Rest Sites.', tier: 'Boss', trigger: 'turn_start' },
  { id: 'sozu', name: 'Sozu', description: 'Gain 1 extra Energy each turn. You can no longer obtain Potions.', tier: 'Boss', trigger: 'turn_start' },
];

export function getRandomRelic(tier?: Relic['tier']): Relic {
  const pool = tier ? ALL_RELICS.filter(r => r.tier === tier) : ALL_RELICS.filter(r => r.tier === 'Common' || r.tier === 'Uncommon');
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getShopRelics(count = 2): Relic[] {
  const pool = ALL_RELICS.filter(r => r.price !== undefined);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
