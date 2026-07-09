import { useState } from 'react'
import { supabase } from '../lib/supabase'
import logoSrc from '../assets/logo.png'

export default function Auth() {
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [loading, setLoading] = useState(false)

  const clearMsgs = () => { setErr(''); setOk('') }

  const doLogin = async () => {
    clearMsgs()
    if (!email || !password) { setErr('Inserisci email e password'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setErr('Email o password errati. Riprova.')
  }

  const doRegister = async () => {
    clearMsgs()
    if (!email || !password) { setErr('Inserisci tutti i campi'); return }
    if (password.length < 6) { setErr('Password minimo 6 caratteri'); return }
    if (password !== password2) { setErr('Le password non coincidono'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) setErr('Errore: ' + error.message)
    else setOk('✅ Account creato! Controlla la tua email per confermare.')
  }

  const doReset = async () => {
    clearMsgs()
    if (!email) { setErr('Inserisci prima la tua email'); return }
    await supabase.auth.resetPasswordForEmail(email)
    setOk('✅ Email di reset inviata!')
  }

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-logo">
          <img src={logoSrc} alt="Logo EF" />
        </div>
        <div className="auth-title">Il mio Piano Finanziario</div>
        <div className="auth-sub">Gestisci i tuoi soldi · costruisci il tuo patrimonio</div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); clearMsgs() }}>Accedi</button>
          <button className={`auth-tab ${tab === 'reg' ? 'active' : ''}`} onClick={() => { setTab('reg'); clearMsgs() }}>Registrati</button>
        </div>

        {err && <div className="auth-msg auth-err">{err}</div>}
        {ok && <div className="auth-msg auth-ok">{ok}</div>}

        {tab === 'login' ? (
          <div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tuaemail@gmail.com" onKeyDown={e => e.key === 'Enter' && doLogin()} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && doLogin()} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} onClick={doLogin} disabled={loading}>
              {loading ? 'Accesso...' : 'Accedi →'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--text2)', cursor: 'pointer', textDecoration: 'underline' }} onClick={doReset}>
                Password dimenticata?
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tuaemail@gmail.com" />
            </div>
            <div className="form-group">
              <label>Password (min. 6 caratteri)</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label>Conferma password</label>
              <input type="password" value={password2} onChange={e => setPassword2(e.target.value)} placeholder="••••••••" />
            </div>
            <button className="btn btn-green" style={{ width: '100%', marginTop: 4 }} onClick={doRegister} disabled={loading}>
              {loading ? 'Creazione...' : 'Crea account →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
