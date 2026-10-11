import { useCallback, useEffect, useMemo, useState } from 'react'
import { PROMPT_EVERY_LIKES, PROMPT_EVERY_SWIPES } from './lib/config'
import { buildDeck } from './lib/deck'
import { migrateProfile, type Profile } from './lib/profile'
import { TTL_MS } from './lib/retention'
import { load, save } from './lib/storage'
import { NO_FILTERS, type Filters, type LikedItem, type Meta, type Product, type Settings, type Swipe } from './lib/types'

const BASE = import.meta.env.BASE_URL

export const track = (name: string, payload?: Record<string, unknown>) => {
  // Заглушка аналитики: позже сюда подключается GA / Яндекс.Метрика
  console.debug('[track]', name, payload ?? '')
}

export function imgSrc(p: Product) {
  return p.imageLocal ? BASE + p.imageLocal : p.image
}

export function useCatalog() {
  const [products, setProducts] = useState<Product[] | null>(null)
  const [meta, setMeta] = useState<Meta | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    // Дефолты для полей, которых может не быть в закэшированном/старом снимке каталога
    fetch(BASE + 'data/products.json')
      .then((r) => r.json())
      .then((list: Product[]) =>
        setProducts(list.map((p) => ({ ...p, interests: p.interests ?? [], cities: p.cities ?? [], ageGroups: p.ageGroups ?? ['adult'] }))),
      )
      .catch(() => setError(true))
    fetch(BASE + 'data/meta.json').then((r) => r.json()).then(setMeta).catch(() => {})
  }, [])
  return { products, meta, error }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => ({ recyclePassed: true, ...load<Partial<Settings>>('wl.settings', {}) }))
  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => {
      const n = { ...s, ...patch }
      save('wl.settings', n)
      track('settings_change', { ...patch })
      return n
    })
  }, [])
  return { settings, updateSettings: update }
}

/**
 * Аккаунт. Регистрация проходит на surprise.by; приложение узнаёт о ней через авторизацию (см. ТЗ §8).
 * В прототипе статус имитируется (кнопка «Демо» в профиле) и хранится локально.
 */
export interface Account { registered: boolean; email?: string; since?: string }

export function useAccount() {
  const [account, setAccount] = useState<Account>(() => load<Account>('wl.account', { registered: false }))
  const set = useCallback((a: Account) => { setAccount(a); save('wl.account', a) }, [])
  return { account, setAccount: set }
}

interface Counters { swipes: number; likes: number; ps: number; pl: number }

/**
 * Вишлист и история свайпов. У незарегистрированных всё старше DATA_TTL_DAYS удаляется
 * (при запуске, раз в 5 минут и при возврате во вкладку). Зарегистрированным — хранится бессрочно.
 * Раз в PROMPT_EVERY_SWIPES свайпов или PROMPT_EVERY_LIKES сохранений поднимается promptDue.
 */
export function useWishlist(products: Product[] | null, recyclePassed: boolean, registered: boolean) {
  const [likedItems, setLikedItems] = useState<LikedItem[]>(() => {
    const items = load<LikedItem[] | null>('wl.likedItems', null)
    if (items) return items
    const ids = load<string[]>('wl.liked', []) // старый формат без дат
    return ids.map((id) => ({ id, at: Date.now() }))
  })
  const [swipes, setSwipes] = useState<Swipe[]>(() => load<Swipe[]>('wl.swipes', []).map((s) => ({ ...s, at: s.at ?? Date.now() })))
  const [counters, setCounters] = useState<Counters>(() => ({ swipes: 0, likes: 0, ps: 0, pl: 0, ...load<Partial<Counters>>('wl.counters', {}) }))
  const [filters, setFilters] = useState<Filters>(() => ({ ...NO_FILTERS, ...load<Partial<Filters>>('wl.filters', {}) }))
  const [seed] = useState<number>(() => {
    const s = load<number>('wl.seed', 0) || Math.floor(Math.random() * 2 ** 31)
    save('wl.seed', s)
    return s
  })

  useEffect(() => save('wl.likedItems', likedItems), [likedItems])
  useEffect(() => save('wl.swipes', swipes), [swipes])
  useEffect(() => save('wl.counters', counters), [counters])
  useEffect(() => save('wl.filters', filters), [filters])

  // Срок хранения для незарегистрированных
  useEffect(() => {
    if (registered) return
    const purge = () => {
      const cutoff = Date.now() - TTL_MS
      setLikedItems((l) => { const n = l.filter((i) => i.at >= cutoff); return n.length === l.length ? l : n })
      setSwipes((s) => { const n = s.filter((x) => (x.at ?? Date.now()) >= cutoff); return n.length === s.length ? s : n })
    }
    purge()
    const t = window.setInterval(purge, 5 * 60 * 1000)
    const vis = () => { if (document.visibilityState === 'visible') purge() }
    document.addEventListener('visibilitychange', vis)
    return () => { window.clearInterval(t); document.removeEventListener('visibilitychange', vis) }
  }, [registered])

  const liked = useMemo(() => likedItems.map((i) => i.id), [likedItems])
  const expiresAt = useMemo(
    () => (likedItems.length ? Math.min(...likedItems.map((i) => i.at)) + TTL_MS : null),
    [likedItems],
  )
  const deck = useMemo(
    () => (products ? buildDeck(products, filters, swipes, seed, recyclePassed) : []),
    [products, filters, swipes, seed, recyclePassed],
  )
  const byId = useMemo(() => new Map((products ?? []).map((p) => [p.id, p])), [products])

  const promptDue = !registered && (counters.swipes - counters.ps >= PROMPT_EVERY_SWIPES || counters.likes - counters.pl >= PROMPT_EVERY_LIKES)
  const ackPrompt = useCallback(() => setCounters((c) => ({ ...c, ps: c.swipes, pl: c.likes })), [])

  const like = useCallback((id: string) => {
    setLikedItems((l) => (l.some((i) => i.id === id) ? l : [...l, { id, at: Date.now() }]))
    setSwipes((s) => [...s, { id, d: 'like', at: Date.now() }])
    setCounters((c) => ({ ...c, swipes: c.swipes + 1, likes: c.likes + 1 }))
    track('swipe_like', { id })
  }, [])
  const pass = useCallback((id: string) => {
    setSwipes((s) => [...s, { id, d: 'pass', at: Date.now() }])
    setCounters((c) => ({ ...c, swipes: c.swipes + 1 }))
    track('swipe_pass', { id })
  }, [])
  const undo = useCallback(() => {
    setSwipes((s) => {
      const last = s[s.length - 1]
      if (!last) return s
      if (last.d === 'like') setLikedItems((l) => l.filter((x) => x.id !== last.id))
      return s.slice(0, -1)
    })
  }, [])
  const toggle = useCallback((id: string) => {
    if (likedItems.some((i) => i.id === id)) {
      setLikedItems((l) => l.filter((i) => i.id !== id))
    } else {
      setLikedItems((l) => [...l, { id, at: Date.now() }])
      setCounters((c) => ({ ...c, likes: c.likes + 1 }))
    }
  }, [likedItems])
  const resetPassed = useCallback(() => setSwipes((s) => s.filter((x) => x.d === 'like')), [])
  const setCategory = useCallback((category: string | null) => {
    setFilters((f) => ({ ...f, category }))
    track('filter_set', { category })
  }, [])
  const setOccasion = useCallback((occasion: string | null) => {
    setFilters((f) => ({ ...f, occasion }))
    track('filter_set', { occasion })
  }, [])
  const applyFilters = useCallback((f: Filters) => {
    setFilters(f)
    track('filter_set', { ...f })
  }, [])

  return {
    liked, likedItems, expiresAt, swipes, filters, deck, byId,
    promptDue, ackPrompt,
    like, pass, undo, toggle, resetPassed, setCategory, setOccasion, applyFilters,
  }
}

/** Анкета — только у зарегистрированных (синхронизируется с аккаунтом на surprise.by). */
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(() => migrateProfile(load<unknown>('wl.profile', null)))
  const saveProfile = useCallback((p: Profile) => {
    setProfile(p)
    save('wl.profile', p)
    track('profile_save', { fields: Object.keys(p).filter((k) => !!p[k as keyof Profile]) })
  }, [])
  return { profile, saveProfile }
}

export function wipeAll() {
  for (const k of ['wl.profile', 'wl.account', 'wl.settings', 'wl.liked', 'wl.likedItems', 'wl.swipes', 'wl.counters', 'wl.filters', 'wl.seed', 'wl.uid', 'wl.profileAsked']) {
    try { localStorage.removeItem(k) } catch { /* ignore */ }
  }
  location.hash = ''
  location.reload()
}
