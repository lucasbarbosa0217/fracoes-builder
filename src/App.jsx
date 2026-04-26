import React, { useState } from 'react'
import Visualizer from './components/Visualizer'
import Calculator from './components/Calculator'
import Equivalent from './components/Equivalent'
import NumberLine from './components/NumberLine'
import Quiz from './components/Quiz'

export default function App() {
    const [activeTab, setActiveTab] = useState('visualizer')
    const [thickness, setThickness] = useState(2)
    const [numeratorColor, setNumeratorColor] = useState('#6bb8ff')
    const [numeratorAlpha, setNumeratorAlpha] = useState(90)
    const [unfilledColor, setUnfilledColor] = useState('#DCDCDC')
    const [unfilledAlpha, setUnfilledAlpha] = useState(55)
    const [borderColor, setBorderColor] = useState('#353535')
    const [borderAlpha, setBorderAlpha] = useState(100)
    const [globalHideLabel, setGlobalHideLabel] = useState(false)
    const [showControls, setShowControls] = useState(false)

    const restoreDefaults = () => {
        setThickness(2)
        setNumeratorColor('#6bb8ff')
        setNumeratorAlpha(90)
        setUnfilledColor('#DCDCDC')
        setUnfilledAlpha(55)
        setBorderColor('#333')
        setBorderAlpha(100)
        setGlobalHideLabel(false)
    }

    const parseHexColor = (hex) => {
        const normalized = hex.replace('#', '')
        return {
            r: parseInt(normalized.slice(0, 2), 16),
            g: parseInt(normalized.slice(2, 4), 16),
            b: parseInt(normalized.slice(4, 6), 16),
        }
    }

    const { r: nr, g: ng, b: nb } = parseHexColor(numeratorColor)
    const numeratorFill = `rgba(${nr}, ${ng}, ${nb}, ${numeratorAlpha / 100})`

    const { r: ur, g: ug, b: ub } = parseHexColor(unfilledColor)
    const unfilledFill = `rgba(${ur}, ${ug}, ${ub}, ${unfilledAlpha / 100})`

    const { r: br, g: bg, b: bb } = parseHexColor(borderColor)
    const borderFill = `rgba(${br}, ${bg}, ${bb}, ${borderAlpha / 100})`

    const tabs = [
        { id: 'visualizer', label: 'Visualizador' },
        { id: 'calculator', label: 'Calculadora' },
        { id: 'equivalent', label: 'Equivalentes' },
        { id: 'numberline', label: 'Reta Real' },
        { id: 'quiz', label: 'Quiz' },
    ]

    const renderPanel = () => {
        switch (activeTab) {
            case 'visualizer':
                return <Visualizer thickness={thickness} numeratorFill={numeratorFill} unfilledFill={unfilledFill} borderFill={borderFill} globalHideLabel={globalHideLabel} />
            case 'calculator':
                return <Calculator thickness={thickness} numeratorFill={numeratorFill} unfilledFill={unfilledFill} borderFill={borderFill} globalHideLabel={globalHideLabel} />
            case 'equivalent':
                return <Equivalent thickness={thickness} numeratorFill={numeratorFill} unfilledFill={unfilledFill} borderFill={borderFill} globalHideLabel={globalHideLabel} />
            case 'numberline':
                return <NumberLine thickness={thickness} numeratorFill={numeratorFill} unfilledFill={unfilledFill} borderFill={borderFill} globalHideLabel={globalHideLabel} />
            case 'quiz':
                return <Quiz thickness={thickness} numeratorFill={numeratorFill} unfilledFill={unfilledFill} borderFill={borderFill} globalHideLabel={globalHideLabel} />
            default:
                return null
        }
    }

    return (
        <div className="app-wrapper">
            <div className="app-header">
                <div className="header-content">
                    <h1>Frações</h1>
                    <p>Visualize, calcule e aprenda frações</p>
                </div>
            </div>
            <button className="fab-settings" onClick={() => setShowControls(true)} title="Opções">
                <span className="fab-icon">⚙️</span>
            </button>
            {showControls && (
                <div className="modal-overlay" onClick={() => setShowControls(false)}>
                    <div className="modal-controls" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Opções de Personalizacao</h2>
                            <button className="close-modal" onClick={() => setShowControls(false)} title="Fechar">×</button>
                        </div>
                        <div className="global-controls">
                            <button className="restore-btn" onClick={restoreDefaults}>Restaurar Padrões</button>
                            <div className="color-group">
                                <h4>Cor do Numerador (Preenchido)</h4>
                                <label>
                                    Cor: <input type="color" value={numeratorColor} onChange={e => setNumeratorColor(e.target.value)} />
                                </label>
                                <label>
                                    Opacidade: <input type="range" min="0" max="100" value={numeratorAlpha} onChange={e => setNumeratorAlpha(Number(e.target.value))} />
                                    {numeratorAlpha}%
                                </label>
                            </div>
                            <div className="color-group">
                                <h4>Cor da Parte Não Preenchida</h4>
                                <label>
                                    Cor: <input type="color" value={unfilledColor} onChange={e => setUnfilledColor(e.target.value)} />
                                </label>
                                <label>
                                    Opacidade: <input type="range" min="0" max="100" value={unfilledAlpha} onChange={e => setUnfilledAlpha(Number(e.target.value))} />
                                    {unfilledAlpha}%
                                </label>
                            </div>
                            <div className="color-group">
                                <h4>Borda & Espessura</h4>
                                <label>
                                    Cor: <input type="color" value={borderColor} onChange={e => setBorderColor(e.target.value)} />
                                </label>
                                <label>
                                    Opacidade: <input type="range" min="0" max="100" value={borderAlpha} onChange={e => setBorderAlpha(Number(e.target.value))} />
                                    {borderAlpha}%
                                </label>
                                <label>
                                    Espessura: <input type="range" min="1" max="10" value={thickness} onChange={e => setThickness(Number(e.target.value))} />
                                    {thickness}px
                                </label>
                            </div>
                            <label className="checkbox-label">
                                <input type="checkbox" checked={globalHideLabel} onChange={e => setGlobalHideLabel(e.target.checked)} />
                                Ocultar fração
                            </label>
                        </div>
                    </div>
                </div>
            )}
            <div className="tab-header">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="container">
                <div className="panel active">
                    {renderPanel()}
                </div>
            </div>
        </div>
    )
}