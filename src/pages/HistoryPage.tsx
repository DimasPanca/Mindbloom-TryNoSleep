import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  AlertCircle, AreaChart as AreaChartIcon, ArrowLeft, ChevronRight,
  Flag, Inbox, ListChecks, Minus, Search, Star, TrendingDown,
  TrendingUp, Trophy,
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip,
  XAxis, YAxis,
} from 'recharts'
import AnimatedNumber from '@/components/AnimatedNumber'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { hoverLift, spring } from '@/lib/motion'
import { getScreeningHistory } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { SEVERITY_CONFIG } from '@/types'
import type { Screening, ScreeningType, SeverityLevel } from '@/types'

type SeverityFilter = 'all' | SeverityLevel
type TypeFilter = 'all' | ScreeningType

const SEV_FILTERS: { value: SeverityFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'normal', label: 'Normal' },
  { value: 'ringan', label: 'Ringan' },
  { value: 'sedang', label: 'Sedang' },
  { value: 'berat', label: 'Berat' },
]

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'initial', label: 'Skrining Awal' },
  { value: 'retest', label: 'Retest' },
]

function fmtShort(iso: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(iso))
}

function fmtLong(iso: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState<Screening[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sevFilter, setSevFilter] = useState<SeverityFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true })
  }, [user, authLoading, navigate])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data } = await getScreeningHistory(30)
      if (!cancelled) {
        setItems(data)
        setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  const sorted = useMemo(
    () => [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [items],
  )

  const stats = useMemo(() => {
    if (sorted.length === 0) return null
    const total = sorted.length
    const avg = round1(sorted.reduce((s, x) => s + x.fuzzy_score, 0) / total)
    const latest = round1(sorted[0].fuzzy_score)
    const oldest = sorted[sorted.length - 1].fuzzy_score
    const trend = round1(latest - oldest)
    return { total, avg, latest, trend }
  }, [sorted])

  const insight = useMemo(() => {
    if (sorted.length === 0) return null
    const best = [...sorted].sort((a, b) => b.fuzzy_score - a.fuzzy_score)[0]
    const worst = [...sorted].sort((a, b) => a.fuzzy_score - b.fuzzy_score)[0]
    return { latest: sorted[0], best, worst }
  }, [sorted])

  const chartData = useMemo(() => (
    [...sorted].slice(0, 14).reverse().map(s => ({
      date: fmtShort(s.created_at),
      score: round1(s.fuzzy_score),
      severity: s.severity,
    }))
  ), [sorted])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return sorted.filter(s => {
      if (sevFilter !== 'all' && s.severity !== sevFilter) return false
      if (typeFilter !== 'all' && s.screening_type !== typeFilter) return false
      if (!q) return true
      const label = SEVERITY_CONFIG[s.severity].label.toLowerCase()
      const date = fmtLong(s.created_at).toLowerCase()
      return label.includes(q) || date.includes(q) || String(round1(s.fuzzy_score)).includes(q)
    })
  }, [sorted, search, sevFilter, typeFilter])

  if (loading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-9 space-y-5">
          <div className="h-10 w-56 skeleton rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map(i => <div key={i} className="h-32 skeleton rounded-[1.5rem]" />)}
          </div>
          <div className="h-80 skeleton rounded-[1.75rem]" />
          <div className="h-48 skeleton rounded-[1.75rem]" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-9 space-y-5">
        <motion.header
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <Link
              to="/dashboard"
              className="mb-3 inline-flex items-center gap-1.5 text-sm font-black text-text-muted transition-colors hover:text-text-dark dark:text-[#9EB4AC] dark:hover:text-white"
            >
              <ArrowLeft size={16} strokeWidth={2.2} />
              Dashboard
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-text-dark dark:text-white">Riwayat Skrining</h1>
            <p className="mt-1 text-sm font-semibold text-text-muted dark:text-[#9EB4AC]">
              Pantau perubahan skor dan pola kondisimu dari waktu ke waktu.
            </p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-black text-primary">
            {filtered.length} data tampil
          </div>
        </motion.header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <HistoryStat
            index={0}
            Icon={ListChecks}
            label="Total Skrining"
            value={stats?.total ?? 0}
            color="text-primary"
          />
          <HistoryStat
            index={1}
            Icon={TrendingUp}
            label="Rata-rata Skor"
            value={stats?.avg ?? 0}
            suffix="/100"
            color="text-purple"
            decimals={1}
          />
          <HistoryStat
            index={2}
            Icon={Star}
            label="Skor Terbaru"
            value={stats?.latest ?? 0}
            suffix="/100"
            color="text-yellow"
            decimals={1}
          />
          <HistoryStat
            index={3}
            Icon={(stats?.trend ?? 0) > 0 ? TrendingUp : (stats?.trend ?? 0) < 0 ? TrendingDown : Minus}
            label="Arah Tren"
            value={Math.abs(stats?.trend ?? 0)}
            prefix={(stats?.trend ?? 0) > 0 ? '+' : (stats?.trend ?? 0) < 0 ? '-' : ''}
            color={(stats?.trend ?? 0) > 0 ? 'text-green' : (stats?.trend ?? 0) < 0 ? 'text-red' : 'text-text-muted'}
            decimals={1}
          />
        </div>

        {chartData.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.24 }}
            whileHover={hoverLift}
            className="surface-card rounded-[1.75rem] p-5"
          >
            <div className="mb-4 flex items-center gap-2">
              <AreaChartIcon size={19} strokeWidth={1.8} className="text-primary" />
              <h2 className="text-base font-black text-text-dark dark:text-white">Grafik Tren</h2>
            </div>
            <HistoryChart data={chartData} />
          </motion.section>
        )}

        {insight && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.3 }}
            whileHover={hoverLift}
            className="relative overflow-hidden rounded-[1.75rem] border border-primary/20 bg-gradient-to-r from-primary/10 via-sage/55 to-green/10 p-5 dark:from-primary/10 dark:via-dark-card dark:to-yellow/5"
          >
            <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
            <h2 className="relative mb-3 text-base font-black text-text-dark dark:text-white">Insight</h2>
            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InsightCard Icon={Flag} label="Skrining Terbaru" screening={insight.latest} color="text-primary" />
              <InsightCard Icon={Trophy} label="Kondisi Terbaik" screening={insight.best} color="text-green" />
              <InsightCard Icon={AlertCircle} label="Perlu Perhatian" screening={insight.worst} color="text-red" />
            </div>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.36 }}
          className="surface-card rounded-[1.75rem] p-4 space-y-3"
        >
          <div className="relative">
            <Search size={17} strokeWidth={2.2} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari berdasarkan tanggal, skor..."
              className="soft-input w-full rounded-2xl border py-3 pl-11 pr-4 text-sm font-bold text-text-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/35 dark:text-white"
            />
          </div>

          <SegmentedFilter
            items={SEV_FILTERS}
            value={sevFilter}
            onChange={setSevFilter}
            layoutId="severity-filter-pill"
          />
          <SegmentedFilter
            items={TYPE_FILTERS}
            value={typeFilter}
            onChange={setTypeFilter}
            layoutId="type-filter-pill"
          />
        </motion.section>

        <section className="space-y-3">
          {filtered.length === 0 ? (
            <div className="surface-card flex flex-col items-center gap-2 rounded-[1.75rem] py-14 text-center">
              <Inbox size={44} strokeWidth={1.5} className="text-[#9E9D9A]" />
              <p className="text-sm font-black text-text-muted dark:text-[#9EB4AC]">Belum ada data skrining</p>
            </div>
          ) : filtered.map((s, idx) => {
            const meta = SEVERITY_CONFIG[s.severity]
            const next = filtered[idx + 1]
            const diff = next ? round1(s.fuzzy_score - next.fuzzy_score) : null
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: Math.min(idx * 0.06, 0.3) }}
                whileHover={hoverLift}
              >
                <Link
                  to={`/result/${s.id}`}
                  className="surface-card group block rounded-[1.5rem] p-4 transition-shadow hover:shadow-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full ring-4 ring-white/80 dark:ring-dark-card"
                          style={{ backgroundColor: meta.accentColor }}
                        />
                        <span className={cn('text-xs font-black', meta.textColor)}>{meta.label}</span>
                        {s.screening_type === 'retest' && (
                          <span className="rounded-full border border-yellow/20 bg-yellow/10 px-2 py-0.5 text-[10px] font-black text-yellow">
                            Retest
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-text-muted dark:text-[#9EB4AC]">{fmtLong(s.created_at)}</div>
                      {diff !== null && (
                        <div className={cn(
                          'mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black',
                          diff > 0 ? 'bg-green/10 text-green' : diff < 0 ? 'bg-red/10 text-red' : 'bg-border-light dark:bg-border-dark text-text-muted',
                        )}>
                          {diff > 0 ? <TrendingUp size={11} strokeWidth={2.5} /> : diff < 0 ? <TrendingDown size={11} strokeWidth={2.5} /> : <Minus size={11} strokeWidth={2.5} />}
                          {diff > 0 ? `+${diff}` : diff} vs sebelumnya
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-3xl font-black leading-none text-text-dark dark:text-white">{round1(s.fuzzy_score)}</div>
                      <div className="mt-2 h-2 w-20 overflow-hidden rounded-full bg-border-light dark:bg-border-dark">
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${s.fuzzy_score}%` }}
                          transition={{ ...spring, delay: 0.1 }}
                          style={{ backgroundColor: meta.accentColor }}
                        />
                      </div>
                    </div>
                    <ChevronRight size={19} strokeWidth={2.2} className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </section>
      </div>
    </Layout>
  )
}

function HistoryStat({
  index,
  Icon,
  label,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  color,
}: {
  index: number
  Icon: typeof ListChecks
  label: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: index * 0.07 }}
      whileHover={hoverLift}
      className="surface-card rounded-[1.5rem] p-4"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
        <Icon size={18} strokeWidth={1.8} className={color} />
      </div>
      <div className="mb-1 text-xs font-black text-text-muted dark:text-[#9EB4AC]">{label}</div>
      <div className="text-2xl font-black tabular-nums text-text-dark dark:text-white">
        {prefix}<AnimatedNumber value={value} decimals={decimals} />
        {suffix && <span className="ml-0.5 text-xs font-black text-text-muted dark:text-[#9EB4AC]">{suffix}</span>}
      </div>
    </motion.div>
  )
}

function InsightCard({
  Icon,
  label,
  screening,
  color,
}: {
  Icon: typeof Flag
  label: string
  screening: Screening
  color: string
}) {
  const meta = SEVERITY_CONFIG[screening.severity]
  return (
    <div className="rounded-2xl border border-white/60 bg-white/72 p-4 backdrop-blur dark:border-border-dark/80 dark:bg-dark-card/72">
      <div className="mb-2 flex items-center gap-2">
        <Icon size={15} strokeWidth={1.8} className={color} />
        <span className="text-xs font-black text-text-muted dark:text-[#9EB4AC]">{label}</span>
      </div>
      <div className="text-2xl font-black leading-none text-text-dark dark:text-white">
        {round1(screening.fuzzy_score)}
      </div>
      <div className={cn('mt-1 text-xs font-black', meta.textColor)}>
        {meta.label}
      </div>
      <div className="mt-1 text-[11px] font-semibold text-text-muted dark:text-[#9EB4AC]">{fmtShort(screening.created_at)}</div>
    </div>
  )
}

function SegmentedFilter<T extends string>({
  items,
  value,
  onChange,
  layoutId,
}: {
  items: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  layoutId: string
}) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-2xl bg-surface-soft/70 p-1 dark:bg-dark-hover/80">
      {items.map(f => (
        <button
          key={f.value}
          type="button"
          onClick={() => onChange(f.value)}
          className={cn(
            'relative min-h-9 flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-black transition-colors',
            value === f.value ? 'text-white' : 'text-text-muted hover:text-text-dark dark:text-[#9EB4AC] dark:hover:text-white',
          )}
        >
          {value === f.value && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 -z-10 rounded-xl bg-primary"
              transition={spring}
            />
          )}
          {f.label}
        </button>
      ))}
    </div>
  )
}

function HistoryChart({ data }: { data: { date: string; score: number; severity: SeverityLevel }[] }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const axisColor = isDark ? '#9EB4AC' : '#6E746B'
  const gridColor = isDark ? '#23483F' : '#E8DED0'

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2AAFA0" stopOpacity={0.42} />
              <stop offset="95%" stopColor="#2AAFA0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: axisColor, fontWeight: 800 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: axisColor, fontWeight: 800 }} axisLine={false} tickLine={false} />
          <Tooltip content={<HistoryTooltip />} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#2AAFA0"
            strokeWidth={3}
            fill="url(#histGrad)"
            isAnimationActive
            animationBegin={250}
            animationDuration={1400}
            animationEasing="ease-in-out"
            dot={{ r: 4, strokeWidth: 2, fill: isDark ? '#122A24' : '#FFFDF7', stroke: '#2AAFA0' }}
            activeDot={{ r: 6, strokeWidth: 2, fill: '#2AAFA0', stroke: '#FFFDF7' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function HistoryTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-2xl border border-border-light bg-surface px-3 py-2 shadow-xl dark:border-border-dark dark:bg-dark-card">
      <p className="text-xs font-bold text-text-muted dark:text-[#9EB4AC]">{label}</p>
      <p className="text-sm font-black text-text-dark dark:text-white">Skor: {payload[0].value}/100</p>
    </div>
  )
}
