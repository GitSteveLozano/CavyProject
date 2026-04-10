import { useState, useEffect } from 'react'
import { TH } from '../lib/theme'
import { Card, Btn, SectionLabel } from './Atoms'
import { useLaborEntry, useCrewSchedule, useConfirmedByDate } from '../hooks/useTimeTracking'

const SCOPE_ITEMS = [
  { id: 'air_barrier',  label: 'Air Barrier'  },
  { id: 'eps_foam',     label: 'EPS Foam'     },
  { id: 'scratch_coat', label: 'Scratch Coat' },
  { id: 'finish_coat',  label: 'Finish Coat'  },
  { id: 'trim_detail',  label: 'Trim & Detail' },
]

export function DailyConfirm({ companyId, projectId, date }) {
  const { saving, error: saveError, confirmEntries } = useLaborEntry()
  const { schedule: schedData, loading: schedLoading } = useCrewSchedule(projectId, date)
  const { entries: confirmedEntries, loading: confirmedLoading } = useConfirmedByDate(companyId, date)

  // Draft entries derived from schedule — sync via useEffect after async loads
  const draftEntries = (schedData?.workers || []).map(w => ({
    worker_id: w.id,
    worker_name: w.name,
    project_id: schedData?.project_id,
    company_id: companyId,
    work_date: date,
    scope_item: SCOPE_ITEMS[0].id,
    hours: 8,
    confirmed: false,
  }))

  const [entries, setEntries] = useState([])

  useEffect(() => {
    setEntries(draftEntries)
  }, [schedData]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateEntry = (idx, field, value) => {
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e))
  }

  const addExtraWorker = () => {
    setEntries(prev => [
      ...prev,
      {
        worker_id: null,
        worker_name: '',
        project_id: schedData?.project_id,
        company_id: companyId,
        work_date: date,
        scope_item: SCOPE_ITEMS[0].id,
        hours: 8,
        confirmed: false,
      },
    ])
  }

  const confirmDay = async () => {
    const ok = await confirmEntries(entries)
    if (ok) alert('Day confirmed!')
  }

  if (schedLoading || confirmedLoading) {
    return <div style={{ padding: 32, color: TH.muted }}>Loading schedule...</div>
  }

  return (
    <div className="page-pad" style={{ padding: '32px 36px', maxWidth: 700 }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, color: TH.text, margin: 0, marginBottom: 4 }}>
        Daily Confirm
      </h1>
      <div style={{ fontSize: 13, color: TH.muted, marginBottom: 24 }}>
        {date} &middot; {entries.length} worker{entries.length !== 1 ? 's' : ''}
      </div>

      {confirmedEntries.length > 0 && (
        <Card style={{ marginBottom: 16, border: `1px solid ${TH.green}44` }}>
          <SectionLabel>Already confirmed</SectionLabel>
          <div style={{ fontSize: 12, color: TH.green }}>
            {confirmedEntries.length} entr{confirmedEntries.length !== 1 ? 'ies' : 'y'} confirmed for this date
          </div>
        </Card>
      )}

      {entries.map((entry, idx) => (
        <Card key={idx} style={{ marginBottom: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 12, alignItems: 'end' }}>
            <div>
              <div style={{ fontSize: 11, color: TH.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
                Worker
              </div>
              <input
                value={entry.worker_name}
                onChange={e => updateEntry(idx, 'worker_name', e.target.value)}
                placeholder="Worker name"
                style={{
                  width: '100%', background: TH.surf, border: `1px solid ${TH.border}`,
                  borderRadius: 4, padding: '9px 12px', color: TH.text, fontSize: 13, fontFamily: 'inherit',
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: TH.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
                Scope item
              </div>
              <select
                value={entry.scope_item}
                onChange={e => updateEntry(idx, 'scope_item', e.target.value)}
                style={{
                  width: '100%', background: TH.surf, border: `1px solid ${TH.border}`,
                  borderRadius: 4, padding: '9px 12px', color: TH.text, fontSize: 13, fontFamily: 'inherit',
                }}
              >
                {SCOPE_ITEMS.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, color: TH.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
                Hours
              </div>
              <input
                type="number"
                value={entry.hours}
                onChange={e => updateEntry(idx, 'hours', parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%', background: TH.surf, border: `1px solid ${TH.border}`,
                  borderRadius: 4, padding: '9px 12px', color: TH.text, fontSize: 13, fontFamily: 'inherit', textAlign: 'right',
                }}
              />
            </div>
          </div>
        </Card>
      ))}

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <Btn variant="ghost" onClick={addExtraWorker}>+ Add worker</Btn>
        <Btn onClick={confirmDay} disabled={saving || entries.length === 0}>
          {saving ? 'Saving...' : 'Confirm day'}
        </Btn>
      </div>

      {saveError && (
        <div style={{ marginTop: 12, fontSize: 12, color: TH.red }}>{saveError}</div>
      )}
    </div>
  )
}
