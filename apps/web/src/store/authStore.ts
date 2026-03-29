import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  username: string
  currentStreak: number; // <--- Thêm dòng này vào
  lastStreakAt?: string | Date;
  profile?: UserProfile;
}

interface AuthState {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  updateUser: (user: User) => void
  logout: () => void
}

export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      updateUser: (updatedUser) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedUser } : updatedUser
      })),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
