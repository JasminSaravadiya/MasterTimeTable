import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Config {
  id?: number;
  name: string;
  start_time: string; // '08:00'
  end_time: string;   // '17:00'
  slot_duration_minutes: number;
  break_start_time?: string;
  break_end_time?: string;
}

interface AppState {
  currentConfig: Config | null;
  recentConfigs: Config[];
  setConfig: (config: Config) => void;
  addRecentConfig: (config: Config) => void;
  clearConfig: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentConfig: null,
      recentConfigs: [],
      setConfig: (config: Config) => set({ currentConfig: config }),
      addRecentConfig: (config: Config) => set((state: AppState) => {
          const exists = state.recentConfigs.find((c: Config) => c.id === config.id);
          if (exists) return state;
          return { recentConfigs: [config, ...state.recentConfigs].slice(0, 10) };
      }),
      clearConfig: () => set({ currentConfig: null }),
    }),
    {
      name: 'timetable-storage',
    }
  )
);
