import type { UserProfile } from '@/types/profile'
import { createContext, useCallback, useContext, useRef } from 'react'

interface ProfileFormContextType {
  updateField: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => void
  getData: () => Partial<UserProfile>
  resetData: () => void
}

const ProfileFormContext = createContext<ProfileFormContextType | undefined>(undefined)

export const ProfileFormProvider = ({ children }: { children: React.ReactNode }) => {
  const dataRef = useRef<Partial<UserProfile>>({})

  const updateField = useCallback(<K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    dataRef.current = { ...dataRef.current, [key]: value }
  }, [])

  const getData = useCallback(() => {
    return { ...dataRef.current }
  }, [])

  const resetData = useCallback(() => {
    dataRef.current = {}
  }, [])

  return (
    <ProfileFormContext.Provider value={{ updateField, getData, resetData }}>
      {children}
    </ProfileFormContext.Provider>
  )
}

export const useProfileForm = (): ProfileFormContextType => {
  const context = useContext(ProfileFormContext)
  if (!context) {
    throw new Error('useProfileForm must be used within a ProfileFormProvider')
  }
  return context
}
