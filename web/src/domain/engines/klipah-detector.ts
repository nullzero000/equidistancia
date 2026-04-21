/**
 * KLIPAH DETECTOR - Análisis de Coherencia Estructural en Gematría
 * 
 * Distingue entre revelaciones estructurales genuinas y ruido estadístico.
 * Basado en principios del PaRDeS y análisis probabilístico.
 * 
 * Referencias:
 * - Sefer Yetzirah (raíces de tres letras)
 * - Aryeh Kaplan: "Sefer Yetzirah - The Book of Creation"
 * - Statistical analysis of Hebrew letter frequencies
 */

import { applyTemurah } from "./temurah";
import { calculate as calculateGematria } from "./gematria";

/**
 * LISTA BLANCA: Nombres Divinos Canónicos
 * Estos términos están exentos de análisis de colisión
 */
const DIVINE_NAMES = new Set([
  'יהוה',    // Tetragrammaton
  'אדני',    // Adonai
  'אלהים',   // Elohim
  'אל',      // El
  'שדי',     // Shaddai
  'אהיה',    // Ehyeh
  'יה',      // Yah
  'צבאות',   // Tzvaot
  'עליון',   // Elyon
  'מלך',     // Melech
]);

export interface CollisionAnalysis {
  value: number;
  expectedCollisions: number;
  riskLevel: 'exempt' | 'low' | 'medium' | 'high' | 'critical';
  warnings: CollisionWarning[];
  validationResults: ValidationResult[];
  isDivineName: boolean;
}

export interface CollisionWarning {
  type: 'high_collision_rate' | 'system_mixing' | 'low_value' | 'spelling_manipulation' | 'no_semantic_link';
  severity: 'info' | 'warning' | 'danger';
  message: string;
  explanation: string;
}

export interface ValidationResult {
  method: 'Notarikón' | 'Temurá (Atbash)' | 'Temurá (Albam)' | 'Temurá (Avgad)';
  result: string;
  gematriaValue: number;
  notes: string;
}

/**
 * Calcula la tasa esperada de colisiones para un valor dado
 */
function calculateExpectedCollisions(value: number): number {
  if (value < 100) return 15 + (100 - value) * 0.5;
  if (value < 300) return 8 + (300 - value) * 0.03;
  if (value < 500) return 5 + (500 - value) * 0.01;
  if (value < 1000) return 3 + (1000 - value) * 0.002;
  return 1 + (2000 - value) * 0.0005;
}

/**
 * Notarikón básico: Extrae iniciales
 */
function performNotarikon(text: string): string {
  return text.split(' ').map(word => word[0] || '').join('');
}

/**
 * Ejecuta validaciones hermenéuticas automáticas
 */
function executeValidations(word: string): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Notarikón (solo si tiene espacios)
  if (word.includes(' ')) {
    const notarikon = performNotarikon(word);
    results.push({
      method: 'Notarikón',
      result: notarikon,
      gematriaValue: calculateGematria(notarikon).total,
      notes: 'Iniciales de cada palabra'
    });
  }

  // Temurá - Atbash
  const atbash = applyTemurah(word.replace(/\s/g, ''), 'atbash');
  results.push({
    method: 'Temurá (Atbash)',
    result: atbash,
    gematriaValue: calculateGematria(atbash).total,
    notes: 'Primera letra ↔ Última letra del alfabeto'
  });

  // Temurá - Albam
  const albam = applyTemurah(word.replace(/\s/g, ''), 'albam');
  results.push({
    method: 'Temurá (Albam)',
    result: albam,
    gematriaValue: calculateGematria(albam).total,
    notes: 'Primera mitad ↔ Segunda mitad del alfabeto'
  });

  // Temurá - Avgad
  const avgad = applyTemurah(word.replace(/\s/g, ''), 'avgad');
  results.push({
    method: 'Temurá (Avgad)',
    result: avgad,
    gematriaValue: calculateGematria(avgad).total,
    notes: 'Cada letra avanza una posición'
  });

  return results;
}

/**
 * Evalúa coherencia estructural de una equivalencia gemátrica
 */
export function analyzeCollisionRisk(
  value: number,
  word1: string,
  word2?: string,
  context?: {
    systemUsed?: string;
    spellingVariant?: boolean;
    hasSemanticLink?: boolean;
  }
): CollisionAnalysis {
  const cleanWord = word1.replace(/\s/g, '');
  
  // EXCEPCIÓN: Nombres Divinos
  const isDivineName = DIVINE_NAMES.has(cleanWord);
  if (isDivineName) {
    return {
      value,
      expectedCollisions: 0,
      riskLevel: 'exempt',
      warnings: [],
      validationResults: [],
      isDivineName: true
    };
  }

  const warnings: CollisionWarning[] = [];
  const expectedCollisions = calculateExpectedCollisions(value);

  // REGLA 1: Valores bajos
  if (value < 100) {
    warnings.push({
      type: 'low_value',
      severity: 'warning',
      message: `Valor bajo (${value}): Probabilidad elevada de colisión`,
      explanation: `Valores menores a 100 tienen ~${Math.round(expectedCollisions)} palabras esperadas con el mismo valor. Se requiere validación hermenéutica adicional.`
    });
  }

  // REGLA 2: Colisiones críticas
  if (expectedCollisions > 20) {
    warnings.push({
      type: 'high_collision_rate',
      severity: 'danger',
      message: 'Zona de alta densidad estadística',
      explanation: `~${Math.round(expectedCollisions)} palabras comparten este valor. Alta probabilidad de coincidencia matemática sin vínculo ontológico.`
    });
  }

  // REGLA 3: Variante ortográfica
  if (context?.spellingVariant) {
    warnings.push({
      type: 'spelling_manipulation',
      severity: 'danger',
      message: 'Manipulación ortográfica detectada',
      explanation: 'Modificación de ortografía masorética (añadir/quitar Vav o Yod) invalida la equivalencia. La forma debe ser canónica.'
    });
  }

  // REGLA 4: Sin vínculo semántico
  if (word2 && context?.hasSemanticLink === false) {
    warnings.push({
      type: 'no_semantic_link',
      severity: 'warning',
      message: 'Ausencia de tensión dialéctica',
      explanation: 'Las palabras carecen de relación semántica, conceptual o de raíz (Shoresh). Equivalencias genuinas revelan paradojas estructurales.'
    });
  }

  // REGLA 5: Mezcla de sistemas
  if (context?.systemUsed && context.systemUsed.includes(',')) {
    warnings.push({
      type: 'system_mixing',
      severity: 'danger',
      message: 'Inconsistencia de cifrado',
      explanation: 'No se pueden mezclar sistemas (Mispar Ragil, Katan, etc.) en una misma ecuación. Esto aumenta artificialmente las colisiones.'
    });
  }

  // Ejecutar validaciones automáticas
  const validationResults = executeValidations(word1);

  // Determinar nivel de riesgo
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  const dangerCount = warnings.filter(w => w.severity === 'danger').length;
  const warningCount = warnings.filter(w => w.severity === 'warning').length;

  if (dangerCount >= 2) riskLevel = 'critical';
  else if (dangerCount >= 1) riskLevel = 'high';
  else if (warningCount >= 2) riskLevel = 'medium';

  return {
    value,
    expectedCollisions,
    riskLevel,
    warnings,
    validationResults,
    isDivineName: false
  };
}

/**
 * Ejemplos canónicos de tensión dialéctica genuina
 */
export const GENUINE_PARADOXES = [
  {
    word1: 'משיח',
    word2: 'נחש',
    value: 358,
    explanation: 'Misma magnitud de fuerza de alteración del orden, vectores direccionales opuestos (Redención vs. Caída)'
  },
  {
    word1: 'אחד',
    word2: 'אהבה',
    value: 13,
    explanation: 'La Unidad divina y el Amor comparten estructura numérica - revelación de identidad ontológica'
  }
];

/**
 * Genera reporte formal de validación
 */
export function generateValidationReport(analysis: CollisionAnalysis): string {
  if (analysis.isDivineName) {
    return '✡️ Nombre Divino Canónico\n\nEste término está en la lista de Nombres Sagrados y no requiere validación de colisión.';
  }

  const emoji = {
    low: '✅',
    medium: '⚠️',
    high: '🔶',
    critical: '🚨',
    exempt: '✡️'
  }[analysis.riskLevel];

  let report = `${emoji} Nivel de Análisis: ${analysis.riskLevel.toUpperCase()}\n\n`;
  
  if (analysis.warnings.length > 0) {
    report += '**Advertencias Detectadas:**\n';
    analysis.warnings.forEach(w => {
      const icon = w.severity === 'danger' ? '🔴' : '🟡';
      report += `\n${icon} ${w.message}\n`;
      report += `   ${w.explanation}\n`;
    });
  }

  if (analysis.validationResults.length > 0) {
    report += '\n**Validaciones Hermenéuticas Ejecutadas:**\n';
    analysis.validationResults.forEach(v => {
      report += `\n• ${v.method}: ${v.result} (Gematria: ${v.gematriaValue})\n`;
      report += `  ${v.notes}\n`;
    });
  }

  report += `\n📊 Colisiones esperadas: ~${Math.round(analysis.expectedCollisions)} palabras`;

  return report;
}
