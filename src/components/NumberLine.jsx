import React, { useState, useRef, useEffect, useCallback } from 'react'
import { gcd, lcm, POINT_COLORS } from '../utils'
import { useCapture } from '../hooks/useCapture'

function drawFractionLabel(ctx, num, den, x, y, color, localHide, globalHide, thickness = 2) {
  // 1. O Global Hide é o "Master Switch". Se ativo, não desenha nada.
  if (globalHide) return;

  // 2. Se o Global Hide estiver desligado, verificamos o Local (Quiz Mode).
  if (localHide) {
    ctx.font = 'bold 20px Arial'; 
    ctx.fillStyle = color; 
    ctx.textAlign = 'center';
    ctx.fillText('?', x, y); 
    return;
  }

  // 3. Comportamento padrão (mostra a fração)
  const ns = String(num), ds = String(den)
  ctx.font = 'bold 16px Arial'; ctx.fillStyle = color; ctx.textAlign = 'center'
  ctx.fillText(ns, x, y - 4)
  const lw = Math.max(ctx.measureText(ns).width, ctx.measureText(ds).width) + 6
  ctx.beginPath(); ctx.moveTo(x - lw / 2, y + 2); ctx.lineTo(x + lw / 2, y + 2)
  ctx.strokeStyle = color; ctx.lineWidth = thickness; ctx.stroke()
  ctx.fillText(ds, x, y + 18)
}

export function renderRetaOnCanvas(canvas, fractions, localHide, globalHide, thickness = 2, borderColor = '#333') {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const margin = 60
  const y = 120
  const width = canvas.width - margin * 2

  const values = fractions.map(f => f.num / f.den)
  let minVal = Math.floor(Math.min(...values, 0))
  let maxVal = Math.ceil(Math.max(...values, 0))
  minVal = Math.min(minVal, 0)
  maxVal = Math.max(maxVal, 0)

  const range = maxVal - minVal || 1
  const step = width / range

  let mmc = fractions.map(f => f.den).reduce((acc, d) => lcm(acc, d), 1)
  mmc = Math.min(mmc, 20)

  // Axis
  ctx.beginPath(); ctx.moveTo(margin, y); ctx.lineTo(margin + width, y)
  ctx.strokeStyle = '#333'; ctx.lineWidth = thickness; ctx.stroke()

  // Right arrow
  ctx.beginPath()
  ctx.moveTo(margin + width, y); ctx.lineTo(margin + width - 10, y - 6); ctx.lineTo(margin + width - 10, y + 6)
  ctx.closePath(); ctx.fillStyle = '#333'; ctx.fill()

  // Left arrow
  ctx.beginPath()
  ctx.moveTo(margin, y); ctx.lineTo(margin + 10, y - 6); ctx.lineTo(margin + 10, y + 6)
  ctx.closePath(); ctx.fill()

  // Tick marks and subdivisions
  for (let i = minVal; i <= maxVal; i++) {
    const baseX = margin + (i - minVal) * step
    ctx.beginPath(); ctx.moveTo(baseX, y - 15); ctx.lineTo(baseX, y + 15)
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.stroke()
    ctx.font = 'bold 16px Arial'; ctx.fillStyle = '#333'; ctx.textAlign = 'center'
    ctx.fillText(i, baseX, y + 35)

    if (i < maxVal) {
      for (let j = 1; j < mmc; j++) {
        const x = baseX + (j / mmc) * step
        ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 8)
        ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1; ctx.stroke()
      }
    }
  }

  // Points
  fractions.forEach((f, i) => {
    const col = POINT_COLORS[i % POINT_COLORS.length]
    const value = f.num / f.den
    const posX = margin + (value - minVal) * step
    ctx.beginPath(); ctx.arc(posX, y, 8, 0, Math.PI * 2)
    ctx.fillStyle = col; ctx.fill()
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.stroke()
    
    // Passando os dois estados para a função
    drawFractionLabel(ctx, f.num, f.den, posX, y - 30, col, localHide, globalHide, thickness)
  })
}

export default function NumberLine({ thickness, numeratorFill, unfilledFill, borderFill, globalHideLabel }) {
  const [fractions, setFractions] = useState([{ num: 1, den: 4 }, { num: 3, den: 4 }])
  const [hideLabels, setHideLabels] = useState(false)
  const canvasRef = useRef(null)
  const captureRef = useRef(null)
  const { copyImage, downloadImage } = useCapture()

  const redraw = useCallback(() => {
    if (canvasRef.current) {
      renderRetaOnCanvas(canvasRef.current, fractions, hideLabels, globalHideLabel, thickness, borderFill)
    }
  }, [fractions, hideLabels, globalHideLabel, thickness, borderFill])

  useEffect(() => { redraw() }, [redraw])

  const updateFraction = (idx, field, val) => {
    setFractions(prev => prev.map((f, i) => {
      if (i !== idx) return f
      const newVal = field === 'den' ? Math.max(1, parseInt(val) || 1) : (parseInt(val) || 0)
      return { ...f, [field]: newVal }
    }))
  }

  const addFraction = () => setFractions(prev => [...prev, { num: 1, den: 2 }])
  const removeFraction = (idx) => setFractions(prev => prev.filter((_, i) => i !== idx))

  return (
    <>
      <div className="controls">
        <label className="checkbox-label" style={{ opacity: globalHideLabel ? 0.5 : 1 }}>
          <input 
            type="checkbox" 
            checked={hideLabels} 
            onChange={e => setHideLabels(e.target.checked)} 
            disabled={globalHideLabel} 
          />
          Ocultar frações (Modo Quiz)
        </label>
      </div>

      <div className="reta-fractions-list">
        {fractions.map((f, i) => (
          <div key={i} className="reta-fraction-row">
            <span className="color-dot" style={{ background: POINT_COLORS[i % POINT_COLORS.length] }} />
            <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--muted)' }}>Fração {i + 1}:</label>
            <input
              type="number"
              value={f.num}
              onChange={e => updateFraction(i, 'num', e.target.value)}
            />
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>/</span>
            <input
              type="number"
              value={f.den}
              min="1"
              onChange={e => updateFraction(i, 'den', e.target.value)}
            />
            {fractions.length > 1 && (
              <button className="btn btn-remove" onClick={() => removeFraction(i)}>Remover</button>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <button className="btn btn-add" onClick={addFraction}>+ Adicionar fração</button>
      </div>

      <div className="scroll-wrapper">
        <div className="capture-zone" ref={captureRef} style={{ display: 'block' }}>
          <canvas ref={canvasRef} width={900} height={240} />
        </div>
      </div>

      <div className="btn-group">
        <button className="btn btn-copy" onClick={() => copyImage(captureRef)}>Copiar</button>
        <button className="btn btn-download" onClick={() => downloadImage(captureRef)}>Baixar</button>
      </div>
    </>
  )
}
