import React, { useEffect, useMemo, useRef, useState } from 'react'

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

function formatNumber(value, separator, decimals) {
  const fixed = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString()
  const [whole, fraction] = fixed.split('.')
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
  return fraction ? `${formattedWhole}.${fraction}` : formattedWhole
}

export default function CountUp({
  from = 0,
  to = 0,
  separator = ',',
  direction = 'up',
  duration = 1,
  className = '',
  delay = 0,
  decimals,
}) {
  const target = useMemo(() => Number(to) || 0, [to])
  const startValue = useMemo(() => Number(from) || 0, [from])
  const resolvedDecimals = useMemo(() => {
    if (typeof decimals === 'number') return decimals
    const toString = String(to)
    return toString.includes('.') ? toString.split('.')[1].length : 0
  }, [decimals, to])
  const [value, setValue] = useState(startValue)
  const frameRef = useRef(null)
  const timeoutRef = useRef(null)
  const valueRef = useRef(startValue)

  useEffect(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    if (frameRef.current) cancelAnimationFrame(frameRef.current)

    const beginFrom = valueRef.current

    timeoutRef.current = window.setTimeout(() => {
      const begin = performance.now()

      const step = (now) => {
        const elapsed = now - begin
        const progress = Math.min(elapsed / (duration * 1000), 1)
        const eased = easeOutCubic(progress)
        const nextValue = direction === 'down'
          ? beginFrom - (beginFrom - target) * eased
          : beginFrom + (target - beginFrom) * eased

        valueRef.current = nextValue
        setValue(nextValue)

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(step)
        }
      }

      frameRef.current = requestAnimationFrame(step)
    }, delay * 1000)

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [delay, direction, duration, target, startValue])

  return (
    <span className={className}>
      {formatNumber(value, separator, resolvedDecimals)}
    </span>
  )
}
