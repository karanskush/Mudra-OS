import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, Play, Shield, Zap, Code, Database, CheckCircle, Star, TrendingUp } from 'lucide-react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// --- Modular Feature Pill ---
const FeaturePill = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <div
    className="flex items-center gap-2 bg-white/70 dark:bg-white/10 backdrop-blur-sm border border-gray-200/50 dark:border-white/20 rounded-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow hover:shadow-md transition-all duration-200 hover:scale-105"
  >
    <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
    {text}
  </div>
);

// --- Modular Metric Card ---
const MetricCard = ({ value, label, trend }: { value: string; label: string; trend: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, ease: 'easeOut' }}
    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30 shadow-md hover:shadow-lg transition"
  >
    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{label}</div>
    <div className="flex items-center gap-1 text-xs">
      <TrendingUp className="h-3 w-3 text-brand-400" />
      <span className="text-brand-400 dark:text-brand-300 font-medium">{trend}</span>
    </div>
  </motion.div>
);

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start('visible');
  }, [isInView, controls]);

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  const handleStartDemo = () => navigate('/ledger');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  };
  const floatingCardVariants = {
    hidden: { y: 100, opacity: 0, scale: 0.8 },
    visible: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  // Data
  const logoMarqueeData = [
    'Stripe', 'PayPal', 'Square', 'Coinbase', 'Robinhood', 'Wise', 'Plaid', 'Adyen',
  ];
  const financialMetrics = [
    { label: 'Transactions/sec', value: '50K+', trend: '+12%' },
    { label: 'Uptime', value: '99.99%', trend: '+0.1%' },
    { label: 'Countries', value: '180+', trend: '+5' },
    { label: 'API Calls/day', value: '2.4B', trend: '+23%' },
  ];

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen overflow-hidden"
    >
      {/* --- Animated SVG Background Shapes --- */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" width="100%" height="100%" fill="none">
        <circle cx="20%" cy="30%" r="180" fill="url(#grad1)" opacity="0.12" />
        <circle cx="80%" cy="70%" r="220" fill="url(#grad2)" opacity="0.10" />
        <defs>
          <radialGradient id="grad1" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a5b4fc" />
          </radialGradient>
          <radialGradient id="grad2" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#a21caf" />
            <stop offset="100%" stopColor="#f472b6" />
          </radialGradient>
        </defs>
      </svg>
      {/* --- Animated Gradient Orbs & Mouse Follower --- */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl z-0"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl z-0"
        animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-gradient-radial from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-2xl pointer-events-none z-0"
        animate={{ x: mousePosition.x - 192, y: mousePosition.y - 192 }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
      />
      {/* --- Grid Pattern Overlay --- */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] z-0" />

      {/* --- Main Content --- */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="pt-20 pb-16"
        >
          {/* --- Header Badge --- */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-white/10 backdrop-blur-md border border-blue-200/50 dark:border-white/20 rounded-full px-6 py-3 text-sm font-medium text-gray-700 dark:text-white/90 shadow-lg">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
                <span className="text-brand-400 dark:text-brand-300 font-semibold">Live</span>
              </div>
              <span className="text-gray-400">•</span>
              <span>Ultra-Lean MudraCore OS</span>
              <span className="text-gray-400">•</span>
              <span className="text-blue-600 dark:text-blue-400">Production Ready</span>
            </div>
          </motion.div>

          {/* --- Hero Headline & Subheadline --- */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* --- Left: Text --- */}
            <div className="text-center lg:text-left">
              <motion.h1
                variants={itemVariants}
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight"
              >
                <span className="block text-gray-900 dark:text-white">The Ultimate</span>
                <span className="block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">MudraCore Platform</span>
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                Build production-ready fintech applications with enterprise-grade security and compliance. From core ledger systems to payment orchestration.
                Everything you need in one platform.
              </motion.p>
              {/* --- Feature Pills --- */}
              <motion.div variants={itemVariants} className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start">
                {[
                  { icon: Shield, text: 'SOC2 Compliant' },
                  { icon: Zap, text: '50K+ TPS' },
                  { icon: Code, text: 'REST & GraphQL' },
                  { icon: Database, text: 'Multi-currency' },
                ].map((item, idx) => (
                  <FeaturePill key={idx} icon={item.icon} text={item.text} />
                ))}
              </motion.div>
              {/* --- Action Buttons --- */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <motion.button
                  onClick={handleStartDemo}
                  className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-pink-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Start Building</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </motion.button>
                <motion.button
                  className="group bg-white/80 dark:bg-white/10 backdrop-blur-md hover:bg-white dark:hover:bg-white/20 text-gray-900 dark:text-white px-8 py-4 rounded-xl text-lg font-semibold border border-gray-200/50 dark:border-white/20 hover:border-gray-300 dark:hover:border-white/30 flex items-center justify-center gap-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Play className="h-5 w-5" />
                  <span>View Demo</span>
                </motion.button>
              </motion.div>
              {/* --- Social Proof --- */}
              <motion.div variants={itemVariants} className="flex items-center gap-4 justify-center lg:justify-start text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="font-medium">4.9/5</span>
                </div>
                <span>•</span>
                <span>Trusted by 500+ fintech teams</span>
              </motion.div>
            </div>
            {/* --- Right: Dashboard Card --- */}
            <motion.div variants={floatingCardVariants} className="relative">
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">MudraCore OS Dashboard</h3>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-brand-300 rounded-full"></div>
                  </div>
                </div>
                {/* --- Metrics Grid --- */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {financialMetrics.map((metric, idx) => (
                    <MetricCard key={metric.label} {...metric} />
                  ))}
                </div>
                {/* --- Transaction Flow --- */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Recent Transactions</span>
                    <span className="text-brand-400 dark:text-brand-300">Live</span>
                  </div>
                  {[
                    { type: 'Payment', amount: '$2,450.00', status: 'Completed' },
                    { type: 'Transfer', amount: '$890.50', status: 'Processing' },
                    { type: 'Payout', amount: '$5,230.00', status: 'Completed' },
                  ].map((transaction, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 1.5 + idx * 0.2 }}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{transaction.type}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{transaction.amount}</div>
                        <div className={`text-xs ${transaction.status === 'Completed' ? 'text-brand-400 dark:text-brand-300' : 'text-yellow-600 dark:text-yellow-400'}`}>{transaction.status}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              {/* --- Floating API Card --- */}
              <motion.div
                initial={{ opacity: 0, x: 50, y: 50 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 2, duration: 0.8 }}
                className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-xl"
              >
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">API Response</div>
                <div className="font-mono text-xs text-brand-400 dark:text-brand-300">
                  <div>POST /v1/payments</div>
                  <div className="text-gray-600 dark:text-gray-300">201 Created</div>
                  <div className="text-gray-400 dark:text-gray-500">~45ms</div>
                </div>
              </motion.div>
              {/* --- Floating Success Badge --- */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.5, duration: 0.5 }}
                className="absolute -top-4 -left-4 bg-brand-500 text-white rounded-full p-3 shadow-lg"
              >
                <CheckCircle className="h-6 w-6" />
              </motion.div>
            </motion.div>
          </div>
          {/* --- Logo Marquee --- */}
          <motion.div variants={itemVariants} className="mt-20">
            <div className="text-center mb-8">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Trusted by leading fintech companies worldwide</p>
            </div>
            <div className="relative overflow-hidden">
              <motion.div
                animate={{ x: [-1200, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="flex gap-12 items-center whitespace-nowrap"
              >
                {[...logoMarqueeData, ...logoMarqueeData].map((logo, idx) => (
                  <div
                    key={idx}
                    className="text-2xl font-bold text-gray-400 dark:text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 grayscale hover:grayscale-0"
                  >
                    {logo}
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      {/* --- Scroll Indicator --- */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-1 h-12 bg-gradient-to-b from-blue-500/70 to-transparent rounded-full shadow-lg animate-pulse" />
      </motion.div>
    </section>
  );
};

export default Hero;