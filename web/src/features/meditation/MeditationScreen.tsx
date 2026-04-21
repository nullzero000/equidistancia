"use client";

import { getLetterColor } from "../../domain/constants/alphabet";
import { useState, useEffect, useMemo } from "react";
import {
  BinauralAudio,
  FREQUENCIES,
  FrequencyMode,
} from "../../infrastructure/audio/binaural";
import "./meditation.css";

interface MeditationScreenProps {
  input: string;
  colorSystem: string;
  onBack: () => void;
  onAnalyze: () => void;
}

function generatePermutations(str: string): string[] {
  if (str.length <= 1) return [str];
  const permutations: string[] = [];
  function permute(arr: string[], m: string[] = []) {
    if (arr.length === 0) {
      permutations.push(m.join(''));
    } else {
      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice();
        const next = curr.splice(i, 1);
        permute(curr, m.concat(next));
      }
    }
  }
  permute(str.split(''));
  return permutations;
}

export function MeditationScreen({
  input,
  colorSystem,
  onBack,
  onAnalyze,
}: MeditationScreenProps) {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioEngine] = useState(() => new BinauralAudio());
  const [mode, setMode] = useState<FrequencyMode>("universal");
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [visualMode, setVisualMode] = useState<"rings-static" | "rings-expanding" | "mandala" | "zohar-light">("rings-static");
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [showPanel, setShowPanel] = useState(false);
  const [merkabahEnabled, setMerkabahEnabled] = useState(true);
  
  const [tzerufEnabled, setTzerufEnabled] = useState(false);
  const [tzerufInterval, setTzerufInterval] = useState(15);
  const [currentPermutationIndex, setCurrentPermutationIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const cleanInput = input.replace(/\s/g, '');
  const letterColors = cleanInput.split("").map((char) => getLetterColor(char, colorSystem));
  
  const allPermutations = useMemo(() => {
    if (cleanInput.length > 7) {
      return [cleanInput];
    }
    return generatePermutations(cleanInput);
  }, [cleanInput]);

  const currentText = tzerufEnabled ? allPermutations[currentPermutationIndex] : cleanInput;

  useEffect(() => {
    if (audioEnabled) {
      audioEngine.start(mode);
    } else {
      audioEngine.stop();
    }
    return () => { audioEngine.stop(); };
  }, [audioEnabled, mode, audioEngine]);

  useEffect(() => {
    const breathCycle = setInterval(() => {
      setBreathPhase((prev) => {
        if (prev === "inhale") return "hold";
        if (prev === "hold") return "exhale";
        return "inhale";
      });
    }, 4000);
    return () => clearInterval(breathCycle);
  }, []);

  useEffect(() => {
    if (!tzerufEnabled || allPermutations.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentPermutationIndex((prev) => (prev + 1) % allPermutations.length);
        setIsTransitioning(false);
      }, 800);
      
    }, tzerufInterval * 1000);

    return () => clearInterval(interval);
  }, [tzerufEnabled, tzerufInterval, allPermutations.length]);

  const renderRingsStatic = () => {
    const uniqueColors = [...new Set(letterColors)];
    return (
      <>
        {uniqueColors.map((color, i) => (
          <div key={i} className={`energy-ring-color ring-${i + 1} breath-${breathPhase}`} style={{ "--ring-color": color, "--ring-size": `${400 + i * 200}px` } as any} />
        ))}
      </>
    );
  };

  const renderRingsExpanding = () => {
    return (
      <>
        {letterColors.map((color, i) => (
          <div key={i} className="ring-expanding" style={{ "--ring-color": color, "--ring-delay": `${i * 0.5}s` } as any} />
        ))}
      </>
    );
  };

  const renderMandala = () => {
    const petals = 12;
    return (
      <div className="mandala-container">
        {Array.from({ length: petals }).map((_, i) => (
          <div key={i} className="mandala-petal" style={{ "--petal-rotation": `${(360 / petals) * i}deg`, "--petal-color": letterColors[i % letterColors.length] || "#00d9ff" } as any} />
        ))}
        <div className="mandala-center">
          {letterColors.map((color, i) => (
            <div key={i} className="mandala-ring" style={{ "--mandala-color": color, "--mandala-size": `${100 + i * 40}px` } as any} />
          ))}
        </div>
      </div>
    );
  };

  const renderZoharLight = () => {
    return (
      <div className="zohar-light-container">
        <div className="zohar-light-core" style={{ background: `radial-gradient(circle, ${letterColors[0] || "#ffffff"} 0%, transparent 70%)` }} />
        {letterColors.map((color, i) => (
          <div key={i} className="zohar-ray" style={{ "--ray-color": color, "--ray-rotation": `${(360 / letterColors.length) * i}deg`, "--ray-delay": `${i * 0.2}s` } as any} />
        ))}
      </div>
    );
  };

  const renderMerkabah = () => {
    return (
      <div className="merkabah-container">
        <svg className="merkabah-svg" viewBox="-200 -200 400 400" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="golden-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8"/>
              <stop offset="50%" stopColor="#FFA500" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#FF8C00" stopOpacity="0.4"/>
            </linearGradient>
            
            <filter id="merkabah-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <radialGradient id="particle-gradient">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="1"/>
              <stop offset="100%" stopColor="#FFD700" stopOpacity="0"/>
            </radialGradient>
          </defs>

          {/* Tetrahedron ascendente (△) */}
          <g className="tetrahedron tetra-up">
            <path d="M 0,-100 L -86.6,50 L 86.6,50 Z" fill="none" stroke="url(#golden-gradient)" strokeWidth="2" filter="url(#merkabah-glow)"/>
            <line x1="0" y1="-100" x2="0" y2="50" stroke="url(#golden-gradient)" strokeWidth="1" opacity="0.5"/>
            <line x1="-86.6" y1="50" x2="86.6" y2="50" stroke="url(#golden-gradient)" strokeWidth="1" opacity="0.5"/>
          </g>

          {/* Tetrahedron descendente (▽) */}
          <g className="tetrahedron tetra-down">
            <path d="M 0,100 L -86.6,-50 L 86.6,-50 Z" fill="none" stroke="url(#golden-gradient)" strokeWidth="2" filter="url(#merkabah-glow)"/>
            <line x1="0" y1="100" x2="0" y2="-50" stroke="url(#golden-gradient)" strokeWidth="1" opacity="0.5"/>
            <line x1="-86.6" y1="-50" x2="86.6" y2="-50" stroke="url(#golden-gradient)" strokeWidth="1" opacity="0.5"/>
          </g>

          {/* Centro pulsante */}
          <circle cx="0" cy="0" r="8" fill="#FFD700" opacity="0.6" className="merkabah-core">
            <animate attributeName="r" values="6;12;6" dur="4s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite"/>
          </circle>

          {/* Partículas orbitantes */}
          {[0, 120, 240].map((angle, i) => (
            <circle key={i} r="4" fill="url(#particle-gradient)" className="orbit-particle" opacity="0.7">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`${angle} 0 0`}
                to={`${angle + 360} 0 0`}
                dur="20s"
                repeatCount="indefinite"
              />
              <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>
            </circle>
          ))}
        </svg>
      </div>
    );
  };

  const renderVisualMode = () => {
    switch (visualMode) {
      case "rings-static": return renderRingsStatic();
      case "rings-expanding": return renderRingsExpanding();
      case "mandala": return renderMandala();
      case "zohar-light": return renderZoharLight();
      default: return null;
    }
  };

  const renderColoredLetters = () => {
    const letters = currentText.split("");
    const lettersRTL = [...letters].reverse();
    const spacing = 220;
    const totalWidth = lettersRTL.length * spacing;
    const startX = (1200 - totalWidth) / 2 + spacing / 2;

    return (
      <svg 
        width="100%" 
        height="500" 
        viewBox="0 0 1200 500" 
        className={`meditation-svg ${isTransitioning ? 'transitioning' : ''}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="external-aura" x="-200%" y="-200%" width="400%" height="400%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1"/>
            <feColorMatrix in="blur1" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.8 0" result="glow1"/>
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur2"/>
            <feColorMatrix in="blur2" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0" result="glow2"/>
            <feGaussianBlur in="SourceGraphic" stdDeviation="35" result="blur3"/>
            <feColorMatrix in="blur3" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.3 0" result="glow3"/>
            <feMerge>
              <feMergeNode in="glow3"/>
              <feMergeNode in="glow2"/>
              <feMergeNode in="glow1"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <radialGradient id="wave-gradient-med">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0"/>
          </radialGradient>

          <path id="tag-crown" d="M 0,-10 L 2,-2 L 0,-6 L -2,-2 Z" fill="currentColor"/>
        </defs>

        {/* Ondas MUY sutiles (casi imperceptibles) */}
        {lettersRTL.map((char, letterIdx) => {
          const x = startX + letterIdx * spacing;
          const y = 250;
          
          return (
            <g key={`waves-${letterIdx}`}>
              <circle
                cx={x}
                cy={y}
                r="30"
                fill="none"
                stroke="url(#wave-gradient-med)"
                strokeWidth="0.8"
                opacity="0"
              >
                <animate attributeName="r" from="35" to="110" dur="10s" begin={`${letterIdx * 0.8}s`} repeatCount="indefinite"/>
                <animate attributeName="opacity" from="0.12" to="0" dur="10s" begin={`${letterIdx * 0.8}s`} repeatCount="indefinite"/>
              </circle>
            </g>
          );
        })}

        {lettersRTL.map((char, i) => {
          const color = getLetterColor(char, colorSystem);
          const x = startX + i * spacing;
          
          return (
            <g key={`letter-${i}-${char}`} className="sacred-letter-group">
              <text
                x={x}
                y="300"
                fontSize="200"
                fontFamily="serif"
                fontWeight="300"
                textAnchor="middle"
                fill="#000000"
                opacity="0.2"
                className="letter-base"
              >
                {char}
              </text>

              <text
                x={x}
                y="300"
                fontSize="200"
                fontFamily="serif"
                fontWeight="300"
                textAnchor="middle"
                fill={color}
                filter="url(#external-aura)"
                className="letter-aura"
              >
                {char}
              </text>

              {['ש', 'ע', 'ט', 'נ', 'ז', 'ג', 'צ'].includes(char) && (
                <g className="tagin-group" opacity="0.7">
                  <use href="#tag-crown" x={x - 15} y="120" fill={color}/>
                  <use href="#tag-crown" x={x} y="115" fill={color}/>
                  <use href="#tag-crown" x={x + 15} y="120" fill={color}/>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="meditation-container">
      <div className="meditation-background" style={{ backgroundColor }}>
        {merkabahEnabled && renderMerkabah()}
        {renderVisualMode()}
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
      </div>

      <div className="meditation-letters">
        {renderColoredLetters()}
      </div>

      <button className="fab-button" onClick={() => setShowPanel(!showPanel)} title="Abrir controles">
        {showPanel ? "×" : "⚙️"}
      </button>

      <div className={`control-panel ${showPanel ? "open" : ""}`}>
        <div className="panel-header">
          <h2>Controles de Meditación</h2>
          <button className="panel-close" onClick={() => setShowPanel(false)}>×</button>
        </div>

        <div className="panel-content">
          <div className="panel-section">
            <div className="breath-indicator">
              <div className={`breath-icon breath-${breathPhase}`}>
                {breathPhase === "inhale" && "🌬️"}
                {breathPhase === "hold" && "⏸️"}
                {breathPhase === "exhale" && "🌊"}
              </div>
              <div className="breath-text">
                {breathPhase === "inhale" && "Inhala... expande tu ser"}
                {breathPhase === "hold" && "Sostén... contempla la luz"}
                {breathPhase === "exhale" && "Exhala... libera"}
              </div>
            </div>
          </div>

          <div className="panel-section">
            <label className="panel-label">מרכבה Merkabah</label>
            <button 
              onClick={() => setMerkabahEnabled(!merkabahEnabled)} 
              className={`audio-btn ${merkabahEnabled ? "active" : ""}`}
            >
              <span>{merkabahEnabled ? "✨" : "⭐"}</span>
              <span>{merkabahEnabled ? "Activa" : "Desactivada"}</span>
            </button>
          </div>

          <div className="panel-section">
            <label className="panel-label">צירוף Tzeruf (Permutaciones)</label>
            
            {allPermutations.length > 1 ? (
              <>
                <button 
                  onClick={() => setTzerufEnabled(!tzerufEnabled)} 
                  className={`audio-btn ${tzerufEnabled ? "active" : ""}`}
                >
                  <span>{tzerufEnabled ? "🔄" : "⭕"}</span>
                  <span>{tzerufEnabled ? "Activo" : "Desactivado"}</span>
                </button>

                {tzerufEnabled && (
                  <div className="tzeruf-controls">
                    <div className="tzeruf-info">
                      <span>Permutación {currentPermutationIndex + 1} de {allPermutations.length}</span>
                      <span className="tzeruf-text" dir="rtl">{currentText}</span>
                    </div>
                    
                    <label className="slider-label">
                      Velocidad: {tzerufInterval}s
                      <input 
                        type="range" 
                        min="5" 
                        max="30" 
                        value={tzerufInterval}
                        onChange={(e) => setTzerufInterval(Number(e.target.value))}
                        className="tzeruf-slider"
                      />
                    </label>
                  </div>
                )}
              </>
            ) : (
              <p className="tzeruf-disabled">Palabra demasiado larga ({cleanInput.length} letras, máx 7)</p>
            )}
          </div>

          <div className="panel-section">
            <label className="panel-label">Modo Visual</label>
            <div className="mode-grid">
              <button onClick={() => setVisualMode("rings-static")} className={`mode-btn ${visualMode === "rings-static" ? "active" : ""}`}>
                <span className="mode-icon">⭕</span><span>Rings Estáticos</span>
              </button>
              <button onClick={() => setVisualMode("rings-expanding")} className={`mode-btn ${visualMode === "rings-expanding" ? "active" : ""}`}>
                <span className="mode-icon">🎯</span><span>Rings Crecientes</span>
              </button>
              <button onClick={() => setVisualMode("mandala")} className={`mode-btn ${visualMode === "mandala" ? "active" : ""}`}>
                <span className="mode-icon">🌸</span><span>Mandala</span>
              </button>
              <button onClick={() => setVisualMode("zohar-light")} className={`mode-btn ${visualMode === "zohar-light" ? "active" : ""}`}>
                <span className="mode-icon">✨</span><span>Luz Zohar</span>
              </button>
            </div>
          </div>

          <div className="panel-section">
            <label className="panel-label">Color de Fondo</label>
            <div className="color-grid">
              {[
                { color: "#000000", name: "Negro" },
                { color: "#8B0000", name: "Rojo" },
                { color: "#FF4500", name: "Naranja" },
                { color: "#FFD700", name: "Dorado" },
                { color: "#32CD32", name: "Verde" },
                { color: "#00BFFF", name: "Azul" },
                { color: "#4B0082", name: "Índigo" },
                { color: "#9400D3", name: "Violeta" },
                { color: "#FF00FF", name: "Magenta" },
                { color: "#8B4513", name: "Marrón" },
                { color: "#FFFFFF", name: "Blanco" },
              ].map(({ color, name }) => (
                <button key={color} onClick={() => setBackgroundColor(color)} className={`color-btn ${backgroundColor === color ? "active" : ""}`} style={{ background: color }} title={name} />
              ))}
            </div>
          </div>

          <div className="panel-section">
            <label className="panel-label">Audio Binaural</label>
            <button onClick={() => setAudioEnabled(!audioEnabled)} className={`audio-btn ${audioEnabled ? "active" : ""}`}>
              <span>{audioEnabled ? "🔊" : "🔇"}</span>
              <span>{audioEnabled ? "Sonido ON" : "Sonido OFF"}</span>
            </button>

            {audioEnabled && (
              <div className="frequency-list">
                {(Object.keys(FREQUENCIES) as FrequencyMode[]).map((key) => {
                  const config = FREQUENCIES[key];
                  const isActive = mode === key;
                  return (
                    <button key={key} onClick={() => setMode(key)} className={`freq-item ${isActive ? "active" : ""}`}>
                      <div className="freq-info">
                        <div className="freq-dot" style={{ background: config.color }} />
                        <div className="freq-details">
                          <div className="freq-title">{config.name}</div>
                          <div className="freq-sub">{config.frequency} Hz · {config.brainwave}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="panel-section panel-actions">
            <button onClick={onBack} className="panel-nav-btn back"><span>←</span><span>Volver</span></button>
            <button onClick={onAnalyze} className="panel-nav-btn analyze"><span>Analizar</span><span>→</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}
