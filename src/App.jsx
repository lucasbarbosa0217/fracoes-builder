import React, { useState, Suspense } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'

const Visualizer = React.lazy(() => import('./components/Visualizer'))
const Calculator = React.lazy(() => import('./components/Calculator'))
const Equivalent = React.lazy(() => import('./components/Equivalent'))
const NumberLine = React.lazy(() => import('./components/NumberLine'))
const Quiz = React.lazy(() => import('./components/Quiz'))

export default function App() {
    const [thickness, setThickness] = useState(2)
    const [numeratorColor, setNumeratorColor] = useState('#6bb8ff')
    const [numeratorAlpha, setNumeratorAlpha] = useState(90)
    const [unfilledColor, setUnfilledColor] = useState('#DCDCDC')
    const [unfilledAlpha, setUnfilledAlpha] = useState(55)
    const [borderColor, setBorderColor] = useState('#353535')
    const [borderAlpha, setBorderAlpha] = useState(100)
    const [globalHideLabel, setGlobalHideLabel] = useState(false)
    const [showControls, setShowControls] = useState(false)
    const location = useLocation()

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
        { id: 'visualizer', label: 'Visualizador', path: '/' },
        { id: 'calculator', label: 'Calculadora', path: '/calculator' },
        { id: 'equivalent', label: 'Equivalentes', path: '/equivalent' },
        { id: 'numberline', label: 'Reta Real', path: '/numberline' },
        { id: 'quiz', label: 'Quiz', path: '/quiz' },
    ]

    const getCurrentTab = () => {
        const path = location.pathname
        return tabs.find(t => t.path === path)?.id || 'visualizer'
    }

    const sharedProps = { 
        thickness, 
        numeratorFill, 
        unfilledFill, 
        borderFill, 
        globalHideLabel 
    }

    return (
        <div className="app-wrapper">
            <div className="app-header">
                <div className="header-content">
                    <h1>Frações</h1>
                    <p>Visualize, calcule e aprenda frações</p>
                </div>
            </div>
            <button 
                className="fab-settings" 
                onClick={() => setShowControls(true)} 
                title="Opções de personalização"
                aria-label="Abrir opções de personalização"
            >
                <span className="fab-icon" aria-hidden="true">⚙️</span>
            </button>
            {showControls && (
                <div 
                    className="modal-overlay" 
                    onClick={() => setShowControls(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div className="modal-controls" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 id="modal-title">Opções de Personalização</h2>
                            <button 
                                className="close-modal" 
                                onClick={() => setShowControls(false)} 
                                title="Fechar"
                                aria-label="Fechar opções"
                            >
                                ×
                            </button>
                        </div>
                        <div className="global-controls">
                            <button 
                                className="restore-btn" 
                                onClick={restoreDefaults}
                                aria-label="Restaurar configurações padrão"
                            >
                                Restaurar Padrões
                            </button>
                            <div className="color-group">
                                <h4>Cor do Numerador (Preenchido)</h4>
                                <label htmlFor="numerator-color">
                                    Cor: <input 
                                        id="numerator-color"
                                        type="color" 
                                        value={numeratorColor} 
                                        onChange={e => setNumeratorColor(e.target.value)}
                                        aria-label="Cor do numerador"
                                    />
                                </label>
                                <label htmlFor="numerator-alpha">
                                    Opacidade: <input 
                                        id="numerator-alpha"
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={numeratorAlpha} 
                                        onChange={e => setNumeratorAlpha(Number(e.target.value))}
                                        aria-label="Opacidade do numerador"
                                    />
                                    {numeratorAlpha}%
                                </label>
                            </div>
                            <div className="color-group">
                                <h4>Cor da Parte Não Preenchida</h4>
                                <label htmlFor="unfilled-color">
                                    Cor: <input 
                                        id="unfilled-color"
                                        type="color" 
                                        value={unfilledColor} 
                                        onChange={e => setUnfilledColor(e.target.value)}
                                        aria-label="Cor da parte não preenchida"
                                    />
                                </label>
                                <label htmlFor="unfilled-alpha">
                                    Opacidade: <input 
                                        id="unfilled-alpha"
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={unfilledAlpha} 
                                        onChange={e => setUnfilledAlpha(Number(e.target.value))}
                                        aria-label="Opacidade da parte não preenchida"
                                    />
                                    {unfilledAlpha}%
                                </label>
                            </div>
                            <div className="color-group">
                                <h4>Borda &amp; Espessura</h4>
                                <label htmlFor="border-color">
                                    Cor: <input 
                                        id="border-color"
                                        type="color" 
                                        value={borderColor} 
                                        onChange={e => setBorderColor(e.target.value)}
                                        aria-label="Cor da borda"
                                    />
                                </label>
                                <label htmlFor="border-alpha">
                                    Opacidade: <input 
                                        id="border-alpha"
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={borderAlpha} 
                                        onChange={e => setBorderAlpha(Number(e.target.value))}
                                        aria-label="Opacidade da borda"
                                    />
                                    {borderAlpha}%
                                </label>
                                <label htmlFor="thickness">
                                    Espessura: <input 
                                        id="thickness"
                                        type="range" 
                                        min="1" 
                                        max="10" 
                                        value={thickness} 
                                        onChange={e => setThickness(Number(e.target.value))}
                                        aria-label="Espessura da borda"
                                    />
                                    {thickness}px
                                </label>
                            </div>
                            <label className="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    checked={globalHideLabel} 
                                    onChange={e => setGlobalHideLabel(e.target.checked)}
                                    aria-label="Ocultar fração"
                                />
                                Ocultar fração
                            </label>
                        </div>
                    </div>
                </div>
            )}
            <nav className="tab-header" role="tablist" aria-label="Navegação principal">
                {tabs.map(tab => (
                    <NavLink
                        key={tab.id}
                        to={tab.path}
                        className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
                        role="tab"
                        aria-selected={getCurrentTab() === tab.id}
                        aria-current={getCurrentTab() === tab.id ? 'page' : undefined}
                    >
                        {tab.label}
                    </NavLink>
                ))}
            </nav>
            <div className="container">
                <main id="main" className="panel active" role="main">
                    <Suspense fallback={<div className="loading-state">Carregando...</div>}>
                        <Routes>
                            <Route path="/" element={<Visualizer {...sharedProps} />} />
                            <Route path="/calculator" element={<Calculator {...sharedProps} />} />
                            <Route path="/equivalent" element={<Equivalent {...sharedProps} />} />
                            <Route path="/numberline" element={<NumberLine {...sharedProps} />} />
                            <Route path="/quiz" element={<Quiz {...sharedProps} />} />
                        </Routes>
                    </Suspense>
                </main>
            </div>
        </div>
    )
}
