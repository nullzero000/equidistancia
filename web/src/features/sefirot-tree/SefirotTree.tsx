'use client';

import { useState } from 'react';
import { SEFIROT } from '../../domain/constants/sefirot';
import './sefirot-tree.css';

type ColorTradition = 'ramak' | 'zohar';

export function SefirotTree() {
  const [colorTradition, setColorTradition] = useState<ColorTradition>('zohar');

  const sefirotArray = Object.values(SEFIROT).sort((a, b) => a.number - b.number);

  return (
    <div className="sefirot-container">
      <div className="sefirot-header">
        <h2 className="sefirot-title">🌳 Tree of Life</h2>
        <div className="sefirot-toggle">
          <button
            className={colorTradition === 'ramak' ? 'active' : ''}
            onClick={() => setColorTradition('ramak')}
          >
            Ramak Colors
          </button>
          <button
            className={colorTradition === 'zohar' ? 'active' : ''}
            onClick={() => setColorTradition('zohar')}
          >
            Zohar Colors
          </button>
        </div>
      </div>

      <div className="sefirot-grid">
        {sefirotArray.map((sefirah) => {
          const color = colorTradition === 'ramak' ? sefirah.color_ramak : sefirah.color_zohar;
          
          return (
            <div key={sefirah.number} className={`sefirah-card pillar-${sefirah.pillar}`}>
              <div className="sefirah-number">{sefirah.number}</div>
              <div className="sefirah-name-en">{sefirah.english}</div>
              <div className="sefirah-name-he" dir="rtl">{sefirah.hebrew}</div>
              
              <div className="sefirah-details">
                <div className="detail-row">
                  <span className="detail-label">Divine Name:</span>
                  <span className="detail-value" dir="rtl">{sefirah.divine_name_hebrew}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Color:</span>
                  <span className="detail-value">{color}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Body:</span>
                  <span className="detail-value">{sefirah.part_of_body}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">World:</span>
                  <span className="detail-value">{sefirah.world}</span>
                </div>
              </div>

              <div className="sefirah-desc">{sefirah.description}</div>
            </div>
          );
        })}
      </div>

      <div className="sefirot-footer">
        <p>Based on: Etz Chaim (Chaim Vital) • Pardes Rimonim (Moses Cordovero)</p>
        <p>Ramak = Moses Cordovero's color system • Zohar = Classical four-color system</p>
      </div>
    </div>
  );
}
<div className="sefirot-actions">
        <button className="sefirot-action-btn meditation">
          <span className="btn-icon">🧘</span>
          <span>Meditación Profunda</span>
        </button>
        <button className="sefirot-action-btn knowledge">
          <span className="btn-icon">📚</span>
          <span>Vasto Conocimiento</span>
        </button>
      </div>