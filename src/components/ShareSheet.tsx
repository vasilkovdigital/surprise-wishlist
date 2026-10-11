import { useState } from 'react'
import { itemUrl, shareUrl } from '../lib/share'
import { track } from '../state'

interface Props {
  /** list — весь вишлист, item — одно впечатление (ids[0]) */
  kind: 'list' | 'item'
  ids: string[]
  itemTitle?: string
  defaultName?: string
  onClose: () => void
}

export function ShareSheet({ kind, ids, itemTitle, defaultName = '', onClose }: Props) {
  const [name, setName] = useState(defaultName)
  const [copied, setCopied] = useState(false)
  const n = name.trim() || undefined
  const url = kind === 'list' ? shareUrl(ids, n) : itemUrl(ids[0], n)
  const msg = kind === 'list' ? 'Мой вишлист впечатлений на Surprise.by' : `Хочу это попробовать: ${itemTitle ?? 'впечатление'}`
  const text = encodeURIComponent(msg)
  const u = encodeURIComponent(url)

  const copy = async () => {
    try { await navigator.clipboard.writeText(url) } catch {
      const el = document.getElementById('share-url') as HTMLInputElement | null
      el?.select(); document.execCommand('copy')
    }
    setCopied(true); track('share', { kind, via: 'copy', n: ids.length })
    window.setTimeout(() => setCopied(false), 1800)
  }
  const native = () => {
    track('share', { kind, via: 'native', n: ids.length })
    navigator.share({ title: msg, text: msg, url }).catch(() => {})
  }
  const via = (v: string) => () => track('share', { kind, via: v, n: ids.length })

  return (
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet sheet-small" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" aria-label="Закрыть" onClick={onClose}>✕</button>
        <div className="sheet-body">
          <h2>{kind === 'list' ? 'Поделиться вишлистом' : 'Поделиться впечатлением'}</h2>
          <p className="muted">
            {kind === 'list'
              ? `В ссылке — весь список (${ids.length}). Откроется у любого, регистрация не нужна.`
              : 'Ссылка откроет это впечатление у любого, регистрация не нужна.'}
          </p>
          <input className="field" placeholder="От чьего имени (необязательно)" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
          <input id="share-url" className="field mono" readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
          <div className="share-row">
            <button className="btn btn-ink" onClick={copy}>{copied ? 'Скопировано ✓' : 'Скопировать ссылку'}</button>
            {typeof navigator.share === 'function' && <button className="btn btn-green" onClick={native}>Отправить…</button>}
          </div>
          <div className="share-row">
            <a className="btn btn-ghost" target="_blank" rel="noopener" onClick={via('telegram')} href={`https://t.me/share/url?url=${u}&text=${text}`}>Telegram</a>
            <a className="btn btn-ghost" target="_blank" rel="noopener" onClick={via('whatsapp')} href={`https://wa.me/?text=${text}%20${u}`}>WhatsApp</a>
            <a className="btn btn-ghost" target="_blank" rel="noopener" onClick={via('viber')} href={`viber://forward?text=${text}%20${u}`}>Viber</a>
          </div>
        </div>
      </div>
    </div>
  )
}
