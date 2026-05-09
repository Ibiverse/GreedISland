import { useGameStore } from '../../store/gameStore';
import CardComponent from '../Combat/CardComponent';

export default function RewardScreen() {
  const { run, combat, chooseCardReward } = useGameStore();

  if (!run || !combat) return null;
  const { goldReward, cardRewards, relicReward } = combat;

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="bg-gray-800 border border-yellow-700 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🏆</div>
          <h1 className="text-2xl font-bold text-yellow-400" style={{ fontFamily: 'Georgia, serif' }}>Victory!</h1>
          <p className="text-gray-400 text-sm mt-1">Choose your reward</p>
        </div>

        {/* Gold earned */}
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-900/40 border border-yellow-600 rounded-xl px-6 py-3 flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <div>
              <p className="text-yellow-300 text-sm">Gold Earned</p>
              <p className="text-yellow-100 text-2xl font-bold">+{goldReward}</p>
            </div>
          </div>
        </div>

        {/* Relic reward */}
        {relicReward && (
          <div className="bg-purple-900/40 border border-purple-600 rounded-xl p-4 mb-6">
            <p className="text-purple-300 text-sm font-bold mb-1">✨ Relic Found</p>
            <p className="text-white font-bold">{relicReward.name}</p>
            <p className="text-gray-300 text-sm">{relicReward.description}</p>
          </div>
        )}

        {/* Card rewards */}
        <div>
          <p className="text-gray-300 text-sm text-center mb-4">Choose a card to add to your deck:</p>
          <div className="flex justify-center gap-4 flex-wrap mb-4">
            {cardRewards.map((card, i) => (
              <div key={card.id} className="flex flex-col items-center gap-2">
                <CardComponent
                  card={card}
                  index={i}
                  totalCards={1}
                  isPlayable={true}
                  isSelected={false}
                  onClick={() => chooseCardReward(card)}
                  compact
                />
                <button
                  onClick={() => chooseCardReward(card)}
                  className="bg-blue-800 hover:bg-blue-700 text-white text-xs px-4 py-1.5 rounded border border-blue-600"
                >
                  Add to Deck
                </button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => chooseCardReward(null)}
              className="text-gray-400 hover:text-white text-sm underline transition-colors"
            >
              Skip — I don't want any card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
