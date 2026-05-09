import { useEffect, useRef } from 'react';
import { initParticles, destroyParticles } from '../../systems/particles';

/** Mounts the global PixiJS canvas as an absolutely-positioned overlay. */
export default function ParticleCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    if (!host) return;
    initParticles(host).then(() => {
      if (cancelled) destroyParticles();
    });
    return () => {
      cancelled = true;
      destroyParticles();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="pointer-events-none"
      style={{
        position: 'absolute',
        left: 0, right: 0, top: 0, bottom: 0,
        zIndex: 5,
        background: 'transparent',
        overflow: 'hidden',
      }}
    />
  );
}
