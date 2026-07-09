import { useState } from 'react'
import { euro, fmtDate, today } from '../lib/supabase'

const CATS = ['Affitto / Mutuo','Bollette','Assicurazioni','Rate / Finanziamenti','Spesa alimentare','Benzina / Trasporti','Abbonamenti','Salute','Svago','Abbigliamento','Ristorante / Bar','Altro']

export default function Spese({ data, save }) {
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [date, setDate] = useState(today())
  const [tipo, setTipo] = useState('fissa')
  const [cat, setCat] = useState('Affitto / Mutuo')
  const [err, setErr] = useState('')

  const add = () => {
    if (!amount || parseFloat(amount) <= 0) { setErr('Inserisci un importo valido'); return }
    if (!date) { setErr('Inserisci la data'); return }
    const newData = {
      ...data,
      spese: [...data.spese, { id: Date.now(), amount: parseFloat(amount), desc: desc || cat, date, tipo, cat }],
    }
    save(newData)
    setAmount(''); setDesc(''); setErr('')
  }

  const del = (id) => {
    save({ ...data, spese: data.spese.filter(s => s.id !== id) })
  }

  const sorted = [...data.spese].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div>
      <div className="card">
        <div className="card-title">Aggiungi spesa</div>
        {err && <div className="alert alert-warn" style={{ marginBottom: 12 }}>{err}</div>}
        <div className="form-group">
          <label>Importo (€)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="80" min="0" step="0.01" />
        </div>
        <div className="form-group">
          <label>Descrizione</label>
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Bolletta, rata, spesa..." />
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label>Data</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Tipo</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)}>
              <option value="fissa">Spesa fissa 🔒</option>
              <option value="variabile">Spesa variabile</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Categoria</label>
          <select value={cat} onChange={e => setCat(e.target.value)}>
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={add}>+ Aggiungi spesa</button>
      </div>

      <div className="card">
        <div className="card-title">Storico spese</div>
        {sorted.length === 0
          ? <div className="empty">Nessuna spesa registrata.</div>
          : sorted.map(s => (
            <div key={s.id} className="li">
              <div className="li-info">
                <div className="li-name">{s.desc}</div>
                <div className="li-meta">{fmtDate(s.date)} · {s.cat}</div>
              </div>
              <div className="li-right">
                <span className={`badge ${s.tipo === 'fissa' ? 'badge-fisso' : 'badge-var'}`}>{s.tipo}</span>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#a32d2d', marginTop: 4 }}>{euro(s.amount)}</div>
                <button className="btn btn-sm btn-danger" onClick={() => del(s.id)} style={{ marginTop: 4 }}>elimina</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
