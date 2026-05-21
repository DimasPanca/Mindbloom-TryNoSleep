import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  motion, useInView, useMotionValue, useScroll, useSpring, useTransform,
  type MotionValue,
} from 'framer-motion'
import {
  AlertTriangle, ArrowDownToLine, ArrowRight, Brain, ChevronRight, ClipboardList,
  Cpu, ExternalLink, Flame, HandHeart, HeartPulse, Lock, MapPin, Phone, PieChart,
  Play, ShieldCheck, Sparkles,
} from 'lucide-react'
import OrganicBackground from '@/components/OrganicBackground'
import MindbloomLogo from '@/components/MindbloomLogo'
import AnimatedNumber from '@/components/AnimatedNumber'
import { cn } from '@/lib/utils'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-bg dark:bg-dark-root text-text-dark dark:text-white overflow-x-hidden selection:bg-primary/30">
      <Header scrolled={scrolled} onNavClick={scrollTo} />
      <Hero onLearnClick={() => scrollTo('cara-kerja')} />
      <Stats />
      <Features />
      <HowItWorks />
      <CtaBand />
      <Footer />
    </div>
  )
}

function Header({ scrolled, onNavClick }: { scrolled: boolean; onNavClick: (id: string) => void }) {
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/80 dark:bg-[#0E1A18]/80 backdrop-blur-md border-b border-border-light/60 dark:border-border-dark/60'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <MindbloomLogo size={36} />
          <span className="text-lg font-black tracking-tight">MindBloom</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
          {[
            { id: 'fitur',      label: 'Fitur'      },
            { id: 'cara-kerja', label: 'Cara Kerja' },
          ].map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavClick(item.id)}
              className="relative px-4 py-2 text-text-muted dark:text-[#8EA8A5] hover:text-text-dark dark:hover:text-white transition-colors group"
            >
              <span className="inline-flex items-center gap-1.5">
                <ArrowDownToLine size={13} strokeWidth={2} className="opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                {item.label}
              </span>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 group-hover:w-6 h-0.5 bg-primary rounded-full transition-all" />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold text-primary border border-primary/40 hover:bg-primary/10 transition-colors"
          >
            Masuk
          </Link>
          <Link
            to="/register"
            className="relative inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-colors overflow-hidden group"
          >
            <span className="relative z-10">Mulai Gratis</span>
            <ArrowRight size={14} strokeWidth={2.5} className="relative z-10 group-hover:translate-x-0.5 transition-transform" />
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Link>
        </div>
      </div>
    </motion.header>
  )
}

function Hero({ onLearnClick }: { onLearnClick: () => void }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const sx = useSpring(mouseX, { damping: 25, stiffness: 150 })
  const sy = useSpring(mouseY, { damping: 25, stiffness: 150 })

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - r.left - r.width / 2) / 20)
    mouseY.set((e.clientY - r.top - r.height / 2) / 20)
  }

  function handleLeave() {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      <OrganicBackground variant="hero" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_40%,transparent_100%)]"
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 grid md:grid-cols-2 gap-12 md:gap-8 items-center">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-3 py-1.5 text-xs font-bold text-primary"
          >
            <Cpu size={13} strokeWidth={2} />
            Berbasis Kecerdasan Buatan
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: 'easeOut' }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]"
          >
            Kenali Kondisi Mentalmu,
            <br />
            <span className="bg-gradient-to-r from-primary via-[#3FC2B3] to-green bg-clip-text text-transparent">
              Ambil Langkah Pertama
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-base md:text-lg text-text-muted dark:text-[#9FB8B4] leading-relaxed max-w-xl"
          >
            MindBloom membantumu memahami kesehatan mental dengan analisis <span className="font-bold text-text-dark dark:text-white">Fuzzy Tahani AI</span> yang akurat, lalu membimbingmu menuju intervensi yang tepat.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="flex flex-wrap items-center gap-3"
          >
            <Link
              to="/register"
              className="relative inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 hover:shadow-primary/50 group overflow-hidden"
            >
              <span className="relative z-10">Mulai Skrining Gratis</span>
              <ArrowRight size={16} strokeWidth={2.5} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Link>
            <button
              type="button"
              onClick={onLearnClick}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-primary border-2 border-primary/40 hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Play size={14} strokeWidth={2.5} fill="currentColor" />
              Pelajari Cara Kerja
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-xs font-semibold text-text-muted dark:text-[#8EA8A5]"
          >
            {[
              { Icon: Lock,       label: 'Data Privat'    },
              { Icon: Brain,      label: 'Fuzzy Tahani AI'       },
              { Icon: HeartPulse, label: 'Berbasis Ilmu'  },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon size={14} strokeWidth={2} className="text-primary" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          className="relative h-[500px] md:h-[560px] px-6 sm:px-10 md:px-14"
        >
          <HeroIllustration sx={sx} sy={sy} />
        </motion.div>
      </div>
    </section>
  )
}

function HeroIllustration({ sx, sy }: { sx: MotionValue<number>; sy: MotionValue<number> }) {
  const factors = [
    { label: 'Emosi',           value: 82, color: '#2AAFA0' },
    { label: 'Kualitas Tidur',  value: 68, color: '#7B6FCA' },
    { label: 'Energi',          value: 75, color: '#D9A23B' },
  ]

  const cardRotateY = useTransform(sx, [-20, 20], [-4, 4])
  const cardRotateX = useTransform(sy, [-20, 20], [3, -3])
  const badgeShiftX = useTransform(sx, v => -v * 0.5)
  const badgeShiftY = useTransform(sy, v => -v * 0.5)

  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: 1200 }}>
      <motion.div
        style={{ x: sx, y: sy }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-full max-w-[420px]"
      >
        <motion.div
          aria-hidden="true"
          className="absolute -inset-10 bg-gradient-to-br from-primary/35 via-green/20 to-purple/25 rounded-[3rem] blur-3xl"
          animate={{ opacity: [0.55, 0.95, 0.55], scale: [1, 1.05, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          aria-hidden="true"
          className="absolute -inset-2 pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        >
          <span className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary/70 shadow-[0_0_10px_rgba(42,175,160,0.8)]" />
          <span className="absolute bottom-4 right-6 w-1 h-1 rounded-full bg-green/70 shadow-[0_0_8px_rgba(110,180,108,0.8)]" />
          <span className="absolute top-1/3 -left-2 w-1 h-1 rounded-full bg-purple/60 shadow-[0_0_8px_rgba(131,120,204,0.8)]" />
        </motion.div>

        <motion.div
          style={{ rotateX: cardRotateX, rotateY: cardRotateY, transformStyle: 'preserve-3d' }}
          className="relative bg-white dark:bg-dark-card border border-border-light/70 dark:border-border-dark/70 rounded-3xl shadow-[0_30px_70px_-15px_rgba(42,175,160,0.35)] dark:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6)] p-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/12 flex items-center justify-center">
                <PieChart size={18} strokeWidth={2} className="text-primary" />
              </div>
              <div>
                <div className="text-[11px] text-text-muted dark:text-[#8EA8A5] font-semibold">Hasil Analisis</div>
                <div className="text-sm font-black text-text-dark dark:text-white">Skrining Fuzzy Tahani</div>
              </div>
            </div>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-[10px] font-bold bg-yellow/10 text-yellow border border-yellow/30 px-2.5 py-1 rounded-full"
            >
              RINGAN
            </motion.span>
          </div>

          <div className="flex items-center justify-center">
            <MiniGauge score={78} />
          </div>

          <div className="space-y-2.5">
            {factors.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.12 }}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-text-dark dark:text-white">{f.label}</span>
                  <span className="font-black tabular-nums" style={{ color: f.color }}>{f.value}</span>
                </div>
                <div className="h-1.5 bg-bg dark:bg-dark-hover rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${f.value}%` }}
                    transition={{ duration: 1.2, delay: 0.7 + i * 0.12, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: f.color }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          style={{ x: badgeShiftX, y: badgeShiftY }}
          initial={{ opacity: 0, scale: 0.6, x: -40, y: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -top-10 -left-10 sm:-left-16 md:-left-24 z-20"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
            className="relative bg-white dark:bg-dark-card border border-border-light dark:border-border-dark shadow-[0_15px_40px_-10px_rgba(215,155,53,0.45)] dark:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6)] rounded-2xl px-4 py-3 flex items-center gap-3"
          >
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-yellow/15 via-transparent to-transparent pointer-events-none" />
            <div className="relative">
              <motion.div
                className="absolute -inset-1.5 rounded-2xl border-2 border-dashed border-yellow/45"
                animate={{ rotate: 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-0 rounded-xl bg-yellow/35 blur-md"
                animate={{ opacity: [0.4, 0.85, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative w-11 h-11 rounded-xl bg-yellow/15 flex items-center justify-center">
                <Flame size={20} strokeWidth={2.2} className="text-yellow" />
              </div>
            </div>
            <div className="relative">
              <div className="text-[10px] text-text-muted dark:text-[#8EA8A5] font-bold uppercase tracking-wider leading-none">Streak</div>
              <div className="text-lg font-black text-text-dark dark:text-white leading-tight mt-0.5">7 Hari</div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ x: badgeShiftX, y: badgeShiftY }}
          initial={{ opacity: 0, scale: 0.6, x: 40, y: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -bottom-8 -right-8 sm:-right-12 md:-right-20 z-20"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            className="relative bg-white dark:bg-dark-card border border-border-light dark:border-border-dark shadow-[0_15px_40px_-10px_rgba(110,180,108,0.45)] dark:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6)] rounded-2xl px-4 py-3 flex items-center gap-3"
          >
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-green/15 via-transparent to-transparent pointer-events-none" />
            <div className="relative">
              <motion.div
                className="absolute -inset-1.5 rounded-2xl border-2 border-dashed border-green/45"
                animate={{ rotate: -360 }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-0 rounded-xl bg-green/35 blur-md"
                animate={{ opacity: [0.4, 0.85, 0.4] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              />
              <div className="relative w-11 h-11 rounded-xl bg-green/15 flex items-center justify-center">
                <Sparkles size={20} strokeWidth={2.2} className="text-green" />
              </div>
            </div>
            <div className="relative">
              <div className="text-[10px] text-text-muted dark:text-[#8EA8A5] font-bold uppercase tracking-wider leading-none">Intervensi</div>
              <div className="text-lg font-black text-text-dark dark:text-white leading-tight mt-0.5">Selesai</div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

function MiniGauge({ score }: { score: number }) {
  const CX = 90, CY = 90, R = 70
  const SWEEP = Math.PI
  const angle = (1 - score / 100) * SWEEP
  const dotX = CX + R * Math.cos(angle)
  const dotY = CY - R * Math.sin(angle)
  const dash = (score / 100) * Math.PI * R

  return (
    <div className="relative w-44 h-24">
      <svg viewBox="0 0 180 100" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="hgrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#E0665A" />
            <stop offset="40%"  stopColor="#D9A23B" />
            <stop offset="70%"  stopColor="#2AAFA0" />
            <stop offset="100%" stopColor="#5EA85C" />
          </linearGradient>
        </defs>
        <path
          d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          className="text-bg dark:text-dark-hover"
        />
        <motion.path
          d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
          fill="none"
          stroke="url(#hgrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${Math.PI * R}`}
          initial={{ strokeDasharray: `0 ${Math.PI * R}` }}
          animate={{ strokeDasharray: `${dash} ${Math.PI * R}` }}
          transition={{ duration: 1.4, delay: 0.4, ease: 'easeOut' }}
        />
        <motion.circle
          cx={dotX}
          cy={dotY}
          r="6"
          fill="#fff"
          stroke="#2AAFA0"
          strokeWidth="3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 1.6, type: 'spring' }}
          style={{ transformOrigin: `${dotX}px ${dotY}px` }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div className="text-3xl font-black text-text-dark dark:text-white leading-none tabular-nums">
          <AnimatedNumber value={score} duration={1.4} />
        </div>
        <div className="text-[10px] text-text-muted dark:text-[#8EA8A5] font-semibold">/100</div>
      </div>
    </div>
  )
}

function Stats() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const crisisStats = [
    {
      value: 12, suffix: ' Juta+',
      label: 'penduduk Indonesia mengalami depresi',
      sub: 'Estimasi 6.1% dari populasi usia ≥15 tahun',
      source: 'Riskesdas 2018 · Kemenkes RI',
      color: '#E06458',
      Icon: HeartPulse,
    },
    {
      value: 1, suffix: ' dari 3',
      label: 'remaja Indonesia memiliki masalah kesehatan mental',
      sub: 'dalam 12 bulan terakhir, usia 10–17 tahun',
      source: 'I-NAMHS 2022 · UGM × Johns Hopkins',
      color: '#D9A23B',
      Icon: Brain,
    },
    {
      value: 90, suffix: '%',
      label: 'tidak menerima penanganan profesional',
      sub: 'Treatment gap kesehatan mental di Indonesia',
      source: 'WHO Mental Health Atlas · Kemenkes RI',
      color: '#8378CC',
      Icon: AlertTriangle,
    },
  ]

  const solutions = [
    { Icon: ClipboardList, label: 'Skrining 40 Menit',     desc: 'Menjembatani jutaan yang tak terdeteksi sejak dini'    },
    { Icon: Brain,         label: 'Analisis Fuzzy AI',     desc: 'Hasil personal & nuansa, bukan label kaku biner'       },
    { Icon: HandHeart,     label: 'Intervensi Bertahap',   desc: 'Panduan konkret pasca-skrining yang bisa diakses'      },
    { Icon: ShieldCheck,   label: 'Privat & Akses 24/7',   desc: 'Tersedia kapan saat dibutuhkan, datamu tetap aman'     },
  ]

  return (
    <section ref={ref} className="relative bg-gradient-to-br from-[#FFF8F2] via-[#FCEEE6] to-[#FFF6EE] dark:from-[#0F2D28] dark:via-[#163530] dark:to-[#0F2D28] text-text-dark dark:text-white py-24 sm:py-32 overflow-hidden">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(224,100,88,0.10),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(42,175,160,0.08),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(224,100,88,0.16),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(42,175,160,0.12),transparent_55%)]"
        animate={{ opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_30%,transparent_100%)]"
      />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-red/12 dark:bg-red/15 border border-red/40 text-red rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider"
        >
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1.5 h-1.5 rounded-full bg-red shadow-[0_0_10px_rgba(224,100,88,0.9)]"
          />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] max-w-3xl text-text-dark dark:text-white"
        >
          Setiap Jam, Indonesia Kehilangan{' '}
          <span className="bg-gradient-to-r from-red via-[#E88573] to-[#D9A23B] bg-clip-text text-transparent">
            1 Nyawa
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-5 text-base md:text-lg text-text-muted dark:text-white/70 max-w-2xl leading-relaxed"
        >
          Krisis kesehatan mental di Indonesia berlangsung dalam senyap. Data di bawah ini adalah realita yang harus kita lihat dan tangani bersama.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : undefined}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 relative overflow-hidden rounded-3xl border border-red/35 bg-white/95 dark:bg-[#19332E]/80 backdrop-blur-sm p-7 md:p-10 shadow-[0_30px_70px_-20px_rgba(224,100,88,0.30)] dark:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.55)]"
        >
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-red/15 dark:bg-red/20 blur-3xl pointer-events-none"
          />

          <div className="relative grid md:grid-cols-[auto_1fr] gap-7 md:gap-10 items-center">
            <div className="relative shrink-0 mx-auto md:mx-0">
              <motion.div
                className="absolute inset-0 rounded-3xl bg-red/30 dark:bg-red/35 blur-2xl"
                animate={{ opacity: [0.5, 0.95, 0.5], scale: [0.95, 1.15, 0.95] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative grid h-28 w-28 md:h-32 md:w-32 place-items-center rounded-3xl bg-gradient-to-br from-red/22 to-red/8 dark:from-red/30 dark:to-red/8 border border-red/45 shadow-[0_15px_50px_-10px_rgba(224,100,88,0.45)]">
                <motion.div
                  animate={{ scale: [1, 1.18, 1, 1.18, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.18, 0.36, 0.54, 1], ease: 'easeOut' }}
                >
                  <HeartPulse size={58} strokeWidth={1.8} className="text-red drop-shadow-[0_0_12px_rgba(224,100,88,0.5)]" />
                </motion.div>
              </div>
            </div>

            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-baseline gap-2 md:gap-3 flex-wrap justify-center md:justify-start">
                <span className="text-2xl md:text-3xl font-bold text-text-muted dark:text-white/60">±</span>
                <span className="text-6xl md:text-7xl lg:text-8xl font-black tabular-nums leading-none bg-gradient-to-br from-red via-[#E06458] to-[#A8443A] dark:from-[#FFD9D2] dark:via-red dark:to-[#A8443A] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(224,100,88,0.25)]">
                  {inView && <AnimatedNumber value={24} duration={2.2} />}
                </span>
                <span className="text-xl md:text-2xl font-bold text-text-dark dark:text-white/85">jiwa per hari</span>
              </div>

              <div className="flex justify-center md:justify-start" aria-hidden="true">
                <svg
                  className="w-[260px] h-7 text-red/70"
                  viewBox="0 0 260 32"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <motion.path
                    d="M 0 16 L 60 16 L 75 16 L 88 5 L 100 27 L 112 2 L 124 30 L 136 16 L 160 16 L 175 16 L 188 7 L 200 25 L 212 4 L 224 28 L 236 16 L 260 16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={inView ? { pathLength: 1, opacity: 1 } : undefined}
                    transition={{ pathLength: { duration: 2.4, ease: 'easeInOut', delay: 0.7 }, opacity: { duration: 0.3, delay: 0.7 } }}
                  />
                </svg>
              </div>

              <p className="text-base md:text-lg text-text-dark dark:text-white/90 leading-relaxed max-w-xl mx-auto md:mx-0">
                Indonesia diperkirakan kehilangan{' '}
                <span className="text-red font-black bg-red/10 dark:bg-red/15 px-1.5 rounded">~1 nyawa setiap jam</span>{' '}
                akibat bunuh diri. Banyak yang berjuang sendiri, tanpa ruang aman untuk dikenali sejak awal.
              </p>

              <div className="flex items-center gap-2 text-[11px] text-text-muted dark:text-white/55 pt-3 border-t border-border-light dark:border-white/10 justify-center md:justify-start">
                <ExternalLink size={11} strokeWidth={2} />
                <span className="font-semibold">Sumber: WHO Global Health Estimates 2021 · I-NAMHS 2022</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {crisisStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.6, delay: 0.55 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl bg-white/95 dark:bg-[#19332E]/65 backdrop-blur-sm border border-border-light dark:border-white/12 p-6 hover:border-primary/30 dark:hover:border-white/25 transition-colors shadow-[0_10px_30px_-15px_rgba(23,62,56,0.20)] dark:shadow-[0_15px_40px_-20px_rgba(0,0,0,0.5)]"
            >
              <div
                aria-hidden="true"
                className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-25 group-hover:opacity-45 transition-opacity"
                style={{ background: stat.color }}
              />
              <div className="relative">
                <div
                  className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-5"
                  style={{ background: stat.color + '22', color: stat.color, boxShadow: `0 0 30px -12px ${stat.color}` }}
                >
                  <stat.Icon size={20} strokeWidth={2} />
                </div>
                <div
                  className="text-5xl md:text-[3.25rem] font-black tabular-nums leading-none flex items-baseline gap-1.5"
                  style={{ color: stat.color }}
                >
                  {inView && <AnimatedNumber value={stat.value} duration={1.8} />}
                  <span className="text-xl md:text-2xl font-bold text-text-dark dark:text-white/85">{stat.suffix}</span>
                </div>
                <p className="mt-4 text-sm font-bold text-text-dark dark:text-white leading-snug">{stat.label}</p>
                <p className="mt-1 text-xs text-text-muted dark:text-white/55 leading-relaxed">{stat.sub}</p>
                <div className="mt-5 pt-3 border-t border-border-light dark:border-white/10 flex items-center gap-1.5 text-[10px] text-text-muted/85 dark:text-white/50 font-bold uppercase tracking-wide">
                  <ExternalLink size={10} strokeWidth={2.2} />
                  <span className="normal-case tracking-normal">{stat.source}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, delay: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-green/8 to-purple/12 dark:from-primary/20 dark:via-green/12 dark:to-purple/15 border border-primary/35 backdrop-blur-sm p-7 md:p-10"
        >
          <motion.div
            aria-hidden="true"
            className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-primary/30 dark:bg-primary/25 blur-3xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-green/25 dark:bg-green/20 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />

          <div className="relative text-center mb-9">
            <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/40 text-primary rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider mb-5">
              <Sparkles size={13} strokeWidth={2.5} />
              Bagaimana MindBloom Menjawab
            </div>
            <h3 className="text-2xl md:text-4xl font-black tracking-tight leading-tight max-w-3xl mx-auto text-text-dark dark:text-white">
              Deteksi dini, analisis personal, dan intervensi terstruktur, {' '}
              <span className="bg-gradient-to-r from-primary to-green bg-clip-text text-transparent">
                semuanya di satu ruang aman.
              </span>
            </h3>
          </div>

          <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {solutions.map((sol, i) => (
              <motion.div
                key={sol.label}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.55, delay: 1.2 + i * 0.1 }}
                whileHover={{ y: -3 }}
                className="relative bg-white/90 dark:bg-white/[0.06] border border-border-light dark:border-white/15 rounded-2xl p-5 hover:bg-white dark:hover:bg-white/[0.10] hover:border-primary/30 dark:hover:border-white/25 transition-colors shadow-[0_8px_24px_-12px_rgba(23,62,56,0.18)] dark:shadow-none"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-3.5 shadow-[0_0_25px_-10px_rgba(42,175,160,0.55)]">
                  <sol.Icon size={20} strokeWidth={2} />
                </div>
                <h4 className="text-sm font-black mb-1.5 text-text-dark dark:text-white">{sol.label}</h4>
                <p className="text-xs text-text-muted dark:text-white/65 leading-relaxed">{sol.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Features() {
  const items = [
    {
      Icon: Brain, color: '#7B6FCA', bg: 'bg-purple/10', glow: 'shadow-[0_0_60px_-15px_rgba(123,111,202,0.5)]',
      title: 'Analisis Fuzzy Tahani AI',
      desc: 'Bukan sekadar skor, sistem kami memahami nuansa kondisimu lewat logika fuzzy tahani dan derajat keanggotaan.',
    },
    {
      Icon: HandHeart, color: '#2AAFA0', bg: 'bg-primary/10', glow: 'shadow-[0_0_60px_-15px_rgba(42,175,160,0.5)]',
      title: 'Intervensi Terarah',
      desc: 'Terapi musik, meditasi terpandu, dan refleksi jurnal dalam satu alur yang menenangkan.',
    },
    {
      Icon: MapPin, color: '#5EA85C', bg: 'bg-green/10', glow: 'shadow-[0_0_60px_-15px_rgba(94,168,92,0.5)]',
      title: 'Rujukan Profesional',
      desc: 'Temukan psikolog, psikiater, dan layanan darurat terdekat saat kamu membutuhkan lebih.',
    },
  ]

  return (
    <section id="fitur" className="relative py-20 sm:py-28">
      <OrganicBackground variant="subtle" />
      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        <SectionHeading
          eyebrow="Apa yang kamu dapatkan"
          title="Semua yang Kamu Butuhkan"
          subtitle="Tiga pilar inti yang menemani perjalananmu, dari pemahaman diri hingga aksi nyata."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
          {items.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: 'easeOut' }}
              whileHover={{ y: -6 }}
              className={cn(
                'group relative bg-white dark:bg-dark-card border border-border-light dark:border-border-dark rounded-3xl p-7 transition-shadow hover:shadow-2xl',
                f.glow,
              )}
            >
              <div className={cn('inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5', f.bg)}>
                <f.Icon size={28} strokeWidth={1.75} style={{ color: f.color }} />
              </div>
              <h3 className="text-lg font-black text-text-dark dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-text-muted dark:text-[#9FB8B4] leading-relaxed">{f.desc}</p>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={18} strokeWidth={2.5} style={{ color: f.color }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.6'] })
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  const steps = [
    { Icon: ClipboardList, title: 'Jawab Pertanyaan',  desc: '14 pertanyaan singkat untuk memetakan 5 dimensi kondisimu.' },
    { Icon: Brain,          title: 'AI Menganalisis',    desc: 'Logika fuzzy tahani memproses jawabanmu dengan kehalusan nuansa.' },
    { Icon: PieChart,       title: 'Lihat Hasilmu',      desc: 'Skor, distribusi derajat, dan rekomendasi personal.'        },
    { Icon: HandHeart,      title: 'Mulai Intervensi',   desc: 'Tiga langkah aktif: musik, meditasi, dan jurnal refleksi.'  },
  ]

  return (
    <section id="cara-kerja" ref={ref} className="relative py-20 sm:py-28 bg-bg/40 dark:bg-dark-card/40">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <SectionHeading
          eyebrow="Empat langkah sederhana"
          title="Cara Kerja"
          subtitle="Alur yang dirancang untuk lembut, jelas, dan memberdayakan."
        />

        <div className="relative mt-16">
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-9 left-[12.5%] right-[12.5%] h-0.5 bg-border-light dark:bg-border-dark rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-[#3FC2B3] to-green origin-left"
              style={{ scaleX: lineScale }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: i * 0.12, ease: 'easeOut' }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full" />
                  <div className="relative w-[72px] h-[72px] rounded-full bg-gradient-to-br from-primary to-[#1A7A73] text-white flex items-center justify-center shadow-lg shadow-primary/30">
                    <s.Icon size={26} strokeWidth={1.75} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white dark:bg-dark-card border-2 border-primary text-primary text-xs font-black flex items-center justify-center shadow">
                    {i + 1}
                  </div>
                </div>
                <h3 className="mt-5 text-base font-black text-text-dark dark:text-white">{s.title}</h3>
                <p className="mt-1 text-xs text-text-muted dark:text-[#9FB8B4] max-w-[200px] leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CtaBand() {
  return (
    <section className="relative py-20 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#1F8E83] to-[#0D4440]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#ffffff20_0%,transparent_50%),radial-gradient(circle_at_70%_70%,#5EA85C40_0%,transparent_50%)]"
      />
      <motion.div
        aria-hidden="true"
        animate={{ x: ['-25%', '25%', '-25%'] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 left-1/2 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center text-white"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-bold backdrop-blur mb-5">
          <ShieldCheck size={13} strokeWidth={2} />
          Aman, anonim, dan gratis
        </div>
        <h2 className="text-3xl md:text-5xl font-black italic tracking-tight leading-tight">
          Mulai Perjalananmu <br className="hidden sm:block" />
          <span className="not-italic">Hari Ini</span>
        </h2>
        <p className="mt-5 text-white/85 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Satu langkah kecil hari ini adalah investasi terbesar untuk dirimu yang akan datang.
        </p>
        <Link
          to="/register"
          className="mt-8 inline-flex items-center gap-2 px-7 py-4 rounded-2xl text-sm md:text-base font-black text-[#0D4440] bg-white hover:bg-white/95 transition-all shadow-2xl shadow-black/20 hover:scale-[1.03] active:scale-100 group"
        >
          Mulai Skrining
          <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#0D4440] text-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <MindbloomLogo size={30} noMotion />
            <span className="text-lg font-black">MindBloom</span>
          </div>
          <p className="text-sm text-white/65 max-w-sm leading-relaxed">
            Pendamping kesehatan mental berbasis Fuzzy Tahani AI memahami nuansa kondisimu, satu jawaban dalam satu waktu.
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-black text-white/80 uppercase tracking-wider mb-3">Tautan</div>
          {['Tentang', 'Privasi', 'Kontak'].map(l => (
            <a key={l} href="#" className="block text-sm text-white/70 hover:text-white transition-colors">
              {l}
            </a>
          ))}
        </div>

        <div className="space-y-3">
          <div className="text-xs font-black text-white/80 uppercase tracking-wider mb-3">Darurat</div>
          <a
            href="tel:119"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur border border-white/15 rounded-xl px-3 py-2.5 transition-colors"
          >
            <Phone size={16} strokeWidth={2} />
            <div>
              <div className="text-sm font-black leading-none">119 ext 8</div>
              <div className="text-[10px] text-white/65 mt-0.5">SEJIWA 24 jam</div>
            </div>
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <span>Hak cipta &copy; 2026 MindBloom. Seluruh hak dilindungi.</span>
          <span>Bukan pengganti diagnosis klinis profesional.</span>
        </div>
      </div>
    </footer>
  )
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="max-w-2xl mx-auto text-center"
    >
      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-widest mb-3">
        <span className="w-6 h-px bg-primary" />
        {eyebrow}
        <span className="w-6 h-px bg-primary" />
      </div>
      <h2 className="text-3xl md:text-4xl font-black tracking-tight text-text-dark dark:text-white">
        {title}
      </h2>
      <p className="mt-3 text-sm md:text-base text-text-muted dark:text-[#9FB8B4] leading-relaxed">
        {subtitle}
      </p>
    </motion.div>
  )
}
