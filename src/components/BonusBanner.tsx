import { BONUS } from '../lib/config'

export function BonusBanner() {
  return (
    <div className="bonus">
      <img src="brand/mark_gift_dark.svg" alt="" width="36" height="36" />
      <div>
        <strong>{BONUS.title}</strong>
        <span>{BONUS.text}</span>
      </div>
    </div>
  )
}
