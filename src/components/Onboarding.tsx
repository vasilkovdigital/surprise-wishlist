import { useState } from 'react'
import { BUDGETS, OCCASIONS, WHO } from '../lib/config'
import { matches } from '../lib/deck'
import type { Filters, Product } from '../lib/types'

interface Props {
  products: Product[]
  initial: Filters
  onDone: (f: Filters) => void
}

export function Onboarding({ products, initial, onDone }: Props) {
  const [step, setStep] = useState(1)
  const [f, setF] = useState<Filters>(initial)
  const count = products.filter((p) => matches(p, f)).length

  const pick = <K extends 'who' | 'budget' | 'occasion'>(k: K, v: Filters[K]) => {
    const nf = { ...f, [k]: f[k] === v ? null : v }
    setF(nf)
  }

  const titles = ['', 'Для кого впечатление?', 'Какой бюджет?', 'Есть повод?']
  const options =
    step === 1 ? WHO.map((o) => ({ id: o.id, label: o.label, on: f.who === o.id, set: () => pick('who', o.id) }))
    : step === 2 ? BUDGETS.map((o) => ({ id: o.id, label: o.label, on: f.budget === o.id, set: () => pick('budget', o.id) }))
    : OCCASIONS.map((o) => ({ id: o.id, label: o.label, on: f.occasion === o.id, set: () => pick('occasion', o.id) }))

  return (
    <div className="onb">
      <div className="steps">{[1, 2, 3].map((n) => <i key={n} className={n <= step ? 'on' : ''} />)}</div>
      <h1>{titles[step]}</h1>
      <p className="muted">Можно пропустить — тогда покажем всё.</p>
      <div className="opts">
        {options.map((o) => (
          <button key={o.id} className={`opt ${o.on ? 'on' : ''}`} onClick={o.set}>{o.label}</button>
        ))}
      </div>
      <div className="onb-foot">
        <span className="muted">{count > 0 ? `Подходит: ${count}` : 'Ничего не нашли — смягчите фильтры'}</span>
        {step < 3 ? (
          <button className="btn btn-ink" onClick={() => setStep(step + 1)}>Дальше</button>
        ) : (
          <button className="btn btn-ink" disabled={count === 0} onClick={() => onDone({ ...f, done: true })}>Показать ({count})</button>
        )}
      </div>
      <button className="btn btn-ghost" onClick={() => onDone({ done: true, who: null, budget: null, occasion: null })}>Показать всё без фильтров</button>
    </div>
  )
}
