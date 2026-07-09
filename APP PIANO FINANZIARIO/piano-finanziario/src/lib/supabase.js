import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export const CONTI = [
  {
    id: 'nec',
    nome: 'Conto Personale',
    pct: 60,
    color: '#378add',
    desc: 'Il tuo conto principale per vivere: spesa, benzina, bollette, affitto, abbonamenti. Tutto ciò che serve per la vita quotidiana.',
    icon: '🏠',
  },
  {
    id: 'ris',
    nome: 'SalvaImprevisti',
    pct: 10,
    color: '#639922',
    desc: 'Il tuo scudo contro le emergenze. Macchina rotta, spesa medica inaspettata, mese scarso: questi soldi ti salvano. Non toccarli mai se non è una vera emergenza.',
    icon: '🛡️',
  },
  {
    id: 'for',
    nome: 'Formazione',
    pct: 5,
    color: '#ba7517',
    desc: 'Investire su te stessa è il rendimento più alto che esista. Libri, corsi, coaching: più cresci, più guadagni. Non è una spesa, è il tuo capitale più prezioso.',
    icon: '📚',
  },
  {
    id: 'sva',
    nome: 'Svago',
    pct: 10,
    color: '#d4537e',
    desc: 'Questi soldi vanno spesi ogni mese, tutti. Non per la pizza — quella va nel Conto Personale. Qui ci va qualcosa di stravagante che normalmente non faresti: una spa, un weekend, un ristorante stellato. Allenati a ricevere abbondanza.',
    icon: '🎉',
  },
  {
    id: 'don',
    nome: 'Donazioni',
    pct: 5,
    color: '#7f77dd',
    desc: 'Le persone più ricche del mondo donano costantemente. Chi dona manda al cervello il messaggio che ha abbondanza. Più dai, più ti senti ricca. Inizia anche con €5: conta il gesto, non la cifra.',
    icon: '❤️',
  },
  {
    id: 'lib',
    nome: 'Fondo Investimenti',
    pct: 10,
    color: '#1d9e75',
    desc: "Questi soldi NON si spendono: si investono per crearsi redditi passivi. Azioni, immobili, business: l'obiettivo è che lavorino per te. Regola d'oro: al primo guadagno dall'investimento, rimetti tutto nel fondo.",
    icon: '🚀',
  },
]

export const MESI = [
  'Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
  'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre',
]

export const COLORS = [
  '#378add','#639922','#ba7517','#d4537e','#7f77dd','#1d9e75',
  '#e24b4a','#5dcaa5','#ef9f27','#d85a30','#888780',
]

export function euro(n) {
  return '€' + Number(n).toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function fmtDate(s) {
  if (!s) return ''
  const [y, m, d] = s.split('-')
  return `${d}/${m}/${y}`
}

export function nowYM() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function today() {
  return new Date().toISOString().split('T')[0]
}

export function weekRange() {
  const t = new Date()
  const l = new Date(t)
  l.setDate(t.getDate() - ((t.getDay() + 6) % 7))
  const s = new Date(l)
  s.setDate(l.getDate() + 6)
  const fmt = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { dal: fmt(l), al: fmt(s) }
}

export const DEFAULT_DATA = {
  entrate: [],
  spese: [],
  saldi: {},
  goal: 1000000,
  fis: { reg: 'f5', co: 78, al: 5, inps: 26.23 },
  taxSal: 0,
}
