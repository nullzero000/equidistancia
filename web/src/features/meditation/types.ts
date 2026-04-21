// src/features/meditation/types.ts

import type { ColorSystem } from '../../domain/types/core';

/**
 * Fases de la meditación
 */
export type MeditationPhase = 'idle' | 'preparing' | 'active' | 'paused' | 'completed';

/**
 * Fases de respiración
 */
export type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

/**
 * Sesión de meditación
 */
export interface MeditationSession {
  id: string;
  intention: string;
  duration: number;
  startedAt: Date | null;
  completedAt: Date | null;
  phase: MeditationPhase;
}

/**
 * Patrón de respiración
 */
export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
}

/**
 * Configuración de meditación
 */
export interface MeditationConfig {
  duration: number;
  breathingPattern: BreathingPattern;
  colorSystem: ColorSystem;
  showAffirmations: boolean;
  showBreathingGuide: boolean;
  showSacredGeometry: boolean;
  showParticles: boolean;
}

/**
 * Afirmación
 */
export interface Affirmation {
  id: string;
  hebrew: string;
  spanish: string;
  english: string;
  sephira?: string;
}