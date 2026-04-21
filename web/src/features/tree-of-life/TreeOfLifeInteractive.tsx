"use client";

import { useState } from "react";
import { SEFIROT } from "../../domain/constants/sefirot";
import { getLetterColor } from "../../domain/constants/alphabet";
import "./tree-of-life.css";

const POSITIONS: Record<string, { x: number; y: number }> = {
  Keter: { x: 50, y: 10 },
  Chokhmah: { x: 25, y: 25 },
  Binah: { x: 75, y: 25 },
  Chesed: { x: 25, y: 45 },
  Gevurah: { x: 75, y: 45 },
  Tiferet: { x: 50, y: 55 },
  Netzach: { x: 25, y: 75 },
  Hod: { x: 75, y: 75 },
  Yesod: { x: 50, y: 90 },
  Malkuth: { x: 50, y: 110 },
};

interface TreeOfLifeInteractiveProps {
  input: string;
  colorSystem: string;
  miluyLevels: any[];
}

const PATHS = [
  { from: "Keter", to: "Chokhmah", letter: "א" },
  { from: "Keter", to: "Binah", letter: "ב" },
  { from: "Keter", to: "Tiferet", letter: "ג" },
  { from: "Chokhmah", to: "Binah", letter: "ד" },
  { from: "Chokhmah", to: "Chesed", letter: "ה" },
  { from: "Binah", to: "Gevurah", letter: "ו" },
  { from: "Chesed", to: "Gevurah", letter: "ז" },
  { from: "Chesed", to: "Tiferet", letter: "ח" },
  { from: "Gevurah", to: "Tiferet", letter: "ט" },
  { from: "Chesed", to: "Netzach", letter: "י" },
  { from: "Gevurah", to: "Hod", letter: "כ" },
  { from: "Tiferet", to: "Netzach", letter: "ל" },
  { from: "Tiferet", to: "Hod", letter: "מ" },
  { from: "Tiferet", to: "Yesod", letter: "נ" },
  { from: "Netzach", to: "Hod", letter: "ס" },
  { from: "Netzach", to: "Yesod", letter: "ע" },
  { from: "Hod", to: "Yesod", letter: "פ" },
  { from: "Yesod", to: "Malkuth", letter: "צ" },
  { from: "Netzach", to: "Malkuth", letter: "ק" },
  { from: "Hod", to: "Malkuth", letter: "ר" },
  { from: "Tiferet", to: "Malkuth", letter: "ש" },
  { from: "Binah", to: "Chesed", letter: "ת" },
];

const LEVEL_MEANINGS = [
  { level: 0, name: "Raíz Original", desc: "La palabra sin expansión", color: "#ffffff" },
  { level: 1, name: "Primera Expansión", desc: "Revelación inicial", color: "#00d9ff" },
  { level: 2, name: "Segunda Expansión", desc: "Desdoblamiento del misterio", color: "#b84fff" },
  { level: 3, name: "Tercera Expansión", desc: "Manifestación intermedia", color: "#ffd700" },
  { level: 4, name: "Cuarta Expansión", desc: "Profundización", color: "#4ade80" },
  { level: 5, name: "Nivel Sod (סוד)", desc: "Raíz estable - secreto revelado", color: "#ef4444" },
];

export function TreeOfLifeInteractive({ input, colorSystem, miluyLevels }: TreeOfLifeInteractiveProps) {
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [hoveredSefirah, setHoveredSefirah] = useState<string | null>(null);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const currentLevelText = miluyLevels[selectedLevel]?.text || input;
  const currentLetters = currentLevelText.replace(/\s/g, "").split("");
  const letterCount = currentLetters.length;

  const isPathActive = (letter: string) => currentLetters.includes(letter);
  const activePaths = PATHS.filter((p) => isPathActive(p.letter));

  return (
    <div className="tree-container">
      <div className="tree-header">
        <h2>עץ החיים - Árbol de la Vida Interactivo</h2>
        <p className="tree-desc">Senderos iluminados según las letras en el nivel Miluy seleccionado</p>
      </div>

      <div className="miluy-level-selector">
        <div className="level-title">Selecciona Nivel de Miluy</div>
        <div className="level-buttons">
          {LEVEL_MEANINGS.map((levelInfo) => (
            <button key={levelInfo.level} onClick={() => setSelectedLevel(levelInfo.level)} className={`level-btn ${selectedLevel === levelInfo.level ? "active" : ""}`} style={{ borderColor: selectedLevel === levelInfo.level ? levelInfo.color : "rgba(255,255,255,0.2)" }}>
              <div className="level-number" style={{ color: levelInfo.color }}>Nivel {levelInfo.level}</div>
              <div className="level-name">{levelInfo.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="current-level-info">
        <div className="info-row"><span className="info-label">Texto actual:</span><span className="info-value hebrew" dir="rtl">{currentLevelText}</span></div>
        <div className="info-row"><span className="info-label">Letras:</span><span className="info-value numeric">{letterCount}</span></div>
        <div className="info-row"><span className="info-label">Senderos activos:</span><span className="info-value numeric">{activePaths.length}/22</span></div>
        <div className="info-desc">{LEVEL_MEANINGS[selectedLevel].desc}</div>
      </div>

      <svg viewBox="0 0 100 120" className="tree-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* PATHS LAYER */}
        <g className="paths-layer">
          {PATHS.map((path, idx) => {
            const from = POSITIONS[path.from];
            const to = POSITIONS[path.to];
            const isActive = isPathActive(path.letter);
            const isHovered = hoveredPath === path.letter;
            const color = getLetterColor(path.letter, colorSystem);

            return (
              <g key={idx}>
                <line 
                  x1={from.x} 
                  y1={from.y} 
                  x2={to.x} 
                  y2={to.y} 
                  stroke={isActive || isHovered ? color : "rgba(255, 255, 255, 0.1)"} 
                  strokeWidth={isHovered ? "0.8" : isActive ? "0.5" : "0.15"} 
                  opacity={isActive ? 0.8 : 0.25}
                  onMouseEnter={() => setHoveredPath(path.letter)} 
                  onMouseLeave={() => setHoveredPath(null)} 
                  style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                >
                  <title>{path.letter} - {path.from} → {path.to}</title>
                </line>
                {isActive && (
                  <text 
                    x={(from.x + to.x) / 2} 
                    y={(from.y + to.y) / 2} 
                    fontSize="3.5" 
                    fill={color} 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    opacity="0.7"
                    style={{ pointerEvents: "none" }}
                  >
                    {path.letter}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* SEFIROT LAYER */}
        <g className="sefirot-layer">
          {Object.entries(SEFIROT).map(([name, sefirah]) => {
            const pos = POSITIONS[name];
            if (!pos) return null;

            const isHovered = hoveredSefirah === name;
            
            let color = "#00d9ff";
            if (sefirah.color_zohar === "White") color = "#ffffff";
            else if (sefirah.color_zohar === "Red") color = "#ef4444";
            else if (sefirah.color_zohar === "Green") color = "#4ade80";
            else if (sefirah.color_zohar === "Black") color = "#888888";

            return (
              <g 
                key={name} 
                onMouseEnter={() => setHoveredSefirah(name)} 
                onMouseLeave={() => setHoveredSefirah(null)} 
                style={{ cursor: "pointer" }}
                className="sefirah-group"
              >
                {/* Glow sutil */}
                <circle 
                  cx={pos.x} 
                  cy={pos.y} 
                  r={isHovered ? "5" : "4"} 
                  fill="none" 
                  stroke={color} 
                  strokeWidth="0.3" 
                  opacity={isHovered ? "0.4" : "0.2"}
                  style={{ transition: "all 0.3s ease" }}
                />
                
                {/* Círculo principal */}
                <circle 
                  cx={pos.x} 
                  cy={pos.y} 
                  r={isHovered ? "3.5" : "3"} 
                  fill={color}
                  fillOpacity={isHovered ? "0.5" : "0.35"}
                  stroke={color}
                  strokeWidth={isHovered ? "0.8" : "0.5"}
                  filter={isHovered ? "url(#glow)" : "none"}
                  style={{ transition: "all 0.3s ease" }}
                >
                  <title>{sefirah.hebrew} - {sefirah.english}</title>
                </circle>
                
                {/* Label */}
                <text 
                  x={pos.x} 
                  y={pos.y + 8} 
                  fontSize={isHovered ? "4" : "3.5"} 
                  fill={color} 
                  textAnchor="middle" 
                  fontWeight={isHovered ? "600" : "500"}
                  opacity={isHovered ? "0.9" : "0.7"}
                  style={{ pointerEvents: "none", transition: "all 0.3s ease" }}
                >
                  {sefirah.hebrew}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <div className="tree-legend">
        <h3>Cómo funciona</h3>
        <div className="legend-text">
          <p><strong>Senderos (22 Letras):</strong> Se iluminan cuando su letra aparece en el texto del nivel Miluy seleccionado.</p>
          <p><strong>Sefirot (10 Emanaciones):</strong> Los 10 nodos del Árbol de la Vida, siempre visibles.</p>
          <p><strong>Niveles Miluy:</strong> Cambia entre niveles para ver cómo la expansión recursiva activa diferentes senderos.</p>
        </div>
      </div>
    </div>
  );
}
