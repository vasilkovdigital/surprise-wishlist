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
