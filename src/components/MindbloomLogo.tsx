import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useEffect, useState, type CSSProperties } from 'react'

interface MindbloomLogoProps {
  size?: number
  className?: string
  style?: CSSProperties
  noMotion?: boolean
}

export default function MindbloomLogo({ size = 40, className = '', style, noMotion = false }: MindbloomLogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? resolvedTheme === 'dark' : false
  const src = isDark ? '/logo-malam.svg' : '/logo-terang.svg'

  return (
    <motion.div
      className={`relative shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size, ...style }}
      initial={noMotion ? false : { opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={noMotion ? undefined : { scale: 1.1, rotate: 3 }}
      whileTap={noMotion ? undefined : { scale: 0.91 }}
      transition={{ type: 'spring', damping: 18, stiffness: 320 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.img
          key={src}
          src={src}
          alt="MindBloom"
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain select-none"
          style={{ pointerEvents: 'none' }}
          initial={{ opacity: 0, scale: 0.82, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.82, rotate: 8 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>

      {!noMotion && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-primary/25 blur-xl pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.22 }}
        />
      )}
    </motion.div>
  )
}
