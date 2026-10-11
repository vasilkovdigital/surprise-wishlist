import { useState } from 'react'
import type { Profile } from '../lib/profile'
import { ProfileForm } from './ProfileForm'

/** Обязательный первый экран: приветствие → имя и дата рождения. */
export function Intro({ onSave }: { onSave: (p: Profile) => void }) {
  const [step, setStep] = useState<'welcome' | 'profile'>('welcome')

  if (step === 'welcome') {
    return (
      <div className="welcome">
        <img src="brand/logo_main_dark.svg" alt="Surprise" className="welcome-logo" />
        <h1>Свайпайте впечатления — собирайте вишлист</h1>
        <p>Нравится — в избранное, нет — дальше. Потом поделитесь списком с друзьями и гостями на день рождения.</p>
        <button className="btn btn-ink" onClick={() => setStep('profile')}>Начать</button>
      </div>
    )
  }

  return (
    <div className="onb">
      <h1>Давайте знакомиться</h1>
      <p className="muted">Это займёт полминуты. Остальное можно будет дополнить в профиле.</p>
      <ProfileForm mode="onboarding" onSave={onSave} />
    </div>
  )
}
