import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Ambulance, ArrowLeft, ClipboardList, Crosshair, ExternalLink,
  GraduationCap, Hospital, Layers, Loader2, LocateFixed, MapPin,
  MessagesSquare, Phone, PhoneCall, Search, Stethoscope, TriangleAlert,
  UserRound, Users,
} from 'lucide-react'
import Layout from '@/components/Layout'
import { hoverLift, spring } from '@/lib/motion'
import { cn } from '@/lib/utils'

type Coords = { lat: number; lon: number; label?: string }

const CITY_PRESETS: { name: string; lat: number; lon: number }[] = [
  { name: 'Serang', lat: -6.1104, lon: 106.1640 },
  { name: 'Tangerang', lat: -6.1781, lon: 106.63 },
  { name: 'Jakarta', lat: -6.2088, lon: 106.8456 },
  { name: 'Bandung', lat: -6.9175, lon: 107.6191 },
  { name: 'Yogyakarta', lat: -7.7956, lon: 110.3695 },
  { name: 'Surabaya', lat: -7.2575, lon: 112.7521 },
]

const DEFAULT_COORDS: Coords = { ...CITY_PRESETS[0], label: 'Serang' }

const SEARCH_CARDS = [
  { Icon: UserRound, label: 'Psikolog Klinis', desc: 'Terapis untuk konseling dan CBT', q: 'psikolog klinis' },
  { Icon: Stethoscope, label: 'Psikiater', desc: 'Dokter spesialis kesehatan jiwa', q: 'psikiater' },
  { Icon: GraduationCap, label: 'Konseling Kampus', desc: 'Layanan konseling di universitas', q: 'konseling kampus universitas' },
  { Icon: Hospital, label: 'Puskesmas Jiwa', desc: 'Layanan kesehatan jiwa pemerintah', q: 'puskesmas kesehatan jiwa' },
  { Icon: MessagesSquare, label: 'Konseling Online', desc: 'Layanan konseling jarak jauh', q: 'konseling online' },
  { Icon: Ambulance, label: 'IGD Rumah Sakit', desc: 'Untuk keadaan darurat jiwa', q: 'IGD rumah sakit' },
] as const

const HOTLINES = [
  { name: 'SEJIWA', number: '119 ext 8', tel: '119', desc: '24 jam, gratis' },
  { name: 'PSC 119', number: '119', tel: '119', desc: 'Pusat krisis nasional' },
  { name: 'SAPA', number: '129', tel: '129', desc: 'Layanan dukungan' },
]

const TIPS = [
  { Icon: ClipboardList, title: 'Sebelum Menghubungi', body: 'Catat keluhan utama dan durasi gejala agar konsultasi lebih efektif.' },
  { Icon: Users, title: 'Ajak Pendamping', body: 'Orang terpercaya bisa membantu menjelaskan dan menemani saat konsultasi.' },
  { Icon: Layers, title: 'Pilih Level Bantuan', body: 'Mulai dari konseling, lalu psikolog, dan psikiater jika dibutuhkan.' },
]

function buildEmbed({ lat, lon }: Coords): string {
  const d = 0.04
  const bbox = `${lon - d}%2C${lat - d}%2C${lon + d}%2C${lat + d}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`
}

function mapsLink({ lat, lon }: Coords): string {
  return `https://www.google.com/maps/@${lat},${lon},14z`
}

function searchMapsLink(q: string, c: Coords): string {
  return `https://www.google.com/maps/search/${encodeURIComponent(`${q} near ${c.lat},${c.lon}`)}`
}

function searchOsmLink(q: string, c: Coords): string {
  const base = `https://www.openstreetmap.org/search?query=${encodeURIComponent(q)}`
  return `${base}&minlon=${c.lon - 0.1}&maxlon=${c.lon + 0.1}&minlat=${c.lat - 0.1}&maxlat=${c.lat + 0.1}`
}

export default function ReferralPage() {
  const [coords, setCoords] = useState<Coords>(DEFAULT_COORDS)
  const [locating, setLocating] = useState(false)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('mb_coords')
    if (stored) {
      try {
        setCoords(JSON.parse(stored) as Coords)
      } catch {
        localStorage.removeItem('mb_coords')
      }
    }
  }, [])

  function updateCoords(c: Coords) {
    setCoords(c)
    localStorage.setItem('mb_coords', JSON.stringify(c))
  }

  function useDeviceLocation() {
    if (!navigator.geolocation) {
      toast.error('Geolocation tidak tersedia')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        updateCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: 'Lokasi Saya' })
        setLocating(false)
        toast.success('Lokasi terdeteksi')
      },
      err => {
        setLocating(false)
        toast.error(err.message || 'Gagal mendapatkan lokasi')
      },
      { timeout: 10000 },
    )
  }

  async function manualSearch() {
    if (!query.trim()) return
    setSearching(true)
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: '1',
        countrycodes: 'id',
      })
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: { 'Accept-Language': 'id' },
      })
      const data = await res.json() as { lat: string; lon: string; display_name: string }[]
      if (data.length === 0) {
        toast.error('Lokasi tidak ditemukan')
      } else {
        const r = data[0]
        updateCoords({ lat: Number(r.lat), lon: Number(r.lon), label: r.display_name })
        toast.success('Lokasi ditemukan')
      }
    } catch {
      toast.error('Pencarian gagal')
    } finally {
      setSearching(false)
    }
  }

  const embed = useMemo(() => buildEmbed(coords), [coords])

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-9 space-y-5">
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
          <h1 className="text-3xl font-black tracking-tight text-text-dark dark:text-white">Bantuan Profesional</h1>
          <p className="mt-1 text-sm font-semibold text-text-muted dark:text-[#9EB4AC]">
            Temukan layanan, hotline, dan langkah persiapan saat butuh dukungan tambahan.
          </p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.08 }}
          whileHover={hoverLift}
          className="relative overflow-hidden rounded-[1.75rem] bg-red p-5 text-white shadow-xl shadow-red/10"
        >
          <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 ring-1 ring-white/20">
                <TriangleAlert size={25} strokeWidth={2} />
              </div>
              <div>
                <div className="text-lg font-black">Butuh bantuan segera?</div>
                <div className="text-sm font-semibold text-white/80">Hubungi hotline darurat 24 jam.</div>
              </div>
            </div>
            <a
              href="tel:119"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-red transition-colors hover:bg-[#FDF0EE]"
            >
              <PhoneCall size={16} strokeWidth={2.2} />
              Hubungi 119
            </a>
          </div>
        </motion.section>

        <div className="grid gap-5 lg:grid-cols-2">
          <LocationPanel
            coords={coords}
            locating={locating}
            query={query}
            searching={searching}
            setQuery={setQuery}
            useDeviceLocation={useDeviceLocation}
            manualSearch={manualSearch}
            updateCoords={updateCoords}
          />

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.2 }}
            whileHover={hoverLift}
            className="surface-card rounded-[1.75rem] p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <MapPin size={18} strokeWidth={1.8} className="text-primary" />
                <div className="min-w-0">
                  <h2 className="text-sm font-black text-text-dark dark:text-white">Peta Sekitar</h2>
                  <p className="truncate text-xs font-semibold text-text-muted dark:text-[#9EB4AC]">
                    {coords.label ?? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`}
                  </p>
                </div>
              </div>
              <a
                href={mapsLink(coords)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black text-primary hover:bg-primary hover:text-white"
              >
                <ExternalLink size={12} strokeWidth={2.2} />
                Google Maps
              </a>
            </div>
            <div
              className="relative overflow-hidden rounded-2xl border border-border-light bg-[linear-gradient(135deg,rgba(42,175,160,0.18),rgba(220,234,210,0.18)),repeating-linear-gradient(0deg,rgba(42,175,160,0.12)_0_1px,transparent_1px_28px),repeating-linear-gradient(90deg,rgba(42,175,160,0.12)_0_1px,transparent_1px_28px)] dark:border-border-dark dark:bg-[linear-gradient(135deg,rgba(42,175,160,0.16),rgba(215,155,53,0.06)),repeating-linear-gradient(0deg,rgba(42,175,160,0.12)_0_1px,transparent_1px_28px),repeating-linear-gradient(90deg,rgba(42,175,160,0.12)_0_1px,transparent_1px_28px)]"
              style={{ aspectRatio: '16/9' }}
            >
              <div className="absolute inset-0 z-0 grid place-items-center p-6 text-center">
                <div className="rounded-2xl bg-surface/80 px-4 py-3 shadow-lg backdrop-blur dark:bg-dark-card/80">
                  <MapPin size={24} strokeWidth={1.8} className="mx-auto mb-1 text-primary" />
                  <div className="text-sm font-black text-text-dark dark:text-white">Peta OpenStreetMap</div>
                  <div className="text-xs font-semibold text-text-muted dark:text-[#9EB4AC]">
                    {coords.label ?? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`}
                  </div>
                </div>
              </div>
              <iframe
                key={embed}
                src={embed}
                title="Peta bantuan profesional"
                className="relative z-10 h-full w-full"
                loading="lazy"
              />
            </div>
          </motion.section>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SEARCH_CARDS.map(({ Icon, label, desc, q }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.24 + i * 0.06 }}
              whileHover={hoverLift}
              className="surface-card rounded-[1.5rem] p-4"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10">
                  <Icon size={21} strokeWidth={1.8} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-black text-text-dark dark:text-white">{label}</div>
                  <div className="text-xs font-semibold leading-relaxed text-text-muted dark:text-[#9EB4AC]">{desc}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={searchMapsLink(q, coords)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl bg-primary py-2.5 text-center text-xs font-black text-white transition-colors hover:bg-primary-dark"
                >
                  Maps
                </a>
                <a
                  href={searchOsmLink(q, coords)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-border-light py-2.5 text-center text-xs font-black text-text-dark transition-colors hover:bg-surface-soft dark:border-border-dark dark:text-white dark:hover:bg-dark-hover"
                >
                  OSM
                </a>
              </div>
            </motion.div>
          ))}
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <HotlinePanel />
          <TipsPanel />
        </div>
      </div>
    </Layout>
  )
}

function LocationPanel({
  coords,
  locating,
  query,
  searching,
  setQuery,
  useDeviceLocation,
  manualSearch,
  updateCoords,
}: {
  coords: Coords
  locating: boolean
  query: string
  searching: boolean
  setQuery: (value: string) => void
  useDeviceLocation: () => void
  manualSearch: () => void
  updateCoords: (coords: Coords) => void
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.14 }}
      whileHover={hoverLift}
      className="surface-card rounded-[1.75rem] p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <MapPin size={19} strokeWidth={1.8} className="text-primary" />
        <h2 className="text-base font-black text-text-dark dark:text-white">Temukan Bantuan di Sekitarmu</h2>
      </div>

      <button
        type="button"
        onClick={useDeviceLocation}
        disabled={locating}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-black text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
      >
        {locating
          ? <Loader2 size={16} strokeWidth={2} className="animate-spin" />
          : <Crosshair size={16} strokeWidth={2.2} />}
        {locating ? 'Mendeteksi...' : 'Gunakan Lokasi Saya'}
      </button>

      <div className="flex items-center gap-2 rounded-2xl bg-primary/10 px-3 py-2 text-xs font-black text-primary">
        <LocateFixed size={14} strokeWidth={2.2} className="shrink-0" />
        <span className="truncate">{coords.label ?? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`}</span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} strokeWidth={2.2} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && manualSearch()}
            placeholder="Cari kota atau alamat..."
            className="soft-input w-full rounded-2xl border py-3 pl-10 pr-3 text-sm font-bold text-text-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/35 dark:text-white"
          />
        </div>
        <button
          type="button"
          onClick={manualSearch}
          disabled={searching || !query.trim()}
          className="rounded-2xl bg-text-dark px-4 text-sm font-black text-white transition-colors hover:bg-primary-dark disabled:opacity-60 dark:bg-white dark:text-text-dark dark:hover:bg-cream"
        >
          {searching ? '...' : 'Cari'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {CITY_PRESETS.map(c => {
          const active = Math.abs(coords.lat - c.lat) < 0.001 && Math.abs(coords.lon - c.lon) < 0.001
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => updateCoords({ lat: c.lat, lon: c.lon, label: c.name })}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-black transition-colors',
                active
                  ? 'border-primary bg-primary text-white'
                  : 'border-border-light bg-white/50 text-text-dark hover:border-primary hover:text-primary dark:border-border-dark dark:bg-white/5 dark:text-white',
              )}
            >
              {c.name}
            </button>
          )
        })}
      </div>
    </motion.section>
  )
}

function HotlinePanel() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.48 }}
      whileHover={hoverLift}
      className="surface-card rounded-[1.75rem] p-5 space-y-3"
    >
      <div className="flex items-center gap-2">
        <PhoneCall size={19} strokeWidth={1.8} className="text-primary" />
        <h2 className="text-base font-black text-text-dark dark:text-white">Hotline Bantuan</h2>
      </div>
      <div className="space-y-2">
        {HOTLINES.map(h => (
          <div
            key={h.name}
            className="flex flex-col gap-2 rounded-2xl bg-surface-soft/80 p-3 dark:bg-dark-hover sm:flex-row sm:items-center sm:justify-between sm:gap-3"
          >
            <div className="min-w-0">
              <div className="text-sm font-black text-text-dark dark:text-white">{h.name}</div>
              <div className="text-xs font-semibold text-text-muted dark:text-[#9EB4AC]">{h.desc}</div>
            </div>
            <a
              href={`tel:${h.tel}`}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-primary px-3 py-2 text-sm font-black text-white transition-colors hover:bg-primary-dark sm:w-auto"
            >
              <Phone size={14} strokeWidth={2.2} />
              {h.number}
            </a>
          </div>
        ))}
      </div>
    </motion.section>
  )
}

function TipsPanel() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.54 }}
      className="space-y-3"
    >
      <h2 className="text-base font-black text-text-dark dark:text-white">Tips Persiapan</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {TIPS.map(({ Icon, title, body }) => (
          <motion.div
            key={title}
            whileHover={hoverLift}
            className="surface-card rounded-[1.5rem] p-4"
          >
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-primary/10">
              <Icon size={20} strokeWidth={1.8} className="text-primary" />
            </div>
            <div className="mb-1 text-sm font-black text-text-dark dark:text-white">{title}</div>
            <p className="text-xs font-semibold leading-relaxed text-text-muted dark:text-[#9EB4AC]">{body}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
