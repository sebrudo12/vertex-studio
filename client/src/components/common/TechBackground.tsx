import React from 'react';

export const TechBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep dark base */}
      <div className="absolute inset-0 bg-[#080808]" />

      {/* Futuristic Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Radial Glow Orb 1 - Top Center / Left */}
      <div
        className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[140px] opacity-20"
        style={{ background: 'var(--brand-primary, #00E5FF)' }}
      />

      {/* Radial Glow Orb 2 - Middle Right Accent */}
      <div
        className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] rounded-full blur-[160px] opacity-10"
        style={{ background: 'var(--brand-primary, #00E5FF)' }}
      />

      {/* Radial Glow Orb 3 - Bottom Left Accent */}
      <div
        className="absolute bottom-[5%] -left-[10%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-10"
        style={{ background: 'var(--brand-hover, #00B4D8)' }}
      />

      {/* Subtle vignette border */}
      <div className="absolute inset-0 bg-radial-vignette opacity-80" />
    </div>
  );
};
