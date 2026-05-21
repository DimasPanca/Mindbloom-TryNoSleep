import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  Brain,
  ChevronRight,
  CircleCheck,
  Home,
  Info,
  Minus,
  Phone,
  RotateCw,
  TriangleAlert,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getScreeningById } from '@/lib/storage'
import { DIMENSION_LABELS, SEVERITY_CONFIG } from '@/types'
import type { DimensionKey, Screening } from '@/types'
import FuzzyGauge from '@/components/result/FuzzyGauge'
import FactorBreakdown from '@/components/result/FactorBreakdown'
import MembershipZones from '@/components/result/MembershipZones'
import { cn } from '@/lib/utils'
import Layout from '@/components/Layout'
import { hoverLift, spring } from '@/lib/motion'

const SEVERITY_ICON_MAP = {
  CircleCheck:   CircleCheck,
  Info:          Info,
  TriangleAlert: TriangleAlert,
  AlertCircle:   AlertCircle,
}

const DIMS_BY_WEIGHT: DimensionKey[] = ['mood', 'social', 'sleep', 'anxiety', 'energy']

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))
}

export default function ResultPage() {
  const { id }                       = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const navigate                     = useNavigate()

  const [screening, setScreening]   = useState<Screening | null>(null)
  const [parent, setParent]         = useState<Screening | null>(null)
  const [loading, setLoading]       = useState(true)
  const [showEmergencyDetail, setShowEmergencyDetail] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true })
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data } = await getScreeningById(id!)
      if (!data) { navigate('/dashboard', { replace: true }); return }
      setScreening(data)
      if (data.parent_screening_id) {
        const { data: p } = await getScreeningById(data.parent_screening_id)
        setParent(p)
      }
      setLoading(false)
    }
    void load()
  }, [id, navigate])

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-9 space-y-5">
          <div className="h-10 w-48 skeleton rounded-2xl" />
          <div className="h-96 skeleton rounded-[1.75rem]" />
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="h-72 skeleton rounded-[1.75rem]" />
            <div className="h-72 skeleton rounded-[1.75rem]" />
          </div>
        </div>
      </Layout>
    )
  }

  if (!screening) return null

  const { fuzzy_score, severity, factor_scores, membership_degrees, self_harm_flag, parent_screening_id, created_at } = screening
  const isRetest       = Boolean(parent_screening_id)
  const showEmergency  = severity === 'berat' || self_harm_flag
  const meta           = SEVERITY_CONFIG[severity]
  const SeverityIcon   = SEVERITY_ICON_MAP[meta.iconName as keyof typeof SEVERITY_ICON_MAP] ?? CircleCheck

  const diff = parent ? Math.round((fuzzy_score - parent.fuzzy_score) * 10) / 10 : null

  const weakDims = [...DIMS_BY_WEIGHT]
    .sort((a, b) => (factor_scores[a] ?? 100) - (factor_scores[b] ?? 100))
    .slice(0, 2)

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-9 space-y-5">

        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-text-dark dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            Dashboard
          </Link>
          {isRetest && (
            <span className="inline-flex items-center gap-1 bg-yellow/10 text-yellow border border-yellow/20 px-2.5 py-0.5 rounded-lg text-xs font-bold">
              <RotateCw size={12} strokeWidth={2} />
              Skrining Ulang
            </span>
          )}
        </motion.div>

        {showEmergency && (
          <FadeCard delay={0}>
            <div className="rounded-[1.5rem] border border-red/30 bg-red-50/95 p-4 shadow-lg shadow-red/5 dark:bg-[#1C1210]">
              <div className="flex items-start gap-3">
                <TriangleAlert size={20} strokeWidth={2} className="text-red shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-red mb-1">
                    Kami menyarankan untuk segera menghubungi profesional kesehatan mental.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowEmergencyDetail(s => !s)}
                    className="text-xs font-semibold text-red underline underline-offset-2"
                  >
                    {showEmergencyDetail ? 'Sembunyikan' : 'Lihat Nomor Darurat'}
                  </button>
                  {showEmergencyDetail && (
                    <a href="tel:119" className="mt-2 flex items-center gap-2 bg-red/10 rounded-xl px-3 py-2.5">
                      <Phone size={16} strokeWidth={2} className="text-red" />
                      <div>
                        <div className="text-sm font-bold text-red">119 ext 8</div>
                        <div className="text-xs text-red/70">Hotline Nasional Kesehatan Jiwa</div>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </FadeCard>
        )}

        {isRetest && parent && diff !== null && (
          <FadeCard delay={0.08}>
            <div className="surface-card rounded-[1.5rem] p-4">
              <h3 className="text-sm font-bold text-text-dark dark:text-white mb-3">Perbandingan Skrining</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-bg dark:bg-dark-hover rounded-xl p-3">
                  <div className="text-xs text-text-muted dark:text-[#8EA8A5] mb-1">Sebelumnya</div>
                  <div className="text-2xl font-black text-text-dark dark:text-white">{parent.fuzzy_score}</div>
                  <div className={cn('text-xs font-semibold', SEVERITY_CONFIG[parent.severity].textColor)}>
                    {SEVERITY_CONFIG[parent.severity].label}
                  </div>
                </div>
                <div className="bg-bg dark:bg-dark-hover rounded-xl p-3">
                  <div className="text-xs text-text-muted dark:text-[#8EA8A5] mb-1">Sekarang</div>
                  <div className="text-2xl font-black text-text-dark dark:text-white">{fuzzy_score}</div>
                  <div className={cn('text-xs font-semibold', meta.textColor)}>{meta.label}</div>
                </div>
              </div>
              <div className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-2.5',
                diff > 5 ? 'bg-green/10' : diff < -5 ? 'bg-red/10' : 'bg-border-light dark:bg-border-dark',
              )}>
                {diff > 5
                  ? <TrendingUp size={18} strokeWidth={2} className="text-green shrink-0" />
                  : diff < -5
                  ? <TrendingDown size={18} strokeWidth={2} className="text-red shrink-0" />
                  : <Minus size={18} strokeWidth={2} className="text-text-muted shrink-0" />}
                <p className={cn(
                  'text-xs font-semibold',
                  diff > 5 ? 'text-green' : diff < -5 ? 'text-red' : 'text-text-muted dark:text-[#8EA8A5]',
                )}>
                  {diff > 5
                    ? 'Luar biasa! Ada peningkatan signifikan.'
                    : diff >= 1
                    ? 'Ada sedikit peningkatan, terus semangat!'
                    : diff >= -5
                    ? 'Kondisi relatif stabil.'
                    : 'Kondisi menurun, pertimbangkan bantuan profesional.'}
                </p>
              </div>
            </div>
          </FadeCard>
        )}

        <FadeCard delay={0}>
          <div className={cn(
            'surface-card border rounded-[1.75rem] p-6',
            meta.borderColor,
          )}>
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 18, stiffness: 200, delay: 0.2 }}
              className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4', meta.bgColor)}
            >
              <SeverityIcon size={16} strokeWidth={2} className={meta.textColor} />
              <span className={cn('text-sm font-bold', meta.textColor)}>{meta.label}</span>
            </motion.div>

            <h1 className="text-xl font-black text-text-dark dark:text-white mb-4">
              {meta.headline}
            </h1>

            <FuzzyGauge score={fuzzy_score} severity={severity} />

            <div className={cn('mt-5 rounded-2xl border p-4', meta.bgColor, meta.borderColor)}>
              <p className={cn('text-sm leading-relaxed', meta.textColor)}>
                {meta.description}
              </p>
            </div>

            <p className="text-xs text-text-muted dark:text-[#8EA8A5] mt-3 text-right">
              {formatDate(created_at)}
            </p>
          </div>
        </FadeCard>

        <FadeCard delay={0.2}>
          <div className="surface-card rounded-[1.75rem] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-text-dark dark:text-white">Analisis Per Dimensi</h2>
              <div className="flex items-center gap-1.5 bg-purple/10 px-2.5 py-1 rounded-lg">
                <Brain size={14} strokeWidth={1.75} className="text-purple" />
                <span className="text-[11px] font-bold text-purple">Fuzzy AI</span>
              </div>
            </div>

            <FactorBreakdown factorScores={factor_scores} />

            <div className="grid grid-cols-2 gap-2.5 mt-5">
              {weakDims.map(dim => {
                const dmeta = DIMENSION_LABELS[dim]
                const score = Math.round(factor_scores[dim] ?? 0)
                return (
                  <div
                    key={dim}
                    className={cn('rounded-2xl p-3 border', dmeta.bgColor, 'border-transparent')}
                  >
                    <div className="text-xs font-semibold mb-1" style={{ color: dmeta.color }}>
                      {dmeta.label}
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-xl font-black text-text-dark dark:text-white">{score}</span>
                      <span className="text-xs text-text-muted dark:text-[#8EA8A5] mb-0.5">/100</span>
                    </div>
                    <p className="text-[11px] text-text-muted dark:text-[#8EA8A5] leading-tight mt-0.5">
                      {dmeta.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </FadeCard>

        <FadeCard delay={0.4}>
          <div className="surface-card rounded-[1.75rem] p-6">
            <h2 className="text-base font-black text-text-dark dark:text-white mb-1">Distribusi Fuzzy</h2>
            <p className="text-xs text-text-muted dark:text-[#8EA8A5] mb-4">
              Seberapa kuat kondisimu masuk ke masing-masing kategori berdasarkan logika fuzzy.
            </p>
            <MembershipZones membershipDegrees={membership_degrees} score={fuzzy_score} />
          </div>
        </FadeCard>

        <FadeCard delay={0.5}>
          <div className="surface-card rounded-[1.75rem] p-5 space-y-2.5">
            {severity === 'normal' ? (
              <Link
                to="/dashboard"
                className="flex items-center justify-between w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Home size={18} strokeWidth={2} />
                  Kembali ke Beranda
                </div>
                <ChevronRight size={16} strokeWidth={2.5} />
              </Link>
            ) : (
              <Link
                to={`/intervention/${id}`}
                className="flex items-center justify-between w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Brain size={18} strokeWidth={2} />
                  Mulai Program Intervensi
                </div>
                <ChevronRight size={16} strokeWidth={2.5} />
              </Link>
            )}

            {isRetest && (
              <Link
                to={`/screening?retest=${id}`}
                className="flex items-center justify-between w-full border border-border-light dark:border-border-dark text-text-dark dark:text-white font-semibold py-3 px-5 rounded-xl hover:bg-bg dark:hover:bg-dark-hover transition-colors text-sm"
              >
                <div className="flex items-center gap-2">
                  <RotateCw size={16} strokeWidth={2} />
                  Ulangi Skrining
                </div>
                <ChevronRight size={16} strokeWidth={2} />
              </Link>
            )}
          </div>
        </FadeCard>

        <p className="text-xs text-text-muted dark:text-[#8EA8A5] italic text-center px-4">
          Hasil ini bukan diagnosis klinis. Konsultasikan dengan profesional
          kesehatan mental untuk penilaian lebih lanjut.
        </p>
      </div>
    </Layout>
  )
}

function FadeCard({ children, delay }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: delay ?? 0 }}
      whileHover={hoverLift}
    >
      {children}
    </motion.div>
  )
}
