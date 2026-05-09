import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { getCardRewards } from '../../data/cards';
import { getShopRelics } from '../../data/relics';
import { getShopPotions } from '../../data/potions';
import CardComponent from '../Combat/CardComponent';

export default function ShopScreen() {
  const { run, buyCard, buyRelic, buyPotion, removeCard, leaveShop } = useGameStore();
  const [removingCard, setRemovingCard] = useState(false);

  const shopCards = useMemo(() => {
    if (!run) return [];
    const cards = getCardRewards(run.character.id, 5);
    const prices = [75, 85, 95, 110, 125];
    return cards.map((c, i) => ({ ...c, price: prices[i] }));
  }, []);

  const shopRelics = useMemo(() => getShopRelics(2), []);
  const shopPotions = useMemo(() => getShopPotions(2), []);

  if (!run) return null;
  const { gold, character } = run;

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-3 bg-black/40 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-yellow-400" style={{ fontFamily: 'Georgia, serif' }}>🛒 Merchant</h1>
        <div className="flex items-center gap-4">
          <span className="text-yellow-300 font-bold text-lg">💰 {gold}</span>
          <button onClick={leaveShop} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg border border-gray-500">
            Leave
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Cards */}
        <section>
          <h2 className="text-yellow-200 font-bold text-lg mb-3">Cards for Sale</h2>
          <div className="flex gap-4 flex-wrap">
            {shopCards.map((card, i) => (
              <div key={card.id} className="flex flex-col items-center gap-1">
                <CardComponent
                  card={card}
                  index={i}
                  totalCards={1}
                  isPlayable={gold >= (card.price ?? 999)}
                  isSelected={false}
                  onClick={() => buyCard(card)}
                  compact
                />
                <button
                  onClick={() => buyCard(card)}
                  disabled={gold < (card.price ?? 999)}
                  className="bg-yellow-700 hover:bg-yellow-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-xs px-3 py-1 rounded border border-yellow-500 disabled:border-gray-600"
                >
                  💰 {card.price}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Relics */}
        <section>
          <h2 className="text-yellow-200 font-bold text-lg mb-3">Relics</h2>
          <div className="flex gap-4 flex-wrap">
            {shopRelics.map(relic => (
              <div key={relic.id} className="bg-gray-800 border border-yellow-700 rounded-xl p-3 w-48">
                <h3 className="text-yellow-300 font-bold text-sm">{relic.name}</h3>
                <p className="text-gray-300 text-xs mt-1 mb-2">{relic.description}</p>
                <button
                  onClick={() => buyRelic(relic)}
                  disabled={gold < (relic.price ?? 999)}
                  className="w-full bg-yellow-700 hover:bg-yellow-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-xs py-1 rounded border border-yellow-500 disabled:border-gray-600"
                >
                  💰 {relic.price}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Potions */}
        <section>
          <h2 className="text-yellow-200 font-bold text-lg mb-3">Potions</h2>
          <div className="flex gap-4 flex-wrap">
            {shopPotions.map(potion => (
              <div key={potion.id} className="bg-gray-800 border border-green-700 rounded-xl p-3 w-40">
                <h3 className="text-green-300 font-bold text-sm">🧪 {potion.name}</h3>
                <p className="text-gray-300 text-xs mt-1 mb-2">{potion.description}</p>
                <button
                  onClick={() => buyPotion(potion.id)}
                  disabled={gold < 50 || character.potions.length >= 3}
                  className="w-full bg-green-800 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-xs py-1 rounded border border-green-600 disabled:border-gray-600"
                >
                  💰 50
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Card Removal */}
        <section>
          <div className="flex items-center gap-4">
            <div className="bg-gray-800 border border-red-800 rounded-xl p-3">
              <h2 className="text-red-300 font-bold text-sm mb-1">🗑️ Card Removal Service</h2>
              <p className="text-gray-400 text-xs mb-2">Remove a card from your deck permanently. Cost: 100 💰</p>
              <button
                onClick={() => setRemovingCard(true)}
                disabled={gold < 100}
                className="bg-red-800 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-xs px-3 py-1 rounded border border-red-600 disabled:border-gray-600"
              >
                Choose Card to Remove
              </button>
            </div>
          </div>

          {removingCard && (
            <div className="mt-3">
              <p className="text-gray-300 text-sm mb-2">Select a card to remove:</p>
              <div className="flex flex-wrap gap-2">
                {character.deck.map(card => (
                  <button
                    key={card.id}
                    onClick={() => { removeCard(card.id); setRemovingCard(false); }}
                    className="bg-red-900 hover:bg-red-800 text-white text-xs px-2 py-1 rounded border border-red-700"
                  >
                    {card.name}{card.upgraded ? '+' : ''}
                  </button>
                ))}
                <button onClick={() => setRemovingCard(false)} className="text-gray-400 text-xs px-2 py-1">Cancel</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
