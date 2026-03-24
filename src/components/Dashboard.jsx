import { TH, DIV_COLOR } from '../lib/theme'
import { psf } from '../lib/format'
import { calc } from '../lib/calc'
import { Badge, Dot, Bar, Card } from './Atoms'

export function Dashboard({ projects, onSelect, onNewTakeoff }) {
  const active  = projects.filter(p => p.status === "active")
  const metrics = active.map(p => ({ p, m: calc(p) }))
  const atRisk  = metrics.filter(({ m }) => m.psfVar !== null && m.psfVar > 0.50).length
  const totalSqft = active.reduce((s, p) => s + p.sqft, 0)
  const avgActPsf = (() => {
    const withData = metrics.filter(({ m }) => m.actPsf > 0)
    return withData.length ? withData.reduce((s, { m }) => s + m.actPsf, 0) / withData.length : 0
  })()

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1080 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: TH.text, margin: 0 }}>Operations dashboard</h1>
          <div style={{ fontSize: 12, color: TH.muted, marginTop: 3 }}>Mar 17–23, 2025 · L&A Exterior Systems</div>
        </div>
        <button onClick={onNewTakeoff} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", background: TH.amber, color: "#000", border: "none", borderRadius: 5, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + New takeoff
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Active jobs",       value: active.length,              color: TH.amber, suffix: ""      },
          { label: "Active sqft",       value: totalSqft.toLocaleString(), color: TH.blue,  suffix: " sqft" },
          { label: "Avg cost / sqft",   value: psf(avgActPsf),            color: TH.green, suffix: ""      },
          { label: "Jobs at risk",      value: atRisk,                     color: atRisk > 0 ? TH.red : TH.green, suffix: "" },
        ].map(s => (
          <Card key={s.label} warn={s.label === "Jobs at risk" && atRisk > 0}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: TH.muted, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 500, color: s.color, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
              {s.value}<span style={{ fontSize: 12, color: TH.muted }}>{s.suffix}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Project table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${TH.border}`, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: TH.muted, fontWeight: 600 }}>All projects</span>
          <span style={{ fontSize: 11, color: TH.muted }}>{projects.length} jobs</span>
        </div>
        {/* Col headers */}
        <div style={{ display: "grid", gridTemplateColumns: "160px 90px 80px 90px 100px 110px 1fr", padding: "8px 18px", borderBottom: `1px solid ${TH.border}` }}>
          {["Job", "Division", "Status", "Sqft", "Bid $/sqft", "Actual $/sqft", "Progress"].map(h => (
            <div key={h} style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: TH.muted, fontWeight: 600 }}>{h}</div>
          ))}
        </div>
        {projects.map(p => {
          const m     = calc(p)
          const hasD  = p.status !== "bid" && m.actPsf > 0
          const isOvr = hasD && m.psfVar > 0
          const isRsk = hasD && m.psfVar > 0.50
          return (
            <div key={p.id}
              onClick={() => onSelect(p)}
              style={{
                display: "grid", gridTemplateColumns: "160px 90px 80px 90px 100px 110px 1fr",
                padding: "12px 18px", borderBottom: `1px solid ${TH.border}`,
                cursor: "pointer", transition: "background 0.15s",
                background: isRsk ? TH.redLo : "transparent",
              }}
              onMouseEnter={e => e.currentTarget.style.background = TH.surf}
              onMouseLeave={e => e.currentTarget.style.background = isRsk ? TH.redLo : "transparent"}
            >
              <div>
                <div style={{ fontWeight: 500, fontSize: 13, color: TH.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: TH.muted, marginTop: 2 }}>{p.id}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}><Badge label={p.division} color={DIV_COLOR[p.division] || TH.amber} /></div>
              <div style={{ display: "flex", alignItems: "center" }}><Dot status={p.status} /></div>
              <div style={{ display: "flex", alignItems: "center", fontSize: 13, color: TH.text, fontVariantNumeric: "tabular-nums" }}>{p.sqft.toLocaleString()}</div>
              <div style={{ display: "flex", alignItems: "center", fontSize: 13, color: TH.muted, fontVariantNumeric: "tabular-nums" }}>{psf(p.bidPsf)}</div>
              <div style={{ display: "flex", alignItems: "center", fontSize: 13, fontWeight: hasD ? 600 : 400, color: hasD ? (isOvr ? TH.red : TH.green) : TH.muted, fontVariantNumeric: "tabular-nums" }}>
                {hasD ? psf(m.actPsf) : "—"}
              </div>
              <div style={{ display: "flex", alignItems: "center", paddingRight: 8 }}>
                {p.status !== "bid" && <Bar value={m.pctComplete} color={isRsk ? TH.red : TH.amber} h={3} />}
              </div>
            </div>
          )
        })}
      </Card>
    </div>
  )
}
