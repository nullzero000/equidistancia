/**
 * SEFER YETZIRAH - BOOK OF CREATION
 */

export interface SeferYetzirahLetter {
  name: string;
  category: 'mother' | 'double' | 'simple';
  gematria: number;
  element?: 'Air' | 'Water' | 'Fire';
  planet?: string;
  zodiac?: string;
  body_part?: string;
}

export const SEFER_YETZIRAH_LETTERS: Record<string, SeferYetzirahLetter> = {
  'א': {
    name: 'Aleph',
    category: 'mother',
    gematria: 1,
    element: 'Air',
    body_part: 'Chest',
  },
  'מ': {
    name: 'Mem',
    category: 'mother',
    gematria: 40,
    element: 'Water',
    body_part: 'Belly',
  },
  'ש': {
    name: 'Shin',
    category: 'mother',
    gematria: 300,
    element: 'Fire',
    body_part: 'Head',
  },
  'ב': {
    name: 'Bet',
    category: 'double',
    gematria: 2,
    planet: 'Saturn',
    body_part: 'Mouth',
  },
  'ג': {
    name: 'Gimel',
    category: 'double',
    gematria: 3,
    planet: 'Jupiter',
    body_part: 'Right Eye',
  },
  'ד': {
    name: 'Dalet',
    category: 'double',
    gematria: 4,
    planet: 'Mars',
    body_part: 'Left Eye',
  },
  'כ': {
    name: 'Kaf',
    category: 'double',
    gematria: 20,
    planet: 'Sun',
    body_part: 'Right Nostril',
  },
  'פ': {
    name: 'Pe',
    category: 'double',
    gematria: 80,
    planet: 'Venus',
    body_part: 'Left Nostril',
  },
  'ר': {
    name: 'Resh',
    category: 'double',
    gematria: 200,
    planet: 'Mercury',
    body_part: 'Right Ear',
  },
  'ת': {
    name: 'Tav',
    category: 'double',
    gematria: 400,
    planet: 'Moon',
    body_part: 'Left Ear',
  },
  'ה': {
    name: 'He',
    category: 'simple',
    gematria: 5,
    zodiac: 'Aries',
    body_part: 'Right Hand',
  },
  'ו': {
    name: 'Vav',
    category: 'simple',
    gematria: 6,
    zodiac: 'Taurus',
    body_part: 'Left Hand',
  },
  'ז': {
    name: 'Zayin',
    category: 'simple',
    gematria: 7,
    zodiac: 'Gemini',
    body_part: 'Right Foot',
  },
  'ח': {
    name: 'Het',
    category: 'simple',
    gematria: 8,
    zodiac: 'Cancer',
    body_part: 'Left Foot',
  },
  'ט': {
    name: 'Tet',
    category: 'simple',
    gematria: 9,
    zodiac: 'Leo',
    body_part: 'Right Kidney',
  },
  'י': {
    name: 'Yod',
    category: 'simple',
    gematria: 10,
    zodiac: 'Virgo',
    body_part: 'Left Kidney',
  },
  'ל': {
    name: 'Lamed',
    category: 'simple',
    gematria: 30,
    zodiac: 'Libra',
    body_part: 'Gall Bladder',
  },
  'נ': {
    name: 'Nun',
    category: 'simple',
    gematria: 50,
    zodiac: 'Scorpio',
    body_part: 'Large Intestine',
  },
  'ס': {
    name: 'Samekh',
    category: 'simple',
    gematria: 60,
    zodiac: 'Sagittarius',
    body_part: 'Stomach',
  },
  'ע': {
    name: 'Ayin',
    category: 'simple',
    gematria: 70,
    zodiac: 'Capricorn',
    body_part: 'Liver',
  },
  'צ': {
    name: 'Tzadik',
    category: 'simple',
    gematria: 90,
    zodiac: 'Aquarius',
    body_part: 'Spleen',
  },
  'ק': {
    name: 'Qof',
    category: 'simple',
    gematria: 100,
    zodiac: 'Pisces',
    body_part: 'Colon',
  },
};

export const GATES_COUNT = 231;
