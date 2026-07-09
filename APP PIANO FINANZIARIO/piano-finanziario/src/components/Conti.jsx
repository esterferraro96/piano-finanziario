import { CONTI, euro, nowYM } from '../lib/supabase'

export default function Conti({ data, save }) {
  const ym = nowYM()
  const thisMonthE = data.entrate.filter(e => e.date.startsWith(ym))
  const thisMonthS = data.spese.filter(s => s.date.startsWith(ym))
  const totE = thisMonthE.reduce((a, e) => a + parseFloat(e.amount || 0), 0)
  const totS = thisMonthS.reduce((a, s) => a + parseFloat(s.amount || 0), 0)

  // Tax avg
  const y = new Date().getFullYear().toString()
  const vendite = data.entrate.filter(e => e.cat === 'Vendita servizio/prodotto' && e.date.startsWith(y))
  const fat = vendite.reduce((a, e) => a + parseFloat(e.amount || 0), 0)
  const mesi = new Set(vendite.map(e => e.date.substring(0, 7))).size
  const fis = data.fis || { co: 78, al: 5, inps: 26.23 }
  const taxAvg = fat && mesi ? (() => { const imp = fat * (fis.co / 100); return ((imp * fis.al / 100) + (imp * fis.inps / 100)) / mesi })() : 0

  const net = Math.max(0, totE - totS - taxAvg)
  const total = Object.values(data.saldi).reduce((a, v) => a + parseFloat(v || 0), 0)
  const goal = data.goal || 1000000
  const pct = Math.min(100, (total / goal) * 100)

  const updateSaldo = (id, val) => {
    save({ ...data, saldi: { ...data.saldi, [id]: parseFloat(val) || 0 } })
  }

  const updateGoal = (val) => {
    save({ ...data, goal: parseFloat(val) || 1000000 })
  }

  return (
    <div>
      <div className="card">
        <div className="section-title">Le mie 6 destinazioni 💰</div>
        <div className="section-sub">Aggiorna il saldo accumulato su ogni conto per monitorare il tuo progresso.</div>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>
          Da distribuire: <strong>{euro(net)}</strong> ({euro(totE)} entrate − {euro(totS)} spese − {euro(taxAvg)} tasse stimate)
        </p>
        {CONTI.map(c => {
          const tgt = net * c.pct / 100
          const sal = parseFloat(data.saldi[c.id] || 0)
          return (
            <div key={c.id} className="crow">
              <div className="crow-hdr">
                <span className="crow-icon">{c.icon}</span>
                <div className="crow-info">
                  <div className="crow-name">{c.nome}</div>
                  <div className="crow-desc">{c.desc}</div>
                </div>
                <div className="crow-amt">
                  <div className="crow-amt-val" style={{ color: c.color }}>{euro(tgt)}/mese</div>
                  <div className="crow-pct">{c.pct}%</div>
                </div>
              </div>
              <div className="sir">
                <label>Saldo (€)</label>
                <input type="number" defaultValue={sal} min="0" style={{ maxWidth: 130 }} onChange={e => updateSaldo(c.id, e.target.value)} />
                <span style={{ fontSize: 14, fontWeight: 600, color: c.color, marginLeft: 'auto' }}>{euro(sal)}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card">
        <div className="section-title">Il mio obiettivo 🚀</div>
        <div className="section-sub">Non è quanto metti, è il gesto costante che costruisce il patrimonio.</div>
        <div className="form-group">
          <label>Il mio obiettivo (€)</label>
          <input type="number" defaultValue={data.goal || 1000000} min="0" onChange={e => updateGoal(e.target.value)} />
        </div>
        <div className="goal-row">
          <span>Totale risparmiato: <strong>{euro(total)}</strong></span>
          <span style={{ fontWeight: 600 }}>{pct.toFixed(3)}%</span>
        </div>
        <div className="pbar" style={{ height: 10 }}>
          <div className="pfill" style={{ width: `${pct}%`, background: '#1d9e75' }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>
          Mancano {euro(Math.max(0, goal - total))} all&apos;obiettivo
        </div>
      </div>
    </div>
  )
}
