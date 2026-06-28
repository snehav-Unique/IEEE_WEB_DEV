import React, { useEffect, useRef, useState } from 'react';
import './PixelCard.css';

/**
 * Pixel class implements a simple particle that moves and fades, creating a shimmering effect.
 * It is intentionally lightweight for use on hover without impacting performance.
 */
class Pixel {
  constructor(canvas, context, x, y, color, speed, delay) {
    this.canvas = canvas;
    this.ctx = context;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = speed;
    this.delay = delay;
    this.size = 0;
    this.maxSize = 2;
    this.sizeStep = Math.random() * 0.4;
    this.counter = 0;
    this.counterStep = Math.random() * 4 + (canvas.width + canvas.height) * 0.01;
    this.isIdle = false;
  }

  reset() {
    this.size = 0;
    this.counter = 0;
    this.isIdle = false;
  }

  update() {
    if (this.isIdle) return;
    this.counter += this.counterStep;
    if (this.counter > 100) {
      this.isIdle = true;
      return;
    }
    // Simple linear motion outward
    const angle = (Math.random() - 0.5) * Math.PI;
    this.x += Math.cos(angle) * this.speed;
    this.y += Math.sin(angle) * this.speed;
    this.size = Math.min(this.maxSize, this.size + this.sizeStep);
  }

  draw() {
    if (this.isIdle) return;
    this.update();
    this.ctx.fillStyle = this.color;
    this.ctx.globalAlpha = Math.max(0, 1 - this.counter / 120);
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalAlpha = 1;
  }
}

/**
 * PixelCard wraps its children with a canvas that animates a subtle pixel shimmer.
 * The animation starts on hover and stops when not hovered to keep performance optimal.
 */
export default function PixelCard({ children }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationIdRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialise canvas size
  const initCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    return ctx;
  };

  const startAnimation = () => {
    const ctx = initCanvas();
    if (!ctx) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const pixels = [];
    const color = '#7c5cff'; // violet accent colour
    const speed = 0.6;
    const addPixel = () => {
      const p = new Pixel(canvas, ctx, rect.width / 2, rect.height / 2, color, speed, 0);
      pixels.push(p);
    };
    for (let i = 0; i < 12; i++) addPixel();
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pixels.forEach(p => p.draw());
      if (Math.random() < 0.05) addPixel();
      animationIdRef.current = requestAnimationFrame(animate);
    };
    animate();
    setIsAnimating(true);
  };

  const stopAnimation = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
    setIsAnimating(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleEnter = () => startAnimation();
    const handleLeave = () => stopAnimation();
    container.addEventListener('mouseenter', handleEnter);
    container.addEventListener('mouseleave', handleLeave);
    return () => {
      container.removeEventListener('mouseenter', handleEnter);
      container.removeEventListener('mouseleave', handleLeave);
      stopAnimation();
    };
  }, []);

  return (
    <div className="pixel-card" ref={containerRef} style={{ position: 'relative', overflow: 'hidden' }}>
      <canvas ref={canvasRef} className="pixel-canvas" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
      {children}
    </div>
  );
}
