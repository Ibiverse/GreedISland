import { useEffect, useState } from 'react';
import type { Character } from '../../types';
import HPBar from '../Shared/HPBar';
import StatusIcon from '../Shared/StatusIcon';
import CombatSprite from '../Shared/CombatSprite';
import type { CombatSpriteState } from '../Shared/CombatSprite';
import { GON_SPRITE, DEFECT_SPRITE } from '../../data/spriteConfig';

interface PlayerComponentProps {
  character: Character;
  spriteState?: CombatSpriteState;
}

function stateClass(state: CombatSpriteState): string {
  switch (state) {
    case 'hurt':    return 'sprite-hurt';
    case 'attack':
    case 'special': return 'sprite-attack';
    case 'death':   return 'sprite-death';
    default:        return 'sprite-idle';
  }
}

export default function PlayerComponent({ character, spriteState = 'idle' }: PlayerComponentProps) {
  const spriteConfig = character.id === 'ironclad' ? GON_SPRITE : DEFECT_SPRITE;
  const isKillua = character.id !== 'ironclad';
  const [localState, setLocalState] = useState<CombatSpriteState>('idle');

  useEffect(() => {
    setLocalState(spriteState);
    if (spriteState !== 'idle' && spriteState !== 'death') {
      const t = setTimeout(() => setLocalState('idle'), 700);
      return () => clearTimeout(t);
    }
  }, [spriteState]);

  return (
    <div className="flex flex-col-reverse items-center">
      {/* Sprite — first in JSX → renders at the BOTTOM of the column (the floor line) */}
      <div className="relative">
        {isKillua ? (
          <div className={stateClass(localState)} style={{ transformOrigin: 'bottom center' }}>
            <CombatSprite config={spriteConfig} state="idle" flip={false} />
          </div>
        ) : (
          <CombatSprite
            config={spriteConfig}
            state={localState}
            flip={false}
            onAnimComplete={() => setLocalState('idle')}
          />
        )}
        {localState === 'hurt' && (
          <div className="absolute inset-0 bg-red-500 opacity-40 rounded pointer-events-none" />
        )}
      </div>

      {/* UI listed AFTER in JSX → stacks ABOVE the sprite visually */}
      <p className="text-white text-sm font-bold text-center mb-1 drop-shadow">{character.name}</p>
      <div className="mb-1" style={{ minWidth: 140 }}>
        <HPBar current={character.currentHp} max={character.maxHp} size="md" />
      </div>
      {character.block > 0 && (
        <div className="flex items-center gap-1 text-blue-300 text-sm mb-1">
          <span>🛡️</span><span className="font-bold">{character.block}</span>
        </div>
      )}
      <div className="flex gap-1 mb-1">
        {Array.from({ length: character.maxEnergy }).map((_, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all
              ${i < character.energy
                ? 'bg-blue-600 border-blue-300 text-white shadow-lg shadow-blue-500/50'
                : 'bg-gray-800 border-gray-600 text-gray-500'
              }`}
          >
            {i < character.energy ? '⚡' : '○'}
          </div>
        ))}
      </div>
      {character.statusEffects.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center mb-1">
          {character.statusEffects.map((s, i) => <StatusIcon key={i} effect={s} />)}
        </div>
      )}
    </div>
  );
}
