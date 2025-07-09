import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, ExternalLink, Code, Database, Shield, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const demoScreenshots = [
  {
    id: 5,
    title: 'gRPC Live Streaming',
    category: 'Developer Tools',
    image: '/images/hero-features/Live Streaming.png',
    description: 'Live view to monitor the transactions in real-time',
    icon: Code,
    link: '/grpc-demo',
  },{
    id: 6,
    title: 'KYC Supporting over 220+ Countries',
    category: 'Developer Tools',
    image: '/images/hero-features/StartKYC.png',
    description: 'Enable KYC for your customers from over 220+ countries',
    features: ['Auto-Generated SDKs', 'Webhook Management', 'API Documentation'],
    icon: Code,
    link: '/kyc',
  },{
    id: 1,
    title: 'Payment Orchestration Dashboard',
    category: 'Core Platform',
    image: '/images/hero-features/payment_rails.png',
    description: 'Real-time payment processing with multi-rail routing and cost optimization',
    features: ['UPI, SEPA, Crypto Rails', 'Smart Cost Routing', 'Real-time Status Updates'],
    icon: TrendingUp,
    link: '/payment-rails',
  },{
    id: 2,
    title: 'Core Ledger System',
    category: 'Foundation',
    image: '/images/hero-features/ledger.png',
    description: 'Double-entry bookkeeping with multi-currency support and atomic transactions',
    features: ['Double-Entry Ledger', 'Multi-Currency Support', 'Point-in-Time Queries'],
    icon: Database,
    link: '/ledger',
  },{
    id: 3,
    title: 'KYC & Compliance Dashboard',
    category: 'Regulatory',
    image: '/images/hero-features/KYC Dashboard.png',
    description: 'Automated KYC processing with configurable risk rules and compliance reporting',
    features: ['Automated KYC', 'Risk Scoring', 'Compliance Reports'],
    icon: Shield,
    link: '/kyc/dashboard',
  },{
    id: 4,
    title: 'Developer Console',
    category: 'Developer Tools',
    image: '/images/hero-features/API Doc.png',
    description: 'Comprehensive API documentation with SDK generation and webhook management',
    features: ['Auto-Generated SDKs', 'Webhook Management', 'API Documentation'],
    icon: Code,
    link: '/developers/api-explorer',
  },
];

const Gallery: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % demoScreenshots.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % demoScreenshots.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + demoScreenshots.length) % demoScreenshots.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const currentDemo = demoScreenshots[currentIndex];

  return (
    <section id="gallery" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 rounded-full px-4 py-2 mb-6 text-sm font-medium">
            <Eye className="h-4 w-4" />
            Live Demo Screenshots
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            See the platform in action
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive MudraCore platform through interactive demos. 
            From payment processing to compliance automation—see how it all works together.
          </p>
        </motion.div>

        <div className="relative max-w-6xl mx-auto">
          {/* Main Demo Display */}
          <motion.div 
            className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-200"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative group"
              >
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                  <img
                    src={currentDemo.image}
                    alt={currentDemo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Demo Info Overlay */}
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 p-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <div className="absolute left-0 right-0 bottom-0 w-full bg-black/40 backdrop-blur-md px-8 py-3 rounded-b-3xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
                          <currentDemo.icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="px-3 py-1 bg-blue-600/80 backdrop-blur-md rounded-full text-sm font-medium">
                          {currentDemo.category}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2 text-white drop-shadow-lg">{currentDemo.title}</h3>
                      <p className="text-white/90 mb-4 max-w-2xl drop-shadow">{currentDemo.description}</p>
                      {/* Feature Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(currentDemo.features || []).map((feature, idx) => (
                          <motion.span 
                            key={idx} 
                            className="px-3 py-1 bg-black/60 backdrop-blur text-white rounded-full text-sm"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.4 + idx * 0.1 }}
                          >
                            {feature}
                          </motion.span>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <motion.button 
                          className="flex items-center gap-2 bg-white/20 backdrop-blur-md hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye className="h-4 w-4" />
                          Live Demo
                        </motion.button>
                        {/* Try Now button: replace motion.button with <a> */}
                        <a
                          href={currentDemo.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Try Now
                        </a>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <motion.button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 backdrop-blur-md"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </motion.button>
            
            <motion.button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 backdrop-blur-md"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </motion.button>
          </motion.div>

          {/* Demo Navigation */}
          <motion.div 
            className="flex justify-center mt-8 gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {demoScreenshots.map((demo, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <demo.icon className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:block">{demo.title}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Progress Indicator */}
          <div className="flex justify-center mt-6 gap-2">
            {demoScreenshots.map((_, index) => (
              <motion.div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-blue-600 w-8' 
                    : 'bg-gray-300 w-3'
                }`}
                initial={{ width: index === currentIndex ? 32 : 12 }}
                animate={{ width: index === currentIndex ? 32 : 12 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {[
            { value: "14", label: "Core Domains", color: "blue" },
            { value: "80%", label: "Test Coverage", color: "purple" },
            { value: "3", label: "Payment Rails", color: "green" },
            { value: "1-CMD", label: "Setup Time", color: "orange" },
          ].map((stat, index) => (
            <motion.div 
              key={index}
              className="text-center p-6 bg-black/40 backdrop-blur-md rounded-xl border border-gray-200 shadow-sm"
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-3xl font-bold text-white drop-shadow-lg mb-2">{stat.value}</div>
              <div className="text-gray-200 text-sm drop-shadow">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Gallery;