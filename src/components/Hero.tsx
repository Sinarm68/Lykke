import { useState, useEffect, useCallback } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { fetchHeroSlides } from '../lib/api'
import type { HeroSlide } from '../lib/api'

const DEFAULT_SLIDES = [
  'https://images.pexels.com/photos/35821973/pexels-photo-35821973.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/31672060/pexels-photo-31672060.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/14131857/pexels-photo-14131857.jpeg?auto=compress&cs=tinysrgb&w=1920',
]

const SLIDE_INTERVAL = 5000

export default function Hero() {
  const { scrollY } = useScroll()
  const imageY = useTransform(scrollY, [0, 600], ['0%', '20%'])
  const overlayOpacity = useTransform(scrollY, [0, 400], [1, 0])

  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    fetchHeroSlides()
      .then((data) => {
        if (data.length > 0) setSlides(data)
      })
      .catch(() => {})
  }, [])

  const slideUrls = slides.length > 0 ? slides.map((s) => s.image_url) : DEFAULT_SLIDES

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slideUrls.length)
  }, [slideUrls.length])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slideUrls.length) % slideUrls.length)
  }, [slideUrls.length])

  useEffect(() => {
    if (slideUrls.length <= 1) return
    const timer = setInterval(next, SLIDE_INTERVAL)
    return () => clearInterval(timer)
  }, [next, slideUrls.length])

  return (
    <section style={styles.hero}>
      {/* Sliding background images */}
      <motion.div style={{ ...styles.bgImage, y: imageY }}>
        <AnimatePresence mode="popLayout">
          <motion.img
            key={current}
            src={slideUrls[current]}
            alt="Lykke Café"
            style={styles.img}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>
      </motion.div>

      {/* Gradient overlays for readability */}
      <div style={styles.overlayBase} />
      <div style={styles.overlayLeft} />

      {/* Slide indicators */}
      {slideUrls.length > 1 && (
        <div style={styles.indicators}>
          {slideUrls.map((_, i) => (
            <button
              key={i}
              style={i === current ? { ...styles.indicator, ...styles.indicatorActive } : styles.indicator}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}

      {/* Arrow controls */}
      {slideUrls.length > 1 && (
        <>
          <button style={styles.arrowPrev} onClick={prev} aria-label="قبلی">
            <ArrowDown size={22} color="#fff" style={{ transform: 'rotate(90deg)' }} />
          </button>
          <button style={styles.arrowNext} onClick={next} aria-label="بعدی">
            <ArrowDown size={22} color="#fff" style={{ transform: 'rotate(-90deg)' }} />
          </button>
        </>
      )}

      {/* Content */}
      <motion.div style={{ ...styles.overlay, opacity: overlayOpacity }}>
        <div className="container" style={styles.content}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={styles.textBlock}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h1 style={styles.title}>
                <span style={styles.brandName}>Lykke</span>
              </h1>
              <div style={styles.titleLine} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              style={styles.subtitle}
            >
              قهوه‌های تخصصی، نوشیدنی‌های گرم و سرد، شیرینی‌ها و کیک‌های تازه
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={styles.scrollIndicator}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <ArrowDown size={20} color="#fff" />
        </motion.div>
      </motion.div>
    </section>
  )
}

const styles: Record<string, React.CSSProperties> = {
  hero: {
    position: 'relative', height: '100vh', minHeight: '640px',
    overflow: 'hidden',
    background: '#1a1612',
  },
  bgImage: {
    position: 'absolute', inset: '-10%',
    zIndex: 0,
  },
  img: {
    width: '100%', height: '100%', objectFit: 'cover',
    position: 'absolute', inset: 0,
  },
  overlayBase: {
    position: 'absolute', inset: 0, zIndex: 1,
    background: 'linear-gradient(180deg, rgba(26,22,18,0.3) 0%, rgba(26,22,18,0.15) 50%, rgba(26,22,18,0.5) 100%)',
  },
  overlayLeft: {
    position: 'absolute', inset: 0, zIndex: 1,
    background: 'linear-gradient(90deg, rgba(26,22,18,0.6) 0%, rgba(26,22,18,0.15) 40%, transparent 70%)',
  },
  overlay: {
    position: 'absolute', inset: 0, zIndex: 3,
    display: 'flex', alignItems: 'center',
  },
  content: { pointerEvents: 'auto' },
  textBlock: { maxWidth: '600px' },
  brandName: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(80px, 12vw, 160px)',
    fontWeight: 600,
    lineHeight: 1,
    color: '#ffffff',
    letterSpacing: '-2px',
    textShadow: '0 4px 40px rgba(0,0,0,0.4), 0 0 80px rgba(200,169,126,0.15)',
    display: 'block',
  },
  titleLine: {
    width: '60px',
    height: '3px',
    background: 'linear-gradient(90deg, var(--primary), transparent)',
    marginTop: '8px',
    marginBottom: '28px',
  },
  title: {
    marginBottom: '0',
  },
  titleAccent: { fontSize: 'inherit', fontWeight: 900 },
  subtitle: {
    fontSize: '20px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7,
    marginBottom: '36px', maxWidth: '480px',
    textShadow: '0 2px 20px rgba(0,0,0,0.4)',
    fontWeight: 400,
  },
  indicators: {
    position: 'absolute', bottom: '90px', left: '50%',
    transform: 'translateX(-50%)', zIndex: 4,
    display: 'flex', gap: '10px',
  },
  indicator: {
    width: '10px', height: '10px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer',
    transition: 'all 0.3s ease', padding: 0,
  },
  indicatorActive: {
    width: '32px', borderRadius: '5px',
    background: 'var(--primary)',
  },
  arrowPrev: {
    position: 'absolute', top: '50%', right: '24px', zIndex: 4,
    width: '48px', height: '48px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
    transform: 'translateY(-50%)',
  },
  arrowNext: {
    position: 'absolute', top: '50%', left: '24px', zIndex: 4,
    width: '48px', height: '48px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
    transform: 'translateY(-50%)',
  },
  scrollIndicator: {
    position: 'absolute', bottom: '30px', left: '50%',
    transform: 'translateX(-50%)', zIndex: 4,
    width: '44px', height: '44px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
}
