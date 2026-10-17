export interface Category {
  id: string
  name: string
  name_fa: string
  type: 'drink' | 'bakery'
  sort_order: number
  icon: string | null
  created_at: string
}

export interface Product {
  id: string
  category_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  sort_order: number
  tags: string[]
  created_at: string
}

export interface ProductWithCategory extends Product {
  category?: Category
}
