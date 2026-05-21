import type { DimensionKey, FactorScores, SeverityLevel } from '@/types'

export type LinguisticLevel = 'buruk' | 'cukup' | 'baik'

export type DimensionMembership = Record<LinguisticLevel, number>

export type FuzzyProfile = Record<DimensionKey, DimensionMembership>

export interface Condition {
  dimension: DimensionKey
  level: LinguisticLevel
}

export interface Recommendation {
  id: string
  title: string
  reason: string
  category: 'tidur' | 'emosi' | 'kecemasan' | 'energi' | 'sosial' | 'umum'
  estimatedMinutes: number
  difficulty: 'mudah' | 'sedang' | 'menantang'
  iconName: 'Moon' | 'Brain' | 'Wind' | 'Heart' | 'Users' | 'Sun' | 'BookOpen' | 'Footprints' | 'Coffee' | 'Sparkles' | 'PhoneCall' | 'Droplets' | 'Music'
  conditions: Condition[]
}

export interface ScoredRecommendation extends Recommendation {
  matchDegree: number
}

export interface DailyTask {
  id: string
  title: string
  hint: string
  iconName: Recommendation['iconName']
  dimension: DimensionKey
  estimatedMinutes: number
}

function trap(x: number, a: number, b: number, c: number, d: number): number {
  if (x <= a || x >= d) return 0
  if (x >= b && x <= c) return 1
  if (x < b) return (x - a) / (b - a)
  return (d - x) / (d - c)
}

export function dimensionMembership(score: number): DimensionMembership {
  return {
    buruk: trap(score,  -1,  0, 28, 48),
    cukup: trap(score,  30, 45, 60, 72),
    baik:  trap(score,  58, 70, 100, 101),
  }
}

export function buildFuzzyProfile(scores: FactorScores): FuzzyProfile {
  return {
    mood:    dimensionMembership(scores.mood),
    sleep:   dimensionMembership(scores.sleep),
    energy:  dimensionMembership(scores.energy),
    social:  dimensionMembership(scores.social),
    anxiety: dimensionMembership(scores.anxiety),
  }
}

export const KNOWLEDGE_BASE: Recommendation[] = [
  {
    id: 'sleep-routine',
    title: 'Tidur sebelum jam 23.00',
    reason: 'Konsistensi waktu tidur memperbaiki kualitas tidur dan ritme sirkadian.',
    category: 'tidur',
    estimatedMinutes: 5,
    difficulty: 'mudah',
    iconName: 'Moon',
    conditions: [{ dimension: 'sleep', level: 'buruk' }],
  },
  {
    id: 'reduce-screen',
    title: 'Kurangi layar 60 menit sebelum tidur',
    reason: 'Cahaya biru gadget menekan melatonin dan mengganggu jendela tidur.',
    category: 'tidur',
    estimatedMinutes: 10,
    difficulty: 'mudah',
    iconName: 'Moon',
    conditions: [{ dimension: 'sleep', level: 'cukup' }, { dimension: 'anxiety', level: 'cukup' }],
  },
  {
    id: 'breathing-478',
    title: 'Latihan napas 4-7-8 selama 5 menit',
    reason: 'Memperlambat aktivasi sistem saraf simpatik saat cemas atau gelisah.',
    category: 'kecemasan',
    estimatedMinutes: 5,
    difficulty: 'mudah',
    iconName: 'Wind',
    conditions: [{ dimension: 'anxiety', level: 'buruk' }],
  },
  {
    id: 'grounding-54321',
    title: 'Teknik grounding 5-4-3-2-1',
    reason: 'Membumikan perhatian saat overthinking atau panik mulai datang.',
    category: 'kecemasan',
    estimatedMinutes: 5,
    difficulty: 'mudah',
    iconName: 'Sparkles',
    conditions: [{ dimension: 'anxiety', level: 'buruk' }, { dimension: 'mood', level: 'cukup' }],
  },
  {
    id: 'journaling',
    title: 'Jurnal emosi 10 menit',
    reason: 'Menulis perasaan membantu meregulasi emosi dan mengurai pikiran negatif.',
    category: 'emosi',
    estimatedMinutes: 10,
    difficulty: 'mudah',
    iconName: 'BookOpen',
    conditions: [{ dimension: 'mood', level: 'buruk' }],
  },
  {
    id: 'gratitude',
    title: 'Tulis 3 hal yang disyukuri',
    reason: 'Praktik gratitude singkat efektif memperbaiki suasana hati.',
    category: 'emosi',
    estimatedMinutes: 5,
    difficulty: 'mudah',
    iconName: 'Heart',
    conditions: [{ dimension: 'mood', level: 'cukup' }],
  },
  {
    id: 'reframe',
    title: 'Reframe satu pikiran negatif',
    reason: 'Ubah satu pikiran negatif jadi sudut pandang yang lebih realistis.',
    category: 'emosi',
    estimatedMinutes: 10,
    difficulty: 'sedang',
    iconName: 'Brain',
    conditions: [{ dimension: 'mood', level: 'buruk' }, { dimension: 'anxiety', level: 'cukup' }],
  },
  {
    id: 'walk-10',
    title: 'Jalan ringan 10 menit di luar',
    reason: 'Aktivitas fisik ringan dan cahaya matahari meningkatkan mood dan energi.',
    category: 'energi',
    estimatedMinutes: 10,
    difficulty: 'mudah',
    iconName: 'Footprints',
    conditions: [{ dimension: 'energy', level: 'buruk' }],
  },
  {
    id: 'micro-step',
    title: 'Mulai 1 micro-task selama 5 menit',
    reason: 'Saat motivasi rendah, langkah kecil memecah inersia dengan aman.',
    category: 'energi',
    estimatedMinutes: 5,
    difficulty: 'mudah',
    iconName: 'Sparkles',
    conditions: [{ dimension: 'energy', level: 'buruk' }, { dimension: 'mood', level: 'cukup' }],
  },
  {
    id: 'reduce-caffeine',
    title: 'Hindari kafein setelah jam 14.00',
    reason: 'Paruh waktu kafein panjang sehingga dapat mengganggu tidur malam.',
    category: 'tidur',
    estimatedMinutes: 1,
    difficulty: 'mudah',
    iconName: 'Coffee',
    conditions: [{ dimension: 'sleep', level: 'cukup' }],
  },
  {
    id: 'reach-out',
    title: 'Hubungi 1 orang terdekat',
    reason: 'Kontak sosial sederhana mengurangi rasa kesepian dan menguatkan dukungan.',
    category: 'sosial',
    estimatedMinutes: 10,
    difficulty: 'sedang',
    iconName: 'PhoneCall',
    conditions: [{ dimension: 'social', level: 'buruk' }],
  },
  {
    id: 'social-activity',
    title: 'Aktivitas komunitas ringan',
    reason: 'Kehadiran di lingkungan sosial yang aman membangun rasa terhubung.',
    category: 'sosial',
    estimatedMinutes: 30,
    difficulty: 'sedang',
    iconName: 'Users',
    conditions: [{ dimension: 'social', level: 'cukup' }],
  },
  {
    id: 'hydration',
    title: 'Minum 8 gelas air hari ini',
    reason: 'Dehidrasi ringan dapat menurunkan fokus dan menambah rasa lelah.',
    category: 'energi',
    estimatedMinutes: 1,
    difficulty: 'mudah',
    iconName: 'Droplets',
    conditions: [{ dimension: 'energy', level: 'cukup' }],
  },
  {
    id: 'sunlight',
    title: '15 menit di bawah cahaya matahari pagi',
    reason: 'Paparan matahari pagi menstabilkan ritme tidur dan menyeimbangkan mood.',
    category: 'energi',
    estimatedMinutes: 15,
    difficulty: 'mudah',
    iconName: 'Sun',
    conditions: [{ dimension: 'energy', level: 'cukup' }, { dimension: 'mood', level: 'cukup' }],
  },
  {
    id: 'music-calm',
    title: 'Dengarkan musik menenangkan',
    reason: 'Musik dengan tempo lambat membantu menurunkan denyut jantung saat tegang.',
    category: 'kecemasan',
    estimatedMinutes: 10,
    difficulty: 'mudah',
    iconName: 'Music',
    conditions: [{ dimension: 'anxiety', level: 'cukup' }],
  },
  {
    id: 'mindful-pause',
    title: 'Jeda mindful 3 menit',
    reason: 'Mikro-istirahat penuh kesadaran membantu mereset fokus dan menurunkan stres.',
    category: 'umum',
    estimatedMinutes: 3,
    difficulty: 'mudah',
    iconName: 'Sparkles',
    conditions: [{ dimension: 'mood', level: 'cukup' }, { dimension: 'anxiety', level: 'cukup' }],
  },
  {
    id: 'professional',
    title: 'Hubungi profesional kesehatan mental',
    reason: 'Saat beban terasa berat, dukungan profesional sangat membantu pemulihan.',
    category: 'umum',
    estimatedMinutes: 30,
    difficulty: 'menantang',
    iconName: 'PhoneCall',
    conditions: [{ dimension: 'mood', level: 'buruk' }, { dimension: 'anxiety', level: 'buruk' }],
  },
]

export function scoreRecommendation(
  rec: Recommendation,
  profile: FuzzyProfile,
): number {
  if (rec.conditions.length === 0) return 0
  let minMatch = 1
  for (const c of rec.conditions) {
    const deg = profile[c.dimension][c.level] ?? 0
    if (deg < minMatch) minMatch = deg
  }
  return minMatch
}

export function rankRecommendations(
  profile: FuzzyProfile,
  limit: number = 5,
  minMatch: number = 0.18,
): ScoredRecommendation[] {
  const scored = KNOWLEDGE_BASE.map(r => ({
    ...r,
    matchDegree: scoreRecommendation(r, profile),
  }))
    .filter(r => r.matchDegree >= minMatch)
    .sort((a, b) => b.matchDegree - a.matchDegree)

  const seenCategory = new Set<string>()
  const diversified: ScoredRecommendation[] = []
  for (const r of scored) {
    if (diversified.length >= limit) break
    if (seenCategory.has(r.category) && diversified.length >= 2) continue
    diversified.push(r)
    seenCategory.add(r.category)
  }
  if (diversified.length < limit) {
    for (const r of scored) {
      if (diversified.length >= limit) break
      if (!diversified.find(d => d.id === r.id)) diversified.push(r)
    }
  }
  return diversified
}

export function dominantFactors(scores: FactorScores, n: number = 2): DimensionKey[] {
  const order: DimensionKey[] = ['mood', 'sleep', 'energy', 'social', 'anxiety']
  return [...order].sort((a, b) => (scores[a] ?? 100) - (scores[b] ?? 100)).slice(0, n)
}

export function deriveDailyTasks(
  scores: FactorScores,
  severity: SeverityLevel,
): DailyTask[] {
  const weak = dominantFactors(scores, 2)
  const profile = buildFuzzyProfile(scores)
  const recs = rankRecommendations(profile, 6, 0.12)

  const tasks: DailyTask[] = []
  const usedDims = new Set<DimensionKey>()

  for (const r of recs) {
    if (tasks.length >= 4) break
    const primaryDim = r.conditions[0]?.dimension
    if (!primaryDim) continue
    if (usedDims.has(primaryDim) && tasks.length >= 2) continue
    tasks.push({
      id: r.id,
      title: r.title,
      hint: r.reason,
      iconName: r.iconName,
      dimension: primaryDim,
      estimatedMinutes: r.estimatedMinutes,
    })
    usedDims.add(primaryDim)
  }

  if (severity === 'normal' && tasks.length < 3) {
    tasks.push({
      id: 'maintain-mindful',
      title: 'Jeda mindful 3 menit',
      hint: 'Pertahankan kondisi baik dengan mikro-istirahat penuh kesadaran.',
      iconName: 'Sparkles',
      dimension: weak[0] ?? 'mood',
      estimatedMinutes: 3,
    })
  }

  return tasks.slice(0, 4)
}

export function severitySummary(profile: FuzzyProfile): string {
  const entries = (Object.keys(profile) as DimensionKey[]).map(d => ({
    dim: d,
    buruk: profile[d].buruk,
  }))
  const top = entries.sort((a, b) => b.buruk - a.buruk).filter(e => e.buruk >= 0.35)
  if (top.length === 0) return 'Pola jawabanmu menunjukkan kondisi yang relatif stabil.'
  const labelMap: Record<DimensionKey, string> = {
    mood:    'emosi',
    sleep:   'pola tidur',
    energy:  'energi',
    social:  'interaksi sosial',
    anxiety: 'kecemasan',
  }
  const names = top.slice(0, 2).map(t => labelMap[t.dim])
  return `Pola jawaban menunjukkan tantangan pada area ${names.join(' dan ')}.`
}
