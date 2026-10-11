import type { Product } from './types'

const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е')

/** Поиск по названию и описанию: все слова запроса должны встретиться; совпадения в названии — выше. */
export function searchProducts(all: Product[], query: string, limit = 40): Product[] {
  const words = norm(query).split(/\s+/).filter((w) => w.length > 0)
  if (words.length === 0) return []
  const scored: Array<{ p: Product; score: number }> = []
  for (const p of all) {
    const title = norm(p.title)
    const body = norm(p.description)
    let score = 0
    let ok = true
    for (const w of words) {
      if (title.includes(w)) score += title.startsWith(w) ? 4 : 3
      else if (body.includes(w)) score += 1
      else { ok = false; break }
    }
    if (ok) scored.push({ p, score })
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.p)
}
