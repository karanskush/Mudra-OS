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
import { useTheme } from "../../contexts/ThemeContext";

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
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 200]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -200]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-800, 50]),
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
      className="h-[250vh] py-40 overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d] bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950"
    >
      <div className="relative z-50">
        <Header />
      </div>
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className="relative z-10"
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-8 mb-20">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
              tilesActive={tilesActive}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row mb-20 space-x-8">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
              tilesActive={tilesActive}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-8">
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
    </div>
  );
};

export const Header = () => {
  const { isDark } = useTheme();
  
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
    <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0 z-50">
      <motion.h1 
        className="text-2xl md:text-7xl font-bold text-white mb-8"
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
        className="max-w-2xl text-base md:text-xl mt-8 text-white/80 leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Build production-ready fintech applications with enterprise-grade security and compliance.
        From core ledger systems to payment orchestration—everything you need in one platform.
      </motion.p>
      
      {/* Action Buttons */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 mt-8 relative z-60"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <motion.button 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer pointer-events-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartBuilding}
          style={{ position: 'relative', zIndex: 100 }}
        >
          Start Building
        </motion.button>
        
        <motion.button 
          className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 border border-white/20 hover:border-white/30 cursor-pointer pointer-events-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleViewDocumentation}
          style={{ position: 'relative', zIndex: 100 }}
        >
          View Documentation
        </motion.button>
      </motion.div>

      {/* Feature Highlights */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-left">
          <div className="text-blue-400 font-semibold text-sm mb-1">14 Core Domains</div>
          <div className="text-white/80 text-sm">Complete fintech infrastructure</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-left">
          <div className="text-purple-400 font-semibold text-sm mb-1">99.99% Uptime</div>
          <div className="text-white/80 text-sm">Enterprise-grade reliability</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-left">
          <div className="text-cyan-400 font-semibold text-sm mb-1">1-Command Setup</div>
          <div className="text-white/80 text-sm">Get started in seconds</div>
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
      }}
      whileHover={tilesActive ? { y: -20 } : {}}
      key={product.title}
      className={`group/product h-72 w-72 relative shrink-0 ${!tilesActive ? 'pointer-events-none opacity-40' : 'pointer-events-auto'}`}
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
            className="object-cover object-left-top absolute h-full w-full inset-0 rounded-xl"
            alt={product.title}
          />
        </Link>
      ) : (
        <div className="block">
          <img
            src={product.thumbnail}
            height="600"
            width="600"
            className="object-cover object-left-top absolute h-full w-full inset-0 rounded-xl"
            alt={product.title}
          />
        </div>
      )}
      {/* Permanent background overlay for text readability */}
      <div className="absolute inset-0 h-full w-full bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none rounded-xl"></div>
      {/* Permanently visible title */}
      <h2 className="absolute bottom-4 left-4 text-white font-semibold text-lg drop-shadow-lg">
        {product.title}
      </h2>
    </motion.div>
  );
};