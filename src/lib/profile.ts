// Профиль хранится локально (wl.profile). Формат версионирован: при регистрации
// объект уходит в БД как есть (см. exportProfile) — поле `v` задаёт схему.
// Поля — по таблице «4.2 Профиль клиента» (без «Кому дарите»: анкета для тех, кому дарят).
export type Gender = 'f' | 'm' | 'o'

export interface Profile {
  v: 2
  name: string
  birthDay: number // 1–31, обязательно
  birthMonth: number // 1–12, обязательно
  birthYear?: number // необязателен; без него возраст не считаем
  phone?: string // Viber / SMS
  phoneConsent: boolean // отдельное согласие на Viber и SMS
  email?: string
  gender?: Gender
  city?: string // id из config.CITIES или 'other'
  industry?: string // сфера деятельности (B2B и корпоративные предложения)
  interests: string[] // id из config.INTERESTS
  marketingConsent: boolean // согласие на поздравления и подборки (email)
  createdAt: string
  updatedAt: string
}

export const GENDERS: Array<{ id: Gender; label: string }> = [
  { id: 'f', label: 'Женский' },
  { id: 'm', label: 'Мужской' },
  { id: 'o', label: 'Другое' },
]

export const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

export function validateName(v: string) {
  const s = v.trim()
  if (s.length < 2) return 'Введите имя (минимум 2 символа)'
  if (s.length > 40) return 'Слишком длинное имя'
  return null
}

/** День и месяц обязательны, год — нет. */
export function validateBirth(day: number | null, month: number | null, year: number | null, now = new Date()) {
  if (!day || !month) return 'Укажите день и месяц рождения'
  const probe = year ?? 2000 // високосный, чтобы 29 февраля проходило без года
  const d = new Date(probe, month - 1, day)
  if (d.getMonth() !== month - 1 || d.getDate() !== day) return 'Такой даты не существует'
  if (year != null) {
    if (year < 1900 || year > now.getFullYear()) return 'Проверьте год рождения'
    if (d > now) return 'Дата не может быть в будущем'
  }
  return null
}

export function validateEmail(v: string) {
  if (!v.trim()) return null // необязательно до регистрации
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : 'Проверьте почту'
}

export function normalizePhone(v: string) {
  const digits = v.replace(/[^\d+]/g, '')
  return digits.startsWith('+') ? '+' + digits.slice(1).replace(/\+/g, '') : digits.replace(/\+/g, '')
}

export function validatePhone(v: string) {
  if (!v.trim()) return null
  const n = normalizePhone(v).replace(/\D/g, '')
  return n.length >= 9 && n.length <= 15 ? null : 'Проверьте номер телефона'
}

/** Возраст — только если указан год рождения. */
export function ageFromProfile(p: Pick<Profile, 'birthDay' | 'birthMonth' | 'birthYear'>, now = new Date()) {
  if (!p.birthYear) return null
  let age = now.getFullYear() - p.birthYear
  if (now.getMonth() + 1 < p.birthMonth || (now.getMonth() + 1 === p.birthMonth && now.getDate() < p.birthDay)) age--
  return age
}

/** Сколько дней до ближайшего дня рождения (0 — сегодня). */
export function daysToBirthday(day: number, month: number, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  // 29 февраля в невисокосный год празднуем 1 марта
  const at = (y: number) => {
    const d = new Date(y, month - 1, day)
    return d.getMonth() === month - 1 ? d : new Date(y, 2, 1)
  }
  let next = at(now.getFullYear())
  if (next < today) next = at(now.getFullYear() + 1)
  return Math.round((next.getTime() - today.getTime()) / 86_400_000)
}

export function formatBirth(p: Pick<Profile, 'birthDay' | 'birthMonth' | 'birthYear'>) {
  return `${p.birthDay} ${MONTHS[p.birthMonth - 1]}${p.birthYear ? ` ${p.birthYear}` : ''}`
}

export function plural(n: number, one: string, few: string, many: string) {
  const a = Math.abs(n) % 100
  const b = a % 10
  if (a > 10 && a < 20) return many
  if (b > 1 && b < 5) return few
  return b === 1 ? one : many
}

/** Данные для CRM/БД. age не хранится — считается из года рождения (если он есть). */
export function exportProfile(p: Profile) {
  return { ...p, age: ageFromProfile(p) }
}

const CATEGORY_TO_INTEREST: Record<string, string> = {
  spa: 'spa', food: 'food', fly: 'extreme', quest: 'extreme', master: 'creative', creative: 'creative', photo: 'creative', active: 'sport',
}

/** Приводит сохранённый профиль любой версии к текущей (v2). */
export function migrateProfile(raw: unknown): Profile | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (r.v === 2) return r as unknown as Profile
  if (r.v === 1 && typeof r.birthDate === 'string') {
    const [y, m, d] = r.birthDate.split('-').map(Number)
    const interests = Array.isArray(r.interests)
      ? [...new Set((r.interests as string[]).map((c) => CATEGORY_TO_INTEREST[c]).filter(Boolean))]
      : []
    return {
      v: 2,
      name: String(r.name ?? ''),
      birthDay: d,
      birthMonth: m,
      birthYear: y,
      phoneConsent: false,
      email: r.email as string | undefined,
      gender: r.gender as Gender | undefined,
      industry: r.position as string | undefined,
      interests,
      marketingConsent: !!r.marketingConsent,
      createdAt: String(r.createdAt ?? new Date().toISOString()),
      updatedAt: String(r.updatedAt ?? new Date().toISOString()),
    }
  }
  return null
}
