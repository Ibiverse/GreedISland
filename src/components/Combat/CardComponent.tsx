import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Card } from '../../types';

interface CardProps {
  card: Card;
  index: number;
  totalCards: number;
  isPlayable: boolean;
  isSelected: boolean;
  onClick: () => void;
  compact?: boolean;
}

const TYPE_COLORS = {
  Attack: { border: 'border-red-600', header: 'from-red-900 to-red-700', badge: 'bg-red-700' },
  Skill:  { border: 'border-green-600', header: 'from-green-900 to-green-700', badge: 'bg-green-700' },
  Power:  { border: 'border-purple-600', header: 'from-purple-900 to-purple-700', badge: 'bg-purple-700' },
  Curse:  { border: 'border-gray-500', header: 'from-gray-800 to-gray-600', badge: 'bg-gray-600' },
};

function CardArt({ card }: { card: Card }) {
  const [errored, setErrored] = useState(false);
  // Strip the "+" off upgraded card baseIds so upgraded cards reuse the same art
  const baseId = card.baseId;
  const fallbackEmoji = card.type === 'Attack' ? '⚔️' : card.type === 'Skill' ? '🛡️' : '✨';

  return (
    <div className="bg-gray-800 mx-1 h-24 rounded flex items-center justify-center my-1 overflow-hidden relative">
      {!errored ? (
        <img
          src={`/cards/${baseId}.png`}
          alt={card.name}
          className="max-w-full max-h-full object-contain"
          style={{ imageRendering: 'pixelated' }}
          onError={() => setErrored(true)}
          draggable={false}
        />
      ) : (
        <span className="text-2xl">{fallbackEmoji}</span>
      )}
    </div>
  );
}

export default function CardComponent({ card, index, totalCards, isPlayable, isSelected, onClick, compact }: CardProps) {
  const [hovered, setHovered] = useState(false);
  const colors = TYPE_COLORS[card.type] ?? TYPE_COLORS.Curse;

  const fanAngle = totalCards > 1 ? ((index - (totalCards - 1) / 2) * 4) : 0;
  const fanY = totalCards > 1 ? Math.abs(index - (totalCards - 1) / 2) * 6 : 0;

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`border-2 ${colors.border} rounded-lg bg-gray-900 cursor-pointer hover:scale-105 transition-transform w-28 flex-shrink-0`}
      >
        <div className={`bg-gradient-to-b ${colors.header} p-1 rounded-t-lg`}>
          <div className="flex justify-between items-center">
            <span className="text-white text-xs font-bold truncate">{card.name}</span>
            <span className={`${colors.badge} text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold`}>
              {card.cost === 'X' ? 'X' : card.cost}
            </span>
          </div>
        </div>
        <div className="p-1">
          <p className="text-gray-300 text-xs leading-tight">{card.description}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="relative cursor-pointer flex-shrink-0"
      style={{ originY: 1 }}
      initial={{ rotate: fanAngle, y: fanY }}
      animate={{
        rotate: hovered ? 0 : fanAngle,
        y: hovered ? -60 : isSelected ? -40 : fanY,
        scale: hovered ? 1.15 : 1,
        zIndex: hovered ? 50 : index,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
    >
      <div className={`
        w-28 border-2 rounded-lg select-none
        ${colors.border}
        ${isPlayable ? 'bg-gray-900 shadow-lg' : 'bg-gray-950 opacity-60'}
        ${isSelected ? 'ring-2 ring-yellow-400' : ''}
      `}>
        {/* Cost orb */}
        <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-blue-600 border-2 border-blue-300 flex items-center justify-center text-white font-bold text-sm z-10">
          {card.cost === 'X' ? 'X' : card.cost}
        </div>

        {/* Header */}
        <div className={`bg-gradient-to-b ${colors.header} px-2 pt-3 pb-1 rounded-t-lg`}>
          <p className="text-white text-xs font-bold text-center leading-tight truncate">{card.name}</p>
        </div>

        {/* Art area */}
        <CardArt card={card} />

        {/* Type badge */}
        <div className={`${colors.badge} text-white text-xs text-center py-0.5 mx-1 rounded`}>
          {card.type}{card.upgraded ? '+' : ''}
        </div>

        {/* Description */}
        <div className="px-1.5 py-1 bg-gray-900 rounded-b-lg min-h-[50px]">
          <p className="text-gray-200 text-xs leading-tight text-center">{card.description}</p>
          {card.exhausts && <p className="text-yellow-400 text-xs text-center mt-0.5">Exhaust</p>}
        </div>
      </div>
    </motion.div>
  );
}
