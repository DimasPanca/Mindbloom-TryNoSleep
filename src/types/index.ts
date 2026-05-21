export type SeverityLevel    = 'normal' | 'ringan' | 'sedang' | 'berat'
export type MoodLevel        = 'buruk' | 'kurang' | 'biasa' | 'baik' | 'sangat_baik'
export type AnswerValue      = 1 | 2 | 3 | 4 | 5 | 6
export type DimensionKey     = 'mood' | 'sleep' | 'energy' | 'social' | 'anxiety'
export type ScreeningType    = 'initial' | 'retest'
export type InterventionType = 'music' | 'video' | 'journal'
export type FuzzyLevel       = 'baik' | 'cukup' | 'buruk'

export interface Profile {
  id: string
  name: string
  age?: number
  created_at: string
  updated_at: string
}

export interface Screening {
  id: string
  user_id: string
  fuzzy_score: number
  severity: SeverityLevel
  factor_scores: FactorScores
  membership_degrees: MembershipDegrees
  answers: Answer[]
  screening_type: ScreeningType
  parent_screening_id?: string
  self_harm_flag: boolean
  created_at: string
}

export interface Intervention {
  id: string
  user_id: string
  screening_id: string
  type: InterventionType
  notes?: string
  created_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  screening_id?: string
  content: string
  created_at: string
}

export interface MoodCheckin {
  id: string
  user_id: string
  mood: MoodLevel
  created_at: string
}

export interface SeverityMeta {
  label: string
  headline: string
  description: string
  bgColor: string
  textColor: string
  borderColor: string
  accentColor: string
  iconName: string
}

export const SEVERITY_CONFIG: Record<SeverityLevel, SeverityMeta> = {
  normal: {
    label:       'Normal',
    headline:    'Kondisimu Cukup Baik',
    description: 'Kondisi mental kamu baik-baik saja. Terus jaga pola hidup sehat.',
    bgColor:     'bg-green-50 dark:bg-green-950/30',
    textColor:   'text-green-700 dark:text-green-400',
    borderColor: 'border-green-300 dark:border-green-700',
    accentColor: '#5EA85C',
    iconName:    'CircleCheck',
  },
  ringan: {
    label:       'Ringan',
    headline:    'Ada Hal yang Perlu Diperhatikan',
    description: 'Ada sedikit tanda-tanda yang perlu diperhatikan. Pertimbangkan intervensi dini.',
    bgColor:     'bg-yellow-50 dark:bg-yellow-950/30',
    textColor:   'text-yellow-700 dark:text-yellow-400',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
    accentColor: '#D9A23B',
    iconName:    'Info',
  },
  sedang: {
    label:       'Sedang',
    headline:    'Kondisimu Perlu Perhatian',
    description: 'Kondisimu memerlukan perhatian dan intervensi dini. Coba mulai dengan aktivitas ringan.',
    bgColor:     'bg-orange-50 dark:bg-orange-950/30',
    textColor:   'text-orange-700 dark:text-orange-400',
    borderColor: 'border-orange-300 dark:border-orange-700',
    accentColor: '#E0914A',
    iconName:    'TriangleAlert',
  },
  berat: {
    label:       'Berat',
    headline:    'Kondisimu Butuh Bantuan Segera',
    description: 'Disarankan segera berkonsultasi dengan profesional kesehatan mental.',
    bgColor:     'bg-red-50 dark:bg-red-950/30',
    textColor:   'text-red-700 dark:text-red-400',
    borderColor: 'border-red-300 dark:border-red-700',
    accentColor: '#E0665A',
    iconName:    'AlertCircle',
  },
}

export interface MoodMeta {
  label: string
  color: string
  bgColor: string
  value: number
  iconName: string
}

export const MOOD_CONFIG: Record<MoodLevel, MoodMeta> = {
  buruk:      { label: 'Sangat Buruk', color: '#E0665A', bgColor: 'bg-red-100 dark:bg-red-950/40',    value: 1, iconName: 'Angry' },
  kurang:     { label: 'Kurang',       color: '#E0914A', bgColor: 'bg-orange-100 dark:bg-orange-950/40', value: 2, iconName: 'Frown' },
  biasa:      { label: 'Biasa',        color: '#D9A23B', bgColor: 'bg-yellow-100 dark:bg-yellow-950/40', value: 3, iconName: 'Meh' },
  baik:       { label: 'Baik',         color: '#2AAFA0', bgColor: 'bg-teal-100 dark:bg-teal-950/40',  value: 4, iconName: 'Smile' },
  sangat_baik:{ label: 'Sangat Baik',  color: '#5EA85C', bgColor: 'bg-green-100 dark:bg-green-950/40', value: 5, iconName: 'Laugh' },
}

export interface DimensionMeta {
  label: string
  color: string
  bgColor: string
  description: string
  iconName: string
}

export const DIMENSION_LABELS: Record<DimensionKey, DimensionMeta> = {
  mood:    { label: 'Emosi',            color: '#2AAFA0', bgColor: 'bg-teal-100 dark:bg-teal-950/40',   description: 'Stabilitas emosi dan regulasi perasaan dalam aktivitas harian.',    iconName: 'Heart' },
  sleep:   { label: 'Kualitas Tidur',   color: '#7B6FCA', bgColor: 'bg-purple-100 dark:bg-purple-950/40', description: 'Pola dan kualitas tidurmu dalam beberapa waktu terakhir.',         iconName: 'Moon' },
  energy:  { label: 'Energi',           color: '#D9A23B', bgColor: 'bg-yellow-100 dark:bg-yellow-950/40', description: 'Tingkat energi dan motivasi untuk menjalani aktivitas.',           iconName: 'Zap' },
  social:  { label: 'Interaksi Sosial', color: '#5EA85C', bgColor: 'bg-green-100 dark:bg-green-950/40', description: 'Kualitas hubungan dan interaksimu dengan orang sekitar.',           iconName: 'Users' },
  anxiety: { label: 'Kecemasan',        color: '#E0665A', bgColor: 'bg-red-100 dark:bg-red-950/40',    description: 'Tingkat kekhawatiran atau ketegangan yang kamu rasakan.',           iconName: 'Activity' },
}

export interface Question {
  id: string
  text: string
  dimension: DimensionKey
  weight: number
  polarity?: 'positive' | 'negative'
  isCritical?: boolean
  isCore?: boolean
  severityTarget?: SeverityLevel[]
  tags?: string[]
}

export interface Answer {
  questionId: string
  value: AnswerValue
}

export type FactorScores      = Record<DimensionKey, number>
export type MembershipDegrees = Record<SeverityLevel, number>

export interface FuzzyResult {
  score: number
  severity: SeverityLevel
  factorScores: FactorScores
  membershipDegrees: MembershipDegrees
  selfHarmFlag: boolean
}

export interface DashboardStats {
  latestScore: number | null
  latestSeverity: SeverityLevel | null
  streakDays: number
  totalScreenings: number
}
