import { useEffect, useState } from 'react'
import type { Product } from '../lib/types'
import { imgSrc } from '../state'
import { SwipeCard } from './SwipeCard'

interface Props {
  deck: Product[]
  canUndo: boolean
  likedCount: number
  onLike: (id: string) => void
  onPass: (id: string) => void
  onUndo: () => void
  onOpen: (p: Product) => void
  onReset: () => void
  onOpenWishlist: () => void
}

export function Deck({ deck, canUndo, likedCount, onLike, onPass, onUndo, onOpen, onReset, onOpenWishlist }: Props) {
  const [fling, setFling] = useState<'like' | 'pass' | null>(null)
  const top = deck[0]
  const next = deck[1]

  // предзагрузка следующих трёх
  useEffect(() => {
    deck.slice(1, 4).forEach((p) => { const i = new Image(); i.src = imgSrc(p) })
  }, [deck])

  const act = (d: 'like' | 'pass') => {
    if (!top || fling) return
    setFling(d)
    window.setTimeout(() => {
      setFling(null)
      d === 'like' ? onLike(top.id) : onPass(top.id)
    }, 240)
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') act('like')
      else if (e.key === 'ArrowLeft') act('pass')
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  })

  if (!top) {
    return (
      <div className="empty">
        <img src="brand/mark_confetti_dark.svg" alt="" width="72" />
        <h2>Вы всё посмотрели</h2>
        <p>Впечатления в этой подборке закончились. В вишлисте: {likedCount}.</p>
        <button className="btn btn-ink" onClick={onOpenWishlist}>Открыть вишлист</button>
        <button className="btn btn-ghost" onClick={onReset}>Показать пропущенные снова</button>
      </div>
    )
  }

  return (
    <div className="deck-wrap">
      <div className="stack">
        {next && <SwipeCard key={next.id} product={next} top={false} fling={null} onSwipe={() => {}} onOpen={() => {}} />}
        <SwipeCard
          key={top.id}
          product={top}
          top
          fling={fling}
          onSwipe={(d) => (d === 'like' ? onLike(top.id) : onPass(top.id))}
          onOpen={() => onOpen(top)}
        />
      </div>
      <div className="actions">
        <button className="round round-pass" aria-label="Мимо" onClick={() => act('pass')}>✕</button>
        <button className="round round-undo" aria-label="Вернуть" disabled={!canUndo} onClick={onUndo}>↺</button>
        <button className="round round-like" aria-label="Хочу" onClick={() => act('like')}>♥</button>
      </div>
      <p className="hint">Свайп вправо — в вишлист, влево — дальше</p>
    </div>
  )
}
