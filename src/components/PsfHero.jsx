import { TH } from '../lib/theme'
import { psf } from '../lib/format'

// The main value prop — this should be unmissable on every project
export function PsfHero({ bidPsf, actPsf }) {
  if (!actPsf) return null
  const over = actPsf > bidPsf
  const diff = actPsf - bidPsf
  const col  = over ? TH.red : TH.green
  return (
    <div style={{ display: "flex", gap: 28, alignItems: "flex-end" }}>
      {[
        { label: "Bid", value: psf(bidPsf), color: TH.muted },
        { label: "Actual", value: psf(actPsf), color: col },
      ].map(s => (
        <div key={s.label}>
          <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: TH.muted, marginBottom: 3 }}>{s.label}</div>
          <div style={{ fontSize: 28, fontWeight: 600, color: s.color, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{s.value}</div>
          <div style={{ fontSize: 10, color: TH.muted, marginTop: 2 }}>per sqft</div>
        </div>
      ))}
      <div style={{ paddingLeft: 20, borderLeft: `1px solid ${TH.border}`, paddingBottom: 2 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: TH.muted, marginBottom: 3 }}>Variance</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: col, fontVariantNumeric: "tabular-nums" }}>
          {over ? "+" : ""}{psf(diff)}
        </div>
        <div style={{ fontSize: 10, color: col, marginTop: 2 }}>{over ? "over budget" : "under budget"}</div>
      </div>
    </div>
  )
}
