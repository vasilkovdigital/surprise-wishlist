import { UTM_SOURCE } from './config'

export type UtmCampaign = 'swipe' | 'wishlist' | 'card' | 'share'

/** Добавляет UTM к ссылке, сохраняя существующие параметры. */
export function withUtm(url: string, campaign: UtmCampaign, id: string, shared = false) {
  const u = new URL(url)
  u.searchParams.set('utm_source', UTM_SOURCE)
  u.searchParams.set('utm_medium', shared ? 'share' : 'app')
  u.searchParams.set('utm_campaign', campaign)
  u.searchParams.set('utm_content', id)
  return u.toString()
}
