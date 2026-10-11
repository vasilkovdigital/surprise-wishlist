import { UTM_SOURCE } from './config'
import { getUserId } from './uid'

export type UtmCampaign = 'swipe' | 'wishlist' | 'card' | 'share' | 'about' | 'register' | 'profile'

/** Откуда открыто приложение: telegram (Mini App), pwa (установлено на экран), app (браузер). */
export function entryMedium(): 'telegram' | 'pwa' | 'app' {
  try {
    if (/tgWebAppData|tgWebAppVersion/.test(location.hash + location.search)) return 'telegram'
    if (new URLSearchParams(location.search).get('src') === 'telegram') return 'telegram'
    if (window.matchMedia?.('(display-mode: standalone)').matches) return 'pwa'
  } catch { /* ignore */ }
  return 'app'
}

interface UtmOptions {
  /** id услуги (впечатления) → utm_content */
  id?: string
  /** переход из чужой шеринг-ссылки: utm_medium=share */
  shared?: boolean
  /** id того, кто поделился ссылкой → ref (атрибуция рефералов) */
  ref?: string
}

/**
 * Добавляет UTM к исходящей ссылке на surprise.by, сохраняя существующие параметры:
 *  utm_source   — wishlist_app
 *  utm_medium   — app | pwa | telegram | share
 *  utm_campaign — card | wishlist | share | about
 *  utm_content  — id услуги (впечатления)
 *  utm_term     — id пользователя (анонимный, wl.uid)
 *  ref          — id пользователя, который поделился ссылкой (если открыта чужая)
 */
export function withUtm(url: string, campaign: UtmCampaign, opts: UtmOptions = {}) {
  const u = new URL(url)
  u.searchParams.set('utm_source', UTM_SOURCE)
  u.searchParams.set('utm_medium', opts.shared ? 'share' : entryMedium())
  u.searchParams.set('utm_campaign', campaign)
  if (opts.id) u.searchParams.set('utm_content', opts.id)
  u.searchParams.set('utm_term', getUserId())
  if (opts.ref) u.searchParams.set('ref', opts.ref)
  return u.toString()
}
