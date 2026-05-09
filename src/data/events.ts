export interface EventChoice {
  text: string;
  outcome: string;
  effect: {
    type: 'gold' | 'hp' | 'maxHp' | 'card' | 'relic' | 'curse' | 'nothing';
    value?: number;
  };
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
  imageEmoji: string;
}

export const GAME_EVENTS: GameEvent[] = [
  {
    id: 'dead_adventurer',
    title: 'Dead Adventurer',
    imageEmoji: '💀',
    description: 'You stumble upon the corpse of a fallen adventurer. Their belongings lay scattered nearby.',
    choices: [
      { text: 'Loot the body', outcome: 'You find some gold on the body.', effect: { type: 'gold', value: 30 } },
      { text: 'Search carefully', outcome: 'You find more gold but also disturb something cursed...', effect: { type: 'gold', value: 60 } },
      { text: 'Leave them in peace', outcome: 'You leave without taking anything.', effect: { type: 'nothing' } },
    ],
  },
  {
    id: 'fountain_of_youth',
    title: 'Fountain of Rejuvenation',
    imageEmoji: '⛲',
    description: 'A shimmering fountain stands before you, its waters glowing with arcane energy.',
    choices: [
      { text: 'Drink from the fountain', outcome: 'The waters restore your vitality!', effect: { type: 'maxHp', value: 10 } },
      { text: 'Bathe in the waters', outcome: 'You feel completely renewed!', effect: { type: 'hp', value: 999 } },
      { text: 'Walk past', outcome: 'You resist the temptation.', effect: { type: 'nothing' } },
    ],
  },
  {
    id: 'golden_idol',
    title: 'The Golden Idol',
    imageEmoji: '🏺',
    description: 'A golden idol sits on a pedestal. It looks valuable, but the trap mechanisms are obvious.',
    choices: [
      { text: 'Take the idol (25 gold)', outcome: 'You snatch the idol and dodge the traps!', effect: { type: 'gold', value: 250 } },
      { text: 'Carefully retrieve it', outcome: 'You carefully take the idol safely.', effect: { type: 'gold', value: 150 } },
      { text: 'Leave it alone', outcome: 'You decide it\'s not worth the risk.', effect: { type: 'nothing' } },
    ],
  },
  {
    id: 'masked_bandits',
    title: 'Masked Bandits',
    imageEmoji: '🦹',
    description: 'Three masked figures block your path. "Your gold or your life!" they demand.',
    choices: [
      { text: 'Pay them (50 gold)', outcome: 'They take your gold and let you pass.', effect: { type: 'gold', value: -50 } },
      { text: 'Fight them off', outcome: 'You drive them away but take some damage in the scuffle!', effect: { type: 'hp', value: -10 } },
      { text: 'Intimidate them', outcome: 'Your fearsome reputation sends them running!', effect: { type: 'nothing' } },
    ],
  },
  {
    id: 'mysterious_sphere',
    title: 'Mysterious Sphere',
    imageEmoji: '🔮',
    description: 'A pulsating orb of energy floats in the middle of the room. Power emanates from it.',
    choices: [
      { text: 'Absorb the energy', outcome: 'Power surges through you!', effect: { type: 'maxHp', value: 5 } },
      { text: 'Smash it open', outcome: 'Gold and gems spill out!', effect: { type: 'gold', value: 100 } },
      { text: 'Leave it', outcome: 'You wisely keep your distance.', effect: { type: 'nothing' } },
    ],
  },
  {
    id: 'library',
    title: 'The Library',
    imageEmoji: '📚',
    description: 'A vast library, somehow preserved within the spire. Ancient tomes line the shelves.',
    choices: [
      { text: 'Study a tome (Skip next combat reward)', outcome: 'You gain deep insight into combat techniques.', effect: { type: 'card', value: 1 } },
      { text: 'Rest and read', outcome: 'The quiet calms your nerves. You heal slightly.', effect: { type: 'hp', value: 12 } },
      { text: 'Search for valuables', outcome: 'You find some loose change in the books.', effect: { type: 'gold', value: 35 } },
    ],
  },
  {
    id: 'armory',
    title: 'The Armory',
    imageEmoji: '⚔️',
    description: 'Weapons and armor of varying quality line the walls of this abandoned armory.',
    choices: [
      { text: 'Upgrade your equipment', outcome: 'Your gear is enhanced!', effect: { type: 'hp', value: 5 } },
      { text: 'Scavenge for parts', outcome: 'You find some gold among the scraps.', effect: { type: 'gold', value: 40 } },
      { text: 'Pass through', outcome: 'Nothing here interests you.', effect: { type: 'nothing' } },
    ],
  },
  {
    id: 'cursed_tome',
    title: 'Cursed Tome',
    imageEmoji: '📖',
    description: 'A black tome radiates dark energy. Words seem to writhe across its pages.',
    choices: [
      { text: 'Read the tome', outcome: 'Dark knowledge fills your mind, but at a cost...', effect: { type: 'maxHp', value: -5 } },
      { text: 'Tear out the pages', outcome: 'You destroy the curse but find a hidden reward.', effect: { type: 'gold', value: 75 } },
      { text: 'Burn it', outcome: 'The tome crumbles to ash.', effect: { type: 'nothing' } },
    ],
  },
  {
    id: 'merchant',
    title: 'Travelling Merchant',
    imageEmoji: '🛒',
    description: 'A cheerful merchant sets up their cart. "Finest wares in the spire!"',
    choices: [
      { text: 'Buy a health potion (50g)', outcome: 'You restore some HP!', effect: { type: 'hp', value: 15 } },
      { text: 'Buy information (25g)', outcome: 'You learn the layout of upcoming floors.', effect: { type: 'gold', value: -25 } },
      { text: 'Move along', outcome: 'The merchant shrugs and packs up.', effect: { type: 'nothing' } },
    ],
  },
  {
    id: 'ancient_writing',
    title: 'Ancient Writing',
    imageEmoji: '🗿',
    description: 'Runes cover this ancient stone. Their meaning is unclear, but they pulse with power.',
    choices: [
      { text: 'Decipher the runes', outcome: 'You unlock their power!', effect: { type: 'maxHp', value: 7 } },
      { text: 'Inscribe them on your weapon', outcome: 'Your weapon gains a magical edge.', effect: { type: 'hp', value: 0 } },
      { text: 'Ignore them', outcome: 'Some mysteries are best left unsolved.', effect: { type: 'nothing' } },
    ],
  },
];

export function getRandomEvent(): GameEvent {
  return GAME_EVENTS[Math.floor(Math.random() * GAME_EVENTS.length)];
}
