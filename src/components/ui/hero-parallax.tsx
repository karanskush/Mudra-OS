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
      className="min-h-screen max-h-[200vh] pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24 overflow-hidden antialiased relative flex flex-col justify-between dark:bg-[#000008]"
    >
      {/* Header - Outside of transformed motion div */}
      <div className="relative z-40 flex-shrink-0">
        <Header />
      </div>
      
      {/* Product cards with transforms */}
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className="relative z-5 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto w-full flex-grow flex flex-col justify-center py-8 lg:py-12"
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
      <div className="relative z-5 flex justify-center pb-8">
        <motion.div 
          className="w-1 h-8 bg-gradient-to-b from-slate-600 to-transparent dark:from-white/50 rounded-full"
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
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 lg:mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            The Ultimate <br /> 
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 dark:from-blue-400 dark:via-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
            Fintech Platform
            </span>
          </motion.h1>
          <motion.p 
            className="max-w-2xl text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-700 dark:text-white/80 leading-relaxed mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Build production-ready fintech applications with enterprise-grade security and compliance.
            From core ledger systems to payment orchestration.
            <br />
            Everything you need in one platform.
          </motion.p>
          
          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6 relative z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 rounded-xl text-sm sm:text-base lg:text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-2xl hover:shadow-blue-500/25 relative z-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartBuilding}
            >
              Start Building
            </motion.button>
            
            <motion.button 
              className="bg-slate-100/80 dark:bg-white/10 backdrop-blur-md hover:bg-slate-200/80 dark:hover:bg-white/20 text-slate-900 dark:text-white px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 rounded-xl text-sm sm:text-base lg:text-lg font-semibold transition-all duration-300 border border-slate-200/50 dark:border-white/20 hover:border-slate-300/50 dark:hover:border-white/30 cursor-pointer relative z-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewDocumentation}
            >
              View Documentation
            </motion.button>
          </motion.div>
        </div>
        
        <div className="lg:col-span-4 xl:col-span-5">
          {/* Animated hero image for larger screens */}
          <motion.div 
            className="hidden lg:flex items-center justify-center w-full h-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: [30, 0, 10, 0] }}
            transition={{ duration: 1.2, delay: 0.3, repeat: Infinity, repeatType: 'reverse', repeatDelay: 2 }}
            style={{ minHeight: '320px' }}
          >
            <motion.img
              src="/images/hero-images/hero back.png"
              alt="MudraCore OS Hero Background"
              className="w-[130%] h-auto max-w-none rounded-2xl shadow-xl lg:w-[130%] lg:h-auto lg:max-w-none"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.5 }}
            />
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
  const handleImageClick = () => {
    // Scroll to the Features section
    const featuresSection = document.querySelector('#features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
        <div
          onClick={handleImageClick}
          className="block group-hover/product:shadow-2xl cursor-pointer"
        >
          <img
            src={product.thumbnail}
            height="600"
            width="600"
            className="object-cover object-center absolute h-full w-full inset-0 rounded-lg sm:rounded-xl border border-slate-200/50 dark:border-white/10"
            alt={product.title}
          />
        </div>
      ) : (
        <div className="block">
          <img
            src={product.thumbnail}
            height="600"
            width="600"
            className="object-cover object-center absolute h-full w-full inset-0 rounded-lg sm:rounded-xl border border-slate-200/50 dark:border-white/10"
            alt={product.title}
          />
        </div>
      )}
      {/* Enhanced background overlay for text readability */}
      <div className="absolute inset-0 h-full w-full bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent dark:from-black/80 dark:via-black/30 pointer-events-none rounded-lg sm:rounded-xl"></div>
      {/* Permanently visible title with better positioning */}
      <h2 className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 lg:bottom-3 lg:left-3 text-white font-semibold text-[10px] sm:text-xs lg:text-sm xl:text-base drop-shadow-lg leading-tight">
        {product.title}
      </h2>
    </motion.div>
  );
};