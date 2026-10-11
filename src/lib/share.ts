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

export function shareUrl(ids: string[], name?: string) {
  const base = location.href.split('#')[0]
  const q = name ? `?n=${encodeURIComponent(name)}` : ''
  return `${base}#/w/${encodeWishlist(ids)}${q}`
}

export function itemUrl(id: string, name?: string) {
  const base = location.href.split('#')[0]
  const q = name ? `?n=${encodeURIComponent(name)}` : ''
  return `${base}#/i/${id}${q}`
}

export type Shared = { kind: 'list'; ids: string[]; name?: string } | { kind: 'item'; id: string; name?: string }

export function parseSharedHash(hash: string): Shared | null {
  const m = hash.match(/^#\/([wi])\/([^?]*)(?:\?(.*))?$/)
  if (!m) return null
  const name = new URLSearchParams(m[3] ?? '').get('n') ?? undefined
  const body = decodeURIComponent(m[2])
  return m[1] === 'w' ? { kind: 'list', ids: decodeWishlist(body), name } : { kind: 'item', id: body, name }
}
