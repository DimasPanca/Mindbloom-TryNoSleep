import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  Activity, Angry, ArrowRight, BookOpen, Brain, CalendarCheck, CalendarDays,
  CheckCircle2, ChevronRight, ClipboardList, Coffee, Droplets, Flame,
  Footprints, Frown, Heart, History, Inbox, Laugh, Lightbulb,
  Meh, Moon, Music, PhoneCall, RefreshCw, Smile, Sparkles, Sun,
  TrendingUp, Users, Wind, Zap,
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip,
  XAxis, YAxis,
} from 'recharts'
import { toast } from 'sonner'
import AnimatedNumber from '@/components/AnimatedNumber'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/contexts/ProfileContext'
import { hoverLift, spring } from '@/lib/motion'
import {
  getDashboardStats,
  getLatestScreening,
  getScreeningHistory,
  getTodayMoodCheckin,
  saveMoodCheckin,
} from '@/lib/storage'
import {
  buildFuzzyProfile,
  deriveDailyTasks,
  dominantFactors,
  rankRecommendations,
  severitySummary,
} from '@/lib/recommendations'
import type { DailyTask, ScoredRecommendation } from '@/lib/recommendations'
import {
  completionPercent,
  loadDailyState,
  syncDailyTasks,
  toggleTaskCompletion,
} from '@/lib/dailyTasks'
import type { DailyTaskState } from '@/lib/dailyTasks'
import { cn } from '@/lib/utils'
import { DIMENSION_LABELS, MOOD_CONFIG, SEVERITY_CONFIG } from '@/types'
import type { ComponentType } from 'react'
import type { DashboardStats, DimensionKey, MoodCheckin, MoodLevel, Screening } from '@/types'

const MOOD_ICONS = {
  buruk:       Angry,
  kurang:      Frown,
  biasa:       Meh,
  baik:        Smile,
  sangat_baik: Laugh,
} as const

const MOOD_ORDER: MoodLevel[] = ['buruk', 'kurang', 'biasa', 'baik', 'sangat_baik']

const RECOMMENDATION_ICONS: Record<string, ComponentType<{ size?: number; strokeWidth?: number; className?: string; style?: React.CSSProperties }>> = {
  Moon:       Moon,
  Brain:      Brain,
  Wind:       Wind,
  Heart:      Heart,
  Users:      Users,
  Sun:        Sun,
  BookOpen:   BookOpen,
  Footprints: Footprints,
  Coffee:     Coffee,
  Sparkles:   Sparkles,
  PhoneCall:  PhoneCall,
  Droplets:   Droplets,
  Music:      Music,
}

const DIMENSION_ICONS: Record<DimensionKey, ComponentType<{ size?: number; strokeWidth?: number; className?: string; style?: React.CSSProperties }>> = {
  mood:    Heart,
  sleep:   Moon,
  energy:  Zap,
  social:  Users,
  anxiety: Activity,
}

const SEVERITY_GRADIENT: Record<string, string> = {
  normal: 'linear-gradient(135deg, #173E37 0%, #2AAFA0 45%, #6FC68C 100%)',
  ringan: 'linear-gradient(135deg, #3D2A0D 0%, #B98427 45%, #F2C66A 100%)',
  sedang: 'linear-gradient(135deg, #3D1F12 0%, #B65A35 45%, #F0A26B 100%)',
  berat:  'linear-gradient(135deg, #3D1422 0%, #A33B33 45%, #ED7066 100%)',
}

function formatIdDate(d: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(iso))
}

function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

function relativeDay(iso: string): string {
  const days = daysSince(iso)
  if (days === 0) return 'Hari ini'
  if (days === 1) return 'Kemarin'
  if (days < 7) return `${days} hari lalu`
  if (days < 30) return `${Math.floor(days / 7)} minggu lalu`
  return `${Math.floor(days / 30)} bulan lalu`
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { profile } = useProfile()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [latestScreening, setLatestScreening] = useState<Screening | null>(null)
  const [history, setHistory] = useState<Screening[]>([])
  const [todayMood, setTodayMood] = useState<MoodCheckin | null>(null)
  const [savingMood, setSavingMood] = useState(false)
  const [dailyState, setDailyState] = useState<DailyTaskState | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true })
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function fetchAll() {
      setLoading(true)
      const [statsRes, latestRes, historyRes, moodRes] = await Promise.all([
        getDashboardStats(),
        getLatestScreening(),
        getScreeningHistory(7),
        getTodayMoodCheckin(),
      ])
      if (cancelled) return

      setStats(statsRes.data)
      setLatestScreening(latestRes.data)
      setHistory(historyRes.data)
      setTodayMood(moodRes.data)
      setLoading(false)
    }

    void fetchAll()
    return () => { cancelled = true }
  }, [user])

  const fuzzyProfile = useMemo(() => {
    return latestScreening ? buildFuzzyProfile(latestScreening.factor_scores) : null
  }, [latestScreening])

  const recommendations: ScoredRecommendation[] = useMemo(() => {
    if (!fuzzyProfile) return []
    return rankRecommendations(fuzzyProfile, 4, 0.15)
  }, [fuzzyProfile])

  const insightLine = useMemo(() => {
    return fuzzyProfile ? severitySummary(fuzzyProfile) : ''
  }, [fuzzyProfile])

  const dailyTasks: DailyTask[] = useMemo(() => {
    if (!latestScreening) return []
    return deriveDailyTasks(latestScreening.factor_scores, latestScreening.severity)
  }, [latestScreening])

  useEffect(() => {
    if (dailyTasks.length === 0) {
      const existing = loadDailyState()
      setDailyState(existing)
      return
    }
    const synced = syncDailyTasks(dailyTasks, latestScreening?.id ?? null)
    setDailyState(synced)
  }, [dailyTasks, latestScreening?.id])

  async function handleMoodSelect(mood: MoodLevel) {
    if (savingMood || todayMood) return
    setSavingMood(true)
    const { data, error } = await saveMoodCheckin(mood)
    setSavingMood(false)
    if (error) {
      toast.error(error)
      return
    }
    if (data) {
      setTodayMood(data)
      const { data: refreshed } = await getDashboardStats()
      if (refreshed) setStats(refreshed)
      toast.success('Mood tersimpan')
    }
  }

  function handleToggleTask(taskId: string) {
    if (!dailyState) return
    const next = toggleTaskCompletion(dailyState, taskId)
    setDailyState(next)
    if (next.completed.length === next.tasks.length && next.tasks.length > 0) {
      toast.success('Semua task hari ini selesai. Hebat.')
    }
  }

  if (authLoading || !user) return null

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-9 space-y-6">
        <motion.section
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="mb-2 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black text-primary">
              Ruang harianmu
            </p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-text-dark dark:text-[#F3F0E8]">
              Halo, {profile?.name ?? 'teman'}
            </h1>
            <p className="mt-1 text-sm font-semibold capitalize text-text-muted dark:text-[#9EB4AC]">
              {formatIdDate(new Date())}
            </p>
          </div>
          <Link
            to="/screening"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-text-dark px-5 py-3 text-sm font-black text-white shadow-lg shadow-text-dark/10 transition-colors hover:bg-primary-dark dark:bg-white dark:text-text-dark dark:hover:bg-cream"
          >
            Mulai skrining
            <ArrowRight size={16} strokeWidth={2.4} />
          </Link>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.08 }}
          whileHover={hoverLift}
          className="relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#2AAFA0_0%,#62B16E_58%,#DCEAD2_140%)] bg-[length:160%_160%] p-6 shadow-xl shadow-primary/10 animate-soft-gradient"
        >
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-24 left-12 h-44 w-44 rounded-full bg-yellow/20 blur-3xl" />
          <h2 className="relative mb-4 text-lg font-black text-white">
            Bagaimana perasaanmu hari ini?
          </h2>

          {todayMood ? (
            <div className="relative flex flex-wrap items-center gap-2 text-white/95">
              <CheckCircle2 size={20} strokeWidth={2} />
              <span className="font-semibold">Check-in hari ini selesai</span>
              <span className="text-white/75">- {MOOD_CONFIG[todayMood.mood].label}</span>
            </div>
          ) : (
            <div className="relative grid grid-cols-5 gap-2">
              {MOOD_ORDER.map((mood, idx) => {
                const Icon = MOOD_ICONS[mood]
                const meta = MOOD_CONFIG[mood]
                const disabled = savingMood
                return (
                  <motion.button
                    key={mood}
                    onClick={() => handleMoodSelect(mood)}
                    disabled={disabled}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.12 + idx * 0.06 }}
                    whileHover={disabled ? undefined : { scale: 1.08 }}
                    whileTap={disabled ? undefined : { scale: 0.95 }}
                    aria-label={meta.label}
                    className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border border-white/20 bg-white/20 p-3 text-center shadow-sm backdrop-blur transition-colors hover:bg-white/30 disabled:opacity-60"
                  >
                    <Icon size={24} strokeWidth={1.75} className="text-white" />
                    <span className="text-[10px] font-bold text-white/90">
                      {meta.label.split(' ')[0]}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.16 }}
        >
          {loading ? (
            <SkeletonCard height="h-56" />
          ) : (
            <LatestResultHero latestScreening={latestScreening} insightLine={insightLine} />
          )}
        </motion.section>

        {!loading && latestScreening && dailyState && dailyTasks.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.22 }}
            className="surface-card rounded-[1.75rem] p-5 sm:p-6"
          >
            <DailyTasksPanel
              state={dailyState}
              onToggle={handleToggleTask}
              severity={latestScreening.severity}
            />
          </motion.section>
        )}

        {!loading && latestScreening && recommendations.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.26 }}
            className="surface-card rounded-[1.75rem] p-5 sm:p-6"
          >
            <RecommendationsPanel
              recommendations={recommendations}
              factorScores={latestScreening.factor_scores}
              interventionId={latestScreening.id}
              severity={latestScreening.severity}
            />
          </motion.section>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            index={0}
            label="Skor Terakhir"
            value={stats?.latestScore ?? null}
            decimals={1}
            iconBg="bg-primary/10"
            icon={<TrendingUp size={20} strokeWidth={1.75} className="text-primary" />}
            loading={loading}
          />
          <StatCard
            index={1}
            label="Streak Check-in"
            value={stats?.streakDays ?? 0}
            iconBg="bg-yellow/10 dark:bg-yellow/15"
            icon={<Flame size={20} strokeWidth={1.75} className="text-yellow" />}
            loading={loading}
            suffix=" hari"
          />
          <StatCard
            index={2}
            label="Total Skrining"
            value={stats?.totalScreenings ?? 0}
            iconBg="bg-green/10 dark:bg-green/15"
            icon={<CalendarCheck size={20} strokeWidth={1.75} className="text-green" />}
            loading={loading}
          />
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.34 }}
          whileHover={hoverLift}
        >
          <Link
            to="/mood-calendar"
            className="group relative flex items-center gap-4 overflow-hidden rounded-[1.75rem] border border-primary/20 bg-gradient-to-r from-primary/8 to-primary/4 p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 dark:from-primary/12 dark:to-primary/6"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/15">
              <CalendarDays size={24} strokeWidth={1.8} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black text-text-dark dark:text-white">Kalender Mood</div>
              <div className="text-xs font-semibold text-text-muted dark:text-[#9EB4AC]">
                Lihat pola mood harianmu dan temukan insight
              </div>
            </div>
            <ChevronRight size={20} strokeWidth={2} className="text-primary shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.section>

        {!loading && history.length >= 2 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.36 }}
            whileHover={hoverLift}
            className="surface-card rounded-[1.75rem] p-5"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={20} strokeWidth={1.75} className="text-primary" />
                <h2 className="font-black text-text-dark dark:text-white">Tren Skor</h2>
              </div>
              <Link to="/history" className="text-xs font-black text-primary hover:underline">
                Lihat riwayat
              </Link>
            </div>
            <TrendChart history={history} />
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.42 }}
          className="surface-card rounded-[1.75rem] p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <History size={20} strokeWidth={1.75} className="text-primary" />
              <h2 className="font-black text-text-dark dark:text-white">Riwayat Terkini</h2>
            </div>
            <Link to="/history" className="text-xs font-black text-primary hover:underline">
              Semua
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton h-20 rounded-2xl" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10">
              <Inbox size={48} strokeWidth={1.25} className="mx-auto mb-3 text-[#9E9D9A] dark:text-[#57726A]" />
              <p className="font-semibold text-text-muted dark:text-[#9EB4AC]">
                Belum ada riwayat skrining
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {history.slice(0, 5).map((s, i) => (
                <HistoryListItem key={s.id} screening={s} delay={0.48 + i * 0.06} />
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </Layout>
  )
}

function SkeletonCard({ height }: { height: string }) {
  return <div className={cn('skeleton rounded-[1.75rem]', height)} />
}

function LatestResultHero({
  latestScreening,
  insightLine,
}: {
  latestScreening: Screening | null
  insightLine: string
}) {
  if (!latestScreening) {
    return (
      <motion.div
        whileHover={hoverLift}
        className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-text-dark via-primary-dark to-primary p-6 text-white shadow-xl shadow-primary/10"
      >
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/16 blur-3xl" />
        <ClipboardList size={40} strokeWidth={1.5} className="relative mb-3" />
        <h2 className="relative mb-1 text-xl font-black">Mulai Perjalananmu</h2>
        <p className="relative mb-4 max-w-xl text-sm font-semibold text-white/85">
          Kenali kondisi kesehatan mental Anda dengan skrining pertama yang privat dan terarah.
        </p>
        <Link
          to="/screening"
          className="relative inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-primary-dark transition-colors hover:bg-cream"
        >
          Mulai Skrining
          <ArrowRight size={16} strokeWidth={2.5} />
        </Link>
      </motion.div>
    )
  }

  const days = daysSince(latestScreening.created_at)

  if (days >= 7) {
    return (
      <motion.div
        whileHover={hoverLift}
        className="rounded-[1.75rem] border border-yellow/30 bg-[#FFF4DE]/90 p-6 shadow-lg shadow-yellow/10 dark:bg-[#2B230F]/85"
      >
        <RefreshCw size={38} strokeWidth={1.5} className="mb-3 text-yellow" />
        <h2 className="mb-1 text-xl font-black text-text-dark dark:text-white">
          Sudah {days} hari sejak skrining terakhir
        </h2>
        <p className="mb-4 text-sm font-semibold text-text-muted dark:text-[#D5C69B]">
          Yuk perbarui kondisimu hari ini.
        </p>
        <Link
          to="/screening"
          className="inline-flex items-center gap-2 rounded-2xl bg-yellow px-5 py-3 text-sm font-black text-white transition-opacity hover:opacity-90"
        >
          Skrining Ulang
          <ArrowRight size={16} strokeWidth={2.5} />
        </Link>
      </motion.div>
    )
  }

  const meta = SEVERITY_CONFIG[latestScreening.severity]
  const gradient = SEVERITY_GRADIENT[latestScreening.severity] ?? SEVERITY_GRADIENT.normal
  const weakDims = dominantFactors(latestScreening.factor_scores, 2)

  return (
    <motion.div
      whileHover={hoverLift}
      className="relative overflow-hidden rounded-[1.75rem] p-6 sm:p-7 text-white shadow-2xl shadow-text-dark/20"
      style={{ background: gradient }}
    >
      <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
      <div className="absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-black/10 blur-3xl" />
      <div className="absolute top-6 right-6 hidden sm:block opacity-25">
        <Sparkles size={36} strokeWidth={1.5} />
      </div>

      <div className="relative grid gap-6 sm:grid-cols-[auto_1fr] items-center">
        <div className="flex flex-col items-start gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur">
            <CalendarCheck size={12} strokeWidth={2.5} />
            {relativeDay(latestScreening.created_at)} · {formatShortDate(latestScreening.created_at)}
          </span>
          <div className="flex items-end gap-3">
            <span className="text-6xl sm:text-7xl font-black leading-none tabular-nums">
              {latestScreening.fuzzy_score.toFixed(0)}
            </span>
            <div className="pb-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Dari 100</div>
              <div className="text-lg font-black leading-tight">{meta.label}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black leading-tight">{meta.headline}</h2>
          <p className="text-sm font-semibold leading-relaxed opacity-90">
            {insightLine || meta.description}
          </p>
          {weakDims.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {weakDims.map(dim => {
                const dmeta = DIMENSION_LABELS[dim]
                const score = Math.round(latestScreening.factor_scores[dim] ?? 0)
                const Icon = DIMENSION_ICONS[dim]
                return (
                  <span
                    key={dim}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/18 px-2.5 py-1 text-[11px] font-black backdrop-blur"
                  >
                    <Icon size={12} strokeWidth={2.5} />
                    {dmeta.label}
                    <span className="rounded-md bg-black/20 px-1.5 py-0.5 tabular-nums">{score}</span>
                  </span>
                )
              })}
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              to={`/result/${latestScreening.id}`}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-text-dark transition-colors hover:bg-cream"
            >
              Lihat detail
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
            {latestScreening.severity !== 'normal' && (
              <Link
                to={`/intervention/${latestScreening.id}`}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-white/30 bg-white/15 px-4 py-2.5 text-sm font-black text-white backdrop-blur transition-colors hover:bg-white/25"
              >
                <Brain size={14} strokeWidth={2.4} />
                Intervensi
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function DailyTasksPanel({
  state,
  onToggle,
  severity,
}: {
  state: DailyTaskState
  onToggle: (id: string) => void
  severity: Screening['severity']
}) {
  const percent = completionPercent(state)
  const sevMeta = SEVERITY_CONFIG[severity]

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarCheck size={20} strokeWidth={1.75} className="text-primary" />
          <div>
            <h2 className="font-black text-text-dark dark:text-white">Task Harian</h2>
            <p className="text-[11px] font-bold text-text-muted dark:text-[#9EB4AC]">
              Dipersonalisasi dari hasil skrining terakhir
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black tabular-nums text-text-dark dark:text-white">{percent}%</div>
          <div className="text-[11px] font-bold text-text-muted dark:text-[#9EB4AC]">
            {state.completed.length}/{state.tasks.length} selesai
          </div>
        </div>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-border-light dark:bg-border-dark">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${sevMeta.accentColor}, ${sevMeta.accentColor}AA)`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {state.tasks.map((task, idx) => {
          const isDone = state.completed.includes(task.id)
          const Icon = RECOMMENDATION_ICONS[task.iconName] ?? Sparkles
          const dmeta = DIMENSION_LABELS[task.dimension]
          return (
            <motion.button
              key={task.id}
              type="button"
              onClick={() => onToggle(task.id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.05 + idx * 0.06 }}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className={cn(
                'group relative flex items-start gap-3 overflow-hidden rounded-2xl border p-3.5 text-left transition-all',
                isDone
                  ? 'border-primary/40 bg-primary/8 dark:bg-primary/15'
                  : 'border-border-light bg-white hover:border-primary/40 dark:border-border-dark dark:bg-dark-card dark:hover:border-primary/40',
              )}
            >
              <div
                className={cn(
                  'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition-colors',
                  isDone ? 'border-primary bg-primary text-white' : 'border-border-light dark:border-border-dark',
                )}
              >
                {isDone && <CheckCircle2 size={14} strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={14} strokeWidth={2} style={{ color: dmeta.color }} />
                  <span
                    className="text-[10px] font-black uppercase tracking-wider"
                    style={{ color: dmeta.color }}
                  >
                    {dmeta.label}
                  </span>
                  <span className="text-[10px] font-bold text-text-muted dark:text-[#9EB4AC]">
                    · {task.estimatedMinutes}m
                  </span>
                </div>
                <div
                  className={cn(
                    'text-sm font-black leading-snug',
                    isDone
                      ? 'text-text-muted line-through dark:text-[#9EB4AC]'
                      : 'text-text-dark dark:text-white',
                  )}
                >
                  {task.title}
                </div>
                <div className="mt-1 text-[11px] font-semibold leading-snug text-text-muted dark:text-[#9EB4AC]">
                  {task.hint}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function RecommendationsPanel({
  recommendations,
  factorScores,
  interventionId,
  severity,
}: {
  recommendations: ScoredRecommendation[]
  factorScores: Screening['factor_scores']
  interventionId: string
  severity: Screening['severity']
}) {
  const weakDims = dominantFactors(factorScores, 3)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Lightbulb size={20} strokeWidth={1.75} className="text-yellow" />
          <div>
            <h2 className="font-black text-text-dark dark:text-white">Rekomendasi Adaptif</h2>
            <p className="text-[11px] font-bold text-text-muted dark:text-[#9EB4AC]">
              Tahani fuzzy query dari profil kondisimu
            </p>
          </div>
        </div>
        {severity !== 'normal' && (
          <Link
            to={`/intervention/${interventionId}`}
            className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-primary/10 px-3 py-1.5 text-[11px] font-black text-primary hover:bg-primary/15"
          >
            Program intervensi
            <ArrowRight size={12} strokeWidth={2.5} />
          </Link>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {weakDims.map(dim => {
          const dmeta = DIMENSION_LABELS[dim]
          const score = Math.round(factorScores[dim] ?? 0)
          const Icon = DIMENSION_ICONS[dim]
          return (
            <span
              key={dim}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black"
              style={{
                backgroundColor: `${dmeta.color}1A`,
                color: dmeta.color,
              }}
            >
              <Icon size={12} strokeWidth={2.5} />
              Fokus: {dmeta.label}
              <span className="rounded-md bg-white/40 px-1 tabular-nums">{score}</span>
            </span>
          )
        })}
      </div>

      <div className="space-y-2">
        {recommendations.map((rec, idx) => {
          const Icon = RECOMMENDATION_ICONS[rec.iconName] ?? Sparkles
          const matchPct = Math.round(rec.matchDegree * 100)
          const primaryDim = rec.conditions[0]?.dimension
          const dmeta = primaryDim ? DIMENSION_LABELS[primaryDim] : null
          const accent = dmeta?.color ?? '#2AAFA0'

          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.05 + idx * 0.06 }}
              className="group relative flex items-start gap-3 overflow-hidden rounded-2xl border border-border-light bg-white/70 p-3.5 transition-all hover:border-primary/40 hover:shadow-md dark:border-border-dark dark:bg-white/5 dark:hover:border-primary/40"
            >
              <div
                className="absolute inset-y-0 left-0 w-1 rounded-l-2xl"
                style={{ backgroundColor: accent }}
              />
              <div
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                style={{ backgroundColor: `${accent}1A`, color: accent }}
              >
                <Icon size={18} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-0.5 flex items-center gap-2">
                  <span className="text-sm font-black text-text-dark dark:text-white">{rec.title}</span>
                  <span
                    className="ml-auto inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-black tabular-nums"
                    style={{
                      backgroundColor: `${accent}1A`,
                      color: accent,
                    }}
                  >
                    {matchPct}% match
                  </span>
                </div>
                <p className="text-[11px] font-semibold leading-snug text-text-muted dark:text-[#9EB4AC]">
                  {rec.reason}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold text-text-muted dark:text-[#9EB4AC]">
                  <span className="rounded-md bg-border-light/60 px-1.5 py-0.5 dark:bg-border-dark/60">
                    {rec.estimatedMinutes} menit
                  </span>
                  <span className="rounded-md bg-border-light/60 px-1.5 py-0.5 dark:bg-border-dark/60">
                    {rec.difficulty}
                  </span>
                  <span className="rounded-md bg-border-light/60 px-1.5 py-0.5 capitalize dark:bg-border-dark/60">
                    {rec.category}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {severity === 'normal' && (
        <p className="mt-4 text-[11px] font-semibold leading-relaxed text-text-muted dark:text-[#9EB4AC]">
          Kondisimu cukup baik. Rekomendasi di atas membantu menjaga kebiasaan sehat agar tetap stabil.
        </p>
      )}
    </div>
  )
}

function HistoryListItem({ screening, delay }: { screening: Screening; delay: number }) {
  const meta = SEVERITY_CONFIG[screening.severity]
  const weakDim = dominantFactors(screening.factor_scores, 1)[0]
  const weakMeta = weakDim ? DIMENSION_LABELS[weakDim] : null
  const weakScore = weakDim ? Math.round(screening.factor_scores[weakDim] ?? 0) : 0
  const Icon = weakDim ? DIMENSION_ICONS[weakDim] : Activity

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...spring, delay }}
    >
      <Link
        to={`/result/${screening.id}`}
        className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border-light bg-white/80 px-3.5 py-3 transition-all hover:border-primary/40 hover:shadow-md dark:border-border-dark dark:bg-white/5 dark:hover:border-primary/40"
      >
        <span
          className="absolute inset-y-0 left-0 w-1 rounded-l-2xl"
          style={{ backgroundColor: meta.accentColor }}
          aria-hidden="true"
        />
        <div
          className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${meta.accentColor}, ${meta.accentColor}CC)`,
          }}
        >
          <span className="text-lg font-black tabular-nums leading-none">
            {screening.fuzzy_score.toFixed(0)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-1.5">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-black"
              style={{
                backgroundColor: `${meta.accentColor}1A`,
                color: meta.accentColor,
              }}
            >
              {meta.label}
            </span>
            {weakMeta && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black"
                style={{
                  backgroundColor: `${weakMeta.color}14`,
                  color: weakMeta.color,
                }}
              >
                <Icon size={10} strokeWidth={2.5} />
                {weakMeta.label}
                <span className="tabular-nums opacity-75">{weakScore}</span>
              </span>
            )}
            {screening.self_harm_flag && (
              <span className="rounded-full bg-red/10 px-2 py-0.5 text-[10px] font-black text-red">
                Risiko tinggi
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-text-muted dark:text-[#9EB4AC]">
            <span>{relativeDay(screening.created_at)}</span>
            <span className="text-text-muted/40">·</span>
            <span>{formatShortDate(screening.created_at)}</span>
            {screening.screening_type === 'retest' && (
              <>
                <span className="text-text-muted/40">·</span>
                <span className="inline-flex items-center gap-0.5 text-yellow">
                  <RefreshCw size={10} strokeWidth={2.5} />
                  Ulang
                </span>
              </>
            )}
          </div>
        </div>

        <ChevronRight size={18} strokeWidth={2.2} className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 dark:text-[#9EB4AC]" />
      </Link>
    </motion.div>
  )
}

function StatCard({
  index,
  label,
  value,
  icon,
  iconBg,
  decimals = 0,
  suffix = '',
  loading,
}: {
  index: number
  label: string
  value: number | null
  icon: React.ReactNode
  iconBg: string
  decimals?: number
  suffix?: string
  loading: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.32 + index * 0.07 }}
      whileHover={hoverLift}
      className="surface-card rounded-[1.5rem] p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <div className={cn('rounded-xl p-2', iconBg)}>
          {icon}
        </div>
        <span className="text-xs font-black text-text-muted dark:text-[#9EB4AC]">
          {label}
        </span>
      </div>
      {loading ? (
        <div className="skeleton mt-1 h-8 w-16 rounded-lg" />
      ) : value === null ? (
        <p className="text-2xl font-black text-text-dark dark:text-white">-</p>
      ) : (
        <p className="text-3xl font-black tabular-nums text-text-dark dark:text-white">
          <AnimatedNumber value={value} decimals={decimals} />
          {suffix && <span className="ml-1 text-base font-black text-text-muted dark:text-[#9EB4AC]">{suffix}</span>}
        </p>
      )}
    </motion.div>
  )
}

function TrendChart({ history }: { history: Screening[] }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const axisColor = isDark ? '#9EB4AC' : '#6E746B'
  const gridColor = isDark ? '#23483F' : '#E8DED0'

  const data = [...history]
    .reverse()
    .map(s => ({ date: formatShortDate(s.created_at), score: Number(s.fuzzy_score.toFixed(1)) }))

  return (
    <ResponsiveContainer width="100%" height={210}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="teal-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2AAFA0" stopOpacity={0.38} />
            <stop offset="100%" stopColor="#2AAFA0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: axisColor, fontFamily: 'Nunito', fontWeight: 800 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: axisColor, fontFamily: 'Nunito', fontWeight: 800 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#2AAFA0"
          strokeWidth={3}
          fill="url(#teal-fade)"
          isAnimationActive
          animationBegin={250}
          animationDuration={1400}
          animationEasing="ease-in-out"
          dot={{ r: 4, strokeWidth: 2, fill: isDark ? '#122A24' : '#FFFDF7', stroke: '#2AAFA0' }}
          activeDot={{ r: 6, strokeWidth: 2, fill: '#2AAFA0', stroke: '#FFFDF7' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

interface TooltipPayload {
  value: number
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-2xl border border-border-light bg-surface px-3 py-2 shadow-xl dark:border-border-dark dark:bg-dark-card">
      <p className="text-xs font-bold text-text-muted dark:text-[#9EB4AC]">{label}</p>
      <p className="text-sm font-black tabular-nums text-text-dark dark:text-white">
        Skor: {payload[0].value}
      </p>
    </div>
  )
}
