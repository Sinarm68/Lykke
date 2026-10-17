import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Category, Product } from '../types'
import { fetchCategories, fetchProducts } from '../lib/api'
import ProductCard from './ProductCard'

type MenuType = 'drink' | 'bakery'

interface Props {
  activeType?: MenuType
  searchQuery?: string
}

export default function Menu({ activeType = 'drink', searchQuery = '' }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts()])
      setCategories(cats)
      setProducts(prods)
      setError(null)
    } catch {
      setError('خطا در بارگذاری اطلاعات. لطفاً دوباره تلاش کنید.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filteredCategories = categories.filter((c) => c.type === activeType)
  const filteredProducts = products.filter((p) => {
    const cat = categories.find((c) => c.id === p.category_id)
    if (!cat || cat.type !== activeType) return false
    if (activeCategory !== 'all' && p.category_id !== activeCategory) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const inName = p.name.toLowerCase().includes(q)
      const inDesc = p.description?.toLowerCase().includes(q) ?? false
      if (!inName && !inDesc) return false
    }
    return true
  })

  return (
    <section id="menu" style={styles.section}>
      {/* Ambient orbs */}
      <div style={styles.ambientOrb1} />
      <div style={styles.ambientOrb2} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Category pills */}
        <div style={styles.categories}>
          <motion.button
            style={activeCategory === 'all' ? { ...styles.catPill, ...styles.catPillActive } : styles.catPill}
            onClick={() => setActiveCategory('all')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            همه
          </motion.button>
          {filteredCategories.map((cat, i) => (
            <motion.button
              key={cat.id}
              style={activeCategory === cat.id ? { ...styles.catPill, ...styles.catPillActive } : styles.catPill}
              onClick={() => setActiveCategory(cat.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              {cat.icon && <span>{cat.icon}</span>}
              {cat.name_fa}
            </motion.button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <div className="spinner" />
          </div>
        ) : error ? (
          <div style={styles.errorContainer}>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={loadData} style={{ marginTop: 16 }}>تلاش مجدد</button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={styles.emptyContainer}><p>محصولی یافت نشد</p></div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeType}-${activeCategory}-${searchQuery}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={styles.grid}
            >
              {filteredProducts.map((product, i) => (
                <ProductCard
                  key={product.id} product={product}
                  category={categories.find((c) => c.id === product.category_id)}
                  index={i}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  )
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    padding: '48px 0 64px', background: 'var(--bg)',
    position: 'relative', overflow: 'hidden',
  },
  ambientOrb1: {
    position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(200,169,126,0.08) 0%, transparent 70%)',
    top: '-100px', right: '-200px', pointerEvents: 'none',
  },
  ambientOrb2: {
    position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,111,71,0.06) 0%, transparent 70%)',
    bottom: '-100px', left: '-150px', pointerEvents: 'none',
  },
  categories: {
    display: 'flex', justifyContent: 'center', gap: '10px',
    marginBottom: '40px', flexWrap: 'wrap' as const,
  },
  catPill: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '10px 20px', borderRadius: '26px', fontSize: '14px',
    fontWeight: 600, color: 'var(--text-muted)', background: 'var(--glass)',
    backdropFilter: 'blur(10px)', border: '1px solid var(--border)',
    transition: 'all 0.3s ease',
  },
  catPillActive: {
    color: 'var(--text-invert)', background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary-dark) 100%)',
    border: '1px solid transparent', boxShadow: '0 4px 20px rgba(139,111,71,0.3)',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px',
  },
  loadingContainer: { display: 'flex', justifyContent: 'center', padding: '80px 0' },
  errorContainer: { textAlign: 'center', padding: '60px 0', color: 'var(--error)' },
  emptyContainer: { textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '18px' },
}
