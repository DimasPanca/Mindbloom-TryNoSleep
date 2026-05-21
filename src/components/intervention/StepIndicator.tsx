import { motion } from 'framer-motion'
import { BookOpen, Check, Music, Video } from 'lucide-react'
import { cn } from '@/lib/utils'
import { spring } from '@/lib/motion'

interface Props {
  currentStep: 1 | 2 | 3
  completedSteps: number[]
}

const STEPS = [
  { n: 1, label: 'Musik',    Icon: Music },
  { n: 2, label: 'Meditasi', Icon: Video },
  { n: 3, label: 'Jurnal',   Icon: BookOpen },
]

export default function StepIndicator({ currentStep, completedSteps }: Props) {
  return (
    <div className="flex items-start gap-0 w-full max-w-xs mx-auto">
      {STEPS.map(({ n, label, Icon }, idx) => {
        const done   = completedSteps.includes(n)
        const active = currentStep === n

        return (
          <div key={n} className="flex items-start flex-1 relative">
            <div className="flex flex-col items-center w-full">
              <div className="relative">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: done ? '#2AAFA0' : 'transparent',
                    borderColor:     done || active ? '#2AAFA0' : '#EBEBEA',
                  }}
                  className="w-9 h-9 rounded-full border-2 flex items-center justify-center relative z-10"
                >
                  {done ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                    >
                      <Check size={16} strokeWidth={2.5} className="text-white" />
                    </motion.div>
                  ) : active ? (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-2.5 h-2.5 rounded-full bg-primary"
                    />
                  ) : (
                    <Icon size={15} strokeWidth={1.75} className="text-text-muted dark:text-[#8EA8A5]" />
                  )}
                </motion.div>
              </div>
              <span className={cn(
                'text-[10px] font-semibold mt-1.5 text-center',
                done || active ? 'text-primary' : 'text-text-muted dark:text-[#8EA8A5]',
              )}>
                {label}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div className="absolute top-4 left-1/2 w-full h-0.5 bg-border-light dark:bg-border-dark z-0">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: completedSteps.includes(n) ? 1 : 0 }}
                  transition={spring}
                  style={{ transformOrigin: 'left' }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
