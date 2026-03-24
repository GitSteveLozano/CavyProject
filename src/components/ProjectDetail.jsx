import { TH, DIV_COLOR } from '../lib/theme'
import { money, psf, pct } from '../lib/format'
import { calc } from '../lib/calc'
import { LABOR_RATE } from '../lib/data'
import { Badge, Dot, Bar, Card, SectionLabel } from './Atoms'
import { PsfHero } from './PsfHero'

export function ProjectDetail({ project: p, onBack }) {
  const m    = calc(p)
  const hasD = Object.keys(p.labor).length > 0 && m.actPsf > 0
  const isOvr = hasD && m.psfVar > 0

  return (
    <div style={{ padding: "32px 36px", maxWidth: 960 }}>
      <button onClick={onBack} style={{ fontSize: 13, color: TH.muted, cursor: "pointer", marginBottom: 20, background: "none", border: "none", display: "flex", alignItems: "center", gap: 5 }}>
        ← All projects
      </button>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <Badge label={p.division} color={DIV_COLOR[p.division] || TH.amber} />
            <Dot status={p.status} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: TH.text, margin: 0 }}>{p.name}</h1>
          <div style={{ fontSize: 12, color: TH.muted, marginTop: 3 }}>{p.id} · {p.client}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: TH.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Bid total</div>
          <div style={{ fontSize: 26, fontWeight: 500, color: TH.text, fontVariantNumeric: "tabular-nums" }}>{money(m.bidTotal)}</div>
        </div>
      </div>

      {/* PSF Hero card — the whole point of the app */}
      {hasD && (
        <Card warn={isOvr && m.psfVar > 0.50} style={{ marginBottom: 14 }}>
          <SectionLabel>Cost per square foot — bid vs actual</SectionLabel>
          <PsfHero bidPsf={p.bidPsf} actPsf={m.actPsf} />
          <div style={{ marginTop: 16 }}>
            <Bar value={m.pctComplete} color={isOvr && m.psfVar > 0.50 ? TH.red : TH.amber} h={5} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 11, color: TH.muted }}>
              <span>{pct(m.pctComplete)} complete</span>
              <span>{p.sqft.toLocaleString()} sqft total</span>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* LEFT col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Labor */}
          <Card>
            <SectionLabel>Labor by service item</SectionLabel>
            {Object.keys(p.labor).length === 0
              ? <div style={{ fontSize: 13, color: TH.muted }}>No time entries yet</div>
              : Object.entries(p.labor).map(([item, d]) => {
                  const cost = d.hours * LABOR_RATE
                  const rate = (d.sqftDone / (d.hours || 1)).toFixed(2)
                  return (
                    <div key={item} style={{ paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${TH.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{item}</span>
                        <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{money(cost)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: TH.muted }}>
                        <span>{d.hours}h · {d.sqftDone.toLocaleString()} sqft</span>
                        <span style={{ fontVariantNumeric: "tabular-nums" }}>{rate} sqft/hr</span>
                      </div>
                    </div>
                  )
                })}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 2 }}>
              <span style={{ fontSize: 12, color: TH.muted, fontWeight: 500 }}>Total labor</span>
              <span style={{ fontSize: 13, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{money(m.laborCost)}</span>
            </div>
          </Card>

          {/* Materials */}
          <Card>
            <SectionLabel>Materials & subs</SectionLabel>
            {[
              { label: "Materials",      value: p.materialCost, note: "from QBO bills"    },
              { label: "Subcontractors", value: p.subCost,      note: "tagged to job"     },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{row.label}</div>
                  <div style={{ fontSize: 11, color: TH.muted }}>{row.note}</div>
                </div>
                <span style={{ fontSize: 13, color: row.value > 0 ? TH.text : TH.muted, fontVariantNumeric: "tabular-nums" }}>
                  {row.value > 0 ? money(row.value) : "—"}
                </span>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${TH.border}`, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: TH.muted, fontWeight: 500 }}>Total cost</span>
              <span style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{money(m.totalCost)}</span>
            </div>
          </Card>
        </div>

        {/* RIGHT col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Margin */}
          {hasD && (
            <Card>
              <SectionLabel>Job margin</SectionLabel>
              {[
                { label: "Bid revenue",   value: m.bidTotal,              color: TH.text  },
                { label: "Total cost",    value: m.totalCost,             color: TH.text  },
                { label: "Gross profit",  value: m.bidTotal - m.totalCost, color: m.bidTotal > m.totalCost ? TH.green : TH.red },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: TH.muted }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: row.color, fontVariantNumeric: "tabular-nums" }}>{money(row.value)}</span>
                </div>
              ))}
              {m.margin !== null && (
                <div style={{ marginTop: 8, paddingTop: 10, borderTop: `1px solid ${TH.border}`, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: TH.muted }}>Margin</span>
                  <span style={{ fontSize: 20, fontWeight: 600, color: m.margin > 0 ? TH.green : TH.red }}>{pct(m.margin)}</span>
                </div>
              )}
            </Card>
          )}

          {/* Bonus tracker */}
          {hasD && p.targetSqftPerHr > 0 && (
            <Card>
              <SectionLabel>Crew performance — bonus tracker</SectionLabel>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "flex-end" }}>
                {[
                  { label: "Target",  value: p.targetSqftPerHr.toFixed(2), color: TH.muted },
                  { label: "Actual",  value: m.avgSqftHr.toFixed(2),       color: m.avgSqftHr >= p.targetSqftPerHr ? TH.green : TH.amber },
                  { label: "Bonus eligibility", value: pct(m.bonusFactor), color: m.bonusFactor >= 0.8 ? TH.green : m.bonusFactor >= 0.5 ? TH.amber : TH.red },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: TH.muted, marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 500, color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
                    {s.label !== "Bonus eligibility" && <div style={{ fontSize: 10, color: TH.muted }}>sqft/hr</div>}
                  </div>
                ))}
              </div>
              <Bar value={m.bonusFactor} color={m.bonusFactor >= 0.8 ? TH.green : m.bonusFactor >= 0.5 ? TH.amber : TH.red} h={5} />
              <div style={{ fontSize: 11, color: TH.muted, marginTop: 7 }}>
                Crew is {m.avgSqftHr >= p.targetSqftPerHr ? "on track" : "behind pace"} — {pct(Math.abs(m.speedDelta))} {m.speedDelta >= 0 ? "ahead of" : "below"} target ·&nbsp;
                Bonus pool: {money(m.bonusAmt)} / {money(p.bonusPool)}
              </div>
            </Card>
          )}

          {/* Job info */}
          <Card>
            <SectionLabel>Job info</SectionLabel>
            {[
              ["Total sqft",  p.sqft.toLocaleString() + " sqft"],
              ["Workers",     p.workers ? p.workers + " crew" : "—"],
              ["Start",       p.startDate],
              ["Target end",  p.targetEnd],
              ["Labor rate",  `$${LABOR_RATE}/hr blended`],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 12, color: TH.muted }}>{label}</span>
                <span style={{ fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{val}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
