/**
 * EPIC_ID: 29
 * STORY_ID: 29-2
 * CREATED_AT: 2025-12-30T15:35:00Z
 * 
 * ParticleBackground Component
 * 
 * Canvas-based particle system for 8-bit gaming aesthetic.
 * Optimized for performance with requestAnimationFrame and Intersection Observer.
 */

import { useEffect, useRef } from 'react';

export interface ParticleBackgroundProps {
  /**
   * Number of particles to render
   * Adjusted based on screen size
   */
  particleCount: number;
  
  /**
   * Particle color
   * Defaults to primary orange
   */
  particleColor?: string;
  
  /**
   * Animation speed multiplier
   * Defaults to 1.0
   */
  speedMultiplier?: number;
  
  /**
   * Respect reduced motion preference
   * Defaults to true
   */
  respectReducedMotion?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

export function ParticleBackground({
  particleCount,
  particleColor = 'rgba(249, 115, 22, 0.3)',
  speedMultiplier = 1.0,
  respectReducedMotion = true
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const isVisibleRef = useRef(true);

  // Initialize particles
  const initParticles = (canvas: HTMLCanvasElement): Particle[] => {
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5 * speedMultiplier,
        vy: (Math.random() - 0.5) * 0.5 * speedMultiplier,
        size: Math.random() * 2 + 2, // 2-4 pixels
        opacity: Math.random() * 0.3 + 0.1 // 10-40% opacity
      });
    }
    return particles;
  };

  // Update particle positions
  const updateParticles = (canvas: HTMLCanvasElement, particles: Particle[]): void => {
    particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around edges
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.x < 0) particle.x = canvas.width;
      if (particle.y > canvas.height) particle.y = 0;
      if (particle.y < 0) particle.y = canvas.height;
    });
  };

  // Draw particles
  const drawParticles = (ctx: CanvasRenderingContext2D, particles: Particle[]): void => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    particles.forEach(particle => {
      ctx.fillStyle = particleColor.replace('0.3)', `${particle.opacity})`);
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size); // Square for 8-bit look
    });
  };

  // Animation loop
  const animate = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void => {
    if (!isVisibleRef.current) return;
    
    updateParticles(canvas, particlesRef.current);
    drawParticles(ctx, particlesRef.current);
    animationRef.current = requestAnimationFrame(() => animate(canvas, ctx));
  };

  // Setup canvas and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check for reduced motion preference
    const prefersReducedMotion = respectReducedMotion && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Draw static particles only
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particlesRef.current = initParticles(canvas);
      drawParticles(ctx, particlesRef.current);
      return;
    }

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particlesRef.current = initParticles(canvas);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Start animation
    animate(canvas, ctx);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, particleColor, speedMultiplier, respectReducedMotion]);

  // Intersection Observer for pausing animation when off-screen
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(canvas);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        willChange: 'transform'
      }}
    />
  );
}