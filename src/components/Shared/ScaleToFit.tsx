import { useEffect, useState } from 'react';

const TARGET_W = 1280;
const TARGET_H = 800;

/**
 * Locks the game to a fixed virtual canvas (1280×800) and scales it to
 * fill the viewport while keeping aspect ratio. On portrait phones, shows
 * a "please rotate" overlay so the game is always experienced in landscape.
 */
export default function ScaleToFit({ children }: { children: React.ReactNode }) {
  const [vw, setVw] = useState(window.innerWidth);
  const [vh, setVh] = useState(window.innerHeight);

  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  // Phones in portrait → ask to rotate (landscape gives much more usable area)
  const isMobile = Math.min(vw, vh) < 600;
  const isPortrait = vh > vw;
  if (isMobile && isPortrait) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white p-8 text-center">
        <div className="text-6xl mb-4 animate-pulse">📱↻</div>
        <h2 className="text-2xl font-bold mb-2">Rotate your phone</h2>
        <p className="text-gray-400">This game is designed for landscape mode.</p>
        <p className="text-gray-500 text-sm mt-4">Turn your device sideways to play.</p>
      </div>
    );
  }

  const scale = Math.min(vw / TARGET_W, vh / TARGET_H);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: TARGET_W,
          height: TARGET_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {children}
      </div>
    </div>
  );
}
