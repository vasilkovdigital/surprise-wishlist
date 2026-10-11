import { useEffect, useMemo, useRef, useState } from 'react'
import { searchProducts } from '../lib/search'
import type { Product } from '../lib/types'
import { imgSrc, track } from '../state'

interface Props {
  products: Product[]
  onOpen: (p: Product) => void
  onClose: () => void
}

export function SearchSheet({ products, onOpen, onClose }: Props) {
  const [q, setQ] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => ref.current?.focus(), [])
  const results = useMemo(() => searchProducts(products, q), [products, q])

  return (
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Поиск" onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" aria-label="Закрыть" onClick={onClose}>✕</button>
        <div className="sheet-body search-body">
          <h2>Поиск</h2>
          <input
            ref={ref}
            className="field"
            type="search"
            enterKeyHint="search"
            placeholder="Например: массаж, картинг, мастер-класс"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={() => q.trim() && track('search', { q: q.trim(), results: results.length })}
          />
          {q.trim() === '' ? (
            <p className="muted">Ищем по названию и описанию среди {products.length} впечатлений.</p>
          ) : results.length === 0 ? (
            <p className="muted">Ничего не нашли. Попробуйте другое слово.</p>
          ) : (
            <ul className="results">
              {results.map((p) => (
                <li key={p.id}>
                  <button onClick={() => onOpen(p)}>
                    <img src={imgSrc(p)} alt="" loading="lazy" />
                    <span className="r-title">{p.title}</span>
                    <span className="price">{p.priceByn} BYN</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
