"use client";

import { useMemo } from "react";
import { performQualitativeAnalysis } from "../../domain/engines/qualitative-analyzer";
import { getLetterColor } from "../../domain/constants/alphabet";
import "./qualitative.css";

interface QualitativeAnalysisProps {
  input: string;
  colorSystem: string;
  miluyLevels: any[];
  selectedLevel: number;
  onLevelChange: (level: number) => void;
}

export function QualitativeAnalysis({
  input,
  colorSystem,
  miluyLevels,
  selectedLevel,
  onLevelChange,
}: QualitativeAnalysisProps) {
  const currentText = useMemo(() => {
    return miluyLevels[selectedLevel]?.text || input;
  }, [miluyLevels, selectedLevel, input]);

  const analysis = useMemo(() => {
    return performQualitativeAnalysis(currentText);
  }, [currentText]);

  const maxCount = analysis.letterFrequencies[0]?.count || 1;

  return (
    <div className="qualitative-container">
      <div className="qualitative-header">
        <h2>🔬 Análisis Cualitativo Clásico</h2>
        <p className="qualitative-subtitle">
          Basado en Sefer Yetzirah y fuentes documentadas
        </p>
      </div>

      {/* Level selector */}
      <div className="level-selector">
        <label>Analizar nivel Miluy:</label>
        <div className="level-badges">
          {miluyLevels.map((level, idx) => (
            <button
              key={idx}
              className={`level-badge ${selectedLevel === idx ? "active" : ""}`}
              onClick={() => onLevelChange(idx)}
            >
              Nivel {idx}
              {level.isSod && <span className="sod-marker">סוד</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Current text display */}
      <div className="current-text-display">
        <div className="text-label">Texto actual (Nivel {selectedLevel}):</div>
        <div className="text-hebrew" dir="rtl">
          {currentText}
        </div>
        <div className="text-stats">
          {analysis.totalLetters} letras · Gematria: {analysis.gematria}
          {analysis.gematriaReduced !== analysis.gematria &&
            ` (Reducido: ${analysis.gematriaReduced})`}
        </div>
      </div>

      {/* Frequency Chart */}
      <div className="analysis-section">
        <h3>📊 Frecuencia de Letras</h3>
        <p className="section-note">
          Representación visual de cada letra. La frecuencia indica intensidad
          de cualidad, no "exceso" o "deficiencia" (no existe tal concepto en
          Kabbalah clásica).
        </p>
        <div className="frequency-chart">
          {analysis.letterFrequencies.map((freq) => {
            const color = getLetterColor(freq.letter, colorSystem);
            const barWidth = (freq.count / maxCount) * 100;

            return (
              <div key={freq.letter} className="frequency-row">
                <div className="freq-letter" style={{ color }}>
                  {freq.letter}
                </div>
                <div className="freq-info">
                  <div className="freq-name">{freq.name}</div>
                  <div className="freq-bar-container">
                    <div
                      className="freq-bar"
                      style={{
                        width: `${barWidth}%`,
                        background: color,
                      }}
                    />
                  </div>
                  <div className="freq-count">
                    {freq.count} {freq.count === 1 ? "vez" : "veces"} (
                    {freq.percentage.toFixed(1)}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gematria & Equivalences */}
      <div className="analysis-section">
        <h3>💎 Gematria</h3>
        <div className="gematria-display">
          <div className="gematria-value">
            <span className="value-label">Valor total:</span>
            <span className="value-number">{analysis.gematria}</span>
          </div>
          {analysis.gematriaReduced !== analysis.gematria && (
            <div className="gematria-value">
              <span className="value-label">Reducido:</span>
              <span className="value-number">{analysis.gematriaReduced}</span>
            </div>
          )}
        </div>
        <p className="section-note">
          El análisis de equivalencias con palabras bíblicas requeriría un
          corpus completo del Tanakh. Esta funcionalidad se agregará en futuras
          versiones.
        </p>
      </div>

      {/* Divine Names */}
      {analysis.divineNamesPresent.length > 0 && (
        <div className="analysis-section highlight">
          <h3>🌟 Nombres Divinos Presentes</h3>
          <div className="divine-names-list">
            {analysis.divineNamesPresent.map((name, idx) => (
              <div key={idx} className="divine-name-card">
                {name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Organs */}
      {analysis.organs.length > 0 && (
        <div className="analysis-section">
          <h3>🫀 Órganos Representados</h3>
          <p className="section-note">
            Según Sefer Yetzirah (solo para letras documentadas)
          </p>
          <div className="organs-list">
            {analysis.organs.map((organ, idx) => (
              <div key={idx} className="organ-card">
                {organ}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Elements */}
      <div className="analysis-section">
        <h3>🔥 Elementos (Letras Madres)</h3>
        <div className="elements-grid">
          {analysis.elementsPresent.map((elem, idx) => (
            <div key={idx} className="element-card present">
              <div className="element-icon">
                {elem.element === "Fire" && "🔥"}
                {elem.element === "Water" && "💧"}
                {elem.element === "Air" && "💨"}
              </div>
              <div className="element-name">{elem.element}</div>
              <div className="element-letters" dir="rtl">
                {elem.letters.join(" ")}
              </div>
            </div>
          ))}
          {analysis.elementsAbsent.map((elem, idx) => (
            <div key={idx} className="element-card absent">
              <div className="element-icon">
                {elem === "Fire" && "🔥"}
                {elem === "Water" && "💧"}
                {elem === "Air" && "💨"}
              </div>
              <div className="element-name">{elem}</div>
              <div className="element-status">No presente</div>
            </div>
          ))}
        </div>
        <p className="section-note">
          Solo א (Aire), מ (Agua), ש (Fuego) tienen elemento asignado en Sefer
          Yetzirah.
        </p>
      </div>

      {/* Zodiac */}
      {analysis.zodiacSigns.length > 0 && (
        <div className="analysis-section">
          <h3>♈ Signos Zodiacales</h3>
          <p className="section-note">
            Según correspondencias de las 12 letras simples
          </p>
          <div className="zodiac-list">
            {analysis.zodiacSigns.map((sign, idx) => (
              <div key={idx} className="zodiac-card">
                {sign}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interpretation */}
      <div className="analysis-section interpretation">
        <h3>📖 Interpretación</h3>
        <p className="interpretation-text">{analysis.interpretation}</p>
      </div>

      {/* Meditation */}
      <div className="analysis-section meditation-guide">
        <h3>🧘 Meditación General (Método Abulafia)</h3>
        <p>
          La tradición cabalística clásica no prescribe meditaciones específicas
          por letra individual. Abraham Abulafia desarrolló técnicas generales
          de <em>tzeruf</em> (permutación) que se aplican a Nombres Divinos
          completos.
        </p>
        <div className="meditation-steps">
          <div className="meditation-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <strong>Preparación:</strong> Siéntate en postura cómoda, espalda
              recta, respiración natural.
            </div>
          </div>
          <div className="meditation-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <strong>Visualización:</strong> Contempla las letras del nombre en
              tu mente, visualizándolas con claridad.
            </div>
          </div>
          <div className="meditation-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <strong>Permutación:</strong> Mentalmente, permuta las letras en
              diferentes órdenes, pronunciándolas silenciosamente con cada
              respiración.
            </div>
          </div>
          <div className="meditation-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <strong>Devolución:</strong> Permite que las letras se disuelvan
              naturalmente, retornando al silencio interior.
            </div>
          </div>
        </div>
        <p className="meditation-source">
          <em>
            Fuente: Síntesis del método de Abulafia (Or ha-Sekhel, Chayei
            ha-Olam ha-Ba)
          </em>
        </p>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer">
        <h4>📚 Nota sobre Rigor Académico</h4>
        <p>
          Este análisis se basa estrictamente en fuentes documentadas: Sefer
          Yetzirah para correspondencias básicas, y métodos generales de
          Abulafia/Ari para meditación.
        </p>
        <p>
          <strong>No incluye:</strong> sistemas de "exceso/deficiencia"
          cuantitativa, nutrientes por letra, salmos individuales, o prácticas
          de tikkun específicas por letra, ya que estos no están documentados en
          la tradición cabalística clásica.
        </p>
      </div>
    </div>
  );
}
