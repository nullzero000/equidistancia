"use client";

import { useState, useMemo } from "react";
import { consultOracle, OracleResponse } from "../../domain/engines/oracle";
import { getLetterColor } from "../../domain/constants/alphabet";
import "./oracle.css";

interface OracleConsultationProps {
  input: string;
  colorSystem: string;
}

export function OracleConsultation({
  input,
  colorSystem,
}: OracleConsultationProps) {
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedSections, setRevealedSections] = useState<Set<string>>(
    new Set(),
  );

  const oracle = useMemo(() => consultOracle(input), [input]);

  const revealSection = (section: string) => {
    setRevealedSections((prev) => new Set([...prev, section]));
  };

  const startRevelation = () => {
    setIsRevealing(true);
    const sections = [
      "essence",
      "meditation",
      "transition",
      "action",
      "protection",
    ];
    sections.forEach((section, idx) => {
      setTimeout(() => revealSection(section), idx * 800);
    });
  };

  return (
    <div className="oracle-container">
      {!isRevealing ? (
        <div className="oracle-gateway">
          <div className="gateway-content">
            <div className="gateway-letters" dir="rtl">
              {input.split("").map((char, i) => (
                <span
                  key={i}
                  className="gateway-letter"
                  style={{
                    color: getLetterColor(char, colorSystem),
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
            <button onClick={startRevelation} className="reveal-btn">
              Revelar Guía Completa
            </button>
          </div>
        </div>
      ) : (
        <div className="oracle-revelation">
          {/* ESSENCE */}
          <section
            className={`oracle-section ${revealedSections.has("essence") ? "revealed" : ""}`}
          >
            <h2>🌟 Esencia de tu Consulta</h2>
            <div className="essence-grid">
              <div className="essence-card">
                <div className="card-label">Gematria</div>
                <div className="card-value">{oracle.gematria}</div>
                <div className="card-sub">
                  Reducido: {oracle.gematriaReduced}
                </div>
              </div>
              <div className="essence-card">
                <div className="card-label">Nivel Sod</div>
                <div className="card-value">{oracle.sodLevel}</div>
                <div className="card-sub">Raíz alcanzada</div>
              </div>
              <div className="essence-card">
                <div className="card-label">Senderos Activos</div>
                <div className="card-value">{oracle.activePaths}/231</div>
                <div className="card-sub">Gates del Árbol</div>
              </div>
            </div>

            {oracle.dominantElement && (
              <div className="dominant-element">
                <div className="element-icon">
                  {oracle.dominantElement === "Fire" && "🔥"}
                  {oracle.dominantElement === "Water" && "💧"}
                  {oracle.dominantElement === "Air" && "💨"}
                </div>
                <div className="element-name">
                  Elemento Dominante: {oracle.dominantElement}
                </div>
              </div>
            )}

            <div className="interpretation-box">
              <p>{oracle.interpretation}</p>
            </div>

            <div className="message-box">
              <pre>{oracle.message}</pre>
            </div>
          </section>

          {/* MEDITATION */}
          <section
            className={`oracle-section meditation ${revealedSections.has("meditation") ? "revealed" : ""}`}
          >
            <h2>🧘 Fase 1: Meditación (Receptivo)</h2>

            <div className="practice-block">
              <h3>Preparación</h3>
              <p>{oracle.practice.meditation.preparation}</p>
            </div>

            <div className="practice-block">
              <h3>Enfoque</h3>
              <p>{oracle.practice.meditation.focus}</p>
            </div>

            <div className="practice-block">
              <h3>Visualización</h3>
              <p>{oracle.practice.meditation.visualization}</p>
            </div>

            <div className="duration-indicator">
              <span className="duration-icon">⏱️</span>
              <span className="duration-text">
                Duración recomendada: {oracle.practice.meditation.duration}{" "}
                minutos
              </span>
            </div>

            <div className="recommended-attribute">
              <h3>🕊️ Atributo Divino Recomendado</h3>
              <div className="attribute-card">
                <div className="attribute-hebrew" dir="rtl">
                  {oracle.recommendedAttribute.hebrew}
                </div>
                <div className="attribute-transliteration">
                  {oracle.recommendedAttribute.transliteration}
                </div>
                <div className="attribute-meaning">
                  {oracle.recommendedAttribute.meaning}
                </div>
              </div>
              <p className="attribute-note">
                Contempla este atributo durante tu meditación. No lo pronuncies
                en voz alta, solo permite que resuene silenciosamente en tu
                interior.
              </p>
            </div>

            <div className="frequency-suggestion">
              <div className="freq-label">
                Frecuencia sugerida para meditar:
              </div>
              <div className="freq-name">{oracle.recommendedFrequency}</div>
              <a href="#meditation" className="freq-link">
                → Ir a pantalla de meditación
              </a>
            </div>
          </section>

          {/* TRANSITION */}
          <section
            className={`oracle-section transition ${revealedSections.has("transition") ? "revealed" : ""}`}
          >
            <h2>🌉 Fase 2: Transición (El Puente)</h2>

            <div className="transition-warning">
              ⚠️ Esta es la fase crítica. Aquí es donde la mayoría pierde la
              conexión.
            </div>

            <div className="practice-block">
              <h3>Señal de que estás listo</h3>
              <p>{oracle.practice.transition.sign}</p>
            </div>

            <div className="practice-block">
              <h3>Cómo hacer la transición</h3>
              <p>{oracle.practice.transition.method}</p>
            </div>

            {oracle.practice.transition.mantra && (
              <div className="mantra-box">
                <div className="mantra-label">Mantra de puente:</div>
                <div className="mantra-text" dir="rtl">
                  {oracle.practice.transition.mantra}
                </div>
              </div>
            )}
          </section>

          {/* ACTION */}
          <section
            className={`oracle-section action ${revealedSections.has("action") ? "revealed" : ""}`}
          >
            <h2>⚡ Fase 3: Acción (Práctica Activa)</h2>

            <div className="practice-block highlight">
              <h3>Qué hacer</h3>
              <p>{oracle.practice.action.what}</p>
            </div>

            <div className="practice-block">
              <h3>Cómo hacerlo</h3>
              <p>{oracle.practice.action.how}</p>
            </div>

            <div className="practice-block">
              <h3>Cuándo</h3>
              <p>{oracle.practice.action.when}</p>
            </div>
          </section>

          {/* PROTECTION */}
          <section
            className={`oracle-section protection ${revealedSections.has("protection") ? "revealed" : ""}`}
          >
            <h2>🛡️ Fase 4: Protección (Shmirah)</h2>

            <div className="protection-block avoid">
              <h3>⛔ Evita absolutamente:</h3>
              <ul>
                {oracle.practice.protection.avoid.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="protection-block signs">
              <h3>⚠️ Señales de desequilibrio:</h3>
              <ul>
                {oracle.practice.protection.signs_of_imbalance.map(
                  (sign, idx) => (
                    <li key={idx}>{sign}</li>
                  ),
                )}
              </ul>
            </div>

            <div className="protection-block remedy">
              <h3>💊 Remedio inmediato:</h3>
              <p>{oracle.practice.protection.remedy}</p>
            </div>
          </section>

          {/* RESHIT CONNECTIONS */}
          {oracle.reshitConnections.length > 0 && (
            <section className="oracle-section reshit">
              <h2>📜 Conexiones con el Origen</h2>
              <div className="reshit-grid">
                {oracle.reshitConnections.map((conn, idx) => (
                  <div key={idx} className="reshit-connection">
                    <div className="reshit-letter" dir="rtl">
                      {conn.letter}
                    </div>
                    <div className="reshit-arrow">→</div>
                    <div className="reshit-word" dir="rtl">
                      {conn.firstWord}
                    </div>
                    <div className="reshit-meaning">{conn.meaning}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
