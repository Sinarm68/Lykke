import { useRef } from 'react'
import { motion } from 'framer-motion'
import type { Category, Product } from '../types'
import { formatPrice } from '../lib/api'

interface Props {
  product: Product
  category?: Category
  index: number
}

export default function ProductCard({ product, category, index }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const tiltX = (y - 0.5) * 12
    const tiltY = (0.5 - x) * 12
    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`
    card.style.setProperty('--mx', `${x * 100}%`)
    card.style.setProperty('--my', `${y * 100}%`)
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.5), ease: [0.22, 1, 0.36, 1] }}
      style={styles.wrapper}
    >
      <div
        ref={cardRef}
        className="card-3d"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={styles.card}
      >
        <div className="card-3d-shine" />

        {/* Image / placeholder */}
        <div style={styles.imageContainer}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} style={styles.image} />
          ) : (
            <div style={styles.placeholder}>
              <motion.span
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                style={styles.placeholderIcon}
              >
                {category?.icon ?? '☕'}
              </motion.span>
              <div style={styles.placeholderGlow} />
            </div>
          )}
          {!product.is_available && (
            <div style={styles.unavailableBadge}>ناموجود</div>
          )}
          {/* Gradient overlay on image */}
          <div style={styles.imageOverlay} />
        </div>

        {/* Content */}
        <div style={styles.content}>
          <div style={styles.tags}>
            {product.tags.includes('popular') && (
              <span className="badge badge-popular">محبوب</span>
            )}
            {product.tags.includes('new') && (
              <span className="badge badge-new">جدید</span>
            )}
          </div>
          <h3 style={styles.name}>{product.name}</h3>
          {product.description && (
            <p style={styles.description}>{product.description}</p>
          )}
          <div style={styles.footer}>
            <span style={styles.price}>{formatPrice(product.price)}</span>
            <span style={styles.categoryName}>{category?.name_fa}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    perspective: 1000,
  },
  card: {
    position: 'relative',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(250,248,245,0.95) 100%)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.6)',
    boxShadow: '0 8px 32px rgba(26, 22, 18, 0.08)',
    cursor: 'default',
    willChange: 'transform',
  },
  imageContainer: {
    position: 'relative', width: '100%', height: '210px',
    overflow: 'hidden', background: 'var(--surface)',
  },
  image: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' },
  placeholder: {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #f3efe9 0%, #e6d5b8 50%, #f3efe9 100%)',
    backgroundSize: '200% 200%', animation: 'shimmer-bg 3s ease infinite',
    position: 'relative',
  },
  placeholderIcon: { fontSize: '64px', opacity: 0.6, zIndex: 2, position: 'relative' },
  placeholderGlow: {
    position: 'absolute', width: '120px', height: '120px',
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,169,126,0.3) 0%, transparent 70%)',
    top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
  },
  imageOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
    background: 'linear-gradient(180deg, transparent 0%, rgba(26,22,18,0.15) 100%)',
    pointerEvents: 'none',
  },
  unavailableBadge: {
    position: 'absolute', top: '14px', left: '14px',
    padding: '5px 14px', borderRadius: '10px',
    background: 'rgba(196, 92, 76, 0.9)', backdropFilter: 'blur(10px)',
    color: 'white', fontSize: '12px', fontWeight: 600, zIndex: 3,
  },
  content: {
    padding: '22px', display: 'flex', flexDirection: 'column' as const,
    gap: '8px', flex: 1,
  },
  tags: { display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: '4px' },
  name: { fontSize: '18px', fontWeight: 700, color: 'var(--text)' },
  description: { fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, flex: 1 },
  footer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: '8px', paddingTop: '14px', borderTop: '1px solid var(--border)',
  },
  price: { fontSize: '17px', fontWeight: 800, color: 'var(--accent)' },
  categoryName: { fontSize: '12px', color: 'var(--text-light)' },
}
