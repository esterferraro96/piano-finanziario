import { useState } from 'react'
import logoSrc from '../assets/logo.png'

export default function Onboarding({ onClose }) {
  const [step, setStep] = useState(1)

  return (
    <div className="ob-overlay">
      <div className="ob-box">
        {step === 1 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{ width: 76, height: 76, borderRadius: '50%', background: '#1a1a1a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #333' }}>
                <img src={logoSrc} style={{ width: 64, height: 64, objectFit: 'contain' }} alt="Logo" />
              </div>
            </div>
            <div className="ob-title">Il mio Piano Finanziario</div>
            <div className="ob-sub">La tua app personale per dare un nome a ogni euro che guadagni — costruisci il tuo futuro un passo alla volta.</div>
            <div className="ob-dots">
              <div className="ob-dot active" /><div className="ob-dot" /><div className="ob-dot" />
            </div>
            <div className="ob-row">
              <button className="btn btn-primary" style={{ flex: 1, background: 'var(--gold)', color: '#0a0a0a', border: 'none' }} onClick={() => setStep(2)}>Inizia →</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="ob-title">Le 6 destinazioni del tuo denaro</div>
            <div className="ob-sub">Ogni settimana distribuisci il reddito sulle 6 aree. Anche con poco, l'abitudine fa la differenza.</div>
            <div className="ob-grid">
              <div className="ob-p" style={{ background: '#1a2a3a', color: '#7ab4e8' }}><strong>🏠 Conto Personale</strong><br />60%</div>
              <div className="ob-p" style={{ background: '#1a2e1a', color: '#7dc47d' }}><strong>🛡️ SalvaImprevisti</strong><br />10%</div>
              <div className="ob-p" style={{ background: '#2e2410', color: '#c9a050' }}><strong>📚 Formazione</strong><br />5%</div>
              <div className="ob-p" style={{ background: '#2e1a22', color: '#e08fae' }}><strong>🎉 Svago</strong><br />10%</div>
              <div className="ob-p" style={{ background: '#1e1a2e', color: '#a89de8' }}><strong>❤️ Donazioni</strong><br />5%</div>
              <div className="ob-p" style={{ background: '#0e2420', color: '#5dcaa5' }}><strong>🚀 Fondo Investimenti</strong><br />10%</div>
            </div>
            <div className="ob-dots">
              <div className="ob-dot" /><div className="ob-dot active" /><div className="ob-dot" />
            </div>
            <div className="ob-row">
              <button className="btn" style={{ flex: 1, background: '#1a1a1a', color: '#9a9a94', borderColor: '#333' }} onClick={() => setStep(1)}>← Indietro</button>
              <button className="btn btn-primary" style={{ flex: 1, background: 'var(--gold)', color: '#0a0a0a', border: 'none' }} onClick={() => setStep(3)}>Avanti →</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="ob-title">Pronta a iniziare? 🚀</div>
            <div className="ob-sub">Non serve avere tanto. Ogni domenica apri l'app, guarda quanto hai guadagnato e distribuisci in un colpo solo. Semplice, concreto, motivante.</div>
            <div className="ob-dots">
              <div className="ob-dot" /><div className="ob-dot" /><div className="ob-dot active" />
            </div>
            <div className="ob-row">
              <button className="btn" style={{ flex: 1, background: '#1a1a1a', color: '#9a9a94', borderColor: '#333' }} onClick={() => setStep(2)}>← Indietro</button>
              <button className="btn" style={{ flex: 1, background: '#1d9e75', color: '#fff', border: 'none' }} onClick={onClose}>Inizia ✓</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
