import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AudioWaveform,
  Bell,
  CloudRain,
  Headphones,
  Lightbulb,
  Pause,
  Play,
  Trees,
  Volume1,
  Waves,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'

type IconComp = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>

const TRACKS: { id: number; label: string; Icon: IconComp }[] = [
  { id: 1, label: 'Suara Alam',          Icon: Trees },
  { id: 2, label: 'Hujan Lembut',         Icon: CloudRain },
  { id: 3, label: 'Lo-fi Relax',          Icon: Headphones },
  { id: 4, label: 'Gelombang Binaural',   Icon: AudioWaveform },
  { id: 5, label: 'Mangkuk Tibetan',      Icon: Bell },
  { id: 6, label: 'Ombak Laut',           Icon: Waves },
]

const DEMO_SECS   = 15
const FAKE_DUR    = 180

function fmtTime(secs: number) {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface Props {
  onComplete: () => void
}

export default function MusicPlayer({ onComplete }: Props) {
  const [selected, setSelected]     = useState(1)
  const [isPlaying, setIsPlaying]   = useState(false)
  const [elapsed, setElapsed]       = useState(0)
  const [volume, setVolume]         = useState(0.8)
  const [canFinish, setCanFinish]   = useState(false)
  const intervalRef                 = useRef<number | null>(null)

  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = window.setInterval(() => {
      setElapsed(e => {
        const next = e + 0.1
        if (next >= DEMO_SECS) {
          setIsPlaying(false)
          setCanFinish(true)
          return DEMO_SECS
        }
        return next
      })
    }, 100)
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current) }
  }, [isPlaying])

  function togglePlay() {
    if (elapsed >= DEMO_SECS) return
    setIsPlaying(p => !p)
  }

  const progress     = (elapsed / DEMO_SECS) * 100
  const displayCurr  = Math.round((elapsed / DEMO_SECS) * FAKE_DUR)
  const displayTotal = FAKE_DUR

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {TRACKS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => { setSelected(id); setIsPlaying(false); setElapsed(0); setCanFinish(false) }}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors text-center',
              selected === id
                ? 'border-primary bg-[#E8F6F3] dark:bg-[#0F2522]'
                : 'border-border-light dark:border-border-dark bg-white dark:bg-dark-hover hover:border-primary/50',
            )}
          >
            <Icon
              size={22}
              strokeWidth={1.75}
              className={selected === id ? 'text-primary' : 'text-text-muted dark:text-[#8EA8A5]'}
            />
            <span className={cn(
              'text-xs font-semibold leading-tight',
              selected === id ? 'text-primary' : 'text-text-dark dark:text-white',
            )}>
              {label}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-dark-card border border-border-light dark:border-border-dark rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-center">
          <motion.button
            type="button"
            onClick={togglePlay}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="w-14 h-14 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center shadow-md transition-colors"
          >
            {isPlaying
              ? <Pause size={24} strokeWidth={2} />
              : <Play  size={24} strokeWidth={2} />
            }
          </motion.button>
        </div>

        <div className="space-y-1">
          <div className="w-full h-2 rounded-full bg-border-light dark:bg-border-dark overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="flex justify-between text-xs text-text-muted dark:text-[#8EA8A5]">
            <span>{fmtTime(displayCurr)}</span>
            <span>{fmtTime(displayTotal)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Volume1 size={16} strokeWidth={1.75} className="text-text-muted shrink-0" />
          <input
            type="range" min={0} max={1} step={0.01}
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="flex-1 accent-primary h-1.5 cursor-pointer"
          />
        </div>

        <p className="text-xs text-text-muted dark:text-[#8EA8A5] italic text-center">
          Mode Demo — sambungkan file audio untuk pengalaman penuh
        </p>
      </div>

      <div className="flex items-start gap-2.5 bg-yellow/10 border border-yellow/20 rounded-xl p-3">
        <Lightbulb size={16} strokeWidth={1.75} className="text-yellow shrink-0 mt-0.5" />
        <p className="text-xs text-yellow font-semibold">
          Dengarkan minimal 5 menit untuk efek optimal. Gunakan earphone untuk pengalaman terbaik.
        </p>
      </div>

      {!canFinish && (
        <button
          type="button"
          onClick={() => setCanFinish(true)}
          className="w-full text-xs text-text-muted dark:text-[#8EA8A5] underline underline-offset-2"
        >
          Lewati (Demo)
        </button>
      )}

      {canFinish && (
        <motion.button
          type="button"
          onClick={onComplete}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold rounded-xl py-3 transition-colors"
        >
          Selesai &amp; Lanjut
        </motion.button>
      )}
    </div>
  )
}
