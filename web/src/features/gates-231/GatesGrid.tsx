'use client';

import { useMemo } from 'react';
import { generateGates, findActiveGates, getGatesStats, Gate } from '../../domain/engines/gates';
import { getLetterColor } from '../../domain/constants/alphabet';
import './gates.css';

interface GatesGridProps {
  input: string;
  colorSystem: string;
}

export function GatesGrid({ input, colorSystem }: GatesGridProps) {
  const allGates = useMemo(() => generateGates(), []);
  const activeGates = useMemo(() => findActiveGates(input), [input]);
  const stats = useMemo(() => getGatesStats(allGates), [allGates]);

  const isActive = (gate: Gate) => {
    return activeGates.some(ag => ag.letters === gate.letters);
  };

  return (
    <div className="gates-container">
      <div className="gates-header">
        <h2>231 Puertas de Sefer Yetzirah</h2>
        <p className="gates-subtitle">
          Todas las combinaciones únicas de 2 letras del Alef-Bet
        </p>
      </div>

      <div className="gates-stats">
        <div className="stat-item">
          <span className="stat-label">Total de Puertas:</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Activas en tu input:</span>
          <span className="stat-value active">{activeGates.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Madres × Madres:</span>
          <span className="stat-value">{stats.motherGates}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Dobles × Dobles:</span>
          <span className="stat-value">{stats.doubleGates}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Simples × Simples:</span>
          <span className="stat-value">{stats.simpleGates}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Mixtas:</span>
          <span className="stat-value">{stats.mixedGates}</span>
        </div>
      </div>

      {activeGates.length > 0 && (
        <div className="active-gates-section">
          <h3>🌟 Puertas Activas</h3>
          <div className="active-gates-list">
            {activeGates.map((gate, idx) => {
              const color1 = getLetterColor(gate.first, colorSystem);
              const color2 = getLetterColor(gate.second, colorSystem);
              
              return (
                <div key={idx} className="active-gate-card">
                  <div className="active-gate-letters" dir="rtl">
                    <span style={{ color: color1 }}>{gate.first}</span>
                    <span style={{ color: color2 }}>{gate.second}</span>
                  </div>
                  <div className="active-gate-info">
                    <span className="gate-gematria">{gate.gematria}</span>
                    <span className="gate-categories">
                      {gate.categories.join(' × ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="gates-grid-section">
        <h3>Todas las 231 Puertas</h3>
        <div className="gates-grid">
          {allGates.map((gate, idx) => {
            const active = isActive(gate);
            const color1 = getLetterColor(gate.first, colorSystem);
            const color2 = getLetterColor(gate.second, colorSystem);
            
            return (
              <div 
                key={idx} 
                className={`gate-cell ${active ? 'active' : ''}`}
                title={`${gate.letters} = ${gate.gematria} (${gate.categories.join(' × ')})`}
              >
                <span style={{ color: color1 }}>{gate.first}</span>
                <span style={{ color: color2 }}>{gate.second}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="gates-explanation">
        <h3>📖 Sobre las 231 Puertas</h3>
        <p>
          El Sefer Yetzirah enseña que las 22 letras del Alef-Bet se combinan en 231 puertas únicas.
          Cada puerta representa un canal de energía divina y un camino de creación.
        </p>
        <p>
          Las puertas activas en tu palabra revelan los canales específicos que estás activando
          en tu práctica espiritual.
        </p>
        <p className="formula">
          C(22,2) = 22! / (2! × 20!) = 231
        </p>
      </div>
    </div>
  );
}
