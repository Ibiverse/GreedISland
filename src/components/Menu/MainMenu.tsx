import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { audio } from '../../systems/audio';
import AudioSettingsButton from '../Shared/AudioSettingsButton';

export default function MainMenu() {
  useEffect(() => { audio.playMusic('menu'); }, []);

  const startGame = () => {
    audio.sfx('button');
    useGameStore.setState({ screen: 'character_select' });
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: 'url(/title.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Subtle darken overlay so the button stands out */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.18)' }} />

      {/* Audio settings (top-right) */}
      <div className="absolute top-3 right-3 z-20"><AudioSettingsButton /></div>

      {/* Centered Start button */}
      <motion.button
        onClick={startGame}
        initial={{ opacity: 0, scale: 0.7, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: 'backOut' }}
        whileHover={{ scale: 1.08, boxShadow: '0 0 50px rgba(255,200,40,0.7)' }}
        whileTap={{ scale: 0.95 }}
        className="relative z-10 text-white font-bold rounded-full"
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: '2.2rem',
          padding: '1rem 4rem',
          background: 'linear-gradient(135deg, #d4920c 0%, #f0b324 50%, #d4920c 100%)',
          border: '4px solid #fff5c2',
          boxShadow: '0 8px 30px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.4), 0 0 30px rgba(255,200,40,0.4)',
          textShadow: '0 2px 4px rgba(0,0,0,0.6), 0 0 10px rgba(255,200,40,0.5)',
          letterSpacing: '0.1em',
        }}
      >
        ▶ START
      </motion.button>

      {/* Subtle pulsing aura behind button */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 360, height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,200,40,0.25) 0%, transparent 70%)',
          zIndex: 5,
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
