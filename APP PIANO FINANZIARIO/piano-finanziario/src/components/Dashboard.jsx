import { useMemo, useState } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler, Tooltip, Legend } from 'chart.js'
import { CONTI, MESI, COLORS, euro, fmtDate, nowYM, weekRange } from '../lib/supabase'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler, Tooltip, Legend)

function calcTaxAvg(data) {
  const y = new Date().getFullYear().toString()
  const vendite = data.entrate.filter(e => e.cat === 'Vendita servizio/prodotto' && e.date.startsWith(y))
  const fat = vendite.reduce((a, e) => a + parseFloat(e.amount || 0), 0)
  const mesi = new Set(vendite.map(e => e.date.substring(0, 7))).size
  if (!fat || !mesi) return 0
  const fis = data.fis || { co: 78, al: 5, inps: 26.23 }
  const imp = fat * (fis.co / 100)
  return ((imp * fis.al / 100) + (imp * fis.inps / 100)) / mesi
}

function WeeklyCard({ data, save, user }) {
  const { dal, al } = weekRange()
  const wE = data.entrate.filter(e => e.date >= dal && e.date <= al)
  const wS = data.spese.filter(s => s.date >= dal && s.date <= al)
  const wTotE = wE.reduce((a, e) => a + parseFloat(e.amount || 0), 0)
  const wTotS = wS.reduce((a, s) => a + parseFloat(s.amount || 0), 0)
  const taxAvg = calcTaxAvg(data)
  const taxSett = taxAvg / 4.33
  const wNet = Math.max(0, wTotE - wTotS - taxSett)

  const key = `mpf_wk_${user?.id}_${dal}`
  const [done, setDone] = useState(!!localStorage.getItem(key))

  const markDone = () => {
    localStorage.setItem(key, '1')
    setDone(true)
  }

  return (
    <div className="card" style={{ border: '1.5px solid #1d9e75' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>📅 Distribuzione settimanale</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{fmtDate(dal)} — {fmtDate(al)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#3b6d11' }}>{euro(wNet)}</div>
          <div style={{ fontSize: 11, color: 'var(--text2)' }}>da distribuire</div>
        </div>
      </div>

      <div className="week-breakdown">
        <div className="week-box">
          <div className="week-box-label">Entrate</div>
          <div className="week-box-val" style={{ color: '#3b6d11' }}>{euro(wTotE)}</div>
        </div>
        <div className="week-box">
          <div className="week-box-label">Spese</div>
          <div className="week-box-val" style={{ color: '#a32d2d' }}>{euro(wTotS)}</div>
        </div>
        <div className="week-box">
          <div className="week-box-label">Tasse est.</div>
          <div className="week-box-val" style={{ color: '#854f0b' }}>{euro(taxSett)}</div>
        </div>
      </div>

      {wNet === 0 ? (
        <div className="empty" style={{ padding: '12px 0' }}>Nessun importo da distribuire questa settimana.</div>
      ) : (
        <div>
          {CONTI.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{c.nome}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>{c.pct}%</div>
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: c.color }}>{euro(wNet * c.pct / 100)}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        {wNet > 0 && (done
          ? <div className="alert alert-ok">✅ Hai già distribuito questa settimana! Ottimo lavoro 💪</div>
          : <button className="btn btn-green" style={{ width: '100%' }} onClick={markDone}>✓ Ho distribuito questa settimana</button>
        )}
      </div>
    </div>
  )
}

export default function Dashboard({ data, save, user, onPDF }) {
  const ym = nowYM()
  const [y, m] = ym.split('-')

  const thisMonthE = data.entrate.filter(e => e.date.startsWith(ym))
  const thisMonthS = data.spese.filter(s => s.date.startsWith(ym))
  const totE = thisMonthE.reduce((a, e) => a + parseFloat(e.amount || 0), 0)
  const totS = thisMonthS.reduce((a, s) => a + parseFloat(s.amount || 0), 0)
  const taxAvg = calcTaxAvg(data)
  const net = Math.max(0, totE - totS - taxAvg)

  // Chart data: spese per categoria
  const catMap = {}
  thisMonthS.forEach(s => { catMap[s.cat] = (catMap[s.cat] || 0) + parseFloat(s.amount || 0) })
  const catLabels = Object.keys(catMap)
  const catVals = Object.values(catMap)

  // Trend ultimi 6 mesi
  const now = new Date()
  const tLabels = [], tE = [], tS = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const ym2 = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    tLabels.push(MESI[d.getMonth()].slice(0, 3))
    tE.push(data.entrate.filter(e => e.date.startsWith(ym2)).reduce((a, e) => a + parseFloat(e.amount || 0), 0))
    tS.push(data.spese.filter(s => s.date.startsWith(ym2)).reduce((a, s) => a + parseFloat(s.amount || 0), 0))
  }

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: i => euro(i.raw) } } },
    scales: {
      x: { ticks: { color: '#6b6b66', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.06)' } },
      y: { ticks: { color: '#6b6b66', callback: v => euro(v) }, grid: { color: 'rgba(0,0,0,0.06)' } },
    },
  }

  return (
    <div>
      <div className="month-label">{MESI[parseInt(m) - 1]} {y}</div>

      <div className="metrics">
        <div className="metric">
          <div className="metric-label">Entrate</div>
          <div className="metric-value" style={{ color: '#3b6d11' }}>{euro(totE)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Totale spese</div>
          <div className="metric-value" style={{ color: '#a32d2d' }}>{euro(totS)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Entrate - Spese</div>
          <div className="metric-value">{euro(Math.max(0, totE - totS))}</div>
        </div>
      </div>

      <div className="metrics-2">
        <div className="metric">
          <div className="metric-label">Tasse stimate/mese</div>
          <div className="metric-value" style={{ color: '#854f0b' }}>{euro(taxAvg)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Da distribuire</div>
          <div className="metric-value" style={{ color: '#1d9e75' }}>{euro(net)}</div>
        </div>
      </div>

      {totE === 0
        ? <div className="alert alert-info">👋 Aggiungi le tue entrate del mese per vedere la distribuzione.</div>
        : net <= 0
          ? <div className="alert alert-warn">⚠️ Spese e tasse superano le entrate. Rivedi i tuoi costi.</div>
          : <div className="alert alert-ok">✅ {euro(net)} da distribuire sulle 6 destinazioni questo mese.</div>
      }

      <WeeklyCard data={data} save={save} user={user} />

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Distribuzione mensile</div>
          <button className="btn btn-sm btn-green" onClick={onPDF}>⬇ PDF</button>
        </div>
        {CONTI.map(c => (
          <div key={c.id} className="crow">
            <div className="crow-hdr">
              <span className="crow-icon">{c.icon}</span>
              <div className="crow-info">
                <div className="crow-name">{c.nome}</div>
                <div className="crow-desc">{c.desc}</div>
              </div>
              <div className="crow-amt">
                <div className="crow-amt-val" style={{ color: c.color }}>{euro(net * c.pct / 100)}</div>
                <div className="crow-pct">{c.pct}% del netto</div>
              </div>
            </div>
            <div className="pbar">
              <div className="pfill" style={{ width: `${c.pct}%`, background: c.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Dove spendo di più</div>
        <div className="chart-wrap" style={{ height: 220 }}>
          <Bar
            data={{
              labels: catLabels.length ? catLabels : ['Nessuna spesa'],
              datasets: [{ data: catVals.length ? catVals : [0], backgroundColor: COLORS.slice(0, Math.max(catLabels.length, 1)), borderRadius: 5, borderSkipped: false }],
            }}
            options={chartOpts}
          />
        </div>
        <div className="legend">
          {catLabels.map((l, i) => (
            <span key={l} className="legend-item">
              <span className="legend-dot" style={{ background: COLORS[i] }} />
              {l}: {euro(catVals[i])}
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Andamento ultimi 6 mesi</div>
        <div className="legend" style={{ marginBottom: 10 }}>
          <span className="legend-item"><span className="legend-dot" style={{ background: '#639922' }} />Entrate</span>
          <span className="legend-item"><span className="legend-dot" style={{ background: '#e24b4a' }} />Spese</span>
        </div>
        <div className="chart-wrap" style={{ height: 200 }}>
          <Line
            data={{
              labels: tLabels,
              datasets: [
                { label: 'Entrate', data: tE, borderColor: '#639922', backgroundColor: 'rgba(99,153,34,0.08)', tension: 0.35, pointRadius: 4, borderWidth: 2, fill: true },
                { label: 'Spese', data: tS, borderColor: '#e24b4a', backgroundColor: 'rgba(226,75,74,0.06)', tension: 0.35, pointRadius: 4, borderWidth: 2, borderDash: [5, 4], fill: true },
              ],
            }}
            options={{ ...chartOpts, plugins: { ...chartOpts.plugins, legend: { display: false } } }}
          />
        </div>
      </div>
    </div>
  )
}
