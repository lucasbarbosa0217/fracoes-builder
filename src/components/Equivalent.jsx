import React, { useState, useMemo, useRef } from 'react'
import FractionBlock from './FractionBlock'
import { gcd, estimateImageCount } from '../utils'
import { useCapture } from '../hooks/useCapture'

function MathSymbol({ children }) {
  return <div className="math-symbol">{children}</div>
}

export default function Equivalent({ thickness, numeratorFill, unfilledFill, borderFill, globalHideLabel }) {
  const [num, setNum] = useState(4)
  const [den, setDen] = useState(8)
  const [mode, setMode] = useState('mult')
  const [multFactor, setMultFactor] = useState(1)
  const [divIdx, setDivIdx] = useState(0)
  const captureRef = useRef(null)
  const { copyImage, downloadImage } = useCapture()

  const divisors = useMemo(() => {
    const common = gcd(Math.abs(num), Math.abs(den))
    const list = []
    for (let i = 1; i <= common; i++) if (common % i === 0) list.push(i)
    return list
  }, [num, den])

  const isIrreducible = divisors.length <= 1
  const safeDivIdx = Math.min(divIdx, divisors.length - 1)
  const divVal = divisors[safeDivIdx] || 1
  const activeMode = isIrreducible ? 'mult' : mode

  const newNum = activeMode === 'mult' ? num * multFactor : num / divVal
  const newDen = activeMode === 'mult' ? den * multFactor : den / divVal

  const tot = estimateImageCount(num, den) + estimateImageCount(newNum, newDen)
  const warnHeavy = tot > 12

  const opLabel = activeMode === 'mult'
    ? { top: `×${multFactor}`, bot: `×${multFactor}` }
    : { top: `÷${divVal}`, bot: `÷${divVal}` }

  return (
    <>
      <div className="controls">
        <div className="input-group">
          <input type="number" value={num} onChange={e => setNum(parseInt(e.target.value) || 0)} />
          <span>/</span>
          <input type="number" value={den} min="1" onChange={e => setDen(Math.max(1, parseInt(e.target.value) || 1))} />
        </div>

        <div className="switch-container">
          <button className={`switch-btn ${activeMode === 'mult' ? 'active' : ''}`} onClick={() => setMode('mult')}>
            Multiplicar
          </button>
          {!isIrreducible && (
            <button className={`switch-btn ${activeMode === 'div' ? 'active' : ''}`} onClick={() => setMode('div')}>
              Simplificar
            </button>
          )}
        </div>

        {activeMode === 'mult' ? (
          <div className="slider-wrapper">
            <span style={{ whiteSpace: 'nowrap' }}>Fator: <strong>{multFactor}</strong></span>
            <input type="range" min="1" max="10" value={multFactor} onChange={e => setMultFactor(Number(e.target.value))} />
          </div>
        ) : (
          <div className="slider-wrapper">
            <span style={{ whiteSpace: 'nowrap' }}>Divisor: <strong>{divVal}</strong></span>
            <input type="range" min="0" max={divisors.length - 1} value={safeDivIdx} onChange={e => setDivIdx(Number(e.target.value))} />
          </div>
        )}

        {isIrreducible && <span className="info-tag">Irredutível</span>}

        {warnHeavy && <span className="warn-badge">⚠ Muitas imagens!</span>}
      </div>

      <div className="scroll-wrapper">
        <div className="capture-zone" ref={captureRef}>
          <div className="result-row">
            <FractionBlock
              num={num} den={den}
              shape="circle" numeratorFill={numeratorFill} unfilledFill={unfilledFill}
              opTop={opLabel.top} opBot={opLabel.bot}
              hideLabel={globalHideLabel}
              thickness={thickness} borderFill={borderFill}
            />
            <MathSymbol>=</MathSymbol>
            <FractionBlock
              num={newNum} den={newDen}
              shape="circle" numeratorFill={numeratorFill} unfilledFill={unfilledFill}
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
