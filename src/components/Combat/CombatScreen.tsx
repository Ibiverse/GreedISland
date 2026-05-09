import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import CardComponent from './CardComponent';
import EnemyComponent from './EnemyComponent';
import PlayerComponent from './PlayerComponent';
import DungeonBackground from './DungeonBackground';
import type { CombatSpriteState } from '../Shared/CombatSprite';
import { screenShake, spriteHit, spriteLunge, dealHand, yeetCard, floatDamage } from '../../systems/combatFx';
import { audio } from '../../systems/audio';
import AudioSettingsButton from '../Shared/AudioSettingsButton';
import ParticleCanvas from '../Shared/ParticleCanvas';
import { fxHitSpark, fxBigImpact, fxLightning, fxFire, fxEnergyOrbs, fxBlock, fxDeath, fxSpellCircle, fxSlash } from '../../systems/particles';

export default function CombatScreen() {
  const { run, combat, playCardAction, endTurn } = useGameStore();
  const [targetIdx, setTargetIdx] = useState(0);
  const [logExpanded, setLogExpanded] = useState(false);

  // Sprite animation states
  const [playerSpriteState, setPlayerSpriteState] = useState<CombatSpriteState>('idle');
  const [enemyStates, setEnemyStates] = useState<CombatSpriteState[]>([]);

  // Refs for GSAP / PixiJS targets
  const arenaRef     = useRef<HTMLDivElement>(null);  // outer combat screen (screen shake target)
  const fxRef        = useRef<HTMLDivElement>(null);  // inner arena = particle coordinate space
  const handRef      = useRef<HTMLDivElement>(null);
  const playerRef    = useRef<HTMLDivElement>(null);
  const enemyRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs     = useRef<(HTMLDivElement | null)[]>([]);

  // Track prev HP to detect hits
  const prevPlayerHp   = useRef<number>(0);
  const prevEnemyHps   = useRef<number[]>([]);
  const prevPlayerBlock = useRef<number>(0);
  const prevEnemyBlocks = useRef<number[]>([]);
  const prevEnemyCount = useRef<number>(0);

  if (!run || !combat) return null;

  const { character } = run;
  const { enemies, phase } = combat;
  const hasRunicDome = character.relics.some(r => r.id === 'runic_dome');

  // Convert a DOM element's center to coordinates relative to the inner arena (where ParticleCanvas lives).
  const elCenter = (el: HTMLElement | null): { x: number; y: number } | null => {
    if (!el || !fxRef.current) return null;
    const r = el.getBoundingClientRect();
    const a = fxRef.current.getBoundingClientRect();
    return { x: r.left + r.width / 2 - a.left, y: r.top + r.height / 2 - a.top };
  };

  // Init enemy states + HP/block tracking when count changes
  useEffect(() => {
    if (enemies.length !== prevEnemyCount.current) {
      setEnemyStates(enemies.map(() => 'idle'));
      prevEnemyHps.current    = enemies.map(e => e.currentHp);
      prevEnemyBlocks.current = enemies.map(e => e.block);
      prevEnemyCount.current  = enemies.length;
      enemyRefs.current = enemyRefs.current.slice(0, enemies.length);
    }
  }, [enemies.length]);

  // Music: combat or boss based on screen. Re-fires every time we mount,
  // and also if the screen type changes between normal/elite/boss combat.
  const screen = useGameStore(s => s.screen);
  useEffect(() => {
    audio.playMusic(screen === 'boss_combat' ? 'boss' : 'combat');
  }, [screen, combat.turn === 1]);  // re-trigger on fresh combat (turn 1 == new fight)

  // Player damage detection → hurt anim + damage number + screen shake
  useEffect(() => {
    const prevHp = prevPlayerHp.current;
    const prevBlock = prevPlayerBlock.current;
    if (prevHp > 0) {
      const hpLost = prevHp - character.currentHp;
      const blockLost = Math.max(0, prevBlock - character.block);

      if (hpLost > 0) {
        setPlayerSpriteState('hurt');
        spriteHit(playerRef.current, true);
        floatDamage(playerRef.current, hpLost, 'damage');
        screenShake(arenaRef.current, Math.min(4 + hpLost * 0.6, 14), 0.4);
        audio.sfx(hpLost >= 8 ? 'hit_heavy' : 'hit_light');
        const c = elCenter(playerRef.current);
        if (c) (hpLost >= 8 ? fxBigImpact : fxHitSpark)(c.x, c.y);
        setTimeout(() => setPlayerSpriteState('idle'), 500);
      } else if (blockLost > 0) {
        floatDamage(playerRef.current, blockLost, 'block');
        audio.sfx('block');
        const c = elCenter(playerRef.current);
        if (c) fxBlock(c.x, c.y);
      }
    }
    prevPlayerHp.current = character.currentHp;
    prevPlayerBlock.current = character.block;
  }, [character.currentHp, character.block]);

  // Enemy damage detection
  useEffect(() => {
    let anyHit = false;
    let totalDmg = 0;
    const newStates = enemies.map((e, i) => {
      const prevHp = prevEnemyHps.current[i] ?? e.currentHp;
      const prevBlock = prevEnemyBlocks.current[i] ?? e.block;
      const hpLost = prevHp - e.currentHp;
      const blockLost = Math.max(0, prevBlock - e.block);

      if (hpLost > 0) {
        anyHit = true; totalDmg += hpLost;
        spriteHit(enemyRefs.current[i], false);
        floatDamage(enemyRefs.current[i], hpLost, 'damage');
        audio.sfx(hpLost >= 8 ? 'hit_heavy' : 'hit_light', { rate: 0.95 + Math.random() * 0.1 });
        const c = elCenter(enemyRefs.current[i]);
        if (c) (hpLost >= 8 ? fxBigImpact : fxHitSpark)(c.x, c.y);
        if (!e.isAlive) {
          audio.sfx('death');
          if (c) fxDeath(c.x, c.y);
        }
        return 'hurt' as CombatSpriteState;
      } else if (blockLost > 0) {
        floatDamage(enemyRefs.current[i], blockLost, 'block');
        audio.sfx('block', { volume: 0.7 });
        const c = elCenter(enemyRefs.current[i]);
        if (c) fxBlock(c.x, c.y);
      }
      if (!e.isAlive) return 'death' as CombatSpriteState;
      return 'idle' as CombatSpriteState;
    });

    if (anyHit) {
      screenShake(arenaRef.current, Math.min(3 + totalDmg * 0.5, 12), 0.35);
      setEnemyStates(newStates);
      setTimeout(() => setEnemyStates(enemies.map(() => 'idle')), 600);
    }
    prevEnemyHps.current    = enemies.map(e => e.currentHp);
    prevEnemyBlocks.current = enemies.map(e => e.block);
  }, [enemies.map(e => `${e.currentHp}/${e.block}`).join(',')]);

  // Stagger-deal cards whenever a fresh hand appears
  useEffect(() => {
    const els = cardRefs.current.filter(Boolean) as HTMLElement[];
    if (els.length) {
      dealHand(els);
      audio.sfx('card_draw', { rate: 1.0 });
    }
  }, [character.hand.length, combat.turn]);

  function handleCardClick(idx: number) {
    const card = character.hand[idx];
    if (!card || phase !== 'player') return;
    const cost = typeof card.cost === 'number' ? card.cost : character.energy;
    if (character.energy < cost) return;

    const isAttack = card.type === 'Attack';
    const cardEl   = cardRefs.current[idx];
    const targetEl = isAttack ? enemyRefs.current[targetIdx] : playerRef.current;
    const tRect    = targetEl?.getBoundingClientRect();
    const tx = tRect ? tRect.left + tRect.width / 2 : window.innerWidth / 2;
    const ty = tRect ? tRect.top + tRect.height / 2 : window.innerHeight / 2;

    // Audio for card play
    audio.sfx('card_play');
    audio.sfx(isAttack ? 'attack_slash' : (card.type === 'Power' ? 'attack_special' : 'attack_magic'),
              { rate: 0.9 + Math.random() * 0.2 });

    // Card-specific particle effects
    const playerCenter = elCenter(playerRef.current);
    const targetCenter = elCenter(enemyRefs.current[targetIdx]);
    setTimeout(() => {
      if (card.baseId === 'zap' || card.baseId.includes('lightning') || card.baseId === 'thunderclap') {
        // Lightning bolt — only if there's a target
        if (playerCenter && targetCenter) fxLightning(playerCenter.x, playerCenter.y - 40, targetCenter.x, targetCenter.y);
      } else if (isAttack && (card.baseId === 'bash' || card.baseId === 'heavy_blade' || card.baseId === 'uppercut')) {
        // Heavy attack → fire impact
        if (targetCenter) fxFire(targetCenter.x, targetCenter.y);
      } else if (isAttack) {
        // Generic slash arc emerging from player
        if (playerCenter) fxSlash(playerCenter.x + 50, playerCenter.y - 30, true);
      } else if (card.type === 'Power') {
        // Spell circle under caster
        if (playerCenter) fxSpellCircle(playerCenter.x, playerCenter.y + 80, 0xff66cc);
      } else if (card.type === 'Skill') {
        // Energy orbs floating up from player
        if (playerCenter) fxEnergyOrbs(playerCenter.x, playerCenter.y, 8, 0x66ddff);
      }
    }, 250);  // sync with card-yeet impact timing

    // Lunge sprite for attacks
    if (isAttack) spriteLunge(playerRef.current, true);
    setPlayerSpriteState(isAttack ? 'attack' : 'special');
    setTimeout(() => setPlayerSpriteState('idle'), 700);

    // Yeet card toward target, then resolve
    yeetCard(cardEl, tx, ty, () => {
      if (card.cost === 'X') {
        playCardAction(idx, targetIdx, character.energy);
      } else {
        playCardAction(idx, targetIdx);
      }
    });
  }

  function handleEndTurn() {
    audio.sfx('turn_end');
    setEnemyStates(enemies.map(e => e.isAlive ? 'attack' : 'death'));
    setTimeout(() => {
      endTurn();
      setEnemyStates(enemies.map(() => 'idle'));
    }, 600);
  }

  const totalCards = character.hand.length;

  return (
    <div
      className="w-full h-full flex flex-col relative overflow-hidden"
      style={{ background: '#0d0a07' }}
      ref={arenaRef}
    >
      <DungeonBackground />

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/60 border-b border-gray-800 flex-shrink-0 z-10">
        <div className="flex gap-1 flex-wrap">
          {character.relics.map(r => (
            <div
              key={r.id}
              className="bg-yellow-900/70 border border-yellow-600 rounded px-1.5 py-0.5 text-xs text-yellow-200 cursor-help"
              title={r.description}
            >
              {r.name}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 relative">
          <span className="text-yellow-400 font-bold">💰 {run.gold}</span>
          <span className="text-gray-500 text-xs">Turn {combat.turn}</span>
          <AudioSettingsButton />
        </div>
      </div>

      {/* Arena */}
      <div ref={fxRef} className="flex-1 min-h-0 relative">
        <ParticleCanvas />

        {/* Player */}
        <div
          ref={playerRef}
          className="absolute flex flex-col items-center"
          style={{ left: '6%', bottom: '-28%' }}
        >
          <PlayerComponent character={character} spriteState={playerSpriteState} />
          {character.potions.length > 0 && (
            <div className="absolute flex gap-1" style={{ top: '100%', marginTop: 6 }}>
              {character.potions.map((p, i) => (
                <button
                  key={i}
                  onClick={() => useGameStore.getState().usePotion(i, targetIdx)}
                  className="bg-green-800 hover:bg-green-700 text-white text-xs rounded-full w-7 h-7 border border-green-600 flex items-center justify-center"
                  title={p.name}
                >
                  🧪
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Enemies */}
        <div
          className="absolute flex gap-10 items-end"
          style={{ right: '6%', bottom: '-20%' }}
        >
          {enemies.map((enemy, i) => (
            <div key={enemy.id} ref={el => { enemyRefs.current[i] = el; }}>
              <EnemyComponent
                enemy={enemy}
                isTargeted={targetIdx === i}
                onClick={() => { if (enemy.isAlive) setTargetIdx(i); }}
                hideIntent={hasRunicDome}
                spriteState={enemyStates[i] ?? 'idle'}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Combat log */}
      <div className="px-4 mb-1 z-10">
        <button
          onClick={() => setLogExpanded(!logExpanded)}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          {logExpanded ? '▼' : '▶'} Log
        </button>
        {logExpanded && (
          <div className="bg-black/80 rounded p-2 max-h-20 overflow-y-auto mt-1 border border-gray-800">
            {combat.combatLog.slice(-8).map((l, i) => (
              <p key={i} className="text-gray-400 text-xs">{l}</p>
            ))}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="bg-black/70 border-t border-gray-800 px-4 pb-4 pt-2 flex-shrink-0 z-10">
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-4 text-xs text-gray-500">
            <span>Draw <strong className="text-gray-300">{character.drawPile.length}</strong></span>
            <span>Disc <strong className="text-gray-300">{character.discardPile.length}</strong></span>
            <span>Exh <strong className="text-gray-300">{character.exhaustPile.length}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: character.maxEnergy }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full border-2 text-xs flex items-center justify-center font-bold transition-all
                    ${i < character.energy
                      ? 'bg-blue-600 border-blue-300 text-white shadow-blue-500/50 shadow-md'
                      : 'bg-gray-800 border-gray-700 text-gray-600'
                    }`}
                >
                  {i < character.energy ? '⚡' : ''}
                </div>
              ))}
              <span className="text-gray-400 text-xs self-center ml-1">{character.energy}/{character.maxEnergy}</span>
            </div>
            <button
              onClick={handleEndTurn}
              disabled={phase !== 'player'}
              className="bg-red-800 hover:bg-red-700 active:bg-red-900 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-bold px-5 py-2 rounded-lg border border-red-600 disabled:border-gray-700 transition-colors text-sm"
            >
              End Turn
            </button>
          </div>
        </div>

        {/* Hand */}
        <div ref={handRef} className="flex justify-center items-end gap-1 min-h-[160px] relative">
          {character.hand.length === 0 ? (
            <p className="text-gray-600 text-sm self-center">No cards in hand</p>
          ) : (
            character.hand.map((card, i) => {
              const cost = typeof card.cost === 'number' ? card.cost : 0;
              const isPlayable = phase === 'player' && character.energy >= cost;
              return (
                <div key={card.id} ref={el => { cardRefs.current[i] = el; }}>
                  <CardComponent
                    card={card}
                    index={i}
                    totalCards={totalCards}
                    isPlayable={isPlayable}
                    isSelected={false}
                    onClick={() => handleCardClick(i)}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
