import { DATA_TTL_DAYS, REGISTER_URL } from '../lib/config'
import {
  daysToBirthday, effectiveAge, exportProfile, formatBirth, plural, type Profile,
} from '../lib/profile'
import { formatRemaining } from '../lib/retention'
import type { Settings } from '../lib/types'
import { withUtm } from '../lib/utm'
import { track } from '../state'
import { ProfileForm } from './ProfileForm'

const TONES = ['var(--confetti-blue)', 'var(--confetti-green)', 'var(--confetti-pink)', 'var(--confetti-purple)']

export function avatarTone(name: string) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return TONES[h % TONES.length]
}

interface Props {
  registered: boolean
  email?: string
  profile: Profile | null
  settings: Settings
  /** Вишлист незарегистрированного: сколько впечатлений и когда удалится самое раннее */
  retention: { count: number; expiresAt: number | null }
  onSettings: (patch: Partial<Settings>) => void
  onSave: (p: Profile) => void
  onDelete: () => void
  /** Только прототип: имитация регистрации/выхода */
  onDemoToggle: () => void
}

function SettingsBlock({ settings, onSettings, registered }: Pick<Props, 'settings' | 'onSettings' | 'registered'>) {
  return (
    <section className="settings">
      <h3>Настройки</h3>
      <label className="switch">
        <input type="checkbox" checked={settings.recyclePassed} onChange={(e) => onSettings({ recyclePassed: e.target.checked })} />
        <span>
          <strong>Возвращать пропущенные</strong>
          <small>Карточки, которые вы смахнули влево, вернутся в конец ленты. Выключите — и они больше не появятся.</small>
        </span>
      </label>
      <label className="switch is-disabled">
        <input type="checkbox" disabled />
        <span>
          <strong>Пуш-уведомления о новых впечатлениях <em className="soon">Скоро</em></strong>
          <small>{registered ? 'Сообщим, когда в каталоге появится что-то новое.' : 'Доступны после регистрации.'}</small>
        </span>
      </label>
    </section>
  )
}

export function ProfilePage(props: Props) {
  const { registered, profile, settings, retention, onSettings, onSave, onDelete, onDemoToggle } = props
  const registerHref = withUtm(REGISTER_URL, 'register')

  const footer = (
    <>
      <button className="link demo" onClick={onDemoToggle}>
        {registered ? 'Демо: выйти из аккаунта' : 'Демо: показать профиль после регистрации'}
      </button>
      <button
        className="link danger"
        onClick={() => {
          if (confirm('Удалить настройки, вишлист и историю свайпов с этого устройства?')) onDelete()
        }}
      >
        Удалить мои данные
      </button>
    </>
  )

  // ---- не зарегистрирован: анкеты нет, только призыв и настройки ----
  if (!registered || !profile) {
    return (
      <div className="profile">
        <h1>Профиль</h1>
        <div className="reg-card">
          <h2>Данные хранятся {DATA_TTL_DAYS} {plural(DATA_TTL_DAYS, 'день', 'дня', 'дней')}</h2>
          <p>
            Без регистрации вишлист и история свайпов удаляются через {DATA_TTL_DAYS} дня. Зарегистрируйтесь на surprise.by
            — это бесплатно.
          </p>
          <ul className="perks">
            <li>вишлист сохранится и будет на всех устройствах</li>
            <li>уведомления о новых впечатлениях</li>
            <li>поздравления с днём рождения</li>
            <li>анкета — подборки под ваши интересы</li>
          </ul>
          {retention.count > 0 && retention.expiresAt != null && (
            <p className="reg-timer">
              Сейчас в вишлисте: {retention.count}. Самое раннее удалится через {formatRemaining(retention.expiresAt - Date.now())}.
            </p>
          )}
          <a className="btn btn-ink full" href={registerHref} target="_blank" rel="noopener" onClick={() => track('register_click', { from: 'profile' })}>
            Зарегистрироваться бесплатно
          </a>
        </div>
        <SettingsBlock settings={settings} onSettings={onSettings} registered={false} />
        {footer}
      </div>
    )
  }

  // ---- зарегистрирован: анкета синхронизирована с аккаунтом ----
  const age = effectiveAge(profile)
  const days = daysToBirthday(profile.birthDay, profile.birthMonth)
  return (
    <div className="profile">
      <div className="who">
        <div className="avatar" style={{ background: avatarTone(profile.name) }}>{profile.name.trim()[0]?.toUpperCase()}</div>
        <div>
          <h1>{profile.name}</h1>
          <p className="muted">
            {formatBirth(profile)}{age != null && ` · ${age} ${plural(age, 'год', 'года', 'лет')}`}
          </p>
        </div>
      </div>

      <div className="synced">
        <strong>Вы зарегистрированы{props.email ? ` · ${props.email}` : ''}</strong>
        <span>Вишлист хранится без ограничения, анкета синхронизируется с аккаунтом на surprise.by. Заполнить её можно здесь или на сайте.</span>
        <a className="link" href={withUtm(REGISTER_URL, 'profile')} target="_blank" rel="noopener" onClick={() => track('outbound_click', { campaign: 'profile' })}>
          Открыть профиль на surprise.by
        </a>
      </div>

      {days <= 30 && (
        <div className="nudge">
          {days === 0
            ? 'С днём рождения! 🎉 Отправьте вишлист друзьям — пусть выберут подарок.'
            : `До вашего дня рождения ${days} ${plural(days, 'день', 'дня', 'дней')}. Самое время отправить вишлист гостям.`}
        </div>
      )}

      <ProfileForm initial={profile} onSave={onSave} />

      <SettingsBlock settings={settings} onSettings={onSettings} registered />

      <details className="data">
        <summary>Какие данные синхронизируются</summary>
        <p className="muted small">Эти данные хранятся в вашем аккаунте и доступны сайту и приложению.</p>
        <pre>{JSON.stringify(exportProfile(profile), null, 2)}</pre>
      </details>
      {footer}
    </div>
  )
}
