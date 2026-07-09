import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, DEFAULT_DATA } from './supabase'

export function useData(user) {
  const [data, setDataState] = useState(DEFAULT_DATA)
  const [sync, setSync] = useState('')
  const saveTimer = useRef(null)

  // Load from Supabase + localStorage cache
  useEffect(() => {
    if (!user) return
    const load = async () => {
      setSync('⏳')
      // Load cache first for instant UI
      const cached = localStorage.getItem('mpf_data_' + user.id)
      if (cached) {
        try { setDataState(JSON.parse(cached)) } catch {}
      }
      // Then load from Supabase
      try {
        const { data: row } = await supabase
          .from('dati_utente')
          .select('dati')
          .eq('id', user.id)
          .single()
        if (row?.dati?.entrate) {
          setDataState(row.dati)
          localStorage.setItem('mpf_data_' + user.id, JSON.stringify(row.dati))
        }
        setSync('✅')
      } catch {
        setSync('💾')
      }
    }
    load()
  }, [user])

  // Save to Supabase with debounce
  const save = useCallback((newData) => {
    setDataState(newData)
    if (user) {
      localStorage.setItem('mpf_data_' + user.id, JSON.stringify(newData))
    }
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      if (!user) return
      setSync('💾')
      try {
        const { error } = await supabase.from('dati_utente').upsert({
          id: user.id,
          dati: newData,
          aggiornato_il: new Date().toISOString(),
        })
        setSync(error ? '⚠️' : '✅')
      } catch {
        setSync('⚠️')
      }
    }, 800)
  }, [user])

  return { data, save, sync }
}
