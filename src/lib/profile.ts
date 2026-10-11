// Профиль хранится локально (wl.profile). Формат версионирован: при регистрации
// объект уходит в БД как есть (см. exportProfile) — поле `v` задаёт схему.
export type Gender = 'f' | 'm' | 'o'

export interface Profile {
  v: 1
  name: string
  birthDate: string // YYYY-MM-DD
  email?: string
  gender?: Gender
  position?: string
  interests: string[] // id категорий из config.CATEGORY_LABELS
  marketingConsent: boolean // согласие на CRM-рассылки (поздравления, предложения)
  createdAt: string
  updatedAt: string
}

export const GENDERS: Array<{ id: Gender; label: string }> = [
  { id: 'f', label: 'Женский' },
  { id: 'm', label: 'Мужской' },
  { id: 'o', label: 'Другое' },
]

export const todayIso = () => new Date().toISOString().slice(0, 10)

export function validateName(v: string) {
  const s = v.trim()
  if (s.length < 2) return 'Введите имя (минимум 2 символа)'
  if (s.length > 40) return 'Слишком длинное имя'
  return null
}

export function validateBirth(v: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Укажите дату рождения'
  const d = new Date(v + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return 'Некорректная дата'
  if (v > todayIso()) return 'Дата не может быть в будущем'
  if (v < '1900-01-01') return 'Проверьте год рождения'
  return null
}

export function validateEmail(v: string) {
  if (!v.trim()) return null // необязательно до регистрации
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : 'Проверьте почту'
}

export function ageFromBirth(iso: string, now = new Date()) {
  const [y, m, d] = iso.split('-').map(Number)
  let age = now.getFullYear() - y
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--
  return age
}

/** Сколько дней до ближайшего дня рождения (0 — сегодня). */
export function daysToBirthday(iso: string, now = new Date()) {
  const [, m, d] = iso.split('-').map(Number)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let next = new Date(now.getFullYear(), m - 1, d)
  if (next < today) next = new Date(now.getFullYear() + 1, m - 1, d)
  return Math.round((next.getTime() - today.getTime()) / 86_400_000)
}

export function formatBirth(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function plural(n: number, one: string, few: string, many: string) {
  const a = Math.abs(n) % 100
  const b = a % 10
  if (a > 10 && a < 20) return many
  if (b > 1 && b < 5) return few
  return b === 1 ? one : many
}

/** Данные для CRM/БД. age не хранится — считается из birthDate. */
export function exportProfile(p: Profile) {
  return { ...p, age: ageFromBirth(p.birthDate) }
}
