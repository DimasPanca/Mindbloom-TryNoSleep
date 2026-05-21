import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  ClipboardList, History, Home, Leaf, LifeBuoy, LogOut, Menu, Moon,
  Phone, Sun, User, X,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/contexts/ProfileContext'
import { cn } from '@/lib/utils'
import { spring } from '@/lib/motion'

interface NavItem {
  to: string
  label: string
  Icon: typeof Home
  match: (path: string) => boolean
}

const NAV: NavItem[] = [
  { to: '/dashboard', label: 'Beranda',  Icon: Home,          match: p => p === '/dashboard' },
  { to: '/screening', label: 'Skrining', Icon: ClipboardList, match: p => p.startsWith('/screening') || p.startsWith('/result') || p.startsWith('/intervention') },
  { to: '/history',   label: 'Riwayat',  Icon: History,       match: p => p.startsWith('/history') },
  { to: '/referral',  label: 'Bantuan',  Icon: LifeBuoy,      match: p => p.startsWith('/referral') },
  { to: '/profile',   label: 'Profil',   Icon: User,          match: p => p.startsWith('/profile') },
]

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const { signOut } = useAuth()
  const { profile } = useProfile()
  const { resolvedTheme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  const initials = (profile?.name ?? 'M')
    .trim()
    .split(/\s+/)
    .map(s => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="app-page-shell bg-bg text-text-dark dark:bg-dark-root dark:text-[#F3F0E8]">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 bg-surface/90 dark:bg-[#0C211C]/95 border-r border-border-light/80 dark:border-border-dark/80 backdrop-blur-xl flex-col z-40 shadow-[16px_0_50px_rgba(23,62,56,0.06)] dark:shadow-[16px_0_50px_rgba(0,0,0,0.2)]">
        <div className="px-5 pt-6 pb-5">
          <Link to="/dashboard" className="group flex items-center gap-3">
            <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
              <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl opacity-0 transition-opacity group-hover:opacity-100" />
              <Leaf size={25} strokeWidth={1.8} className="relative" />
            </div>
            <div>
              <span className="block text-xl font-black tracking-tight text-text-dark dark:text-white">MindBloom</span>
              <span className="block text-[11px] font-bold text-text-muted dark:text-[#9EB4AC]">Mental wellness space</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          {NAV.map(({ to, label, Icon, match }) => {
            const active = match(pathname)
            return (
              <motion.div key={to} whileHover={active ? undefined : { x: 3 }} transition={spring}>
                <Link
                  to={to}
                  className={cn(
                    'relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-sm font-black transition-colors',
                    active
                      ? 'text-primary'
                      : 'text-text-muted dark:text-[#9EB4AC] hover:text-text-dark dark:hover:text-white hover:bg-white/55 dark:hover:bg-white/5',
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-2xl bg-primary/10 dark:bg-primary/15"
                      transition={spring}
                    />
                  )}
                  {active && (
                    <motion.div
                      layoutId="sidebar-active-rail"
                      className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-primary"
                      transition={spring}
                    />
                  )}
                  <Icon size={20} strokeWidth={2.1} className="relative z-10" />
                  <span className="relative z-10">{label}</span>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        <div className="px-4 pt-3 pb-5 border-t border-border-light/80 dark:border-border-dark/80 space-y-2.5">
          <Link
            to="/profile"
            className="group flex items-center gap-3 rounded-2xl border border-border-light/80 bg-white/60 px-3 py-2.5 transition-colors hover:bg-white dark:border-border-dark/80 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-sm font-black text-white shadow-lg shadow-primary/20">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-black text-text-dark dark:text-white">
                {profile?.name ?? 'Tanpa Nama'}
              </div>
              <div className="text-[11px] font-bold text-text-muted dark:text-[#9EB4AC]">Lihat profil</div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-sm font-black text-text-muted transition-colors hover:bg-white/65 hover:text-text-dark dark:text-[#9EB4AC] dark:hover:bg-white/5 dark:hover:text-white"
          >
            <span className="flex items-center gap-3">
              {resolvedTheme === 'dark'
                ? <Sun size={18} strokeWidth={2} />
                : <Moon size={18} strokeWidth={2} />}
              {resolvedTheme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            </span>
            <span className="h-2 w-2 rounded-full bg-primary" />
          </button>

          <Link
            to="/emergency"
            className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-red/30 bg-gradient-to-r from-[#FDF0EE] to-[#FFF6F4] px-4 py-2.5 text-red shadow-sm transition-all hover:shadow-md hover:from-red hover:to-[#C84B40] hover:text-white dark:from-[#2A1714] dark:to-[#1F100E] dark:hover:from-red dark:hover:to-[#C84B40]"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-red/15 transition-colors group-hover:bg-white/20">
              <Phone size={16} strokeWidth={2.2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black leading-tight">Bantuan Darurat</span>
              <span className="block text-[11px] font-bold opacity-75 leading-tight">119 ext 8 - 24 jam</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-black text-text-muted transition-colors hover:bg-red/10 hover:text-red dark:text-[#9EB4AC]"
          >
            <LogOut size={18} strokeWidth={2} />
            Keluar
          </button>
        </div>
      </aside>

      <header className="lg:hidden sticky top-0 z-30 h-16 border-b border-border-light/80 bg-surface/90 px-4 backdrop-blur-xl dark:border-border-dark/80 dark:bg-dark-card/90">
        <div className="flex h-full items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Leaf size={22} strokeWidth={1.8} />
            </div>
            <span className="text-lg font-black text-text-dark dark:text-white">MindBloom</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/emergency"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-red/25 bg-red/10 px-3 py-2 text-xs font-black text-red"
            >
              <Phone size={14} strokeWidth={2.2} />
              Darurat
            </Link>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl text-text-muted transition-colors hover:bg-white/70 hover:text-text-dark dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Menu"
            >
              <Menu size={21} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div className="lg:hidden fixed inset-0 z-50 flex" initial={false}>
            <motion.div
              className="absolute inset-0 bg-black/45 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative ml-auto flex h-full w-80 max-w-[86vw] flex-col bg-surface shadow-2xl dark:bg-dark-card"
            >
              <div className="flex items-center justify-between border-b border-border-light px-5 py-4 dark:border-border-dark">
                <div className="flex items-center gap-2.5">
                  <Leaf size={22} strokeWidth={1.8} className="text-primary" />
                  <span className="text-lg font-black text-text-dark dark:text-white">MindBloom</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-xl text-text-muted hover:bg-bg hover:text-text-dark dark:hover:bg-dark-hover dark:hover:text-white"
                  aria-label="Tutup"
                >
                  <X size={20} strokeWidth={2} />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-4">
                {NAV.map(({ to, label, Icon, match }) => {
                  const active = match(pathname)
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-colors',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-text-muted hover:bg-bg hover:text-text-dark dark:text-[#9EB4AC] dark:hover:bg-dark-hover dark:hover:text-white',
                      )}
                    >
                      <Icon size={20} strokeWidth={2.1} />
                      {label}
                    </Link>
                  )
                })}
              </nav>

              <div className="space-y-2 border-t border-border-light p-4 dark:border-border-dark">
                <button
                  type="button"
                  onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                  className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-text-muted hover:bg-bg hover:text-text-dark dark:text-[#9EB4AC] dark:hover:bg-dark-hover dark:hover:text-white"
                >
                  {resolvedTheme === 'dark'
                    ? <Sun size={18} strokeWidth={2} />
                    : <Moon size={18} strokeWidth={2} />}
                  {resolvedTheme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                </button>
                <Link
                  to="/emergency"
                  className="flex items-center gap-3 rounded-2xl border border-red/25 bg-[#FDF0EE] px-4 py-3 text-red dark:bg-[#2A1714]"
                >
                  <Phone size={18} strokeWidth={2.2} />
                  <div className="flex-1">
                    <div className="text-sm font-black leading-tight">Bantuan Darurat</div>
                    <div className="text-[11px] font-bold opacity-75">119 ext 8</div>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-text-muted hover:bg-red/10 hover:text-red dark:text-[#9EB4AC]"
                >
                  <LogOut size={18} strokeWidth={2} />
                  Keluar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="lg:pl-72 pb-20 lg:pb-0">
        {children}
      </main>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border-light/80 bg-surface/90 backdrop-blur-xl dark:border-border-dark/80 dark:bg-dark-card/90">
        <div className="flex h-[4.25rem] items-stretch justify-around px-2">
          {NAV.map(({ to, label, Icon, match }) => {
            const active = match(pathname)
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'relative flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-black transition-colors',
                  active ? 'text-primary' : 'text-text-muted dark:text-[#9EB4AC]',
                )}
              >
                {active && (
                  <motion.div
                    layoutId="bottomnav-active"
                    className="absolute top-0 h-1 w-9 rounded-b-full bg-primary"
                    transition={spring}
                  />
                )}
                <div className={cn('grid h-9 w-9 place-items-center rounded-2xl transition-colors', active && 'bg-primary/10')}>
                  <Icon size={20} strokeWidth={2.1} />
                </div>
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
