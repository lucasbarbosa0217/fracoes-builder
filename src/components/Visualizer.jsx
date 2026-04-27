import React, { useState, useRef } from 'react'
import FractionBlock from './FractionBlock'
import { estimateImageCount } from '../utils'
import { useCapture } from '../hooks/useCapture'

export default function Visualizer({ thickness, numeratorFill, unfilledFill, borderFill, globalHideLabel }) {
  const [num, setNum] = useState(11)
  const [den, setDen] = useState(4)
  const [shape, setShape] = useState('rect')
  const [mixedMode, setMixedMode] = useState(false)
  
  const captureRef = useRef(null)
  const { copyImage, downloadImage } = useCapture()

  const count = estimateImageCount(num, den)
  const warnHeavy = count > 12

  const integerPart = Math.floor(num / den)
  const remainderPart = num % den

  const handleIntChange = (val) => setNum((parseInt(val) || 0) * den + remainderPart)
  const handleMixedNumChange = (val) => setNum(integerPart * den + (parseInt(val) || 0))
  const handleMixedDenChange = (val) => setDen(Math.max(1, parseInt(val) || 1))
  const handleStandardNumChange = (val) => setNum(parseInt(val) || 0)
  const handleDenChange = (val) => {
    const d = Math.max(1, parseInt(val) || 1)
    setDen(d)
    if (d < 3 && (shape === 'star' || shape === 'poly')) setShape('circle')
  }

  return (
    <>
      <style>{`
        .result-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px;
        }
        
        /* Estilização da Fração Visual */
        .custom-fraction-label {
          margin-left: 15px;
        }

        .fraction-display {
          display: inline-flex;
          align-items: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 1.8rem;
          font-weight: bold;
          color: #333;
        }

        .integer-part {
          margin-right: 8px;
        }

        .fraction-stacked {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          line-height: 1.1;
        }

        .fraction-numerator {
          border-bottom: 2px solid #333;
          padding: 0 4px;
          min-width: 20px;
          text-align: center;
        }

        .fraction-denominator {
          padding: 0 4px;
          min-width: 20px;
          text-align: center;
        }

        .fraction-inputs {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .controls {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          align-items: center;
          margin-bottom: 20px;
        }
        .input-group { display: flex; align-items: center; gap: 5px; }
        .warn-badge { color: red; font-weight: bold; font-size: 0.8rem; }
      `}</style>

      <div className="controls">
        <div className="input-group">
          {mixedMode ? (
            <>
              <input type="number" min="0" value={integerPart} onChange={e => handleIntChange(e.target.value)} style={{width: '50px'}} />
              <div className="fraction-inputs">
                <input type="number" min="0" value={remainderPart} onChange={e => handleMixedNumChange(e.target.value)} style={{width: '50px'}} />
                <span>/</span>
                <input type="number" min="1" value={den} onChange={e => handleMixedDenChange(e.target.value)} style={{width: '50px'}} />
              </div>
            </>
          ) : (
            <>
              <input type="number" value={num} onChange={e => handleStandardNumChange(e.target.value)} style={{width: '50px'}} />
              <span>/</span>
              <input type="number" min="1" value={den} onChange={e => handleDenChange(e.target.value)} style={{width: '50px'}} />
            </>
          )}
        </div>

        <select value={shape} onChange={e => setShape(e.target.value)}>
          <option value="circle">Círculos</option>
          <option value="rect">Retângulos</option>
          <option value="star" disabled={den < 3}>Estrelas</option>
          <option value="poly" disabled={den < 3}>Polígonos</option>
        </select>

        <label className="toggle-mixed">
          <input 
            type="checkbox" 
            checked={mixedMode} 
            onChange={(e) => setMixedMode(e.target.checked)} 
          />
          Fração Mista
        </label>

        {warnHeavy && <span className="warn-badge">⚠ Muitas imagens!</span>}
      </div>

      <div className="scroll-wrapper">
        <div className="capture-zone" ref={captureRef}>
          <div className="result-row">
            {mixedMode ? (
              <>
                {Array.from({ length: integerPart }).map((_, i) => (
                  <FractionBlock
                    key={`full-${i}`}
                    num={1} den={1}
                    shape={shape} numeratorFill={numeratorFill} unfilledFill={unfilledFill}
                    hideLabel={true}
                    thickness={thickness} borderFill={borderFill}
                  />
                ))}
                {remainderPart > 0 && (
                  <FractionBlock
                    key="remainder"
                    num={remainderPart} den={den}
                    shape={shape} numeratorFill={numeratorFill} unfilledFill={unfilledFill}
                    hideLabel={true}
                    thickness={thickness} borderFill={borderFill}
                  />
                )}
                
                {!globalHideLabel && (
                  <div className="custom-fraction-label">
                    <div className="fraction-display">
                      {integerPart > 0 && (
                        <span className="integer-part">{integerPart}</span>
                      )}
                      {remainderPart > 0 && (
                        <div className="fraction-stacked">
                          <span className="fraction-numerator">{remainderPart}</span>
                          <span className="fraction-denominator">{den}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <FractionBlock
                num={num} den={den}
                shape={shape} numeratorFill={numeratorFill} unfilledFill={unfilledFill}
                hideLabel={globalHideLabel}
                thickness={thickness} borderFill={borderFill}
              />
            )}
          </div>
        </div>
      </div>

      <div className="btn-group">
        <button className="btn btn-copy" onClick={async () => await copyImage(captureRef)}>Copiar</button>
        <button className="btn btn-download" onClick={async () => await downloadImage(captureRef)}>Baixar</button>
      </div>
    </>
  )
}
