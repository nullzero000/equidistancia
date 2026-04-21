'use client';

import React from 'react';
import { useStore } from '../../infrastructure/stores/app';
import { getLetterValue, getLetterColor } from '../../domain/constants/alphabet';
import { KEYBOARD_ROWS, FINAL_LETTERS } from './keyboard-layout';
import { useKeyboard } from './useKeyboard.hook';
import { styles } from './styles';

export function HebrewKeyboard() {
  const { input, setInput, config } = useStore();
  const { showFinals, toggleFinals, actions } = useKeyboard({ input, setInput });

  return (
    <div style={styles.container} dir="rtl">
      <div style={styles.header}>
        <span style={styles.title}>🔤 Hebrew Keyboard</span>
        <span style={styles.subtitle}>
          {config.colors} • {config.gematria}
        </span>
      </div>

      <div style={styles.rows}>
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} style={styles.row}>
            {row.map((key) => {
              const color = getLetterColor(key.char, config.colors);
              const value = config.gematria === 'LARGE' 
                ? (key.finalValue || key.value)
                : key.value;

              return (
                <button
                  key={key.char}
                  onClick={() => actions.onKeyPress(key.char)}
                  style={{
                    ...styles.key,
                    color,
                    textShadow: `0 0 12px ${color}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = `0 0 20px ${color}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)';
                  }}
                >
                  <span style={styles.keyChar}>{key.char}</span>
                  <span style={styles.keyValue}>{value}</span>
                </button>
              );
            })}
          </div>
        ))}

        {showFinals && (
          <div style={styles.row}>
            {FINAL_LETTERS.map((key) => {
              const color = getLetterColor(key.char, config.colors);
              const value = config.gematria === 'LARGE'
                ? key.finalValue
                : key.value;

              return (
                <button
                  key={key.char}
                  onClick={() => actions.onKeyPress(key.char)}
                  style={{
                    ...styles.key,
                    color,
                    textShadow: `0 0 12px ${color}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = `0 0 20px ${color}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)';
                  }}
                >
                  <span style={styles.keyChar}>{key.char}</span>
                  <span style={styles.keyValue}>{value}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div style={styles.actions}>
        <button onClick={toggleFinals} style={styles.actionBtn}>
          {showFinals ? 'Hide Finals' : 'Show Finals (ךםןףץ)'}
        </button>
        <button onClick={actions.onBackspace} style={styles.actionBtn}>
          ⌫ Backspace
        </button>
        <button onClick={actions.onSpace} style={{ ...styles.actionBtn, flex: 2 }}>
          Space
        </button>
        <button onClick={actions.onClear} style={styles.actionBtn}>
          🗑️ Clear
        </button>
      </div>

      <div style={styles.info}>
        <span>💡 Click letters to type • Colors sync with {config.colors}</span>
      </div>
    </div>
  );
}
