/**
 * ORACLE ENGINE
 */

import { calculate as calculateGematria } from './gematria';
import { performQualitativeAnalysis } from './qualitative-analyzer';
import { expandMultipleLevels, detectSodLevel } from './miluy';
import { findActiveGates } from './gates';
import { FIRST_APPEARANCES } from '../data/torah-first-appearances';
import { FREQUENCIES, FrequencyMode } from '../../infrastructure/audio/binaural';

export interface PracticeGuidance {
  meditation: { preparation: string; focus: string; visualization: string; duration: number };
  transition: { sign: string; method: string; mantra?: string };
  action: { what: string; how: string; when: string };
  protection: { avoid: string[]; signs_of_imbalance: string[]; remedy: string };
}

export interface OracleResponse {
  input: string;
  gematria: number;
  gematriaReduced: number;
  equivalences: string[];
  letterCount: number;
  uniqueLetters: number;
  sodLevel: number;
  activePaths: number;
  elementsPresent: string[];
  elementsAbsent: string[];
  dominantElement: string | null;
  organs: string[];
  chakras: string[];
  divineNames: string[];
  recommendedAttribute: { hebrew: string; transliteration: string; meaning: string };
  reshitConnections: { letter: string; firstWord: string; meaning: string }[];
  recommendedFrequency: FrequencyMode;
  practice: PracticeGuidance;
  contemplation: string;
  interpretation: string;
  message: string;
}

export function consultOracle(text: string): OracleResponse {
  const gematriaResult = calculateGematria(text, 'STANDARD');
  const qualitative = performQualitativeAnalysis(text);
  const miluyResult = expandMultipleLevels(text, 'AB', 5);
  const miluyLevels = miluyResult.map((level: any) => ({ level: level.level, text: level.text, letterCount: level.letterCount, gematria: level.gematria }));
  const sodLevel = detectSodLevel(miluyLevels);
  const gates = findActiveGates(text);
  
  const elementCounts = qualitative.elementsPresent.reduce((acc: any, elem: any) => { acc[elem.element] = elem.letters.length; return acc; }, {});
  const dominantElement = Object.entries(elementCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || null;
  
  const uniqueLetters = [...new Set(text.replace(/\s/g, '').split(''))];
  
  // AQUÍ - FUERA del .map()
  const recommendedAttribute = selectDivineAttribute(gematriaResult.total, dominantElement, qualitative.divineNamesPresent, 'peace');
  
  const reshitConnections = uniqueLetters.map(letter => { const appearance = FIRST_APPEARANCES[letter]; return appearance ? { letter, firstWord: appearance.firstWord, meaning: appearance.firstWordMeaning } : null; }).filter(Boolean) as any[];
  
  let recommendedFrequency: FrequencyMode = 'universal';
  if (dominantElement === 'Fire') recommendedFrequency = 'liberation';
  else if (dominantElement === 'Water') recommendedFrequency = 'dna';
  else if (dominantElement === 'Air') recommendedFrequency = 'universal';
  else if (sodLevel >= 3) recommendedFrequency = 'theta';
  else if (qualitative.divineNamesPresent.length > 0) recommendedFrequency = 'intuition';
  
  const practice = generatePracticeGuidance(text, sodLevel, dominantElement, qualitative.divineNamesPresent, reshitConnections, qualitative);
  const contemplation = generateContemplation(gematriaResult.total, qualitative.divineNamesPresent);
  const interpretation = generateInterpretation(qualitative, gates.length, sodLevel);
  const message = generateMessage(gematriaResult.total, dominantElement, qualitative.divineNamesPresent);
  
  return { input: text, gematria: gematriaResult.total, gematriaReduced: gematriaResult.reduced, equivalences: [], letterCount: text.replace(/\s/g, '').length, uniqueLetters: uniqueLetters.length, sodLevel, activePaths: gates.length, elementsPresent: qualitative.elementsPresent.map((e: any) => e.element), elementsAbsent: qualitative.elementsAbsent, dominantElement, organs: qualitative.organs, chakras: [], divineNames: qualitative.divineNamesPresent, recommendedAttribute, reshitConnections, recommendedFrequency, practice, contemplation, interpretation, message };
}

function generatePracticeGuidance(text: string, sodLevel: number, dominantElement: string | null, divineNames: string[], reshitConnections: any[], qualitative: any): PracticeGuidance { const meditation = generateMeditation(text, dominantElement, divineNames, reshitConnections); const transition = generateTransition(sodLevel, dominantElement, divineNames); const action = generateAction(dominantElement, qualitative, sodLevel); const protection = generateProtection(dominantElement, sodLevel, qualitative); return { meditation, transition, action, protection }; }
function generateMeditation(text: string, dominantElement: string | null, divineNames: string[], reshitConnections: any[]): PracticeGuidance['meditation'] { let preparation = 'Siéntate en silencio. '; let focus = ''; let visualization = ''; let duration = 21; if (dominantElement === 'Fire') { preparation += 'Enciende una vela.'; focus = 'Observa tu respiración.'; visualization = 'Letras en llamas.'; duration = 18; } else if (dominantElement === 'Water') { preparation += 'Ten agua cerca.'; focus = 'Flujo como olas.'; visualization = 'Letras en agua.'; duration = 24; } else if (dominantElement === 'Air') { preparation += 'Abre ventana.'; focus = '7 respiraciones.'; visualization = 'Letras flotando.'; duration = 15; } else { preparation += 'Solo atención.'; focus = 'Observa.'; visualization = 'Letras quietas.'; duration = 21; } if (divineNames.length > 0) { focus += ` ${divineNames[0]} resuena.`; duration += 7; } if (reshitConnections.length > 0) { visualization += ` Primera: ${reshitConnections[0].firstWord}.`; } return { preparation, focus, visualization, duration }; }
function generateTransition(sodLevel: number, dominantElement: string | null, divineNames: string[]): PracticeGuidance['transition'] { let sign = ''; let method = ''; let mantra: string | undefined; if (sodLevel >= 3) { sign = 'Quietud profunda.'; method = 'Abre ojos lentamente.'; mantra = 'אני מאוחד'; } else if (dominantElement === 'Fire') { sign = 'Calor interno.'; method = 'Levántate con energía.'; mantra = 'אש קדושה'; } else if (dominantElement === 'Water') { sign = 'Fluidez.'; method = 'Muévete como agua.'; mantra = 'מים חיים'; } else if (dominantElement === 'Air') { sign = 'Ligereza.'; method = 'Baja la visión.'; mantra = 'רוח אלהים'; } else { sign = 'Sabrás.'; method = 'Naturalmente.'; } if (divineNames.length > 0 && divineNames[0].includes('YHVH')) { mantra = 'יהוה אחד'; } return { sign, method, mantra }; }
function generateAction(dominantElement: string | null, qualitative: any, sodLevel: number): PracticeGuidance['action'] { let what = ''; let how = ''; let when = ''; if (dominantElement === 'Fire') { what = 'Crea algo.'; how = 'Mantén llama.'; when = 'Ahora.'; } else if (dominantElement === 'Water') { what = 'Nutre.'; how = 'Sin esperar.'; when = '24 horas.'; } else if (dominantElement === 'Air') { what = 'Comunica.'; how = 'Desde claridad.'; when = '3 días.'; } else { if (sodLevel >= 3) { what = 'Ordena.'; how = 'Con presencia.'; when = 'Hoy.'; } else { what = 'Estudia.'; how = 'Lento.'; when = 'Esta noche.'; } } return { what, how, when }; }
function generateProtection(dominantElement: string | null, sodLevel: number, qualitative: any): PracticeGuidance['protection'] { const avoid: string[] = ['Hablar compulsivamente.', 'Forzar resultados.']; const signs_of_imbalance: string[] = []; const remedy = 'Respira.'; if (dominantElement === 'Fire') { avoid.push('10 proyectos.'); signs_of_imbalance.push('Irritabilidad.'); } else if (dominantElement === 'Water') { avoid.push('Perderte emocional.'); signs_of_imbalance.push('Llanto fácil.'); } else if (dominantElement === 'Air') { avoid.push('Solo mente.'); signs_of_imbalance.push('Desconexión.'); } else { avoid.push('Buscar más.'); signs_of_imbalance.push('Falta algo.'); } avoid.push('Ego espiritual.'); if (sodLevel < 2) { signs_of_imbalance.push('No funciona.'); } return { avoid, signs_of_imbalance, remedy }; }
function generateContemplation(gematria: number, divineNames: string[]): string { return `${gematria} resuena. ${divineNames.length > 0 ? divineNames[0] : 'Luz'}.` }
function selectDivineAttribute(gematria: number, dominantElement: string | null, divineNames: string[], intention: 'unity' | 'peace' | 'love' = 'peace'): { hebrew: string; transliteration: string; meaning: string } { if (divineNames.length > 0 && divineNames[0].includes('YHVH')) { return { hebrew: 'יהוה', transliteration: 'YHVH', meaning: 'El Nombre' }; } if (gematria === 26) { return { hebrew: 'יהוה', transliteration: 'YHVH', meaning: 'El Nombre' }; } if (gematria === 13 || gematria % 13 === 0) { return { hebrew: 'אֶחָד', transliteration: 'Echad', meaning: 'Uno' }; } if (gematria === 376) { return { hebrew: 'שָׁלוֹם', transliteration: 'Shalom', meaning: 'Paz' }; } return { hebrew: 'שָׁלוֹם', transliteration: 'Shalom', meaning: 'Paz' }; }
function generateInterpretation(qualitative: any, activePaths: number, sodLevel: number): string { let parts = []; if (qualitative.letterFrequencies.length > 0) { const top = qualitative.letterFrequencies[0]; if (top.count > 1) { parts.push(`Repetición de ${top.letter}.`); } } parts.push(`${activePaths} senderos.`); if (sodLevel > 0) { parts.push(`Sod ${sodLevel}.`); } return parts.join(' '); }
function generateMessage(gematria: number, dominantElement: string | null, divineNames: string[]): string { const messages = []; if (divineNames.length > 0) { messages.push('🌟 Nombre Divino.'); } if (dominantElement) { const msgs: Record<string, string> = { 'Fire': '🔥 Fuego.', 'Water': '💧 Agua.', 'Air': '💨 Aire.' }; messages.push(msgs[dominantElement]); } if (gematria === 26) { messages.push('💎 26 (יהוה).'); } return messages.join('\n') || 'Escucha.'; }
