import type { DimensionKey, FuzzyResult, Question } from '@/types'
import { QUESTIONS, TARGET_QUESTION_COUNT } from '@/data/questions'

const DIMS: DimensionKey[] = ['mood', 'sleep', 'energy', 'social', 'anxiety']

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function topByWeight(pool: Question[], n: number): Question[] {
  return [...pool].sort((a, b) => b.weight - a.weight).slice(0, n)
}

export function selectQuestions(prev?: FuzzyResult): Question[] {
  const selected: Question[] = []
  const usedIds = new Set<string>()

  for (const dim of DIMS) {
    const crits = QUESTIONS.filter(q => q.isCritical && q.dimension === dim && !usedIds.has(q.id))
    const pick = topByWeight(crits, 1)[0]
    if (pick) { selected.push(pick); usedIds.add(pick.id) }
  }

  for (const dim of DIMS) {
    const cores = QUESTIONS.filter(q => q.isCore && !q.isCritical && q.dimension === dim && !usedIds.has(q.id))
    const pick = topByWeight(cores, 1)[0]
    if (pick) { selected.push(pick); usedIds.add(pick.id) }
  }

  const remaining = TARGET_QUESTION_COUNT - selected.length

  if (remaining > 0) {
    let pool: Question[]
    if (prev) {
      const sorted = [...DIMS].sort(
        (a, b) => (prev.factorScores[a] ?? 100) - (prev.factorScores[b] ?? 100),
      )
      const weakDims = new Set(sorted.slice(0, 2))
      const weakPool   = shuffle(QUESTIONS.filter(q => !usedIds.has(q.id) && weakDims.has(q.dimension)))
      const otherPool  = shuffle(QUESTIONS.filter(q => !usedIds.has(q.id) && !weakDims.has(q.dimension)))
      pool = [...weakPool, ...otherPool]
    } else {
      const byDim = Object.fromEntries(
        DIMS.map(d => [d, shuffle(QUESTIONS.filter(q => q.dimension === d && !usedIds.has(q.id)))]),
      )
      pool = []
      let added = true
      while (added) {
        added = false
        for (const d of DIMS) {
          const q = byDim[d].shift()
          if (q) { pool.push(q); added = true }
        }
      }
    }

    for (const q of pool) {
      if (selected.length >= TARGET_QUESTION_COUNT) break
      if (!usedIds.has(q.id)) {
        selected.push(q)
        usedIds.add(q.id)
      }
    }
  }

  return orderQuestions(selected)
}

function orderQuestions(qs: Question[]): Question[] {
  const criticalQ = qs.filter(q => q.isCritical)
  const rest      = shuffle(qs.filter(q => !q.isCritical))
  if (criticalQ.length === 0) return rest

  const insertPositions: number[] = []
  const totalSlots = rest.length + criticalQ.length
  for (let i = 0; i < criticalQ.length; i++) {
    const pos = Math.floor(((i + 1) / (criticalQ.length + 1)) * totalSlots)
    insertPositions.push(Math.min(pos, totalSlots - 1))
  }

  const result: Question[] = [...rest]
  insertPositions.forEach((pos, i) => {
    result.splice(pos + i, 0, criticalQ[i])
  })

  return result.slice(0, TARGET_QUESTION_COUNT)
}
