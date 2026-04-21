"use client";

import { useState } from "react";
import { ALPHABET, getLetterColor } from "../../domain/constants/alphabet";
import { SEFER_YETZIRAH_LETTERS } from "../../domain/constants/sefer_yetzirah";
import "./living-letter.css";

interface LivingLetterProps {
  input: string;
  colorSystem: string;
}

export function LivingLetter({ input, colorSystem }: LivingLetterProps) {
  const letters = input.replace(/\s/g, '').split('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isContemplating, setIsContemplating] = useState(false);

  const currentLetter = letters[currentIndex] || 'א';
  const letterProps = SEFER_YETZIRAH_LETTERS[currentLetter];
  const letterInfo = ALPHABET[currentLetter];
  const color = getLetterColor(currentLetter, colorSystem);

  const next = () => setCurrentIndex((currentIndex + 1) % letters.length);
  const prev = () => setCurrentIndex((currentIndex - 1 + letters.length) % letters.length);

  return (
    <div className="living-letter-container">
      {/* Sitra Achra Warning */}
      <div className="sitra-achra-warning">
        <div className="warning-icon">⚠️</div>
        <div className="warning-content">
          <h3>Advertencia: Sitra Achra (סטרא אחרא)</h3>
          <p><strong>NO para beneficio personal (נגיעה).</strong> Si sientes orgullo, superioridad, o deseo de dominar → DETENTE INMEDIATAMENTE.</p>
          <p className="remedy">Remedio: Di en voz alta "Ein Od Milvado" (אין עוד מלבדו) - No hay nada más que Él.</p>
        </div>
      </div>

      {/* Letter Canvas */}
      <div className="letter-canvas">
        <svg width="100%" height="400" viewBox="0 0 400 400" className="letter-svg">
          <defs>
            {/* Multi-layer Gaussian Blur for Ohr (Light) effect */}
            <filter id="aura-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1"/>
              <feColorMatrix in="blur1" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.8 0" result="glow1"/>
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2"/>
              <feColorMatrix in="blur2" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0" result="glow2"/>
              <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur3"/>
              <feColorMatrix in="blur3" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.3 0" result="glow3"/>
              <feMerge>
                <feMergeNode in="glow3"/>
                <feMergeNode in="glow2"/>
                <feMergeNode in="glow1"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <radialGradient id="wave-gradient">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#FFD700" stopOpacity="0"/>
            </radialGradient>

            <radialGradient id="white-fire">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4"/>
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
            </radialGradient>
          </defs>

          <circle cx="200" cy="200" r="140" fill="url(#white-fire)" className="white-fire">
            <animate attributeName="r" values="135;145;135" dur="4s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.3;0.5;0.3" dur="4s" repeatCount="indefinite"/>
          </circle>

          {isContemplating && [0, 1, 2].map((i) => (
            <circle 
              key={i}
              cx="200" 
              cy="200" 
              r="40"
              fill="none"
              stroke="url(#wave-gradient)"
              strokeWidth="2"
              opacity="0"
            >
              <animate attributeName="r" from="40" to="160" dur="4s" begin={`${i * 0.8}s`} repeatCount="indefinite"/>
              <animate attributeName="opacity" from="0.8" to="0" dur="4s" begin={`${i * 0.8}s`} repeatCount="indefinite"/>
            </circle>
          ))}

          <text 
            x="200" 
            y="250" 
            fontSize="280" 
            fontFamily="serif" 
            textAnchor="middle" 
            fill={color}
            filter="url(#aura-glow)"
            className="letter-glyph"
          >
            {currentLetter}
          </text>
        </svg>

        <div className="letter-info">
          <div className="letter-name">{letterInfo?.name || currentLetter}</div>
          <div className="letter-counter">{currentIndex + 1} / {letters.length}</div>
        </div>
      </div>

      <div className="letter-navigation">
        <button onClick={prev} className="nav-btn">← Anterior</button>
        <button 
          onClick={() => setIsContemplating(!isContemplating)} 
          className={`contemplate-btn ${isContemplating ? 'active' : ''}`}
        >
          {isContemplating ? '🔥 Contemplando' : '🕊️ Contemplar'}
        </button>
        <button onClick={next} className="nav-btn">Siguiente →</button>
      </div>

      {isContemplating && (
        <div className="teaching-panel">
          <div className="teaching-section why-section">
            <h3>Por Qué (למה)</h3>
            <p>Las letras son <strong>fuego negro sobre fuego blanco</strong> (Zohar). El fuego blanco es lo no-manifestado (silencio de Ein Sof), el fuego negro es la letra revelada.</p>
            <p>Contemplas el momento en que lo Infinito se contrae (צמצום) para manifestarse. Las letras no son símbolos, son <strong>canales (צינור)</strong> de luz divina.</p>
          </div>

          <div className="teaching-section how-section">
            <h3>Cómo (איך)</h3>
            <ol>
              <li><strong>Anulación (ביטול):</strong> "Yo no soy nada (אין)"</li>
              <li><strong>Contemplación Silenciosa:</strong> Observa la forma sin nombrarla</li>
              <li><strong>Resonancia:</strong> Deja que los insights pasen como nubes, no los agarres</li>
              <li><strong>Integración:</strong> Cierra los ojos, deja que la letra vibre internamente</li>
            </ol>
            <p className="warning-text">⚠️ No saltes a la siguiente letra. Respeta el proceso.</p>
          </div>

          <div className="teaching-section protection-section">
            <h3>Protección contra Sitra Achra</h3>
            <div className="protection-signs">
              <p><strong>Señales de captura:</strong></p>
              <ul>
                <li>Orgullo por tener acceso a esto</li>
                <li>Querer compartir tu "experiencia especial"</li>
                <li>Buscar poderes o capacidades</li>
                <li>Sentirte elegido o superior</li>
                <li>Compararte con otros</li>
              </ul>
            </div>
            <div className="protection-remedy">
              <p><strong>Remedio inmediato:</strong> Detén la práctica. Di "Ein Od Milvado" en voz alta.</p>
              <p className="intention">Intención correcta: "Para rectificar mi alma y revelar luz divina, NO para beneficio personal."</p>
            </div>
            <p className="humility-check">La contemplación verdadera te hace MÁS humilde. Si te sientes inflado, Sitra Achra te capturó.</p>
          </div>

          {letterProps && (
            <div className="teaching-section properties-section">
              <h3>Propiedades</h3>
              <div className="properties-grid">
                <div className="prop-item"><span className="prop-label">Categoría:</span> {letterProps.category}</div>
                <div className="prop-item"><span className="prop-label">Gematria:</span> {letterProps.gematria}</div>
                {letterProps.element && <div className="prop-item"><span className="prop-label">Elemento:</span> {letterProps.element}</div>}
                {letterProps.planet && <div className="prop-item"><span className="prop-label">Planeta:</span> {letterProps.planet}</div>}
                {letterProps.zodiac && <div className="prop-item"><span className="prop-label">Zodíaco:</span> {letterProps.zodiac}</div>}
              </div>
              <p className="properties-note">Estas correspondencias son puertas de entrada, no definiciones.</p>
            </div>
          )}
        </div>
      )}

      <div className="final-reminder">
        <p className="quote">"Las letras son los ladrillos del universo. Pero tú no eres el arquitecto. Eres un testigo del acto creativo eterno."</p>
        <p className="source">— Sefer Yetzirah + Tradición Abulafiana</p>
      </div>
    </div>
  );
}
