import type { Filters, Product, Swipe } from './types'

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 2 ** 32
  }
}

export function matches(p: Product, f: Filters) {
  if (f.who && !p.audience.includes(f.who)) return false
  if (f.budget && p.priceBucket !== f.budget) return false
  if (f.occasion && !p.occasions.includes(f.occasion)) return false
  return true
}

/** Стабильная (по seed) перетасовка; подарочные карты и наборы — в конец. */
export function buildDeck(all: Product[], f: Filters, swipes: Swipe[], seed: number) {
  const seen = new Set(swipes.map((s) => s.id))
  const rand = rng(seed)
  return all
    .filter((p) => matches(p, f))
    .map((p) => ({ p, k: rand() + (p.isGiftCard ? 10 : 0) }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.p)
    .filter((p) => !seen.has(p.id))
}
