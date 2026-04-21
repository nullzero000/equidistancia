"use client";

import { useState } from "react";
import { useStore } from "../infrastructure/stores/app";
import { calculate } from "../domain/engines/gematria";
import { getLetterColor } from "../domain/constants/alphabet";
import {
  expandWord,
  analyzeMiluyLevels,
  detectSodLevel,
} from "../domain/engines/miluy";
import { applyTemurah } from "../domain/engines/temurah";
import { HebrewKeyboard } from "../features/hebrew-keyboard";
import { SefirotTree } from "../features/sefirot-tree";
import { MeditationScreen } from "../features/meditation";
import { AnalysisScreen } from "../features/analysis";
import "./page.css";

export default function Home() {
  const { input, setInput, config, setGematria, setMiluy, setColors } =
    useStore();
  const [result, setResult] = useState<any>(null);
  const [screen, setScreen] = useState<"home" | "meditation" | "analysis">(
    "home",
  );

  const handleAnalyze = () => {
    if (input.trim()) {
      const gematria = calculate(input, config.gematria);
      const miluyExpansion = expandWord(input, config.miluy);
      const miluyGematria = calculate(miluyExpansion, config.gematria);

      // Análisis profundo de 5 niveles
      const miluyLevels = analyzeMiluyLevels(
        input,
        config.miluy,
        config.gematria,
        5,
      );
      const sodLevel = detectSodLevel(miluyLevels);

      const atbash = applyTemurah(input, "atbash");
      const albam = applyTemurah(input, "albam");
      const avgad = applyTemurah(input, "avgad");

      setResult({
        input,
        gematria,
        miluyExpansion,
        miluyGematria,
        miluyLevels, // NUEVO
        sodLevel, // NUEVO
        temurah: { atbash, albam, avgad },
        config,
      });
    }
  };

  const renderColoredInput = () => {
    if (!input) return null;

    return input.split("").map((char, i) => {
      if (char.trim() === "") return <span key={i}> </span>;

      const color = getLetterColor(char, config.colors);
      return (
        <span key={i} style={{ color, textShadow: `0 0 10px ${color}` }}>
          {char}
        </span>
      );
    });
  };

  // PANTALLA 2: MEDITACIÓN
  if (screen === "meditation") {
    return (
      <MeditationScreen
        input={input}
        colorSystem={config.colors}
        onBack={() => setScreen("home")}
        onAnalyze={() => {
          handleAnalyze();
          setScreen("analysis");
        }}
      />
    );
  }

  // PANTALLA 3: ANÁLISIS
  if (screen === "analysis") {
    return <AnalysisScreen result={result} onBack={() => setScreen("home")} />;
  }

  // PANTALLA 1 Y 3: HOME + ANÁLISIS
  return (
    <main className="main">
      <div className="container">
        <header className="header">
          <h1 className="title">OTZAR KODESH</h1>
          <p className="subtitle">Sacred Treasury of Kabbalistic Computation</p>
        </header>

        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="שלום"
            className="input-main"
            dir="rtl"
          />
          <div className="color-overlay" dir="rtl">
            {renderColoredInput()}
          </div>
        </div>

        <button
          onClick={() => setScreen("meditation")}
          className="btn-calculate"
        >
          <span className="btn-icon">🧘</span>
          MEDITAR
        </button>

        <div className="config-grid">
          <div className="config-item">
            <label className="label">Gematria System</label>
            <select
              value={config.gematria}
              onChange={(e) => setGematria(e.target.value as any)}
              className="select"
            >
              <option value="STANDARD">Standard (ך=20)</option>
              <option value="LARGE">Large (ך=500)</option>
              <option value="REDUCED">Reduced (Digital Sum)</option>
              <option value="ORDINAL">Ordinal (Position)</option>
              <option value="SQUARED">Squared (Values²)</option>
              <option value="TRIANGULAR">Triangular (Σ)</option>
            </select>
          </div>

          <div className="config-item">
            <label className="label">Miluy System</label>
            <select
              value={config.miluy}
              onChange={(e) => setMiluy(e.target.value as any)}
              className="select"
            >
              <option value="AB">AB (72) - Atzilut</option>
              <option value="SAG">SaG (63) - Beriah</option>
              <option value="MAH">MaH (45) - Yetzirah</option>
              <option value="BAN">BaN (52) - Assiah</option>
            </select>
          </div>

          <div className="config-item">
            <label className="label">Color System</label>
            <select
              value={config.colors}
              onChange={(e) => setColors(e.target.value as any)}
              className="select"
            >
              <option value="ZOHAR">Zohar</option>
              <option value="GOLDEN_DAWN">Golden Dawn</option>
              <option value="SEFIROT">Sefirot</option>
              <option value="AKASHIC">Akashic</option>
            </select>
          </div>
        </div>

        <HebrewKeyboard />

        <footer className="footer">
          <p>Based on: Sefer Yetzirah • Etz Chaim • Zohar</p>
          <p>Research: Scholem • Idel • Kaplan</p>
        </footer>
      </div>
    </main>
  );
}
