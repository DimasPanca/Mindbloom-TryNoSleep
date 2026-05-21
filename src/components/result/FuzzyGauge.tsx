import { useEffect } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import AnimatedNumber from '@/components/AnimatedNumber'
import { SEVERITY_CONFIG } from '@/types'
import type { SeverityLevel } from '@/types'

interface Props {
  score: number
  severity: SeverityLevel
}

const R = 80
const CX = 100
const CY = 100
const ARC = Math.PI * R
const SW = 18

const ZONE_COLORS = [
  { from: 0, to: 25, color: '#E0665A', label: 'Berat' },
  { from: 25, to: 50, color: '#E0914A', label: 'Sedang' },
  { from: 50, to: 75, color: '#D9A23B', label: 'Ringan' },
  { from: 75, to: 100, color: '#5EA85C', label: 'Normal' },
]

const TICKS = [0, 25, 50, 75, 100]

function arcPt(score: number, r = R) {
  const a = (1 - score / 100) * Math.PI
  return { x: CX + r * Math.cos(a), y: CY - r * Math.sin(a) }
}

function arcPath(s1: number, s2: number, r = R) {
  const p1 = arcPt(s1, r)
  const p2 = arcPt(s2, r)
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y}`
}

export default function FuzzyGauge({ score, severity }: Props) {
  const mv = useMotionValue(0)

  useEffect(() => {
    const ctrl = animate(mv, score, { duration: 1.4, delay: 0.4, ease: 'easeInOut' })
    return () => ctrl.stop()
  }, [score, mv])

  const needX = useTransform(mv, s => CX + (R - 16) * Math.cos((1 - s / 100) * Math.PI))
  const needY = useTransform(mv, s => CY - (R - 16) * Math.sin((1 - s / 100) * Math.PI))
  const dotCx = useTransform(mv, s => CX + R * Math.cos((1 - s / 100) * Math.PI))
  const dotCy = useTransform(mv, s => CY - R * Math.sin((1 - s / 100) * Math.PI))
  const dashOff = useTransform(mv, s => ARC - (s / 100) * ARC)

  const meta = SEVERITY_CONFIG[severity]

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[320px] mx-auto">
        <svg viewBox="-5 -5 210 125" className="w-full overflow-visible">
          <defs>
            <linearGradient id="fg-arc" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E0665A" />
              <stop offset="30%" stopColor="#E0914A" />
              <stop offset="60%" stopColor="#D9A23B" />
              <stop offset="85%" stopColor="#2AAFA0" />
              <stop offset="100%" stopColor="#5EA85C" />
            </linearGradient>
            <filter id="fg-glow">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="fg-needle-glow">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {ZONE_COLORS.map(z => (
            <path
              key={z.label}
              d={arcPath(z.from, z.to)}
              fill="none"
              stroke={z.color}
              strokeWidth={SW}
              strokeLinecap="butt"
              opacity={0.15}
              className="dark:opacity-20"
            />
          ))}

          <path
            d={arcPath(0, 100)}
            fill="none"
            stroke="#E8E8E6"
            strokeWidth={SW}
            strokeLinecap="round"
            opacity={0.35}
            className="dark:stroke-[#243C38] dark:opacity-50"
          />

          <motion.path
            d={arcPath(0, 100)}
            fill="none"
            stroke="url(#fg-arc)"
            strokeWidth={SW}
            strokeLinecap="round"
            strokeDasharray={`${ARC} ${ARC}`}
            style={{ strokeDashoffset: dashOff }}
            filter="url(#fg-glow)"
            opacity={0.35}
          />

          <motion.path
            d={arcPath(0, 100)}
            fill="none"
            stroke="url(#fg-arc)"
            strokeWidth={SW}
            strokeLinecap="round"
            strokeDasharray={`${ARC} ${ARC}`}
            style={{ strokeDashoffset: dashOff }}
          />

          {TICKS.map(s => {
            const inner = arcPt(s, R - SW / 2 - 1)
            const outer = arcPt(s, R + SW / 2 + 1)
            return (
              <line
                key={s}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.7}
                className="dark:stroke-[#0C211C]"
              />
            )
          })}

          {ZONE_COLORS.map(z => {
            const mid = (z.from + z.to) / 2
            const p = arcPt(mid, R - SW / 2 - 12)
            return (
              <text
                key={z.label}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={6.5}
                fontWeight={800}
                fill={z.color}
                opacity={0.7}
              >
                {z.label}
              </text>
            )
          })}

          {TICKS.map(s => {
            const p = arcPt(s, R + SW / 2 + 8)
            return (
              <text
                key={`t${s}`}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={6}
                fontWeight={800}
                fill="#9E9D9A"
                className="dark:fill-[#57726A]"
              >
                {s}
              </text>
            )
          })}

          <motion.line
            x1={CX}
            y1={CY}
            x2={needX}
            y2={needY}
            stroke={meta.accentColor}
            strokeWidth={3}
            strokeLinecap="round"
            filter="url(#fg-needle-glow)"
            opacity={0.45}
          />
          <motion.line
            x1={CX}
            y1={CY}
            x2={needX}
            y2={needY}
            stroke={meta.accentColor}
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          <motion.circle
            cx={dotCx}
            cy={dotCy}
            r={8}
            fill="white"
            stroke={meta.accentColor}
            strokeWidth={3}
            className="dark:fill-dark-card"
          />
          <motion.circle
            cx={dotCx}
            cy={dotCy}
            r={3.5}
            fill={meta.accentColor}
          />

          <circle cx={CX} cy={CY} r={6} fill={meta.accentColor} />
          <circle cx={CX} cy={CY} r={3} fill="white" className="dark:fill-dark-card" />
        </svg>

        <div className="text-center -mt-4">
          <div className="text-5xl font-black tabular-nums text-text-dark dark:text-white leading-none">
            <AnimatedNumber value={Math.round(score)} duration={1.4} />
          </div>
          <div className={`text-sm font-black mt-1.5 ${meta.textColor}`}>
            {meta.label}
          </div>
        </div>
      </div>
    </div>
  )
}
