import { euro, fmtDate, MESI, weekRange } from '../lib/supabase'

function calcFis(fat, fis) {
  const imp = fat * (fis.co / 100)
  const tx = imp * (fis.al / 100)
  const ins = imp * (fis.inps / 100)
  return { imp, tx, ins, tot: tx + ins }
}

export default function Tasse({ data, save }) {
  const fis = data.fis || { reg: 'f5', co: 78, al: 5, inps: 26.23 }
  const taxSal = parseFloat(data.taxSal || 0)

  const updateFis = (field, val) => {
    save({ ...data, fis: { ...fis, [field]: field === 'reg' ? val : parseFloat(val) || 0 } })
  }
  const updateTaxSal = (val) => {
    save({ ...data, taxSal: parseFloat(val) || 0 })
  }

  // Weekly
  const { dal, al } = weekRange()
  const wE = data.entrate.filter(e => e.cat === 'Vendita servizio/prodotto' && e.date >= dal && e.date <= al)
  const wTot = wE.reduce((a, e) => a + parseFloat(e.amount || 0), 0)
  const wC = calcFis(wTot, fis)

  // Monthly / Annual
  const now = new Date()
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const y = now.getFullYear().toString()
  const mE = data.entrate.filter(e => e.cat === 'Vendita servizio/prodotto' && e.date.startsWith(ym)).reduce((a, e) => a + parseFloat(e.amount || 0), 0)
  const aE = data.entrate.filter(e => e.cat === 'Vendita servizio/prodotto' && e.date.startsWith(y)).reduce((a, e) => a + parseFloat(e.amount || 0), 0)
  const mC = calcFis(mE, fis)
  const aC = calcFis(aE, fis)

  const diff = taxSal - aC.tot
  const salPct = aC.tot > 0 ? Math.min(100, (taxSal / aC.tot) * 100) : 0

  return (
    <div>
      <div className="card">
        <div className="card-title">⚙️ Impostazioni fiscali</div>
        <div className="section-sub">Aggiorna i valori dopo aver parlato con il tuo commercialista.</div>
        <div className="grid-2">
          <div className="form-group">
            <label>Regime fiscale</label>
            <select value={fis.reg} onChange={e => updateFis('reg', e.target.value)}>
              <option value="f5">Forfettario 5%</option>
              <option value="f15">Forfettario 15%</option>
              <option value="ord">Regime ordinario</option>
            </select>
          </div>
          <div className="form-group">
            <label>Coefficiente forfettario (%)</label>
            <input type="number" value={fis.co} min="1" max="100" onChange={e => updateFis('co', e.target.value)} />
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label>Aliquota imposta (%)</label>
            <input type="number" value={fis.al} min="0" max="50" step="0.1" onChange={e => updateFis('al', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Aliquota INPS (%)</label>
            <input type="number" value={fis.inps} min="0" max="40" step="0.01" onChange={e => updateFis('inps', e.target.value)} />
          </div>
        </div>
        <div className="alert alert-info" style={{ fontSize: 12 }}>
          💡 <strong>Forfettario:</strong> imposta su (fatturato × coeff%). Es: €10.000 → imponibile €7.800 → tasse €390 (5%).
        </div>
      </div>

      <div className="card">
        <div className="card-title">📅 Riepilogo settimanale</div>
        <div className="section-sub">Vendite servizio/prodotto degli ultimi 7 giorni.</div>
        {wTot === 0
          ? <div className="empty">Nessuna vendita negli ultimi 7 giorni.</div>
          : <>
            <div style={{ background: 'var(--bg2)', borderRadius: 'var(--r)', padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{fmtDate(dal)} → {fmtDate(al)}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#3b6d11' }}>{euro(wTot)}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{wE.length} vendita/e</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div style={{ background: 'var(--bg2)', borderRadius: 'var(--r)', padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 4 }}>Imponibile</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{euro(wC.imp)}</div>
              </div>
              <div style={{ background: '#faeeda', borderRadius: 'var(--r)', padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#854f0b', textTransform: 'uppercase', marginBottom: 4 }}>Tasse</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#854f0b' }}>{euro(wC.tx)}</div>
              </div>
              <div style={{ background: '#e6f1fb', borderRadius: 'var(--r)', padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#185fa5', textTransform: 'uppercase', marginBottom: 4 }}>INPS</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#185fa5' }}>{euro(wC.ins)}</div>
              </div>
            </div>
            <div style={{ background: '#fcebeb', borderRadius: 'var(--r)', padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: '#a32d2d', fontWeight: 600 }}>DA ACCANTONARE</div>
                <div style={{ fontSize: 12, color: '#a32d2d' }}>tasse + INPS</div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#a32d2d' }}>{euro(wC.tot)}</div>
            </div>
            {wE.map(e => (
              <div key={e.id} className="li">
                <div className="li-info">
                  <div className="li-name">{e.desc}</div>
                  <div className="li-meta">{fmtDate(e.date)}</div>
                </div>
                <div className="li-right">
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#3b6d11' }}>{euro(e.amount)}</div>
                  <div style={{ fontSize: 11, color: '#a32d2d' }}>accantona {euro(calcFis(parseFloat(e.amount), fis).tot)}</div>
                </div>
              </div>
            ))}
          </>
        }
      </div>

      <div className="card">
        <div className="card-title">📊 Riepilogo mensile e annuale</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div style={{ background: 'var(--bg2)', borderRadius: 'var(--r)', padding: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 6 }}>{MESI[now.getMonth()]} {y}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#3b6d11' }}>{euro(mE)}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>Accantona: <strong style={{ color: '#a32d2d' }}>{euro(mC.tot)}</strong></div>
          </div>
          <div style={{ background: 'var(--bg2)', borderRadius: 'var(--r)', padding: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 6 }}>Anno {y}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#3b6d11' }}>{euro(aE)}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>Accantona: <strong style={{ color: '#a32d2d' }}>{euro(aC.tot)}</strong></div>
          </div>
        </div>
        <div className="tax-table">
          <div className="tax-row"><span>Voce</span><span>Mese</span><span>Anno</span><span>%</span></div>
          <div className="tax-row"><span>Fatturato</span><span>{euro(mE)}</span><span>{euro(aE)}</span><span>100%</span></div>
          <div className="tax-row"><span>Imponibile</span><span>{euro(mC.imp)}</span><span>{euro(aC.imp)}</span><span>{fis.co}%</span></div>
          <div className="tax-row" style={{ color: '#854f0b' }}><span>Tasse</span><span>{euro(mC.tx)}</span><span>{euro(aC.tx)}</span><span>{fis.al}%</span></div>
          <div className="tax-row" style={{ color: '#185fa5' }}><span>INPS</span><span>{euro(mC.ins)}</span><span>{euro(aC.ins)}</span><span>{fis.inps}%</span></div>
          <div className="tax-row" style={{ fontWeight: 600, color: '#a32d2d' }}><span>Totale</span><span>{euro(mC.tot)}</span><span>{euro(aC.tot)}</span><span>—</span></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">🏦 Accantonamento tasse</div>
        <div className="sir" style={{ marginBottom: 16 }}>
          <label>Saldo accantonato (€)</label>
          <input type="number" defaultValue={taxSal} min="0" style={{ maxWidth: 160 }} onChange={e => updateTaxSal(e.target.value)} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#ba7517', marginLeft: 'auto' }}>{euro(taxSal)}</span>
        </div>
        <div className="goal-row">
          <span style={{ color: 'var(--text2)' }}>Dovuto {y}: <strong style={{ color: 'var(--text)' }}>{euro(aC.tot)}</strong></span>
          <span style={{ fontWeight: 600, color: diff >= 0 ? '#3b6d11' : '#a32d2d' }}>
            {diff >= 0 ? '✅ Coperto' : `⚠️ Mancano ${euro(Math.abs(diff))}`}
          </span>
        </div>
        <div className="pbar" style={{ height: 10 }}>
          <div className="pfill" style={{ width: `${salPct}%`, background: diff >= 0 ? '#639922' : '#e24b4a' }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>{salPct.toFixed(1)}% accantonato</div>
      </div>
    </div>
  )
}
