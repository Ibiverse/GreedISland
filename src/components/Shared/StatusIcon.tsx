import type { StatusEffect } from '../../types';

const STATUS_INFO: Record<string, { icon: string; color: string; label: string }> = {
  Weak:        { icon: '💧', color: 'bg-blue-800',   label: 'Weak' },
  Vulnerable:  { icon: '🩸', color: 'bg-orange-800', label: 'Vuln' },
  Poison:      { icon: '☠️', color: 'bg-green-900',  label: 'Poison' },
  Strength:    { icon: '💪', color: 'bg-red-900',    label: 'Str' },
  Dexterity:   { icon: '🌀', color: 'bg-teal-900',   label: 'Dex' },
  Ritual:      { icon: '🔥', color: 'bg-yellow-900', label: 'Ritual' },
  Burn:        { icon: '🔥', color: 'bg-orange-900', label: 'Burn' },
  Focus:       { icon: '🎯', color: 'bg-purple-900', label: 'Focus' },
};

interface StatusIconProps {
  effect: StatusEffect;
}

export default function StatusIcon({ effect }: StatusIconProps) {
  const info = STATUS_INFO[effect.type] ?? { icon: '?', color: 'bg-gray-800', label: effect.type };
  return (
    <div
      className={`${info.color} rounded px-1.5 py-0.5 flex flex-col items-center min-w-[32px] border border-gray-600`}
      title={`${info.label}: ${effect.value}`}
    >
      <span className="text-xs leading-none">{info.icon}</span>
      <span className="text-white text-xs font-bold leading-none">{effect.value}</span>
    </div>
  );
}
