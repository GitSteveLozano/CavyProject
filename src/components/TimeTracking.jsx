import { useState } from 'react'
import { TH } from '../lib/theme'
import { PROJECTS, RECENT_TIME_ENTRIES } from '../lib/data'
import { Select, Card } from './Atoms'

// [TIME] Supervisor-only clock-in. Posts to QBO Time API.
// Workers clock in under a job + service item. Only supervisors can do this.
export function TimeTracking() {
  const [job, setJob]         = useState("")
  const [item, setItem]       = useState("Air Barrier")
  const [running, setRun]     = useState(false)
  const [startTime, setStart] = useState(null)
  const activeJobs = PROJECTS.filter(p => p.status === "active")

  return (
    <div style={{ padding: "32px 36px", maxWidth: 660 }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, color: TH.text, margin: 0, marginBottom: 4 }}>Time tracking</h1>
      <div style={{ fontSize: 13, color: TH.muted, marginBottom: 28 }}>Supervisor clock-in · syncs to QBO for job costing</div>

      {/* Clock panel */}
      <Card style={{ marginBottom: 14, border: `1px solid ${running ? TH.green + "66" : TH.border}`, transition: "border-color 0.3s" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <Select label="Job" value={job} disabled={running} onChange={e => setJob(e.target.value)}
            options={[{ value: "", label: "Select job…" }, ...activeJobs.map(p => ({ value: p.id, label: `${p.id} — ${p.name.split("—")[0].trim()}` }))]}
          />
          <Select label="Service item" value={item} disabled={running} onChange={e => setItem(e.target.value)}
            options={["Air Barrier", "EPS Foam", "Scratch Coat", "Finish Coat", "Trim & Detail"]}
          />
        </div>
        {running && (
          <div style={{ background: TH.greenLo, border: `1px solid ${TH.green}44`, borderRadius: 4, padding: "10px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: TH.green }}>● Crew clocked in</div>
              <div style={{ fontSize: 11, color: TH.muted }}>Since {startTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: TH.muted }}>Job</div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{job}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: TH.muted }}>Scope</div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{item}</div>
            </div>
          </div>
        )}
        <button
          disabled={!job && !running}
          onClick={() => {
            if (!running) { setRun(true); setStart(new Date()) }
            else { setRun(false); setStart(null); alert("Time entry saved. In production: POST to QBO Time.") }
          }}
          style={{
            width: "100%", padding: "11px", borderRadius: 4, fontSize: 14, fontWeight: 600,
            background: running ? TH.red : (job ? TH.amber : TH.faint),
            color: (running || job) ? "#000" : TH.muted,
            border: "none", cursor: (job || running) ? "pointer" : "not-allowed",
            transition: "background 0.2s",
          }}
        >
          {running ? "■  Clock out & save entry" : "▶  Clock in crew"}
        </button>
      </Card>

      {/* Recent entries */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${TH.border}` }}>
          <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: TH.muted, fontWeight: 600 }}>Recent entries</span>
        </div>
        {RECENT_TIME_ENTRIES.map((e, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr 100px 50px 90px", padding: "10px 18px", borderBottom: i < RECENT_TIME_ENTRIES.length - 1 ? `1px solid ${TH.border}` : "none", gap: 0 }}>
            <div style={{ fontSize: 11, color: TH.muted, fontVariantNumeric: "tabular-nums" }}>{e.job}</div>
            <div style={{ fontSize: 12 }}>{e.item}</div>
            <div style={{ fontSize: 12, color: TH.muted }}>{e.crew}</div>
            <div style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{e.hours}h</div>
            <div style={{ fontSize: 11, color: TH.muted, textAlign: "right" }}>{e.when}</div>
          </div>
        ))}
      </Card>
    </div>
  )
}
