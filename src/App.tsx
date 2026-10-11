import { useEffect, useState } from 'react'
import { AboutSheet } from './components/AboutSheet'
import { Deck } from './components/Deck'
import { Detail } from './components/Detail'
import { FilterBar } from './components/FilterBar'
import { FilterSheet } from './components/FilterSheet'
import { ProfileForm } from './components/ProfileForm'
import { ProfilePage } from './components/ProfilePage'
import { SearchSheet } from './components/SearchSheet'
import { ShareSheet } from './components/ShareSheet'
import { Wishlist } from './components/Wishlist'
import { FEATURE_REG_GATE, REG_GATE_AFTER } from './lib/config'
import { activeFilterCount } from './lib/deck'
import { avatarTone } from './components/ProfilePage'
import { daysToBirthday, plural } from './lib/profile'
import { parseSharedHash } from './lib/share'
import type { Product } from './lib/types'
import { PROFILE_PROMPT_AFTER, track, useCatalog, useProfile, useSettings, useWishlist } from './state'

type Tab = 'deck' | 'wishlist' | 'profile'
type ShareTarget = { kind: 'list' } | { kind: 'item'; product: Product }

export default function App() {
  const { products, meta, error } = useCatalog()
  const { settings, updateSettings } = useSettings()
  const w = useWishlist(products, settings.recyclePassed)
  const { profile, asked, markAsked, saveProfile, wipe } = useProfile()
  const [tab, setTab] = useState<Tab>('deck')
  const [open, setOpen] = useState<Product | null>(null)
  const [sharing, setSharing] = useState<ShareTarget | null>(null)
  const [hash, setHash] = useState(location.hash)
  const [gate, setGate] = useState(false)
  const [askProfile, setAskProfile] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const h = () => setHash(location.hash)
    window.addEventListener('hashchange', h)
    return () => window.removeEventListener('hashchange', h)
  }, [])

  // После 10-го свайпа один раз предлагаем заполнить анкету
  const swipeCount = w.swipes.length
  useEffect(() => {
    if (!profile && !asked && swipeCount >= PROFILE_PROMPT_AFTER) {
      setAskProfile(true)
      markAsked()
      track('profile_prompt_shown', { swipes: swipeCount })
    }
  }, [swipeCount, profile, asked, markAsked])

  if (error) return <div className="empty"><h2>Не удалось загрузить каталог</h2><p>Выполните <code>npm run sync</code>.</p></div>
  if (!products) return <div className="empty"><p className="muted">Загружаем впечатления…</p></div>

  // ---- режим просмотра чужой ссылки ----
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
          {open && <Detail product={open} liked={false} shared sharedBy={shared.ref} campaign="share" onToggle={() => {}} onClose={() => setOpen(null)} />}
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
        {open && <Detail product={open} liked={false} shared sharedBy={shared.ref} campaign="share" onToggle={() => {}} onClose={() => setOpen(null)} />}
      </div>
    )
  }

  const likedItems = w.liked.map((id) => w.byId.get(id)).filter((p): p is Product => !!p)
  const openCard = (p: Product) => { setOpen(p); track('open_card', { id: p.id }) }
  const onLike = (id: string) => {
    w.like(id)
    if (FEATURE_REG_GATE && w.liked.length + 1 > REG_GATE_AFTER) setGate(true)
  }

  let nudge: string | null = null
  if (profile) {
    const days = daysToBirthday(profile.birthDay, profile.birthMonth)
    if (days <= 30) {
      nudge = days === 0
        ? 'С днём рождения! 🎉 Отправьте вишлист друзьям — пусть выберут подарок.'
        : `До вашего дня рождения ${days} ${plural(days, 'день', 'дня', 'дней')} — отправьте вишлист гостям.`
    }
  }

  return (
    <div className="app">
      <header className="top">
        <img src="brand/logo_main_dark.svg" alt="Surprise" height="26" />
        <div className="top-actions">
          <button className="icon-btn" aria-label="Поиск" onClick={() => { setSearchOpen(true); track('search_open') }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </button>
          <button className="link" onClick={() => { setAboutOpen(true); track('about_open') }}>О приложении</button>
          <button
            className={`avatar-btn ${tab === 'profile' ? 'on' : ''}`}
            aria-label={profile ? `Профиль: ${profile.name}` : 'Профиль'}
            aria-current={tab === 'profile' ? 'page' : undefined}
            style={profile ? { background: avatarTone(profile.name) } : undefined}
            onClick={() => setTab(tab === 'profile' ? 'deck' : 'profile')}
          >
            {profile ? (
              profile.name.trim()[0]?.toUpperCase()
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
            )}
            {!profile && <i className="dot" aria-hidden="true" />}
          </button>
        </div>
      </header>
      <div className="confetti-strip" aria-hidden="true"><i /><i /><i /><i /></div>
      {tab === 'deck' && (
        <FilterBar
          products={products}
          category={w.filters.category}
          occasion={w.filters.occasion}
          activeCount={activeFilterCount(w.filters)}
          onCategory={w.setCategory}
          onOccasion={w.setOccasion}
          onOpenFilters={() => setFiltersOpen(true)}
        />
      )}
      <main className="main">
        {tab === 'deck' && (
          <Deck
            deck={w.deck}
            canUndo={w.swipes.length > 0}
            likedCount={w.liked.length}
            recyclePassed={settings.recyclePassed}
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
            title={profile ? `Вишлист: ${profile.name}` : 'Мой вишлист'}
            meta={meta}
            nudge={nudge}
            onOpen={openCard}
            onRemove={w.toggle}
            onShare={() => setSharing({ kind: 'list' })}
            onBackToDeck={() => setTab('deck')}
          />
        )}
        {tab === 'profile' && (
          <ProfilePage profile={profile} settings={settings} onSettings={updateSettings} onSave={saveProfile} onDelete={wipe} />
        )}
      </main>
      <nav className="tabs">
        <button className={tab === 'deck' ? 'on' : ''} onClick={() => setTab('deck')}>Впечатления</button>
        <button className={tab === 'wishlist' ? 'on' : ''} onClick={() => setTab('wishlist')}>
          Вишлист{w.liked.length > 0 && <b className="badge">{w.liked.length}</b>}
        </button>
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
          senderName={profile?.name}
          onClose={() => setSharing(null)}
        />
      )}
      {searchOpen && (
        <SearchSheet
          products={products}
          onOpen={(p) => { setSearchOpen(false); openCard(p) }}
          onClose={() => setSearchOpen(false)}
        />
      )}
      {aboutOpen && <AboutSheet meta={meta} count={products.length} onClose={() => setAboutOpen(false)} />}
      {filtersOpen && (
        <FilterSheet products={products} initial={w.filters} onApply={w.applyFilters} onClose={() => setFiltersOpen(false)} />
      )}
      {askProfile && !profile && (
        <div className="sheet-back" onClick={() => setAskProfile(false)}>
          <div className="sheet sheet-small" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-body">
              <h2>Расскажите о себе</h2>
              <p className="muted">Вы уже посмотрели {PROFILE_PROMPT_AFTER} впечатлений. Заполните анкету — поздравим с днём рождения и подскажем подарки к празднику.</p>
              <ProfileForm
                mode="onboarding"
                onSave={(p) => { saveProfile(p); setAskProfile(false) }}
              />
              <button className="btn btn-ghost" onClick={() => setAskProfile(false)}>Позже</button>
            </div>
          </div>
        </div>
      )}
      {gate && (
        <div className="sheet-back" onClick={() => setGate(false)}>
          <div className="sheet sheet-small" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-body">
              <h2>Сохраните вишлист</h2>
              <p className="muted">В будущем здесь регистрация: почта и пароль; данные анкеты подтянутся из профиля. Пока это заглушка.</p>
              <button className="btn btn-ink" onClick={() => setGate(false)}>Понятно</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
