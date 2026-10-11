// Всё, что маркетинг захочет поменять без правки компонентов.
export const APP_NAME = 'Wish-list'

// Регистрация проходит на surprise.by (аккаунт сайта — единый для сайта и приложения).
// TODO: заменить на точный адрес страницы регистрации.
export const REGISTER_URL = 'https://surprise.by/'
/** Срок хранения данных незарегистрированного пользователя, дней */
export const DATA_TTL_DAYS = 3
/** Напоминание о регистрации: каждые N свайпов или каждые N сохранений — что наступит раньше */
export const PROMPT_EVERY_SWIPES = 10
export const PROMPT_EVERY_LIKES = 3
export const BONUS = {
  title: 'Бонус за заказ через приложение',
  text: 'Оформите заказ по ссылке из вишлиста — и получите бонус от Surprise.by',
}
export const UTM_SOURCE = 'wishlist_app'
export const TELEGRAM_CHANNEL = 'https://t.me/mysurpriseby'

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

/** md — дата праздника [месяц, день]; у «круглогодичных» поводов её нет. */
export const OCCASIONS: ReadonlyArray<{ id: string; label: string; md: readonly [number, number] | null }> = [
  { id: 'bday', label: 'День рождения', md: null },
  { id: 'ny', label: 'Новый год', md: [1, 1] },
  { id: 'feb14', label: '14 февраля', md: [2, 14] },
  { id: 'feb23', label: '23 февраля', md: [2, 23] },
  { id: 'mar8', label: '8 марта', md: [3, 8] },
  { id: 'wedding', label: 'Свадьба', md: null },
]

/** Поводы для быстрого ряда: «круглогодичные» первыми, праздники — по ближайшей дате. */
export function occasionsByUpcoming(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const days = (md: readonly [number, number]) => {
    let t = new Date(now.getFullYear(), md[0] - 1, md[1]).getTime()
    if (t < today) t = new Date(now.getFullYear() + 1, md[0] - 1, md[1]).getTime()
    return t - today
  }
  const dated = OCCASIONS.filter((o) => o.md).sort((a, b) => days(a.md!) - days(b.md!))
  return [OCCASIONS[0], ...dated, OCCASIONS[OCCASIONS.length - 1]]
}

export const PRICE_PRESETS = [
  { label: 'до 50', min: null, max: 50 },
  { label: '50–100', min: 50, max: 100 },
  { label: '100–300', min: 100, max: 300 },
  { label: 'от 300', min: 300, max: null },
] as const
