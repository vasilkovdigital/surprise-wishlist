import { useCallback, useEffect, useMemo, useState } from 'react'
import { buildDeck } from './lib/deck'
import { migrateProfile, type Profile } from './lib/profile'
import { load, save } from './lib/storage'
import { NO_FILTERS, type Filters, type Meta, type Product, type Settings, type Swipe } from './lib/types'

const BASE = import.meta.env.BASE_URL

/** После стольких свайпов предлагаем заполнить анкету (один раз). */
export const PROFILE_PROMPT_AFTER = 10

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

export function useWishlist(products: Product[] | null, recyclePassed: boolean) {
  const [liked, setLiked] = useState<string[]>(() => load('wl.liked', []))
  const [swipes, setSwipes] = useState<Swipe[]>(() => load('wl.swipes', []))
  const [filters, setFilters] = useState<Filters>(() => ({ ...NO_FILTERS, ...load<Partial<Filters>>('wl.filters', {}) }))
  const [seed] = useState<number>(() => {
    const s = load<number>('wl.seed', 0) || Math.floor(Math.random() * 2 ** 31)
    save('wl.seed', s)
    return s
  })

  useEffect(() => save('wl.liked', liked), [liked])
  useEffect(() => save('wl.swipes', swipes), [swipes])
  useEffect(() => save('wl.filters', filters), [filters])

  const deck = useMemo(
    () => (products ? buildDeck(products, filters, swipes, seed, recyclePassed) : []),
    [products, filters, swipes, seed, recyclePassed],
  )
  const byId = useMemo(() => new Map((products ?? []).map((p) => [p.id, p])), [products])

  const like = useCallback((id: string) => {
    setLiked((l) => (l.includes(id) ? l : [...l, id]))
    setSwipes((s) => [...s, { id, d: 'like' }])
    track('swipe_like', { id })
  }, [])
  const pass = useCallback((id: string) => {
    setSwipes((s) => [...s, { id, d: 'pass' }])
    track('swipe_pass', { id })
  }, [])
  const undo = useCallback(() => {
    setSwipes((s) => {
      const last = s[s.length - 1]
      if (!last) return s
      if (last.d === 'like') setLiked((l) => l.filter((x) => x !== last.id))
      return s.slice(0, -1)
    })
  }, [])
  const toggle = useCallback((id: string) => {
    setLiked((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]))
  }, [])
  const resetPassed = useCallback(() => setSwipes((s) => s.filter((x) => x.d === 'like')), [])
  const setCategory = useCallback((category: string | null) => {
    setFilters((f) => ({ ...f, category }))
    track('filter_set', { category })
  }, [])
  const applyFilters = useCallback((f: Filters) => {
    setFilters(f)
    track('filter_set', { ...f })
  }, [])

  return { liked, swipes, filters, deck, byId, like, pass, undo, toggle, resetPassed, setCategory, applyFilters }
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(() => migrateProfile(load<unknown>('wl.profile', null)))
  const [asked, setAsked] = useState<boolean>(() => load('wl.profileAsked', false))
  const saveProfile = useCallback((p: Profile) => {
    setProfile(p)
    save('wl.profile', p)
    track('profile_save', { fields: Object.keys(p).filter((k) => !!p[k as keyof Profile]) })
  }, [])
  const markAsked = useCallback(() => {
    setAsked(true)
    save('wl.profileAsked', true)
  }, [])
  const wipe = useCallback(() => {
    for (const k of ['wl.profile', 'wl.profileAsked', 'wl.settings', 'wl.liked', 'wl.swipes', 'wl.filters', 'wl.seed']) {
      try { localStorage.removeItem(k) } catch { /* ignore */ }
    }
    location.hash = ''
    location.reload()
  }, [])
  return { profile, asked, markAsked, saveProfile, wipe }
}
