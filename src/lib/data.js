/* ============================================================
 * PROJECT 360 — MVP Prototype
 * Construction Operations Platform
 *
 * Integration points marked: [QBO], [TAKEOFF], [TIME]
 * Mock data shape mirrors QBO Estimate/Bill API response
 *
 * Real integrations to wire up:
 *   [QBO]     GET /v3/company/{id}/query — Estimates, Bills, TimeSessions
 *   [TAKEOFF] Replace <UploadZone> with PDF.js canvas + measurement tools
 *   [TIME]    POST time entries back to QBO Time (fka T-Sheets)
 * ============================================================ */

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// [QBO] Shape mirrors QuickBooks Estimate object + custom sqft fields
export const LABOR_RATE = 38   // Blended $/hr — make this configurable per company

export const PROJECTS = [
  {
    id: "LNA-2025-041",
    name: "Silverstone Condos — Phase 2",
    client: "Silverstone Properties",
    division: "EIFS",
    status: "active",
    sqft: 8420,
    bidPsf: 13.50,
    startDate: "Feb 10, 2025",
    targetEnd: "Apr 15, 2025",
    workers: 6,
    targetSqftPerHr: 4.73,
    bonusPool: 8000,
    // [TIME] Labor by service item — pulled from QBO Time sessions tagged to job
    labor: {
      "Air Barrier":  { hours: 182, sqftDone: 8420 },
      "EPS Foam":     { hours: 310, sqftDone: 8420 },
      "Scratch Coat": { hours: 215, sqftDone: 8420 },
      "Finish Coat":  { hours: 198, sqftDone: 5100 },
    },
    materialCost: 54200,  // [QBO] Sum of Bills tagged to this job
    subCost: 0,
  },
  {
    id: "LNA-2025-038",
    name: "Ventura Commons — Block C",
    client: "Ventura Developments",
    division: "Stucco",
    status: "active",
    sqft: 5180,
    bidPsf: 11.25,
    startDate: "Feb 24, 2025",
    targetEnd: "Mar 28, 2025",
    workers: 4,
    targetSqftPerHr: 5.10,
    bonusPool: 4500,
    labor: {
      "Air Barrier":  { hours: 96,  sqftDone: 5180 },
      "Scratch Coat": { hours: 148, sqftDone: 5180 },
      "Finish Coat":  { hours: 142, sqftDone: 5180 },
    },
    materialCost: 22800,
    subCost: 4200,
  },
  {
    id: "LNA-2025-035",
    name: "Prairiegate Townhomes",
    client: "Prairiegate Homes",
    division: "Siding",
    status: "complete",
    sqft: 3940,
    bidPsf: 9.80,
    startDate: "Jan 15, 2025",
    targetEnd: "Feb 20, 2025",
    workers: 3,
    targetSqftPerHr: 6.20,
    bonusPool: 3200,
    labor: {
      "Air Barrier":   { hours: 72,  sqftDone: 3940 },
      "Finish Coat":   { hours: 185, sqftDone: 3940 },
      "Trim & Detail": { hours: 44,  sqftDone: 3940 },
    },
    materialCost: 16400,
    subCost: 0,
  },
  {
    id: "LNA-2025-044",
    name: "Eastgate Retail Plaza",
    client: "Eastgate Corp",
    division: "EIFS",
    status: "bid",
    sqft: 6200,
    bidPsf: 14.00,
    startDate: "—",
    targetEnd: "—",
    workers: 0,
    targetSqftPerHr: 4.73,
    bonusPool: 0,
    labor: {},
    materialCost: 0,
    subCost: 0,
  },
  {
    id: "LNA-2025-040",
    name: "Sage Creek Mixed-Use",
    client: "Sage Creek Dev",
    division: "Cultured Stone",
    status: "active",
    sqft: 2280,
    bidPsf: 22.50,
    startDate: "Mar 1, 2025",
    targetEnd: "Apr 5, 2025",
    workers: 3,
    targetSqftPerHr: 3.20,
    bonusPool: 3000,
    labor: {
      "Air Barrier": { hours: 44,  sqftDone: 2280 },
      "Finish Coat": { hours: 195, sqftDone: 1600 },
    },
    materialCost: 31200,
    subCost: 8400,
  },
]

export const RECENT_TIME_ENTRIES = [
  { job: "LNA-2025-041", item: "Finish Coat",  crew: "Crew A (6)",  hours: "6.5", when: "Today, 8:00am" },
  { job: "LNA-2025-038", item: "Scratch Coat", crew: "Crew B (4)",  hours: "7.0", when: "Today, 7:30am" },
  { job: "LNA-2025-040", item: "Finish Coat",  crew: "Crew C (3)",  hours: "8.0", when: "Yesterday"      },
  { job: "LNA-2025-041", item: "EPS Foam",     crew: "Crew A (6)",  hours: "7.5", when: "Yesterday"      },
]
