import { useState } from 'react'
import { TH } from '../lib/theme'

const NAV_ITEMS = [
  { id: "dashboard", icon: "▦",  label: "Dashboard"     },
  { id: "takeoff",   icon: "⬡",  label: "New takeoff"   },
  { id: "time",      icon: "◷",  label: "Time tracking" },
  { id: "reports",   icon: "↗",  label: "Reports", soon: true },
  { id: "settings",  icon: "⚙",  label: "Settings" },
]

export function MobileHeader({ onToggle }) {
  return (
    <div className="mobile-header" style={{
      display: "none", alignItems: "center", justifyContent: "space-between",
      padding: "12px 16px", background: TH.surf, borderBottom: `1px solid ${TH.border}`,
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: TH.text }}>
        <span style={{ color: TH.amber }}>P</span>ROJECT<span style={{ color: TH.amber }}>360</span>
      </div>
      <button onClick={onToggle} style={{
        background: "none", border: "none", color: TH.text, fontSize: 22,
        cursor: "pointer", padding: "4px 8px", lineHeight: 1,
      }}>☰</button>
    </div>
  )
}

export function Sidebar({ current, onChange, open, onClose }) {
  return (
    <>
      {open && <div className="sidebar-overlay" style={{ display: "none" }} onClick={onClose} />}
      <div className={`sidebar${open ? " open" : ""}`} style={{
        width: 200, minHeight: "100vh", background: TH.surf,
        borderRight: `1px solid ${TH.border}`, display: "flex",
        flexDirection: "column", flexShrink: 0,
      }}>
        {/* Brand */}
        <div style={{ padding: "20px 18px 16px", borderBottom: `1px solid ${TH.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "0.02em", color: TH.text }}>
              <span style={{ color: TH.amber }}>P</span>ROJECT<span style={{ color: TH.amber }}>360</span>
            </div>
            <div style={{ fontSize: 10, color: TH.muted, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.1em" }}>L&A Exterior Systems</div>
          </div>
          {open && (
            <button onClick={onClose} style={{ background: "none", border: "none", color: TH.muted, fontSize: 18, cursor: "pointer", padding: "2px 6px" }}>✕</button>
          )}
        </div>
        <nav style={{ flex: 1, padding: "10px 8px" }}>
          {NAV_ITEMS.map(item => {
            const active = current === item.id
            return (
              <button key={item.id} onClick={() => { if (!item.soon) { onChange(item.id); if (onClose) onClose() } }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", borderRadius: 4, marginBottom: 1, background: active ? TH.amberLo : "transparent", color: item.soon ? TH.faint : active ? TH.amber : TH.muted, fontSize: 13, fontWeight: active ? 500 : 400, cursor: item.soon ? "not-allowed" : "pointer", border: active ? `1px solid ${TH.amber}33` : "1px solid transparent", transition: "all 0.15s", textAlign: "left", fontFamily: "inherit" }}>
                <span style={{ fontSize: 13 }}>{item.icon}</span>
                {item.label}
                {item.soon && <span style={{ marginLeft: "auto", fontSize: 9, background: TH.faint, color: TH.muted, padding: "1px 4px", borderRadius: 2, textTransform: "uppercase" }}>soon</span>}
              </button>
            )
          })}
        </nav>
        <div style={{ padding: "12px 18px", borderTop: `1px solid ${TH.border}` }}>
          <div style={{ fontSize: 11, color: TH.muted }}>MVP Prototype · v0.1</div>
        </div>
      </div>
    </>
  )
}
