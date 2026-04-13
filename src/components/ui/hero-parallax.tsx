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
import { ArrowRight, Shield, Zap, Globe, Code, Layers } from "lucide-react";

/* ─── HeroParallax ────────────────────────────────────────────────────────── */

export const HeroParallax = ({
  products,
}: {
  products: { title: string; link: string; thumbnail: string }[];
}) => {
  const firstRow  = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow  = products.slice(10, 15);
  const ref = React.useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX        = useSpring(useTransform(scrollYProgress, [0, 1], [0, 150]),  springConfig);
  const translateXReverse = useSpring(useTransform(scrollYProgress, [0, 1], [0, -150]), springConfig);
  const rotateX   = useSpring(useTransform(scrollYProgress, [0, 0.25], [15, 0]),        springConfig);
  const rotateZ   = useSpring(useTransform(scrollYProgress, [0, 0.25], [20, 0]),        springConfig);
  const opacity   = useSpring(useTransform(scrollYProgress, [0, 0.25], [0.2, 1]),       springConfig);
  const translateY = useSpring(useTransform(scrollYProgress, [0, 0.25], [-500, 0]),     springConfig);

  return (
    <div ref={ref} className="relative overflow-hidden antialiased" style={{ minHeight: "220vh" }}>
      <div className="relative z-50"><Header /></div>

      {/* Sticky "Complete Platform" heading */}
      <div
        id="platform"
        className="sticky top-24 z-30 text-center px-4 py-10 pointer-events-none"
      >
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-[11px] font-semibold tracking-widest uppercase pointer-events-auto"
          style={{
            background: 'rgba(59,110,255,0.10)',
            border: '1px solid rgba(59,110,255,0.28)',
            color: '#7EB8FF',
          }}
        >
          <Layers className="h-3 w-3" />
          14 Production Modules
        </div>

        <h2
          className="font-extrabold leading-tight tracking-tight mb-3 text-white"
          style={{ fontSize: 'clamp(2rem,5vw,3.25rem)', letterSpacing: '-0.02em' }}
        >
          The Complete Platform,
          <span
            className="block"
            style={{
              background: 'linear-gradient(90deg, #7EB8FF 0%, #C7DEFF 55%, #7EB8FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Shipped as One
          </span>
        </h2>

        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Scroll to explore — click any tile to try it live.
        </p>
      </div>

      {/* Moving tiles */}
      <motion.div style={{ rotateX, rotateZ, translateY, opacity }} className="relative z-10">
        <div className="px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto pb-40">
          <motion.div className="flex flex-row-reverse space-x-reverse justify-center mb-5" style={{ gap: "clamp(0.6rem,1.8vw,2rem)" }}>
            {firstRow.map(p => <ProductCard key={p.title} product={p} translate={translateX} />)}
          </motion.div>
          <motion.div className="flex flex-row justify-center mb-5" style={{ gap: "clamp(0.6rem,1.8vw,2rem)" }}>
            {secondRow.map(p => <ProductCard key={p.title} product={p} translate={translateXReverse} />)}
          </motion.div>
          <motion.div className="flex flex-row-reverse space-x-reverse justify-center" style={{ gap: "clamp(0.6rem,1.8vw,2rem)" }}>
            {thirdRow.map(p => <ProductCard key={p.title} product={p} translate={translateX} />)}
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-52 pointer-events-none z-20"
        style={{ background: 'linear-gradient(to top, #04060F, transparent)' }}
      />
    </div>
  );
};

/* ─── Header ──────────────────────────────────────────────────────────────── */

const STATS = [
  { value: "50K+",   label: "Transactions / sec" },
  { value: "99.99%", label: "Uptime SLA"          },
  { value: "180+",   label: "Countries"           },
  { value: "2.4B",   label: "API calls / day"     },
];

const PILLS = [
  { icon: Shield, text: "SOC 2 Type II"  },
  { icon: Zap,    text: "50K+ TPS"       },
  { icon: Globe,  text: "Multi-currency" },
  { icon: Code,   text: "gRPC + REST"    },
];

const MARQUEE = ["Stripe","PayPal","Square","Coinbase","Robinhood","Wise","Plaid","Adyen","Brex","Mercury"];

export const Header = () => {
  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="relative max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16 text-center">

      {/* Atmospheric glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '720px', height: '420px',
          background: 'radial-gradient(ellipse at 50% 40%, rgba(59,110,255,0.16) 0%, transparent 68%)',
          filter: 'blur(12px)',
        }}
      />


      {/* Main headline */}
      <motion.h1
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.07 }}
        className="font-extrabold leading-[1.04] tracking-tight text-white mb-7"
        style={{ fontSize: 'clamp(3rem,8.5vw,6rem)', letterSpacing: '-0.025em' }}
      >
        The Infrastructure
        <br />
        <span
          style={{
            background: 'linear-gradient(110deg, #C7DEFF 10%, #7EB8FF 50%, #3B6EFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          for Modern Finance
        </span>
      </motion.h1>

      {/* Sub-copy */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.15 }}
        className="max-w-lg mx-auto mb-10 leading-relaxed"
        style={{ fontSize: 'clamp(0.95rem,2vw,1.1rem)', color: 'rgba(255,255,255,0.42)' }}
      >
        Build production-ready fintech applications with enterprise-grade security.
        Core ledger, payment orchestration, KYC compliance — shipped as one platform.
      </motion.p>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.20 }}
        className="flex flex-wrap justify-center gap-2 mb-10"
      >
        {PILLS.map(({ icon: Icon, text }) => (
          <span
            key={text}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            <Icon className="h-3 w-3 flex-shrink-0" style={{ color: '#7EB8FF' }} />
            {text}
          </span>
        ))}
      </motion.div>

      {/* CTA row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.26 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
      >
        {/* Primary — forest green, strong glow */}
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => scrollTo("#platform")}
          className="group relative inline-flex items-center gap-2.5 rounded-xl font-semibold text-sm overflow-hidden"
          style={{
            padding: '13px 28px',
            background: 'linear-gradient(135deg, #1D4ED8 0%, #3B6EFF 50%, #7EB8FF 100%)',
            color: '#C7DEFF',
            boxShadow: '0 0 0 1px rgba(59,110,255,0.30), 0 4px 24px rgba(59,110,255,0.45), 0 1px 4px rgba(0,0,0,0.4)',
            letterSpacing: '-0.01em',
          }}
        >
          {/* Shimmer on hover */}
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
            style={{ background: 'linear-gradient(105deg, transparent 25%, rgba(207,255,220,0.14) 50%, transparent 75%)' }}
          />
          <span className="relative">Explore Platform</span>
          <ArrowRight className="relative h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
        </motion.button>

        {/* Secondary — ghost */}
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => scrollTo("#features")}
          className="inline-flex items-center gap-2 rounded-xl font-medium text-sm"
          style={{
            padding: '13px 26px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.11)',
            color: 'rgba(255,255,255,0.60)',
          }}
        >
          View Documentation
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.34 }}
        className="flex flex-wrap justify-center gap-x-12 gap-y-5 mb-14"
      >
        {STATS.map(({ value, label }, i) => (
          <div key={i} className="text-center">
            <div
              className="font-extrabold leading-none mb-1.5 text-white"
              style={{ fontSize: 'clamp(1.6rem,2.8vw,2rem)' }}
            >
              {value}
            </div>
            <div
              className="text-[11px] uppercase tracking-[0.1em] font-medium"
              style={{ color: 'rgba(255,255,255,0.28)' }}
            >
              {label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Hairline divider */}
      <div
        className="mx-auto mb-6"
        style={{
          width: '200px', height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)',
        }}
      />

      {/* Marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.5 }}
      >
        <p className="text-[10px] uppercase tracking-[0.18em] font-medium mb-4" style={{ color: 'rgba(255,255,255,0.18)' }}>
          Trusted by teams at
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
            className="flex gap-12 items-center whitespace-nowrap"
          >
            {[...MARQUEE, ...MARQUEE].map((name, i) => (
              <span key={i} className="text-sm font-semibold select-none" style={{ color: 'rgba(255,255,255,0.14)' }}>
                {name}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="w-px rounded-full"
          style={{ height: '32px', background: 'linear-gradient(to bottom, rgba(59,110,255,0.45), transparent)' }}
        />
      </motion.div>
    </div>
  );
};

/* ─── Product Card ────────────────────────────────────────────────────────── */

export const ProductCard = ({
  product,
  translate,
}: {
  product: { title: string; link: string; thumbnail: string };
  translate: MotionValue<number>;
}) => (
  <motion.div
    style={{ x: translate, width: "clamp(140px,16vw,300px)", aspectRatio: "16/10" }}
    whileHover={{ y: -8, scale: 1.04, transition: { duration: 0.2 } }}
    className="group/product relative shrink-0 rounded-2xl overflow-hidden"
  >
    <Link to={product.link} className="block h-full w-full">
      <img
        src={product.thumbnail}
        height="400" width="640"
        className="object-cover object-center absolute h-full w-full inset-0 transition-transform duration-500 group-hover/product:scale-110"
        alt={product.title}
      />
    </Link>

    {/* Vignette */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ background: 'linear-gradient(to top, rgba(11,12,14,0.88) 0%, rgba(11,12,14,0.15) 55%, transparent 100%)' }}
    />
    {/* Neutral border → green glow on hover */}
    <div
      className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
    />
    <div
      className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover/product:opacity-100 transition-opacity duration-300"
      style={{ border: '1px solid rgba(59,110,255,0.55)', boxShadow: 'inset 0 0 0 1px rgba(59,110,255,0.10), 0 0 28px rgba(59,110,255,0.22)' }}
    />

    {/* Title */}
    <p
      className="absolute bottom-2.5 left-3 right-3 font-semibold text-[10px] sm:text-xs leading-snug drop-shadow-lg pointer-events-none"
      style={{ color: 'rgba(255,255,255,0.85)' }}
    >
      {product.title}
    </p>
  </motion.div>
);
