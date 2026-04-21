/**
 * 231 GATES OF SEFER YETZIRAH
 * All unique 2-letter combinations from 22 Hebrew letters
 * C(22,2) = 22! / (2! * 20!) = 231
 */

import { SEFER_YETZIRAH_LETTERS } from '../constants/sefer_yetzirah';

export interface Gate {
  letters: string;
  first: string;
  second: string;
  gematria: number;
  categories: string[];
}

/**
 * Generate all 231 unique gates
 */
export function generateGates(): Gate[] {
  const letters = Object.keys(SEFER_YETZIRAH_LETTERS);
  const gates: Gate[] = [];

  for (let i = 0; i < letters.length; i++) {
    for (let j = i + 1; j < letters.length; j++) {
      const first = letters[i];
      const second = letters[j];
      const firstProps = SEFER_YETZIRAH_LETTERS[first];
      const secondProps = SEFER_YETZIRAH_LETTERS[second];

      gates.push({
        letters: first + second,
        first,
        second,
        gematria: firstProps.gematria + secondProps.gematria,
        categories: [firstProps.category, secondProps.category],
      });
    }
  }

  return gates;
}

/**
 * Find gates present in a given text
 */
export function findActiveGates(text: string): Gate[] {
  const allGates = generateGates();
  const activeGates: Gate[] = [];

  // Remove spaces and iterate through pairs
  const cleanText = text.replace(/\s/g, '');

  for (let i = 0; i < cleanText.length - 1; i++) {
    const pair = cleanText[i] + cleanText[i + 1];
    const reversePair = cleanText[i + 1] + cleanText[i];

    const gate = allGates.find(g => 
      g.letters === pair || g.letters === reversePair
    );

    if (gate && !activeGates.find(ag => ag.letters === gate.letters)) {
      activeGates.push(gate);
    }
  }

  return activeGates;
}

/**
 * Get gates by category combination
 */
export function getGatesByCategory(category1: string, category2: string): Gate[] {
  const allGates = generateGates();
  
  return allGates.filter(gate => 
    (gate.categories.includes(category1) && gate.categories.includes(category2))
  );
}

/**
 * Statistics
 */
export function getGatesStats(gates: Gate[]) {
  const motherGates = gates.filter(g => 
    g.categories.includes('mother') && g.categories.includes('mother')
  ).length;
  
  const doubleGates = gates.filter(g => 
    g.categories.includes('double') && g.categories.includes('double')
  ).length;
  
  const simpleGates = gates.filter(g => 
    g.categories.includes('simple') && g.categories.includes('simple')
  ).length;
  
  const mixedGates = gates.filter(g => 
    g.categories[0] !== g.categories[1]
  ).length;

  return {
    total: gates.length,
    motherGates,
    doubleGates,
    simpleGates,
    mixedGates,
  };
}