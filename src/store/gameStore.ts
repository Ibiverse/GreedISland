import { create } from 'zustand';
import type { GameRun, GameScreen, Character, Enemy, CombatState, Card, Relic, CharacterId } from '../types';
import type { GameEvent } from '../data/events';
import { getStarterDeck, getCardRewards, upgradeCard } from '../data/cards';
import { spawnEnemy, getAct1Encounters, getEliteEncounters, getBossEncounters } from '../data/enemies';
import { generateMap, markNodeVisited } from '../systems/mapGenerator';
import { drawCards, discardHand, initDrawPile } from '../systems/deckManager';
import { playCard, processEnemyTurn, startPlayerTurn, applyStartOfCombatRelics } from '../systems/combatEngine';
import { getRandomRelic } from '../data/relics';
import { getRandomEvent } from '../data/events';

interface GameState {
  screen: GameScreen;
  run: GameRun | null;
  combat: CombatState | null;
  currentEvent: GameEvent | null;
  shakeScreen: boolean;
  damageNumbers: { id: string; value: number; x: number; y: number }[];

  // Actions
  startRun: (characterId: CharacterId) => void;
  enterNode: (nodeId: string) => void;
  playCardAction: (cardIndex: number, targetIdx?: number, energyOverride?: number) => void;
  endTurn: () => void;
  chooseCardReward: (card: Card | null) => void;
  chooseEventOutcome: (choiceIndex: number) => void;
  buyCard: (card: Card) => void;
  buyRelic: (relic: Relic) => void;
  buyPotion: (potionId: string) => void;
  removeCard: (cardId: string) => void;
  leaveShop: () => void;
  restHeal: () => void;
  smithCard: (cardId: string) => void;
  leaveRest: () => void;
  usePotion: (potionIndex: number, targetIdx?: number) => void;
  returnToMenu: () => void;
  triggerShake: () => void;
}

function makeCharacter(id: CharacterId): Character {
  const deck = getStarterDeck(id);
  const shuffled = initDrawPile(deck);
  return {
    id,
    name: id === 'ironclad' ? 'Ironclad' : 'The Defect',
    maxHp: id === 'ironclad' ? 80 : 75,
    currentHp: id === 'ironclad' ? 80 : 75,
    block: 0,
    energy: 3,
    maxEnergy: 3,
    deck: [...deck],
    hand: [],
    drawPile: shuffled,
    discardPile: [],
    exhaustPile: [],
    relics: [],
    potions: [],
    statusEffects: [],
    orbs: id === 'defect' ? [] : undefined,
    maxOrbs: id === 'defect' ? 3 : undefined,
    focus: id === 'defect' ? 0 : undefined,
  };
}

function spawnCombatEnemies(nodeType: 'combat' | 'elite' | 'boss'): Enemy[] {
  if (nodeType === 'boss') {
    const bosses = getBossEncounters();
    const bossId = bosses[Math.floor(Math.random() * bosses.length)];
    return [spawnEnemy(bossId)];
  }
  if (nodeType === 'elite') {
    const elites = getEliteEncounters();
    const group = elites[Math.floor(Math.random() * elites.length)];
    return group.map(id => spawnEnemy(id));
  }
  const encounters = getAct1Encounters();
  const group = encounters[Math.floor(Math.random() * encounters.length)];
  return group.map(id => spawnEnemy(id));
}

function initCombat(character: Character, enemies: Enemy[], relics: Relic[]): { character: Character; combat: CombatState } {
  // Rebuild draw pile from the master deck so cards added since last combat are included.
  // Clear hand/discard/exhaust from any previous combat.
  const freshChar: Character = {
    ...character,
    drawPile:    initDrawPile(character.deck),
    hand:        [],
    discardPile: [],
    exhaustPile: [],
    block:       0,
    statusEffects: [],
  };

  // Apply start-of-combat relics
  const { player: p1, enemies: es1 } = applyStartOfCombatRelics(freshChar, enemies, relics);

  // Draw starting hand (5 cards + extra from Ring of Snake / Bag of Preparation)
  const extraDraw = relics.filter(r => r.id === 'ring_of_snake' || r.id === 'bag_of_preparation').length * 2;
  const startDraw = drawCards(p1.drawPile, p1.discardPile, p1.hand, 5 + extraDraw);

  // Apply energy
  const startEnergy = p1.maxEnergy + relics.filter(r =>
    ['coffee_dripper', 'runic_dome', 'philosophers_stone', 'fusion_hammer', 'sozu'].includes(r.id)
  ).length;

  const char: Character = { ...p1, ...startDraw, energy: startEnergy, block: 0 };

  const combat: CombatState = {
    enemies: es1,
    turn: 1,
    phase: 'player',
    energyUsed: 0,
    isAnimating: false,
    selectedCardIndex: null,
    combatLog: ['Combat started!'],
    goldReward: 0,
    cardRewards: [],
    relicReward: null,
  };
  return { character: char, combat };
}

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'menu',
  run: null,
  combat: null,
  currentEvent: null,
  shakeScreen: false,
  damageNumbers: [],

  triggerShake: () => {
    set({ shakeScreen: true });
    setTimeout(() => set({ shakeScreen: false }), 500);
  },

  startRun: (characterId) => {
    const character = makeCharacter(characterId);
    const map = generateMap();
    const run: GameRun = {
      character,
      currentFloor: 0,
      currentAct: 1,
      map,
      currentNodeId: null,
      gold: 99,
      score: 0,
      enemiesSlain: 0,
      damageDealt: 0,
      turnsPlayed: 0,
    };
    set({ run, screen: 'map', combat: null, currentEvent: null });
  },

  enterNode: (nodeId) => {
    const { run } = get();
    if (!run) return;

    const node = run.map.find(n => n.id === nodeId);
    if (!node || (!node.available && !node.visited)) return;

    const newMap = markNodeVisited(run.map, nodeId);
    const newRun = { ...run, map: newMap, currentNodeId: nodeId, currentFloor: run.currentFloor + 1 };

    if (node.type === 'combat' || node.type === 'elite' || node.type === 'boss') {
      const enemies = spawnCombatEnemies(node.type);
      const { character: char, combat } = initCombat(newRun.character, enemies, newRun.character.relics);
      set({ run: { ...newRun, character: char }, combat, screen: 'combat' });
    } else if (node.type === 'shop') {
      set({ run: newRun, screen: 'shop' });
    } else if (node.type === 'rest') {
      set({ run: newRun, screen: 'rest' });
    } else if (node.type === 'event') {
      const event = getRandomEvent();
      set({ run: newRun, screen: 'event', currentEvent: event });
    } else if (node.type === 'treasure') {
      const relic = getRandomRelic();
      const updatedChar = { ...newRun.character, relics: [...newRun.character.relics, relic] };
      set({ run: { ...newRun, character: updatedChar }, screen: 'map' });
    }
  },

  playCardAction: (cardIndex, targetIdx = 0, energyOverride) => {
    const { run, combat } = get();
    if (!run || !combat || combat.phase !== 'player') return;

    const card = run.character.hand[cardIndex];
    if (!card) return;

    const actualCost = typeof card.cost === 'number' ? card.cost : (energyOverride ?? 0);
    if (run.character.energy < actualCost) return;

    const { player, enemies, log, exhaustedCard } = playCard(
      card, run.character, combat.enemies, targetIdx, energyOverride, run.character.relics
    );

    // Remove card from hand
    const newHand = player.hand.filter((_, i) => i !== cardIndex);
    let newDiscard = [...player.discardPile];
    let newExhaust = [...player.exhaustPile];

    if (exhaustedCard) {
      newExhaust.push(card);
    } else {
      newDiscard.push(card);
    }

    // Handle specials
    let drawCount = 0;
    card.effects.forEach(e => {
      if (e.type === 'draw') drawCount += e.value;
    });

    let updatedChar: Character = { ...player, hand: newHand, discardPile: newDiscard, exhaustPile: newExhaust };

    // Anger: copy to discard
    if (card.effects.some(e => e.special === 'anger_copy')) {
      updatedChar.discardPile.push({ ...card, id: `${card.id}_copy_${Date.now()}` });
    }

    // Draw from draw effects
    if (drawCount > 0) {
      const drawn = drawCards(updatedChar.drawPile, updatedChar.discardPile, updatedChar.hand, drawCount);
      updatedChar = { ...updatedChar, ...drawn };
    }

    // Track damage dealt
    const prevHp = combat.enemies.reduce((s, e) => s + e.currentHp, 0);
    const newHp = enemies.reduce((s, e) => s + e.currentHp, 0);
    const dmgDealt = prevHp - newHp;

    // Check if all enemies dead
    const allDead = enemies.every(e => !e.isAlive);

    if (allDead) {
      // End combat — prepare rewards
      const nodeType = run.map.find(n => n.id === run.currentNodeId)?.type ?? 'combat';
      const goldReward = nodeType === 'boss' ? 100 : nodeType === 'elite' ? 50 : Math.floor(Math.random() * 20) + 10;
      const cardRewards = getCardRewards(run.character.id, 3);
      const relicReward = (nodeType === 'elite' || nodeType === 'boss') ? getRandomRelic() : null;

      // Burning Blood
      let finalChar = updatedChar;
      if (run.character.relics.some(r => r.id === 'burning_blood')) {
        finalChar = { ...finalChar, currentHp: Math.min(finalChar.maxHp, finalChar.currentHp + 6) };
      }

      const isVictory = nodeType === 'boss' && run.currentAct >= 3;

      set({
        run: { ...run, character: finalChar, gold: run.gold + goldReward, enemiesSlain: run.enemiesSlain + enemies.length, damageDealt: run.damageDealt + dmgDealt },
        combat: { ...combat, enemies, phase: 'reward', combatLog: [...combat.combatLog, ...log], goldReward, cardRewards, relicReward },
        screen: isVictory ? 'victory' : 'reward',
      });
    } else {
      set({
        run: { ...run, character: updatedChar, damageDealt: run.damageDealt + dmgDealt },
        combat: { ...combat, enemies, combatLog: [...combat.combatLog, ...log] },
      });
    }
  },

  endTurn: () => {
    const { run, combat } = get();
    if (!run || !combat || combat.phase !== 'player') return;

    // Discard hand
    const { hand: newHand, discardPile: newDiscard } = discardHand(run.character.hand, run.character.discardPile);
    let charAfterDiscard: Character = { ...run.character, hand: newHand, discardPile: newDiscard };

    // Enemy turn
    const { player: playerAfterEnemies, enemies: newEnemies, log } = processEnemyTurn(charAfterDiscard, combat.enemies, run.character.relics);

    // Check death
    if (playerAfterEnemies.currentHp <= 0) {
      // Lizard Tail check
      const hasTail = playerAfterEnemies.relics.some(r => r.id === 'lizard_tail');
      if (hasTail) {
        const newRelics = playerAfterEnemies.relics.filter(r => r.id !== 'lizard_tail');
        const revivedPlayer = { ...playerAfterEnemies, currentHp: Math.floor(playerAfterEnemies.maxHp * 0.5), relics: newRelics };
        // Trigger shake
        get().triggerShake();
        // Start new player turn
        const charStartTurn = startPlayerTurn(revivedPlayer, run.character.relics);
        const drawn = drawCards(charStartTurn.drawPile, charStartTurn.discardPile, charStartTurn.hand, 5);
        const charReady: Character = { ...charStartTurn, ...drawn };
        set({ run: { ...run, character: charReady, turnsPlayed: run.turnsPlayed + 1 }, combat: { ...combat, enemies: newEnemies, turn: combat.turn + 1, combatLog: [...combat.combatLog, ...log, 'Lizard Tail activated!'] } });
        return;
      }
      set({ screen: 'game_over', run: { ...run, character: playerAfterEnemies } });
      return;
    }

    get().triggerShake();

    // Start player turn
    const charStartTurn = startPlayerTurn(playerAfterEnemies, run.character.relics);
    const drawn = drawCards(charStartTurn.drawPile, charStartTurn.discardPile, charStartTurn.hand, 5);
    const charReady: Character = { ...charStartTurn, ...drawn };

    set({
      run: { ...run, character: charReady, turnsPlayed: run.turnsPlayed + 1 },
      combat: { ...combat, enemies: newEnemies, turn: combat.turn + 1, phase: 'player', combatLog: [...combat.combatLog, ...log] },
    });
  },

  chooseCardReward: (card) => {
    const { run } = get();
    if (!run) return;
    if (card) {
      const newDeck = [...run.character.deck, card];
      const newChar = { ...run.character, deck: newDeck };
      set({ run: { ...run, character: newChar }, screen: 'map' });
    } else {
      set({ screen: 'map' });
    }
  },

  chooseEventOutcome: (choiceIndex) => {
    const { run, currentEvent } = get();
    if (!run || !currentEvent) return;
    const choice = currentEvent.choices[choiceIndex];
    let newRun = { ...run };
    let newChar = { ...run.character };

    switch (choice.effect.type) {
      case 'gold':
        newRun.gold = Math.max(0, run.gold + (choice.effect.value ?? 0));
        break;
      case 'hp':
        newChar.currentHp = Math.max(1, Math.min(newChar.maxHp, newChar.currentHp + (choice.effect.value ?? 0)));
        break;
      case 'maxHp':
        newChar.maxHp += choice.effect.value ?? 0;
        newChar.currentHp = Math.min(newChar.currentHp + (choice.effect.value ?? 0), newChar.maxHp);
        break;
      case 'relic':
        newChar.relics = [...newChar.relics, getRandomRelic()];
        break;
    }

    newRun.character = newChar;
    set({ run: newRun, screen: 'map', currentEvent: null });
  },

  buyCard: (card) => {
    const { run } = get();
    const price = (card as Card & { price?: number }).price;
    if (!run || !price || run.gold < price) return;
    const cleanCard: Card = { ...card };
    delete (cleanCard as any).price;
    const newChar = { ...run.character, deck: [...run.character.deck, cleanCard] };
    set({ run: { ...run, character: newChar, gold: run.gold - price } });
  },

  buyRelic: (relic) => {
    const { run } = get();
    if (!run || !relic.price || run.gold < relic.price) return;
    const newChar = { ...run.character, relics: [...run.character.relics, relic] };
    set({ run: { ...run, character: newChar, gold: run.gold - relic.price } });
  },

  buyPotion: (potionId) => {
    const { run } = get();
    if (!run || run.gold < 50) return;
    if (run.character.potions.length >= 3) return;
    // Simple: just add a potion slot, actual use handled via usePotion
    const newChar = { ...run.character, potions: [...run.character.potions, { id: potionId, name: potionId, description: '' }] };
    set({ run: { ...run, character: newChar, gold: run.gold - 50 } });
  },

  removeCard: (cardId) => {
    const { run } = get();
    if (!run || run.gold < 100) return;
    const newDeck = run.character.deck.filter(c => c.id !== cardId);
    const newChar = { ...run.character, deck: newDeck };
    set({ run: { ...run, character: newChar, gold: run.gold - 100 } });
  },

  leaveShop: () => set({ screen: 'map' }),

  restHeal: () => {
    const { run } = get();
    if (!run) return;
    const heal = Math.floor(run.character.maxHp * 0.3);
    const extraHeal = run.character.relics.some(r => r.id === 'paper_frog') ? 5 : 0;
    const noRest = run.character.relics.some(r => r.id === 'coffee_dripper' || r.id === 'fusion_hammer');
    if (noRest) return;
    const newHp = Math.min(run.character.maxHp, run.character.currentHp + heal + extraHeal);
    const newChar = { ...run.character, currentHp: newHp };
    set({ run: { ...run, character: newChar }, screen: 'map' });
  },

  smithCard: (cardId) => {
    const { run } = get();
    if (!run) return;
    const noSmith = run.character.relics.some(r => r.id === 'fusion_hammer');
    if (noSmith) return;
    const newDeck = run.character.deck.map(c => c.id === cardId ? upgradeCard(c) : c);
    const newChar = { ...run.character, deck: newDeck };
    set({ run: { ...run, character: newChar }, screen: 'map' });
  },

  leaveRest: () => set({ screen: 'map' }),

  usePotion: (potionIndex, targetIdx = 0) => {
    const { run, combat } = get();
    if (!run) return;
    const potion = run.character.potions[potionIndex];
    if (!potion) return;
    let newChar = { ...run.character };
    const newPotions = newChar.potions.filter((_, i) => i !== potionIndex);
    newChar.potions = newPotions;
    let newEnemies = combat ? [...combat.enemies] : [];

    switch (potion.id) {
      case 'health_potion':
        newChar.currentHp = Math.min(newChar.maxHp, newChar.currentHp + Math.floor(newChar.maxHp * 0.5));
        break;
      case 'fire_potion':
        if (newEnemies[targetIdx]) {
          newEnemies[targetIdx] = { ...newEnemies[targetIdx], currentHp: Math.max(0, newEnemies[targetIdx].currentHp - 20) };
        }
        break;
      case 'strength_potion':
        newChar.statusEffects = [...newChar.statusEffects, { type: 'Strength', value: 2 }];
        break;
      case 'block_potion':
        newChar.block += 12;
        break;
      case 'energy_potion':
        newChar.energy += 2;
        break;
      case 'draw_potion': {
        const drawn = drawCards(newChar.drawPile, newChar.discardPile, newChar.hand, 3);
        newChar = { ...newChar, ...drawn };
        break;
      }
    }

    if (combat) {
      set({ run: { ...run, character: newChar }, combat: { ...combat, enemies: newEnemies } });
    } else {
      set({ run: { ...run, character: newChar } });
    }
  },

  returnToMenu: () => set({ screen: 'menu', run: null, combat: null }),
}));
