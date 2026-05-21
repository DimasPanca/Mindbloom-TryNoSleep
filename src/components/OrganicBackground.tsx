import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface Props {
  variant: 'hero' | 'auth' | 'subtle'
  className?: string
}

interface BlobDef {
  color: string
  width: string
  height: string
  left?: string
  right?: string
  top?: string
  bottom?: string
  animClass: string
  lightOpacity: number
  darkOpacity: number
}

const BLOBS: Record<Props['variant'], BlobDef[]> = {
  hero: [
    {
      color: '#2AAFA0',
      width: '48%', height: '48%',
      left: '-8%', top: '-12%',
      animClass: 'animate-float-slow',
      lightOpacity: 0.18, darkOpacity: 0.10,
    },
    {
      color: '#5EA85C',
      width: '42%', height: '42%',
      right: '-8%', bottom: '-8%',
      animClass: 'animate-float-slower',
      lightOpacity: 0.14, darkOpacity: 0.08,
    },
    {
      color: '#7B6FCA',
      width: '28%', height: '28%',
      right: '12%', top: '8%',
      animClass: 'animate-float-slow',
      lightOpacity: 0.10, darkOpacity: 0.06,
    },
    {
      color: '#2AAFA0',
      width: '20%', height: '20%',
      left: '25%', bottom: '10%',
      animClass: 'animate-float-slower',
      lightOpacity: 0.08, darkOpacity: 0.05,
    },
  ],
  auth: [
    {
      color: '#2AAFA0',
      width: '40%', height: '40%',
      right: '-6%', top: '8%',
      animClass: 'animate-float-slow',
      lightOpacity: 0.12, darkOpacity: 0.07,
    },
    {
      color: '#1A7A73',
      width: '30%', height: '30%',
      left: '4%', bottom: '15%',
      animClass: 'animate-float-slower',
      lightOpacity: 0.10, darkOpacity: 0.06,
    },
  ],
  subtle: [
    {
      color: '#2AAFA0',
      width: '35%', height: '35%',
      left: '15%', top: '10%',
      animClass: 'animate-float-slow',
      lightOpacity: 0.06, darkOpacity: 0.04,
    },
    {
      color: '#5EA85C',
      width: '25%', height: '25%',
      right: '20%', bottom: '20%',
      animClass: 'animate-float-slower',
      lightOpacity: 0.05, darkOpacity: 0.03,
    },
  ],
}

export default function OrganicBackground({ variant, className }: Props) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const blobs  = BLOBS[variant]

  return (
    <div
      aria-hidden="true"
      className={cn('absolute inset-0 overflow-hidden pointer-events-none z-0', className)}
    >
      {blobs.map((blob, i) => (
        <div
          key={i}
          className={cn('absolute rounded-full', blob.animClass)}
          style={{
            width:      blob.width,
            height:     blob.height,
            left:       blob.left,
            right:      blob.right,
            top:        blob.top,
            bottom:     blob.bottom,
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
            filter:     'blur(60px)',
            opacity:    isDark ? blob.darkOpacity : blob.lightOpacity,
          }}
        />
      ))}
    </div>
  )
}
