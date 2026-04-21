'use client';

import { useMemo } from 'react';
import { getLetterColor } from '../../domain/constants/alphabet';
import { mixColors, describeColor } from '../../domain/utils/color-mixing';
import './color-spectrum.css';

interface ColorSpectrumProps {
  input: string;
  colorSystem: string;
  gematria: number;
  gematriaReduced: number;
}

export function ColorSpectrum({ input, colorSystem, gematria, gematriaReduced }: ColorSpectrumProps) {
  const { letterData, mixedColor, colorDescription } = useMemo(() => {
    const letters = input.replace(/\s/g, '').split('');
    const colorCounts: Record<string, { color: string; letters: string[]; count: number }> = {};
    
    letters.forEach(letter => {
      const color = getLetterColor(letter, colorSystem);
      if (!colorCounts[color]) {
        colorCounts[color] = { color, letters: [], count: 0 };
      }
      colorCounts[color].letters.push(letter);
      colorCounts[color].count++;
    });
    
    const letterData = Object.values(colorCounts).sort((a, b) => b.count - a.count);
    
    // Mix colors proportionally
    const colorsToMix = letterData.map(d => ({ color: d.color, weight: d.count }));
    const mixedColor = mixColors(colorsToMix);
    const colorDescription = describeColor(mixedColor);
    
    return { letterData, mixedColor, colorDescription };
  }, [input, colorSystem]);
  
  const totalLetters = input.replace(/\s/g, '').length;

  return (
    <div className="color-spectrum-container">
      <div className="spectrum-core">
        <div className="gematria-circle" style={{ borderColor: mixedColor }}>
          <div className="gematria-value">{gematria}</div>
          <div className="gematria-reduced">{gematriaReduced}</div>
        </div>
        
        <div className="floating-letters">
          {input.replace(/\s/g, '').split('').map((letter, i) => {
            const color = getLetterColor(letter, colorSystem);
            const angle = (360 / totalLetters) * i;
            const radius = 180;
            const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
            const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
            
            return (
              <div
                key={i}
                className="floating-letter"
                style={{
                  color,
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  animationDelay: `${i * 0.1}s`
                }}
              >
                {letter}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mixed-color-result">
        <h3>Color Resultante de la Mezcla</h3>
        <div className="mixed-color-display">
          <div 
            className="mixed-color-swatch" 
            style={{ background: mixedColor }}
          />
          <div className="mixed-color-info">
            <div className="mixed-color-name">{colorDescription}</div>
            <div className="mixed-color-hex">{mixedColor.toUpperCase()}</div>
            <div className="mixed-color-formula">
              {letterData.map((d, idx) => {
                const percentage = (d.count / totalLetters) * 100;
                return (
                  <span key={idx} className="formula-part">
                    {percentage.toFixed(0)}% <span style={{ color: d.color }}>●</span>
                    {idx < letterData.length - 1 ? ' + ' : ''}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="spectrum-breakdown">
        <h3>Componentes de Color</h3>
        <div className="color-bars">
          {letterData.map((data, idx) => {
            const percentage = (data.count / totalLetters) * 100;
            return (
              <div key={idx} className="color-bar-item">
                <div className="color-bar-header">
                  <div className="color-indicator" style={{ background: data.color }} />
                  <div className="color-letters" dir="rtl">{data.letters.join(' ')}</div>
                  <div className="color-percentage">{percentage.toFixed(1)}%</div>
                </div>
                <div className="color-bar-track">
                  <div 
                    className="color-bar-fill" 
                    style={{ 
                      width: `${percentage}%`,
                      background: data.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
