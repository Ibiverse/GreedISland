import type { Card, Character, Enemy, StatusEffect, StatusEffectType, Relic } from '../types';

export function getStatusValue(effects: StatusEffect[], type: StatusEffectType): number {
  return effects.find(e => e.type === type)?.value ?? 0;
}

export function addStatus(effects: StatusEffect[], type: StatusEffectType, value: number): StatusEffect[] {
  const existing = effects.find(e => e.type === type);
  if (existing) {
    return effects.map(e => e.type === type ? { ...e, value: e.value + value } : e);
  }
  return [...effects, { type, value }];
}

export function removeStatus(effects: StatusEffect[], type: StatusEffectType): StatusEffect[] {
  return effects.filter(e => e.type !== type);
}

export function tickStatusEffects(effects: StatusEffect[]): StatusEffect[] {
  return effects
    .map(e => {
      if (['Weak', 'Vulnerable', 'Poison', 'Burn'].includes(e.type)) {
        return { ...e, value: e.value - 1 };
      }
      return e;
    })
    .filter(e => e.value > 0);
}

export function calcDamage(base: number, attacker: StatusEffect[], defender: StatusEffect[], strengthMult = 1): number {
  const str = getStatusValue(attacker, 'Strength');
  const weak = getStatusValue(attacker, 'Weak') > 0;
  const vuln = getStatusValue(defender, 'Vulnerable') > 0;
  let dmg = base + str * strengthMult;
  if (weak) dmg = Math.floor(dmg * 0.75);
  if (vuln) dmg = Math.floor(dmg * 1.5);
  return Math.max(0, dmg);
}

export function applyDamageToEnemy(enemy: Enemy, damage: number): Enemy {
  let remaining = damage;
  let newBlock = enemy.block;
  if (newBlock > 0) {
    const blocked = Math.min(newBlock, remaining);
    newBlock -= blocked;
    remaining -= blocked;
  }
  const newHp = Math.max(0, enemy.currentHp - remaining);
  return { ...enemy, block: newBlock, currentHp: newHp, isAlive: newHp > 0 };
}

export function applyDamageToPlayer(player: Character, damage: number): Character {
  let remaining = damage;
  let newBlock = player.block;
  if (newBlock > 0) {
    const blocked = Math.min(newBlock, remaining);
    newBlock -= blocked;
    remaining -= blocked;
  }
  const newHp = Math.max(0, player.currentHp - remaining);
  return { ...player, block: newBlock, currentHp: newHp };
}

export interface PlayCardResult {
  player: Character;
  enemies: Enemy[];
  log: string[];
  exhaustedCard: boolean;
}

export function playCard(
  card: Card,
  player: Character,
  enemies: Enemy[],
  targetIdx: number,
  energyOverride?: number,
  relics: Relic[] = []
): PlayCardResult {
  const log: string[] = [];
  let p = { ...player, statusEffects: [...player.statusEffects] };
  let es = enemies.map(e => ({ ...e }));
  let exhaustedCard = card.exhausts;

  const corruption = relics.some(r => r.id === 'corruption') || false;
  if (corruption && card.type === 'Skill') exhaustedCard = true;

  const actualCost = typeof card.cost === 'number' ? card.cost : (energyOverride ?? 0);
  p.energy -= actualCost;

  for (const effect of card.effects) {
    switch (effect.type) {
      case 'damage': {
        const strengthMult = card.effects.find(e => e.special === 'strength_mult')?.value ?? 1;
        const times = card.effects.find(e => e.special === 'multi_hit')?.value ?? 1;
        const xTimes = card.effects.find(e => e.special === 'x_times') ? (energyOverride ?? 0) : 1;
        const totalTimes = Math.max(times, xTimes);

        const targets = effect.target === 'all_enemies' ? es.map((_, i) => i) : [targetIdx];
        targets.forEach(idx => {
          if (!es[idx]?.isAlive) return;
          for (let t = 0; t < totalTimes; t++) {
            const dmg = calcDamage(effect.value, p.statusEffects, es[idx].statusEffects, strengthMult);
            es[idx] = applyDamageToEnemy(es[idx], dmg);
            log.push(`${card.name}: dealt ${dmg} damage to ${es[idx].name}`);
          }
        });
        break;
      }
      case 'block': {
        const dex = getStatusValue(p.statusEffects, 'Dexterity');
        const blockTimes = card.effects.find(e => e.special === 'x_times_block') ? (energyOverride ?? 0) : 1;
        const totalBlock = (effect.value + dex) * blockTimes;
        p.block += totalBlock;
        log.push(`${card.name}: gained ${totalBlock} block`);
        break;
      }
      case 'status': {
        if (!effect.status) break;
        if (effect.target === 'self') {
          p.statusEffects = addStatus(p.statusEffects, effect.status, effect.value);
        } else if (effect.target === 'enemy' && es[targetIdx]) {
          es[targetIdx].statusEffects = addStatus(es[targetIdx].statusEffects, effect.status, effect.value);
          log.push(`Applied ${effect.value} ${effect.status} to ${es[targetIdx].name}`);
        } else if (effect.target === 'all_enemies') {
          es = es.map(e => ({ ...e, statusEffects: addStatus(e.statusEffects, effect.status!, effect.value) }));
        }
        break;
      }
      case 'draw': {
        log.push(`Drew ${effect.value} cards`);
        break;
      }
      case 'energy': {
        p.energy += effect.value;
        break;
      }
      case 'heal': {
        p.currentHp = Math.min(p.maxHp, p.currentHp + effect.value);
        break;
      }
      case 'special': {
        if (effect.special === 'anger_copy') {
          // handled in store
        }
        break;
      }
    }
  }

  return { player: p, enemies: es, log, exhaustedCard };
}

export function processEnemyTurn(player: Character, enemies: Enemy[], relics: Relic[]): { player: Character; enemies: Enemy[]; log: string[] } {
  let p = { ...player };
  let es = [...enemies];
  const log: string[] = [];

  // Reset player block at start of enemy turn? No — block resets at START of player turn
  es = es.map(e => {
    if (!e.isAlive) return e;
    const move = e.movePattern[e.currentMoveIndex % e.movePattern.length];
    let enemy = { ...e };

    if (move.type === 'attack' && move.value) {
      const dmg = calcDamage(move.value, e.statusEffects, p.statusEffects);
      p = applyDamageToPlayer(p, dmg);
      log.push(`${e.name} attacks for ${dmg}`);

      // Bronze Scales
      if (relics.some(r => r.id === 'bronze_scales') && dmg > 0) {
        enemy = applyDamageToEnemy(enemy, 3);
        log.push('Bronze Scales: 3 damage back');
      }
    } else if (move.type === 'defend' && move.value) {
      enemy.block += move.value;
      log.push(`${e.name} gains ${move.value} block`);
    } else if (move.type === 'buff' && move.status) {
      enemy.statusEffects = addStatus(enemy.statusEffects, move.status, move.statusValue ?? 1);
      log.push(`${e.name} used ${move.description}`);
    } else if (move.type === 'debuff' && move.status) {
      p.statusEffects = addStatus(p.statusEffects, move.status, move.statusValue ?? 1);
      log.push(`${e.name} applied ${move.statusValue} ${move.status} to player`);
    }

    // Ritual: gain Strength
    const ritual = getStatusValue(enemy.statusEffects, 'Ritual');
    if (ritual > 0) {
      enemy.statusEffects = addStatus(enemy.statusEffects, 'Strength', ritual);
    }

    // Poison damage at end of enemy turn
    const poison = getStatusValue(enemy.statusEffects, 'Poison');
    if (poison > 0) {
      enemy.currentHp = Math.max(0, enemy.currentHp - poison);
      enemy.isAlive = enemy.currentHp > 0;
      enemy.statusEffects = enemy.statusEffects.map(s => s.type === 'Poison' ? { ...s, value: s.value - 1 } : s).filter(s => s.value > 0);
      log.push(`${e.name} takes ${poison} poison damage`);
    }

    // Advance move pattern
    enemy.currentMoveIndex = (enemy.currentMoveIndex + 1) % enemy.movePattern.length;

    // Update intent
    const nextMove = enemy.movePattern[enemy.currentMoveIndex % enemy.movePattern.length];
    enemy.intent = {
      type: nextMove.type === 'attack' ? 'attack' : nextMove.type === 'defend' ? 'defend' : 'buff',
      value: nextMove.value,
    };

    return enemy;
  });

  // Tick player status effects
  p.statusEffects = tickStatusEffects(p.statusEffects);

  return { player: p, enemies: es, log };
}

export function startPlayerTurn(player: Character, relics: Relic[]): Character {
  const extraEnergy = relics.filter(r => ['coffee_dripper', 'runic_dome', 'philosophers_stone', 'fusion_hammer', 'sozu'].includes(r.id)).length;
  return {
    ...player,
    block: 0,
    energy: player.maxEnergy + extraEnergy,
  };
}

export function applyStartOfCombatRelics(player: Character, enemies: Enemy[], relics: Relic[]): { player: Character; enemies: Enemy[] } {
  let p = { ...player };
  let es = [...enemies];

  relics.forEach(r => {
    if (r.trigger !== 'combat_start') return;
    if (r.id === 'burning_blood') {/* at end */ }
    else if (r.id === 'vajra') p.statusEffects = addStatus(p.statusEffects, 'Strength', 1);
    else if (r.id === 'anchor') p.block += 10;
    else if (r.id === 'oddly_smooth_stone') p.statusEffects = addStatus(p.statusEffects, 'Dexterity', 1);
    else if (r.id === 'bag_of_marbles') {
      es = es.map(e => ({ ...e, statusEffects: addStatus(e.statusEffects, 'Vulnerable', 1) }));
    }
    else if (r.id === 'philosophers_stone') {
      es = es.map(e => ({ ...e, statusEffects: addStatus(e.statusEffects, 'Strength', 1) }));
    }
  });

  return { player: p, enemies: es };
}
