import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, MessageCircle, Phone, TriangleAlert } from 'lucide-react'

const HOTLINES = [
  { name: 'SEJIWA',  number: '119 ext 8', tel: '119', desc: 'Hotline Nasional Kesehatan Jiwa — 24 jam, gratis' },
  { name: 'PSC 119', number: '119',       tel: '119', desc: 'Pusat Krisis Nasional — layanan darurat'         },
  { name: 'SAPA',    number: '129',       tel: '129', desc: 'Layanan dukungan untuk perempuan dan anak'       },
]

const ONLINE = [
  { name: 'Into The Light',     url: 'https://www.intothelightid.org/', desc: 'Komunitas pencegahan bunuh diri' },
  { name: 'Yayasan Pulih',      url: 'https://yayasanpulih.org/',       desc: 'Layanan psikososial profesional' },
]

const STEPS = [
  'Hubungi orang yang kamu percaya — keluarga, teman dekat, atau tetangga.',
  'Tunjukkan halaman ini kepada mereka agar mereka memahami situasimu.',
  'Minta diantar ke IGD rumah sakit atau Puskesmas terdekat.',
]

export default function EmergencyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E0665A] to-[#C0453A] text-white pb-12">
      <div className="max-w-xl mx-auto px-4 py-6 space-y-5">

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Kembali
        </Link>

        <div className="text-center pt-4 space-y-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/15 backdrop-blur"
          >
            <TriangleAlert size={48} strokeWidth={2} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-black">Kamu Tidak Sendiri</h1>
          <p className="text-sm text-white/90 max-w-sm mx-auto leading-relaxed">
            Bantuan tersedia untukmu sekarang. Hubungi salah satu layanan di bawah ini — kamu pantas didengar.
          </p>
        </div>

        <div className="space-y-2.5">
          {HOTLINES.map((h, i) => (
            <motion.div
              key={h.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/15 backdrop-blur rounded-2xl p-5 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-3">
                <Phone size={20} strokeWidth={2} className="text-white shrink-0" />
                <div className="min-w-0">
                  <div className="text-2xl font-black leading-none">{h.number}</div>
                  <div className="text-sm font-bold text-white/90 mt-1">{h.name}</div>
                </div>
              </div>
              <p className="text-xs text-white/80 mb-3">{h.desc}</p>
              <a
                href={`tel:${h.tel}`}
                className="block w-full bg-white text-[#C0453A] font-black text-center py-2.5 rounded-xl hover:bg-white/90 transition-colors"
              >
                Hubungi Sekarang
              </a>
            </motion.div>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 space-y-3 border border-white/10">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} strokeWidth={2} />
            <h2 className="text-sm font-black">Sumber Daya Online</h2>
          </div>
          <div className="space-y-2">
            {ONLINE.map(o => (
              <a
                key={o.name}
                href={o.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-white/10 hover:bg-white/15 rounded-xl px-3 py-2.5 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold">{o.name}</div>
                  <div className="text-xs text-white/80">{o.desc}</div>
                </div>
                <ExternalLink size={14} strokeWidth={2} className="shrink-0" />
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 space-y-3 border border-white/10">
          <h2 className="text-sm font-black">Cara Minta Bantuan dari Sekitar</h2>
          <div className="space-y-2.5">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-white text-[#C0453A] font-black flex items-center justify-center text-sm shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed pt-0.5">{s}</p>
              </div>
            ))}
          </div>
        </div>

        <Link
          to="/dashboard"
          className="block w-full text-center border border-white text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
