import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { audio } from '../../systems/audio';
import type { NodeType } from '../../types';

const NODE_ICONS: Record<NodeType, string> = {
  combat:   '⚔️',
  elite:    '💀',
  boss:     '👑',
  shop:     '🛒',
  rest:     '🔥',
  event:    '❓',
  treasure: '💎',
};

const NODE_COLORS: Record<NodeType, string> = {
  combat:   '#e74c3c',
  elite:    '#8e44ad',
  boss:     '#f39c12',
  shop:     '#27ae60',
  rest:     '#2980b9',
  event:    '#7f8c8d',
  treasure: '#f1c40f',
};

const SVG_WIDTH = 400;
const SVG_HEIGHT = 820;
const PADDING = 20;

export default function MapScreen() {
  const { run, enterNode } = useGameStore();
  useEffect(() => { audio.playMusic('menu'); }, []);
  if (!run) return null;

  const { map, currentNodeId, gold, character } = run;

  // Scale node positions to SVG viewport
  const xs = map.map(n => n.x);
  const ys = map.map(n => n.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);

  function toSvgX(x: number) {
    return PADDING + ((x - minX) / (maxX - minX + 1)) * (SVG_WIDTH - PADDING * 2);
  }
  function toSvgY(y: number) {
    return PADDING + ((y - minY) / (maxY - minY + 1)) * (SVG_HEIGHT - PADDING * 2);
  }

  const nodeMap = new Map(map.map(n => [n.id, n]));

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/40 border-b border-gray-700 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400" style={{ fontFamily: 'Georgia, serif' }}>
            ☠ Greed Island
          </h1>
          <p className="text-gray-400 text-sm">Act {run.currentAct} — Floor {run.currentFloor}</p>
        </div>
        <div className="flex items-center gap-4">
          {character.relics.map(r => (
            <div key={r.id} title={r.description} className="bg-yellow-900 border border-yellow-600 rounded px-1.5 py-0.5 text-xs text-yellow-200 cursor-help">
              {r.name}
            </div>
          ))}
          <div className="flex items-center gap-2 bg-yellow-900/40 border border-yellow-600 rounded-lg px-3 py-1">
            <span className="text-yellow-400 text-lg">💰</span>
            <span className="text-yellow-300 font-bold text-lg">{gold}</span>
          </div>
          <div className="flex items-center gap-2 bg-red-900/40 border border-red-600 rounded-lg px-3 py-1">
            <span className="text-red-400">❤️</span>
            <span className="text-red-300 font-bold">{character.currentHp}/{character.maxHp}</span>
          </div>
        </div>
      </div>

      {/* Map + Deck panel */}
      <div className="flex flex-1 min-h-0 gap-4 p-4">
        {/* Map SVG */}
        <div className="flex-1 flex justify-center overflow-y-auto">
          <svg
            width={SVG_WIDTH}
            height={SVG_HEIGHT}
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="select-none"
          >
            {/* Connection lines */}
            {map.map(node =>
              node.connections.map(targetId => {
                const target = nodeMap.get(targetId);
                if (!target) return null;
                const nx = toSvgX(node.x), ny = toSvgY(node.y);
                const tx = toSvgX(target.x), ty = toSvgY(target.y);
                return (
                  <line
                    key={`${node.id}-${targetId}`}
                    x1={nx} y1={ny} x2={tx} y2={ty}
                    stroke={node.visited ? '#4a5568' : '#2d3748'}
                    strokeWidth="2"
                    strokeDasharray={node.visited ? 'none' : '4,4'}
                  />
                );
              })
            )}

            {/* Nodes */}
            {map.map(node => {
              const x = toSvgX(node.x);
              const y = toSvgY(node.y);
              const color = NODE_COLORS[node.type];
              const icon = NODE_ICONS[node.type];
              const isCurrentNode = node.id === currentNodeId;
              const isCurrent = isCurrentNode;

              return (
                <g
                  key={node.id}
                  transform={`translate(${x},${y})`}
                  onClick={() => node.available && !node.visited && enterNode(node.id)}
                  style={{ cursor: node.available && !node.visited ? 'pointer' : 'default' }}
                >
                  {/* Glow ring for available */}
                  {node.available && !node.visited && (
                    <circle r="18" fill="none" stroke="#f1c40f" strokeWidth="2" opacity="0.7">
                      <animate attributeName="r" values="16;20;16" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Current position indicator */}
                  {isCurrent && (
                    <circle r="20" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.5" />
                  )}
                  {/* Main circle */}
                  <circle
                    r="14"
                    fill={node.visited ? '#374151' : `${color}33`}
                    stroke={node.visited ? '#6b7280' : color}
                    strokeWidth={node.available ? 2.5 : 1.5}
                    opacity={node.visited ? 0.6 : 1}
                  />
                  {/* Icon */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="12"
                    style={{ userSelect: 'none', opacity: node.visited ? 0.4 : 1 }}
                  >
                    {icon}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right panel: deck viewer */}
        <div className="w-56 flex flex-col gap-3 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-3">
            <h3 className="text-white font-bold text-sm mb-2">Your Deck ({character.deck.length})</h3>
            <div className="flex flex-col gap-1 max-h-80 overflow-y-auto">
              {character.deck.map((card, i) => {
                const colors = { Attack: 'text-red-300', Skill: 'text-green-300', Power: 'text-purple-300', Curse: 'text-gray-400' };
                return (
                  <div key={`${card.id}_${i}`} className="text-xs flex justify-between items-center py-0.5">
                    <span className={colors[card.type]}>{card.name}{card.upgraded ? '+' : ''}</span>
                    <span className="text-gray-500">{card.cost === 'X' ? 'X' : card.cost}⚡</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-3">
            <h3 className="text-white font-bold text-sm mb-2">Legend</h3>
            {(Object.entries(NODE_ICONS) as [NodeType, string][]).map(([type, icon]) => (
              <div key={type} className="flex items-center gap-2 text-xs text-gray-300 mb-1">
                <span>{icon}</span>
                <span className="capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
