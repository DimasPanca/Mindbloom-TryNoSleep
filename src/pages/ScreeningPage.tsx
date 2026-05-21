import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Brain,
  CircleCheck,
  Heart,
  Moon,
  Phone,
  TriangleAlert,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import type { ComponentType } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ANSWER_OPTIONS, TARGET_QUESTION_COUNT } from '@/data/questions'
import { DIMENSION_LABELS } from '@/types'
import type { Answer, AnswerValue, DimensionKey, FuzzyResult, Question } from '@/types'
import { fuzzyAnalyze, isCriticalTrigger } from '@/lib/fuzzy'
import { selectQuestions } from '@/lib/questionSelector'
import { getScreeningById, saveScreening } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { modalBackdrop, modalCard, spring } from '@/lib/motion'

type IconComponent = ComponentType<{ size?: number; strokeWidth?: number; className?: string; style?: React.CSSProperties }>

const DIMENSION_ICONS: Record<DimensionKey, IconComponent> = {
  mood:    Heart,
  sleep:   Moon,
  energy:  Zap,
  social:  Users,
  anxiety: Activity,
}

const ANALYZING_MESSAGES = [
  'Menganalisis jawabanmu...',
  'Memproses logika fuzzy...',
  'Menghitung derajat keanggotaan...',
  'Menyusun hasil analisis...',
  'Hampir selesai...',
]

export default function ScreeningPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const retestParentId = searchParams.get('retest') ?? undefined

  const [questions, setQuestions]       = useState<Question[]>([])
  const [loadingQ, setLoadingQ]         = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers]           = useState<(AnswerValue | null)[]>(
    () => Array(TARGET_QUESTION_COUNT).fill(null),
  )
  const [direction, setDirection]             = useState<1 | -1>(1)
  const [showEmergency, setShowEmergency]     = useState(false)
  const [emergencyShown, setEmergencyShown]   = useState(false)
  const [showCancel, setShowCancel]           = useState(false)
  const [analyzing, setAnalyzing]             = useState(false)
  const [analyzingMsg, setAnalyzingMsg]       = useState(0)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true })
  }, [user, authLoading, navigate])

  useEffect(() => {
    async function init() {
      let prev: FuzzyResult | undefined
      if (retestParentId) {
        const { data } = await getScreeningById(retestParentId)
        if (data) {
          prev = {
            score:             data.fuzzy_score,
            severity:          data.severity,
            factorScores:      data.factor_scores,
            membershipDegrees: data.membership_degrees,
            selfHarmFlag:      data.self_harm_flag,
          }
        }
      }
      const qs = selectQuestions(prev)
      setQuestions(qs)
      setAnswers(Array(qs.length).fill(null))
      setLoadingQ(false)
    }
    void init()
  }, [retestParentId])

  useEffect(() => {
    if (!analyzing) return
    const id = window.setInterval(
      () => setAnalyzingMsg(m => (m + 1) % ANALYZING_MESSAGES.length),
      1200,
    )
    return () => window.clearInterval(id)
  }, [analyzing])

  const total         = questions.length
  const currentQ      = questions[currentIndex]
  const currentAnswer = answers[currentIndex]
  const progress      = total > 0 ? Math.round((currentIndex / total) * 100) : 0
  const isLast        = currentIndex === total - 1
  const isFirst       = currentIndex === 0

  function selectAnswer(value: AnswerValue) {
    setAnswers(prev => {
      const next = [...prev]
      next[currentIndex] = value
      return next
    })
    if (!emergencyShown && currentQ && isCriticalTrigger(currentQ.id, value)) {
      setShowEmergency(true)
      setEmergencyShown(true)
    }
  }

  function goPrev() {
    if (isFirst) return
    setDirection(-1)
    setCurrentIndex(i => i - 1)
  }

  function goNext() {
    if (currentAnswer === null) return
    if (isLast) { void submit(); return }
    setDirection(1)
    setCurrentIndex(i => i + 1)
  }

  async function submit() {
    const finalAnswers: Answer[] = questions.map((q, idx) => ({
      questionId: q.id,
      value:      (answers[idx] ?? 1) as AnswerValue,
    }))
    setAnalyzing(true)
    const fuzzyResult = fuzzyAnalyze(finalAnswers)
    const [{ data, error }] = await Promise.all([
      saveScreening({
        fuzzyResult,
        answers:           finalAnswers,
        screeningType:     retestParentId ? 'retest' : 'initial',
        parentScreeningId: retestParentId,
      }),
      new Promise<void>(resolve => setTimeout(resolve, 2500)),
    ])
    if (error || !data) {
      setAnalyzing(false)
      toast.error(error ?? 'Gagal menyimpan hasil skrining')
      return
    }
    navigate(`/result/${data.id}`, { replace: true })
  }

  if (loadingQ) {
    return (
      <div className="app-page-shell min-h-screen flex items-center justify-center bg-bg dark:bg-dark-root">
        <div className="surface-card flex items-center gap-3 rounded-[1.5rem] px-5 py-4">
          <div className="skeleton h-10 w-10 rounded-2xl" />
          <div>
            <div className="skeleton mb-2 h-3 w-32 rounded-full" />
            <div className="skeleton h-3 w-20 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  if (analyzing) {
    return <AnalyzingScreen message={ANALYZING_MESSAGES[analyzingMsg]} />
  }

  if (!currentQ) return null

  return (
    <div className="app-page-shell min-h-screen bg-bg dark:bg-dark-root pb-24">
      <div className="sticky top-0 z-20 bg-surface/90 dark:bg-dark-root/90 backdrop-blur-xl border-b border-border-light dark:border-border-dark">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setShowCancel(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-red transition-colors"
            >
              <X size={14} strokeWidth={2.5} />
              Batal
            </button>
            <span className="text-xs font-semibold text-text-muted dark:text-[#8EA8A5]">
              Pertanyaan {currentIndex + 1} dari {total}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-border-light dark:bg-border-dark overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={spring}
            />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <DimensionBadge dimension={currentQ.dimension} />

            <h2 className="font-bold text-lg text-text-dark dark:text-white leading-snug mb-1">
              {currentQ.text}
            </h2>
            <p className="text-xs text-text-muted dark:text-[#8EA8A5] mb-6">
              Seberapa sering kamu mengalaminya dalam 2 minggu terakhir?
            </p>

            <div className="space-y-3">
              {ANSWER_OPTIONS.map((opt, idx) => {
                const selected = currentAnswer === opt.value
                return (
                  <motion.button
                    type="button"
                    key={opt.value}
                    onClick={() => selectAnswer(opt.value)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: idx * 0.05 }}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'w-full text-left px-4 py-3.5 rounded-2xl border transition-colors flex items-center gap-3 shadow-sm',
                      selected
                        ? 'border-primary bg-primary/10 dark:bg-primary/15'
                        : 'bg-surface/90 dark:bg-dark-card/80 border-border-light dark:border-border-dark hover:border-primary/50',
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        'font-semibold text-sm transition-colors',
                        selected ? 'text-primary' : 'text-text-dark dark:text-white',
                      )}>
                        {opt.label}
                      </div>
                      <div className="text-xs text-text-muted dark:text-[#8EA8A5] mt-0.5">
                        {opt.description}
                      </div>
                    </div>
                    {selected && (
                      <CircleCheck size={20} strokeWidth={2} className="text-primary shrink-0" />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between gap-3 mt-8">
          <button
            type="button"
            onClick={goPrev}
            disabled={isFirst}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark text-sm font-semibold text-text-dark dark:text-white hover:bg-white dark:hover:bg-dark-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            Kembali
          </button>

          <motion.button
            type="button"
            onClick={goNext}
            disabled={currentAnswer === null}
            whileHover={currentAnswer !== null ? { scale: 1.02 } : undefined}
            whileTap={currentAnswer !== null ? { scale: 0.98 } : undefined}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-lg shadow-primary/15 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isLast ? 'Selesai' : 'Lanjut'}
            <ArrowRight size={16} strokeWidth={2} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showCancel && (
          <CancelModal
            onCancel={() => setShowCancel(false)}
            onConfirm={() => navigate('/dashboard')}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function DimensionBadge({ dimension }: { dimension: DimensionKey }) {
  const meta = DIMENSION_LABELS[dimension]
  const Icon = DIMENSION_ICONS[dimension]
  return (
    <div className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-lg mb-4', meta.bgColor)}>
      <Icon size={14} strokeWidth={2} className="shrink-0" style={{ color: meta.color }} />
      <span className="text-xs font-bold" style={{ color: meta.color }}>{meta.label}</span>
    </div>
  )
}

function EmergencyModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      {...modalBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        {...modalCard}
        className="surface-card rounded-3xl p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red/10 mx-auto mb-4">
          <TriangleAlert size={28} strokeWidth={2} className="text-red" />
        </div>
        <h3 className="text-xl font-black text-text-dark dark:text-white text-center mb-2">
          Kami Peduli Denganmu
        </h3>
        <p className="text-sm text-text-muted dark:text-[#8EA8A5] text-center leading-relaxed mb-5">
          Kami melihat kamu mungkin sedang mengalami masa yang sangat berat.
          Bantuan selalu tersedia untukmu. Kamu tidak sendirian.
        </p>
        <a
          href="tel:119"
          className="flex items-center gap-3 bg-red/10 hover:bg-red/15 rounded-xl p-3.5 mb-4 transition-colors"
        >
          <div className="p-2 bg-red/15 rounded-lg">
            <Phone size={18} strokeWidth={2} className="text-red" />
          </div>
          <div>
            <div className="font-bold text-sm text-text-dark dark:text-white">119 ext 8</div>
            <div className="text-xs text-text-muted dark:text-[#8EA8A5]">Hotline Nasional Kesehatan Jiwa</div>
          </div>
        </a>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl border border-border-light dark:border-border-dark text-sm font-semibold text-text-dark dark:text-white hover:bg-bg dark:hover:bg-dark-hover transition-colors"
        >
          Saya baik-baik saja, lanjutkan
        </button>
      </motion.div>
    </motion.div>
  )
}

function CancelModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <motion.div
      {...modalBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        {...modalCard}
        className="surface-card rounded-3xl p-6 max-w-sm w-full shadow-2xl"
      >
        <h3 className="text-lg font-black text-text-dark dark:text-white mb-2">Batalkan skrining?</h3>
        <p className="text-sm text-text-muted dark:text-[#8EA8A5] leading-relaxed mb-5">
          Jawabanmu sejauh ini tidak akan disimpan.
        </p>
        <div className="flex gap-2">
          <button
            type="button" onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-border-light dark:border-border-dark text-sm font-semibold text-text-dark dark:text-white hover:bg-bg dark:hover:bg-dark-hover transition-colors"
          >
            Lanjutkan
          </button>
          <button
            type="button" onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red hover:bg-red/90 text-white text-sm font-bold transition-colors"
          >
            Ya, batalkan
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function AnalyzingScreen({ message }: { message: string }) {
  return (
    <div className="app-page-shell fixed inset-0 z-40 flex flex-col items-center justify-center bg-bg dark:bg-dark-root px-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, ease: 'linear', repeat: Infinity }}
        className="mb-6"
      >
        <Brain size={56} strokeWidth={1.5} className="text-primary" />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="text-base font-semibold text-text-dark dark:text-white text-center mb-3"
        >
          {message}
        </motion.p>
      </AnimatePresence>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ y: [0, -8, 0], opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  )
}
