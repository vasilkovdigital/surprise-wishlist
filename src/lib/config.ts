// Всё, что маркетинг захочет поменять без правки компонентов.
export const APP_NAME = 'Wish-list'
export const FEATURE_REG_GATE = false // true: после 3-го лайка показывать заглушку регистрации
export const REG_GATE_AFTER = 3
export const BONUS = {
  title: 'Бонус за заказ через приложение',
  text: 'Оформите заказ по ссылке из вишлиста — и получите бонус от Surprise.by',
}
export const UTM_SOURCE = 'wishlist_app'

export const WHO = [
  { id: 'self', label: 'Себе' },
  { id: 'her', label: 'Ей' },
  { id: 'him', label: 'Ему' },
  { id: 'couple', label: 'Паре' },
  { id: 'parents', label: 'Родителям' },
  { id: 'kids', label: 'Детям' },
] as const

export const BUDGETS = [
  { id: 'lt50', label: 'до 50 BYN' },
  { id: '50-100', label: '50–100 BYN' },
  { id: '100-300', label: '100–300 BYN' },
  { id: 'gt300', label: 'от 300 BYN' },
] as const

export const OCCASIONS = [
  { id: 'bday', label: 'День рождения' },
  { id: 'mar8', label: '8 марта' },
  { id: 'feb14', label: '14 февраля' },
  { id: 'feb23', label: '23 февраля' },
  { id: 'ny', label: 'Новый год' },
  { id: 'wedding', label: 'Свадьба' },
] as const

export const CATEGORY_LABELS: Record<string, string> = {
  active: 'Активный отдых', spa: 'СПА и красота', master: 'Мастер-класс', food: 'Бары и рестораны',
  quest: 'Квесты', photo: 'Фотосессия', fly: 'Полёты', creative: 'Креатив', company: 'Для компании',
}
