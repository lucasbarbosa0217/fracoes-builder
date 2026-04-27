import React, { useState, useEffect, useRef, useCallback } from 'react'
import FractionBlock from './FractionBlock'
import { renderRetaOnCanvas } from './NumberLine'
import { rnd, gcd, QUIZ_COLORS, SHAPES } from '../utils'

function generateOptions(correctNum, correctDen, type, maxDen) {
  const options = []
  const seen = new Set()

  let answerNum = correctNum
  let answerDen = correctDen

  if (type === 'equiv') {
    const factor = rnd(2, 4)
    answerNum = correctNum * factor
    answerDen = correctDen * factor
  }

  const key = `${answerNum}/${answerDen}`
  options.push({ num: answerNum, den: answerDen, isCorrect: true })
  seen.add(key)

  while (options.length < 4) {
    const wn = rnd(1, maxDen), wd = rnd(2, maxDen)
    const k = `${wn}/${wd}`
    const ratio = wn / wd
    const correctRatio = answerNum / answerDen
    if (!seen.has(k) && Math.abs(ratio - correctRatio) > 0.001) {
      seen.add(k)
      options.push({ num: wn, den: wd, isCorrect: false })
    }
  }

  return options.sort(() => Math.random() - 0.5)
}

export default function Quiz({ thickness, numeratorFill, unfilledFill, borderFill, globalHideLabel }) {
  const [quizType, setQuizType] = useState('visual')
  const [difficulty, setDifficulty] = useState('med')
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [question, setQuestion] = useState(null)
  const [options, setOptions] = useState([])
  const [answered, setAnswered] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(null)
  const [feedback, setFeedback] = useState('')
  const canvasRef = useRef(null)

  const newQuestion = useCallback(() => {
    const maxDen = difficulty === 'easy' ? 4 : difficulty === 'med' ? 8 : 12
    const den = rnd(2, maxDen)
    const num = rnd(1, den)
    const shape = (() => {
      let s = SHAPES[rnd(0, SHAPES.length - 1)]
      if ((s === 'star' || s === 'poly') && den < 3) s = 'circle'
      return s
    })()
    const color = QUIZ_COLORS[rnd(0, QUIZ_COLORS.length - 1)]

    setQuestion({ num, den, shape, color, maxDen })
    setOptions(generateOptions(num, den, quizType, maxDen))
    setAnswered(false)
    setSelectedIdx(null)
    setFeedback('')
  }, [difficulty, quizType])

  useEffect(() => { newQuestion() }, [quizType, difficulty])

  // Draw canvas when quiz type is 'reta' and question changes
  useEffect(() => {
    if (quizType === 'reta' && question && canvasRef.current) {
      setTimeout(() => {
        renderRetaOnCanvas(canvasRef.current, [{ num: question.num, den: question.den }], true, thickness)
      }, 10)
    }
  }, [quizType, question, thickness])

  const handleAnswer = (opt, idx) => {
    if (answered) return
    setAnswered(true)
    setSelectedIdx(idx)
    setTotal(t => t + 1)

    const correct = opt.isCorrect
    if (correct) {
      setScore(s => s + 1)
      setFeedback('correct')
    } else {
      setFeedback('wrong')
    }
  }

  const getBtnStyle = (opt, idx) => {
    if (!answered || selectedIdx !== idx) return {}
    return opt.isCorrect
      ? { background: '#00b894', borderColor: '#00b894', color: 'white' }
      : { background: '#d63031', borderColor: '#d63031', color: 'white' }
  }

  if (!question) return null

  const questionText = quizType === 'reta'
    ? 'Qual é a fração indicada na reta real?'
    : quizType === 'equiv'
    ? 'Qual fração abaixo é equivalente à fração apresentada?'
    : 'Que fração está representada?'

  return (
    <>
      <div className="quiz-config" role="form" aria-labelledby="quiz-settings-title">
        <div>
          <div className="section-title" id="quiz-settings-title">Tipo de Quiz</div>
          <label htmlFor="quiz-type-select" className="sr-only">Selecionar tipo de quiz</label>
          <select id="quiz-type-select" value={quizType} onChange={e => setQuizType(e.target.value)} aria-label="Selecione o tipo de quiz">
            <option value="visual">Identificar (Visual)</option>
            <option value="reta">Identificar (Reta Real)</option>
            <option value="equiv">Frações Equivalentes</option>
          </select>
        </div>
        <div>
          <div className="section-title">Dificuldade</div>
          <label htmlFor="difficulty-select" className="sr-only">Selecionar dificuldade</label>
          <select id="difficulty-select" value={difficulty} onChange={e => setDifficulty(e.target.value)} aria-label="Selecione a dificuldade">
            <option value="easy">Fácil (den ≤ 4)</option>
            <option value="med">Médio (den ≤ 8)</option>
            <option value="hard">Difícil (den ≤ 12)</option>
          </select>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
          <div className="section-title">Pontuação</div>
          <div className="quiz-score">{score} / {total}</div>
        </div>
      </div>

      <div className="quiz-area">
        <div className="quiz-visual">
          {quizType === 'visual' && (
            <div style={{ transform: 'scale(0.55)', transformOrigin: 'top center', marginBottom: '-120px' }}>
              <FractionBlock
                num={question.num} den={question.den}
                shape={question.shape} numeratorFill={numeratorFill} unfilledFill={unfilledFill}
                hideLabel={true}
                thickness={thickness} borderFill={borderFill}
              />
            </div>
          )}
          {quizType === 'reta' && (
            <canvas ref={canvasRef} width={600} height={180} />
          )}
          {quizType === 'equiv' && (
            <div className="quiz-fraction-label">
              <div>{question.num}</div>
              <div className="fraction-line" />
              <div>{question.den}</div>
            </div>
          )}
        </div>

        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '16px' }}>
          {questionText}
        </div>

        <div className="quiz-options" role="list" aria-label="Opções de resposta">
          {options.map((opt, idx) => (
            <button
              key={idx}
              className="quiz-option-btn"
              style={getBtnStyle(opt, idx)}
              onClick={() => handleAnswer(opt, idx)}
              aria-pressed={answered && selectedIdx === idx}
              aria-label={`Opção ${idx + 1}: ${opt.num} sobre ${opt.den}`}
              role="listitem"
            >
              <div className="quiz-option-inner">
                {opt.num}
                <div className="quiz-option-den">{opt.den}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="quiz-feedback" aria-live="polite" aria-atomic="true">
          {feedback === 'correct' && <span style={{ color: '#00b894' }}>✓ Correto! 🎉</span>}
          {feedback === 'wrong' && (
            <span style={{ color: '#d63031' }}>
              ✗ A resposta era {question.num}/{question.den}
            </span>
          )}
        </div>

        <button
          className="btn"
          style={{ background: 'var(--purple)', marginTop: '16px' }}
          onClick={newQuestion}
        >
          Próxima →
        </button>
      </div>
    </>
  )
}
