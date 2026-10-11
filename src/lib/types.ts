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

export interface Filters {
  done: boolean
  who: string | null // self | her | him | couple | parents | kids
  budget: Bucket | null
  occasion: string | null
}

export interface Swipe { id: string; d: 'like' | 'pass' }
export interface Meta { syncedAt: string; count: number }
