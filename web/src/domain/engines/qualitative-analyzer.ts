/**
 * QUALITATIVE ANALYZER
 * Based strictly on classical sources: Sefer Yetzirah, documented correspondences
 * NO quantitative thresholds, NO "excess/deficiency" judgments
 */

import { LETTER_CORRESPONDENCES } from '../data/letter-correspondences';
import { calculate as calculateGematria } from './gematria';

export interface LetterFrequency {
  letter: string;
  count: number;
  percentage: number;
  name: string;
  organs: string[];
  element: string | null;
  zodiac: string | null;
  virtue: string | null;
}

export interface QualitativeAnalysis {
  input: string;
  letterFrequencies: LetterFrequency[];
  totalLetters: number;
  gematria: number;
  gematriaReduced: number;
  organs: string[];
  elementsPresent: { element: string; letters: string[] }[];
  elementsAbsent: string[];
  zodiacSigns: string[];
  divineNamesPresent: string[];
  interpretation: string;
}

/**
 * Analyze letter frequencies (qualitative, not judgmental)
 */
export function analyzeLetterFrequencies(text: string): LetterFrequency[] {
  const cleanText = text.replace(/\s/g, '');
  const letterCounts: Record<string, number> = {};
  
  for (const char of cleanText) {
    letterCounts[char] = (letterCounts[char] || 0) + 1;
  }
  
  const totalLetters = cleanText.length;
  
  return Object.entries(letterCounts)
    .map(([letter, count]) => {
      const correspondence = LETTER_CORRESPONDENCES[letter];
      return {
        letter,
        count,
        percentage: (count / totalLetters) * 100,
        name: correspondence?.name || letter,
        organs: correspondence?.organs || [],
        element: correspondence?.element || null,
        zodiac: correspondence?.zodiac || null,
        virtue: correspondence?.virtue || null,
      };
    })
    .sort((a, b) => b.count - a.count);
}

/**
 * Detect divine names in text
 */
export function detectDivineNames(text: string): string[] {
  const divineNames = [
    { hebrew: 'יהוה', name: 'YHVH (Tetragrámaton)' },
    { hebrew: 'אהיה', name: 'Ehyeh (Yo Soy)' },
    { hebrew: 'אדני', name: 'Adonai (Señor)' },
    { hebrew: 'אלהים', name: 'Elohim (Dios)' },
    { hebrew: 'שדי', name: 'Shaddai (Todopoderoso)' },
  ];
  
  return divineNames
    .filter(dn => text.includes(dn.hebrew))
    .map(dn => dn.name);
}

/**
 * Get elements present and absent
 */
export function analyzeElements(frequencies: LetterFrequency[]): {
  present: { element: string; letters: string[] }[];
  absent: string[];
} {
  const allElements = ['Fire', 'Water', 'Air'];
  const elementsMap: Record<string, string[]> = {};
  
  frequencies.forEach(freq => {
    if (freq.element) {
      if (!elementsMap[freq.element]) {
        elementsMap[freq.element] = [];
      }
      elementsMap[freq.element].push(freq.letter);
    }
  });
  
  const present = Object.entries(elementsMap).map(([element, letters]) => ({
    element,
    letters,
  }));
  
  const presentElements = Object.keys(elementsMap);
  const absent = allElements.filter(e => !presentElements.includes(e));
  
  return { present, absent };
}

/**
 * Complete qualitative analysis
 */
export function performQualitativeAnalysis(text: string): QualitativeAnalysis {
  const cleanText = text.replace(/\s/g, '');
  const frequencies = analyzeLetterFrequencies(text);
  const gematriaResult = calculateGematria(text, 'STANDARD');
  const gematria = gematriaResult.total;
  const gematriaReducedResult = calculateGematria(text, 'REDUCED');
  const gematriaReduced = gematriaReducedResult.total;
  
  // Collect organs
  const organs = [...new Set(
    frequencies.flatMap(f => f.organs)
  )].filter(Boolean);
  
  // Analyze elements
  const { present: elementsPresent, absent: elementsAbsent } = analyzeElements(frequencies);
  
  // Collect zodiac signs
  const zodiacSigns = [...new Set(
    frequencies.map(f => f.zodiac).filter(Boolean) as string[]
  )];
  
  // Detect divine names
  const divineNamesPresent = detectDivineNames(text);
  
  // Generate interpretation
  const interpretation = generateInterpretation(frequencies, elementsPresent, elementsAbsent);
  
  return {
    input: text,
    letterFrequencies: frequencies,
    totalLetters: cleanText.length,
    gematria,
    gematriaReduced,
    organs,
    elementsPresent,
    elementsAbsent,
    zodiacSigns,
    divineNamesPresent,
    interpretation,
  };
}

/**
 * Generate qualitative interpretation (no judgment)
 */
function generateInterpretation(
  frequencies: LetterFrequency[],
  elementsPresent: { element: string; letters: string[] }[],
  elementsAbsent: string[]
): string {
  let interpretation = '';
  
  // Most frequent letter
  if (frequencies.length > 0) {
    const mostFrequent = frequencies[0];
    if (mostFrequent.count > 1) {
      interpretation += `La letra ${mostFrequent.letter} (${mostFrequent.name}) aparece ${mostFrequent.count} veces, `;
      interpretation += `intensificando su cualidad${mostFrequent.virtue ? ' de ' + mostFrequent.virtue : ''}. `;
    }
  }
  
  // Elements
  if (elementsPresent.length > 0) {
    interpretation += `Los elementos presentes son: ${elementsPresent.map(e => e.element).join(', ')}. `;
  }
  
  if (elementsAbsent.length > 0) {
    interpretation += `Los elementos ausentes son: ${elementsAbsent.join(', ')}, indicando que sus cualidades no están manifestadas en esta configuración. `;
  }
  
  return interpretation || 'Esta configuración representa una combinación única de cualidades cabalísticas.';
}
