"use client";

import { analyzeCollisionRisk, GENUINE_PARADOXES } from "../../domain/engines/klipah-detector";
import "./collision-warning.css";

interface CollisionWarningProps {
  value: number;
  word: string;
  context?: {
    systemUsed?: string;
    spellingVariant?: boolean;
    hasSemanticLink?: boolean;
  };
}

export function CollisionWarning({ value, word, context }: CollisionWarningProps) {
  const analysis = analyzeCollisionRisk(value, word, undefined, context);

  // Nombre divino - caso especial
  if (analysis.isDivineName) {
    return (
      <div className="collision-warning-container divine-name">
        <div className="warning-header" style={{ background: 'rgba(255, 215, 0, 0.15)', borderColor: '#FFD700' }}>
          <span className="warning-icon">✡️</span>
          <h3 className="warning-title">Nombre Divino Canónico</h3>
        </div>
        <div className="warning-body">
          <p className="divine-note">
            Este término está en la lista de Nombres Sagrados y no requiere validación de colisión.
          </p>
        </div>
      </div>
    );
  }

  // No mostrar si riesgo bajo
  if (analysis.riskLevel === 'low') return null;

  const riskColors = {
    low: '#4ade80',
    medium: '#fbbf24',
    high: '#fb923c',
    critical: '#ef4444',
    exempt: '#FFD700'
  };

  const riskIcons = {
    low: '✅',
    medium: '⚠️',
    high: '🔶',
    critical: '🚨',
    exempt: '✡️'
  };

  return (
    <div className="collision-warning-container" style={{ borderColor: riskColors[analysis.riskLevel] }}>
      <div className="warning-header" style={{ background: `${riskColors[analysis.riskLevel]}15` }}>
        <span className="warning-icon">{riskIcons[analysis.riskLevel]}</span>
        <h3 className="warning-title">Análisis de Coherencia Estructural</h3>
      </div>

      <div className="warning-body">
        <div className="warning-intro">
          <p>
            Esta equivalencia numérica presenta características que requieren validación hermenéutica adicional 
            para distinguir entre revelación estructural y coincidencia estadística.
          </p>
        </div>

        {analysis.warnings.map((warning, idx) => (
          <div key={idx} className={`warning-item severity-${warning.severity}`}>
            <div className="warning-item-header">
              {warning.severity === 'danger' ? '🔴' : '🟡'} {warning.message}
            </div>
            <div className="warning-item-explanation">
              {warning.explanation}
            </div>
          </div>
        ))}

        {analysis.validationResults.length > 0 && (
          <div className="validation-results">
            <h4>🔬 Validaciones Hermenéuticas Ejecutadas:</h4>
            <div className="validation-grid">
              {analysis.validationResults.map((result, idx) => (
                <div key={idx} className="validation-card">
                  <div className="validation-method">{result.method}</div>
                  <div className="validation-result hebrew" dir="rtl">{result.result}</div>
                  <div className="validation-gematria">Gematria: {result.gematriaValue}</div>
                  <div className="validation-notes">{result.notes}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="collision-stats">
          <div className="stat-item">
            <span className="stat-label">Colisiones esperadas:</span>
            <span className="stat-value">~{Math.round(analysis.expectedCollisions)} palabras</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Nivel de análisis:</span>
            <span className="stat-value" style={{ color: riskColors[analysis.riskLevel] }}>
              {analysis.riskLevel.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="genuine-examples">
          <h4>✨ Ejemplos de Tensión Dialéctica Genuina:</h4>
          {GENUINE_PARADOXES.map((example, idx) => (
            <div key={idx} className="example-item">
              <div className="example-words">
                <span className="hebrew" dir="rtl">{example.word1}</span>
                <span className="separator">=</span>
                <span className="hebrew" dir="rtl">{example.word2}</span>
                <span className="value">({example.value})</span>
              </div>
              <div className="example-explanation">{example.explanation}</div>
            </div>
          ))}
        </div>

        <div className="pardes-reminder">
          <strong>Principio PaRDeS:</strong> La Gematría (Sod/Secreto) debe expandir el Pshat (literal), no contradecirlo. 
          Si el "secreto" destruye la base literal, es una cáscara (Klipah).
        </div>
      </div>
    </div>
  );
}
