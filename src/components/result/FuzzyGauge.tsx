import { useEffect } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import AnimatedNumber from '@/components/AnimatedNumber'
import { SEVERITY_CONFIG } from '@/types'
import type { SeverityLevel } from '@/types'

interface Props {
  score: number
  severity: SeverityLevel
}

const R   = 80
const CX  = 100
const CY  = 100
const ARC = Math.PI * R

export default function FuzzyGauge({ score, severity }: Props) {
  const mv = useMotionValue(0)

  useEffect(() => {
    const ctrl = animate(mv, score, { duration: 1.4, delay: 0.4, ease: 'easeInOut' })
    return () => ctrl.stop()
  }, [score, mv])

  const dotCx  = useTransform(mv, s => CX + R * Math.cos((1 - s / 100) * Math.PI))
  const dotCy  = useTransform(mv, s => CY - R * Math.sin((1 - s / 100) * Math.PI))
  const needX2 = useTransform(mv, s => CX + (R - 12) * Math.cos((1 - s / 100) * Math.PI))
  const needY2 = useTransform(mv, s => CY - (R - 12) * Math.sin((1 - s / 100) * Math.PI))

  const dashOffset = useTransform(mv, s => ARC - (s / 100) * ARC)

  const meta = SEVERITY_CONFIG[severity]

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[280px] mx-auto">
        <svg viewBox="0 0 200 105" className="w-full overflow-visible">
          <defs>
            <linearGradient id="fg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#E0665A" />
              <stop offset="33%"  stopColor="#D9A23B" />
              <stop offset="66%"  stopColor="#2AAFA0" />
              <stop offset="100%" stopColor="#5EA85C" />
            </linearGradient>
          </defs>

          <path
            d={`M 20 100 A ${R} ${R} 0 0 1 180 100`}
            fill="none"
            stroke="#EBEBEA"
            strokeWidth={14}
            strokeLinecap="round"
            className="dark:stroke-[#243C38]"
          />

          <motion.path
            d={`M 20 100 A ${R} ${R} 0 0 1 180 100`}
            fill="none"
            stroke="url(#fg-grad)"
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={`${ARC} ${ARC}`}
            style={{ strokeDashoffset: dashOffset }}
          />

          <motion.line
            x1={CX} y1={CY}
            x2={needX2} y2={needY2}
            stroke={meta.accentColor}
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          <motion.circle
            cx={dotCx}
            cy={dotCy}
            r={7}
            fill="white"
            stroke={meta.accentColor}
            strokeWidth={3}
            className="dark:fill-dark-card"
          />

          <circle cx={CX} cy={CY} r={5} fill={meta.accentColor} />
        </svg>

        <div className="text-center -mt-3">
          <div className="text-4xl font-black text-text-dark dark:text-white">
            <AnimatedNumber value={Math.round(score)} duration={1.4} />
          </div>
          <div className={`text-sm font-bold mt-0.5 ${meta.textColor}`}>
            {meta.label}
          </div>
        </div>
      </div>
    </div>
  )
}
