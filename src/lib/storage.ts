import supabase from './client'
import type {
  Profile,
  Screening,
  Intervention,
  JournalEntry,
  MoodCheckin,
  FuzzyResult,
  Answer,
  ScreeningType,
  InterventionType,
  MoodLevel,
  DashboardStats,
  SeverityLevel,
} from '@/types'

type Result<T>     = { data: T | null; error: string | null }
type ListResult<T> = { data: T[];      error: string | null }

function toError(err: unknown): string {
  return err instanceof Error ? err.message : 'An unexpected error occurred'
}

function calcStreak(checkins: { created_at: string }[]): number {
  if (checkins.length === 0) return 0

  const dateSet = new Set<number>()
  for (const c of checkins) {
    const d = new Date(c.created_at)
    d.setHours(0, 0, 0, 0)
    dateSet.add(d.getTime())
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let cursor = new Date(today)
  let streak = 0

  // If today has no check-in, start counting from yesterday
  if (!dateSet.has(cursor.getTime())) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (dateSet.has(cursor.getTime())) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

// ── Screening ─────────────────────────────────────────────────────────────────

export async function saveScreening(params: {
  fuzzyResult: FuzzyResult
  answers: Answer[]
  screeningType: ScreeningType
  parentScreeningId?: string
}): Promise<Result<Screening>> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { data: null, error: 'Not authenticated' }

    const { fuzzyResult, answers, screeningType, parentScreeningId } = params
    const { data, error } = await supabase
      .from('screenings')
      .insert({
        user_id:             user.id,
        fuzzy_score:         fuzzyResult.score,
        severity:            fuzzyResult.severity,
        factor_scores:       fuzzyResult.factorScores,
        membership_degrees:  fuzzyResult.membershipDegrees,
        answers,
        screening_type:      screeningType,
        parent_screening_id: parentScreeningId ?? null,
        self_harm_flag:      fuzzyResult.selfHarmFlag,
      })
      .select()
      .single()

    if (error) throw error
    return { data: data as Screening, error: null }
  } catch (err) {
    return { data: null, error: toError(err) }
  }
}

export async function getScreeningById(id: string): Promise<Result<Screening>> {
  try {
    const { data, error } = await supabase
      .from('screenings')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data: data as Screening, error: null }
  } catch (err) {
    return { data: null, error: toError(err) }
  }
}

export async function getLatestScreening(): Promise<Result<Screening>> {
  try {
    const { data, error } = await supabase
      .from('screenings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return { data: data as Screening | null, error: null }
  } catch (err) {
    return { data: null, error: toError(err) }
  }
}

export async function getScreeningHistory(limit: number): Promise<ListResult<Screening>> {
  try {
    const { data, error } = await supabase
      .from('screenings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return { data: (data ?? []) as Screening[], error: null }
  } catch (err) {
    return { data: [], error: toError(err) }
  }
}

export async function getDashboardStats(): Promise<Result<DashboardStats>> {
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

    const [latestRes, countRes, moodRes] = await Promise.all([
      supabase
        .from('screenings')
        .select('fuzzy_score, severity')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('screenings')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('mood_checkins')
        .select('created_at')
        .gte('created_at', ninetyDaysAgo)
        .order('created_at', { ascending: false }),
    ])

    if (latestRes.error) throw latestRes.error
    if (countRes.error)  throw countRes.error
    if (moodRes.error)   throw moodRes.error

    return {
      data: {
        latestScore:      latestRes.data?.fuzzy_score ?? null,
        latestSeverity:   (latestRes.data?.severity as SeverityLevel) ?? null,
        totalScreenings:  countRes.count ?? 0,
        streakDays:       calcStreak(moodRes.data ?? []),
      },
      error: null,
    }
  } catch (err) {
    return { data: null, error: toError(err) }
  }
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function getProfile(): Promise<Result<Profile>> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { data: null, error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return { data: data as Profile, error: null }
  } catch (err) {
    return { data: null, error: toError(err) }
  }
}

export async function updateProfile(params: {
  name?: string
  age?: number
}): Promise<Result<Profile>> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { data: null, error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...params, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return { data: data as Profile, error: null }
  } catch (err) {
    return { data: null, error: toError(err) }
  }
}

// ── Mood ──────────────────────────────────────────────────────────────────────

export async function saveMoodCheckin(mood: MoodLevel): Promise<Result<MoodCheckin>> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { data: null, error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('mood_checkins')
      .insert({ user_id: user.id, mood })
      .select()
      .single()

    if (error) throw error
    return { data: data as MoodCheckin, error: null }
  } catch (err) {
    return { data: null, error: toError(err) }
  }
}

export async function getTodayMoodCheckin(): Promise<Result<MoodCheckin>> {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('mood_checkins')
      .select('*')
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return { data: data as MoodCheckin | null, error: null }
  } catch (err) {
    return { data: null, error: toError(err) }
  }
}

export async function getMoodCheckins(days: number): Promise<ListResult<MoodCheckin>> {
  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('mood_checkins')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: (data ?? []) as MoodCheckin[], error: null }
  } catch (err) {
    return { data: [], error: toError(err) }
  }
}

// ── Intervention ──────────────────────────────────────────────────────────────

export async function createIntervention(params: {
  screeningId: string
  type: InterventionType
  notes?: string
}): Promise<Result<Intervention>> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { data: null, error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('interventions')
      .insert({
        user_id:      user.id,
        screening_id: params.screeningId,
        type:         params.type,
        notes:        params.notes ?? null,
      })
      .select()
      .single()

    if (error) throw error
    return { data: data as Intervention, error: null }
  } catch (err) {
    return { data: null, error: toError(err) }
  }
}

export async function saveJournalEntry(params: {
  content: string
  screeningId?: string
}): Promise<Result<JournalEntry>> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { data: null, error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id:      user.id,
        content:      params.content,
        screening_id: params.screeningId ?? null,
      })
      .select()
      .single()

    if (error) throw error
    return { data: data as JournalEntry, error: null }
  } catch (err) {
    return { data: null, error: toError(err) }
  }
}
