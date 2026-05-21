import { useState } from 'react'
import { motion } from 'framer-motion'
import { CircleCheck, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { saveJournalEntry } from '@/lib/storage'

const PROMPTS = [
  'Bagaimana perasaanmu hari ini, dan apa yang paling mempengaruhinya?',
  'Apa yang membuatmu merasa cemas atau khawatir belakangan ini?',
  'Hal apa yang paling kamu syukuri dalam seminggu terakhir?',
  'Apa tantangan terbesar yang kamu hadapi saat ini dan bagaimana kamu menghadapinya?',
  'Tuliskan satu hal positif yang terjadi hari ini, sekecil apapun.',
]

interface Props {
  screeningId: string
  onComplete: () => void
}

export default function JournalPrompt({ screeningId, onComplete }: Props) {
  const [selected, setSelected] = useState(0)
  const [content, setContent]   = useState('')
  const [saving, setSaving]     = useState(false)
  const [done, setDone]         = useState(false)

  async function handleSave() {
    if (content.length < 20 || saving) return
    setSaving(true)
    await saveJournalEntry({ content, screeningId })
    setSaving(false)
    setDone(true)
    setTimeout(onComplete, 1200)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 260 }}
        >
          <CircleCheck size={64} strokeWidth={1.5} className="text-primary" />
        </motion.div>
        <p className="text-sm font-bold text-text-dark dark:text-white">Jurnal tersimpan!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {PROMPTS.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected(i)}
            className={cn(
              'w-full text-left text-sm px-3.5 py-3 rounded-xl border transition-colors',
              selected === i
                ? 'border-primary bg-[#E8F6F3] dark:bg-[#0F2522] text-primary font-semibold'
                : 'border-border-light dark:border-border-dark bg-white dark:bg-dark-hover text-text-dark dark:text-white hover:border-primary/50',
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={PROMPTS[selected]}
          className="w-full min-h-[160px] resize-none rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-dark-card text-text-dark dark:text-white placeholder:text-text-muted dark:placeholder:text-[#8EA8A5] text-sm p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
        />
        <div className="flex justify-between text-xs text-text-muted dark:text-[#8EA8A5]">
          <span>{content.length < 20 ? `${20 - content.length} karakter lagi` : 'Siap disimpan'}</span>
          <span>{content.length}</span>
        </div>
      </div>

      <div className="flex items-start gap-2.5 bg-yellow/10 border border-yellow/20 rounded-xl p-3">
        <Lightbulb size={16} strokeWidth={1.75} className="text-yellow shrink-0 mt-0.5" />
        <p className="text-xs text-yellow font-semibold">
          Menulis jurnal membantu memproses emosi dan menenangkan pikiran yang penuh.
        </p>
      </div>

      <motion.button
        type="button"
        onClick={handleSave}
        disabled={content.length < 20 || saving}
        whileHover={content.length >= 20 ? { scale: 1.02 } : {}}
        whileTap={content.length >= 20 ? { scale: 0.98 } : {}}
        className={cn(
          'w-full font-bold rounded-xl py-3 transition-colors',
          content.length >= 20
            ? 'bg-primary hover:bg-primary-dark text-white'
            : 'bg-border-light dark:bg-border-dark text-text-muted cursor-not-allowed',
        )}
      >
        {saving ? 'Menyimpan…' : 'Simpan & Selesai'}
      </motion.button>
    </div>
  )
}
