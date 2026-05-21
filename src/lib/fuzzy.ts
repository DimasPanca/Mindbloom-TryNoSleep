import type { Answer, DimensionKey, FactorScores, FuzzyResult, FuzzyLevel, MembershipDegrees, SeverityLevel } from '@/types'
import { CRITICAL_THRESHOLD, DIMENSION_WEIGHTS, QUESTIONS } from '@/data/questions'

const DIMS: DimensionKey[] = ['mood', 'sleep', 'energy', 'social', 'anxiety']

function trap(x: number, a: number, b: number, c: number, d: number): number {
  if (x <= a || x >= d) return 0
  if (x >= b && x <= c) return 1
  if (x < b) return (x - a) / (b - a)
  return (d - x) / (d - c)
}

function answerHealth(value: number, polarity: 'positive' | 'negative' = 'negative'): number {
  return polarity === 'negative'
    ? (1 - (value - 1) / 5) * 100
    : ((value - 1) / 5) * 100
}

function severityMembership(score: number): MembershipDegrees {
  return {
    normal: trap(score, 65, 75, 100, 101),
    ringan: trap(score, 45, 55, 70,  80),
    sedang: trap(score, 25, 35, 55,  65),
    berat:  trap(score, -1,  0, 30,  45),
  }
}

function argmax(m: MembershipDegrees): SeverityLevel {
  const order: SeverityLevel[] = ['normal', 'ringan', 'sedang', 'berat']
  let best: SeverityLevel = 'normal'
  let bestVal = -Infinity
  for (const s of order) {
    if (m[s] >= bestVal) { bestVal = m[s]; best = s }
  }
  return best
}

export function dimensionFuzzyLevel(score: number): FuzzyLevel {
  if (score >= 55) return 'baik'
  if (score >= 25) return 'cukup'
  return 'buruk'
}

export function computeFactorScores(answers: Answer[]): FactorScores {
  const byId = new Map(answers.map(a => [a.questionId, a.value]))
  const scores: FactorScores = { mood: 0, sleep: 0, energy: 0, social: 0, anxiety: 0 }

  for (const dim of DIMS) {
    const qs = QUESTIONS.filter(q => q.dimension === dim)
    if (!qs.length) continue
    let wSum = 0, wTotal = 0
    for (const q of qs) {
      const v = byId.get(q.id)
      if (v === undefined) continue
      wSum   += answerHealth(v, q.polarity ?? 'negative') * q.weight
      wTotal += q.weight
    }
    scores[dim] = wTotal > 0 ? wSum / wTotal : 50
  }
  return scores
}

export function fuzzyAnalyze(answers: Answer[]): FuzzyResult {
  const factorScores = computeFactorScores(answers)

  let overallScore = 0
  for (const dim of DIMS) {
    overallScore += factorScores[dim] * (DIMENSION_WEIGHTS[dim] ?? 0)
  }

  const m = severityMembership(overallScore)
  const CENTROIDS: Record<SeverityLevel, number> = { normal: 87, ringan: 62, sedang: 42, berat: 18 }
  const mSum = Object.values(m).reduce((a, b) => a + b, 0)
  const fuzzyScore = mSum > 0
    ? Object.entries(m).reduce((acc, [s, deg]) => acc + deg * CENTROIDS[s as SeverityLevel], 0) / mSum
    : overallScore

  const criticalIds = new Set(QUESTIONS.filter(q => q.isCritical).map(q => q.id))
  const selfHarmFlag = answers.some(a => criticalIds.has(a.questionId) && a.value >= CRITICAL_THRESHOLD)

  return {
    score:             Math.round(fuzzyScore * 10) / 10,
    severity:          argmax(m),
    factorScores,
    membershipDegrees: m,
    selfHarmFlag,
  }
}

export function isCriticalTrigger(questionId: string, value: number): boolean {
  const q = QUESTIONS.find(q => q.id === questionId)
  return Boolean(q?.isCritical) && value >= CRITICAL_THRESHOLD
}
