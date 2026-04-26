import React, { useState, useRef } from 'react'
import FractionBlock from './FractionBlock'
import { gcd, lcm, estimateImageCount } from '../utils'
import { useCapture } from '../hooks/useCapture'

function MathSymbol({ children }) {
  return <div className="math-symbol">{children}</div>
}

export default function Calculator({ thickness, numeratorFill, unfilledFill, borderFill, globalHideLabel }) {
  const [n1, setN1] = useState(1)
  const [d1, setD1] = useState(2)
  const [n2, setN2] = useState(1)
  const [d2, setD2] = useState(4)
  const [op, setOp] = useState('+')
  const captureRef = useRef(null)
  const { copyImage, downloadImage } = useCapture()

  const cD = lcm(d1, d2)
  const resN = op === '+' ? n1 * (cD / d1) + n2 * (cD / d2) : n1 * (cD / d1) - n2 * (cD / d2)
  const allFractions = [[n1, d1], [n2, d2], ...(d1 !== d2 ? [[n1 * (cD / d1), cD], [n2 * (cD / d2), cD]] : []), [resN, cD]]
  const tot = allFractions.reduce((a, [n, d]) => a + estimateImageCount(n, d), 0)
  const warnHeavy = tot > 12
  const rg = gcd(resN, cD)

  const props = { shape: 'circle', numeratorFill, unfilledFill, hideLabel: globalHideLabel, thickness, borderFill }

  return (
    <>
      <div className="controls">
        <div className="input-group">
          <input type="number" value={n1} onChange={e => setN1(parseInt(e.target.value) || 0)} />
          <span>/</span>
          <input type="number" value={d1} min="1" onChange={e => setD1(Math.max(1, parseInt(e.target.value) || 1))} />
        </div>

        <select value={op} onChange={e => setOp(e.target.value)}>
          <option value="+">+</option>
          <option value="-">−</option>
        </select>

        <div className="input-group">
          <input type="number" value={n2} onChange={e => setN2(parseInt(e.target.value) || 0)} />
          <span>/</span>
          <input type="number" value={d2} min="1" onChange={e => setD2(Math.max(1, parseInt(e.target.value) || 1))} />
        </div>

        {warnHeavy && <span className="warn-badge">⚠ Muitas imagens!</span>}
      </div>

      <div className="scroll-wrapper">
        <div className="capture-zone" ref={captureRef}>
          <div className="result-row">
            <FractionBlock num={n1} den={d1} {...props} />
            <MathSymbol>{op}</MathSymbol>
            <FractionBlock num={n2} den={d2} {...props} />
            <MathSymbol>=</MathSymbol>

            {d1 !== d2 && (
              <>
                <FractionBlock num={n1 * (cD / d1)} den={cD} {...props} />
                <MathSymbol>{op}</MathSymbol>
                <FractionBlock num={n2 * (cD / d2)} den={cD} {...props} />
                <MathSymbol>=</MathSymbol>
              </>
            )}

            <FractionBlock num={resN} den={cD} {...props} />

            {rg > 1 && (
              <>
                <MathSymbol>=</MathSymbol>
                <FractionBlock num={resN / rg} den={cD / rg} {...props} />
              </>
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
