import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { upgradeCard } from '../../data/cards';

export default function RestScreen() {
  const { run, restHeal, smithCard, leaveRest } = useGameStore();
  const [smithing, setSmithing] = useState(false);

  if (!run) return null;
  const { character } = run;
  const canRest = !character.relics.some(r => r.id === 'coffee_dripper' || r.id === 'fusion_hammer');
  const canSmith = !character.relics.some(r => r.id === 'fusion_hammer');
  const healAmount = Math.floor(character.maxHp * 0.3);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="bg-gray-800 border border-gray-600 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">🔥</div>
          <h1 className="text-2xl font-bold text-orange-300" style={{ fontFamily: 'Georgia, serif' }}>Rest Site</h1>
          <p className="text-gray-400 text-sm mt-1">A moment of respite before the climb continues...</p>
        </div>

        {/* HP display */}
        <div className="bg-gray-900 rounded-lg p-3 mb-6 text-center">
          <p className="text-gray-300 text-sm">
            HP: <span className="text-green-400 font-bold">{character.currentHp}</span> / {character.maxHp}
          </p>
        </div>

        {!smithing ? (
          <div className="space-y-3">
            {/* Rest */}
            <button
              onClick={restHeal}
              disabled={!canRest}
              className={`w-full py-3 px-4 rounded-xl border text-left transition-all
                ${canRest
                  ? 'bg-blue-900/50 hover:bg-blue-800/50 border-blue-600 text-blue-200'
                  : 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed'
                }`}
            >
              <div className="font-bold flex items-center gap-2">
                💤 Rest
                {!canRest && <span className="text-xs text-gray-500">(Blocked by relic)</span>}
              </div>
              <div className="text-sm opacity-75 mt-0.5">Heal {healAmount} HP ({Math.floor(30)}% of max)</div>
            </button>

            {/* Smith */}
            <button
              onClick={() => setSmithing(true)}
              disabled={!canSmith}
              className={`w-full py-3 px-4 rounded-xl border text-left transition-all
                ${canSmith
                  ? 'bg-yellow-900/50 hover:bg-yellow-800/50 border-yellow-600 text-yellow-200'
                  : 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed'
                }`}
            >
              <div className="font-bold flex items-center gap-2">
                🔨 Smith
                {!canSmith && <span className="text-xs text-gray-500">(Blocked by relic)</span>}
              </div>
              <div className="text-sm opacity-75 mt-0.5">Upgrade a card in your deck permanently</div>
            </button>

            {/* Leave */}
            <button
              onClick={leaveRest}
              className="w-full py-3 px-4 rounded-xl border border-gray-600 bg-gray-900/50 hover:bg-gray-800/50 text-gray-300 text-left transition-all"
            >
              <div className="font-bold">🚶 Leave</div>
              <div className="text-sm opacity-75 mt-0.5">Continue your journey</div>
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-yellow-300 font-bold mb-3">Choose a card to upgrade:</h2>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto mb-4">
              {character.deck.filter(c => !c.upgraded).map(card => {
                const upgraded = upgradeCard(card);
                return (
                  <button
                    key={card.id}
                    onClick={() => { smithCard(card.id); setSmithing(false); }}
                    className="bg-gray-700 hover:bg-yellow-900/50 text-left p-2 rounded-lg border border-gray-600 hover:border-yellow-600 transition-all"
                  >
                    <p className="text-white text-sm font-bold">{card.name}</p>
                    <p className="text-gray-400 text-xs">→</p>
                    <p className="text-yellow-300 text-sm font-bold">{upgraded.name}</p>
                    <p className="text-gray-400 text-xs">{upgraded.description}</p>
                  </button>
                );
              })}
              {character.deck.filter(c => !c.upgraded).length === 0 && (
                <p className="text-gray-500 text-sm col-span-2">All cards are already upgraded!</p>
              )}
            </div>
            <button onClick={() => setSmithing(false)} className="text-gray-400 hover:text-white text-sm">← Back</button>
          </div>
        )}
      </div>
    </div>
  );
}
