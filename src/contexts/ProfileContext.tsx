import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Profile } from '@/types'
import { useAuth } from './AuthContext'
import { getProfile } from '@/lib/storage'

interface ProfileContextType {
  profile: Profile | null
  loading: boolean
  refresh: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user }              = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null)
      return
    }
    setLoading(true)
    const { data } = await getProfile()
    setProfile(data)
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <ProfileContext.Provider value={{ profile, loading, refresh }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile(): ProfileContextType {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}
