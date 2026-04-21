import { create } from 'zustand';
import type { Config, GematriaSystem, MiluySystem, ColorSystem, School } from '../../domain/types/core';
import { DEFAULT_CONFIG } from '../../domain/types/core';

interface AppState {
  input: string;
  config: Config;
  
  setInput: (text: string) => void;
  setGematria: (system: GematriaSystem) => void;
  setMiluy: (system: MiluySystem) => void;
  setColors: (system: ColorSystem) => void;
  setSchool: (school: School) => void;
  reset: () => void;
}

export const useStore = create<AppState>((set) => ({
  input: '',
  config: DEFAULT_CONFIG,
  
  setInput: (text) => set({ input: text }),
  
  setGematria: (system) =>
    set((state) => ({ config: { ...state.config, gematria: system } })),
  
  setMiluy: (system) =>
    set((state) => ({ config: { ...state.config, miluy: system } })),
  
  setColors: (system) =>
    set((state) => ({ config: { ...state.config, colors: system } })),
  
  setSchool: (school) =>
    set((state) => ({ config: { ...state.config, school } })),
  
  reset: () => set({ input: '', config: DEFAULT_CONFIG }),
}));