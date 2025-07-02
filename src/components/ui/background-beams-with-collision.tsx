import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Beam {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  length: number;
  opacity: number;
  color: string;
}

interface CollisionEffect {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

interface BackgroundBeamsWithCollisionProps {
  children?: React.ReactNode;
  className?: string;
  beamCount?: number;
  colors?: string[];
}

export const BackgroundBeamsWithCollision: React.FC<BackgroundBeamsWithCollisionProps> = ({
  children,
  className = "",
  beamCount = 12,
  colors = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#EC4899"]
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [beams, setBeams] = useState<Beam[]>([]);
  const [collisions, setCollisions] = useState<CollisionEffect[]>([]);
  const animationRef = useRef<number>();

  // Initialize beams
  useEffect(() => {
    const initializeBeams = () => {
      const newBeams: Beam[] = [];
      for (let i = 0; i < beamCount; i++) {
        newBeams.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 2 + 1,
          length: Math.random() * 100 + 50,
          opacity: Math.random() * 0.7 + 0.3,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      setBeams(newBeams);
    };

    initializeBeams();
    window.addEventListener('resize', initializeBeams);

    return () => {
      window.removeEventListener('resize', initializeBeams);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [beamCount, colors]);

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

      // Update and draw beams
      setBeams(prevBeams => {
        const newBeams = prevBeams.map(beam => {
          // Update position
          const newX = beam.x + Math.cos(beam.angle) * beam.speed;
          const newY = beam.y + Math.sin(beam.angle) * beam.speed;

          // Wrap around screen
          let wrappedX = newX;
          let wrappedY = newY;
          
          if (newX < 0) wrappedX = canvas.width;
          if (newX > canvas.width) wrappedX = 0;
          if (newY < 0) wrappedY = canvas.height;
          if (newY > canvas.height) wrappedY = 0;

          // Draw beam
          drawBeam(ctx, { ...beam, x: wrappedX, y: wrappedY });

          return { ...beam, x: wrappedX, y: wrappedY };
        });

        // Check for collisions
        checkCollisions(newBeams);

        return newBeams;
      });

      // Draw collision effects
      setCollisions(prevCollisions => {
        const currentTime = Date.now();
        const activeCollisions = prevCollisions.filter(
          collision => currentTime - collision.timestamp < 1000
        );

        activeCollisions.forEach(collision => {
          drawCollisionEffect(ctx, collision, currentTime);
        });

        return activeCollisions;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [beams]);

  const drawBeam = (ctx: CanvasRenderingContext2D, beam: Beam) => {
    const endX = beam.x + Math.cos(beam.angle) * beam.length;
    const endY = beam.y + Math.sin(beam.angle) * beam.length;

    // Create gradient for beam
    const gradient = ctx.createLinearGradient(beam.x, beam.y, endX, endY);
    gradient.addColorStop(0, `${beam.color}00`); // Transparent start
    gradient.addColorStop(0.5, `${beam.color}${Math.floor(beam.opacity * 255).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(1, `${beam.color}00`); // Transparent end

    ctx.beginPath();
    ctx.moveTo(beam.x, beam.y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add glow effect
    ctx.shadowColor = beam.color;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  const checkCollisions = (beams: Beam[]) => {
    for (let i = 0; i < beams.length; i++) {
      for (let j = i + 1; j < beams.length; j++) {
        const beam1 = beams[i];
        const beam2 = beams[j];
        
        const distance = Math.sqrt(
          Math.pow(beam1.x - beam2.x, 2) + Math.pow(beam1.y - beam2.y, 2)
        );

        if (distance < 30) { // Collision threshold
          const collisionX = (beam1.x + beam2.x) / 2;
          const collisionY = (beam1.y + beam2.y) / 2;

          setCollisions(prev => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              x: collisionX,
              y: collisionY,
              timestamp: Date.now()
            }
          ]);

          // Change beam directions after collision
          beams[i].angle += (Math.random() - 0.5) * 0.5;
          beams[j].angle += (Math.random() - 0.5) * 0.5;
        }
      }
    }
  };

  const drawCollisionEffect = (ctx: CanvasRenderingContext2D, collision: CollisionEffect, currentTime: number) => {
    const age = currentTime - collision.timestamp;
    const progress = age / 1000; // 1 second duration
    const radius = progress * 50;
    const opacity = 1 - progress;

    // Explosion effect
    ctx.beginPath();
    ctx.arc(collision.x, collision.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner glow
    const gradient = ctx.createRadialGradient(
      collision.x, collision.y, 0,
      collision.x, collision.y, radius
    );
    gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.5})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fill();

    // Sparkles
    for (let i = 0; i < 8; i++) {
      const sparkleAngle = (i / 8) * Math.PI * 2;
      const sparkleX = collision.x + Math.cos(sparkleAngle) * radius * 0.8;
      const sparkleY = collision.y + Math.sin(sparkleAngle) * radius * 0.8;
      
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
    }
  };

  return (
    <div className={`relative min-h-screen overflow-hidden bg-slate-950 ${className}`}>
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%),
            linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)
          `
        }}
        animate={{
          background: [
            `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
             radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
             radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)`,
            `radial-gradient(circle at 80% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
             radial-gradient(circle at 20% 80%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
             radial-gradient(circle at 60% 60%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)`
          ]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Beams canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Floating orbs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: colors[i % colors.length],
            left: `${20 + i * 15}%`,
            top: `${30 + i * 10}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.3, 1, 0.3],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {children}
      </div>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" style={{ zIndex: 2 }} />
    </div>
  );
}; 