import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import type { CharacterId } from '../../types';
import SpriteAnimator from '../Shared/SpriteAnimator';
import { GON_SPRITE, DEFECT_SPRITE } from '../../data/spriteConfig';

const CHARACTERS = [
  {
    id: 'ironclad' as CharacterId,
    name: 'Ironclad',
    emoji: '🗡️',
    hp: 80,
    description: 'A battle-hardened warrior who fights with brute strength and unyielding defense.',
    playstyle: 'Aggressive - Build Strength, overwhelm enemies',
    color: 'from-red-900 to-red-800',
    border: 'border-red-600',
    highlight: 'text-red-300',
    starterRelic: '🩸 Burning Blood — Heal 6 HP after combat',
    keyCards: ['Strike', 'Defend', 'Bash', 'Cleave', 'Impervious'],
  },
  {
    id: 'defect' as CharacterId,
    name: 'The Defect',
    emoji: '🤖',
    hp: 75,
    description: 'A malfunctioning automaton that channels elemental orbs to devastate enemies.',
    playstyle: 'Technical - Channel orbs, combo abilities',
    color: 'from-blue-900 to-blue-800',
    border: 'border-blue-600',
    highlight: 'text-blue-300',
    starterRelic: '⚡ Cracked Core — Channel a Lightning orb at combat start',
    keyCards: ['Zap', 'Dualcast', 'Cold Snap', 'Ball Lightning', 'Glacier'],
  },
];

export default function CharacterSelect() {
  const { startRun } = useGameStore();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-950 to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-yellow-400 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
          Choose Your Character
        </h1>
        <p className="text-gray-400">Select your champion for this run</p>
      </motion.div>

      <div className="flex gap-8 flex-wrap justify-center px-4">
        {CHARACTERS.map((char, i) => (
          <motion.div
            key={char.id}
            initial={{ opacity: 0, x: i === 0 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            whileHover={{ scale: 1.03, y: -4 }}
            className={`bg-gradient-to-b ${char.color} border-2 ${char.border} rounded-2xl p-6 w-72 cursor-pointer shadow-2xl`}
            onClick={() => startRun(char.id)}
          >
            {/* Art */}
            <div className="text-center mb-4">
              <div className="flex justify-center mb-2">
                <SpriteAnimator
                  config={char.id === 'ironclad' ? GON_SPRITE : DEFECT_SPRITE}
                  animName="idle"
                  loop
                />
              </div>
              <h2 className={`text-2xl font-bold ${char.highlight}`} style={{ fontFamily: 'Georgia, serif' }}>
                {char.name}
              </h2>
              <p className="text-gray-300 text-sm">❤️ {char.hp} HP</p>
            </div>

            {/* Description */}
            <p className="text-gray-200 text-sm mb-3 text-center">{char.description}</p>

            {/* Playstyle */}
            <div className="bg-black/30 rounded-lg p-2 mb-3">
              <p className={`text-xs font-bold ${char.highlight} mb-0.5`}>Playstyle</p>
              <p className="text-gray-300 text-xs">{char.playstyle}</p>
            </div>

            {/* Starter Relic */}
            <div className="bg-black/30 rounded-lg p-2 mb-3">
              <p className={`text-xs font-bold ${char.highlight} mb-0.5`}>Starter Relic</p>
              <p className="text-gray-300 text-xs">{char.starterRelic}</p>
            </div>

            {/* Key cards */}
            <div className="bg-black/30 rounded-lg p-2">
              <p className={`text-xs font-bold ${char.highlight} mb-1`}>Starting Cards</p>
              <div className="flex flex-wrap gap-1">
                {char.keyCards.map(card => (
                  <span key={card} className="bg-gray-800 text-gray-300 text-xs px-1.5 py-0.5 rounded">{card}</span>
                ))}
              </div>
            </div>

            <button className={`w-full mt-4 py-2 rounded-xl font-bold text-white border ${char.border} bg-black/40 hover:bg-black/60 transition-colors`}>
              Select {char.name}
            </button>
          </motion.div>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => useGameStore.setState({ screen: 'menu' })}
        className="mt-6 text-gray-500 hover:text-gray-300 text-sm transition-colors"
      >
        ← Back to Menu
      </motion.button>
    </div>
  );
}
