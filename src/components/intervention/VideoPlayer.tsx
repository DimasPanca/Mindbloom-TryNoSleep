import { useState } from 'react'
import { motion } from 'framer-motion'
import { Anchor, Lightbulb, MessageCircle, ScanLine, Wind } from 'lucide-react'
import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'

type IconComp = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>

interface VideoTab {
  label: string
  Icon:  IconComp
  embedId: string
  tip: string
}

const TABS: VideoTab[] = [
  {
    label:   'Pernapasan',
    Icon:    Wind,
    embedId: 'tybOi4hjZFQ',
    tip:     'Ikuti ritme pernapasan untuk menenangkan sistem saraf dalam 3-5 menit.',
  },
  {
    label:   'Pemindaian Tubuh',
    Icon:    ScanLine,
    embedId: 'VB9JJBhPNPc',
    tip:     'Pindai tubuhmu dari ujung kepala hingga kaki, lepaskan ketegangan.',
  },
  {
    label:   'Grounding',
    Icon:    Anchor,
    embedId: 'FBFBbkRiYgw',
    tip:     'Teknik 5-4-3-2-1 membantu menghadirkan dirimu ke momen saat ini.',
  },
  {
    label:   'Afirmasi',
    Icon:    MessageCircle,
    embedId: '2CUnYyNnDBA',
    tip:     'Ulangi afirmasi positif untuk membentuk pola pikir yang lebih sehat.',
  },
]

interface Props {
  onComplete: () => void
}

export default function VideoPlayer({ onComplete }: Props) {
  const [activeTab, setActiveTab] = useState(0)
  const tab = TABS[activeTab]

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-bg dark:bg-dark-hover rounded-xl p-1">
        {TABS.map((t, idx) => (
          <button
            key={t.label}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={cn(
              'relative flex-1 flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-[10px] font-semibold transition-colors',
              activeTab === idx
                ? 'text-primary'
                : 'text-text-muted dark:text-[#8EA8A5] hover:text-text-dark dark:hover:text-white',
            )}
          >
            <t.Icon size={14} strokeWidth={2} />
            <span className="leading-tight text-center">{t.label}</span>
            {activeTab === idx && (
              <motion.div
                layoutId="video-tab-active"
                className="absolute inset-0 bg-white dark:bg-dark-card rounded-lg shadow-sm -z-10"
                transition={{ type: 'spring', damping: 20, stiffness: 240 }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <iframe
          key={tab.embedId}
          src={`https://www.youtube.com/embed/${tab.embedId}?rel=0&modestbranding=1`}
          title={tab.label}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>

      <div className="flex items-start gap-2.5 bg-yellow/10 border border-yellow/20 rounded-xl p-3">
        <Lightbulb size={16} strokeWidth={1.75} className="text-yellow shrink-0 mt-0.5" />
        <p className="text-xs text-yellow font-semibold">{tab.tip}</p>
      </div>

      <motion.button
        type="button"
        onClick={onComplete}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-primary hover:bg-primary-dark text-white font-bold rounded-xl py-3 transition-colors"
      >
        Selesai &amp; Lanjut
      </motion.button>
    </div>
  )
}
