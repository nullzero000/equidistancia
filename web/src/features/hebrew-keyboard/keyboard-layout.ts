import type { KeyboardKey } from './types';

export const KEYBOARD_ROWS: KeyboardKey[][] = [
  // Row 1: ז ו ה ד ג ב א (RIGHT TO LEFT)
  [
    { char: 'א', label: 'Aleph', value: 1 },
    { char: 'ב', label: 'Bet', value: 2 },
    { char: 'ג', label: 'Gimel', value: 3 },
    { char: 'ד', label: 'Dalet', value: 4 },
    { char: 'ה', label: 'He', value: 5 },
    { char: 'ו', label: 'Vav', value: 6 },
    { char: 'ז', label: 'Zayin', value: 7 },
  ],
  // Row 2: נ מ ל כ י ט ח (RIGHT TO LEFT)
  [
    { char: 'ח', label: 'Chet', value: 8 },
    { char: 'ט', label: 'Tet', value: 9 },
    { char: 'י', label: 'Yud', value: 10 },
    { char: 'כ', label: 'Kaf', value: 20, finalValue: 500 },
    { char: 'ל', label: 'Lamed', value: 30 },
    { char: 'מ', label: 'Mem', value: 40, finalValue: 600 },
    { char: 'נ', label: 'Nun', value: 50 },
  ],
  // Row 3: ת ש ר ק צ פ ע ס (RIGHT TO LEFT)
  [
    { char: 'ס', label: 'Samekh', value: 60 },
    { char: 'ע', label: 'Ayin', value: 70 },
    { char: 'פ', label: 'Pe', value: 80, finalValue: 800 },
    { char: 'צ', label: 'Tzadi', value: 90, finalValue: 900 },
    { char: 'ק', label: 'Qof', value: 100 },
    { char: 'ר', label: 'Resh', value: 200 },
    { char: 'ש', label: 'Shin', value: 300 },
    { char: 'ת', label: 'Tav', value: 400 },
  ],
];

export const FINAL_LETTERS: KeyboardKey[] = [
  { char: 'ך', label: 'Kaf Final', value: 20, finalValue: 500 },
  { char: 'ם', label: 'Mem Final', value: 40, finalValue: 600 },
  { char: 'ן', label: 'Nun Final', value: 50, finalValue: 700 },
  { char: 'ף', label: 'Pe Final', value: 80, finalValue: 800 },
  { char: 'ץ', label: 'Tzadi Final', value: 90, finalValue: 900 },
];
