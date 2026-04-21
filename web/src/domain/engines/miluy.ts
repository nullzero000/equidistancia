/**
 * MILUY ENGINE - Otzar Kodesh
 * Four systems of letter expansion (Lurianic Kabbalah)
 */

import type { MiluySystem } from '../types/core';

// Expansiones de letras según sistema
const MILUY_EXPANSIONS: Record<string, Record<MiluySystem, string>> = {
  // Yud siempre = יוד (20) en todos los sistemas
  'י': {
    AB: 'יוד',   // Yud-Vav-Dalet (20)
    SAG: 'יוד',  // Yud-Vav-Dalet (20)
    MAH: 'יוד',  // Yud-Vav-Dalet (20)
    BAN: 'יוד',  // Yud-Vav-Dalet (20)
  },
  
  // He: diferente según sistema
  'ה': {
    AB: 'הי',    // He-Yud
    SAG: 'הי',   // He-Yud
    MAH: 'הא',   // He-Alef
    BAN: 'הה',   // He-He
  },
  
  // Vav: diferente según sistema
  'ו': {
    AB: 'ויו',   // Vav-Yud-Vav
    SAG: 'ואו',  // Vav-Alef-Vav
    MAH: 'ואו',  // Vav-Alef-Vav
    BAN: 'וו',   // Vav-Vav
  },
  
  // Alef
  'א': {
    AB: 'אלף',
    SAG: 'אלף',
    MAH: 'אלף',
    BAN: 'אלף',
  },
  
  // Bet
  'ב': {
    AB: 'בית',
    SAG: 'בית',
    MAH: 'בית',
    BAN: 'בית',
  },
  
  // Gimel
  'ג': {
    AB: 'גימל',
    SAG: 'גימל',
    MAH: 'גימל',
    BAN: 'גימל',
  },
  
  // Dalet
  'ד': {
    AB: 'דלת',
    SAG: 'דלת',
    MAH: 'דלת',
    BAN: 'דלת',
  },
  
  // Zayin
  'ז': {
    AB: 'זין',
    SAG: 'זין',
    MAH: 'זין',
    BAN: 'זין',
  },
  
  // Chet
  'ח': {
    AB: 'חית',
    SAG: 'חית',
    MAH: 'חית',
    BAN: 'חית',
  },
  
  // Tet
  'ט': {
    AB: 'טית',
    SAG: 'טית',
    MAH: 'טית',
    BAN: 'טית',
  },
  
  // Kaf
  'כ': {
    AB: 'כף',
    SAG: 'כף',
    MAH: 'כף',
    BAN: 'כף',
  },
  
  // Lamed
  'ל': {
    AB: 'למד',
    SAG: 'למד',
    MAH: 'למד',
    BAN: 'למד',
  },
  
  // Mem
  'מ': {
    AB: 'מם',
    SAG: 'מם',
    MAH: 'מם',
    BAN: 'מם',
  },
  
  // Nun
  'נ': {
    AB: 'נון',
    SAG: 'נון',
    MAH: 'נון',
    BAN: 'נון',
  },
  
  // Samekh
  'ס': {
    AB: 'סמך',
    SAG: 'סמך',
    MAH: 'סמך',
    BAN: 'סמך',
  },
  
  // Ayin
  'ע': {
    AB: 'עין',
    SAG: 'עין',
    MAH: 'עין',
    BAN: 'עין',
  },
  
  // Pe
  'פ': {
    AB: 'פא',
    SAG: 'פא',
    MAH: 'פא',
    BAN: 'פא',
  },
  
  // Tzadi
  'צ': {
    AB: 'צדי',
    SAG: 'צדי',
    MAH: 'צדי',
    BAN: 'צדי',
  },
  
  // Qof
  'ק': {
    AB: 'קוף',
    SAG: 'קוף',
    MAH: 'קוף',
    BAN: 'קוף',
  },
  
  // Resh
  'ר': {
    AB: 'ריש',
    SAG: 'ריש',
    MAH: 'ריש',
    BAN: 'ריש',
  },
  
  // Shin
  'ש': {
    AB: 'שין',
    SAG: 'שין',
    MAH: 'שין',
    BAN: 'שין',
  },
  
  // Tav
  'ת': {
    AB: 'תו',
    SAG: 'תו',
    MAH: 'תו',
    BAN: 'תו',
  },
};

/**
 * Expandir una palabra completa según sistema de Miluy
 */
export function expandWord(text: string, system: MiluySystem): string {
  return text
    .split('')
    .map(char => {
      if (char.trim() === '') return '';
      return MILUY_EXPANSIONS[char]?.[system] || char;
    })
    .join(' ');
}

/**
 * Calcular valor de Miluy de YHVH (para validación)
 */
export function calculateYHVH(system: MiluySystem): number {
  const expansion = expandWord('יהוה', system);
  
  // Mapeo simple de valores
  const values: Record<string, number> = {
    'י': 10, 'ה': 5, 'ו': 6, 'א': 1, 'ד': 4,
  };
  
  let total = 0;
  for (const char of expansion) {
    total += values[char] || 0;
  }
  
  return total;
}

/**
 * Test de sistemas de Miluy
 */
export function testMiluy(): void {
  console.group('🧪 Miluy Systems Test');
  
  const systems: MiluySystem[] = ['AB', 'SAG', 'MAH', 'BAN'];
  const expected = { AB: 72, SAG: 63, MAH: 45, BAN: 52 };
  
  systems.forEach(system => {
    const expansion = expandWord('יהוה', system);
    const value = calculateYHVH(system);
    const isCorrect = value === expected[system];
    
    console.log(
      `${system}: ${expansion} = ${value} (expected ${expected[system]})`,
      isCorrect ? '✅' : '❌'
    );
  });
  
  console.groupEnd();
}
/**
 * Expande una palabra N niveles de Miluy
 * Cada nivel expande el resultado del nivel anterior
 */
export function expandMultipleLevels(
  text: string,
  system: MiluySystem,
  levels: number = 5
): string[] {
  const results: string[] = [text]; // Nivel 0 = input original
  
  let current = text;
  for (let i = 0; i < levels; i++) {
    current = expandWord(current, system);
    results.push(current);
  }
  
  return results;
}

/**
 * Calcula Gematria para cada nivel de expansión
 */
export function analyzeMiluyLevels(
  text: string,
  system: MiluySystem,
  gematriaSystem: any,
  levels: number = 5
) {
  const expansions = expandMultipleLevels(text, system, levels);
  
  return expansions.map((expansion, level) => ({
    level,
    text: expansion,
    letterCount: expansion.replace(/\s/g, '').length,
    gematria: calculateGematriaForText(expansion, gematriaSystem),
  }));
}

// Helper para calcular gematria (importar calculate si hace falta)
function calculateGematriaForText(text: string, system: any): number {
  // Esto debe importar la función calculate de gematria.ts
  // Por ahora, placeholder simple:
  const values: Record<string, number> = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7,
    'ח': 8, 'ט': 9, 'י': 10, 'כ': 20, 'ל': 30, 'מ': 40,
    'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90, 'ק': 100,
    'ר': 200, 'ש': 300, 'ת': 400,
  };
  
  return text
    .split('')
    .reduce((sum, char) => sum + (values[char] || 0), 0);
}

/**
 * Asigna color basado en conteo de letras
 */
export function getColorByLetterCount(count: number): string {
  // Sistema de colores según cantidad de letras
  if (count <= 4) return '#00d9ff';      // Cyan - Atzilut
  if (count <= 10) return '#b84fff';     // Púrpura - Beriah
  if (count <= 22) return '#ffd700';     // Dorado - Yetzirah
  return '#ff6b6b';                      // Rojo - Assiah
}

/**
 * Detecta cuando se alcanza el "Sod" (raíz estable)
 * El Sod se alcanza cuando la expansión ya no cambia significativamente
 */
export function detectSodLevel(
  levels: ReturnType<typeof analyzeMiluyLevels>
): number {
  for (let i = 1; i < levels.length; i++) {
    const current = levels[i];
    const previous = levels[i - 1];
    
    // Si el conteo de letras se estabiliza (crece menos de 20%)
    const growthRate = (current.letterCount - previous.letterCount) / previous.letterCount;
    if (growthRate < 0.2) {
      return i; // Este es el nivel del Sod
    }
  }
  
  return levels.length - 1; // Por defecto, el último nivel
}