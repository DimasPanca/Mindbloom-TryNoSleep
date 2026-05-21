import { useEffect, useState } from 'react'

interface Props {
  value: number
  duration?: number
  decimals?: number
  className?: string
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

export default function AnimatedNumber({
  value,
  duration = 1.2,
  decimals = 0,
  className,
}: Props) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let frame = 0
    const start = performance.now()
    const ms = duration * 1000

    function tick(now: number) {
      const progress = Math.min((now - start) / ms, 1)
      setDisplay(value * easeOutCubic(progress))
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    setDisplay(0)
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return <span className={className}>{display.toFixed(decimals)}</span>
}
