import React, { useState, useRef } from 'react'
import FractionBlock from './FractionBlock'
import { estimateImageCount } from '../utils'
import { useCapture } from '../hooks/useCapture'

export default function Visualizer({ thickness, numeratorFill, unfilledFill, borderFill, globalHideLabel }) {
  const [num, setNum] = useState(3)
  const [den, setDen] = useState(4)
  const [shape, setShape] = useState('rect')
  const captureRef = useRef(null)
  const { copyImage, downloadImage } = useCapture()

  const count = estimateImageCount(num, den)
  const warnHeavy = count > 12

  const handleDenChange = (val) => {
    const d = Math.max(1, parseInt(val) || 1)
    setDen(d)
    if (d < 3 && (shape === 'star' || shape === 'poly')) setShape('circle')
  }

  return (
    <>
      <div className="controls">
        <div className="input-group">
          <input type="number" value={num} onChange={e => setNum(parseInt(e.target.value) || 0)} />
          <span>/</span>
          <input type="number" value={den} min="1" onChange={e => handleDenChange(e.target.value)} />
        </div>

        <select value={shape} onChange={e => setShape(e.target.value)}>
          <option value="circle">Círculos</option>
          <option value="rect">Retângulos</option>
          <option value="star" disabled={den < 3}>Estrelas</option>
          <option value="poly" disabled={den < 3}>Polígonos</option>
        </select>

        {warnHeavy && <span className="warn-badge">⚠ Muitas imagens!</span>}
      </div>

      <div className="scroll-wrapper">
        <div className="capture-zone" ref={captureRef}>
          <div className="result-row">
            <FractionBlock
              num={num} den={den}
              shape={shape} numeratorFill={numeratorFill} unfilledFill={unfilledFill}
              hideLabel={globalHideLabel}
              thickness={thickness} borderFill={borderFill}
            />
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
