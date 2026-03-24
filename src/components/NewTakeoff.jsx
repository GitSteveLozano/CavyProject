import { useState } from 'react'
import { TH } from '../lib/theme'
import { money } from '../lib/format'
import { Input, Select, Card, Btn } from './Atoms'

// [TAKEOFF] Replace UploadZone with PDF.js canvas + measurement annotations
// Scale verification checklist is mandatory — do not allow skip
export function NewTakeoff({ onBack }) {
  const [step, setStep]     = useState(1)
  const [jobName, setName]  = useState("")
  const [division, setDiv]  = useState("EIFS")
  const [bidPsf, setBid]    = useState("")
  const [checks, setChecks] = useState({ scale: false, elevation: false, wallType: false })
  const [sqfts, setSqfts]   = useState({
    "Air Barrier": "", "EPS Foam": "", "Scratch Coat": "", "Finish Coat": "", "Trim & Detail": "",
  })

  const allChecked = Object.values(checks).every(Boolean)
  const totalSqft  = Object.values(sqfts).reduce((s, v) => s + (parseFloat(v) || 0), 0)
  const canStep1   = jobName.trim() && bidPsf

  const CHECKS = [
    { key: "scale",     title: "Scale verified against floor plan dimensions",     desc: "Cross-reference the blueprint scale bar against explicit dimensions printed on the main floor plan. Do not rely on the scale bar alone — architects sometimes mislabel it." },
    { key: "elevation", title: "Height confirmed from elevation drawings",          desc: "Confirm building height using the elevation view. A floor plan showing 20 ft should match the elevation. Mismatched scale = wrong sqft." },
    { key: "wallType",  title: "Wall types confirmed for all scopes",              desc: "Verify wall type specs match the scope. Different wall assemblies change material quantities significantly." },
  ]

  return (
    <div className="page-pad" style={{ padding: "32px 36px", maxWidth: 660 }}>
      <button onClick={onBack} style={{ fontSize: 13, color: TH.muted, cursor: "pointer", marginBottom: 20, background: "none", border: "none", display: "flex", alignItems: "center", gap: 5 }}>
        ← Dashboard
      </button>
      <h1 style={{ fontSize: 22, fontWeight: 500, color: TH.text, margin: 0, marginBottom: 4 }}>New takeoff</h1>
      <div style={{ fontSize: 13, color: TH.muted, marginBottom: 28 }}>Capture sqft from blueprints and create a project</div>

      {/* Step bar */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
        {[{n:1,l:"Job details"},{n:2,l:"Verify scale"},{n:3,l:"Measure"},{n:4,l:"Review"}].map((s, i) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, background: step === s.n ? TH.amber : step > s.n ? TH.green : TH.card, color: step >= s.n ? "#000" : TH.muted, border: `1px solid ${step >= s.n ? "transparent" : TH.border}` }}>
                {step > s.n ? "✓" : s.n}
              </div>
              <div style={{ fontSize: 10, color: step === s.n ? TH.amber : TH.muted, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center" }}>{s.l}</div>
            </div>
            {i < 3 && <div style={{ height: 1, flex: 1, background: step > s.n ? TH.green : TH.border, margin: "0 4px 16px" }} />}
          </div>
        ))}
      </div>

      <Card>
        {/* Step 1 */}
        {step === 1 && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              <Input label="Job name" value={jobName} onChange={e => setName(e.target.value)} placeholder="e.g. Riverdale Condos — Phase 1" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Select label="Division" value={division} onChange={e => setDiv(e.target.value)} options={["EIFS","Stucco","Siding","Cultured Stone"]} />
                <Input label="Bid $/sqft" value={bidPsf} onChange={e => setBid(e.target.value)} type="number" placeholder="13.50" style={{ fontVariantNumeric: "tabular-nums" }} />
              </div>
            </div>
            {/* Upload zone — [TAKEOFF] replace with PDF.js canvas */}
            <div style={{ border: `2px dashed ${TH.border}`, borderRadius: 5, padding: "28px", textAlign: "center", marginBottom: 18, cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = TH.amber}
              onMouseLeave={e => e.currentTarget.style.borderColor = TH.border}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>📐</div>
              <div style={{ fontSize: 13, color: TH.muted }}>Drop blueprint PDF here, or click to browse</div>
              <div style={{ fontSize: 11, color: TH.faint, marginTop: 3 }}>.PDF accepted · blueprint viewer loads here</div>
            </div>
            <Btn disabled={!canStep1} onClick={() => setStep(2)} style={{ width: "100%" }}>
              Continue to scale verification →
            </Btn>
          </div>
        )}

        {/* Step 2 — Scale verification. MANDATORY. DO NOT ALLOW SKIP. */}
        {step === 2 && (
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 16, color: TH.amber }}>⚠</span>
              <div style={{ fontSize: 15, fontWeight: 500, color: TH.amber }}>Scale verification required</div>
            </div>
            <div style={{ fontSize: 13, color: TH.muted, marginBottom: 20, lineHeight: 1.7 }}>
              All three items below must be confirmed before the takeoff can proceed. A miscalibrated scale has caused 50%+ bidding errors on real jobs.
            </div>
            {CHECKS.map(c => (
              <div key={c.key} onClick={() => setChecks(prev => ({ ...prev, [c.key]: !prev[c.key] }))} style={{ display: "flex", gap: 12, padding: "13px 14px", marginBottom: 8, borderRadius: 4, border: `1px solid ${checks[c.key] ? TH.green : TH.border}`, background: checks[c.key] ? TH.greenLo : TH.surf, cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ width: 18, height: 18, borderRadius: 3, border: `2px solid ${checks[c.key] ? TH.green : TH.faint}`, background: checks[c.key] ? TH.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, fontSize: 11, color: "#000" }}>
                  {checks[c.key] ? "✓" : ""}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: checks[c.key] ? TH.text : TH.muted, marginBottom: 3 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: TH.muted, lineHeight: 1.6 }}>{c.desc}</div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <Btn variant="ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</Btn>
              <Btn disabled={!allChecked} onClick={() => setStep(3)} style={{ flex: 2 }}>
                {allChecked ? "Verified — continue →" : `${Object.values(checks).filter(Boolean).length}/3 confirmed`}
              </Btn>
            </div>
          </div>
        )}

        {/* Step 3 — Measure */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Enter sqft by scope</div>
            <div style={{ fontSize: 13, color: TH.muted, marginBottom: 18 }}>
              {/* [TAKEOFF] In production: these values pre-fill from the blueprint annotations */}
              Enter measured sqft for each service item. In production, annotations on the blueprint canvas auto-populate these.
            </div>
            {Object.keys(sqfts).map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{item}</div>
                <input type="number" value={sqfts[item]} onChange={e => setSqfts(s => ({ ...s, [item]: e.target.value }))} placeholder="0"
                  style={{ width: 90, background: TH.surf, border: `1px solid ${sqfts[item] ? TH.amber + "66" : TH.border}`, borderRadius: 4, padding: "7px 10px", color: TH.text, fontSize: 13, fontFamily: "inherit", textAlign: "right", fontVariantNumeric: "tabular-nums" }}
                />
                <span style={{ fontSize: 12, color: TH.muted, width: 28 }}>sqft</span>
              </div>
            ))}
            {totalSqft > 0 && (
              <div style={{ borderTop: `1px solid ${TH.border}`, marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: TH.muted }}>Total</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: TH.amber, fontVariantNumeric: "tabular-nums" }}>{totalSqft.toLocaleString()} sqft</span>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
              <Btn variant="ghost" onClick={() => setStep(2)} style={{ flex: 1 }}>← Back</Btn>
              <Btn disabled={totalSqft === 0} onClick={() => setStep(4)} style={{ flex: 2 }}>Review & create →</Btn>
            </div>
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 4 && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Review & create project</div>
            <div style={{ fontSize: 13, color: TH.muted, marginBottom: 18 }}>
              Creates the project in the dashboard and pushes sqft to the QBO custom field.
            </div>
            {[
              ["Job name",         jobName],
              ["Division",         division],
              ["Bid $/sqft",       `$${parseFloat(bidPsf).toFixed(2)}`],
              ["Total sqft",       `${totalSqft.toLocaleString()} sqft`],
              ["Estimated value",  money(totalSqft * parseFloat(bidPsf))],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${TH.border}` }}>
                <span style={{ fontSize: 13, color: TH.muted }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{val}</span>
              </div>
            ))}
            <div style={{ background: TH.greenLo, border: `1px solid ${TH.green}44`, borderRadius: 4, padding: "9px 12px", margin: "14px 0", fontSize: 12, color: TH.green }}>
              ✓ Scale verification complete · sqft will sync to QBO custom field
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" onClick={() => setStep(3)} style={{ flex: 1 }}>← Back</Btn>
              <button onClick={() => { alert("Project created. In production: POST to QBO + create project record."); onBack() }}
                style={{ flex: 2, padding: "10px", background: TH.green, color: "#000", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Create project →
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
