// src/features/meditation/constants.ts

import type { BreathingPattern, Affirmation } from './types';

/**
 * Patrones de respiración
 */
export const BREATHING_PATTERNS: Record<string, BreathingPattern> = {
  tetragrammaton: {
    id: 'tetragrammaton',
    name: 'Tetragrammaton (4-4-4-4)',
    description: 'Cada fase corresponde a una letra del Nombre Sagrado',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
  },
  basic: {
    id: 'basic',
    name: 'Básico (4-4-4-4)',
    description: 'Respiración cuadrada equilibrada',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
  },
  relaxing: {
    id: 'relaxing',
    name: 'Relajante (4-7-8)',
    description: 'Técnica para calmar el sistema nervioso',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
  },
  energizing: {
    id: 'energizing',
    name: 'Energizante (4-2-4-2)',
    description: 'Para aumentar la energía vital',
    inhale: 4,
    holdIn: 2,
    exhale: 4,
    holdOut: 2,
  },
  deep: {
    id: 'deep',
    name: 'Profundo (6-6-6-6)',
    description: 'Para meditación profunda',
    inhale: 6,
    holdIn: 6,
    exhale: 6,
    holdOut: 6,
  },
};

/**
 * Duraciones de meditación
 */
export const MEDITATION_DURATIONS = [
  { label: '3 min', value: 180, description: 'Sesión rápida' },
  { label: '5 min', value: 300, description: 'Sesión corta' },
  { label: '10 min', value: 600, description: 'Sesión estándar' },
  { label: '15 min', value: 900, description: 'Sesión media' },
  { label: '20 min', value: 1200, description: 'Sesión extendida' },
  { label: '30 min', value: 1800, description: 'Sesión profunda' },
];

/**
 * Afirmaciones
 */
export const AFFIRMATIONS: Affirmation[] = [
  {
    id: 'unity',
    hebrew: 'אני אחד עם האור האין סוף',
    spanish: 'Soy uno con la Luz Infinita',
    english: 'I am one with the Infinite Light',
    sephira: 'Keter',
  },
  {
    id: 'guidance',
    hebrew: 'השם מנחה ומגן עלי',
    spanish: 'El Nombre me guía y protege',
    english: 'The Name guides and protects me',
    sephira: 'Chokmah',
  },
  {
    id: 'understanding',
    hebrew: 'אני מחובר לחכמה האינסופית',
    spanish: 'Estoy conectado con la sabiduría infinita',
    english: 'I am connected to infinite wisdom',
    sephira: 'Binah',
  },
  {
    id: 'channel',
    hebrew: 'אני צינור לאור ואהבה אלוהיים',
    spanish: 'Soy un canal de luz y amor divino',
    english: 'I am a channel for divine light and love',
    sephira: 'Tiferet',
  },
  {
    id: 'expansion',
    hebrew: 'התודעה שלי מתרחבת אל האינסוף',
    spanish: 'Mi consciencia se expande hacia lo infinito',
    english: 'My consciousness expands toward infinity',
    sephira: 'Chesed',
  },
  {
    id: 'peace',
    hebrew: 'שלום שורה בתוכי',
    spanish: 'La paz mora dentro de mí',
    english: 'Peace dwells within me',
    sephira: 'Netzach',
  },
  {
    id: 'manifestation',
    hebrew: 'אני מגלם את הכוונה שלי',
    spanish: 'Manifiesto mi intención con claridad',
    english: 'I manifest my intention with clarity',
    sephira: 'Malkuth',
  },
];

/**
 * Textos de respiración
 */
export const BREATH_TEXTS: Record<string, { text: string; instruction: string }> = {
  'inhale': { text: 'INHALA', instruction: 'Recibe la luz' },
  'hold-in': { text: 'SOSTÉN', instruction: 'Expande la consciencia' },
  'exhale': { text: 'EXHALA', instruction: 'Libera y conecta' },
  'hold-out': { text: 'SOSTÉN', instruction: 'Descansa en el vacío' },
};

/**
 * Círculos sagrados
 */
export const SACRED_CIRCLES = [
  { id: 1, size: 320, color: '#FFD700', duration: 30, direction: 'normal' },
  { id: 2, size: 250, color: '#B22222', duration: 25, direction: 'reverse' },
  { id: 3, size: 180, color: '#32CD32', duration: 20, direction: 'normal' },
];

/**
 * Configuración por defecto
 */
export const DEFAULT_MEDITATION_CONFIG = {
  duration: 300,
  breathingPattern: BREATHING_PATTERNS.tetragrammaton,
  showAffirmations: true,
  showBreathingGuide: true,
  showSacredGeometry: false,
  showParticles: false,
};