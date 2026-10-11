import { CATEGORY_LABELS, occasionsByUpcoming } from '../lib/config'
import type { Product } from '../lib/types'

interface Props {
  products: Product[]
  category: string | null
  occasion: string | null
  activeCount: number
  onCategory: (c: string | null) => void
  onOccasion: (o: string | null) => void
  onOpenFilters: () => void
}

/** Быстрые ряды: полные фильтры + ИИ-подбор + категории, ниже — подборки по поводам. */
export function FilterBar({ products, category, occasion, activeCount, onCategory, onOccasion, onOpenFilters }: Props) {
  const counts = new Map<string, number>()
  products.forEach((p) => p.categories.forEach((c) => counts.set(c, (counts.get(c) ?? 0) + 1)))
  const cats = Object.keys(CATEGORY_LABELS).filter((c) => counts.has(c))
  const occasions = occasionsByUpcoming()

  return (
    <div className="filter-rows">
      <div className="filters" role="toolbar" aria-label="Категории">
        <button className={`chip-btn ${activeCount > 0 ? 'on-ink' : ''}`} onClick={onOpenFilters}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Фильтры{activeCount > 0 && <b className="count">{activeCount}</b>}
        </button>
        <button className="chip-btn ai" disabled aria-disabled="true" title="Подбор впечатлений с помощью ИИ">
          ✨ ИИ-подбор <span className="soon">Скоро</span>
        </button>
        <button className={`chip-btn ${category === null ? 'on' : ''}`} onClick={() => onCategory(null)}>Все</button>
        {cats.map((c) => (
          <button key={c} className={`chip-btn ${category === c ? 'on' : ''}`} onClick={() => onCategory(category === c ? null : c)}>
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
      <div className="filters occasions" role="toolbar" aria-label="Повод">
        <span className="row-label">Повод</span>
        {occasions.map((o) => (
          <button key={o.id} className={`chip-btn small ${occasion === o.id ? 'on-pink' : ''}`} onClick={() => onOccasion(occasion === o.id ? null : o.id)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
