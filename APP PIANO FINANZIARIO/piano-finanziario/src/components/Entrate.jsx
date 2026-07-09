import { useState } from 'react'
import { euro, fmtDate, today } from '../lib/supabase'

const CATS = ['Stipendio', 'Vendita servizio/prodotto', 'Freelance', 'Affitto percepito', 'Bonus', 'Altro']

export default function Entrate({ data, save }) {
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [date, setDate] = useState(today())
  const [cat, setCat] = useState('Stipendio')
  const [err, setErr] = useState('')

  const add = () => {
    if (!amount || parseFloat(amount) <= 0) { setErr('Inserisci un importo valido'); return }
    if (!date) { setErr('Inserisci la data'); return }
    const newData = {
      ...data,
      entrate: [...data.entrate, { id: Date.now(), amount: parseFloat(amount), desc: desc || cat, date, cat }],
    }
    save(newData)
    setAmount(''); setDesc(''); setErr('')
  }

  const del = (id) => {
    save({ ...data, entrate: data.entrate.filter(e => e.id !== id) })
  }

  const sorted = [...data.entrate].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div>
      <div className="card">
        <div className="card-title">Aggiungi entrata</div>
        {err && <div className="alert alert-warn" style={{ marginBottom: 12 }}>{err}</div>}
        <div className="form-group">
          <label>Importo (€)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1200" min="0" step="0.01" />
        </div>
        <div className="form-group">
          <label>Descrizione</label>
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Stipendio, servizio, vendita..." />
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label>Data</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Categoria</label>
            <select value={cat} onChange={e => setCat(e.target.value)}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={add}>+ Aggiungi entrata</button>
      </div>

      <div className="card">
        <div className="card-title">Storico entrate</div>
        {sorted.length === 0
          ? <div className="empty">Nessuna entrata registrata.</div>
          : sorted.map(e => (
            <div key={e.id} className="li">
              <div className="li-info">
                <div className="li-name">{e.desc}</div>
                <div className="li-meta">{fmtDate(e.date)} · <span className="badge badge-in">{e.cat}</span></div>
              </div>
              <div className="li-right">
                <div style={{ fontSize: 16, fontWeight: 600, color: '#3b6d11' }}>{euro(e.amount)}</div>
                <button className="btn btn-sm btn-danger" onClick={() => del(e.id)} style={{ marginTop: 4 }}>elimina</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
