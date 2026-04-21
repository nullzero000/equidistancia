export type ElementType = 'Fire' | 'Water' | 'Air' | 'Earth' | null;

export interface LetterCorrespondence {
  letter: string;
  name: string;
  letterClass: 'madre' | 'doble' | 'simple';
  
  // Physical
  organs: string[];
  bodySystem?: string;
  adamKadmonPart?: string | null;
  chakra?: string;
  
  // Elemental
  element: ElementType;
  planet?: string | null;
  zodiac?: string | null;
  season?: string | null;
  
  // Nutrition
  foods: string[];
  herbs: string[];
  healingColors: string[];
  stones: string[];
  
  // Balance
  lightAspect?: string;
  shadowAspect?: string;
  virtue?: string;
  vice?: string;
  
  // Rectification
  psalmNumber?: number;
  divineName?: string;
  divineNameHebrew?: string;
  holyName72?: string;
  tikkun?: string;
  
  // Sources
  sources: string[];
  criticalNote?: string;
}

export const LETTER_CORRESPONDENCES: Record<string, LetterCorrespondence> = {
  'א': {
    letter: 'א',
    name: 'Alef',
    letterClass: 'madre',
    organs: ['Pecho', 'Pulmones'],
    adamKadmonPart: 'Aire equilibrante entre fuego y agua; sin órgano físico específico',
    element: 'Air',
    planet: null,
    zodiac: null,
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Sefer Yetzirah', 'Zóhar/Ari'],
  },
  'ב': {
    letter: 'ב',
    name: 'Bet',
    letterClass: 'doble',
    organs: [],
    element: null,
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Sefer Yetzirah'],
    criticalNote: 'Pertenece a las 7 dobles. Sin asignación unívoca de planeta u orificio en texto base.'
  },
  'ג': {
    letter: 'ג',
    name: 'Gimel',
    letterClass: 'doble',
    organs: [],
    element: null,
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Sefer Yetzirah'],
  },
  'ד': {
    letter: 'ד',
    name: 'Dalet',
    letterClass: 'doble',
    organs: [],
    element: null,
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Sefer Yetzirah'],
  },
  'ה': {
    letter: 'ה',
    name: 'Heh',
    letterClass: 'simple',
    organs: ['Pie derecho'],
    element: null,
    zodiac: 'Aries',
    season: 'Nisán',
    virtue: 'Habla (Speech)',
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Suplemento de Sefer Yetzirah cap. V'],
  },
  'ו': {
    letter: 'ו',
    name: 'Vav',
    letterClass: 'simple',
    organs: ['Riñón derecho'],
    element: null,
    zodiac: 'Tauro',
    season: 'Iyar',
    virtue: 'Mente/Pensamiento (Mind)',
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Suplemento de Sefer Yetzirah cap. V'],
  },
  'ז': {
    letter: 'ז',
    name: 'Zayin',
    letterClass: 'simple',
    organs: ['Pie izquierdo'],
    element: null,
    zodiac: 'Géminis',
    season: 'Siván',
    virtue: 'Movimiento',
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Suplemento de Sefer Yetzirah cap. V'],
  },
  'ח': {
    letter: 'ח',
    name: 'Chet',
    letterClass: 'simple',
    organs: ['Mano derecha'],
    element: null,
    zodiac: 'Cáncer',
    season: 'Tamuz',
    virtue: 'Vista (Sight)',
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Suplemento de Sefer Yetzirah cap. V'],
  },
  'ט': {
    letter: 'ט',
    name: 'Tet',
    letterClass: 'simple',
    organs: ['Riñón izquierdo'],
    element: null,
    zodiac: 'Leo',
    season: 'Av',
    virtue: 'Oído (Hearing)',
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Suplemento de Sefer Yetzirah cap. V'],
  },
  'י': {
    letter: 'י',
    name: 'Yod',
    letterClass: 'simple',
    organs: [],
    element: null,
    zodiac: 'Virgo',
    season: 'Elul',
    virtue: 'Trabajo/Labor',
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Suplemento de Sefer Yetzirah cap. V'],
  },
  'כ': {
    letter: 'כ',
    name: 'Kaf',
    letterClass: 'doble',
    organs: [],
    element: null,
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Sefer Yetzirah'],
  },
  'ל': {
    letter: 'ל',
    name: 'Lamed',
    letterClass: 'simple',
    organs: [],
    element: null,
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Sefer Yetzirah'],
  },
  'מ': {
    letter: 'מ',
    name: 'Mem',
    letterClass: 'madre',
    organs: ['Vientre'],
    adamKadmonPart: 'Agua como raíz de los mundos inferiores',
    element: 'Water',
    planet: null,
    zodiac: null,
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Sefer Yetzirah', 'Zóhar/Ari'],
  },
  'נ': {
    letter: 'נ',
    name: 'Nun',
    letterClass: 'simple',
    organs: [],
    element: null,
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Sefer Yetzirah'],
  },
  'ס': {
    letter: 'ס',
    name: 'Samekh',
    letterClass: 'simple',
    organs: [],
    element: null,
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Sefer Yetzirah'],
  },
  'ע': {
    letter: 'ע',
    name: 'Ayin',
    letterClass: 'simple',
    organs: [],
    element: null,
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Sefer Yetzirah'],
  },
  'פ': {
    letter: 'פ',
    name: 'Peh',
    letterClass: 'doble',
    organs: [],
    element: null,
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Sefer Yetzirah'],
  },
  'צ': {
    letter: 'צ',
    name: 'Tzadi',
    letterClass: 'simple',
    organs: [],
    element: null,
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Sefer Yetzirah'],
  },
  'ק': {
    letter: 'ק',
    name: 'Qof',
    letterClass: 'simple',
    organs: [],
    element: null,
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Sefer Yetzirah'],
  },
  'ר': {
    letter: 'ר',
    name: 'Resh',
    letterClass: 'doble',
    organs: [],
    element: null,
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Sefer Yetzirah'],
  },
  'ש': {
    letter: 'ש',
    name: 'Shin',
    letterClass: 'madre',
    organs: ['Cabeza'],
    adamKadmonPart: 'Fuego superior, sin tabla explícita a órgano concreto',
    element: 'Fire',
    planet: null,
    zodiac: null,
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Sefer Yetzirah', 'Zóhar/Ari'],
  },
  'ת': {
    letter: 'ת',
    name: 'Tav',
    letterClass: 'doble',
    organs: [],
    element: null,
    foods: [], herbs: [], healingColors: [], stones: [],
    sources: ['Sefer Yetzirah'],
  }
};
