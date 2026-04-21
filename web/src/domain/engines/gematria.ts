import type { GematriaSystem } from '../types/core';

export interface GematriaResult {
  total: number;
  reduced: number;
  letters: { char: string; value: number }[];
  system: GematriaSystem;
}

function getLetterValue(char: string, system: GematriaSystem): number {
  const values: Record<string, number> = {
    א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9, י: 10,
    כ: 20, ל: 30, מ: 40, נ: 50, ס: 60, ע: 70, פ: 80, צ: 90,
    ק: 100, ר: 200, ש: 300, ת: 400,
  };

  const finals: Record<string, number> = {
    ך: system === 'LARGE' ? 500 : 20,
    ם: system === 'LARGE' ? 600 : 40,
    ן: system === 'LARGE' ? 700 : 50,
    ף: system === 'LARGE' ? 800 : 80,
    ץ: system === 'LARGE' ? 900 : 90,
  };

  return finals[char] ?? values[char] ?? 0;
}

function calculateReduced(value: number): number {
  while (value > 9) {
    value = value
      .toString()
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return value;
}

function calculateOrdinal(text: string): number {
  const ordinalValues: Record<string, number> = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7,
    'ח': 8, 'ט': 9, 'י': 10, 'כ': 11, 'ך': 11, 'ל': 12,
    'מ': 13, 'ם': 13, 'נ': 14, 'ן': 14, 'ס': 15, 'ע': 16,
    'פ': 17, 'ף': 17, 'צ': 18, 'ץ': 18, 'ק': 19, 'ר': 20,
    'ש': 21, 'ת': 22,
  };

  return text
    .split('')
    .reduce((sum, char) => sum + (ordinalValues[char] || 0), 0);
}

function calculateSquared(text: string, system: GematriaSystem): number {
  const letters = text.split('');
  return letters.reduce((sum, char) => {
    const value = getLetterValue(char, system);
    return sum + (value * value);
  }, 0);
}

function calculateTriangular(text: string): number {
  const ordinalValues: Record<string, number> = {
    'א': 1, 'ב': 3, 'ג': 6, 'ד': 10, 'ה': 15, 'ו': 21, 'ז': 28,
    'ח': 36, 'ט': 45, 'י': 55, 'כ': 66, 'ך': 66, 'ל': 78,
    'מ': 91, 'ם': 91, 'נ': 105, 'ן': 105, 'ס': 120, 'ע': 136,
    'פ': 153, 'ף': 153, 'צ': 171, 'ץ': 171, 'ק': 190, 'ר': 210,
    'ש': 231, 'ת': 253,
  };

  return text
    .split('')
    .reduce((sum, char) => sum + (ordinalValues[char] || 0), 0);
}

export function calculate(
  text: string,
  system: GematriaSystem = 'STANDARD'
): GematriaResult {
  const letters = text.split('').filter((char) => char.trim() !== '');

  const letterValues = letters.map((char) => ({
    char,
    value: getLetterValue(char, system),
  }));

  let total = 0;
  
  switch (system) {
    case 'ORDINAL':
      total = calculateOrdinal(text);
      break;
    case 'SQUARED':
      total = calculateSquared(text, 'STANDARD');
      break;
    case 'TRIANGULAR':
      total = calculateTriangular(text);
      break;
    default:
      // STANDARD, LARGE, REDUCED
      total = letterValues.reduce((sum, { value }) => sum + value, 0);
  }

  const reduced = calculateReduced(total);

  return {
    total,
    reduced,
    letters: letterValues,
    system,
  };
}