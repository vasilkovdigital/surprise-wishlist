import { useState } from 'react'
import { CITIES, INTERESTS } from '../lib/config'
import {
  GENDERS, MONTHS, normalizePhone, validateBirth, validateEmail, validateName, validatePhone,
  type Gender, type Profile,
} from '../lib/profile'

interface Props {
  mode: 'onboarding' | 'edit'
  initial?: Profile | null
  onSave: (p: Profile) => void
}

const YEARS = Array.from({ length: new Date().getFullYear() - 1925 + 1 }, (_, i) => new Date().getFullYear() - i)

export function ProfileForm({ mode, initial, onSave }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [day, setDay] = useState<number | null>(initial?.birthDay ?? null)
  const [month, setMonth] = useState<number | null>(initial?.birthMonth ?? null)
  const [year, setYear] = useState<number | null>(initial?.birthYear ?? null)
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [phoneConsent, setPhoneConsent] = useState(initial?.phoneConsent ?? false)
  const [email, setEmail] = useState(initial?.email ?? '')
  const [gender, setGender] = useState<Gender | undefined>(initial?.gender)
  const [city, setCity] = useState(initial?.city ?? '')
  const [industry, setIndustry] = useState(initial?.industry ?? '')
  const [interests, setInterests] = useState<string[]>(initial?.interests ?? [])
  const [consent, setConsent] = useState(initial?.marketingConsent ?? false)
  const [touched, setTouched] = useState(false)
  const [saved, setSaved] = useState(false)

  const errName = validateName(name)
  const errBirth = validateBirth(day, month, year)
  const errEmail = validateEmail(email)
  const errPhone = validatePhone(phone)
  const invalid = !!(errName || errBirth || errEmail || errPhone)
  const hasPhone = phone.trim() !== ''

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (invalid) return
    const now = new Date().toISOString()
    onSave({
      v: 2,
      name: name.trim(),
      birthDay: day!,
      birthMonth: month!,
      birthYear: year ?? undefined,
      phone: hasPhone ? normalizePhone(phone) : undefined,
      phoneConsent: hasPhone && phoneConsent,
      email: email.trim() || undefined,
      gender,
      city: city || undefined,
      industry: industry.trim() || undefined,
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
        <span className="muted small">Так мы будем обращаться к вам в письмах.</span>
      </label>

      <div className="lbl" role="group" aria-label="Дата рождения">
        Дата рождения
        <div className="birth-row">
          <select className="field" aria-label="День" value={day ?? ''} onChange={(e) => setDay(e.target.value ? Number(e.target.value) : null)}>
            <option value="">День</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="field" aria-label="Месяц" value={month ?? ''} onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : null)}>
            <option value="">Месяц</option>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select className="field" aria-label="Год" value={year ?? ''} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)}>
            <option value="">Год</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        {touched && errBirth && <span className="err">{errBirth}</span>}
        <span className="muted small">Год можно не указывать — по дню и месяцу мы поздравим. С годом подберём впечатления по возрасту.</span>
      </div>

      {mode === 'edit' && (
        <>
          <h3>Дополнительно <span className="muted small">— по желанию</span></h3>

          <label className="lbl">
            Телефон
            <input className="field" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+375 29 123-45-67" />
            {touched && errPhone && <span className="err">{errPhone}</span>}
          </label>
          {hasPhone && (
            <label className="check">
              <input type="checkbox" checked={phoneConsent} onChange={(e) => setPhoneConsent(e.target.checked)} />
              <span>Согласен получать сообщения в Viber и SMS (отдельное согласие). Отказаться можно в любой момент.</span>
            </label>
          )}

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
            Город
            <select className="field" autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Не указан</option>
              {CITIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              <option value="other">Другой город</option>
            </select>
          </label>

          <div className="lbl">
            Интересы
            <div className="opts tight">
              {INTERESTS.map((o) => (
                <button type="button" key={o.id} className={`opt ${interests.includes(o.id) ? 'on' : ''}`} onClick={() => toggleInterest(o.id)}>{o.label}</button>
              ))}
            </div>
          </div>

          <label className="lbl">
            Сфера деятельности
            <input className="field" autoComplete="organization-title" maxLength={60} value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Например, IT, образование, медицина" />
            <span className="muted small">Нужна для корпоративных предложений.</span>
          </label>
        </>
      )}

      <label className="check">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>Хочу получать поздравления с днём рождения и подборки впечатлений от Surprise.by. Отказаться можно в любой момент.</span>
      </label>

      <button type="submit" className="btn btn-ink full">
        {saved ? 'Сохранено ✓' : mode === 'onboarding' ? 'Сохранить анкету' : 'Сохранить'}
      </button>
    </form>
  )
}
