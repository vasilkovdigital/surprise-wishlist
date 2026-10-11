// Справочник: теги product_type из фида -> нормализованные поля.
export const AUDIENCE: Record<string, string> = {
  'Женщинам': 'her', 'Девушкам': 'her', 'Жене': 'her', 'Сестре': 'her',
  'Мужчинам': 'him', 'Парням': 'him', 'Мужу': 'him', 'Брату': 'him',
  'Родителям': 'parents', 'Подарки бабушке и дедушке': 'parents',
  'Детям': 'kids', 'Отдых для всей семьи': 'kids',
  'Коллегам': 'colleagues',
  'Для себя': 'self',
  'Романтические подарки': 'couple', 'Свидания и вечеринки': 'couple', 'На свадьбу': 'couple',
}

export const OCCASIONS: Record<string, string> = {
  'Подарки на День Рождения': 'bday',
  'Подарки на 14 февраля': 'feb14',
  'Подарки на 8 марта': 'mar8', '8 марта': 'mar8',
  'Подарки на 23 февраля': 'feb23',
  'Подарки на Новый Год': 'ny', 'Подарки на Новый год 2021 любимому парню или девушке': 'ny',
  'На свадьбу': 'wedding',
}

export const CATEGORIES: Record<string, string> = {
  'Активный отдых': 'active',
  'Спа': 'spa', 'красота': 'spa', 'здоровье': 'spa',
  'Мастер-классы и обучение': 'master',
  'Бары и рестораны': 'food',
  'Квесты': 'quest',
  'Фотосессии': 'photo',
  'Полеты': 'fly',
  'Креативные подарки': 'creative',
  'Для большой компании': 'company',
}

export const GIFTCARD_TAGS = ['Подарочные карты магазинов', 'Подарочные наборы', 'Подарочные сертификаты', 'Адвент-календари', 'Комбо в подарок']

// ---- Признаки, которых нет в фиде отдельными полями: выводим по тегам и тексту ----
// (эвристика; когда сайт добавит в фид поля city / age_group / interests — заменить)

export const CITY_RULES: Array<{ id: string; re: RegExp }> = [
  { id: 'minsk', re: /минск/i },
  { id: 'brest', re: /брест/i },
  { id: 'grodno', re: /гродн/i },
  { id: 'gomel', re: /гомел/i },
  { id: 'vitebsk', re: /витебск/i },
  { id: 'mogilev', re: /могил[её]в/i },
]

export const INTEREST_RULES: Array<{ id: string; categories?: string[]; re?: RegExp }> = [
  { id: 'spa', categories: ['spa'], re: /\bспа\b|spa|массаж|хаммам|сауна|баня|аквазон/i },
  { id: 'food', categories: ['food'], re: /дегустац|ужин|ресторан|кулинар|бранч|вино|сыр|шоколад|кофе|пицц|суши/i },
  { id: 'extreme', categories: ['fly'], re: /прыж|парашют|дайвинг|дрифт|картинг|аэротруб|дельтаплан|полет|полёт|квадроцикл|рафтинг|банджи|rope|вингсьют|багги|экстрим|скалолаз/i },
  { id: 'creative', categories: ['master', 'creative', 'photo'], re: /мастер-класс|рисован|гончар|керамик|свеч|мыло|фотосесс|творч|вышив|скульптур/i },
  { id: 'sport', categories: ['active'], re: /фитнес|йога|тренировк|стрельб|плаван|сёрф|серф|лыж|коньк|скалодром|страйкбол|боулинг|теннис|вейк|сап\b/i },
  { id: 'romance', re: /романти|свидани|для двоих|вдвоем|вдвоём|для пары|пары\b/i },
]

/** child ≤12, teen 13–17, adult 18–44, senior 45+ */
export function deriveAgeGroups(tags: string[], text: string): string[] {
  const kids = tags.includes('Детям') || /детск|ребён|ребен|для детей|школьник/i.test(text)
  const family = tags.includes('Отдых для всей семьи')
  const parents = tags.includes('Родителям') || tags.includes('Подарки бабушке и дедушке')
  const g = new Set<string>()
  if (kids) { g.add('child'); g.add('teen') }
  if (family) { g.add('child'); g.add('teen'); g.add('adult') }
  if (parents) { g.add('adult'); g.add('senior') }
  if (!kids && !family) g.add('adult')
  return [...g]
}
