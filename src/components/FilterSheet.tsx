import { useMemo, useState } from 'react'
import {
  AGE_GROUPS, CATEGORY_LABELS, CITIES, INTERESTS, OCCASIONS, PRICE_PRESETS,
} from '../lib/config'
import { matches } from '../lib/deck'
import { NO_FILTERS, type Filters, type Product } from '../lib/types'

interface Props {
  products: Product[]
  initial: Filters
  onApply: (f: Filters) => void
  onClose: () => void
}

function Chips<T extends string>({ options, value, onPick }: {
  options: ReadonlyArray<{ id: T; label: string }>
  value: T | null
  onPick: (v: T | null) => void
}) {
  return (
    <div className="opts tight">
      {options.map((o) => (
        <button type="button" key={o.id} className={`opt ${value === o.id ? 'on' : ''}`} onClick={() => onPick(value === o.id ? null : o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

const num = (v: string) => (v.trim() === '' ? null : Math.max(0, Math.round(Number(v))) || null)

export function FilterSheet({ products, initial, onApply, onClose }: Props) {
  const [f, setF] = useState<Filters>(initial)
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((x) => ({ ...x, [k]: v }))
  const count = useMemo(() => products.filter((p) => matches(p, f)).length, [products, f])
  const toggleInterest = (id: string) =>
    set('interests', f.interests.includes(id) ? f.interests.filter((x) => x !== id) : [...f.interests, id])
  const presetOn = (min: number | null, max: number | null) => f.priceMin === min && f.priceMax === max

  return (
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Фильтры" onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" aria-label="Закрыть" onClick={onClose}>✕</button>
        <div className="sheet-body filters-body">
          <h2>Фильтры</h2>

          <div className="lbl">Город
            <Chips options={CITIES} value={f.city} onPick={(v) => set('city', v)} />
            <span className="muted small">Часть впечатлений без указанного города показывается во всех городах.</span>
          </div>

          <div className="lbl">Категория
            <Chips
              options={Object.entries(CATEGORY_LABELS).map(([id, label]) => ({ id, label }))}
              value={f.category}
              onPick={(v) => set('category', v)}
            />
          </div>

          <div className="lbl">Интересы
            <div className="opts tight">
              {INTERESTS.map((o) => (
                <button type="button" key={o.id} className={`opt ${f.interests.includes(o.id) ? 'on' : ''}`} onClick={() => toggleInterest(o.id)}>{o.label}</button>
              ))}
            </div>
          </div>

          <div className="lbl">Цена, BYN
            <div className="price-row">
              <input className="field" inputMode="numeric" placeholder="от" aria-label="Цена от" value={f.priceMin ?? ''} onChange={(e) => set('priceMin', num(e.target.value))} />
              <span>—</span>
              <input className="field" inputMode="numeric" placeholder="до" aria-label="Цена до" value={f.priceMax ?? ''} onChange={(e) => set('priceMax', num(e.target.value))} />
            </div>
            <div className="opts tight">
              {PRICE_PRESETS.map((p) => (
                <button type="button" key={p.label} className={`opt ${presetOn(p.min, p.max) ? 'on' : ''}`}
                  onClick={() => (presetOn(p.min, p.max) ? setF((x) => ({ ...x, priceMin: null, priceMax: null })) : setF((x) => ({ ...x, priceMin: p.min, priceMax: p.max })))}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lbl">Возраст получателя
            <Chips options={AGE_GROUPS} value={f.age} onPick={(v) => set('age', v)} />
          </div>

          <div className="lbl">Пол получателя
            <Chips options={[{ id: 'her', label: 'Для неё' }, { id: 'him', label: 'Для него' }] as const} value={f.gender} onPick={(v) => set('gender', v)} />
          </div>

          <div className="lbl">Повод
            <Chips options={OCCASIONS} value={f.occasion} onPick={(v) => set('occasion', v)} />
          </div>
        </div>
        <div className="sheet-foot">
          <button className="btn btn-ghost" onClick={() => setF({ ...NO_FILTERS })}>Сбросить</button>
          <button className="btn btn-ink" disabled={count === 0} onClick={() => { onApply(f); onClose() }}>
            {count === 0 ? 'Ничего не найдено' : `Показать (${count})`}
          </button>
        </div>
      </div>
    </div>
  )
}
