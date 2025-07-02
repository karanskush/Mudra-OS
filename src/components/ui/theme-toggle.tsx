import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative w-12 h-6 rounded-full p-1 transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-r from-slate-700 to-slate-600 shadow-inner' 
          : 'bg-gradient-to-r from-blue-200 to-cyan-200 shadow-inner'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
          isDark 
            ? 'bg-gradient-to-r from-slate-300 to-white shadow-lg' 
            : 'bg-gradient-to-r from-yellow-300 to-orange-300 shadow-lg'
        }`}
        animate={{
          x: isDark ? 20 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        {isDark ? (
          <Moon className="w-2.5 h-2.5 text-slate-600" />
        ) : (
          <Sun className="w-2.5 h-2.5 text-orange-600" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;