import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Enemy } from '../../types';
import HPBar from '../Shared/HPBar';
import StatusIcon from '../Shared/StatusIcon';
import CombatSprite from '../Shared/CombatSprite';
import type { CombatSpriteState } from '../Shared/CombatSprite';
import { KURORO_SPRITE } from '../../data/spriteConfig';

interface EnemyComponentProps {
  enemy: Enemy;
  isTargeted: boolean;
  onClick: () => void;
  hideIntent?: boolean;
  spriteState?: CombatSpriteState;
}

const ENEMY_SCALE: Record<string, number> = {
  cultist: 0.7,
  jaw_worm: 0.6,
  louse_red: 0.5,
  louse_green: 0.5,
  acid_slime_m: 0.65,
  spike_slime_m: 0.55,
  fungus_beast: 0.6,
  snake_plant: 0.65,
  gremlin_nob: 0.85,
  lagavulin: 0.9,
  slime_boss: 1.1,
  the_guardian: 1.2,
  hexaghost: 1.1,
};

const ENEMY_TINT: Record<string, string> = {
  cultist:      'hue-rotate(180deg) saturate(1.5)',
  jaw_worm:     'hue-rotate(90deg) saturate(2)',
  louse_red:    'hue-rotate(0deg) saturate(2)',
  louse_green:  'hue-rotate(120deg) saturate(2)',
  acid_slime_m: 'hue-rotate(150deg) saturate(2)',
  spike_slime_m:'hue-rotate(210deg) saturate(2)',
  fungus_beast: 'hue-rotate(80deg) saturate(1.5)',
  snake_plant:  'hue-rotate(110deg) saturate(2)',
  gremlin_nob:  'hue-rotate(30deg) saturate(1.2) brightness(0.9)',
  lagavulin:    'hue-rotate(270deg) saturate(1.5)',
  slime_boss:   'hue-rotate(160deg) saturate(2) brightness(1.1)',
  the_guardian: 'hue-rotate(0deg) saturate(0.3) brightness(1.3)',
  hexaghost:    'hue-rotate(300deg) saturate(2)',
};

// Four L-shaped brackets at the corners — visible target indicator without enclosing the sprite
function TargetCorners() {
  const size = 18;
  const thick = 3;
  const color = '#ffd84a';
  const corner: React.CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    pointerEvents: 'none',
    filter: 'drop-shadow(0 0 4px rgba(255,200,40,0.8))',
  };
  return (
    <>
      {/* top-left */}
      <div style={{ ...corner, top: -6, left: -6, borderTop: `${thick}px solid ${color}`, borderLeft: `${thick}px solid ${color}` }} />
      {/* top-right */}
      <div style={{ ...corner, top: -6, right: -6, borderTop: `${thick}px solid ${color}`, borderRight: `${thick}px solid ${color}` }} />
      {/* bottom-left */}
      <div style={{ ...corner, bottom: -6, left: -6, borderBottom: `${thick}px solid ${color}`, borderLeft: `${thick}px solid ${color}` }} />
      {/* bottom-right */}
      <div style={{ ...corner, bottom: -6, right: -6, borderBottom: `${thick}px solid ${color}`, borderRight: `${thick}px solid ${color}` }} />
    </>
  );
}

// Intent shown as a small floating badge above the sprite — no card frame
function IntentBadge({ enemy, hidden }: { enemy: Enemy; hidden?: boolean }) {
  if (hidden) return <div className="text-xs text-white/50 bg-black/40 rounded px-1">?</div>;
  const { intent } = enemy;
  if (intent.type === 'attack') return (
    <div className="flex items-center gap-1 bg-red-900/70 rounded-full px-2 py-0.5 backdrop-blur-sm border border-red-500/50">
      <span className="text-sm">⚔️</span>
      <span className="text-xs font-bold text-red-200">{intent.value}</span>
    </div>
  );
  if (intent.type === 'defend') return (
    <div className="bg-blue-900/70 rounded-full px-2 py-0.5 backdrop-blur-sm border border-blue-500/50">
      <span className="text-sm">🛡️</span>
    </div>
  );
  if (intent.type === 'buff') return (
    <div className="bg-yellow-900/70 rounded-full px-2 py-0.5 backdrop-blur-sm border border-yellow-500/50">
      <span className="text-sm">⬆️</span>
    </div>
  );
  return null;
}

export default function EnemyComponent({ enemy, isTargeted, onClick, hideIntent, spriteState = 'idle' }: EnemyComponentProps) {
  const [localState, setLocalState] = useState<CombatSpriteState>('idle');

  useEffect(() => {
    if (spriteState !== 'idle') {
      setLocalState(spriteState);
      if (spriteState !== 'death') {
        const t = setTimeout(() => setLocalState('idle'), 600);
        return () => clearTimeout(t);
      }
    } else {
      setLocalState('idle');
    }
  }, [spriteState]);

  const enemyKey = Object.keys(ENEMY_SCALE).find(k => enemy.id.startsWith(k)) ?? 'cultist';
  const scale    = ENEMY_SCALE[enemyKey] ?? 0.7;
  const filter   = ENEMY_TINT[enemyKey]  ?? '';

  const enemyConfig = {
    ...KURORO_SPRITE,
    scale: (KURORO_SPRITE.scale ?? 3.0) * scale,
  };

  if (!enemy.isAlive) {
    return (
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 0.3, y: 30 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-end"
      >
        <div style={{ filter }} className="opacity-40">
          <CombatSprite config={enemyConfig} state="death" flip={true} />
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className="flex flex-col-reverse items-center cursor-pointer select-none"
      onClick={onClick}
    >
      {/* Sprite — first in JSX → renders at the BOTTOM (the floor line) */}
      <div className="relative">
        <div
          className="sprite-idle"
          style={{ filter, transformOrigin: 'bottom center' }}
        >
          <CombatSprite
            config={enemyConfig}
            state={localState}
            flip={true}
            onAnimComplete={() => setLocalState('idle')}
          />
        </div>
        {localState === 'hurt' && (
          <div className="absolute inset-0 bg-red-400 opacity-40 rounded pointer-events-none" />
        )}
        {isTargeted && <TargetCorners />}
      </div>

      {/* UI stacks ABOVE sprite via flex-col-reverse */}
      <p className="text-white text-xs font-bold text-center mb-1 drop-shadow">{enemy.name}</p>

      <div className="mb-1" style={{ minWidth: 110 }}>
        <HPBar current={enemy.currentHp} max={enemy.maxHp} size="sm" />
      </div>

      {enemy.block > 0 && (
        <div className="flex items-center gap-1 text-blue-300 text-xs mb-1">
          <span>🛡️</span><span className="font-bold">{enemy.block}</span>
        </div>
      )}

      {enemy.statusEffects.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center mb-1">
          {enemy.statusEffects.map((s, i) => <StatusIcon key={i} effect={s} />)}
        </div>
      )}

      {/* Intent badge — at the very top (last in JSX with col-reverse) */}
      <div className="mb-1 h-7 flex items-center justify-center">
        <IntentBadge enemy={enemy} hidden={hideIntent} />
      </div>
    </div>
  );
}
