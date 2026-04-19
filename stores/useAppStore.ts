import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  preferredCurrency: string;
  themePreference: string;
}

interface AppState {
  // Auth
  currentUser: User | null;
  apiToken: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;

  // Cache — hydrated from API
  groups: any[];
  setGroups: (groups: any[]) => void;

  groupDetail: Record<string, any>;
  setGroupDetail: (id: string, data: any) => void;

  myBalance: { totalOwed: number; totalOwing: number; netBalance: number } | null;
  setMyBalance: (b: any) => void;

  activities: any[];
  setActivities: (a: any[]) => void;

  // UI
  theme: 'light' | 'dark' | 'system';
  setTheme: (t: 'light' | 'dark' | 'system') => void;

  // Loading
  loading: Record<string, boolean>;
  setLoading: (key: string, val: boolean) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  currentUser: null,
  apiToken: null,
  setAuth: (user, token) => set({ currentUser: user, apiToken: token }),
  clearAuth: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('dutchwise-token');
    set({ currentUser: null, apiToken: null, groups: [], groupDetail: {}, myBalance: null, activities: [] });
  },

  groups: [],
  setGroups: (groups) => set({ groups }),

  groupDetail: {},
  setGroupDetail: (id, data) => set((s) => ({ groupDetail: { ...s.groupDetail, [id]: data } })),

  myBalance: null,
  setMyBalance: (b) => set({ myBalance: b }),

  activities: [],
  setActivities: (a) => set({ activities: a }),

  theme: 'system',
  setTheme: (t) => set({ theme: t }),

  loading: {},
  setLoading: (key, val) => set((s) => ({ loading: { ...s.loading, [key]: val } })),
}));
