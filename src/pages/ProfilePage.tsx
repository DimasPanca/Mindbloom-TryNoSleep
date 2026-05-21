import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowLeft, CalendarPlus, CircleCheck, CircleUser, Eye, EyeOff,
  Loader2, Lock, LogOut, ShieldCheck, Sliders, Sparkles,
} from 'lucide-react'
import AnimatedNumber from '@/components/AnimatedNumber'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/contexts/ProfileContext'
import { hoverLift, spring } from '@/lib/motion'
import {
  getDashboardStats, getLatestScreening, getMoodCheckins, updateProfile,
} from '@/lib/storage'
import supabase from '@/lib/client'
import { cn } from '@/lib/utils'
import { MOOD_CONFIG } from '@/types'
import type { DashboardStats, MoodLevel, Screening } from '@/types'

type Freq = 'daily' | 'weekly' | 'monthly'

const FREQ_OPTIONS: { value: Freq; label: string }[] = [
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
  { value: 'monthly', label: 'Bulanan' },
]

function avgMoodLabel(checkins: { mood: MoodLevel }[]): string {
  if (checkins.length === 0) return '-'
  const avg = checkins.reduce((s, c) => s + MOOD_CONFIG[c.mood].value, 0) / checkins.length
  if (avg < 1.5) return 'Sangat Buruk'
  if (avg < 2.5) return 'Kurang'
  if (avg < 3.5) return 'Biasa'
  if (avg < 4.5) return 'Baik'
  return 'Sangat Baik'
}

function daysSince(iso?: string) {
  if (!iso) return 0
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { profile, refresh } = useProfile()
  const navigate = useNavigate()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [latest, setLatest] = useState<Screening | null>(null)
  const [moodCount, setMoodCount] = useState(0)
  const [avgMood, setAvgMood] = useState('-')

  const [name, setName] = useState('')
  const [age, setAge] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const [notifEnabled, setNotifEnabled] = useState(false)
  const [freq, setFreq] = useState<Freq>('daily')

  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showPwC, setShowPwC] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)

  const [confirmSignOut, setConfirmSignOut] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true })
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '')
      setAge(profile.age ? String(profile.age) : '')
    }
  }, [profile])

  useEffect(() => {
    async function load() {
      const [s, l, m] = await Promise.all([
        getDashboardStats(),
        getLatestScreening(),
        getMoodCheckins(30),
      ])
      setStats(s.data)
      setLatest(l.data)
      setMoodCount(m.data.length)
      setAvgMood(avgMoodLabel(m.data))
    }
    void load()
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('mb_prefs')
    if (stored) {
      try {
        const p = JSON.parse(stored) as { notif?: boolean; freq?: Freq }
        setNotifEnabled(Boolean(p.notif))
        if (p.freq) setFreq(p.freq)
      } catch {
        localStorage.removeItem('mb_prefs')
      }
    }
  }, [])

  function savePrefs(next: { notif: boolean; freq: Freq }) {
    localStorage.setItem('mb_prefs', JSON.stringify(next))
  }

  function toggleNotif() {
    const next = !notifEnabled
    setNotifEnabled(next)
    savePrefs({ notif: next, freq })
  }

  function setFreqAndSave(f: Freq) {
    setFreq(f)
    savePrefs({ notif: notifEnabled, freq: f })
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 2) {
      toast.error('Nama minimal 2 karakter')
      return
    }
    const ageNum = age ? Number(age) : undefined
    if (ageNum !== undefined && (ageNum < 15 || ageNum > 80)) {
      toast.error('Umur harus antara 15 - 80')
      return
    }
    setSaving(true)
    const { error } = await updateProfile({ name: name.trim(), age: ageNum })
    setSaving(false)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Profil tersimpan')
      void refresh()
    }
  }

  async function handleChangePw(e: React.FormEvent) {
    e.preventDefault()
    if (pwNew.length < 6) {
      toast.error('Kata sandi minimal 6 karakter')
      return
    }
    if (pwNew !== pwConfirm) {
      toast.error('Konfirmasi tidak cocok')
      return
    }
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: pwNew })
    setPwSaving(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Kata sandi diubah')
      setPwNew('')
      setPwConfirm('')
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-9 space-y-5">
          <div className="h-10 w-44 skeleton rounded-2xl" />
          <div className="h-44 skeleton rounded-[1.75rem]" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map(i => <div key={i} className="h-28 skeleton rounded-[1.5rem]" />)}
          </div>
          <div className="h-96 skeleton rounded-[1.75rem]" />
        </div>
      </Layout>
    )
  }

  const initials = name.trim().split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase() || 'M'
  const joinedDays = daysSince(profile.created_at)
  const pwMatch = pwNew.length > 0 && pwConfirm.length > 0 && pwNew === pwConfirm

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-9 space-y-5">
        <motion.header
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <Link
            to="/dashboard"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-black text-text-muted transition-colors hover:text-text-dark dark:text-[#9EB4AC] dark:hover:text-white"
          >
            <ArrowLeft size={16} strokeWidth={2.2} />
            Dashboard
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-text-dark dark:text-white">Profil</h1>
          <p className="mt-1 text-sm font-semibold text-text-muted dark:text-[#9EB4AC]">
            Kelola identitas, preferensi, dan keamanan akunmu.
          </p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.08 }}
          whileHover={hoverLift}
          className="relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#2AAFA0_0%,#1A7A73_58%,#173E38_130%)] p-6 text-white shadow-xl shadow-primary/10"
        >
          <div className="absolute -right-12 -top-20 h-52 w-52 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-24 left-20 h-48 w-48 rounded-full bg-yellow/15 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-white/20 text-3xl font-black ring-1 ring-white/20 backdrop-blur">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-2xl font-black">{profile.name || 'Tanpa Nama'}</div>
                <div className="truncate text-sm font-bold text-white/75">{user?.email}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-black sm:w-72">
              <div className="rounded-2xl border border-white/15 bg-white/15 p-3 backdrop-blur">
                <CalendarPlus size={16} strokeWidth={2} className="mb-2" />
                Bergabung {joinedDays} hari lalu
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/15 p-3 backdrop-blur">
                <CircleCheck size={16} strokeWidth={2} className="mb-2" />
                {moodCount} check-in
              </div>
            </div>
          </div>
        </motion.section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MiniStat index={0} label="Total Skrining" value={stats?.totalScreenings ?? 0} />
          <MiniStat index={1} label="Streak Mood" value={stats?.streakDays ?? 0} suffix=" hari" />
          <MiniStat index={2} label="Rata-rata Mood" value={avgMood} />
          <MiniStat index={3} label="Skor Terakhir" value={latest?.fuzzy_score ?? '-'} suffix={latest ? '/100' : ''} decimals={1} />
        </section>

        <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-5">
            <ProfileForm
              name={name}
              age={age}
              saving={saving}
              onNameChange={setName}
              onAgeChange={setAge}
              onSubmit={handleSaveProfile}
            />

            <PasswordForm
              pwNew={pwNew}
              pwConfirm={pwConfirm}
              showPw={showPw}
              showPwC={showPwC}
              pwMatch={pwMatch}
              pwSaving={pwSaving}
              setPwNew={setPwNew}
              setPwConfirm={setPwConfirm}
              setShowPw={setShowPw}
              setShowPwC={setShowPwC}
              onSubmit={handleChangePw}
            />
          </div>

          <div className="space-y-5">
            <PreferencesCard
              notifEnabled={notifEnabled}
              freq={freq}
              toggleNotif={toggleNotif}
              setFreqAndSave={setFreqAndSave}
            />

            <SafetyCard
              confirmSignOut={confirmSignOut}
              setConfirmSignOut={setConfirmSignOut}
              handleSignOut={handleSignOut}
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}

function MiniStat({
  index,
  label,
  value,
  suffix = '',
  decimals = 0,
}: {
  index: number
  label: string
  value: number | string
  suffix?: string
  decimals?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.16 + index * 0.07 }}
      whileHover={hoverLift}
      className="surface-card rounded-[1.5rem] p-4"
    >
      <div className="mb-2 text-xs font-black text-text-muted dark:text-[#9EB4AC]">{label}</div>
      <div className="text-2xl font-black tabular-nums text-text-dark dark:text-white">
        {typeof value === 'number' ? <AnimatedNumber value={value} decimals={decimals} /> : value}
        {suffix && <span className="ml-0.5 text-xs font-black text-text-muted dark:text-[#9EB4AC]">{suffix}</span>}
      </div>
    </motion.div>
  )
}

function ProfileForm({
  name,
  age,
  saving,
  onNameChange,
  onAgeChange,
  onSubmit,
}: {
  name: string
  age: string
  saving: boolean
  onNameChange: (value: string) => void
  onAgeChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.28 }}
      whileHover={hoverLift}
      className="surface-card rounded-[1.75rem] p-5 space-y-4"
    >
      <SectionTitle Icon={CircleUser} title="Informasi Profil" />

      <div className="space-y-1.5">
        <label className="text-xs font-black text-text-muted dark:text-[#9EB4AC]">Nama Lengkap</label>
        <input
          type="text"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          className="soft-input w-full rounded-2xl border px-4 py-3 text-sm font-bold text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/35 dark:text-white"
        />
        {name.length > 0 && name.trim().length < 2 && (
          <p className="text-[11px] font-black text-red">Nama minimal 2 karakter</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-black text-text-muted dark:text-[#9EB4AC]">Umur</label>
        <input
          type="number"
          min={15}
          max={80}
          value={age}
          onChange={e => onAgeChange(e.target.value)}
          className="soft-input w-full rounded-2xl border px-4 py-3 text-sm font-bold text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/35 dark:text-white"
        />
        {age && (Number(age) < 15 || Number(age) > 80) && (
          <p className="text-[11px] font-black text-red">Umur harus antara 15 - 80</p>
        )}
      </div>

      <motion.button
        type="submit"
        disabled={saving}
        whileHover={saving ? undefined : { scale: 1.01 }}
        whileTap={saving ? undefined : { scale: 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-black text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
      >
        {saving && <Loader2 size={16} strokeWidth={2} className="animate-spin" />}
        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
      </motion.button>
    </motion.form>
  )
}

function PreferencesCard({
  notifEnabled,
  freq,
  toggleNotif,
  setFreqAndSave,
}: {
  notifEnabled: boolean
  freq: Freq
  toggleNotif: () => void
  setFreqAndSave: (freq: Freq) => void
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.34 }}
      whileHover={hoverLift}
      className="surface-card rounded-[1.75rem] p-5 space-y-4"
    >
      <SectionTitle Icon={Sliders} title="Preferensi" />

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-black text-text-dark dark:text-white">Notifikasi Pengingat</div>
          <div className="text-xs font-semibold text-text-muted dark:text-[#9EB4AC]">Aktifkan pengingat skrining berkala</div>
        </div>
        <button
          type="button"
          onClick={toggleNotif}
          className={cn(
            'flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors',
            notifEnabled ? 'bg-primary' : 'bg-border-light dark:bg-border-dark',
          )}
        >
          <motion.div
            animate={{ x: notifEnabled ? 20 : 0 }}
            transition={spring}
            className="h-5 w-5 rounded-full bg-white shadow"
          />
        </button>
      </div>

      {notifEnabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={spring}
          className="space-y-2 border-t border-border-light pt-4 dark:border-border-dark"
        >
          <div className="text-xs font-black text-text-muted dark:text-[#9EB4AC]">Frekuensi Pengingat</div>
          <div className="grid grid-cols-3 gap-2">
            {FREQ_OPTIONS.map(f => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFreqAndSave(f.value)}
                className={cn(
                  'rounded-2xl px-3 py-2.5 text-xs font-black transition-colors',
                  freq === f.value
                    ? 'bg-primary text-white'
                    : 'bg-surface-soft text-text-muted hover:text-text-dark dark:bg-dark-hover dark:text-[#9EB4AC] dark:hover:text-white',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.section>
  )
}

function PasswordForm({
  pwNew,
  pwConfirm,
  showPw,
  showPwC,
  pwMatch,
  pwSaving,
  setPwNew,
  setPwConfirm,
  setShowPw,
  setShowPwC,
  onSubmit,
}: {
  pwNew: string
  pwConfirm: string
  showPw: boolean
  showPwC: boolean
  pwMatch: boolean
  pwSaving: boolean
  setPwNew: (value: string) => void
  setPwConfirm: (value: string) => void
  setShowPw: React.Dispatch<React.SetStateAction<boolean>>
  setShowPwC: React.Dispatch<React.SetStateAction<boolean>>
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.4 }}
      whileHover={hoverLift}
      className="surface-card rounded-[1.75rem] p-5 space-y-4"
    >
      <SectionTitle Icon={Lock} title="Ubah Kata Sandi" />
      <PasswordInput label="Kata Sandi Baru" value={pwNew} show={showPw} setShow={setShowPw} onChange={setPwNew} />
      <PasswordInput label="Konfirmasi Kata Sandi" value={pwConfirm} show={showPwC} setShow={setShowPwC} onChange={setPwConfirm} />
      {pwConfirm.length > 0 && (
        <p className={cn('text-[11px] font-black', pwMatch ? 'text-green' : 'text-red')}>
          {pwMatch ? 'Kata sandi cocok' : 'Konfirmasi belum cocok'}
        </p>
      )}
      <motion.button
        type="submit"
        disabled={pwSaving || !pwMatch || pwNew.length < 6}
        whileHover={pwMatch && pwNew.length >= 6 ? { scale: 1.01 } : undefined}
        whileTap={pwMatch && pwNew.length >= 6 ? { scale: 0.98 } : undefined}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-black text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
      >
        {pwSaving && <Loader2 size={16} strokeWidth={2} className="animate-spin" />}
        {pwSaving ? 'Mengubah...' : 'Ubah Kata Sandi'}
      </motion.button>
    </motion.form>
  )
}

function PasswordInput({
  label,
  value,
  show,
  setShow,
  onChange,
}: {
  label: string
  value: string
  show: boolean
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-black text-text-muted dark:text-[#9EB4AC]">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="soft-input w-full rounded-2xl border px-4 py-3 pr-11 text-sm font-bold text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/35 dark:text-white"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-dark dark:hover:text-white"
        >
          {show ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
        </button>
      </div>
    </div>
  )
}

function SafetyCard({
  confirmSignOut,
  setConfirmSignOut,
  handleSignOut,
}: {
  confirmSignOut: boolean
  setConfirmSignOut: (value: boolean) => void
  handleSignOut: () => void
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.46 }}
      whileHover={hoverLift}
      className="rounded-[1.75rem] border border-red/20 bg-[#FDF0EE]/95 p-5 shadow-lg shadow-red/5 dark:bg-[#21110F]/90"
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-red/10">
          <ShieldCheck size={20} strokeWidth={1.8} className="text-red" />
        </div>
        <div>
          <h2 className="text-base font-black text-red">Privasi & Keamanan</h2>
          <p className="text-xs font-semibold text-red/80">Perlindungan data akun</p>
        </div>
      </div>
      <p className="mb-4 text-sm font-semibold leading-relaxed text-text-dark dark:text-white">
        Data Anda dienkripsi dan tidak dibagikan kepada pihak ketiga.
      </p>

      {confirmSignOut ? (
        <div className="space-y-2">
          <p className="text-xs font-black text-red">Yakin ingin keluar dari akun?</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 rounded-2xl bg-red py-2.5 text-sm font-black text-white transition-colors hover:bg-red/90"
            >
              <LogOut size={14} strokeWidth={2} />
              Ya, Keluar
            </button>
            <button
              type="button"
              onClick={() => setConfirmSignOut(false)}
              className="rounded-2xl border border-red/20 py-2.5 text-sm font-black text-text-dark transition-colors hover:bg-red/10 dark:text-white"
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmSignOut(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red py-3 text-sm font-black text-red transition-colors hover:bg-red/10"
        >
          <LogOut size={15} strokeWidth={2} />
          Keluar dari Akun
        </button>
      )}
    </motion.section>
  )
}

function SectionTitle({ Icon, title }: { Icon: typeof Sparkles; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/10">
        <Icon size={18} strokeWidth={1.8} className="text-primary" />
      </div>
      <h2 className="text-base font-black text-text-dark dark:text-white">{title}</h2>
    </div>
  )
}
