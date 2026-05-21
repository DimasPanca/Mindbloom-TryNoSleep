import type { DailyTask } from './recommendations'

const STORAGE_KEY = 'mindbloom_daily_tasks_v1'

export interface DailyTaskState {
  date: string
  screeningId: string | null
  tasks: DailyTask[]
  completed: string[]
}

function todayKey(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

export function loadDailyState(): DailyTaskState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DailyTaskState
    if (parsed.date !== todayKey()) return { ...parsed, completed: parsed.date === todayKey() ? parsed.completed : [] }
    return parsed
  } catch {
    return null
  }
}

export function saveDailyState(state: DailyTaskState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota errors */
  }
}

export function syncDailyTasks(
  tasks: DailyTask[],
  screeningId: string | null,
): DailyTaskState {
  const existing = loadDailyState()
  const today = todayKey()

  if (existing && existing.date === today && existing.screeningId === screeningId) {
    const validIds = new Set(tasks.map(t => t.id))
    const completed = existing.completed.filter(c => validIds.has(c))
    const updated: DailyTaskState = { date: today, screeningId, tasks, completed }
    saveDailyState(updated)
    return updated
  }

  const fresh: DailyTaskState = { date: today, screeningId, tasks, completed: [] }
  saveDailyState(fresh)
  return fresh
}

export function toggleTaskCompletion(state: DailyTaskState, taskId: string): DailyTaskState {
  const has = state.completed.includes(taskId)
  const completed = has
    ? state.completed.filter(c => c !== taskId)
    : [...state.completed, taskId]
  const next: DailyTaskState = { ...state, completed }
  saveDailyState(next)
  return next
}

export function completionPercent(state: DailyTaskState): number {
  if (state.tasks.length === 0) return 0
  return Math.round((state.completed.length / state.tasks.length) * 100)
}
