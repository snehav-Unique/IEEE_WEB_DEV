'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import gsap from 'gsap';
import './BlobCursor.css';

export default function BlobCursor({
  blobType = 'circle',
  fillColor = '#7c5cff',
  trailCount = 4,
  sizes = [100, 80, 60, 40],
  innerSizes = [25, 20, 15, 10],
  innerColor = 'rgba(255, 255, 255, 0.9)',
  opacities = [0.8, 0.7, 0.6, 0.5],
  shadowColor = 'rgba(124, 92, 255, 0.4)',
  shadowBlur = 15,
  shadowOffsetX = 0,
  shadowOffsetY = 0,
  filterId = 'liquid-blob-filter',
  filterStdDeviation = 20,
  filterColorMatrixValues = '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -10',
  useFilter = true,
  fastDuration = 0.15,
  slowDuration = 0.6,
  fastEase = 'power2.out',
  slowEase = 'power1.out',
  zIndex = 5,
  proximityRadius = 250,
  greeting = 'Hello, Welcome 👋',
  title = 'RVCE IEEE',
  subtitle = 'Hover close to activate liquid plasma'
}) {
  const containerRef = useRef(null);
  const blobsRef = useRef([]);
  const blobMainRef = useRef(null);
  const [isNear, setIsNear] = useState(false);

  const updateOffset = useCallback(() => {
    if (!containerRef.current) return { left: 0, top: 0, width: 0, height: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height
    };
  }, []);

  const handleGlobalMove = useCallback(
    (e) => {
      if (!containerRef.current || !blobMainRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const sphereCenterX = rect.left + rect.width / 2;
      const sphereCenterY = rect.top + rect.height / 2;
      const sphereRadius = Math.min(rect.width, rect.height) / 2;

      const x = 'clientX' in e ? e.clientX : e.touches[0].clientX;
      const y = 'clientY' in e ? e.clientY : e.touches[0].clientY;

      const dx = x - sphereCenterX;
      const dy = y - sphereCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const activationRadius = Math.min(sphereRadius, proximityRadius);
      const near = distance <= activationRadius;
      setIsNear(near);

      const targetOpacity = near
        ? Math.min(1, 1 - Math.max(distance - 80, 0) / Math.max(activationRadius - 80, 1))
        : 0;
      gsap.to(blobMainRef.current, {
        opacity: Math.max(0, targetOpacity),
        scale: near ? 1 : 0.8,
        duration: 0.4,
        ease: 'power2.out'
      });

      const containerLeft = rect.left;
      const containerTop = rect.top;

      blobsRef.current.forEach((el, i) => {
        if (!el) return;
        const isLead = i === 0;
        gsap.to(el, {
          x: x - containerLeft,
          y: y - containerTop,
          duration: isLead ? fastDuration : slowDuration,
          ease: isLead ? fastEase : slowEase
        });
      });
    },
    [proximityRadius, fastDuration, slowDuration, fastEase, slowEase]
  );

  useEffect(() => {
    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('touchmove', handleGlobalMove);
    const onResize = () => updateOffset();
    window.addEventListener('resize', onResize);

    if (blobMainRef.current) {
      gsap.set(blobMainRef.current, { opacity: 0, scale: 0.8 });
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('resize', onResize);
    };
  }, [handleGlobalMove, updateOffset]);

  return (
    <div
      ref={containerRef}
      className={`liquid-sphere-container ${isNear ? 'is-active' : ''}`}
      style={{ zIndex }}
    >
      <div className="sphere-content">
        <span className="sphere-greeting">{greeting}</span>
        <span className="sphere-title">{title}</span>
        <span className="sphere-subtitle">{subtitle}</span>
      </div>

      {useFilter && (
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation={filterStdDeviation} />
            <feColorMatrix in="blur" values={filterColorMatrixValues} />
          </filter>
        </svg>
      )}

      <div
        ref={blobMainRef}
        className="blob-main"
        style={{ filter: useFilter ? `url(#${filterId})` : undefined }}
      >
        {Array.from({ length: trailCount }).map((_, i) => (
          <div
            key={i}
            ref={(el) => (blobsRef.current[i] = el)}
            className="blob"
            style={{
              width: sizes[i],
              height: sizes[i],
              borderRadius: blobType === 'circle' ? '50%' : '0%',
              backgroundColor: fillColor,
              opacity: opacities[i],
              boxShadow: `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px 0 ${shadowColor}`
            }}
          >
            <div
              className="inner-dot"
              style={{
                width: innerSizes[i],
                height: innerSizes[i],
                top: (sizes[i] - innerSizes[i]) / 2,
                left: (sizes[i] - innerSizes[i]) / 2,
                backgroundColor: innerColor,
                borderRadius: blobType === 'circle' ? '50%' : '0%'
              }}
            />
          </div>
        ))}
      </div>

      <div className="sphere-border-glow" />
    </div>
  );
}
