export default function DungeonBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Subtle darkening vignette so UI stays readable */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.3) 100%)',
        }}
      />
    </div>
  );
}
