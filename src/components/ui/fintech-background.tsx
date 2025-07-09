import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  angle: number;
  type: 'circle' | 'square' | 'diamond' | 'hexagon';
}

interface FintechBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  particleCount?: number;
  enableGrid?: boolean;
  enableGradient?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export const FintechBackground: React.FC<FintechBackgroundProps> = ({
  className = "",
  children,
  particleCount = 50,
  enableGrid = true,
  enableGradient = true,
  primaryColor = "59, 130, 246", // Blue
  secondaryColor = "139, 92, 246", // Purple  
  accentColor = "16, 185, 129", // Green
}) => {
  const [elements, setElements] = useState<FloatingElement[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const elementsRef = useRef<FloatingElement[]>([]);

  // Update ref when elements change
  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  // Generate floating elements
  useEffect(() => {
    const newElements: FloatingElement[] = [];
    const types: FloatingElement['type'][] = ['circle', 'square', 'diamond', 'hexagon'];

    for (let i = 0; i < particleCount; i++) {
      newElements.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 4 + 2,
        opacity: Math.random() * 0.6 + 0.1,
        speed: Math.random() * 0.5 + 0.2,
        angle: Math.random() * Math.PI * 2,
        type: types[Math.floor(Math.random() * types.length)]
      });
    }

    setElements(newElements);
  }, [particleCount]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvas();
    window.addEventListener('resize', updateCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid if enabled
      if (enableGrid) {
        drawGrid(ctx, canvas.width, canvas.height);
      }

      // Update and draw floating elements
      setElements(prevElements => 
        prevElements.map(element => {
          // Update position
          const newX = element.x + Math.cos(element.angle) * element.speed;
          const newY = element.y + Math.sin(element.angle) * element.speed;

          // Wrap around screen edges
          const wrappedX = newX < 0 ? canvas.width : newX > canvas.width ? 0 : newX;
          const wrappedY = newY < 0 ? canvas.height : newY > canvas.height ? 0 : newY;

          // Draw element
          drawElement(ctx, { ...element, x: wrappedX, y: wrappedY });

          return {
            ...element,
            x: wrappedX,
            y: wrappedY,
            opacity: element.opacity + Math.sin(Date.now() * 0.001 + element.id) * 0.1
          };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enableGrid, primaryColor, secondaryColor, accentColor]); // Removed 'elements' from dependencies

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 60;
    ctx.strokeStyle = `rgba(${primaryColor}, 0.08)`;
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawElement = (ctx: CanvasRenderingContext2D, element: FloatingElement) => {
    const { x, y, size, opacity, type } = element;
    
    ctx.save();
    ctx.globalAlpha = Math.max(0.1, Math.min(0.7, opacity));
    
    // Choose color based on element type
    let color = primaryColor;
    if (type === 'square') color = secondaryColor;
    if (type === 'diamond') color = accentColor;
    
    ctx.fillStyle = `rgba(${color}, 0.4)`;
    ctx.strokeStyle = `rgba(${color}, 0.8)`;
    ctx.lineWidth = 1;

    switch (type) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'square':
        ctx.fillRect(x - size/2, y - size/2, size, size);
        ctx.strokeRect(x - size/2, y - size/2, size, size);
        break;
        
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'hexagon':
        const sides = 6;
        const radius = size;
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
          const angle = (i * 2 * Math.PI) / sides;
          const hx = x + radius * Math.cos(angle);
          const hy = y + radius * Math.sin(angle);
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
    }
    
    ctx.restore();
  };

  return (
    <div className={`fixed inset-0 overflow-hidden ${className}`}>
      {/* Gradient Background */}
      {enableGradient && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, rgba(${primaryColor}, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(${secondaryColor}, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(${accentColor}, 0.05) 0%, transparent 50%),
              linear-gradient(135deg, rgba(${primaryColor}, 0.02) 0%, rgba(${secondaryColor}, 0.02) 100%)
            `
          }}
          animate={{
            background: [
              `radial-gradient(circle at 20% 80%, rgba(${primaryColor}, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 80% 20%, rgba(${secondaryColor}, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 40% 40%, rgba(${accentColor}, 0.05) 0%, transparent 50%)`,
              `radial-gradient(circle at 80% 20%, rgba(${primaryColor}, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 20% 80%, rgba(${secondaryColor}, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 60% 60%, rgba(${accentColor}, 0.05) 0%, transparent 50%)`
            ]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
      )}

      {/* Animated Grid Lines */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(${primaryColor}, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(${primaryColor}, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
        animate={{
          backgroundPosition: ['0px 0px', '60px 60px']
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Floating Canvas Elements */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Animated Accent Shapes */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 rounded-full border-2 opacity-20"
        style={{ borderColor: `rgba(${accentColor}, 0.4)` }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-20 right-20 w-16 h-16 opacity-20"
        style={{
          background: `linear-gradient(45deg, rgba(${primaryColor}, 0.3), rgba(${secondaryColor}, 0.3))`,
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
        }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, -180, -360],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute top-1/2 right-10 w-12 h-12 opacity-20"
        style={{
          background: `rgba(${accentColor}, 0.3)`,
          transform: 'rotate(45deg)'
        }}
        animate={{
          y: [-10, 10, -10],
          rotate: [45, 225, 405],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[0.5px]" style={{ zIndex: 2 }} />
    </div>
  );
}; 