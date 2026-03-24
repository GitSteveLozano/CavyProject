import { TH } from '../lib/theme'

export function Badge({ label, color = TH.amber }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 7px", borderRadius: 3,
      fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase",
      background: color + "22", color,
    }}>{label}</span>
  )
}

export function Dot({ status }) {
  const map = { active: TH.green, complete: TH.blue, bid: TH.amber, risk: TH.red }
  const labels = { active: "Active", complete: "Complete", bid: "Bid", risk: "At Risk" }
  const c = map[status] || TH.amber
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap: 5, fontSize: 12, color: c }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c, flexShrink: 0 }} />
      {labels[status] || status}
    </span>
  )
}

export function Bar({ value, color = TH.amber, h = 4 }) {
  return (
    <div style={{ height: h, borderRadius: 2, background: TH.border, overflow: "hidden", width: "100%" }}>
      <div style={{ height: "100%", width: `${Math.min(100, value * 100)}%`, background: color, borderRadius: 2, transition: "width 0.4s ease" }} />
    </div>
  )
}

export function Input({ label, ...props }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: TH.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>{label}</div>
      <input {...props} style={{ width: "100%", background: TH.surf, border: `1px solid ${TH.border}`, borderRadius: 4, padding: "9px 12px", color: TH.text, fontSize: 13, fontFamily: "inherit", ...props.style }} />
    </div>
  )
}

export function Select({ label, options, ...props }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: TH.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>{label}</div>
      <select {...props} style={{ width: "100%", background: TH.surf, border: `1px solid ${TH.border}`, borderRadius: 4, padding: "9px 12px", color: TH.text, fontSize: 13, fontFamily: "inherit" }}>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
  )
}

export function Card({ children, style, warn }) {
  return (
    <div style={{
      background: TH.card,
      border: `1px solid ${warn ? TH.red + "55" : TH.border}`,
      borderRadius: 6,
      padding: "18px 20px",
      ...style,
    }}>{children}</div>
  )
}

export function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: TH.muted, fontWeight: 600, marginBottom: 12 }}>
      {children}
    </div>
  )
}

export function Btn({ children, onClick, variant = "primary", disabled, style }) {
  const bg = disabled ? TH.faint : variant === "primary" ? TH.amber : TH.surf
  const col = disabled ? TH.muted : variant === "primary" ? "#000" : TH.muted
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "10px 16px", borderRadius: 4, fontSize: 13, fontWeight: 600,
      background: bg, color: col, border: variant === "ghost" ? `1px solid ${TH.border}` : "none",
      cursor: disabled ? "not-allowed" : "pointer", transition: "opacity 0.15s", ...style,
    }}>{children}</button>
  )
}
