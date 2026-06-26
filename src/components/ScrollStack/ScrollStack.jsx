import { useEffect, useRef } from 'react';
import './ScrollStack.css';

export function ScrollStackItem({ children, className = '' }) {
  return (
    <div className={`scroll-stack-card ${className}`}>
      <div className="scroll-stack-card-inner">
        {children}
      </div>
    </div>
  );
}

export default function ScrollStack({
  children,
  className = '',
  scaleIncrement = 0.04,
  rotationAmount = 0,
  blurAmount = 0.5,
}) {
  const scrollerRef = useRef(null);
  const prevVals = useRef([]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const cards = Array.from(scroller.querySelectorAll('.scroll-stack-card'));
    if (!cards.length) return;

    prevVals.current = cards.map(() => ({ scale: null, blur: null, rotation: null }));

    const update = () => {
      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const cardsBelow = (cards.length - i - 1) % 10;

        // How far past the top of viewport the card has scrolled
        // Once card top goes above stackPosition (80px = sticky top), start shrinking
        const stickyTop = 80;
        const distancePastSticky = Math.max(0, stickyTop - rect.top);
        // progress ramps from 0→1 over the first 200px of scroll past sticky
        const progress = Math.min(1, distancePastSticky / 200);

        const targetScale = 1 - cardsBelow * scaleIncrement * progress;
        const targetRotation = -cardsBelow * rotationAmount * progress;
        const targetBlur = cardsBelow * blurAmount * progress;

        const prev = prevVals.current[i];
        if (
          Math.abs((prev.scale ?? 999) - targetScale) > 0.0005 ||
          Math.abs((prev.blur ?? 999) - targetBlur) > 0.01
        ) {
          card.style.transform = `scale(${targetScale}) rotate(${targetRotation}deg)`;
          card.style.filter = targetBlur > 0.05 ? `blur(${targetBlur}px)` : '';
          prev.scale = targetScale;
          prev.blur = targetBlur;
          prev.rotation = targetRotation;
        }
      });
    };

    window.addEventListener('scroll', update, { passive: true });
    update(); // run on mount

    return () => window.removeEventListener('scroll', update);
  }, [scaleIncrement, rotationAmount, blurAmount]);

  return (
    <div ref={scrollerRef} className={`scroll-stack-scroller ${className}`}>
      <div className="scroll-stack-inner">
        {children}
      </div>
    </div>
  );
}