import type { Filters, Product, Swipe } from './types'

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 2 ** 32
  }
}

export function matches(p: Product, f: Filters) {
  if (f.category && !p.categories.includes(f.category)) return false
  // город в фиде известен не у всех: без города показываем везде
  if (f.city && p.cities.length > 0 && !p.cities.includes(f.city)) return false
  if (f.interests.length > 0 && !f.interests.some((i) => p.interests.includes(i))) return false
  if (f.priceMin != null && p.priceByn < f.priceMin) return false
  if (f.priceMax != null && p.priceByn > f.priceMax) return false
  if (f.age && !p.ageGroups.includes(f.age)) return false
  // пол: подходящие по тегам + нейтральные (без тегов «ей/ему»)
  if (f.gender) {
    const gendered = p.audience.includes('her') || p.audience.includes('him')
    if (gendered && !p.audience.includes(f.gender)) return false
  }
  if (f.occasion && !p.occasions.includes(f.occasion)) return false
  return true
}

/** Сколько фильтров активно (интересы считаются за один, цена — за один). */
export function activeFilterCount(f: Filters) {
  return [f.category, f.city, f.interests.length ? 1 : null, f.priceMin != null || f.priceMax != null ? 1 : null, f.age, f.gender, f.occasion]
    .filter((x) => x != null).length
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
