import { create } from 'zustand';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initAuth: () => () => void;
  refreshUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  setLoading: (loading) => set({ loading }),

  // Firebase 인증 상태 구독 초기화
  initAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      set({ user: currentUser, loading: false });
    });
    return unsubscribe;
  },

  // 사용자 정보 새로고침
  refreshUser: () => {
    if (auth.currentUser) {
      set({ user: { ...auth.currentUser } as User });
    }
  },
}));
