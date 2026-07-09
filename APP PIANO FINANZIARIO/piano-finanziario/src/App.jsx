import { useState, useEffect } from 'react'
import { supabase, CONTI, MESI, euro, fmtDate, nowYM } from './lib/supabase'
import { useData } from './lib/useData'
import Auth from './components/Auth'
import Onboarding from './components/Onboarding'
import Dashboard from './components/Dashboard'
import Entrate from './components/Entrate'
import Spese from './components/Spese'
import Conti from './components/Conti'
import Tasse from './components/Tasse'
import logoSrc from './assets/logo.png'

const TABS = [
  { id: 'dash', label: 'Dashboard' },
  { id: 'entrate', label: 'Entrate' },
  { id: 'spese', label: 'Spese' },
  { id: 'conti', label: 'Conti' },
  { id: 'tasse', label: '🧾 Tasse' },
]

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('dash')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { data, save, sync } = useData(user)

  useEffect(() => {
    // Handle email confirmation token in URL hash
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1))
      const at = params.get('access_token')
      const rt = params.get('refresh_token')
      if (at && rt) {
        supabase.auth.setSession({ access_token: at, refresh_token: rt }).then(() => {
          window.history.replaceState(null, '', window.location.pathname)
        })
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u && !localStorage.getItem('mpf_ob_' + u.id)) {
        setShowOnboarding(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const doLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setTab('dash')
  }

  const closeOnboarding = () => {
    setShowOnboarding(false)
    if (user) localStorage.setItem('mpf_ob_' + user.id, '1')
  }

  const doPDF = () => {
    const ym = nowYM()
    const [y, m] = ym.split('-')
    const thisMonthE = data.entrate.filter(e => e.date.startsWith(ym))
    const thisMonthS = data.spese.filter(s => s.date.startsWith(ym))
    const totE = thisMonthE.reduce((a, e) => a + parseFloat(e.amount || 0), 0)
    const totS = thisMonthS.reduce((a, s) => a + parseFloat(s.amount || 0), 0)

    const fis = data.fis || { co: 78, al: 5, inps: 26.23 }
    const venditeAnno = data.entrate.filter(e => e.cat === 'Vendita servizio/prodotto' && e.date.startsWith(y))
    const fatAnno = venditeAnno.reduce((a, e) => a + parseFloat(e.amount || 0), 0)
    const mesiConDati = new Set(venditeAnno.map(e => e.date.substring(0, 7))).size
    const imp = fatAnno * (fis.co / 100)
    const taxAvg = fatAnno && mesiConDati ? ((imp * fis.al / 100) + (imp * fis.inps / 100)) / mesiConDati : 0
    const net = Math.max(0, totE - totS - taxAvg)
    const mese = MESI[parseInt(m) - 1]

    let h = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><title>Riepilogo ${mese} ${y}</title>`
    h += `<style>body{font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#1a1a18;font-size:14px}`
    h += `h1{font-size:22px;font-weight:700;margin-bottom:4px}.sub{color:#6b6b66;font-size:13px;margin-bottom:28px}`
    h += `.st{font-size:15px;font-weight:700;border-bottom:2px solid #1a1a18;padding-bottom:6px;margin-bottom:14px;margin-top:20px}`
    h += `.row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:.5px solid #e0e0de;font-size:13px}`
    h += `.lbl{color:#6b6b66}.val{font-weight:600}`
    h += `.tot{display:flex;justify-content:space-between;background:#f5f5f3;border-radius:8px;padding:12px 14px;margin-top:8px;font-weight:700;font-size:15px}`
    h += `.pr{border-radius:8px;padding:10px 14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center}`
    h += `.ft{margin-top:40px;font-size:11px;color:#9a9a94;text-align:center;border-top:.5px solid #e0e0de;padding-top:16px}`
    h += `@media print{body{padding:20px}}</style></head><body>`
    h += `<h1>Riepilogo ${mese} ${y}</h1>`
    h += `<div class="sub">Il mio Piano Finanziario &middot; ${user?.email || ''}</div>`
    h += `<div class="st">Panoramica</div>`
    h += `<div class="row"><span class="lbl">Entrate totali</span><span class="val" style="color:#3b6d11">${euro(totE)}</span></div>`
    h += `<div class="row"><span class="lbl">Spese totali</span><span class="val" style="color:#a32d2d">${euro(totS)}</span></div>`
    h += `<div class="row"><span class="lbl">Tasse stimate</span><span class="val" style="color:#854f0b">${euro(taxAvg)}</span></div>`
    h += `<div class="tot"><span>Da distribuire</span><span>${euro(net)}</span></div>`
    h += `<div class="st">Le 6 destinazioni</div>`
    CONTI.forEach(c => {
      const a = net * c.pct / 100
      h += `<div class="pr" style="background:${c.color}18"><div><div style="font-weight:600">${c.icon} ${c.nome}</div><div style="font-size:12px;color:#6b6b66">${c.desc}</div></div><div style="text-align:right"><div style="font-size:18px;font-weight:700;color:${c.color}">${euro(a)}</div><div style="font-size:12px;color:#6b6b66">${c.pct}%</div></div></div>`
    })
    if (thisMonthE.length) {
      h += `<div class="st">Entrate</div>`
      thisMonthE.sort((a, b) => b.date.localeCompare(a.date)).forEach(e => {
        h += `<div class="row"><span class="lbl">${e.desc} <span style="font-size:11px;color:#9a9a94">${fmtDate(e.date)}</span></span><span class="val" style="color:#3b6d11">${euro(e.amount)}</span></div>`
      })
    }
    if (thisMonthS.length) {
      h += `<div class="st">Spese</div>`
      thisMonthS.sort((a, b) => b.date.localeCompare(a.date)).forEach(s => {
        h += `<div class="row"><span class="lbl">${s.desc} <span style="font-size:11px;color:#9a9a94">${fmtDate(s.date)}</span></span><span class="val" style="color:#a32d2d">${euro(s.amount)}</span></div>`
      })
    }
    h += `<div class="ft">Generato il ${new Date().toLocaleDateString('it-IT')} &middot; Il mio Piano Finanziario</div>`
    h += `<${'script'}>window.onload=function(){window.print();}</${'script'}></body></html>`

    const w = window.open('', '_blank')
    if (w) { w.document.write(h); w.document.close() }
    else alert('Abilita i popup per esportare il PDF.')
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text2)' }}>Caricamento...</div>
  if (!user) return <Auth />

  return (
    <>
      {showOnboarding && <Onboarding onClose={closeOnboarding} />}

      <header className="hdr">
        <div className="hdr-in">
          <div className="hdr-logo"><img src={logoSrc} alt="Logo EF" /></div>
          <div style={{ flex: 1 }}>
            <div className="hdr-title">Il mio Piano Finanziario</div>
            <div className="hdr-sub">Gestisci i tuoi soldi · costruisci il tuo patrimonio</div>
          </div>
          <div className="user-row">
            <span className="uemail">{user.email}</span>
            <span className="sync-badge">{sync}</span>
            <button className="btn-logout" onClick={doLogout}>Esci</button>
          </div>
        </div>
      </header>

      <div className="app-body">
        <div className="tabs">
          {TABS.map(t => (
            <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'dash' && <Dashboard data={data} save={save} user={user} onPDF={doPDF} />}
        {tab === 'entrate' && <Entrate data={data} save={save} />}
        {tab === 'spese' && <Spese data={data} save={save} />}
        {tab === 'conti' && <Conti data={data} save={save} />}
        {tab === 'tasse' && <Tasse data={data} save={save} />}
      </div>
    </>
  )
}
