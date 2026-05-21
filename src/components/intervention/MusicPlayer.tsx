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
  SkipForward,
  Trees,
  Volume1,
  Volume2,
  VolumeX,
  Waves,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'

type IconComp = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>

interface TrackDef {
  id: string
  label: string
  Icon: IconComp
  files: string[]
}

const TRACKS: TrackDef[] = [
  {
    id: 'alam',
    label: 'Suara Alam',
    Icon: Trees,
    files: ['/audio/alam/alam-1.mp3', '/audio/alam/alam-2.mp3', '/audio/alam/alam-3.mp3'],
  },
  {
    id: 'hujan',
    label: 'Hujan Lembut',
    Icon: CloudRain,
    files: ['/audio/hujan/hujan-1.mp3', '/audio/hujan/hujan-2.mp3', '/audio/hujan/hujan-3.mp3'],
  },
  {
    id: 'lofi',
    label: 'Lo-fi Relax',
    Icon: Headphones,
    files: ['/audio/lofi/lofi-1.mp3', '/audio/lofi/lofi-2.mp3', '/audio/lofi/lofi_3.mp3'],
  },
  {
    id: 'binaural',
    label: 'Gelombang Binaural',
    Icon: AudioWaveform,
    files: ['/audio/binaural/binaural-1.mp3', '/audio/binaural/binaural-2.mp3', '/audio/binaural/binaural-3.mp3'],
  },
  {
    id: 'tibetan',
    label: 'Mangkuk Tibetan',
    Icon: Bell,
    files: ['/audio/tibetan/tibetan-1.mp3', '/audio/tibetan/tibetan-2.mp3', '/audio/tibetan/tibetan-3.mp3'],
  },
  {
    id: 'ombak',
    label: 'Ombak Laut',
    Icon: Waves,
    files: ['/audio/ombak/ombak-1.mp3', '/audio/ombak/ombak-2.mp3'],
  },
]

const MIN_LISTEN_SECS = 60

function pickRandom(files: string[]): string {
  return files[Math.floor(Math.random() * files.length)]
}

function fmtTime(secs: number) {
  if (!isFinite(secs) || isNaN(secs)) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface Props {
  onComplete: () => void
}

export default function MusicPlayer({ onComplete }: Props) {
  const [selectedId, setSelectedId]   = useState<string>('alam')
  const [currentSrc, setCurrentSrc]   = useState<string>(() => pickRandom(TRACKS[0].files))
  const [isPlaying, setIsPlaying]     = useState(false)
  const [elapsed, setElapsed]         = useState(0)
  const [duration, setDuration]       = useState(0)
  const [volume, setVolume]           = useState(0.8)
  const [canFinish, setCanFinish]     = useState(false)
  const [totalListened, setTotalListened] = useState(0)

  const audioRef    = useRef<HTMLAudioElement | null>(null)
  const rafRef      = useRef<number | null>(null)
  const listenedRef = useRef(0)
  const lastTsRef   = useRef<number | null>(null)

  function createAudio(src: string, vol: number) {
    const a = new Audio(src)
    a.volume = vol
    a.loop   = true
    return a
  }

  useEffect(() => {
    const a = createAudio(currentSrc, volume)
    audioRef.current = a

    a.addEventListener('loadedmetadata', () => setDuration(a.duration))
    a.addEventListener('ended', () => setIsPlaying(false))

    return () => {
      a.pause()
      a.src = ''
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [currentSrc])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
      lastTsRef.current = performance.now()

      function tick() {
        if (!audioRef.current) return
        setElapsed(audioRef.current.currentTime)

        const now  = performance.now()
        const diff = (now - (lastTsRef.current ?? now)) / 1000
        lastTsRef.current = now

        listenedRef.current += diff
        setTotalListened(listenedRef.current)
        if (listenedRef.current >= MIN_LISTEN_SECS) setCanFinish(true)

        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } else {
      audio.pause()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTsRef.current = null
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying])

  function selectTrack(track: TrackDef) {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setSelectedId(track.id)
    setCurrentSrc(pickRandom(track.files))
    setIsPlaying(false)
    setElapsed(0)
    setDuration(0)
  }

  function shuffleCurrent() {
    const track = TRACKS.find(t => t.id === selectedId)
    if (!track) return
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
    setCurrentSrc(pickRandom(track.files))
    setIsPlaying(false)
    setElapsed(0)
    setDuration(0)
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value)
    if (audioRef.current) audioRef.current.currentTime = val
    setElapsed(val)
  }

  const listenPct     = Math.min(100, Math.round((totalListened / MIN_LISTEN_SECS) * 100))
  const currentTrack  = TRACKS.find(t => t.id === selectedId)!

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {TRACKS.map((track) => {
          const active = track.id === selectedId
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => selectTrack(track)}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors text-center',
                active
                  ? 'border-primary bg-[#E8F6F3] dark:bg-[#0F2522]'
                  : 'border-border-light dark:border-border-dark bg-white dark:bg-dark-hover hover:border-primary/50',
              )}
            >
              <track.Icon
                size={22}
                strokeWidth={1.75}
                className={active ? 'text-primary' : 'text-text-muted dark:text-[#8EA8A5]'}
              />
              <span className={cn(
                'text-xs font-semibold leading-tight',
                active ? 'text-primary' : 'text-text-dark dark:text-white',
              )}>
                {track.label}
              </span>
            </button>
          )
        })}
      </div>

      <div className="bg-white dark:bg-dark-card border border-border-light dark:border-border-dark rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-text-muted dark:text-[#8EA8A5] truncate">
              {currentTrack.label}
            </p>
          </div>
          <button
            type="button"
            onClick={shuffleCurrent}
            title="Ganti variasi"
            className="p-1.5 rounded-lg text-text-muted hover:text-primary dark:text-[#8EA8A5] dark:hover:text-primary transition-colors"
          >
            <SkipForward size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="flex items-center justify-center">
          <motion.button
            type="button"
            onClick={() => setIsPlaying(p => !p)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="w-14 h-14 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center shadow-md transition-colors"
          >
            {isPlaying
              ? <Pause size={24} strokeWidth={2} />
              : <Play  size={24} strokeWidth={2} className="translate-x-0.5" />
            }
          </motion.button>
        </div>

        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.5}
            value={elapsed}
            onChange={handleSeek}
            className="w-full accent-primary h-1.5 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-text-muted dark:text-[#8EA8A5]">
            <span>{fmtTime(elapsed)}</span>
            <span>{fmtTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <VolumeIcon size={16} strokeWidth={1.75} className="text-text-muted shrink-0" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="flex-1 accent-primary h-1.5 cursor-pointer"
          />
        </div>
      </div>

      {!canFinish && (
        <div className="space-y-2">
          <div className="flex items-start gap-2.5 bg-yellow/10 border border-yellow/20 rounded-xl p-3">
            <Lightbulb size={16} strokeWidth={1.75} className="text-yellow shrink-0 mt-0.5" />
            <p className="text-xs text-yellow font-semibold">
              Dengarkan minimal {MIN_LISTEN_SECS} detik untuk melanjutkan. Gunakan earphone untuk pengalaman terbaik.
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-text-muted dark:text-[#8EA8A5]">
              <span>Progres mendengarkan</span>
              <span>{listenPct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-border-light dark:bg-border-dark overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{ width: `${listenPct}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
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
