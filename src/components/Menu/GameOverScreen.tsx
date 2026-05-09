import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

export default function GameOverScreen({ victory }: { victory?: boolean }) {
  const { run, returnToMenu } = useGameStore();
  if (!run) return null;

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-950 to-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`bg-gray-800 border-2 ${victory ? 'border-yellow-500' : 'border-red-800'} rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl text-center`}
      >
        <div className="text-6xl mb-3">{victory ? '🏆' : '💀'}</div>
        <h1
          className={`text-3xl font-bold mb-2 ${victory ? 'text-yellow-400' : 'text-red-400'}`}
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {victory ? 'Victory!' : 'Defeated'}
        </h1>
        <p className="text-gray-400 mb-6 text-sm">
          {victory ? 'You have conquered the spire!' : 'The darkness claims another hero...'}
        </p>

        {/* Stats */}
        <div className="bg-gray-900 rounded-xl p-4 mb-6 space-y-2 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Character</span>
            <span className="text-white font-bold">{run.character.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Floors Climbed</span>
            <span className="text-white font-bold">{run.currentFloor}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Enemies Slain</span>
            <span className="text-white font-bold">{run.enemiesSlain}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Damage Dealt</span>
            <span className="text-white font-bold">{run.damageDealt}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Gold Collected</span>
            <span className="text-yellow-400 font-bold">💰 {run.gold}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Cards in Deck</span>
            <span className="text-white font-bold">{run.character.deck.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Relics</span>
            <span className="text-white font-bold">{run.character.relics.length}</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={returnToMenu}
          className={`w-full py-3 rounded-xl font-bold text-white text-lg border-2 transition-colors
            ${victory
              ? 'bg-yellow-700 hover:bg-yellow-600 border-yellow-500'
              : 'bg-gray-700 hover:bg-gray-600 border-gray-500'
            }`}
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Return to Menu
        </motion.button>
      </motion.div>
    </div>
  );
}
