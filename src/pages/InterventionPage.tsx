import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Brain, CircleCheck, Home, Music, RotateCw, Video } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { createIntervention, getScreeningById } from '@/lib/storage'
import { SEVERITY_CONFIG } from '@/types'
import type { SeverityLevel } from '@/types'
import StepIndicator from '@/components/intervention/StepIndicator'
import MusicPlayer from '@/components/intervention/MusicPlayer'
import VideoPlayer from '@/components/intervention/VideoPlayer'
import JournalPrompt from '@/components/intervention/JournalPrompt'
import Layout from '@/components/Layout'
import { hoverLift, spring } from '@/lib/motion'

type Phase = 0 | 1 | 2 | 3 | 4

const STEPS = [
  { Icon: Music,    label: 'Musik Relaksasi',   desc: 'Dengarkan musik yang menenangkan' },
  { Icon: Video,    label: 'Meditasi Terpandu',  desc: 'Video panduan meditasi & grounding' },
  { Icon: BookOpen, label: 'Jurnal Refleksi',    desc: 'Tulis pikiran & perasaanmu' },
]

export default function InterventionPage() {
  const { screeningId }                    = useParams<{ screeningId: string }>()
  const { user, loading: authLoading }     = useAuth()
  const navigate                           = useNavigate()
  const [phase, setPhase]                  = useState<Phase>(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [severity, setSeverity]            = useState<SeverityLevel>('ringan')
  const [loading, setLoading]              = useState(true)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true })
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!screeningId) return
    async function load() {
      const { data } = await getScreeningById(screeningId!)
      if (data) setSeverity(data.severity)
      setLoading(false)
    }
    void load()
  }, [screeningId])

  async function advance(completedPhase: 1 | 2 | 3) {
    const typeMap = { 1: 'music', 2: 'video', 3: 'journal' } as const
    if (screeningId) await createIntervention({ screeningId, type: typeMap[completedPhase] })
    setCompletedSteps(s => [...s, completedPhase])
    setPhase((completedPhase + 1) as Phase)
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-6 sm:py-9 space-y-5">
          <div className="h-28 skeleton rounded-[1.75rem]" />
          <div className="h-96 skeleton rounded-[1.75rem]" />
        </div>
      </Layout>
    )
  }

  const meta = SEVERITY_CONFIG[severity]

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 py-6 sm:py-9">
        <AnimatePresence mode="wait">
        {phase === 0 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={spring}
            className="space-y-5"
          >
            <div className="text-center space-y-2 pt-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-2 ${meta.bgColor}`}>
                <Brain size={16} strokeWidth={1.75} className={meta.textColor} />
                <span className={`text-sm font-bold ${meta.textColor}`}>{meta.label}</span>
              </div>
              <h1 className="text-2xl font-black text-text-dark dark:text-white">Program Intervensi</h1>
              <p className="text-sm text-text-muted dark:text-[#8EA8A5]">
                3 langkah untuk membantu kondisimu membaik
              </p>
            </div>

            <div className="space-y-2.5">
              {STEPS.map(({ Icon, label, desc }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 0.12 + i * 0.08 }}
                  whileHover={hoverLift}
                  className="surface-card flex items-center gap-3.5 rounded-[1.5rem] p-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={20} strokeWidth={1.75} className="text-primary" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-muted dark:text-[#8EA8A5]">Langkah {i + 1}</span>
                    <div className="text-sm font-bold text-text-dark dark:text-white">{label}</div>
                    <div className="text-xs text-text-muted dark:text-[#8EA8A5]">{desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              type="button"
              onClick={() => setPhase(1)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl py-3.5 shadow-lg shadow-primary/15 transition-colors"
            >
              Mulai Sekarang
            </motion.button>
          </motion.div>
        )}

        {(phase === 1 || phase === 2 || phase === 3) && (
          <motion.div
            key={phase}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={spring}
            className="space-y-5"
          >
            <StepIndicator currentStep={phase as 1 | 2 | 3} completedSteps={completedSteps} />

            <div className="surface-card rounded-[1.75rem] p-5">
              <h2 className="text-base font-black text-text-dark dark:text-white mb-4">
                {phase === 1 ? 'Musik Relaksasi' : phase === 2 ? 'Meditasi Terpandu' : 'Jurnal Refleksi'}
              </h2>
              {phase === 1 && <MusicPlayer onComplete={() => advance(1)} />}
              {phase === 2 && <VideoPlayer onComplete={() => advance(2)} />}
              {phase === 3 && screeningId && (
                <JournalPrompt screeningId={screeningId} onComplete={() => advance(3)} />
              )}
            </div>
          </motion.div>
        )}

        {phase === 4 && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={spring}
            className="flex flex-col items-center text-center space-y-6 pt-8"
          >
            <div className="relative flex items-center justify-center w-24 h-24">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/30"
                animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0 }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/20"
                animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center relative z-10"
              >
                <CircleCheck size={48} strokeWidth={1.5} className="text-primary" />
              </motion.div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-text-dark dark:text-white">Luar Biasa!</h1>
              <p className="text-sm text-text-muted dark:text-[#8EA8A5] max-w-xs mx-auto">
                Kamu telah menyelesaikan seluruh program intervensi. Usahamu hari ini adalah langkah nyata menuju kesehatan mental yang lebih baik.
              </p>
            </div>

            <div className="flex gap-3 w-full max-w-xs">
              <div className="surface-card flex-1 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black text-primary">3</div>
                <div className="text-xs text-text-muted dark:text-[#8EA8A5]">Langkah Selesai</div>
              </div>
              <div className="surface-card flex-1 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black text-primary">+1</div>
                <div className="text-xs text-text-muted dark:text-[#8EA8A5]">Sesi Hari Ini</div>
              </div>
            </div>

            <div className="space-y-2.5 w-full">
              {screeningId && (
                <Link
                  to={`/screening?retest=${screeningId}`}
                  className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-2xl transition-colors"
                >
                  <RotateCw size={18} strokeWidth={2} />
                  Skrining Ulang
                </Link>
              )}
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 w-full border border-border-light dark:border-border-dark text-text-dark dark:text-white font-semibold py-3 rounded-2xl hover:bg-bg dark:hover:bg-dark-hover transition-colors text-sm"
              >
                <Home size={16} strokeWidth={2} />
                Kembali ke Beranda
              </Link>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </Layout>
  )
}
