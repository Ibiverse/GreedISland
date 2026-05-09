import type { Potion } from '../types';

export const ALL_POTIONS: Potion[] = [
  { id: 'health_potion', name: 'Health Potion', description: 'Heal 50% of your max HP.', price: 50 },
  { id: 'fire_potion', name: 'Fire Potion', description: 'Deal 20 damage to target enemy.', price: 50 },
  { id: 'strength_potion', name: 'Strength Potion', description: 'Gain 2 Strength for this combat.', price: 50 },
  { id: 'block_potion', name: 'Block Potion', description: 'Gain 12 Block.', price: 50 },
  { id: 'energy_potion', name: 'Energy Potion', description: 'Gain 2 Energy this turn.', price: 50 },
  { id: 'draw_potion', name: 'Draw Potion', description: 'Draw 3 cards.', price: 50 },
  { id: 'explosive_potion', name: 'Explosive Potion', description: 'Deal 10 damage to ALL enemies.', price: 50 },
  { id: 'weak_potion', name: 'Weak Potion', description: 'Apply 3 Weak to target enemy.', price: 50 },
];

export function getShopPotions(count = 2): Potion[] {
  const shuffled = [...ALL_POTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
