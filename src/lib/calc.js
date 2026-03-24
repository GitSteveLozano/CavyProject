import { LABOR_RATE } from './data'

// ─── METRICS ENGINE ───────────────────────────────────────────────────────────
export function calc(p) {
  const laborHrs  = Object.values(p.labor).reduce((s, i) => s + i.hours, 0)
  const laborCost = laborHrs * LABOR_RATE
  const totalCost = laborCost + p.materialCost + p.subCost
  const bidTotal  = p.sqft * p.bidPsf
  const actPsf    = p.sqft > 0 && totalCost > 0 ? totalCost / p.sqft : 0
  const psfVar    = actPsf > 0 ? actPsf - p.bidPsf : null
  const margin    = bidTotal > 0 ? (bidTotal - totalCost) / bidTotal : null

  const laborItems = Object.values(p.labor).filter(i => i.hours > 0)
  const avgSqftHr  = laborItems.length
    ? laborItems.reduce((s, i) => s + i.sqftDone / i.hours, 0) / laborItems.length
    : 0
  const speedDelta = p.targetSqftPerHr > 0
    ? (avgSqftHr - p.targetSqftPerHr) / p.targetSqftPerHr
    : 0

  // Bonus: full at target, scales to 0 at 20% below target
  const bonusFactor = Math.max(0, Math.min(1, 1 + speedDelta / 0.20))
  const bonusAmt    = p.bonusPool * bonusFactor

  const sqftDoneMax  = Math.max(...Object.values(p.labor).map(i => i.sqftDone), 0)
  const pctComplete  = p.sqft > 0 ? Math.min(1, sqftDoneMax / p.sqft) : 0

  return { laborHrs, laborCost, totalCost, bidTotal, actPsf, psfVar, margin,
           avgSqftHr, speedDelta, bonusFactor, bonusAmt, pctComplete }
}
