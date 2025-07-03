"use client";
import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import { Link } from "react-router-dom";

export const HeroParallax = ({
  products,
}: {
  products: {
    title: string;
    link: string;
    thumbnail: string;
  }[];
}) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = React.useRef(null);
  
  // Use more reasonable scroll tracking
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  // More responsive translate values that work better across screen sizes
  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 150]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -150]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.3], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.3], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.3], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.3], [-500, 50]),
    springConfig
  );
  
  // Track if user has scrolled past 40px
  const [tilesActive, setTilesActive] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 40) {
        setTilesActive(true);
      } else {
        setTilesActive(false);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ref}
      className="min-h-screen max-h-[200vh] pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24 overflow-hidden antialiased relative flex flex-col justify-between bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950"
    >
      <div className="relative z-50 flex-shrink-0">
        <Header />
      </div>
      
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto w-full flex-grow flex flex-col justify-center py-8 lg:py-12"
      >
        {/* First Row */}
        <motion.div 
          className="flex flex-row-reverse space-x-reverse justify-center mb-4 sm:mb-6 lg:mb-8"
          style={{ gap: 'clamp(1rem, 3vw, 4rem)' }}
        >
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
              tilesActive={tilesActive}
            />
          ))}
        </motion.div>
        
        {/* Second Row */}
        <motion.div 
          className="flex flex-row justify-center mb-4 sm:mb-6 lg:mb-8"
          style={{ gap: 'clamp(1rem, 3vw, 4rem)' }}
        >
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
              tilesActive={tilesActive}
            />
          ))}
        </motion.div>
        
        {/* Third Row */}
        <motion.div 
          className="flex flex-row-reverse space-x-reverse justify-center"
          style={{ gap: 'clamp(1rem, 3vw, 4rem)' }}
        >
          {thirdRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
              tilesActive={tilesActive}
            />
          ))}
        </motion.div>
      </motion.div>
      
      {/* Scroll indicator */}
      <div className="relative z-50 flex justify-center pb-8">
        <motion.div 
          className="w-1 h-8 bg-gradient-to-b from-white/50 to-transparent rounded-full"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </div>
  );
};

export const Header = () => {
  
  const handleStartBuilding = () => {
    console.log('Start Building button clicked!');
    // Scroll to the Features section
    const featuresSection = document.querySelector('#features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.log('Features section not found');
    }
  };

  const handleViewDocumentation = () => {
    console.log('View Documentation button clicked!');
    // Scroll to the Gallery section which shows the demos
    const gallerySection = document.querySelector('#gallery');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.log('Gallery section not found');
    }
  };
  
  return (
    <div className="max-w-screen-2xl relative mx-auto py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 w-full">
      <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 xl:gap-16 items-center">
        <div className="lg:col-span-8 xl:col-span-7">
          <motion.h1 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white mb-3 sm:mb-4 lg:mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            The Ultimate <br /> 
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Fintech Platform
            </span>
          </motion.h1>
          <motion.p 
            className="max-w-2xl text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/80 leading-relaxed mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Build production-ready fintech applications with enterprise-grade security and compliance.
            From core ledger systems to payment orchestration—everything you need in one platform.
          </motion.p>
          
          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative z-60 mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 rounded-xl text-sm sm:text-base lg:text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer pointer-events-auto shadow-2xl hover:shadow-blue-500/25"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartBuilding}
              style={{ position: 'relative', zIndex: 100 }}
            >
              Start Building
            </motion.button>
            
            <motion.button 
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 rounded-xl text-sm sm:text-base lg:text-lg font-semibold transition-all duration-300 border border-white/20 hover:border-white/30 cursor-pointer pointer-events-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewDocumentation}
              style={{ position: 'relative', zIndex: 100 }}
            >
              View Documentation
            </motion.button>
          </motion.div>
        </div>
        
        <div className="lg:col-span-4 xl:col-span-5">
          {/* Feature highlights for larger screens */}
          <motion.div 
            className="hidden lg:block space-y-2 xl:space-y-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {[
              { title: "Enterprise Security", desc: "SOC2 compliant with bank-grade encryption", icon: "🔐" },
              { title: "High Performance", desc: "Process 50K+ transactions per second", icon: "⚡" },
              { title: "Global Ready", desc: "Multi-currency support in 180+ countries", icon: "🌍" },
              { title: "Developer First", desc: "REST & GraphQL APIs with comprehensive SDKs", icon: "👨‍💻" }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="flex items-start gap-2 xl:gap-3 p-2.5 xl:p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <span className="text-lg xl:text-xl">{feature.icon}</span>
                <div>
                  <h3 className="text-white font-semibold text-xs lg:text-sm xl:text-base">{feature.title}</h3>
                  <p className="text-white/70 text-xs lg:text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Feature Highlights - Made more compact */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-6 sm:mt-8 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2.5 sm:p-3 text-left">
          <div className="text-blue-400 font-semibold text-xs sm:text-sm mb-1">14 Core Domains</div>
          <div className="text-white/80 text-xs sm:text-sm">Complete fintech infrastructure</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2.5 sm:p-3 text-left">
          <div className="text-purple-400 font-semibold text-xs sm:text-sm mb-1">99.99% Uptime</div>
          <div className="text-white/80 text-xs sm:text-sm">Enterprise-grade reliability</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2.5 sm:p-3 text-left">
          <div className="text-cyan-400 font-semibold text-xs sm:text-sm mb-1">1-Command Setup</div>
          <div className="text-white/80 text-xs sm:text-sm">Get started in seconds</div>
        </div>
      </motion.div>
    </div>
  );
};

export const ProductCard = ({
  product,
  translate,
  tilesActive,
}: {
  product: {
    title: string;
    link: string;
    thumbnail: string;
  };
  translate: MotionValue<number>;
  tilesActive: boolean;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
        width: 'clamp(120px, 16vw, 360px)',
        height: 'clamp(120px, 16vw, 360px)',
        aspectRatio: '1/1'
      }}
      whileHover={tilesActive ? { y: -10, scale: 1.05 } : {}}
      key={product.title}
      className={`group/product relative shrink-0 ${!tilesActive ? 'pointer-events-none opacity-40' : 'pointer-events-auto'}`}
    >
      {tilesActive ? (
        <Link
          to={product.link}
          className="block group-hover/product:shadow-2xl"
        >
          <img
            src={product.thumbnail}
            height="600"
            width="600"
            className="object-cover object-center absolute h-full w-full inset-0 rounded-lg sm:rounded-xl border border-white/10"
            alt={product.title}
          />
        </Link>
      ) : (
        <div className="block">
          <img
            src={product.thumbnail}
            height="600"
            width="600"
            className="object-cover object-center absolute h-full w-full inset-0 rounded-lg sm:rounded-xl border border-white/10"
            alt={product.title}
          />
        </div>
      )}
      {/* Enhanced background overlay for text readability */}
      <div className="absolute inset-0 h-full w-full bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none rounded-lg sm:rounded-xl"></div>
      {/* Permanently visible title with better positioning */}
      <h2 className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 lg:bottom-3 lg:left-3 text-white font-semibold text-[10px] sm:text-xs lg:text-sm xl:text-base drop-shadow-lg leading-tight">
        {product.title}
      </h2>
    </motion.div>
  );
};