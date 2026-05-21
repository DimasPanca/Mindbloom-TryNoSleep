import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import MindbloomLogo from '@/components/MindbloomLogo'
import { toast } from 'sonner'
import OrganicBackground from '@/components/OrganicBackground'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { user, loading: authLoading, signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [showPassword, setShowPassword]   = useState(false)
  const [submitting, setSubmitting]       = useState(false)

  // Redirect when session is already active
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, authLoading, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)

    if (error) {
      toast.error(error)
      return
    }
    toast.success('Berhasil masuk')
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

        {/* Heading */}
        <h1 className="text-2xl font-black text-text-dark dark:text-white text-center mb-2">
          Selamat Datang Kembali
        </h1>
        <p className="text-sm text-text-muted dark:text-[#8EA8A5] text-center mb-8">
          Masuk untuk melanjutkan perjalanan kesehatan mental Anda
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password"
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
              'Masuk'
            )}
          </motion.button>
        </form>

        <p className="text-center text-sm text-text-muted dark:text-[#8EA8A5] mt-6">
          Belum punya akun?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Daftar sekarang
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
