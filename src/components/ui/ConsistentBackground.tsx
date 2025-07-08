import React from 'react';
import { motion } from 'framer-motion';

interface ConsistentBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const ConsistentBackground: React.FC<ConsistentBackgroundProps> = ({
  children,
  className = ""
}) => {
  return (
    <div className={`min-h-screen relative overflow-hidden ${className}`}>
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950" />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1], 
          rotate: [0, 180, 360],
          x: [0, 20, 0],
          y: [0, -20, 0]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: 'linear' 
        }}
      />
      
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2], 
          rotate: [360, 180, 0],
          x: [0, -30, 0],
          y: [0, 30, 0]
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity, 
          ease: 'linear' 
        }}
      />
      
      <motion.div
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-2xl"
        animate={{ 
          scale: [1, 1.1, 1],
          x: [-20, 20, -20],
          y: [-10, 10, -10]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: 'easeInOut',
          delay: 2
        }}
      />

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-30 dark:opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}; 