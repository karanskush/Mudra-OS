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
    <div className={`min-h-screen relative bg-surface ${className}`}>
      {/* Subtle top-center accent glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 30% at 50% 0%, rgba(0,255,148,0.06) 0%, transparent 70%)',
        }}
      />
      {/* Very faint dot grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(10,17,40,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 85% 40% at 50% 0%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 40% at 50% 0%, black 20%, transparent 100%)',
        }}
      />
      {/* 1px top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, transparent 0%, rgba(0,255,148,0.3) 40%, rgba(0,255,148,0.5) 50%, rgba(0,255,148,0.3) 60%, transparent 100%)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
