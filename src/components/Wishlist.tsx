import { DATA_TTL_DAYS } from '../lib/config'
import { formatRemaining } from '../lib/retention'
import type { Meta, Product } from '../lib/types'
import { track } from '../state'
import { imgSrc } from '../state'
import { BonusBanner } from './BonusBanner'

interface Props {
  items: Array<Product | { missing: string }>
  readOnly?: boolean
  title: string
  meta: Meta | null
  onOpen: (p: Product) => void
  onRemove?: (id: string) => void
  onShare?: () => void
  onBackToDeck: () => void
  nudge?: string | null
  /** Только для незарегистрированных: срок хранения и ссылка на регистрацию */
  retention?: { expiresAt: number | null; registerHref: string }
}

export function Wishlist({ items, readOnly, title, meta, onOpen, onRemove, onShare, onBackToDeck, nudge, retention }: Props) {
  const real = items.filter((i): i is Product => 'id' in i)
  const total = real.reduce((s, p) => s + p.priceByn, 0)

  if (items.length === 0) {
    return (
      <div className="empty">
        <img src="brand/mark_smile_dark.svg" alt="" width="72" />
        <h2>Пока пусто</h2>
        <p>Нажимайте ♥ на впечатлениях, которые хочется получить в подарок, — они соберутся здесь.</p>
        <button className="btn btn-ink" onClick={onBackToDeck}>К впечатлениям</button>
      </div>
    )
  }

  return (
    <div className="wl">
      <h1>{title}</h1>
      <p className="muted">{real.length} впечатл. · итого ≈ {total} BYN</p>
      {!readOnly && retention && (
        <div className="keep">
          <strong>Вишлист хранится {DATA_TTL_DAYS} дня</strong>
          <span>
            {retention.expiresAt != null && `Самое раннее впечатление удалится через ${formatRemaining(retention.expiresAt - Date.now())}. `}
            Зарегистрируйтесь бесплатно — и список сохранится.
          </span>
          <a className="btn btn-ink" href={retention.registerHref} target="_blank" rel="noopener" onClick={() => track('register_click', { from: 'wishlist' })}>
            Зарегистрироваться
          </a>
        </div>
      )}
      {!readOnly && nudge && <div className="nudge">{nudge}</div>}
      {!readOnly && onShare && <button className="btn btn-green full" onClick={onShare}>Поделиться вишлистом</button>}
      <div className="grid">
        {items.map((it, i) =>
          'id' in it ? (
            <div key={it.id} className="tile">
              <button className="tile-main" onClick={() => onOpen(it)}>
                <img src={imgSrc(it)} alt="" loading="lazy" />
                <span className="tile-title">{it.title}</span>
                <span className="price">{it.priceByn} BYN</span>
              </button>
              {!readOnly && onRemove && <button className="tile-x" aria-label="Убрать" onClick={() => onRemove(it.id)}>✕</button>}
            </div>
          ) : (
            <div key={it.missing + i} className="tile tile-missing"><span>Впечатление больше недоступно</span></div>
          ),
        )}
      </div>
      <BonusBanner />
      {readOnly && <button className="btn btn-ink full" onClick={onBackToDeck}>Собрать свой вишлист</button>}
      {meta && <p className="muted foot">Каталог обновлён: {new Date(meta.syncedAt).toLocaleDateString('ru-RU')}</p>}
    </div>
  )
}
