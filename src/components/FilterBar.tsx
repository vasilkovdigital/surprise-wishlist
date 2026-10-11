import { CATEGORY_LABELS } from '../lib/config'
import type { Product } from '../lib/types'

interface Props {
  products: Product[]
  value: string | null
  onChange: (c: string | null) => void
}

/** Один значимый фильтр — категория впечатления — и заглушка ИИ-подбора. */
export function FilterBar({ products, value, onChange }: Props) {
  const counts = new Map<string, number>()
  products.forEach((p) => p.categories.forEach((c) => counts.set(c, (counts.get(c) ?? 0) + 1)))
  const cats = Object.keys(CATEGORY_LABELS).filter((c) => counts.has(c))

  return (
    <div className="filters" role="toolbar" aria-label="Фильтр по категории">
      <button className="chip-btn ai" disabled aria-disabled="true" title="Подбор впечатлений с помощью ИИ">
        ✨ ИИ-подбор <span className="soon">Скоро</span>
      </button>
      <button className={`chip-btn ${value === null ? 'on' : ''}`} onClick={() => onChange(null)}>Все</button>
      {cats.map((c) => (
        <button key={c} className={`chip-btn ${value === c ? 'on' : ''}`} onClick={() => onChange(value === c ? null : c)}>
          {CATEGORY_LABELS[c]}
        </button>
      ))}
    </div>
  )
}
