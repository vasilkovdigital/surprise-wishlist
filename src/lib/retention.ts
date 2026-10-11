import { DATA_TTL_DAYS } from './config'

export const TTL_MS = DATA_TTL_DAYS * 24 * 3600 * 1000

/** «2 дн. 5 ч» / «7 ч» / «менее часа» */
export function formatRemaining(ms: number) {
  if (ms <= 0) return 'менее часа'
  const h = Math.floor(ms / 3_600_000)
  if (h < 1) return 'менее часа'
  const d = Math.floor(h / 24)
  const r = h % 24
  if (d === 0) return `${h} ч`
  return r ? `${d} дн. ${r} ч` : `${d} дн.`
}
