"use client";

import { useState } from "react";
import { getLetterColor } from "../../domain/constants/alphabet";
import { getColorByLetterCount } from "../../domain/engines/miluy";
import "./analysis.css";
import "./collision-warning.css";
import { SEFER_YETZIRAH_LETTERS } from "../../domain/constants/sefer_yetzirah";
import { OracleConsultation } from "../oracle";
import { SefirotTree } from "../sefirot-tree";
import { TreeOfLifeInteractive } from "../tree-of-life";
import { GatesGrid } from "../gates-231";
import { ReshitView } from "../reshit";
import { LivingLetter } from "../living-letter";
import { ColorSpectrum } from "../color-spectrum";
import { QualitativeAnalysis } from "../qualitative-analysis";
import { CollisionWarning } from "./CollisionWarning";

interface AnalysisScreenProps {
  result: any;
  onBack: () => void;
}

export function AnalysisScreen({ result, onBack }: AnalysisScreenProps) {
  const [activeTab, setActiveTab] = useState<
    | "gematria"
    | "miluy"
    | "temurah"
    | "letters"
    | "sefirot"
    | "gates"
    | "reshit"
    | "qualitative"
    | "oracle"
    | "living"
  >("gematria");
  const [qualitativeLevel, setQualitativeLevel] = useState(0);

  return (
    <div className="analysis-container">
      <div className="analysis-header">
        <button
          onClick={onBack}
          style={{
            padding: "12px 24px",
            background: "rgba(184, 79, 255, 0.1)",
            border: "1px solid rgba(184, 79, 255, 0.3)",
            borderRadius: "12px",
            color: "#b84fff",
            cursor: "pointer",
          }}
        >
          ← Volver
        </button>
        <h1 className="analysis-title">ANÁLISIS COMPLETO</h1>
      </div>

      <div className="analysis-tabs">
        <button
          className={activeTab === "oracle" ? "tab active" : "tab"}
          onClick={() => setActiveTab("oracle")}
        >
          🔮 Consulta Completa
        </button>
        <button
          className={activeTab === "living" ? "tab active" : "tab"}
          onClick={() => setActiveTab("living")}
        >
          🔥 Letra Viva
        </button>
        <button
          className={activeTab === "gematria" ? "tab active" : "tab"}
          onClick={() => setActiveTab("gematria")}
        >
          🔢 Gematria
        </button>
        <button
          className={activeTab === "miluy" ? "tab active" : "tab"}
          onClick={() => setActiveTab("miluy")}
        >
          🌟 Miluy
        </button>
        <button
          className={activeTab === "temurah" ? "tab active" : "tab"}
          onClick={() => setActiveTab("temurah")}
        >
          🔐 Temurah
        </button>
        <button
          className={activeTab === "letters" ? "tab active" : "tab"}
          onClick={() => setActiveTab("letters")}
        >
          🎨 Letras
        </button>
        <button
          className={activeTab === "sefirot" ? "tab active" : "tab"}
          onClick={() => setActiveTab("sefirot")}
        >
          🌳 Sefirot
        </button>
        <button
          className={activeTab === "gates" ? "tab active" : "tab"}
          onClick={() => setActiveTab("gates")}
        >
          🌀 231 Gates
        </button>
        <button
          className={activeTab === "reshit" ? "tab active" : "tab"}
          onClick={() => setActiveTab("reshit")}
        >
          📜 Reshit
        </button>
        <button
          className={activeTab === "qualitative" ? "tab active" : "tab"}
          onClick={() => setActiveTab("qualitative")}
        >
          🔬 Análisis Cualitativo
        </button>
      </div>

      <div className="analysis-content">
        {activeTab === "oracle" && (
          <div>
            <OracleConsultation
              input={result.input}
              colorSystem={result.config.colors}
            />
          </div>
        )}
        {activeTab === "living" && (
          <div>
            <LivingLetter
              input={result.input}
              colorSystem={result.config.colors}
            />
          </div>
        )}
        {activeTab === "gematria" && (
          <div>
            <ColorSpectrum
              input={result.input}
              colorSystem={result.config.colors}
              gematria={result.gematria.total}
              gematriaReduced={result.gematria.reduced}
            />
            <CollisionWarning
              value={result.gematria.total}
              word={result.input}
              context={{
                systemUsed: "Mispar Ragil (Standard)",
                spellingVariant: false,
                hasSemanticLink: false,
              }}
            />
            <h2 style={{ marginTop: "60px" }}>Detalles Numéricos</h2>
            <div className="analysis-card">
              <div className="stat-row">
                <span className="stat-label">Valor Total:</span>
                <span className="stat-value numeric">
                  {result.gematria.total}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Reducido:</span>
                <span className="stat-value numeric">
                  {result.gematria.reduced}
                </span>
              </div>
            </div>
          </div>
        )}
        {activeTab === "miluy" && (
          <div>
            <h2>Miluy - {result.config.miluy}</h2>
            <div className="analysis-card">
              <div className="stat-row">
                <span className="stat-label">Sistema:</span>
                <span className="stat-value">{result.config.miluy}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Nivel Sod Detectado:</span>
                <span className="stat-value numeric">{result.sodLevel}</span>
              </div>
            </div>
            <h3>Expansión por Niveles</h3>
            <div className="miluy-levels">
              {result.miluyLevels &&
                result.miluyLevels.map((level: any, idx: number) => {
                  const color = getColorByLetterCount(level.letterCount);
                  const isSod = idx === result.sodLevel;
                  return (
                    <div
                      key={idx}
                      className={`miluy-level ${isSod ? "sod-level" : ""}`}
                      style={{ borderColor: color }}
                    >
                      <div className="level-header">
                        <span className="level-number" style={{ color }}>
                          Nivel {level.level}
                        </span>
                        {isSod && <span className="sod-badge">SOD</span>}
                        <span className="level-count">
                          {level.letterCount} letras
                        </span>
                      </div>
                      <div className="level-text" dir="rtl" style={{ color }}>
                        {level.text}
                      </div>
                      <div className="level-gematria">
                        <span className="label">Gematria:</span>
                        <span className="value numeric">{level.gematria}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="miluy-explanation">
              <h3>Sistema {result.config.miluy}</h3>
              {result.config.miluy === "AB" && (
                <p>
                  AB (72) - Atzilut: Mundo de la Emanación, pura Chesed (bondad)
                </p>
              )}
              {result.config.miluy === "SAG" && (
                <p>
                  SaG (63) - Beriah: Mundo de la Creación, Chesed con Gevurah
                </p>
              )}
              {result.config.miluy === "MAH" && (
                <p>
                  MaH (45) - Yetzirah: Mundo de la Formación, Rachamim
                  (compasión)
                </p>
              )}
              {result.config.miluy === "BAN" && (
                <p>BaN (52) - Assiah: Mundo de la Acción, Din (juicio)</p>
              )}
            </div>
          </div>
        )}
        {activeTab === "temurah" && (
          <div>
            <h2>Temurah</h2>
            <div className="analysis-card">
              <div className="stat-row">
                <span className="stat-label">Atbash:</span>
                <span className="stat-value" dir="rtl">
                  {result.temurah.atbash}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Albam:</span>
                <span className="stat-value" dir="rtl">
                  {result.temurah.albam}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Avgad:</span>
                <span className="stat-value" dir="rtl">
                  {result.temurah.avgad}
                </span>
              </div>
            </div>
          </div>
        )}
        {activeTab === "letters" && (
          <div>
            <h2>Análisis de Letras</h2>
            <div className="letters-display" dir="rtl">
              {result.input.split("").map((char: string, i: number) => {
                if (char.trim() === "") return null;
                const color = getLetterColor(char, result.config.colors);
                return (
                  <span key={i} className="letter-large" style={{ color }}>
                    {char}
                  </span>
                );
              })}
            </div>
            <h3>Propiedades Místicas</h3>
            <div className="letters-properties">
              {result.input.split("").map((char: string, i: number) => {
                if (char.trim() === "") return null;
                const props = SEFER_YETZIRAH_LETTERS[char];
                if (!props) return null;
                const color = getLetterColor(char, result.config.colors);
                return (
                  <div
                    key={i}
                    className="letter-card"
                    style={{ borderColor: color }}
                  >
                    <div className="letter-card-header">
                      <span className="letter-card-char" style={{ color }}>
                        {char}
                      </span>
                      <span className="letter-card-name">{props.name}</span>
                    </div>
                    <div className="letter-card-details">
                      <div className="detail-item">
                        <span className="detail-label">Categoría:</span>
                        <span className="detail-value">{props.category}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Gematria:</span>
                        <span className="detail-value numeric">
                          {props.gematria}
                        </span>
                      </div>
                      {props.element && (
                        <div className="detail-item">
                          <span className="detail-label">Elemento:</span>
                          <span className="detail-value">{props.element}</span>
                        </div>
                      )}
                      {props.planet && (
                        <div className="detail-item">
                          <span className="detail-label">Planeta:</span>
                          <span className="detail-value">{props.planet}</span>
                        </div>
                      )}
                      {props.zodiac && (
                        <div className="detail-item">
                          <span className="detail-label">Zodíaco:</span>
                          <span className="detail-value">{props.zodiac}</span>
                        </div>
                      )}
                      {props.body_part && (
                        <div className="detail-item">
                          <span className="detail-label">Cuerpo:</span>
                          <span className="detail-value">
                            {props.body_part}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="color-info">
              <h3>Sistema de Color: {result.config.colors}</h3>
              <p>
                Los colores representan las propiedades místicas de cada letra
                según la tradición seleccionada.
              </p>
            </div>
          </div>
        )}
        {activeTab === "sefirot" && (
          <div>
            <TreeOfLifeInteractive
              input={result.input}
              colorSystem={result.config.colors}
              miluyLevels={result.miluyLevels || []}
            />
            <div style={{ marginTop: "60px" }}>
              <h3
                style={{
                  fontSize: "24px",
                  color: "#00d9ff",
                  marginBottom: "24px",
                  textAlign: "center",
                }}
              >
                Todas las Sefirot
              </h3>
              <SefirotTree />
            </div>
          </div>
        )}
        {activeTab === "gates" && (
          <div>
            <GatesGrid
              input={result.input}
              colorSystem={result.config.colors}
            />
          </div>
        )}
        {activeTab === "reshit" && (
          <div>
            <ReshitView
              input={result.input}
              colorSystem={result.config.colors}
            />
          </div>
        )}
        {activeTab === "qualitative" && (
          <div>
            <QualitativeAnalysis
              input={result.input}
              colorSystem={result.config.colors}
              miluyLevels={result.miluyLevels || []}
              selectedLevel={qualitativeLevel}
              onLevelChange={setQualitativeLevel}
            />
          </div>
        )}
      </div>
    </div>
  );
}
