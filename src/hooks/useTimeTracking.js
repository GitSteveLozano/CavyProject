import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ─── Time-tracking entries for a project ─────────────────────────────────────
export function useTimeTracking(projectId) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchEntries = useCallback(async () => {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const { data: rows, error: err } = await supabase
        .from('labor_entries')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      if (err) throw err
      setEntries(rows || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (projectId) fetchEntries()
  }, [projectId, fetchEntries])

  return { entries, loading, error, refetch: fetchEntries }
}

// ─── Single labor-entry CRUD (save / confirm) ────────────────────────────────
export function useLaborEntry() {
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)

  const saveEntry = useCallback(async (entry) => {
    if (!supabase) return null
    setSaving(true)
    setError(null)
    try {
      const { data: saved, error: err } = await supabase
        .from('labor_entries')
        .upsert(entry)
        .select()
        .single()
      if (err) throw err
      return saved
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setSaving(false)
    }
  }, [])

  const confirmEntries = useCallback(async (rows) => {
    if (!supabase) return false
    setSaving(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('labor_entries')
        .upsert(rows.map(e => ({ ...e, confirmed: true })))
      if (err) throw err
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  return { saving, error, saveEntry, confirmEntries }
}

// ─── Crew schedule for a project + date ──────────────────────────────────────
export function useCrewSchedule(projectId, date) {
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading]   = useState(true)

  const fetchSchedule = useCallback(async () => {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    try {
      const { data: sched, error: err } = await supabase
        .from('crew_schedules')
        .select('*')
        .eq('project_id', projectId)
        .eq('work_date', date)
        .maybeSingle()
      if (err) throw err
      setSchedule(sched)
    } catch (err) {
      console.error('Failed to fetch schedule:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId, date])

  useEffect(() => {
    if (projectId && date) fetchSchedule()
  }, [projectId, date, fetchSchedule])

  return { schedule, loading, refetch: fetchSchedule }
}

// ─── Confirmed entries by company + date (company-level, not project-level) ──
export function useConfirmedByDate(companyId, date) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchConfirmed = useCallback(async () => {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const { data: rows, error: err } = await supabase
        .from('labor_entries')
        .select('*')
        .eq('company_id', companyId)
        .eq('work_date', date)
      if (err) throw err
      setEntries(rows || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [companyId, date])

  useEffect(() => {
    if (companyId && date) fetchConfirmed()
  }, [companyId, date, fetchConfirmed])

  return { entries, loading, error, refetch: fetchConfirmed }
}
