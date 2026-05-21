import { useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Heart, Moon, Users, Zap } from 'lucide-react'
import type { ComponentType } from 'react'
import { DIMENSION_LABELS } from '@/types'
import type { DimensionKey, FactorScores, FuzzyLevel } from '@/types'
import { dimensionFuzzyLevel } from '@/lib/fuzzy'
import { cn } from '@/lib/utils'
import { spring } from '@/lib/motion'

const ICONS: Record<DimensionKey, ComponentType<{ size?: number; strokeWidth?: number; className?: string; style?: React.CSSProperties }>> = {
  mood:    Heart,
  sleep:   Moon,
  energy:  Zap,
  social:  Users,
  anxiety: Activity,
}

const LEVEL_LABEL: Record<FuzzyLevel, string> = {
  baik:  'Baik',
  cukup: 'Cukup',
  buruk: 'Buruk',
}

const LEVEL_COLOR: Record<FuzzyLevel, string> = {
  baik:  'text-green',
  cukup: 'text-yellow',
  buruk: 'text-red',
}

const DIMS: DimensionKey[] = ['mood', 'social', 'sleep', 'anxiety', 'energy']

interface Props {
  factorScores: FactorScores
}

export default function FactorBreakdown({ factorScores }: Props) {
  const [tooltip, setTooltip] = useState<DimensionKey | null>(null)

  return (
    <div className="space-y-4">
      {DIMS.map((dim, idx) => {
        const meta  = DIMENSION_LABELS[dim]
        const Icon  = ICONS[dim]
        const score = Math.round(factorScores[dim] ?? 0)
        const level = dimensionFuzzyLevel(score)

        return (
          <motion.div
            key={dim}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: idx * 0.15 }}
            className="relative"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn('flex items-center gap-1.5 w-36 shrink-0 cursor-pointer select-none')}
                onMouseEnter={() => setTooltip(dim)}
                onMouseLeave={() => setTooltip(null)}
              >
                <div className={cn('p-1.5 rounded-lg', meta.bgColor)}>
                  <Icon size={14} strokeWidth={2} style={{ color: meta.color }} />
                </div>
                <span className="text-xs font-semibold text-text-dark dark:text-white leading-none">
                  {meta.label}
                </span>
              </div>

              <div className="flex-1 h-2.5 rounded-full bg-border-light dark:bg-border-dark overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.9, delay: idx * 0.15, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
              </div>

              <div className="w-16 flex items-center justify-end gap-1.5 shrink-0">
                <span className="text-sm font-black text-text-dark dark:text-white">{score}</span>
                <span className={cn('text-xs font-semibold', LEVEL_COLOR[level])}>
                  {LEVEL_LABEL[level]}
                </span>
              </div>
            </div>

            {tooltip === dim && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 left-0 top-8 bg-white dark:bg-dark-card border border-border-light dark:border-border-dark rounded-xl px-3 py-2 shadow-lg max-w-xs"
              >
                <p className="text-xs text-text-muted dark:text-[#8EA8A5]">{meta.description}</p>
              </motion.div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
