/**
 * TEMURAH - Hebrew Cipher Systems
 */

export const ATBASH_TABLE: Record<string, string> = {
  'א': 'ת', 'ב': 'ש', 'ג': 'ר', 'ד': 'ק', 'ה': 'צ',
  'ו': 'פ', 'ז': 'ע', 'ח': 'ס', 'ט': 'נ', 'י': 'מ',
  'כ': 'ל', 'ל': 'כ', 'מ': 'י', 'נ': 'ט', 'ס': 'ח',
  'ע': 'ז', 'פ': 'ו', 'צ': 'ה', 'ק': 'ד', 'ר': 'ג',
  'ש': 'ב', 'ת': 'א',
  'ך': 'ל', 'ם': 'י', 'ן': 'ט', 'ף': 'ו', 'ץ': 'ה',
};

export const ALBAM_TABLE: Record<string, string> = {
  'א': 'ל', 'ב': 'מ', 'ג': 'נ', 'ד': 'ס', 'ה': 'ע',
  'ו': 'פ', 'ז': 'צ', 'ח': 'ק', 'ט': 'ר', 'י': 'ש',
  'כ': 'ת', 'ל': 'א', 'מ': 'ב', 'נ': 'ג', 'ס': 'ד',
  'ע': 'ה', 'פ': 'ו', 'צ': 'ז', 'ק': 'ח', 'ר': 'ט',
  'ש': 'י', 'ת': 'כ',
};

export const AVGAD_TABLE: Record<string, string> = {
  'א': 'ב', 'ב': 'ג', 'ג': 'ד', 'ד': 'ה', 'ה': 'ו',
  'ו': 'ז', 'ז': 'ח', 'ח': 'ט', 'ט': 'י', 'י': 'כ',
  'כ': 'ל', 'ל': 'מ', 'מ': 'נ', 'נ': 'ס', 'ס': 'ע',
  'ע': 'פ', 'פ': 'צ', 'צ': 'ק', 'ק': 'ר', 'ר': 'ש',
  'ש': 'ת', 'ת': 'א',
};

type CipherSystem = 'atbash' | 'albam' | 'avgad';

export function applyTemurah(text: string, system: CipherSystem): string {
  const tables = {
    atbash: ATBASH_TABLE,
    albam: ALBAM_TABLE,
    avgad: AVGAD_TABLE,
  };
  
  const table = tables[system];
  
  return text
    .split('')
    .map(char => table[char] || char)
    .join('');
}

export function testBiblicalAtbash(): boolean {
  return applyTemurah('בבל', 'atbash') === 'ששך';
}
