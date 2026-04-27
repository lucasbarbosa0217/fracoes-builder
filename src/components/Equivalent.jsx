import React, { useState, useMemo, useRef } from 'react'
import FractionBlock from './FractionBlock'
import { gcd, estimateImageCount } from '../utils'
import { useCapture } from '../hooks/useCapture'

function MathSymbol({ children, ariaLabel }) {
  return <div className="math-symbol" aria-label={ariaLabel} role="img">{children}</div>
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

  const summaryText = activeMode === 'mult'
    ? `Multiplicando a fração original por ${multFactor}`
    : `Simplificando a fração original por ${divVal}`

  return (
    <>
      <div className="controls" role="group" aria-labelledby="equivalent-controls">
        <div id="equivalent-controls" style={{ display: 'none' }}>Controles de frações equivalentes</div>
        <div className="input-group">
          <label htmlFor="equiv-num" style={{ display: 'none' }}>Numerador</label>
          <input
            id="equiv-num"
            type="number"
            value={num}
            onChange={e => setNum(parseInt(e.target.value) || 0)}
            aria-label="Numerador da fração"
          />
          <span aria-hidden="true">/</span>
          <label htmlFor="equiv-den" style={{ display: 'none' }}>Denominador</label>
          <input
            id="equiv-den"
            type="number"
            value={den}
            min="1"
            onChange={e => setDen(Math.max(1, parseInt(e.target.value) || 1))}
            aria-label="Denominador da fração"
          />
        </div>

        <div className="switch-container" role="group" aria-label="Alternar modo de equivalência">
          <button className={`switch-btn ${activeMode === 'mult' ? 'active' : ''}`} onClick={() => setMode('mult')} aria-pressed={activeMode === 'mult'}>
            Multiplicar
          </button>
          {!isIrreducible && (
            <button className={`switch-btn ${activeMode === 'div' ? 'active' : ''}`} onClick={() => setMode('div')} aria-pressed={activeMode === 'div'}>
              Simplificar
            </button>
          )}
        </div>

        {activeMode === 'mult' ? (
          <div className="slider-wrapper">
            <label htmlFor="mult-factor">Fator: <strong>{multFactor}</strong></label>
            <input
              id="mult-factor"
              type="range"
              min="1"
              max="10"
              value={multFactor}
              onChange={e => setMultFactor(Number(e.target.value))}
              aria-label="Fator de multiplicação"
            />
          </div>
        ) : (
          <div className="slider-wrapper">
            <label htmlFor="div-index">Divisor: <strong>{divVal}</strong></label>
            <input
              id="div-index"
              type="range"
              min="0"
              max={divisors.length - 1}
              value={safeDivIdx}
              onChange={e => setDivIdx(Number(e.target.value))}
              aria-label="Selecionar divisor para simplificação"
            />
          </div>
        )}

        {isIrreducible && <span className="info-tag">Irredutível</span>}

        {warnHeavy && <span className="warn-badge">⚠ Muitas imagens!</span>}
      </div>

      <div className="result-summary" aria-live="polite" aria-atomic="true">
        <p>{summaryText}</p>
        <p>Resultado: {newNum}/{newDen}</p>
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
