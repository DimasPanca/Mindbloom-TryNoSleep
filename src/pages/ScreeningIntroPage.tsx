import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Clock,
  ListOrdered,
  Lock,
  RotateCw,
  ShieldCheck,
} from 'lucide-react'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { hoverLift, spring } from '@/lib/motion'

export default function ScreeningIntroPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const retestParentId = searchParams.get('retest')
  const isRetest = Boolean(retestParentId)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true })
    }
  }, [user, authLoading, navigate])

  function handleStart() {
    const target = isRetest
      ? `/screening/questions?retest=${encodeURIComponent(retestParentId!)}`
      : '/screening/questions'
    navigate(target)
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-9">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-black text-text-muted transition-colors hover:text-text-dark dark:text-[#9EB4AC] dark:hover:text-white"
        >
          <ArrowLeft size={16} strokeWidth={2.2} />
          Kembali
        </Link>

        <div className="grid items-center gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.section
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={spring}
            className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#173E38_0%,#1A7A73_58%,#2AAFA0_130%)] p-7 text-white shadow-xl shadow-primary/10"
          >
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
            <div className="absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-yellow/15 blur-3xl" />
            <div className="relative">
              {isRetest && (
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-yellow/30 bg-yellow/15 px-3 py-1.5 text-xs font-black text-white">
                  <RotateCw size={14} strokeWidth={2.2} />
                  Skrining Ulang
                </div>
              )}
              <div className="mb-5 inline-grid h-14 w-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <Brain size={30} strokeWidth={1.8} />
              </div>
              <h1 className="mb-3 max-w-md text-4xl font-black leading-tight tracking-tight">
                Skrining Kesehatan Mental
              </h1>
              <p className="max-w-lg text-base font-semibold leading-relaxed text-white/80">
                Jawab 14 pertanyaan singkat untuk memahami kondisi kesehatan mentalmu saat ini.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <motion.button
                  type="button"
                  onClick={handleStart}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-primary-dark transition-colors hover:bg-cream"
                >
                  Mulai Skrining
                  <ArrowRight size={16} strokeWidth={2.4} />
                </motion.button>
                <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-black text-white backdrop-blur">
                  <ShieldCheck size={16} strokeWidth={2} />
                  Data privat
                </div>
              </div>
            </div>
          </motion.section>

          <section className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <InfoCard
                index={0}
                icon={<ListOrdered size={22} strokeWidth={1.8} className="text-primary" />}
                iconBg="bg-primary/10"
                title="14 Pertanyaan"
                description="Mencakup 5 dimensi kesehatan mental"
              />
              <InfoCard
                index={1}
                icon={<Clock size={22} strokeWidth={1.8} className="text-green" />}
                iconBg="bg-green/10"
                title="5-7 Menit"
                description="Jawab sesuai kondisi 2 minggu terakhir"
              />
              <InfoCard
                index={2}
                icon={<Lock size={22} strokeWidth={1.8} className="text-purple" />}
                iconBg="bg-purple/10"
                title="Data Privat"
                description="Hasil hanya bisa kamu lihat"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.28 }}
              whileHover={hoverLift}
              className="surface-card rounded-[1.75rem] p-5"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10">
                  <Brain size={22} strokeWidth={1.8} className="text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 text-base font-black text-text-dark dark:text-white">
                    Fuzzy Tahani AI
                  </h3>
                  <p className="text-sm font-semibold leading-relaxed text-text-muted dark:text-[#9EB4AC]">
                    Sistem ini membaca pola jawaban secara holistik, lalu mengubahnya menjadi hasil yang lebih bernuansa daripada skala biasa.
                  </p>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </div>
    </Layout>
  )
}

interface InfoCardProps {
  index: number
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
}

function InfoCard({ index, icon, iconBg, title, description }: InfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.1 + index * 0.08 }}
      whileHover={hoverLift}
      className="surface-card flex items-center gap-3 rounded-[1.5rem] p-4"
    >
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${iconBg}`}>{icon}</div>
      <div>
        <h3 className="text-sm font-black text-text-dark dark:text-white">{title}</h3>
        <p className="text-xs font-semibold leading-relaxed text-text-muted dark:text-[#9EB4AC]">{description}</p>
      </div>
    </motion.div>
  )
}
