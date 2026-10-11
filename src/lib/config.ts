// Всё, что маркетинг захочет поменять без правки компонентов.
export const APP_NAME = 'Wish-list'
export const FEATURE_REG_GATE = false // true: после 3-го лайка показывать заглушку регистрации
export const REG_GATE_AFTER = 3
export const BONUS = {
  title: 'Бонус за заказ через приложение',
  text: 'Оформите заказ по ссылке из вишлиста — и получите бонус от Surprise.by',
}
export const UTM_SOURCE = 'wishlist_app'

export const CATEGORY_LABELS: Record<string, string> = {
  active: 'Активный отдых', spa: 'СПА и красота', master: 'Мастер-класс', food: 'Бары и рестораны',
  quest: 'Квесты', photo: 'Фотосессия', fly: 'Полёты', creative: 'Креатив', company: 'Для компании',
}

export const INTERESTS = [
  { id: 'spa', label: 'SPA и красота' },
  { id: 'food', label: 'Гастрономия' },
  { id: 'extreme', label: 'Экстрим' },
  { id: 'creative', label: 'Творчество' },
  { id: 'sport', label: 'Спорт' },
  { id: 'romance', label: 'Романтика' },
] as const

export const CITIES = [
  { id: 'minsk', label: 'Минск' },
  { id: 'brest', label: 'Брест' },
  { id: 'grodno', label: 'Гродно' },
  { id: 'gomel', label: 'Гомель' },
  { id: 'vitebsk', label: 'Витебск' },
  { id: 'mogilev', label: 'Могилёв' },
] as const

export const AGE_GROUPS = [
  { id: 'child', label: 'до 12 лет' },
  { id: 'teen', label: '13–17 лет' },
  { id: 'adult', label: '18–44 года' },
  { id: 'senior', label: '45+' },
] as const

export const OCCASIONS = [
  { id: 'bday', label: 'День рождения' },
  { id: 'mar8', label: '8 марта' },
  { id: 'feb14', label: '14 февраля' },
  { id: 'feb23', label: '23 февраля' },
  { id: 'ny', label: 'Новый год' },
  { id: 'wedding', label: 'Свадьба' },
] as const

export const PRICE_PRESETS = [
  { label: 'до 50', min: null, max: 50 },
  { label: '50–100', min: 50, max: 100 },
  { label: '100–300', min: 100, max: 300 },
  { label: 'от 300', min: 300, max: null },
] as const
