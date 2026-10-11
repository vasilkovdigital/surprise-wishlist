import { useRef, useState } from 'react'
import { CATEGORY_LABELS } from '../lib/config'
import type { Product } from '../lib/types'
import { imgSrc } from '../state'

interface Props {
  product: Product
  top: boolean
  onSwipe: (dir: 'like' | 'pass') => void
  onOpen: () => void
  /** Внешняя команда (кнопки/клавиши): улететь в сторону */
  fling: 'like' | 'pass' | null
}

const THRESHOLD = 90

export function SwipeCard({ product: p, top, onSwipe, onOpen, fling }: Props) {
  const [dx, setDx] = useState(0)
  const [flying, setFlying] = useState<'like' | 'pass' | null>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const moved = useRef(false)

  const dir = flying ?? fling
  const x = dir === 'like' ? 520 : dir === 'pass' ? -520 : dx
  const style = top
    ? {
        transform: `translateX(${x}px) rotate(${x / 18}deg)`,
        transition: start.current ? 'none' : 'transform .28s ease-out, opacity .28s',
        opacity: dir ? 0 : 1,
      }
    : undefined

  const finish = (d: 'like' | 'pass') => {
    setFlying(d)
    window.setTimeout(() => onSwipe(d), 220)
  }

  const cat = p.categories.slice(0, 2).map((c) => CATEGORY_LABELS[c]).filter(Boolean)

  return (
    <article
      className={`card ${top ? 'card-top' : 'card-next'}`}
      style={style}
      onPointerDown={(e) => {
        if (!top || dir) return
        start.current = { x: e.clientX, y: e.clientY }
        moved.current = false
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!start.current) return
        const d = e.clientX - start.current.x
        if (Math.abs(d) > 6) moved.current = true
        setDx(d)
      }}
      onPointerUp={() => {
        if (!start.current) return
        start.current = null
        if (dx > THRESHOLD) finish('like')
        else if (dx < -THRESHOLD) finish('pass')
        else {
          setDx(0)
          if (!moved.current) onOpen()
        }
      }}
      onPointerCancel={() => { start.current = null; setDx(0) }}
    >
      <img src={imgSrc(p)} alt="" draggable={false} />
      <div className="card-shade" />
      {top && (
        <>
          <span className="stamp stamp-like" style={{ opacity: Math.min(Math.max(x, 0) / THRESHOLD, 1) }}>Хочу</span>
          <span className="stamp stamp-pass" style={{ opacity: Math.min(Math.max(-x, 0) / THRESHOLD, 1) }}>Мимо</span>
        </>
      )}
      <div className="card-info">
        {cat.length > 0 && <div className="chips">{cat.map((c) => <span key={c} className="chip">{c}</span>)}</div>}
        <h2>{p.title}</h2>
        <div className="price">{p.priceByn} BYN</div>
      </div>
    </article>
  )
}
