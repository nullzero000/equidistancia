/**
 * HEBREW ALPHABET - Otzar Kodesh
 * 22 base letters + 5 finals = 27 total
 */

import type { Letter } from '../types/core';

export const ALPHABET: Record<string, Letter> = {
  'א': { char: 'א', name: 'Aleph', value: 1, meaning: 'Ox, Air' },
  'ב': { char: 'ב', name: 'Bet', value: 2, meaning: 'House' },
  'ג': { char: 'ג', name: 'Gimel', value: 3, meaning: 'Camel' },
  'ד': { char: 'ד', name: 'Dalet', value: 4, meaning: 'Door' },
  'ה': { char: 'ה', name: 'He', value: 5, meaning: 'Window' },
  'ו': { char: 'ו', name: 'Vav', value: 6, meaning: 'Hook' },
  'ז': { char: 'ז', name: 'Zayin', value: 7, meaning: 'Sword' },
  'ח': { char: 'ח', name: 'Chet', value: 8, meaning: 'Fence' },
  'ט': { char: 'ט', name: 'Tet', value: 9, meaning: 'Serpent' },
  'י': { char: 'י', name: 'Yud', value: 10, meaning: 'Hand' },
  'כ': { char: 'כ', name: 'Kaf', value: 20, finalValue: 500, meaning: 'Palm' },
  'ל': { char: 'ל', name: 'Lamed', value: 30, meaning: 'Staff' },
  'מ': { char: 'מ', name: 'Mem', value: 40, finalValue: 600, meaning: 'Water' },
  'נ': { char: 'נ', name: 'Nun', value: 50, finalValue: 700, meaning: 'Fish' },
  'ס': { char: 'ס', name: 'Samekh', value: 60, meaning: 'Support' },
  'ע': { char: 'ע', name: 'Ayin', value: 70, meaning: 'Eye' },
  'פ': { char: 'פ', name: 'Pe', value: 80, finalValue: 800, meaning: 'Mouth' },
  'צ': { char: 'צ', name: 'Tzadi', value: 90, finalValue: 900, meaning: 'Fishhook' },
  'ק': { char: 'ק', name: 'Qof', value: 100, meaning: 'Back of Head' },
  'ר': { char: 'ר', name: 'Resh', value: 200, meaning: 'Head' },
  'ש': { char: 'ש', name: 'Shin', value: 300, meaning: 'Fire, Tooth' },
  'ת': { char: 'ת', name: 'Tav', value: 400, meaning: 'Mark, Seal' },
  // Finals
  'ך': { char: 'ך', name: 'Kaf Final', value: 20, finalValue: 500, meaning: 'Final Kaf' },
  'ם': { char: 'ם', name: 'Mem Final', value: 40, finalValue: 600, meaning: 'Final Mem' },
  'ן': { char: 'ן', name: 'Nun Final', value: 50, finalValue: 700, meaning: 'Final Nun' },
  'ף': { char: 'ף', name: 'Pe Final', value: 80, finalValue: 800, meaning: 'Final Pe' },
  'ץ': { char: 'ץ', name: 'Tzadi Final', value: 90, finalValue: 900, meaning: 'Final Tzadi' },
};

// Map finals to regular forms
export const FINALS: Record<string, string> = {
  'ך': 'כ',
  'ם': 'מ',
  'ן': 'נ',
  'ף': 'פ',
  'ץ': 'צ',
};

// Colors by system
export const COLORS: Record<string, Record<string, string>> = {
  'א': { ZOHAR: '#FFFFFF', GOLDEN_DAWN: '#FFD700', SEFIROT: '#FFFFE0', AKASHIC: '#ADFF2F' },
  'ב': { ZOHAR: '#464646', GOLDEN_DAWN: '#FFFFFF', SEFIROT: '#483D8B', AKASHIC: '#0000CD' },
  'ג': { ZOHAR: '#960000', GOLDEN_DAWN: '#FFFFFF', SEFIROT: '#DC143C', AKASHIC: '#E4007C' },
  'ד': { ZOHAR: '#782828', GOLDEN_DAWN: '#FFFFFF', SEFIROT: '#CD5C5C', AKASHIC: '#953553' },
  'ה': { ZOHAR: '#B22222', GOLDEN_DAWN: '#B40000', SEFIROT: '#B0E0E6', AKASHIC: '#87CEEB' },
  'ו': { ZOHAR: '#32CD32', GOLDEN_DAWN: '#FFFFFF', SEFIROT: '#FF4500', AKASHIC: '#DC143C' },
  'ז': { ZOHAR: '#5A5A5A', GOLDEN_DAWN: '#4169E1', SEFIROT: '#6495ED', AKASHIC: '#4169E1' },
  'ח': { ZOHAR: '#B8860B', GOLDEN_DAWN: '#FFD700', SEFIROT: '#DAA520', AKASHIC: '#FFD700' },
  'ט': { ZOHAR: '#778899', GOLDEN_DAWN: '#C8A2C8', SEFIROT: '#C71585', AKASHIC: '#C8A2C8' },
  'י': { ZOHAR: '#FFFFFF', GOLDEN_DAWN: '#000000', SEFIROT: '#FFEFD5', AKASHIC: '#FFF8DC' },
  'כ': { ZOHAR: '#708090', GOLDEN_DAWN: '#FFFFFF', SEFIROT: '#7B68EE', AKASHIC: '#8A2BE2' },
  'ל': { ZOHAR: '#A52A2A', GOLDEN_DAWN: '#D2691E', SEFIROT: '#FF8C00', AKASHIC: '#CC7722' },
  'מ': { ZOHAR: '#4682B4', GOLDEN_DAWN: '#0000C8', SEFIROT: '#00BFFF', AKASHIC: '#00CED1' },
  'נ': { ZOHAR: '#8B4545', GOLDEN_DAWN: '#FFA07A', SEFIROT: '#FF7F7F', AKASHIC: '#FFB6C1' },
  'ס': { ZOHAR: '#5A465A', GOLDEN_DAWN: '#BA55D3', SEFIROT: '#DDA0DD', AKASHIC: '#DA70D6' },
  'ע': { ZOHAR: '#2E8B57', GOLDEN_DAWN: '#101010', SEFIROT: '#228B22', AKASHIC: '#50C878' },
  'פ': { ZOHAR: '#B22222', GOLDEN_DAWN: '#FFFFFF', SEFIROT: '#DB7093', AKASHIC: '#FF69B4' },
  'צ': { ZOHAR: '#228B22', GOLDEN_DAWN: '#90EE90', SEFIROT: '#98FB98', AKASHIC: '#90EE90' },
  'ק': { ZOHAR: '#4682B4', GOLDEN_DAWN: '#B0E0E6', SEFIROT: '#87CEFA', AKASHIC: '#AFEEEE' },
  'ר': { ZOHAR: '#696969', GOLDEN_DAWN: '#FFFFFF', SEFIROT: '#D8BFD8', AKASHIC: '#E6E6FA' },
  'ש': { ZOHAR: '#B22222', GOLDEN_DAWN: '#DC0000', SEFIROT: '#FF4500', AKASHIC: '#E0FFFF' },
  'ת': { ZOHAR: '#A9A9A9', GOLDEN_DAWN: '#FFFFFF', SEFIROT: '#FFFAF0', AKASHIC: '#FFFFE0' },
  // Finals same as regular
  'ך': { ZOHAR: '#708090', GOLDEN_DAWN: '#FFFFFF', SEFIROT: '#7B68EE', AKASHIC: '#8A2BE2' },
  'ם': { ZOHAR: '#4682B4', GOLDEN_DAWN: '#0000C8', SEFIROT: '#00BFFF', AKASHIC: '#00CED1' },
  'ן': { ZOHAR: '#8B4545', GOLDEN_DAWN: '#FFA07A', SEFIROT: '#FF7F7F', AKASHIC: '#FFB6C1' },
  'ף': { ZOHAR: '#B22222', GOLDEN_DAWN: '#FFFFFF', SEFIROT: '#DB7093', AKASHIC: '#FF69B4' },
  'ץ': { ZOHAR: '#228B22', GOLDEN_DAWN: '#90EE90', SEFIROT: '#98FB98', AKASHIC: '#90EE90' },
};

export function getLetterValue(char: string, system: 'STANDARD' | 'LARGE'): number {
  const letter = ALPHABET[char];
  if (!letter) return 0;
  
  // LARGE system uses final values for final letters
  if (system === 'LARGE' && char in FINALS && letter.finalValue) {
    return letter.finalValue;
  }
  
  return letter.value;
}

export function getLetterColor(char: string, system: string): string {
  return COLORS[char]?.[system] || '#FFFFFF';
}
