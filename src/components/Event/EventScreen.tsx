import { useGameStore } from '../../store/gameStore';

export default function EventScreen() {
  const { currentEvent, chooseEventOutcome, run } = useGameStore();

  if (!currentEvent || !run) return null;

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="bg-gray-800 border border-gray-600 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
        {/* Icon */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-2">{currentEvent.imageEmoji}</div>
          <h1 className="text-xl font-bold text-purple-300" style={{ fontFamily: 'Georgia, serif' }}>
            {currentEvent.title}
          </h1>
        </div>

        {/* Description */}
        <div className="bg-gray-900 rounded-xl p-4 mb-6 border border-gray-700">
          <p className="text-gray-200 text-sm leading-relaxed">{currentEvent.description}</p>
        </div>

        {/* Choices */}
        <div className="space-y-3">
          {currentEvent.choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => chooseEventOutcome(i)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-left p-3 rounded-xl border border-gray-600 hover:border-purple-500 transition-all group"
            >
              <p className="text-white font-semibold text-sm group-hover:text-purple-200">
                {choice.text}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">{choice.outcome}</p>
            </button>
          ))}
        </div>

        {/* Gold display */}
        <div className="mt-4 text-center text-yellow-400 text-sm">
          💰 {run.gold} gold
        </div>
      </div>
    </div>
  );
}
