import { supabase } from './supabase'
import type { Category, Product } from '../types'

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data as Category[]
}

export async function fetchProducts(categoryId?: string): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Product[]
}

export async function fetchProductsByType(type: 'drink' | 'bakery'): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category!inner(type)
    `)
    .eq('category.type', type)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data as unknown as Product[]
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()
  if (error) throw error
  return data as Product
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Product
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single()
  if (error) throw error
  return data as Category
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Category
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export type SiteSettingKey = 'hero_image' | 'hero_side_1' | 'hero_side_2'

export async function fetchSiteSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
  if (error) throw error
  const map: Record<string, string> = {}
  for (const row of data ?? []) {
    map[row.key] = row.value
  }
  return map
}

export async function updateSiteSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) throw error
}

export interface HeroSlide {
  id: string
  image_url: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export async function fetchHeroSlides(): Promise<HeroSlide[]> {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data as HeroSlide[]
}

export async function fetchAllHeroSlides(): Promise<HeroSlide[]> {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data as HeroSlide[]
}

export async function createHeroSlide(imageUrl: string, sortOrder: number): Promise<void> {
  const { error } = await supabase
    .from('hero_slides')
    .insert({ image_url: imageUrl, sort_order: sortOrder, is_active: true })
  if (error) throw error
}

export async function updateHeroSlide(id: string, updates: Partial<HeroSlide>): Promise<void> {
  const { error } = await supabase
    .from('hero_slides')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function deleteHeroSlide(id: string): Promise<void> {
  const { error } = await supabase
    .from('hero_slides')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ─── Storage: image upload ───

export async function uploadImage(file: File, folder: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error } = await supabase.storage
    .from('images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })
  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(fileName)
  return urlData.publicUrl
}

export async function listImages(folder: string): Promise<{ name: string; url: string }[]> {
  const { data, error } = await supabase.storage
    .from('images')
    .list(folder, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
  if (error) throw error

  return (data ?? [])
    .filter((item) => item.id && !item.id.endsWith('.emptyFolderPlaceholder'))
    .map((item) => {
      const path = `${folder}/${item.name}`
      const { data: urlData } = supabase.storage.from('images').getPublicUrl(path)
      return { name: item.name, url: urlData.publicUrl }
    })
}

export async function deleteImage(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from('images')
    .remove([filePath])
  if (error) throw error
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
}
