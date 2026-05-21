import { motion } from 'framer-motion'
import { AlertCircle, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import type { ComponentType } from 'react'
import type { MembershipDegrees, SeverityLevel } from '@/types'
import { SEVERITY_CONFIG } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  membershipDegrees: MembershipDegrees
  score: number
}

const ZONES: SeverityLevel[] = ['normal', 'ringan', 'sedang', 'berat']

const ICONS: Record<string, ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  CircleCheck:   CircleCheck,
  Info:          Info,
  TriangleAlert: TriangleAlert,
  AlertCircle:   AlertCircle,
}

export default function MembershipZones({ membershipDegrees, score }: Props) {
  const sorted = [...ZONES].sort(
    (a, b) => (membershipDegrees[b] ?? 0) - (membershipDegrees[a] ?? 0),
  )
  const dominant = sorted[0]
  const secondary = sorted[1]
  const dominantMeta = SEVERITY_CONFIG[dominant]
  const DominantIcon = ICONS[dominantMeta.iconName] ?? CircleCheck

  return (
    <div className="space-y-5">
      <div
        className="relative overflow-hidden rounded-2xl border p-4"
        style={{
          backgroundColor: `${dominantMeta.accentColor}14`,
          borderColor: `${dominantMeta.accentColor}33`,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="grid h-11 w-11 place-items-center rounded-2xl text-white shadow-sm"
              style={{ backgroundColor: dominantMeta.accentColor }}
            >
              <DominantIcon size={20} strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-text-muted dark:text-[#9EB4AC]">
                Kategori Dominan
              </p>
              <p className="text-lg font-black leading-tight text-text-dark dark:text-white">
                {dominantMeta.label}
              </p>
              <p className="text-[11px] font-bold text-text-muted dark:text-[#9EB4AC]">
                Derajat keanggotaan {Math.round((membershipDegrees[dominant] ?? 0) * 100)}%
                {secondary && (membershipDegrees[secondary] ?? 0) > 0.05 && (
                  <> · juga {SEVERITY_CONFIG[secondary].label.toLowerCase()} {Math.round((membershipDegrees[secondary] ?? 0) * 100)}%</>
                )}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-black tabular-nums leading-none" style={{ color: dominantMeta.accentColor }}>
              {Math.round(score)}
            </div>
            <div className="text-[10px] font-bold text-text-muted dark:text-[#9EB4AC]">/ 100</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {ZONES.map((zone, idx) => {
          const deg = membershipDegrees[zone] ?? 0
          const pct = Math.max(0, Math.min(100, deg * 100))
          const meta = SEVERITY_CONFIG[zone]
          const isDominant = zone === dominant
          const Icon = ICONS[meta.iconName] ?? CircleCheck

          return (
            <motion.div
              key={zone}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.07, ease: 'easeOut' }}
              className={cn(
                'flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition-shadow',
                isDominant ? 'shadow-md' : 'shadow-none',
              )}
              style={{
                borderColor: `${meta.accentColor}${isDominant ? '55' : '22'}`,
                backgroundColor: `${meta.accentColor}${isDominant ? '12' : '06'}`,
              }}
            >
              <div
                className="grid h-9 w-9 place-items-center rounded-xl shrink-0"
                style={{ backgroundColor: `${meta.accentColor}22`, color: meta.accentColor }}
              >
                <Icon size={16} strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-sm font-black text-text-dark dark:text-white">{meta.label}</span>
                  <span
                    className="tabular-nums text-sm font-black"
                    style={{ color: meta.accentColor }}
                  >
                    {Math.round(pct)}%
                  </span>
                </div>
                <div className="relative h-2 rounded-full bg-border-light/80 dark:bg-border-dark/80 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, delay: 0.15 + idx * 0.07, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${meta.accentColor}, ${meta.accentColor}CC)`,
                      boxShadow: isDominant ? `0 0 12px ${meta.accentColor}55` : 'none',
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <p className="text-[11px] font-semibold text-text-muted dark:text-[#9EB4AC] leading-relaxed">
        Logika fuzzy menilai derajat keanggotaan kondisimu pada beberapa kategori sekaligus, sehingga hasilnya lebih halus dibanding klasifikasi hitam-putih.
      </p>
    </div>
  )
}
