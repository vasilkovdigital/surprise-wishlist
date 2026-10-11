import { useState } from 'react'
import { BRAND_PATHS } from '../icons/brands'
import { itemUrl, shareUrl } from '../lib/share'
import { track } from '../state'

interface Props {
  /** list — весь вишлист, item — одно впечатление (ids[0]) */
  kind: 'list' | 'item'
  ids: string[]
  itemTitle?: string
  /** Имя отправителя из профиля — подставляется в ссылку молча */
  senderName?: string
  onClose: () => void
}

const Brand = ({ name }: { name: string }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="currentColor"><path d={BRAND_PATHS[name]} /></svg>
)

export function ShareSheet({ kind, ids, itemTitle, senderName, onClose }: Props) {
  const [note, setNote] = useState('')
  const url = kind === 'list' ? shareUrl(ids, senderName) : itemUrl(ids[0], senderName)
  const msg = kind === 'list' ? 'Мой вишлист впечатлений на Surprise.by' : `Хочу это попробовать: ${itemTitle ?? 'впечатление'}`
  const text = encodeURIComponent(msg)
  const u = encodeURIComponent(url)

  const toast = (s: string) => { setNote(s); window.setTimeout(() => setNote(''), 2600) }
  const copyText = async () => {
    try { await navigator.clipboard.writeText(url) } catch {
      const el = document.getElementById('share-url') as HTMLInputElement | null
      el?.select(); document.execCommand('copy')
    }
  }
  const copy = async () => { await copyText(); toast('Ссылка скопирована'); track('share', { kind, via: 'copy' }) }
  // У Instagram нет веб-ссылки для отправки: копируем ссылку и открываем Direct
  const instagram = async () => {
    await copyText()
    toast('Ссылка скопирована — вставьте её в чат Instagram')
    track('share', { kind, via: 'instagram' })
    window.open('https://www.instagram.com/direct/inbox/', '_blank', 'noopener')
  }
  const native = () => {
    track('share', { kind, via: 'native' })
    navigator.share({ title: msg, text: msg, url }).catch(() => {})
  }
  const via = (v: string) => () => track('share', { kind, via: v })

  return (
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet sheet-small" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" aria-label="Закрыть" onClick={onClose}>✕</button>
        <div className="sheet-body">
          <h2>{kind === 'list' ? 'Поделиться вишлистом' : 'Поделиться впечатлением'}</h2>
          <input id="share-url" className="field mono" readOnly value={url} aria-label="Ссылка" onFocus={(e) => e.currentTarget.select()} />
          <div className="share-icons">
            <button className="sicon" onClick={copy} aria-label="Скопировать ссылку" title="Скопировать">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
            </button>
            <a className="sicon" target="_blank" rel="noopener" aria-label="Telegram" title="Telegram" onClick={via('telegram')} href={`https://t.me/share/url?url=${u}&text=${text}`}><Brand name="telegram" /></a>
            <a className="sicon" target="_blank" rel="noopener" aria-label="WhatsApp" title="WhatsApp" onClick={via('whatsapp')} href={`https://wa.me/?text=${text}%20${u}`}><Brand name="whatsapp" /></a>
            <a className="sicon" target="_blank" rel="noopener" aria-label="Viber" title="Viber" onClick={via('viber')} href={`viber://forward?text=${text}%20${u}`}><Brand name="viber" /></a>
            <button className="sicon" onClick={instagram} aria-label="Instagram" title="Instagram"><Brand name="instagram" /></button>
            {typeof navigator.share === 'function' && (
              <button className="sicon" onClick={native} aria-label="Другие приложения" title="Другие приложения">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
              </button>
            )}
          </div>
          <p className="muted share-note" role="status">{note || ' '}</p>
        </div>
      </div>
    </div>
  )
}
