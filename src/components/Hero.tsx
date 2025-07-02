import React from 'react';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import BlurText from './ui/blur-text';
import { FlipWords } from './ui/flip-words';

const Hero: React.FC = () => {
  const flipWords = ["developers", "enterprises", "innovators", "builders"];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
        
        {/* Floating Elements with Motion */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        
        {/* Rotating Gradient */}
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-blue-500/5 via-purple-500/5 to-blue-500/5 rounded-full blur-3xl"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        {/* Floating Code Snippets with Motion */}
        <motion.div 
          className="absolute top-20 left-10 opacity-20"
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 text-xs text-white font-mono">
            POST /payments
          </div>
        </motion.div>
        <motion.div 
          className="absolute top-40 right-20 opacity-20"
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 text-xs text-white font-mono">
            gRPC streaming
          </div>
        </motion.div>
        <motion.div 
          className="absolute bottom-40 left-20 opacity-20"
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 text-xs text-white font-mono">
            KYC automation
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div 
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-8 text-white/90 text-sm font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="h-4 w-4 text-blue-400" />
            Ultra-Lean Fintech OS Demo
          </motion.div>

          {/* Main Heading with Blur Text Animation */}
          <div className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            <BlurText
              text="The fintech platform"
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-4"
              delay={100}
              animateBy="words"
            />
            <div className="flex flex-wrap justify-center items-center gap-4">
              <span className="text-white">loved by</span>
              <FlipWords 
                words={flipWords} 
                duration={2000}
                className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent"
              />
            </div>
          </div>
          
          <motion.p 
            className="text-lg sm:text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Build production-ready fintech applications with our comprehensive platform. 
            From core ledger to payment orchestration, KYC automation to compliance reporting—everything you need in one place.
          </motion.p>

          {/* Feature Highlights */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-left"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-blue-400 font-semibold text-sm mb-1">Core Ledger</div>
              <div className="text-white/80 text-sm">Double-entry, multi-currency with atomic transactions</div>
            </motion.div>
            <motion.div 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-left"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-purple-400 font-semibold text-sm mb-1">Smart Routing</div>
              <div className="text-white/80 text-sm">Optimized payment rails with cost analysis</div>
            </motion.div>
            <motion.div 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-left"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-cyan-400 font-semibold text-sm mb-1">Compliance Ready</div>
              <div className="text-white/80 text-sm">Automated reconciliation and reporting</div>
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.button 
              className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 flex items-center gap-2 min-w-[200px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Demo
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
            
            <motion.button 
              className="group bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 border border-white/20 hover:border-white/30 min-w-[200px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Documentation
            </motion.button>
          </motion.div>

          {/* Secondary Action */}
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <motion.button 
              className="group flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <Play className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm font-medium underline underline-offset-4 decoration-white/30 group-hover:decoration-white transition-colors duration-300">
                Watch 3-minute demo
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-1 h-8 bg-gradient-to-b from-white/50 to-transparent rounded-full" />
      </motion.div>
    </section>
  );
};

export default Hero;