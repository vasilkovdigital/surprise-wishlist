export type Bucket = 'lt50' | '50-100' | '100-300' | 'gt300'

export interface Product {
  id: string
  title: string
  description: string
  url: string
  image: string
  imageLocal?: string
  images: string[]
  video?: string
  priceByn: number
  audience: string[]
  occasions: string[]
  categories: string[]
  priceBucket: Bucket
  isGiftCard: boolean
}

/** Единственный значимый фильтр — категория (тип впечатления). null = всё. */
export interface Filters {
  category: string | null
}

/** Настройки приложения; живут отдельно от профиля и доступны без анкеты. */
export interface Settings {
  /** true — пропущенные карточки возвращаются в конец колоды; false — больше не показываются */
  recyclePassed: boolean
}

export interface Swipe { id: string; d: 'like' | 'pass' }
export interface Meta { syncedAt: string; count: number }
