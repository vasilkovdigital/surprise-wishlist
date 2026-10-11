import { useState } from 'react'
import { CATEGORY_LABELS } from '../lib/config'
import type { Product } from '../lib/types'
import { withUtm, type UtmCampaign } from '../lib/utm'
import { imgSrc, track } from '../state'
import { BonusBanner } from './BonusBanner'

interface Props {
  product: Product
  liked: boolean
  campaign: UtmCampaign
  shared?: boolean
  onToggle: () => void
  onClose: () => void
  onShare?: () => void
}

function youtubeId(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)
  return m?.[1]
}

export function Detail({ product: p, liked, campaign, shared, onToggle, onClose, onShare }: Props) {
  const [video, setVideo] = useState(false)
  const yt = p.video ? youtubeId(p.video) : undefined
  const pics = [imgSrc(p), ...p.images]
  const cats = p.categories.map((c) => CATEGORY_LABELS[c]).filter(Boolean)

  return (
    <div className="sheet-back" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={p.title} onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" aria-label="Закрыть" onClick={onClose}>✕</button>
        <div className="gallery">
          {pics.map((src, i) => <img key={src + i} src={src} alt="" loading={i ? 'lazy' : 'eager'} />)}
        </div>
        {pics.length > 1 && <div className="muted gallery-n">{pics.length} фото — листайте →</div>}
        <div className="sheet-body">
          {cats.length > 0 && <div className="chips">{cats.map((c) => <span key={c} className="chip chip-dark">{c}</span>)}</div>}
          <h2>{p.title}</h2>
          <div className="price big">{p.priceByn} BYN</div>
          <p className="desc">{p.description}</p>
          {yt && (video ? (
            <iframe className="video" src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1`} title="Видео" allow="autoplay; encrypted-media" allowFullScreen />
          ) : (
            <button className="btn btn-ghost" onClick={() => setVideo(true)}>▶ Смотреть видео</button>
          ))}
          {onShare && <button className="btn btn-ghost" onClick={onShare}>Поделиться этим впечатлением</button>}
          <BonusBanner />
        </div>
        <div className="sheet-foot">
          <button className={`btn ${liked ? 'btn-ghost' : 'btn-green'}`} onClick={onToggle}>{liked ? 'Убрать из вишлиста' : '♥ В вишлист'}</button>
          <a
            className="btn btn-ink"
            href={withUtm(p.url, campaign, p.id, shared)}
            target="_blank"
            rel="noopener"
            onClick={() => track('outbound_click', { id: p.id, campaign })}
          >
            Смотреть на surprise.by
          </a>
        </div>
      </div>
    </div>
  )
}
