/**
 * CORE TYPES - Otzar Kodesh
 * Academically validated Kabbalistic computation types
 */

// ========================================
// BASIC SYSTEMS
// ========================================

export type GematriaSystem = 
  | 'STANDARD'   // ך=20
  | 'LARGE'      // ך=500
  | 'REDUCED'    // Digital sum
  | 'ORDINAL'    // Position (א=1, ב=2...)
  | 'SQUARED'    // Value squared
  | 'TRIANGULAR'; // Cumulative sum
export type MiluySystem = 'AB' | 'SAG' | 'MAH' | 'BAN';
export type ColorSystem = 'ZOHAR' | 'GOLDEN_DAWN' | 'SEFIROT' | 'AKASHIC';
export type School = 'FOUNDATIONAL' | 'THEOSOPHICAL' | 'LURIANIC' | 'ECSTATIC';

// ========================================
// CONFIGURATION
// ========================================

export interface Config {
  gematria: GematriaSystem;
  miluy: MiluySystem;
  colors: ColorSystem;
  school: School;
}

export const DEFAULT_CONFIG: Config = {
  gematria: 'STANDARD',
  miluy: 'AB',
  colors: 'ZOHAR',
  school: 'LURIANIC',
};

// ========================================
// LETTER DATA
// ========================================

export interface Letter {
  char: string;
  name: string;
  value: number;
  finalValue?: number;
  meaning: string;
}

// ========================================
// RESULTS
// ========================================

export interface GematriaResult {
  total: number;
  reduced: number;
  letters: Array<{ char: string; value: number }>;
}

export interface Analysis {
  input: string;
  gematria: GematriaResult;
  config: Config;
}
