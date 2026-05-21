import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Angry, ArrowLeft, CalendarDays, ChevronLeft, ChevronRight,
  Flame, Frown, Laugh, Meh, Smile, TrendingDown, TrendingUp,
} from 'lucide-react'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { getMoodCheckins, getTodayMoodCheckin, saveMoodCheckin } from '@/lib/storage'
import { hoverLift, spring } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { MOOD_CONFIG } from '@/types'
import type { MoodCheckin, MoodLevel } from '@/types'
import { toast } from 'sonner'
import type { ComponentType, CSSProperties } from 'react'

const MOOD_ICONS: Record<MoodLevel, ComponentType<{ size?: number; strokeWidth?: number; className?: string; style?: CSSProperties }>> = {
  buruk: Angry,
  kurang: Frown,
  biasa: Meh,
  baik: Smile,
  sangat_baik: Laugh,
}

const MOOD_ORDER: MoodLevel[] = ['buruk', 'kurang', 'biasa', 'baik', 'sangat_baik']

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const DAY_NAMES_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function moodValue(m: MoodLevel): number {
  return MOOD_CONFIG[m].value
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

interface CalendarDay {
  date: Date
  inMonth: boolean
  isToday: boolean
  isFuture: boolean
  mood: MoodLevel | null
}

function buildCalendar(year: number, month: number, moodMap: Map<string, MoodLevel>): CalendarDay[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const firstDay = new Date(year, month, 1)
  const startDow = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: CalendarDay[] = []

  for (let i = 0; i < startDow; i++) {
    const d = new Date(year, month, -startDow + i + 1)
    cells.push({ date: d, inMonth: false, isToday: false, isFuture: d > today, mood: moodMap.get(dateKey(d)) ?? null })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day)
    d.setHours(0, 0, 0, 0)
    cells.push({
      date: d,
      inMonth: true,
      isToday: isSameDay(d, today),
      isFuture: d > today,
      mood: moodMap.get(dateKey(d)) ?? null,
    })
  }

  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i)
      cells.push({ date: d, inMonth: false, isToday: false, isFuture: d > today, mood: moodMap.get(dateKey(d)) ?? null })
    }
  }

  return cells
}

interface DayPattern {
  day: number
  dayName: string
  avgMood: number
  count: number
}

function analyzeDayPatterns(checkins: MoodCheckin[]): DayPattern[] {
  const buckets: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
  for (const c of checkins) {
    const dow = new Date(c.created_at).getDay()
    buckets[dow].push(moodValue(c.mood))
  }
  return Object.entries(buckets)
    .map(([d, vals]) => ({
      day: Number(d),
      dayName: DAY_NAMES_FULL[Number(d)],
      avgMood: vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0,
      count: vals.length,
    }))
    .filter(p => p.count > 0)
    .sort((a, b) => a.day - b.day)
}

function calcStreak(moodMap: Map<string, MoodLevel>): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let cursor = new Date(today)
  if (!moodMap.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }
  let streak = 0
  while (moodMap.has(dateKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export default function MoodCalendarPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [checkins, setCheckins] = useState<MoodCheckin[]>([])
  const [loading, setLoading] = useState(true)
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth())
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)
  const [todayMood, setTodayMood] = useState<MoodCheckin | null>(null)
  const [savingMood, setSavingMood] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true })
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    async function load() {
      setLoading(true)
      const [checkinsRes, todayRes] = await Promise.all([
        getMoodCheckins(180),
        getTodayMoodCheckin(),
      ])
      if (cancelled) return
      setCheckins(checkinsRes.data)
      setTodayMood(todayRes.data)
      setLoading(false)
    }
    void load()
    return () => { cancelled = true }
  }, [user])

  const moodMap = useMemo(() => {
    const map = new Map<string, MoodLevel>()
    for (const c of checkins) {
      const key = dateKey(new Date(c.created_at))
      if (!map.has(key)) map.set(key, c.mood)
    }
    return map
  }, [checkins])

  const calendar = useMemo(() => buildCalendar(viewYear, viewMonth, moodMap), [viewYear, viewMonth, moodMap])

  const dayPatterns = useMemo(() => analyzeDayPatterns(checkins), [checkins])

  const streak = useMemo(() => calcStreak(moodMap), [moodMap])

  const monthCheckins = useMemo(() => {
    return checkins.filter(c => {
      const d = new Date(c.created_at)
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth
    })
  }, [checkins, viewYear, viewMonth])

  const monthAvg = useMemo(() => {
    if (monthCheckins.length === 0) return null
    const sum = monthCheckins.reduce((a, c) => a + moodValue(c.mood), 0)
    return sum / monthCheckins.length
  }, [monthCheckins])

  const worstDay = useMemo(() => {
    const withData = dayPatterns.filter(p => p.count >= 2)
    if (withData.length === 0) return null
    return withData.reduce((a, b) => (a.avgMood < b.avgMood ? a : b))
  }, [dayPatterns])

  const bestDay = useMemo(() => {
    const withData = dayPatterns.filter(p => p.count >= 2)
    if (withData.length === 0) return null
    return withData.reduce((a, b) => (a.avgMood > b.avgMood ? a : b))
  }, [dayPatterns])

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(y => y - 1)
    } else {
      setViewMonth(m => m - 1)
    }
    setSelectedDay(null)
  }

  function nextMonth() {
    const now = new Date()
    if (viewYear === now.getFullYear() && viewMonth >= now.getMonth()) return
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(y => y + 1)
    } else {
      setViewMonth(m => m + 1)
    }
    setSelectedDay(null)
  }

  async function handleCheckin(mood: MoodLevel) {
    if (savingMood || todayMood) return
    setSavingMood(true)
    const { data, error } = await saveMoodCheckin(mood)
    setSavingMood(false)
    if (error) { toast.error(error); return }
    if (data) {
      setTodayMood(data)
      setCheckins(prev => [data, ...prev])
      toast.success('Mood tersimpan')
    }
  }

  const now = new Date()
  const canGoNext = !(viewYear === now.getFullYear() && viewMonth >= now.getMonth())

  if (authLoading || !user) return null

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-9 space-y-5">
        <motion.header
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <Link
            to="/dashboard"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-text-dark dark:text-[#8EA8A5] dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10">
              <CalendarDays size={22} strokeWidth={1.8} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-text-dark dark:text-white">Kalender Mood</h1>
              <p className="text-sm font-semibold text-text-muted dark:text-[#8EA8A5]">
                Tracking mood harianmu dan temukan pola
              </p>
            </div>
          </div>
        </motion.header>

        {!todayMood && !loading && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.06 }}
            className="relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#2AAFA0_0%,#62B16E_58%,#DCEAD2_140%)] p-5 shadow-xl shadow-primary/10"
          >
            <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
            <h2 className="relative mb-3 text-base font-black text-white">
              Bagaimana perasaanmu hari ini?
            </h2>
            <div className="relative grid grid-cols-5 gap-2">
              {MOOD_ORDER.map((mood, idx) => {
                const Icon = MOOD_ICONS[mood]
                const meta = MOOD_CONFIG[mood]
                return (
                  <motion.button
                    key={mood}
                    onClick={() => handleCheckin(mood)}
                    disabled={savingMood}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.1 + idx * 0.05 }}
                    whileHover={savingMood ? undefined : { scale: 1.08 }}
                    whileTap={savingMood ? undefined : { scale: 0.95 }}
                    className="flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-2xl border border-white/20 bg-white/20 p-2.5 backdrop-blur transition-colors hover:bg-white/30 disabled:opacity-60"
                  >
                    <Icon size={22} strokeWidth={1.75} className="text-white" />
                    <span className="text-[10px] font-bold text-white/90">{meta.label.split(' ')[0]}</span>
                  </motion.button>
                )
              })}
            </div>
          </motion.section>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            whileHover={hoverLift}
            className="surface-card rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Flame size={18} strokeWidth={1.8} className="text-yellow" />
              <span className="text-xs font-black text-text-muted dark:text-[#9EB4AC]">Streak</span>
            </div>
            <div className="text-3xl font-black tabular-nums text-text-dark dark:text-white">
              {loading ? '-' : streak}
              <span className="ml-1 text-sm font-black text-text-muted dark:text-[#9EB4AC]">hari</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.14 }}
            whileHover={hoverLift}
            className="surface-card rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} strokeWidth={1.8} className="text-primary" />
              <span className="text-xs font-black text-text-muted dark:text-[#9EB4AC]">Rata-rata Bulan Ini</span>
            </div>
            {loading || monthAvg === null ? (
              <div className="text-3xl font-black text-text-dark dark:text-white">-</div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black tabular-nums text-text-dark dark:text-white">
                  {monthAvg.toFixed(1)}
                </span>
                <span className="text-xs font-black text-text-muted dark:text-[#9EB4AC]">/ 5</span>
                {(() => {
                  const lvl = monthAvg >= 4 ? 'sangat_baik' : monthAvg >= 3 ? 'baik' : monthAvg >= 2 ? 'biasa' : 'kurang'
                  const Icon = MOOD_ICONS[lvl as MoodLevel]
                  const color = MOOD_CONFIG[lvl as MoodLevel].color
                  return <Icon size={20} strokeWidth={1.8} className="ml-auto" style={{ color }} />
                })()}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.18 }}
            whileHover={hoverLift}
            className="surface-card rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays size={18} strokeWidth={1.8} className="text-green" />
              <span className="text-xs font-black text-text-muted dark:text-[#9EB4AC]">Check-in Bulan Ini</span>
            </div>
            <div className="text-3xl font-black tabular-nums text-text-dark dark:text-white">
              {loading ? '-' : monthCheckins.length}
              <span className="ml-1 text-sm font-black text-text-muted dark:text-[#9EB4AC]">hari</span>
            </div>
          </motion.div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.22 }}
          whileHover={hoverLift}
          className="surface-card rounded-[1.75rem] p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={prevMonth}
              className="grid h-9 w-9 place-items-center rounded-xl text-text-muted hover:bg-bg hover:text-text-dark dark:hover:bg-dark-hover dark:hover:text-white transition-colors"
            >
              <ChevronLeft size={20} strokeWidth={2} />
            </button>
            <h2 className="text-base font-black text-text-dark dark:text-white">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h2>
            <button
              type="button"
              onClick={nextMonth}
              disabled={!canGoNext}
              className={cn(
                'grid h-9 w-9 place-items-center rounded-xl transition-colors',
                canGoNext
                  ? 'text-text-muted hover:bg-bg hover:text-text-dark dark:hover:bg-dark-hover dark:hover:text-white'
                  : 'text-text-muted/30 cursor-not-allowed',
              )}
            >
              <ChevronRight size={20} strokeWidth={2} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[10px] font-black uppercase tracking-wider text-text-muted dark:text-[#9EB4AC] py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendar.map((cell, i) => {
              const hasMood = cell.mood !== null
              const moodMeta = cell.mood ? MOOD_CONFIG[cell.mood] : null
              const MoodIcon = cell.mood ? MOOD_ICONS[cell.mood] : null
              const isSelected = selectedDay && isSameDay(selectedDay.date, cell.date)

              return (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => cell.inMonth && !cell.isFuture && setSelectedDay(isSelected ? null : cell)}
                  disabled={!cell.inMonth || cell.isFuture}
                  initial={false}
                  whileHover={cell.inMonth && !cell.isFuture ? { scale: 1.08 } : undefined}
                  whileTap={cell.inMonth && !cell.isFuture ? { scale: 0.94 } : undefined}
                  className={cn(
                    'relative flex flex-col items-center justify-center rounded-xl py-2 min-h-[3rem] sm:min-h-[3.5rem] transition-all',
                    !cell.inMonth && 'opacity-25',
                    cell.isFuture && cell.inMonth && 'opacity-30',
                    cell.isToday && !isSelected && 'ring-2 ring-primary/40',
                    isSelected && 'ring-2 ring-primary bg-primary/10 dark:bg-primary/15',
                    !hasMood && cell.inMonth && !cell.isFuture && 'hover:bg-bg dark:hover:bg-dark-hover',
                  )}
                  style={hasMood && !isSelected ? {
                    backgroundColor: `${moodMeta!.color}14`,
                  } : undefined}
                >
                  <span className={cn(
                    'text-[11px] font-black leading-none mb-0.5',
                    cell.isToday ? 'text-primary' : cell.inMonth ? 'text-text-dark dark:text-white' : 'text-text-muted dark:text-[#9EB4AC]',
                  )}>
                    {cell.date.getDate()}
                  </span>
                  {hasMood && MoodIcon ? (
                    <MoodIcon size={14} strokeWidth={2} style={{ color: moodMeta!.color }} />
                  ) : cell.inMonth && !cell.isFuture ? (
                    <div className="h-1.5 w-1.5 rounded-full bg-border-light dark:bg-border-dark" />
                  ) : null}
                </motion.button>
              )
            })}
          </div>

          <AnimatePresence>
            {selectedDay && selectedDay.mood && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border-light dark:border-border-dark p-3.5">
                  {(() => {
                    const meta = MOOD_CONFIG[selectedDay.mood!]
                    const Icon = MOOD_ICONS[selectedDay.mood!]
                    return (
                      <>
                        <div
                          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                          style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}
                        >
                          <Icon size={22} strokeWidth={1.8} />
                        </div>
                        <div>
                          <div className="text-sm font-black text-text-dark dark:text-white">
                            {meta.label}
                          </div>
                          <div className="text-xs font-semibold text-text-muted dark:text-[#8EA8A5]">
                            {selectedDay.date.getDate()} {MONTH_NAMES[selectedDay.date.getMonth()]} {selectedDay.date.getFullYear()}
                            {' - '}{DAY_NAMES_FULL[selectedDay.date.getDay()]}
                          </div>
                        </div>
                        <div
                          className="ml-auto rounded-full px-3 py-1 text-xs font-black"
                          style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}
                        >
                          {meta.value}/5
                        </div>
                      </>
                    )
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {MOOD_ORDER.map(mood => {
              const meta = MOOD_CONFIG[mood]
              const Icon = MOOD_ICONS[mood]
              return (
                <div key={mood} className="flex items-center gap-1.5">
                  <Icon size={12} strokeWidth={2} style={{ color: meta.color }} />
                  <span className="text-[10px] font-bold text-text-muted dark:text-[#9EB4AC]">{meta.label}</span>
                </div>
              )
            })}
          </div>
        </motion.section>

        {dayPatterns.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.3 }}
            whileHover={hoverLift}
            className="surface-card rounded-[1.75rem] p-5"
          >
            <h2 className="text-base font-black text-text-dark dark:text-white mb-1">Pola Mood per Hari</h2>
            <p className="text-xs font-semibold text-text-muted dark:text-[#8EA8A5] mb-4">
              Berdasarkan data 6 bulan terakhir
            </p>

            <div className="space-y-2.5">
              {dayPatterns.map((p, idx) => {
                const pct = (p.avgMood / 5) * 100
                const color = p.avgMood >= 4 ? '#5EA85C' : p.avgMood >= 3 ? '#2AAFA0' : p.avgMood >= 2 ? '#D9A23B' : '#E0665A'
                const isWorst = worstDay?.day === p.day
                const isBest = bestDay?.day === p.day

                return (
                  <motion.div
                    key={p.day}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...spring, delay: 0.32 + idx * 0.04 }}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-colors',
                      isWorst ? 'border-red/20 bg-red/5 dark:bg-red/10' :
                      isBest ? 'border-green/20 bg-green/5 dark:bg-green/10' :
                      'border-transparent bg-bg/60 dark:bg-dark-hover/60',
                    )}
                  >
                    <span className="w-12 text-xs font-black text-text-dark dark:text-white shrink-0">
                      {p.dayName.slice(0, 3)}
                    </span>

                    <div className="flex-1 h-2.5 rounded-full bg-border-light/80 dark:bg-border-dark/80 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.35 + idx * 0.04, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>

                    <span className="w-8 text-right text-xs font-black tabular-nums" style={{ color }}>
                      {p.avgMood.toFixed(1)}
                    </span>

                    <div className="w-5 flex items-center justify-center shrink-0">
                      {isWorst && <TrendingDown size={14} strokeWidth={2.2} className="text-red" />}
                      {isBest && <TrendingUp size={14} strokeWidth={2.2} className="text-green" />}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {(worstDay || bestDay) && (
              <div className="mt-4 space-y-2">
                {worstDay && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-red/8 border border-red/15 p-3">
                    <TrendingDown size={16} strokeWidth={2} className="text-red shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-red">
                      Hari <span className="font-black">{worstDay.dayName}</span> cenderung memiliki mood paling rendah (rata-rata {worstDay.avgMood.toFixed(1)}/5)
                    </p>
                  </div>
                )}
                {bestDay && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-green/8 border border-green/15 p-3">
                    <TrendingUp size={16} strokeWidth={2} className="text-green shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-green">
                      Hari <span className="font-black">{bestDay.dayName}</span> cenderung memiliki mood paling baik (rata-rata {bestDay.avgMood.toFixed(1)}/5)
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.section>
        )}

        {checkins.length === 0 && !loading && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.3 }}
            className="surface-card rounded-[1.75rem] p-8 text-center"
          >
            <CalendarDays size={48} strokeWidth={1.2} className="mx-auto mb-3 text-text-muted/40" />
            <h3 className="text-base font-black text-text-dark dark:text-white mb-1">Belum Ada Data</h3>
            <p className="text-sm font-semibold text-text-muted dark:text-[#8EA8A5]">
              Mulai check-in mood harianmu dari dashboard untuk melihat pola dan insight.
            </p>
          </motion.section>
        )}
      </div>
    </Layout>
  )
}
