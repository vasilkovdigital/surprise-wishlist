import {
  ageFromBirth, daysToBirthday, exportProfile, formatBirth, plural, type Profile,
} from '../lib/profile'
import type { Settings } from '../lib/types'
import { ProfileForm } from './ProfileForm'

const TONES = ['var(--confetti-blue)', 'var(--confetti-green)', 'var(--confetti-pink)', 'var(--confetti-purple)']

export function avatarTone(name: string) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return TONES[h % TONES.length]
}

interface Props {
  profile: Profile | null
  settings: Settings
  onSettings: (patch: Partial<Settings>) => void
  onSave: (p: Profile) => void
  onDelete: () => void
}

function SettingsBlock({ settings, onSettings }: Pick<Props, 'settings' | 'onSettings'>) {
  return (
    <section className="settings">
      <h3>Настройки</h3>
      <label className="switch">
        <input type="checkbox" checked={settings.recyclePassed} onChange={(e) => onSettings({ recyclePassed: e.target.checked })} />
        <span>
          <strong>Возвращать пропущенные</strong>
          <small>Карточки, которые вы смахнули влево, вернутся в конец колоды. Выключите — и они больше не появятся.</small>
        </span>
      </label>
      <label className="switch is-disabled">
        <input type="checkbox" disabled />
        <span>
          <strong>Пуш-уведомления о новых впечатлениях <em className="soon">Скоро</em></strong>
          <small>Сообщим, когда в каталоге появится что-то новое.</small>
        </span>
      </label>
    </section>
  )
}

export function ProfilePage({ profile, settings, onSettings, onSave, onDelete }: Props) {
  if (!profile) {
    return (
      <div className="profile">
        <h1>Анкета</h1>
        <p className="muted">Расскажите о себе — поздравим с днём рождения и подскажем подарки к празднику. Займёт полминуты.</p>
        <ProfileForm mode="onboarding" onSave={onSave} />
        <SettingsBlock settings={settings} onSettings={onSettings} />
      </div>
    )
  }

  const age = ageFromBirth(profile.birthDate)
  const days = daysToBirthday(profile.birthDate)

  return (
    <div className="profile">
      <div className="who">
        <div className="avatar" style={{ background: avatarTone(profile.name) }}>{profile.name.trim()[0]?.toUpperCase()}</div>
        <div>
          <h1>{profile.name}</h1>
          <p className="muted">
            {formatBirth(profile.birthDate)} · {age} {plural(age, 'год', 'года', 'лет')}
          </p>
        </div>
      </div>

      {days <= 30 && (
        <div className="nudge">
          {days === 0
            ? 'С днём рождения! 🎉 Отправьте вишлист друзьям — пусть выберут подарок.'
            : `До вашего дня рождения ${days} ${plural(days, 'день', 'дня', 'дней')}. Самое время отправить вишлист гостям.`}
        </div>
      )}

      <ProfileForm mode="edit" initial={profile} onSave={onSave} />

      <SettingsBlock settings={settings} onSettings={onSettings} />

      <details className="data">
        <summary>Какие данные хранятся</summary>
        <p className="muted small">
          Пока всё лежит только на этом устройстве. При регистрации эти данные подтянутся в ваш аккаунт.
        </p>
        <pre>{JSON.stringify(exportProfile(profile), null, 2)}</pre>
      </details>

      <button
        className="link danger"
        onClick={() => {
          if (confirm('Удалить профиль, настройки, вишлист и историю свайпов с этого устройства?')) onDelete()
        }}
      >
        Удалить мои данные
      </button>
    </div>
  )
}
