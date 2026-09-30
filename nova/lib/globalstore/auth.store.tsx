  import { AuthResponse, User } from '@/features/auth/types/auth.types';
import { create } from 'zustand';
import { auth } from '../auth';
  interface AuthState {
    isAuthenticated: boolean;
    login: (userProfile: User | null) => void;
    logout: () => void;
    userProfile: User | null;
    reset: () => void;
  }
const initialState = {
  isAuthenticated: false,
  userProfile: null,
};
  const useAuthStore = create<AuthState>((set) => ({
    ...initialState,
   
    login: (userProfile: User | null) => set({ isAuthenticated: true, userProfile }),
    logout: () => { auth.logout(); set({ isAuthenticated: false, userProfile: null }); },

    reset: () => set({ ...initialState }),
  }));

  export default useAuthStore;