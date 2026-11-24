/* Booking helpers for /custom#book — dates, slots, validation. Pure functions, no network. */

import { SATURDAY_SLOTS, WEEKDAY_SLOTS, type LocationId, type ServiceId } from './data'

export interface Day {
  iso: string
  wk: string
  d: number
  mon: string
  long: string
  closed: boolean
  /** first chip of a new month in the strip */
  monthStart: boolean
}

const WK = new Intl.DateTimeFormat('en-GB', { weekday: 'short' })
const MON = new Intl.DateTimeFormat('en-GB', { month: 'short' })
const LONG = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
const MONTH_LONG = new Intl.DateTimeFormat('en-GB', { month: 'long' })

const pad = (n: number) => String(n).padStart(2, '0')
const isoOf = (dt: Date) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
const startOfDay = (dt: Date) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())

/**
 * The Dolmen Mall flagship opens in January 2027. Until then its strip offers preferred dates from the first
 * Monday of January; the exact day and hour are confirmed by the WhatsApp Concierge.
 */
export const FLAGSHIP_FIRST_DAY = new Date(2027, 0, 4)

/** The next `n` days after `from`. Sundays are closed (appointments run Monday to Saturday). */
export function nextDays(n = 14, from = new Date()): Day[] {
  const out: Day[] = []
  for (let i = 1; i <= n; i++) {
    const dt = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i)
    out.push({
      iso: isoOf(dt),
      wk: WK.format(dt),
      d: dt.getDate(),
      mon: MON.format(dt),
      long: LONG.format(dt).replace(',', ''),
      closed: dt.getDay() === 0,
      monthStart: i === 1 || dt.getDate() === 1,
    })
  }
  return out
}

/** True while the flagship has not yet opened (its dates are then preferences, not fixed hours). */
export const flagshipPreOpening = (today = new Date()) => startOfDay(today) < FLAGSHIP_FIRST_DAY

/** The fortnight of dates offered for a place: private appointments from tomorrow, the flagship from its opening. */
export function daysFor(location: LocationId | null, today = new Date()): Day[] {
  if (location === 'flagship' && flagshipPreOpening(today)) {
    const dayBefore = new Date(FLAGSHIP_FIRST_DAY.getFullYear(), FLAGSHIP_FIRST_DAY.getMonth(), FLAGSHIP_FIRST_DAY.getDate() - 1)
    return nextDays(14, dayBefore)
  }
  return nextDays(14, today)
}

/** "November — December 2026" for the strip heading. */
export function monthSpan(days: Day[]) {
  if (!days.length) return ''
  const [y0, m0] = days[0].iso.split('-').map(Number)
  const [y1, m1] = days[days.length - 1].iso.split('-').map(Number)
  const a = MONTH_LONG.format(new Date(y0, m0 - 1, 1))
  const b = MONTH_LONG.format(new Date(y1, m1 - 1, 1))
  if (a === b && y0 === y1) return `${a} ${y0}`
  return y0 === y1 ? `${a} — ${b} ${y1}` : `${a} ${y0} — ${b} ${y1}`
}

/* A small deterministic hash so the same day always shows the same "taken" hours. */
function hash(s: string) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export interface Slot {
  time: string
  taken: boolean
}

export function slotsFor(day: Day | undefined, location: LocationId | null): Slot[] {
  if (!day || day.closed || !location) return []
  const [y, m, d] = day.iso.split('-').map(Number)
  const saturday = new Date(y, m - 1, d).getDay() === 6
  const base = saturday ? SATURDAY_SLOTS : WEEKDAY_SLOTS
  const slots = base.map((time) => ({ time, taken: hash(`${day.iso}|${time}|${location}`) % 10 < 3 }))
  // always leave at least two hours open
  let open = slots.filter((s) => !s.taken).length
  for (const s of slots) {
    if (open >= 2) break
    if (s.taken) {
      s.taken = false
      open++
    }
  }
  return slots
}

export const DURATION_MIN: Record<ServiceId, number> = { mtm: 60, consult: 90, colour: 75, corporate: 30 }

export function endTime(start: string, minutes: number) {
  const [h, m] = start.split(':').map(Number)
  const t = h * 60 + m + minutes
  return `${pad(Math.floor(t / 60) % 24)}:${pad(t % 60)}`
}

/** Part of day, for grouping slot chips. */
export const partOfDay = (time: string) => {
  const h = Number(time.split(':')[0])
  return h < 13 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening'
}

/* ── validation ───────────────────────────────────────────────────────── */

/** Accepts 0300 1234567, 300 1234567, +92 300 1234567, 0092…, or any +country number. Returns a tidy display form or null. */
export function normalisePhone(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  if (/[^\d\s+()\-.]/.test(t)) return null
  let digits = t.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  else if (/^0?3\d{9}$/.test(digits)) digits = `92${digits.replace(/^0/, '')}`
  if (/^923\d{9}$/.test(digits)) return `+92 ${digits.slice(2, 5)} ${digits.slice(5)}`
  if ((t.startsWith('+') || t.startsWith('00')) && digits.length >= 8 && digits.length <= 15) return `+${digits}`
  return null
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())

/** A WhatsApp number or an email — returns the tidy form, or null. */
export function normaliseContact(raw: string): { kind: 'whatsapp' | 'email'; value: string } | null {
  const t = raw.trim()
  if (!t) return null
  if (t.includes('@')) return isEmail(t) ? { kind: 'email', value: t } : null
  const p = normalisePhone(t)
  return p ? { kind: 'whatsapp', value: p } : null
}

export function bookingRef(iso: string) {
  const [, m, d] = iso.split('-')
  const abc = 'ACDEFGHJKMNPQRTVWXY34679'
  let tail = ''
  for (let i = 0; i < 3; i++) tail += abc[Math.floor(Math.random() * abc.length)]
  return `FM-${d}${m}-${tail}`
}
