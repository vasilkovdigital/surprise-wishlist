import { useEffect, useState } from 'react'
import { Deck } from './components/Deck'
import { Detail } from './components/Detail'
import { Intro } from './components/Intro'
import { Onboarding } from './components/Onboarding'
import { ProfilePage } from './components/ProfilePage'
import { ShareSheet } from './components/ShareSheet'
import { Wishlist } from './components/Wishlist'
import { FEATURE_REG_GATE, REG_GATE_AFTER } from './lib/config'
import { daysToBirthday, plural } from './lib/profile'
import { parseSharedHash } from './lib/share'
import type { Product } from './lib/types'
import { track, useCatalog, useProfile, useWishlist } from './state'

type Tab = 'deck' | 'wishlist' | 'profile'
type ShareTarget = { kind: 'list' } | { kind: 'item'; product: Product }

export default function App() {
  const { products, meta, error } = useCatalog()
  const w = useWishlist(products)
  const { profile, saveProfile, wipe } = useProfile()
  const [tab, setTab] = useState<Tab>('deck')
  const [open, setOpen] = useState<Product | null>(null)
  const [sharing, setSharing] = useState<ShareTarget | null>(null)
  const [editingFilters, setEditingFilters] = useState(false)
  const [hash, setHash] = useState(location.hash)
  const [gate, setGate] = useState(false)

  useEffect(() => {
    const h = () => setHash(location.hash)
    window.addEventListener('hashchange', h)
    return () => window.removeEventListener('hashchange', h)
  }, [])

  if (error) return <div className="empty"><h2>Не удалось загрузить каталог</h2><p>Выполните <code>npm run sync</code>.</p></div>
  if (!products) return <div className="empty"><p className="muted">Загружаем впечатления…</p></div>

  // ---- режим просмотра чужой ссылки (доступен без онбординга) ----
  const shared = parseSharedHash(hash)
  if (shared) {
    const leave = () => { location.hash = ''; setTab('deck') }
    const from = shared.name
    if (shared.kind === 'item') {
      const p = w.byId.get(shared.id)
      return (
        <div className="app">
          <main className="main">
            <div className="empty">
              <img src="brand/mark_gift_dark.svg" alt="" width="72" />
              <h2>{from ? `${from} делится впечатлением` : 'Вам поделились впечатлением'}</h2>
              {p ? (
                <>
                  <p>{p.title}</p>
                  <button className="btn btn-green" onClick={() => { setOpen(p); track('open_card', { id: p.id, shared: true }) }}>Посмотреть</button>
                </>
              ) : <p className="muted">Это впечатление больше недоступно.</p>}
              <button className="btn btn-ink" onClick={leave}>Собрать свой вишлист</button>
            </div>
          </main>
          {open && <Detail product={open} liked={false} shared campaign="share" onToggle={() => {}} onClose={() => setOpen(null)} />}
        </div>
      )
    }
    const items = shared.ids.map((id) => w.byId.get(id) ?? { missing: id })
    return (
      <div className="app">
        <main className="main">
          <Wishlist
            items={items}
            readOnly
            title={from ? `Вишлист: ${from}` : 'Вишлист друга'}
            meta={meta}
            onOpen={(p) => { setOpen(p); track('open_card', { id: p.id, shared: true }) }}
            onBackToDeck={leave}
          />
        </main>
        {open && <Detail product={open} liked={false} shared campaign="share" onToggle={() => {}} onClose={() => setOpen(null)} />}
      </div>
    )
  }

  // ---- обязательный онбординг: имя + дата рождения ----
  if (!profile) {
    return (
      <div className="app">
        <main className="main"><Intro onSave={saveProfile} /></main>
      </div>
    )
  }

  const likedItems = w.liked.map((id) => w.byId.get(id)).filter((p): p is Product => !!p)
  const openCard = (p: Product) => { setOpen(p); track('open_card', { id: p.id }) }
  const onLike = (id: string) => {
    w.like(id)
    if (FEATURE_REG_GATE && w.liked.length + 1 > REG_GATE_AFTER) setGate(true)
  }

  if (!w.filters.done || editingFilters) {
    return (
      <div className="app">
        <main className="main">
          <Onboarding
            products={products}
            initial={w.filters}
            onDone={(f) => { w.applyFilters(f); setEditingFilters(false); setTab('deck') }}
          />
        </main>
      </div>
    )
  }

  const days = daysToBirthday(profile.birthDate)
  const nudge = days <= 30
    ? days === 0
      ? 'С днём рождения! 🎉 Отправьте вишлист друзьям — пусть выберут подарок.'
      : `До вашего дня рождения ${days} ${plural(days, 'день', 'дня', 'дней')} — отправьте вишлист гостям.`
    : null

  return (
    <div className="app">
      <header className="top">
        <img src="brand/logo_main_dark.svg" alt="Surprise" height="26" />
        {tab === 'deck' && <button className="link" onClick={() => setEditingFilters(true)}>Фильтры</button>}
      </header>
      <main className="main">
        {tab === 'deck' && (
          <Deck
            deck={w.deck}
            canUndo={w.swipes.length > 0}
            likedCount={w.liked.length}
            onLike={onLike}
            onPass={w.pass}
            onUndo={w.undo}
            onOpen={openCard}
            onReset={w.resetPassed}
            onOpenWishlist={() => setTab('wishlist')}
          />
        )}
        {tab === 'wishlist' && (
          <Wishlist
            items={likedItems}
            title={`Вишлист: ${profile.name}`}
            meta={meta}
            nudge={nudge}
            onOpen={openCard}
            onRemove={w.toggle}
            onShare={() => setSharing({ kind: 'list' })}
            onBackToDeck={() => setTab('deck')}
          />
        )}
        {tab === 'profile' && <ProfilePage profile={profile} onSave={saveProfile} onDelete={wipe} />}
      </main>
      <nav className="tabs">
        <button className={tab === 'deck' ? 'on' : ''} onClick={() => setTab('deck')}>Колода</button>
        <button className={tab === 'wishlist' ? 'on' : ''} onClick={() => setTab('wishlist')}>
          Вишлист{w.liked.length > 0 && <b className="badge">{w.liked.length}</b>}
        </button>
        <button className={tab === 'profile' ? 'on' : ''} onClick={() => setTab('profile')}>Профиль</button>
      </nav>
      {open && (
        <Detail
          product={open}
          liked={w.liked.includes(open.id)}
          campaign={tab === 'wishlist' ? 'wishlist' : 'card'}
          onToggle={() => w.toggle(open.id)}
          onClose={() => setOpen(null)}
          onShare={() => setSharing({ kind: 'item', product: open })}
        />
      )}
      {sharing && (
        <ShareSheet
          kind={sharing.kind}
          ids={sharing.kind === 'list' ? w.liked : [sharing.product.id]}
          itemTitle={sharing.kind === 'item' ? sharing.product.title : undefined}
          defaultName={profile.name}
          onClose={() => setSharing(null)}
        />
      )}
      {gate && (
        <div className="sheet-back" onClick={() => setGate(false)}>
          <div className="sheet sheet-small" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-body">
              <h2>Сохраните вишлист</h2>
              <p className="muted">В будущем здесь регистрация: почта и пароль; имя и дата рождения подтянутся из профиля. Пока это заглушка.</p>
              <button className="btn btn-ink" onClick={() => setGate(false)}>Понятно</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
