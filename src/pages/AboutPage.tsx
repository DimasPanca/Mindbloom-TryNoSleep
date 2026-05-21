import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, ArrowLeft, ArrowRight, Award, BookOpen, Brain, ClipboardList,
  Database, Globe, Heart, HeartHandshake, Info, Layers, Leaf, Lightbulb,
  Lock, Moon, Network, Shield, ShieldCheck, Sparkles, Target,
  TrendingUp, UserCheck, Users, Zap,
} from 'lucide-react'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { hoverLift, spring } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { ComponentType, CSSProperties } from 'react'

type IconC = ComponentType<{ size?: number; strokeWidth?: number; className?: string; style?: CSSProperties }>

interface Step {
  num: number
  Icon: IconC
  title: string
  desc: string
  color: string
}

const STEPS: Step[] = [
  {
    num: 1,
    Icon: UserCheck,
    title: 'Daftar & Buat Profil',
    desc: 'Buat akun dengan email. Data kamu terenkripsi dan tidak dibagikan ke pihak lain.',
    color: '#2AAFA0',
  },
  {
    num: 2,
    Icon: ClipboardList,
    title: 'Skrining Adaptif',
    desc: '14 pertanyaan dipilih dari 100 soal berdasarkan dimensi kesehatan mental yang perlu fokus.',
    color: '#7B6FCA',
  },
  {
    num: 3,
    Icon: Brain,
    title: 'Analisis Fuzzy Tahani',
    desc: 'Sistem mengukur kondisimu di 4 kategori sekaligus dengan derajat keanggotaan, bukan hitam-putih.',
    color: '#D9A23B',
  },
  {
    num: 4,
    Icon: Heart,
    title: 'Intervensi Personal',
    desc: 'Program 3 langkah: musik relaksasi, meditasi terpandu, dan jurnal refleksi.',
    color: '#E0914A',
  },
  {
    num: 5,
    Icon: TrendingUp,
    title: 'Tracking & Insight',
    desc: 'Pantau kemajuanmu lewat kalender mood, riwayat skrining, dan rekomendasi adaptif.',
    color: '#5EA85C',
  },
]

interface Dim {
  Icon: IconC
  label: string
  color: string
  bg: string
  desc: string
}

const DIMENSIONS: Dim[] = [
  { Icon: Heart,    label: 'Emosi',     color: '#2AAFA0', bg: 'bg-teal-100 dark:bg-teal-950/40',   desc: 'Stabilitas perasaan' },
  { Icon: Moon,     label: 'Tidur',     color: '#7B6FCA', bg: 'bg-purple-100 dark:bg-purple-950/40', desc: 'Kualitas istirahat' },
  { Icon: Zap,      label: 'Energi',    color: '#D9A23B', bg: 'bg-yellow-100 dark:bg-yellow-950/40', desc: 'Motivasi harian' },
  { Icon: Users,    label: 'Sosial',    color: '#5EA85C', bg: 'bg-green-100 dark:bg-green-950/40',  desc: 'Interaksi & relasi' },
  { Icon: Activity, label: 'Kecemasan', color: '#E0665A', bg: 'bg-red-100 dark:bg-red-950/40',     desc: 'Tingkat khawatir' },
]

interface OutcomeMilestone {
  period: string
  title: string
  desc: string
  Icon: IconC
}

const OUTCOMES: OutcomeMilestone[] = [
  {
    period: 'Minggu 1',
    title: 'Kesadaran Diri',
    desc: 'Mulai memahami pola emosi, tidur, dan energi harianmu lewat check-in mood.',
    Icon: Lightbulb,
  },
  {
    period: 'Bulan 1',
    title: 'Pola Terbaca',
    desc: 'Sistem mendeteksi pola hari/dimensi yang rentan dan memberikan rekomendasi spesifik.',
    Icon: Network,
  },
  {
    period: 'Bulan 3',
    title: 'Kebiasaan Sehat',
    desc: 'Rutinitas intervensi mulai terbentuk. Skor fuzzy meningkat secara konsisten.',
    Icon: Sparkles,
  },
  {
    period: 'Bulan 6+',
    title: 'Sustainability',
    desc: 'Kemampuan mengenali dini gejala memburuk dan mengambil tindakan tanpa bergantung pada aplikasi.',
    Icon: Award,
  },
]

interface Tip {
  Icon: IconC
  title: string
  desc: string
}

const TIPS: Tip[] = [
  { Icon: ClipboardList, title: 'Skrining Rutin',     desc: 'Lakukan skrining ulang minimal 1-2 minggu sekali untuk tracking akurat.' },
  { Icon: Heart,         title: 'Check-in Harian',    desc: 'Catat mood setiap hari, idealnya di waktu yang sama untuk pola yang konsisten.' },
  { Icon: BookOpen,      title: 'Selesaikan Intervensi', desc: 'Jangan skip langkah intervensi. Setiap modul (musik, video, jurnal) saling melengkapi.' },
  { Icon: Lightbulb,     title: 'Refleksi Jurnal',    desc: 'Tulis perasaan jujur. Tidak ada yang membaca selain kamu, jadi tidak perlu disensor.' },
  { Icon: ShieldCheck,   title: 'Cari Bantuan Profesional', desc: 'Jika skor menunjukkan severitas berat, segera konsultasi ke psikolog atau psikiater.' },
  { Icon: Users,         title: 'Bangun Support System', desc: 'Diskusikan progressmu dengan orang terpercaya, keluarga, atau komunitas.' },
]

interface SDGCard {
  target: string
  title: string
  desc: string
  Icon: IconC
}

const SDG_TARGETS: SDGCard[] = [
  {
    target: '3.4',
    title: 'Promosi Kesehatan Mental',
    desc: 'Mempromosikan kesehatan dan kesejahteraan mental sebagai bagian dari kesehatan menyeluruh.',
    Icon: HeartHandshake,
  },
  {
    target: '3.5',
    title: 'Pencegahan Dini',
    desc: 'Memperkuat pencegahan dan deteksi dini gangguan kesehatan jiwa.',
    Icon: Shield,
  },
  {
    target: '3.8',
    title: 'Akses Kesehatan Universal',
    desc: 'Memberikan akses layanan kesehatan mental berkualitas, gratis, dan inklusif.',
    Icon: Globe,
  },
]

interface PrivacyPoint {
  Icon: IconC
  title: string
  desc: string
}

const PRIVACY_POINTS: PrivacyPoint[] = [
  { Icon: Lock,     title: 'Data Terenkripsi',    desc: 'Semua data tersimpan dengan enkripsi end-to-end di Supabase (PostgreSQL).' },
  { Icon: Database, title: 'Penyimpanan Aman',    desc: 'Database dengan Row Level Security: hanya kamu yang bisa akses data pribadimu.' },
  { Icon: Shield,   title: 'Tidak Dibagikan',     desc: 'Data kesehatan mentalmu tidak dijual atau dibagikan ke pihak ketiga.' },
  { Icon: UserCheck, title: 'Hak Penuh atas Data', desc: 'Kamu bisa ekspor atau hapus seluruh datamu kapan saja melalui halaman profil.' },
]

export default function AboutPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true })
  }, [user, authLoading, navigate])

  if (authLoading || !user) return null

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-9 space-y-6">

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
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.06 }}
          whileHover={hoverLift}
          className="relative overflow-hidden rounded-[1.75rem] p-7 sm:p-9 text-white shadow-2xl shadow-text-dark/20"
          style={{ background: 'linear-gradient(135deg, #0F3D38 0%, #2AAFA0 55%, #62B16E 100%)' }}
        >
          <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-yellow/20 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1.5 mb-4">
              <Info size={14} strokeWidth={2.5} />
              <span className="text-[11px] font-black uppercase tracking-wider">Tentang Sistem</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-3">
              Kenali Sistem di Balik MindBloom
            </h1>
            <p className="text-sm sm:text-base font-semibold leading-relaxed text-white/85 max-w-2xl">
              Mental wellness space berbasis <strong>Fuzzy Tahani</strong>, dirancang untuk mendeteksi
              dan mendampingi kondisi kesehatan mentalmu secara halus, adaptif, dan personal.
            </p>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6">
              <div className="rounded-2xl bg-white/15 backdrop-blur p-3 text-center">
                <div className="text-2xl sm:text-3xl font-black tabular-nums">100</div>
                <div className="text-[10px] sm:text-[11px] font-bold opacity-85">Soal Tervalidasi</div>
              </div>
              <div className="rounded-2xl bg-white/15 backdrop-blur p-3 text-center">
                <div className="text-2xl sm:text-3xl font-black tabular-nums">5</div>
                <div className="text-[10px] sm:text-[11px] font-bold opacity-85">Dimensi Mental</div>
              </div>
              <div className="rounded-2xl bg-white/15 backdrop-blur p-3 text-center">
                <div className="text-2xl sm:text-3xl font-black tabular-nums">AI</div>
                <div className="text-[10px] sm:text-[11px] font-bold opacity-85">Fuzzy Tahani</div>
              </div>
            </div>
          </div>
        </motion.section>

        <Section
          title="5 Dimensi Kesehatan Mental"
          subtitle="Sistem mengukur kondisimu di lima area utama yang saling terhubung"
          delay={0.12}
        >
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {DIMENSIONS.map((d, i) => (
              <motion.div
                key={d.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.16 + i * 0.05 }}
                whileHover={hoverLift}
                className={cn('rounded-2xl p-4 text-center', d.bg)}
              >
                <div
                  className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl"
                  style={{ backgroundColor: `${d.color}22` }}
                >
                  <d.Icon size={20} strokeWidth={1.8} style={{ color: d.color }} />
                </div>
                <div className="text-sm font-black text-text-dark dark:text-white">{d.label}</div>
                <div className="text-[10px] font-bold mt-0.5" style={{ color: d.color }}>{d.desc}</div>
              </motion.div>
            ))}
          </div>
        </Section>

        <Section
          title="Bagaimana Cara Kerjanya"
          subtitle="5 langkah dari pendaftaran hingga monitoring jangka panjang"
          delay={0.2}
        >
          <div className="relative space-y-3">
            <div className="absolute left-[27px] top-12 bottom-12 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent hidden sm:block" />
            {STEPS.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.24 + i * 0.08 }}
                whileHover={hoverLift}
                className="relative flex items-start gap-4 rounded-2xl border border-border-light/70 bg-white/60 p-4 dark:border-border-dark/70 dark:bg-white/5"
              >
                <div className="relative shrink-0">
                  <div
                    className="grid h-14 w-14 place-items-center rounded-2xl text-white shadow-md"
                    style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}CC)` }}
                  >
                    <s.Icon size={22} strokeWidth={1.8} />
                  </div>
                  <div
                    className="absolute -top-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-white text-[11px] font-black shadow-sm dark:bg-dark-card"
                    style={{ color: s.color }}
                  >
                    {s.num}
                  </div>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="text-base font-black text-text-dark dark:text-white">{s.title}</h3>
                  <p className="mt-1 text-sm font-semibold leading-relaxed text-text-muted dark:text-[#8EA8A5]">
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.34 }}
          whileHover={hoverLift}
          className="surface-card rounded-[1.75rem] p-5 sm:p-7"
        >
          <div className="mb-5 flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-purple/15">
              <Brain size={22} strokeWidth={1.8} className="text-purple" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-text-dark dark:text-white">Apa itu Fuzzy Tahani?</h2>
              <p className="mt-1 text-sm font-semibold text-text-muted dark:text-[#8EA8A5]">
                Sistem klasifikasi halus yang menilai kondisi mentalmu di banyak kategori sekaligus, bukan hitam-putih.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border-light dark:border-border-dark p-4">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 px-2 py-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">Cara Biasa</span>
              </div>
              <p className="text-sm font-bold text-text-dark dark:text-white mb-1.5">Klasifikasi Kaku</p>
              <p className="text-xs font-semibold leading-relaxed text-text-muted dark:text-[#8EA8A5]">
                "Kamu Normal" atau "Kamu Berat". Tidak ada zona abu-abu, padahal kondisi mental jarang hitam-putih.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-4 dark:bg-primary/10">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-primary/15 px-2 py-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-primary">MindBloom</span>
              </div>
              <p className="text-sm font-bold text-text-dark dark:text-white mb-1.5">Klasifikasi Halus</p>
              <p className="text-xs font-semibold leading-relaxed text-text-muted dark:text-[#8EA8A5]">
                "70% Normal, 25% Ringan, 5% Sedang". Lebih jujur, akurat, dan sesuai realita kondisi mental manusia.
              </p>
            </div>

            <div className="rounded-2xl border border-border-light dark:border-border-dark p-4">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-yellow/15 px-2 py-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-yellow">Manfaat</span>
              </div>
              <p className="text-sm font-bold text-text-dark dark:text-white mb-1.5">Rekomendasi Tepat</p>
              <p className="text-xs font-semibold leading-relaxed text-text-muted dark:text-[#8EA8A5]">
                Sistem bisa menentukan intervensi yang paling cocok berdasarkan derajat keanggotaan tertinggi.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-bg/60 dark:bg-dark-hover/50 p-5">
            <p className="text-[11px] font-black uppercase tracking-wider text-text-muted dark:text-[#8EA8A5] mb-3">
              Alur Pemrosesan
            </p>
            <div className="grid gap-3 sm:grid-cols-5 sm:items-stretch">
              <FlowBox label="Input" sub="Skor 5 Dimensi" color="#2AAFA0" Icon={Layers} idx={0} />
              <FlowArrow />
              <FlowBox label="Fuzzifikasi" sub="Membership Function" color="#7B6FCA" Icon={Brain} idx={1} />
              <FlowArrow />
              <FlowBox label="Output" sub="Skor + Severity + Ranking" color="#5EA85C" Icon={Target} idx={2} />
            </div>
            <p className="mt-4 text-xs font-semibold leading-relaxed text-text-muted dark:text-[#8EA8A5]">
              <strong className="text-text-dark dark:text-white">Operator MIN</strong> digunakan untuk konjungsi AND
              antar kondisi dalam knowledge base. Setiap rekomendasi punya beberapa kondisi (misal: "mood = buruk DAN
              sleep = cukup"), dan sistem mengambil <em>derajat keanggotaan minimum</em> dari semua kondisi sebagai
              skor cocok. Hasilnya: rekomendasi yang paling sesuai dengan kondisimu muncul di atas.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.42 }}
          whileHover={hoverLift}
          className="surface-card rounded-[1.75rem] p-5 sm:p-7"
        >
          <div className="mb-5 flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-yellow/15">
              <Lightbulb size={22} strokeWidth={1.8} className="text-yellow" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-text-dark dark:text-white">
                Kenapa Soalnya Berbeda Tiap Skrining?
              </h2>
              <p className="mt-1 text-sm font-semibold text-text-muted dark:text-[#8EA8A5]">
                Sistem memilih 14 dari 100 soal secara <strong>adaptif</strong> berdasarkan kondisimu sebelumnya.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <SelectionCard
              tag="5 Soal Kritis"
              color="#E0665A"
              title="Deteksi Severe"
              desc="Pertanyaan paling berbobot untuk mendeteksi gejala berat di setiap dimensi. Selalu disertakan."
              idx={0}
            />
            <SelectionCard
              tag="5 Soal Inti"
              color="#2AAFA0"
              title="Baseline Stabil"
              desc="Pertanyaan dasar untuk menjaga konsistensi pengukuran lintas waktu."
              idx={1}
            />
            <SelectionCard
              tag="4 Soal Adaptif"
              color="#D9A23B"
              title="Fokus Dimensi Lemah"
              desc="Berdasarkan hasil skrining sebelumnya, sistem menambah pertanyaan di dimensi yang paling perlu perhatian."
              idx={2}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-4">
            <div className="flex items-start gap-2.5">
              <Info size={16} strokeWidth={2} className="text-primary shrink-0 mt-0.5" />
              <p className="text-xs font-semibold leading-relaxed text-text-dark dark:text-white">
                <strong>Contoh:</strong> Jika skrining pertama menunjukkan dimensi <em>tidur</em> dan <em>energi</em>
                {' '}lemah, skrining berikutnya akan punya lebih banyak pertanyaan seputar pola tidur dan motivasi.
                Sistem menghindari overlap soal yang sama setiap minggu dan tetap menjaga validitas pengukuran.
              </p>
            </div>
          </div>
        </motion.section>

        <Section
          title="Apa yang Bisa Kamu Capai?"
          subtitle="Perjalanan realistis dengan MindBloom"
          delay={0.5}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {OUTCOMES.map((o, i) => (
              <motion.div
                key={o.period}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.54 + i * 0.06 }}
                whileHover={hoverLift}
                className="relative overflow-hidden rounded-2xl border border-border-light bg-white/70 p-4 dark:border-border-dark dark:bg-white/5"
              >
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/8 blur-2xl" />
                <div className="relative">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 mb-3">
                    <o.Icon size={12} strokeWidth={2.5} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary">{o.period}</span>
                  </div>
                  <h3 className="text-sm font-black text-text-dark dark:text-white mb-1">{o.title}</h3>
                  <p className="text-xs font-semibold leading-relaxed text-text-muted dark:text-[#8EA8A5]">{o.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        <Section
          title="Tips Memanfaatkan Sebaik Mungkin"
          subtitle="6 kebiasaan kecil untuk hasil maksimal"
          delay={0.6}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TIPS.map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.64 + i * 0.05 }}
                whileHover={hoverLift}
                className="surface-card rounded-2xl p-4"
              >
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary/10">
                  <t.Icon size={18} strokeWidth={1.8} className="text-primary" />
                </div>
                <h3 className="text-sm font-black text-text-dark dark:text-white mb-1">{t.title}</h3>
                <p className="text-xs font-semibold leading-relaxed text-text-muted dark:text-[#8EA8A5]">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.7 }}
          whileHover={hoverLift}
          className="relative overflow-hidden rounded-[1.75rem] p-6 sm:p-7 text-white"
          style={{ background: 'linear-gradient(135deg, #1B4D8C 0%, #2D9CDB 55%, #6BC7FF 100%)' }}
        >
          <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/15 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 backdrop-blur">
                <Globe size={18} strokeWidth={1.8} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider opacity-90">Kontribusi SDGs 3</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-2">Good Health & Well-being</h2>
            <p className="text-sm font-semibold leading-relaxed text-white/85 max-w-2xl mb-5">
              MindBloom mendukung Sustainable Development Goals nomor 3 dari PBB: memastikan hidup sehat dan
              kesejahteraan untuk semua usia, dengan fokus khusus pada akses kesehatan mental.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              {SDG_TARGETS.map((sdg, i) => (
                <motion.div
                  key={sdg.target}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 0.74 + i * 0.06 }}
                  whileHover={{ y: -3 }}
                  className="rounded-2xl bg-white/15 backdrop-blur border border-white/20 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <sdg.Icon size={20} strokeWidth={1.8} />
                    <span className="text-[10px] font-black uppercase tracking-wider rounded-full bg-white/20 px-2 py-0.5">
                      Target {sdg.target}
                    </span>
                  </div>
                  <h3 className="text-sm font-black mb-1">{sdg.title}</h3>
                  <p className="text-[11px] font-semibold leading-relaxed text-white/85">{sdg.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-white/12 backdrop-blur border border-white/15 p-4">
              <p className="text-[11px] font-black uppercase tracking-wider opacity-85 mb-2">Bagaimana Sustainable?</p>
              <ul className="space-y-1.5 text-xs font-semibold leading-relaxed text-white/90">
                <li className="flex items-start gap-2">
                  <Leaf size={14} strokeWidth={2.5} className="shrink-0 mt-0.5" />
                  <span><strong>Self-help based:</strong> Membangun kemampuan refleksi diri agar user tidak bergantung pada aplikasi selamanya.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Leaf size={14} strokeWidth={2.5} className="shrink-0 mt-0.5" />
                  <span><strong>Gratis & Inklusif:</strong> Tidak ada biaya berlangganan; siapa saja dengan koneksi internet bisa mengakses.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Leaf size={14} strokeWidth={2.5} className="shrink-0 mt-0.5" />
                  <span><strong>Referral System:</strong> Mengarahkan kasus berat ke psikolog/psikiater profesional, bukan menggantikan mereka.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Leaf size={14} strokeWidth={2.5} className="shrink-0 mt-0.5" />
                  <span><strong>Edukasi Berkelanjutan:</strong> Setiap interaksi menambah pemahaman user tentang kesehatan mentalnya sendiri.</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        <Section
          title="Privasi & Keamanan Data"
          subtitle="Komitmen kami menjaga data kesehatan mentalmu"
          delay={0.82}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {PRIVACY_POINTS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -12 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.86 + i * 0.05 }}
                whileHover={hoverLift}
                className="surface-card rounded-2xl p-4 flex items-start gap-3"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green/15">
                  <p.Icon size={18} strokeWidth={1.8} className="text-green" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-text-dark dark:text-white mb-1">{p.title}</h3>
                  <p className="text-xs font-semibold leading-relaxed text-text-muted dark:text-[#8EA8A5]">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.96 }}
          whileHover={hoverLift}
          className="relative overflow-hidden rounded-[1.75rem] p-6 sm:p-7 text-white"
          style={{ background: 'linear-gradient(135deg, #173E37 0%, #2AAFA0 50%, #6FC68C 100%)' }}
        >
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/20 blur-3xl" />

          <div className="relative">
            <Sparkles size={32} strokeWidth={1.5} className="mb-3" />
            <h2 className="text-xl sm:text-2xl font-black mb-2">Siap Memulai?</h2>
            <p className="text-sm font-semibold leading-relaxed text-white/85 max-w-xl mb-5">
              Cara terbaik memahami sistem ini adalah dengan mencobanya. Mulai dari skrining pertama,
              check-in mood harian, dan lihat sendiri bagaimana sistem memahami kondisimu.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link
                to="/screening"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-primary-dark transition-colors hover:bg-cream"
              >
                <ClipboardList size={16} strokeWidth={2.5} />
                Mulai Skrining
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/15 px-5 py-3 text-sm font-black text-white backdrop-blur transition-colors hover:bg-white/25"
              >
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        </motion.section>

        <p className="text-center text-xs font-semibold leading-relaxed text-text-muted dark:text-[#8EA8A5] py-2 px-4">
          MindBloom bukan pengganti diagnosis klinis. Untuk kondisi yang mendesak, segera hubungi profesional
          kesehatan mental atau hotline darurat 119 ext 8.
        </p>
      </div>
    </Layout>
  )
}

function Section({
  title,
  subtitle,
  children,
  delay,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  delay: number
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-dark dark:text-white">{title}</h2>
        <p className="mt-1 text-sm font-semibold text-text-muted dark:text-[#8EA8A5]">{subtitle}</p>
      </div>
      {children}
    </motion.section>
  )
}

function FlowBox({
  label,
  sub,
  color,
  Icon,
  idx,
}: {
  label: string
  sub: string
  color: string
  Icon: IconC
  idx: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...spring, delay: 0.4 + idx * 0.1 }}
      className="rounded-2xl border-2 p-3.5 text-center bg-white dark:bg-dark-card sm:col-span-1"
      style={{ borderColor: `${color}44` }}
    >
      <div
        className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="text-xs font-black text-text-dark dark:text-white">{label}</div>
      <div className="text-[10px] font-bold mt-0.5" style={{ color }}>{sub}</div>
    </motion.div>
  )
}

function FlowArrow() {
  return (
    <div className="flex items-center justify-center sm:col-span-1">
      <ArrowRight size={20} strokeWidth={2} className="text-text-muted/50 dark:text-[#8EA8A5]/60 rotate-90 sm:rotate-0" />
    </div>
  )
}

function SelectionCard({
  tag,
  color,
  title,
  desc,
  idx,
}: {
  tag: string
  color: string
  title: string
  desc: string
  idx: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.46 + idx * 0.06 }}
      whileHover={hoverLift}
      className="rounded-2xl border-2 p-4"
      style={{ borderColor: `${color}33`, backgroundColor: `${color}08` }}
    >
      <div
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 mb-2"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        <span className="text-[10px] font-black uppercase tracking-wider">{tag}</span>
      </div>
      <h3 className="text-sm font-black text-text-dark dark:text-white mb-1">{title}</h3>
      <p className="text-xs font-semibold leading-relaxed text-text-muted dark:text-[#8EA8A5]">{desc}</p>
    </motion.div>
  )
}
