import { useState, useEffect } from 'react';
import { audio } from '../../systems/audio';

export default function AudioSettingsButton() {
  const [open, setOpen] = useState(false);
  const [musicVol, setMusicVol] = useState(audio.getSettings().musicVol);
  const [sfxVol,   setSfxVol]   = useState(audio.getSettings().sfxVol);
  const [muted,    setMuted]    = useState(audio.getSettings().muted);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => { setOpen(o => !o); audio.sfx('button'); }}
        className="bg-gray-800/80 hover:bg-gray-700 text-white text-base rounded-full w-8 h-8 flex items-center justify-center border border-gray-600 transition-colors"
        title="Audio settings"
      >
        {muted ? '🔇' : '🔊'}
      </button>

      {open && (
        <div
          className="absolute right-2 top-12 bg-black/95 border border-yellow-700 rounded-lg p-4 z-50 shadow-2xl"
          style={{ minWidth: 220 }}
        >
          <h3 className="text-yellow-400 font-bold text-sm mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Audio Settings
          </h3>

          <label className="block mb-3">
            <div className="flex justify-between text-xs text-gray-300 mb-1">
              <span>Music</span><span>{Math.round(musicVol * 100)}%</span>
            </div>
            <input
              type="range" min={0} max={100} value={musicVol * 100}
              onChange={e => { const v = +e.target.value / 100; setMusicVol(v); audio.setMusicVolume(v); }}
              className="w-full accent-yellow-500"
            />
          </label>

          <label className="block mb-3">
            <div className="flex justify-between text-xs text-gray-300 mb-1">
              <span>SFX</span><span>{Math.round(sfxVol * 100)}%</span>
            </div>
            <input
              type="range" min={0} max={100} value={sfxVol * 100}
              onChange={e => { const v = +e.target.value / 100; setSfxVol(v); audio.setSfxVolume(v); }}
              onMouseUp={() => audio.sfx('button')}
              className="w-full accent-yellow-500"
            />
          </label>

          <button
            onClick={() => { const m = !muted; setMuted(m); audio.setMuted(m); }}
            className={`w-full text-sm py-1.5 rounded transition-colors ${
              muted ? 'bg-red-800 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
            } text-white border border-gray-600`}
          >
            {muted ? '🔇 Muted — click to unmute' : '🔊 Mute all'}
          </button>
        </div>
      )}
    </>
  );
}
