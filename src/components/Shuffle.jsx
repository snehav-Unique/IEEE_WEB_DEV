import { useEffect, useMemo, useRef, useState } from 'react'

const DEFAULT_CHARS = '0123456789'

function isStaticChar(char) {
  return char === ' ' || char === ',' || char === '.' || char === '/'
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(media.matches)
    update()

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    }

    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  return prefersReducedMotion
}

function buildRevealOrder(length, shuffleDirection, animationMode) {
  const indices = Array.from({ length }, (_, index) => index)

  if (animationMode === 'evenodd') {
    const even = indices.filter((index) => index % 2 === 0)
    const odd = indices.filter((index) => index % 2 === 1)
    const combined = [...even, ...odd]
    return shuffleDirection === 'left' ? combined.reverse() : combined
  }

  return shuffleDirection === 'left' ? indices.reverse() : indices
}

export default function Shuffle({
  text = '',
  shuffleDirection = 'right',
  duration = 0.35,
  animationMode = 'evenodd',
  shuffleTimes = 1,
  ease = 'power3.out',
  stagger = 0.03,
  threshold = 0.1,
  triggerOnce = true,
  triggerOnHover = false,
  respectReducedMotion = true,
  loop = false,
  loopDelay = 0,
  className = '',
}) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [displayText, setDisplayText] = useState(text)
  const [isAnimating, setIsAnimating] = useState(false)
  const hasMountedRef = useRef(false)

  const revealOrder = useMemo(() => buildRevealOrder(text.length, shuffleDirection, animationMode), [text.length, shuffleDirection, animationMode])

  useEffect(() => {
    if (!text) {
      setDisplayText('')
      return undefined
    }

    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      setDisplayText(text)
      setIsAnimating(false)
      return undefined
    }

    if (respectReducedMotion && prefersReducedMotion) {
      setDisplayText(text)
      return undefined
    }

    const chars = text.split('')
    const totalMs = Math.max(120, duration * 1000)
    const start = performance.now()
    let rafId = 0
    let stopped = false

    const tick = (now) => {
      if (stopped) return

      const elapsed = now - start
      const progress = Math.min(1, elapsed / totalMs)
      const output = chars.map((char, index) => {
        if (isStaticChar(char)) return char

        const revealIndex = revealOrder.indexOf(index)
        const revealProgress = revealOrder.length <= 1 ? 1 : revealIndex / (revealOrder.length - 1)
        const charThreshold = Math.min(0.98, threshold + revealProgress * (1 - threshold))
        if (progress >= charThreshold) {
          return char
        }

        const jitter = Math.floor((elapsed / 16) + index * stagger * 100 + shuffleTimes * 7)
        const poolIndex = Math.abs(jitter + index * 11) % DEFAULT_CHARS.length
        return DEFAULT_CHARS[poolIndex]
      }).join('')

      setDisplayText(output)

      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        setDisplayText(text)
        setIsAnimating(false)
      }
    }

    setIsAnimating(true)
    rafId = requestAnimationFrame(tick)

    return () => {
      stopped = true
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [
    animationMode,
    duration,
    prefersReducedMotion,
    respectReducedMotion,
    revealOrder,
    shuffleDirection,
    shuffleTimes,
    stagger,
    text,
    threshold,
  ])

  const animationStyle = {
    transitionDuration: `${Math.max(0.12, duration)}s`,
    transitionTimingFunction: ease,
  }

  return (
    <span
      className={`shuffle-text ${isAnimating ? 'is-animating' : ''} ${className}`.trim()}
      data-trigger-on-hover={triggerOnHover ? 'true' : 'false'}
      data-trigger-once={triggerOnce ? 'true' : 'false'}
      data-loop={loop ? 'true' : 'false'}
      data-loop-delay={loopDelay}
      style={animationStyle}
    >
      {displayText}
    </span>
  )
}
