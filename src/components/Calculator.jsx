import React, { useState, useRef } from 'react'
import FractionBlock from './FractionBlock'
import { gcd, lcm, estimateImageCount } from '../utils'
import { useCapture } from '../hooks/useCapture'

function MathSymbol({ children, ariaLabel }) {
  return <div className="math-symbol" aria-label={ariaLabel} role="img">{children}</div>
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
  const equivalentFirst = [n1 * (cD / d1), cD]
  const equivalentSecond = [n2 * (cD / d2), cD]
  const allFractions = [[n1, d1], [n2, d2], ...(d1 !== d2 ? [equivalentFirst, equivalentSecond] : []), [resN, cD]]
  const tot = allFractions.reduce((a, [n, d]) => a + estimateImageCount(n, d), 0)
  const warnHeavy = tot > 12
  const rg = gcd(resN, cD)
  const simplified = rg > 1 ? [resN / rg, cD / rg] : null

  const props = { shape: 'circle', numeratorFill, unfilledFill, hideLabel: globalHideLabel, thickness, borderFill }

  return (
    <>
      <fieldset className="controls" aria-describedby="calculator-desc">
        <legend style={{display: 'none'}}>Controles da Calculadora de Frações</legend>
        <p id="calculator-desc" style={{display: 'none'}}>Configure duas frações e uma operação para calcular o resultado</p>

        <div className="input-group" role="group" aria-labelledby="first-fraction">
          <span id="first-fraction" className="sr-only">Primeira fração</span>
          <label htmlFor="calc-n1" style={{display: 'none'}}>Numerador primeira fração</label>
          <input 
            id="calc-n1"
            type="number" 
            value={n1} 
            onChange={e => setN1(parseInt(e.target.value) || 0)}
            aria-label="Numerador primeira fração"
          />
          <span aria-hidden="true">/</span>
          <label htmlFor="calc-d1" style={{display: 'none'}}>Denominador primeira fração</label>
          <input 
            id="calc-d1"
            type="number" 
            value={d1} 
            min="1" 
            onChange={e => setD1(Math.max(1, parseInt(e.target.value) || 1))}
            aria-label="Denominador primeira fração"
          />
        </div>

        <label htmlFor="operation-select">Operação:</label>
        <select 
          id="operation-select"
          value={op} 
          onChange={e => setOp(e.target.value)}
          aria-label="Selecione a operação matemática"
        >
          <option value="+">Adição (+)</option>
          <option value="-">Subtração (−)</option>
        </select>

        <div className="input-group" role="group" aria-labelledby="second-fraction">
          <span id="second-fraction" className="sr-only">Segunda fração</span>
          <label htmlFor="calc-n2" style={{display: 'none'}}>Numerador segunda fração</label>
          <input 
            id="calc-n2"
            type="number" 
            value={n2} 
            onChange={e => setN2(parseInt(e.target.value) || 0)}
            aria-label="Numerador segunda fração"
          />
          <span aria-hidden="true">/</span>
          <label htmlFor="calc-d2" style={{display: 'none'}}>Denominador segunda fração</label>
          <input 
            id="calc-d2"
            type="number" 
            value={d2} 
            min="1" 
            onChange={e => setD2(Math.max(1, parseInt(e.target.value) || 1))}
            aria-label="Denominador segunda fração"
          />
        </div>

        {warnHeavy && <span className="warn-badge" role="alert">⚠ Muitas imagens!</span>}
      </fieldset>

      <div className="result-summary" aria-live="polite" aria-atomic="true">
        <p>
          Operação: {n1}/{d1} {op} {n2}/{d2} = {resN}/{cD}
        </p>
        {d1 !== d2 && (
          <p>
            Frações equivalentes no mesmo denominador: {equivalentFirst[0]}/{equivalentFirst[1]} {op} {equivalentSecond[0]}/{equivalentSecond[1]}
          </p>
        )}
        {simplified && (
          <p>
            Fração simplificada: {simplified[0]}/{simplified[1]}
          </p>
        )}
      </div>

      <div className="scroll-wrapper" role="region" aria-label="Resultado do cálculo">
        <div className="capture-zone" ref={captureRef}>
          <div className="result-row">
            <FractionBlock num={n1} den={d1} {...props} />
            <MathSymbol ariaLabel={op === '+' ? 'mais' : 'menos'}>{op}</MathSymbol>
            <FractionBlock num={n2} den={d2} {...props} />
            <MathSymbol ariaLabel="equals">=</MathSymbol>

            {d1 !== d2 && (
              <>
                <FractionBlock num={equivalentFirst[0]} den={equivalentFirst[1]} {...props} />
                <MathSymbol ariaLabel={op === '+' ? 'mais' : 'menos'}>{op}</MathSymbol>
                <FractionBlock num={equivalentSecond[0]} den={equivalentSecond[1]} {...props} />
                <MathSymbol ariaLabel="equals">=</MathSymbol>
              </>
            )}

            <FractionBlock num={resN} den={cD} {...props} />

            {simplified && (
              <>
                <MathSymbol ariaLabel="equals">=</MathSymbol>
                <FractionBlock num={simplified[0]} den={simplified[1]} {...props} />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="btn-group">
        <button 
          className="btn btn-copy" 
          onClick={async () => await copyImage(captureRef)}
          aria-label="Copiar resultado para área de transferência"
          title="Copiar resultado para área de transferência"
        >
          Copiar
        </button>
        <button 
          className="btn btn-download" 
          onClick={async () => await downloadImage(captureRef)}
          aria-label="Baixar imagem do resultado"
          title="Baixar imagem do resultado"
        >
          Baixar
        </button>
      </div>

      <style>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>
    </>
  )
}
