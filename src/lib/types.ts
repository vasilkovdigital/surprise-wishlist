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
  interests: string[]
  /** пусто = город неизвестен (показывается в любом городе) */
  cities: string[]
  ageGroups: string[]
  priceBucket: Bucket
  isGiftCard: boolean
}

export interface Filters {
  category: string | null // быстрый фильтр над колодой
  city: string | null
  interests: string[]
  priceMin: number | null // BYN
  priceMax: number | null
  age: string | null // child | teen | adult | senior (возраст получателя)
  gender: 'her' | 'him' | null // для неё / для него
  occasion: string | null
}

export const NO_FILTERS: Filters = {
  category: null, city: null, interests: [], priceMin: null, priceMax: null, age: null, gender: null, occasion: null,
}

/** Настройки приложения; живут отдельно от профиля и доступны без анкеты. */
export interface Settings {
  /** true — пропущенные карточки возвращаются в конец колоды; false — больше не показываются */
  recyclePassed: boolean
}

export interface Swipe { id: string; d: 'like' | 'pass'; at?: number }
export interface LikedItem { id: string; at: number }
export interface Meta { syncedAt: string; count: number }
