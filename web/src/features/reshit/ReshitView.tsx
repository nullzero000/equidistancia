'use client';

import { getLetterColor } from '../../domain/constants/alphabet';
import { FIRST_APPEARANCES } from '../../domain/data/torah-first-appearances';
import './reshit.css';

interface ReshitViewProps {
  input: string;
  colorSystem: string;
}

export function ReshitView({ input, colorSystem }: ReshitViewProps) {
  const uniqueLetters = Array.from(new Set(input.replace(/\s/g, '').split('')));

  return (
    <div className="reshit-container">
      <div className="reshit-header">
        <h2>רֵאשִׁית - Primera Aparición en Torah</h2>
        <p className="reshit-subtitle">
          Primera vez que cada letra inicia una palabra en el texto sagrado
        </p>
      </div>

      <div className="reshit-grid">
        {uniqueLetters.map((letter, idx) => {
          const appearance = FIRST_APPEARANCES[letter];
          if (!appearance) return null;

          const color = getLetterColor(letter, colorSystem);

          return (
            <div key={idx} className="reshit-card" style={{ borderColor: color }}>
              <div className="reshit-letter" style={{ color }}>
                {letter}
              </div>

              <div className="reshit-info">
                <div className="reshit-name">{appearance.letterName}</div>
                
                <div className="reshit-first-word">
                  <div className="word-label">Primera palabra:</div>
                  <div className="word-hebrew" dir="rtl">{appearance.firstWord}</div>
                  <div className="word-meaning">{appearance.firstWordMeaning}</div>
                  <div className="word-gematria">
                    Gematria: <span className="numeric">{appearance.gematria}</span>
                  </div>
                </div>

                <div className="reshit-reference">
                  <span className="ref-icon">📖</span>
                  <span className="ref-text">{appearance.reference}</span>
                </div>

                <div className="reshit-context">
                  <div className="context-hebrew" dir="rtl">
                    {appearance.context}
                  </div>
                  <div className="context-translation">
                    {appearance.contextTranslation}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="reshit-explanation">
        <h3>📚 Significado Cabalístico</h3>
        <p>
          En la tradición cabalística, la primera aparición de cada letra en la Torah
          contiene su esencia espiritual primordial. El contexto de esta primera aparición
          revela el propósito divino y la función cósmica de la letra.
        </p>
        <p>
          La palabra con la que cada letra inicia su manifestación en el texto sagrado
          es considerada su "nombre secreto" (שם נסתר), portando la energía arquetípica
          que la letra desplegará a lo largo de toda la Torah.
        </p>
        <div className="reshit-note">
          <strong>Nota:</strong> Todas las referencias son del texto masorético de Génesis (Bereshit),
          donde las 22 letras hacen su primera aparición iniciando palabras.
        </div>
      </div>
    </div>
  );
}
