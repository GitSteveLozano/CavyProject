// ─── FORMAT ───────────────────────────────────────────────────────────────────
export const money = n => `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const psf   = n => `$${n.toFixed(2)}`
export const pct   = n => `${(n * 100).toFixed(1)}%`
