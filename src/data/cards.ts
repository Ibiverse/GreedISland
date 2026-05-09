import type { Card, CharacterId } from '../types';

const makeCard = (base: Omit<Card, 'upgraded' | 'baseId'>): Card => ({
  ...base,
  upgraded: false,
  baseId: base.id,
});

// ─── IRONCLAD CARDS ───────────────────────────────────────────────────────────

export const IRONCLAD_CARDS: Card[] = [
  makeCard({
    id: 'strike_r', name: 'Strike', type: 'Attack', cost: 1, characterId: 'ironclad', exhausts: false,
    description: 'Deal 6 damage.',
    effects: [{ type: 'damage', value: 6, target: 'enemy' }],
  }),
  makeCard({
    id: 'defend_r', name: 'Defend', type: 'Skill', cost: 1, characterId: 'ironclad', exhausts: false,
    description: 'Gain 5 Block.',
    effects: [{ type: 'block', value: 5, target: 'self' }],
  }),
  makeCard({
    id: 'bash', name: 'Bash', type: 'Attack', cost: 2, characterId: 'ironclad', exhausts: false,
    description: 'Deal 8 damage. Apply 2 Vulnerable.',
    effects: [{ type: 'damage', value: 8, target: 'enemy' }, { type: 'status', value: 2, target: 'enemy', status: 'Vulnerable' }],
  }),
  makeCard({
    id: 'anger', name: 'Anger', type: 'Attack', cost: 0, characterId: 'ironclad', exhausts: false,
    description: 'Deal 6 damage. Add a copy to your discard pile.',
    effects: [{ type: 'damage', value: 6, target: 'enemy' }, { type: 'special', value: 0, special: 'anger_copy' }],
  }),
  makeCard({
    id: 'cleave', name: 'Cleave', type: 'Attack', cost: 1, characterId: 'ironclad', exhausts: false,
    description: 'Deal 8 damage to ALL enemies.',
    effects: [{ type: 'damage', value: 8, target: 'all_enemies' }],
  }),
  makeCard({
    id: 'flex', name: 'Flex', type: 'Skill', cost: 0, characterId: 'ironclad', exhausts: false,
    description: 'Gain 2 Strength. At end of turn, lose 2 Strength.',
    effects: [{ type: 'status', value: 2, target: 'self', status: 'Strength' }, { type: 'special', value: 0, special: 'flex_lose' }],
  }),
  makeCard({
    id: 'heavy_blade', name: 'Heavy Blade', type: 'Attack', cost: 2, characterId: 'ironclad', exhausts: false,
    description: 'Deal 14 damage. Strength affects this card 3x.',
    effects: [{ type: 'damage', value: 14, target: 'enemy' }, { type: 'special', value: 3, special: 'strength_mult' }],
  }),
  makeCard({
    id: 'impervious', name: 'Impervious', type: 'Skill', cost: 2, characterId: 'ironclad', exhausts: true,
    description: 'Gain 30 Block. Exhaust.',
    effects: [{ type: 'block', value: 30, target: 'self' }],
  }),
  makeCard({
    id: 'whirlwind', name: 'Whirlwind', type: 'Attack', cost: 'X', characterId: 'ironclad', exhausts: false,
    description: 'Deal 5 damage to ALL enemies X times.',
    effects: [{ type: 'damage', value: 5, target: 'all_enemies' }, { type: 'special', value: 0, special: 'x_times' }],
  }),
  makeCard({
    id: 'corruption', name: 'Corruption', type: 'Power', cost: 3, characterId: 'ironclad', exhausts: false,
    description: 'Skills cost 0. Whenever you play a Skill, Exhaust it.',
    effects: [{ type: 'special', value: 0, special: 'corruption' }],
  }),
  makeCard({
    id: 'iron_wave', name: 'Iron Wave', type: 'Attack', cost: 1, characterId: 'ironclad', exhausts: false,
    description: 'Gain 5 Block. Deal 5 damage.',
    effects: [{ type: 'block', value: 5, target: 'self' }, { type: 'damage', value: 5, target: 'enemy' }],
  }),
  makeCard({
    id: 'pommel_strike', name: 'Pommel Strike', type: 'Attack', cost: 1, characterId: 'ironclad', exhausts: false,
    description: 'Deal 9 damage. Draw 1 card.',
    effects: [{ type: 'damage', value: 9, target: 'enemy' }, { type: 'draw', value: 1 }],
  }),
  makeCard({
    id: 'shrug_it_off', name: 'Shrug It Off', type: 'Skill', cost: 1, characterId: 'ironclad', exhausts: false,
    description: 'Gain 8 Block. Draw 1 card.',
    effects: [{ type: 'block', value: 8, target: 'self' }, { type: 'draw', value: 1 }],
  }),
  makeCard({
    id: 'sword_boomerang', name: 'Sword Boomerang', type: 'Attack', cost: 1, characterId: 'ironclad', exhausts: false,
    description: 'Deal 3 damage to a random enemy 3 times.',
    effects: [{ type: 'damage', value: 3, target: 'enemy' }, { type: 'special', value: 3, special: 'multi_hit' }],
  }),
  makeCard({
    id: 'thunderclap', name: 'Thunderclap', type: 'Attack', cost: 1, characterId: 'ironclad', exhausts: false,
    description: 'Deal 4 damage and apply 1 Vulnerable to ALL enemies.',
    effects: [{ type: 'damage', value: 4, target: 'all_enemies' }, { type: 'status', value: 1, target: 'all_enemies', status: 'Vulnerable' }],
  }),
  makeCard({
    id: 'flame_barrier', name: 'Flame Barrier', type: 'Skill', cost: 2, characterId: 'ironclad', exhausts: false,
    description: 'Gain 12 Block. Whenever you are attacked this turn, deal 4 damage back.',
    effects: [{ type: 'block', value: 12, target: 'self' }, { type: 'special', value: 4, special: 'flame_barrier' }],
  }),
  makeCard({
    id: 'uppercut', name: 'Uppercut', type: 'Attack', cost: 2, characterId: 'ironclad', exhausts: false,
    description: 'Deal 13 damage. Apply 1 Weak. Apply 1 Vulnerable.',
    effects: [{ type: 'damage', value: 13, target: 'enemy' }, { type: 'status', value: 1, target: 'enemy', status: 'Weak' }, { type: 'status', value: 1, target: 'enemy', status: 'Vulnerable' }],
  }),
  makeCard({
    id: 'battle_trance', name: 'Battle Trance', type: 'Skill', cost: 0, characterId: 'ironclad', exhausts: false,
    description: 'Draw 3 cards. You cannot draw additional cards this turn.',
    effects: [{ type: 'draw', value: 3 }],
  }),
  makeCard({
    id: 'wild_strike', name: 'Wild Strike', type: 'Attack', cost: 1, characterId: 'ironclad', exhausts: false,
    description: 'Deal 12 damage. Shuffle a Wound into your draw pile.',
    effects: [{ type: 'damage', value: 12, target: 'enemy' }, { type: 'special', value: 0, special: 'add_wound' }],
  }),
  makeCard({
    id: 'limit_break', name: 'Limit Break', type: 'Skill', cost: 1, characterId: 'ironclad', exhausts: true,
    description: 'Double your Strength. Exhaust.',
    effects: [{ type: 'special', value: 0, special: 'double_strength' }],
  }),
];

// ─── DEFECT CARDS ─────────────────────────────────────────────────────────────

export const DEFECT_CARDS: Card[] = [
  makeCard({
    id: 'strike_b', name: 'Strike', type: 'Attack', cost: 1, characterId: 'defect', exhausts: false,
    description: 'Deal 6 damage.',
    effects: [{ type: 'damage', value: 6, target: 'enemy' }],
  }),
  makeCard({
    id: 'defend_b', name: 'Defend', type: 'Skill', cost: 1, characterId: 'defect', exhausts: false,
    description: 'Gain 5 Block.',
    effects: [{ type: 'block', value: 5, target: 'self' }],
  }),
  makeCard({
    id: 'zap', name: 'Zap', type: 'Skill', cost: 1, characterId: 'defect', exhausts: false,
    description: 'Channel 1 Lightning orb.',
    effects: [{ type: 'orb', value: 1, special: 'Lightning' } as any],
  }),
  makeCard({
    id: 'dualcast', name: 'Dualcast', type: 'Skill', cost: 1, characterId: 'defect', exhausts: false,
    description: 'Evoke your next orb twice.',
    effects: [{ type: 'evoke', value: 2 }],
  }),
  makeCard({
    id: 'streamline', name: 'Streamline', type: 'Attack', cost: 2, characterId: 'defect', exhausts: false,
    description: 'Deal 15 damage. Reduce this card\'s cost by 1 (min 0).',
    effects: [{ type: 'damage', value: 15, target: 'enemy' }, { type: 'special', value: 0, special: 'reduce_cost' }],
  }),
  makeCard({
    id: 'cold_snap', name: 'Cold Snap', type: 'Attack', cost: 1, characterId: 'defect', exhausts: false,
    description: 'Deal 6 damage. Channel 1 Frost orb.',
    effects: [{ type: 'damage', value: 6, target: 'enemy' }, { type: 'orb', value: 1, special: 'Frost' } as any],
  }),
  makeCard({
    id: 'ball_lightning', name: 'Ball Lightning', type: 'Attack', cost: 1, characterId: 'defect', exhausts: false,
    description: 'Deal 7 damage to ALL enemies. Channel 1 Lightning orb.',
    effects: [{ type: 'damage', value: 7, target: 'all_enemies' }, { type: 'orb', value: 1, special: 'Lightning' } as any],
  }),
  makeCard({
    id: 'glacier', name: 'Glacier', type: 'Skill', cost: 2, characterId: 'defect', exhausts: false,
    description: 'Gain 7 Block. Channel 2 Frost orbs.',
    effects: [{ type: 'block', value: 7, target: 'self' }, { type: 'orb', value: 2, special: 'Frost' } as any],
  }),
  makeCard({
    id: 'chill', name: 'Chill', type: 'Power', cost: 0, characterId: 'defect', exhausts: false,
    description: 'At the end of each turn, Channel 1 Frost orb.',
    effects: [{ type: 'special', value: 0, special: 'chill_power' }],
  }),
  makeCard({
    id: 'consume', name: 'Consume', type: 'Power', cost: 2, characterId: 'defect', exhausts: false,
    description: 'Gain 2 Orb Slots. Lose 1 Focus.',
    effects: [{ type: 'special', value: 2, special: 'orb_slots' }, { type: 'special', value: -1, special: 'focus' }],
  }),
  makeCard({
    id: 'electrodynamics', name: 'Electrodynamics', type: 'Power', cost: 2, characterId: 'defect', exhausts: false,
    description: 'Lightning hits ALL enemies. Channel 2 Lightning orbs.',
    effects: [{ type: 'special', value: 0, special: 'electro' }, { type: 'orb', value: 2, special: 'Lightning' } as any],
  }),
  makeCard({
    id: 'doom_and_gloom', name: 'Doom and Gloom', type: 'Attack', cost: 2, characterId: 'defect', exhausts: false,
    description: 'Deal 10 damage to ALL enemies. Channel 1 Dark orb.',
    effects: [{ type: 'damage', value: 10, target: 'all_enemies' }, { type: 'orb', value: 1, special: 'Dark' } as any],
  }),
  makeCard({
    id: 'compile_driver', name: 'Compile Driver', type: 'Attack', cost: 1, characterId: 'defect', exhausts: false,
    description: 'Deal 7 damage. Draw 1 card for each unique Orb type you have.',
    effects: [{ type: 'damage', value: 7, target: 'enemy' }, { type: 'special', value: 0, special: 'compile_draw' }],
  }),
  makeCard({
    id: 'reinforced_body', name: 'Reinforced Body', type: 'Skill', cost: 'X', characterId: 'defect', exhausts: false,
    description: 'Gain 7 Block X times.',
    effects: [{ type: 'block', value: 7, target: 'self' }, { type: 'special', value: 0, special: 'x_times_block' }],
  }),
  makeCard({
    id: 'reboot', name: 'Reboot', type: 'Skill', cost: 0, characterId: 'defect', exhausts: true,
    description: 'Shuffle all cards in your hand into your draw pile. Draw 4 cards. Exhaust.',
    effects: [{ type: 'special', value: 4, special: 'reboot' }],
  }),
  makeCard({
    id: 'all_for_one', name: 'All For One', type: 'Attack', cost: 2, characterId: 'defect', exhausts: false,
    description: 'Deal 10 damage. Put all cost-0 cards from your discard into your hand.',
    effects: [{ type: 'damage', value: 10, target: 'enemy' }, { type: 'special', value: 0, special: 'all_for_one' }],
  }),
  makeCard({
    id: 'seek', name: 'Seek', type: 'Skill', cost: 0, characterId: 'defect', exhausts: true,
    description: 'Choose 1 card from your draw pile and place it in your hand. Exhaust.',
    effects: [{ type: 'special', value: 1, special: 'seek' }],
  }),
  makeCard({
    id: 'loop', name: 'Loop', type: 'Power', cost: 1, characterId: 'defect', exhausts: false,
    description: 'At the start of each turn, trigger the passive ability of your next Orb.',
    effects: [{ type: 'special', value: 0, special: 'loop_power' }],
  }),
  makeCard({
    id: 'darkness', name: 'Darkness', type: 'Skill', cost: 1, characterId: 'defect', exhausts: false,
    description: 'Channel 1 Dark orb. If you already have a Dark orb, double its passive damage.',
    effects: [{ type: 'orb', value: 1, special: 'Dark' } as any],
  }),
  makeCard({
    id: 'turbo', name: 'Turbo', type: 'Skill', cost: 0, characterId: 'defect', exhausts: false,
    description: 'Gain 2 Energy. Shuffle a Void into your discard pile.',
    effects: [{ type: 'energy', value: 2 }, { type: 'special', value: 0, special: 'add_void' }],
  }),
];

export const ALL_CARDS: Card[] = [...IRONCLAD_CARDS, ...DEFECT_CARDS];

export function getStarterDeck(characterId: 'ironclad' | 'defect'): Card[] {
  if (characterId === 'ironclad') {
    const strike = IRONCLAD_CARDS.find(c => c.id === 'strike_r')!;
    const defend = IRONCLAD_CARDS.find(c => c.id === 'defend_r')!;
    const bash = IRONCLAD_CARDS.find(c => c.id === 'bash')!;
    return [
      ...Array(5).fill(null).map((_, i) => ({ ...strike, id: `strike_r_${i}` })),
      ...Array(4).fill(null).map((_, i) => ({ ...defend, id: `defend_r_${i}` })),
      { ...bash, id: 'bash_0' },
    ];
  } else {
    const strike = DEFECT_CARDS.find(c => c.id === 'strike_b')!;
    const defend = DEFECT_CARDS.find(c => c.id === 'defend_b')!;
    const zap = DEFECT_CARDS.find(c => c.id === 'zap')!;
    const dualcast = DEFECT_CARDS.find(c => c.id === 'dualcast')!;
    return [
      ...Array(4).fill(null).map((_, i) => ({ ...strike, id: `strike_b_${i}` })),
      ...Array(4).fill(null).map((_, i) => ({ ...defend, id: `defend_b_${i}` })),
      { ...zap, id: 'zap_0' },
      { ...dualcast, id: 'dualcast_0' },
    ];
  }
}

export function upgradeCard(card: Card): Card {
  const upgrades: Record<string, Partial<Card>> = {
    strike_r: { name: 'Strike+', description: 'Deal 9 damage.', effects: [{ type: 'damage', value: 9, target: 'enemy' }] },
    defend_r: { name: 'Defend+', description: 'Gain 8 Block.', effects: [{ type: 'block', value: 8, target: 'self' }] },
    bash: { name: 'Bash+', description: 'Deal 10 damage. Apply 3 Vulnerable.', effects: [{ type: 'damage', value: 10, target: 'enemy' }, { type: 'status', value: 3, target: 'enemy', status: 'Vulnerable' }] },
    strike_b: { name: 'Strike+', description: 'Deal 9 damage.', effects: [{ type: 'damage', value: 9, target: 'enemy' }] },
    defend_b: { name: 'Defend+', description: 'Gain 8 Block.', effects: [{ type: 'block', value: 8, target: 'self' }] },
    zap: { name: 'Zap+', cost: 0, description: 'Channel 1 Lightning orb. Costs 0.' },
    cold_snap: { name: 'Cold Snap+', description: 'Deal 9 damage. Channel 1 Frost orb.', effects: [{ type: 'damage', value: 9, target: 'enemy' }, { type: 'orb', value: 1, special: 'Frost' } as any] },
    cleave: { name: 'Cleave+', description: 'Deal 11 damage to ALL enemies.', effects: [{ type: 'damage', value: 11, target: 'all_enemies' }] },
    iron_wave: { name: 'Iron Wave+', description: 'Gain 7 Block. Deal 7 damage.', effects: [{ type: 'block', value: 7, target: 'self' }, { type: 'damage', value: 7, target: 'enemy' }] },
    shrug_it_off: { name: 'Shrug It Off+', description: 'Gain 11 Block. Draw 1 card.', effects: [{ type: 'block', value: 11, target: 'self' }, { type: 'draw', value: 1 }] },
    pommel_strike: { name: 'Pommel Strike+', description: 'Deal 10 damage. Draw 2 cards.', effects: [{ type: 'damage', value: 10, target: 'enemy' }, { type: 'draw', value: 2 }] },
    flex: { name: 'Flex+', description: 'Gain 4 Strength. At end of turn, lose 4 Strength.', effects: [{ type: 'status', value: 4, target: 'self', status: 'Strength' }, { type: 'special', value: 0, special: 'flex_lose' }] },
    anger: { name: 'Anger+', description: 'Deal 8 damage. Add a copy to your discard pile.', effects: [{ type: 'damage', value: 8, target: 'enemy' }, { type: 'special', value: 0, special: 'anger_copy' }] },
    impervious: { name: 'Impervious+', description: 'Gain 40 Block. Exhaust.', effects: [{ type: 'block', value: 40, target: 'self' }] },
    heavy_blade: { name: 'Heavy Blade+', description: 'Deal 14 damage. Strength affects this card 5x.', effects: [{ type: 'damage', value: 14, target: 'enemy' }, { type: 'special', value: 5, special: 'strength_mult' }] },
  };
  const upgrade = upgrades[card.baseId];
  if (!upgrade) return { ...card, upgraded: true, name: card.name + '+' };
  return { ...card, ...upgrade, upgraded: true };
}

export function getCardRewards(characterId: CharacterId, count = 3): Card[] {
  const pool = ALL_CARDS.filter(c => c.characterId === characterId && !['strike_r','defend_r','strike_b','defend_b'].includes(c.id));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(c => ({ ...c, id: `${c.id}_${Date.now()}_${Math.random()}` }));
}
