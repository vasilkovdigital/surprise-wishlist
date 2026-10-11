// Вишлист целиком в URL: #/w/1~<дельты в base36 через точку>
const VERSION = '1~'

export function encodeWishlist(ids: string[]): string {
  const nums = ids.map(Number).filter(Number.isFinite).sort((a, b) => a - b)
  let prev = 0
  return VERSION + nums.map((n) => { const d = n - prev; prev = n; return d.toString(36) }).join('.')
}

export function decodeWishlist(code: string): string[] {
  if (!code.startsWith(VERSION)) return []
  let acc = 0
  return code.slice(VERSION.length).split('.').filter(Boolean).map((p) => {
    acc += parseInt(p, 36)
    return String(acc)
  })
}

function query(name?: string, uid?: string) {
  const p = new URLSearchParams()
  if (name) p.set('n', name)
  if (uid) p.set('u', uid) // кто поделился — для атрибуции рефералов
  const q = p.toString()
  return q ? `?${q}` : ''
}

export function shareUrl(ids: string[], name?: string, uid?: string) {
  return `${location.href.split('#')[0]}#/w/${encodeWishlist(ids)}${query(name, uid)}`
}

export function itemUrl(id: string, name?: string, uid?: string) {
  return `${location.href.split('#')[0]}#/i/${id}${query(name, uid)}`
}

export type Shared =
  | { kind: 'list'; ids: string[]; name?: string; ref?: string }
  | { kind: 'item'; id: string; name?: string; ref?: string }

export function parseSharedHash(hash: string): Shared | null {
  const m = hash.match(/^#\/([wi])\/([^?]*)(?:\?(.*))?$/)
  if (!m) return null
  const q = new URLSearchParams(m[3] ?? '')
  const name = q.get('n') ?? undefined
  const ref = q.get('u') ?? undefined
  const body = decodeURIComponent(m[2])
  return m[1] === 'w' ? { kind: 'list', ids: decodeWishlist(body), name, ref } : { kind: 'item', id: body, name, ref }
}
