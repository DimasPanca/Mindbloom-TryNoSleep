import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Eye, EyeOff, Loader2, X } from 'lucide-react'
import MindbloomLogo from '@/components/MindbloomLogo'
import { toast } from 'sonner'
import OrganicBackground from '@/components/OrganicBackground'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

interface PasswordRequirements {
  minLength: boolean
  uppercase: boolean
  number:    boolean
}

interface PasswordStrength {
  level: 0 | 1 | 2 | 3 | 4
  label: string
  barClass: string
  requirements: PasswordRequirements
}

function evaluatePassword(pw: string): PasswordStrength {
  const requirements: PasswordRequirements = {
    minLength: pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    number:    /\d/.test(pw),
  }
  const met  = Object.values(requirements).filter(Boolean).length
  const long = pw.length >= 12

  if (pw.length === 0) {
    return { level: 0, label: '', barClass: 'bg-border-light dark:bg-border-dark', requirements }
  }
  if (met <= 1) {
    return { level: 1, label: 'Lemah', barClass: 'bg-red-500', requirements }
  }
  if (met === 2) {
    return { level: 2, label: 'Cukup', barClass: 'bg-yellow-500', requirements }
  }
  if (met === 3 && !long) {
    return { level: 3, label: 'Kuat', barClass: 'bg-primary', requirements }
  }
  return { level: 4, label: 'Sangat Kuat', barClass: 'bg-green-500', requirements }
}

export default function RegisterPage() {
  const { user, loading: authLoading, signUp } = useAuth()
  const navigate = useNavigate()

  const [name, setName]                       = useState('')
  const [email, setEmail]                     = useState('')
  const [password, setPassword]               = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword]       = useState(false)
  const [submitting, setSubmitting]           = useState(false)

  const strength       = evaluatePassword(password)
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, authLoading, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return

    if (!passwordsMatch) {
      toast.error('Konfirmasi password tidak cocok')
      return
    }
    if (strength.level < 2) {
      toast.error('Password terlalu lemah')
      return
    }

    setSubmitting(true)
    const { error } = await signUp(email, password, name.trim())
    setSubmitting(false)

    if (error) {
      toast.error(error)
      return
    }
    toast.success('Akun berhasil dibuat')
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-bg dark:bg-dark-root overflow-hidden">
      <OrganicBackground variant="auth" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md bg-white/90 dark:bg-[#162925]/90 backdrop-blur-xl rounded-3xl shadow-xl p-8"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted dark:text-[#8EA8A5] hover:text-text-dark dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Kembali
        </Link>

        <div className="flex items-center justify-center gap-2 mb-6">
          <MindbloomLogo size={44} />
          <span className="text-2xl font-black text-text-dark dark:text-white">
            MindBloom
          </span>
        </div>

        <h1 className="text-2xl font-black text-text-dark dark:text-white text-center mb-2">
          Buat Akun Baru
        </h1>
        <p className="text-sm text-text-muted dark:text-[#8EA8A5] text-center mb-8">
          Mulai perjalanan kesehatan mentalmu hari ini
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-text-dark dark:text-white mb-1.5"
            >
              Nama Lengkap
            </label>
            <div className="transition-transform duration-200 focus-within:scale-[1.01]">
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nama lengkap kamu"
                className="w-full px-4 py-3 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#1D2C2A] text-text-dark dark:text-white placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-text-dark dark:text-white mb-1.5"
            >
              Email
            </label>
            <div className="transition-transform duration-200 focus-within:scale-[1.01]">
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-4 py-3 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#1D2C2A] text-text-dark dark:text-white placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-text-dark dark:text-white mb-1.5"
            >
              Password
            </label>
            <div className="relative transition-transform duration-200 focus-within:scale-[1.01]">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Buat password yang kuat"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#1D2C2A] text-text-dark dark:text-white placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-text-dark dark:hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff size={20} strokeWidth={1.5} />
                ) : (
                  <Eye size={20} strokeWidth={1.5} />
                )}
              </button>
            </div>

            {/* Strength bars */}
            {password.length > 0 && (
              <div className="mt-3 flex items-center gap-3">
                <div className="flex gap-1.5 flex-1">
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={cn(
                        'h-1.5 flex-1 rounded-full transition-colors',
                        i < strength.level
                          ? strength.barClass
                          : 'bg-border-light dark:bg-border-dark',
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-text-muted dark:text-[#8EA8A5] min-w-[70px] text-right">
                  {strength.label}
                </span>
              </div>
            )}

            {/* Requirements */}
            <ul className="mt-3 space-y-1.5">
              <RequirementRow ok={strength.requirements.minLength} text="Minimal 8 karakter" />
              <RequirementRow ok={strength.requirements.uppercase} text="Mengandung huruf kapital" />
              <RequirementRow ok={strength.requirements.number}    text="Mengandung angka" />
            </ul>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-text-dark dark:text-white mb-1.5"
            >
              Konfirmasi Password
            </label>
            <div className="transition-transform duration-200 focus-within:scale-[1.01]">
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password"
                className="w-full px-4 py-3 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#1D2C2A] text-text-dark dark:text-white placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">
                Password tidak cocok
              </p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ scale: submitting ? 1 : 1.02 }}
            whileTap={{ scale: submitting ? 1 : 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 size={16} strokeWidth={2} className="animate-spin" />
                Memproses
              </>
            ) : (
              'Daftar'
            )}
          </motion.button>
        </form>

        <p className="text-center text-sm text-text-muted dark:text-[#8EA8A5] mt-6">
          Sudah punya akun?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Masuk di sini
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

function RequirementRow({ ok, text }: { ok: boolean; text: string }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      {ok ? (
        <Check size={14} strokeWidth={2.5} className="text-primary" />
      ) : (
        <X size={14} strokeWidth={2.5} className="text-red-500" />
      )}
      <span
        className={cn(
          'transition-colors',
          ok
            ? 'text-text-dark dark:text-white'
            : 'text-text-muted dark:text-[#8EA8A5]',
        )}
      >
        {text}
      </span>
    </li>
  )
}
