import { useState } from 'react'
import { CATEGORY_LABELS } from '../lib/config'
import {
  GENDERS, todayIso, validateBirth, validateEmail, validateName,
  type Gender, type Profile,
} from '../lib/profile'

interface Props {
  mode: 'onboarding' | 'edit'
  initial?: Profile | null
  onSave: (p: Profile) => void
}

export function ProfileForm({ mode, initial, onSave }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [birth, setBirth] = useState(initial?.birthDate ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [gender, setGender] = useState<Gender | undefined>(initial?.gender)
  const [position, setPosition] = useState(initial?.position ?? '')
  const [interests, setInterests] = useState<string[]>(initial?.interests ?? [])
  const [consent, setConsent] = useState(initial?.marketingConsent ?? false)
  const [touched, setTouched] = useState(false)
  const [saved, setSaved] = useState(false)

  const errName = validateName(name)
  const errBirth = validateBirth(birth)
  const errEmail = validateEmail(email)
  const invalid = !!(errName || errBirth || errEmail)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (invalid) return
    const now = new Date().toISOString()
    onSave({
      v: 1,
      name: name.trim(),
      birthDate: birth,
      email: email.trim() || undefined,
      gender,
      position: position.trim() || undefined,
      interests,
      marketingConsent: consent,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  const toggleInterest = (id: string) =>
    setInterests((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]))

  return (
    <form className="pform" onSubmit={submit} noValidate>
      <label className="lbl">
        Как вас зовут
        <input className="field" autoComplete="given-name" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" />
        {touched && errName && <span className="err">{errName}</span>}
      </label>

      <label className="lbl">
        Дата рождения
        <input className="field" type="date" autoComplete="bday" max={todayIso()} min="1900-01-01" value={birth} onChange={(e) => setBirth(e.target.value)} />
        {touched && errBirth && <span className="err">{errBirth}</span>}
        {mode === 'onboarding' && <span className="muted small">Чтобы поздравить вас и подсказать подарки к празднику.</span>}
      </label>

      {mode === 'edit' && (
        <>
          <h3>Дополнительно <span className="muted small">— по желанию</span></h3>
          <label className="lbl">
            Почта
            <input className="field" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
            {touched && errEmail && <span className="err">{errEmail}</span>}
            <span className="muted small">Понадобится при регистрации. Сюда будут приходить поздравления.</span>
          </label>

          <div className="lbl">
            Пол
            <div className="opts tight">
              {GENDERS.map((g) => (
                <button type="button" key={g.id} className={`opt ${gender === g.id ? 'on' : ''}`} onClick={() => setGender(gender === g.id ? undefined : g.id)}>{g.label}</button>
              ))}
            </div>
          </div>

          <label className="lbl">
            Должность
            <input className="field" autoComplete="organization-title" maxLength={60} value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Например, маркетолог" />
          </label>

          <div className="lbl">
            Интересы
            <div className="opts tight">
              {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
                <button type="button" key={id} className={`opt ${interests.includes(id) ? 'on' : ''}`} onClick={() => toggleInterest(id)}>{label}</button>
              ))}
            </div>
          </div>
        </>
      )}

      <label className="check">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>Хочу получать поздравления с днём рождения и подборки впечатлений от Surprise.by. Отказаться можно в любой момент.</span>
      </label>

      <button type="submit" className="btn btn-ink full">
        {mode === 'onboarding' ? 'Продолжить' : saved ? 'Сохранено ✓' : 'Сохранить'}
      </button>
    </form>
  )
}
