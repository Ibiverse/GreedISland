import { useEffect, useRef, useState } from 'react';
import type { SpriteSheetConfig, SpriteAnimDef } from '../../data/spriteConfig';

interface SpriteAnimatorProps {
  config: SpriteSheetConfig;
  animName: string;
  flip?: boolean;
  className?: string;
  onComplete?: () => void;
  loop?: boolean;
}

export default function SpriteAnimator({
  config,
  animName,
  flip = false,
  className = '',
  onComplete,
  loop = true,
}: SpriteAnimatorProps) {
  const anim: SpriteAnimDef = config.animations[animName] ?? config.animations['idle'];
  const [frame, setFrame] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    setFrame(0);
    doneRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);

    const fps = anim.fps ?? 8;
    timerRef.current = setInterval(() => {
      setFrame(prev => {
        const next = prev + 1;
        if (next >= anim.frameCount) {
          if (!loop) {
            if (!doneRef.current) {
              doneRef.current = true;
              onComplete?.();
            }
            return anim.frameCount - 1;
          }
          return 0;
        }
        return next;
      });
    }, 1000 / fps);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [animName, anim.row, anim.yPx, anim.frameCount, anim.fps, loop]);

  const scale = config.scale ?? 1;
  const fw = config.frameWidth;
  const fh = config.frameHeight;
  const col = (anim.startCol ?? 0) + frame;

  // Support absolute y-pixel offset (yPx) for non-uniform sprite sheets
  const rowY = anim.yPx ?? (anim.row * fh);

  const bgX = -(col * fw);
  const bgY = -rowY;

  const displayW = Math.round(fw * scale);
  const displayH = Math.round(fh * scale);

  // Total sheet width = frameWidth * sheetCols
  const sheetDisplayW = fw * config.sheetCols * scale;

  // defect.png still has a black background — use screen blend to make black transparent
  const isBlackBg = config.bgColor === '#000000';

  return (
    <div
      className={`inline-block relative overflow-hidden select-none ${className}`}
      style={{
        width: displayW,
        height: displayH,
        transform: flip ? 'scaleX(-1)' : undefined,
        imageRendering: 'pixelated',
      }}
    >
      <div
        style={{
          width: displayW,
          height: displayH,
          backgroundImage: `url(${config.src})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: `${bgX * scale}px ${bgY * scale}px`,
          backgroundSize: `${sheetDisplayW}px auto`,
          imageRendering: 'pixelated',
          transition: 'none',
          mixBlendMode: isBlackBg ? 'screen' : undefined,
        }}
      />
    </div>
  );
}
