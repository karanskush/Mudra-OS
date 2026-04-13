import React from 'react';

interface ConsistentBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const ConsistentBackground: React.FC<ConsistentBackgroundProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`min-h-screen relative overflow-hidden ${className}`}
      style={{ backgroundColor: '#0B0C0E' }}
    >
      {/* Single focused spotlight — forest green, top-center only */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 40% at 50% -2%, rgba(46,111,64,0.28) 0%, rgba(46,111,64,0.06) 50%, transparent 70%)',
        }}
      />

      {/* Very subtle right-side warmth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 35% 25% at 100% 60%, rgba(104,186,127,0.05) 0%, transparent 65%)',
        }}
      />

      {/* Micro dot grid — barely perceptible texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage:
            'radial-gradient(ellipse 85% 45% at 50% 0%, black 20%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 85% 45% at 50% 0%, black 20%, transparent 100%)',
        }}
      />

      {/* 1px top edge line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, transparent 0%, rgba(104,186,127,0.25) 40%, rgba(207,255,220,0.35) 50%, rgba(104,186,127,0.25) 60%, transparent 100%)',
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
};
