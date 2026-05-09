import { useEffect, useState } from 'react';
import SpriteAnimator from './SpriteAnimator';
import type { SpriteSheetConfig } from '../../data/spriteConfig';

export type CombatSpriteState = 'idle' | 'attack' | 'hurt' | 'death' | 'victory' | 'special';

interface CombatSpriteProps {
  config: SpriteSheetConfig;
  state: CombatSpriteState;
  flip?: boolean;
  onAnimComplete?: () => void;
  className?: string;
}

const LOOPING: CombatSpriteState[] = ['idle'];

export default function CombatSprite({ config, state, flip, onAnimComplete, className }: CombatSpriteProps) {
  const [currentAnim, setCurrentAnim] = useState<string>('idle');
  const isLoop = LOOPING.includes(state);

  useEffect(() => {
    // Map state to animation name, fall back to 'idle' if not found
    const animMap: Record<CombatSpriteState, string> = {
      idle:    'idle',
      attack:  config.animations['attack']  ? 'attack'  : 'idle',
      hurt:    config.animations['hurt']    ? 'hurt'    : 'idle',
      death:   config.animations['death']   ? 'death'   : 'idle',
      victory: config.animations['victory'] ? 'victory' : 'idle',
      special: config.animations['special'] ? 'special' : 'attack',
    };
    setCurrentAnim(animMap[state] ?? 'idle');
  }, [state]);

  function handleComplete() {
    if (!isLoop) {
      setCurrentAnim('idle');
      onAnimComplete?.();
    }
  }

  return (
    <SpriteAnimator
      config={config}
      animName={currentAnim}
      flip={flip}
      loop={isLoop}
      onComplete={handleComplete}
      className={className}
    />
  );
}
