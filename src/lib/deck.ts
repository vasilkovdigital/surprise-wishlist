import type { Filters, Product, Swipe } from './types'

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 2 ** 32
  }
}

export function matches(p: Product, f: Filters) {
  return !f.category || p.categories.includes(f.category)
}

/**
 * Порядок колоды:
 *  1. ещё не виденные — стабильная (по seed) перетасовка, подарочные карты/наборы в конце;
 *  2. пропущенные — в конец, в порядке пропуска (самые давние раньше), если recyclePassed;
 *  при recyclePassed=false пропущенные не показываются. Лайкнутые не показываются никогда.
 */
export function buildDeck(all: Product[], f: Filters, swipes: Swipe[], seed: number, recyclePassed: boolean) {
  const last = new Map<string, { d: Swipe['d']; at: number }>()
  swipes.forEach((s, i) => last.set(s.id, { d: s.d, at: i }))

  const rand = rng(seed)
  const pool = all.filter((p) => matches(p, f))
  const fresh = pool
    .filter((p) => !last.has(p.id))
    .map((p) => ({ p, k: rand() + (p.isGiftCard ? 10 : 0) }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.p)

  if (!recyclePassed) return fresh

  const passed = pool
    .filter((p) => last.get(p.id)?.d === 'pass')
    .sort((a, b) => last.get(a.id)!.at - last.get(b.id)!.at)
  return [...fresh, ...passed]
}
