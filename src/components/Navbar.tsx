import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Coffee, Lock, Menu as MenuIcon, X, Search, Croissant } from 'lucide-react'
import { fetchSiteSettings } from '../lib/api'

type MenuType = 'drink' | 'bakery'

interface Props {
  activeType?: MenuType
  onTypeChange?: (t: MenuType) => void
  searchQuery?: string
  onSearchChange?: (q: string) => void
}

export default function Navbar({ activeType = 'drink', onTypeChange, searchQuery = '', onSearchChange }: Props) {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [brandLogo, setBrandLogo] = useState<string | null>(null)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 60)
  })

  useEffect(() => {
    fetchSiteSettings()
      .then((s) => { if (s.brand_logo) setBrandLogo(s.brand_logo) })
      .catch(() => {})
  }, [])

  const onHero = !scrolled
  const linkColor = onHero ? '#fff' : 'var(--text)'

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        ...styles.nav,
        background: scrolled ? 'rgba(250, 248, 245, 0.88)' : 'transparent',
        boxShadow: scrolled ? '0 4px 30px rgba(26, 22, 18, 0.06)' : 'none',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      }}
    >
      <div className="container" style={styles.container}>
        {/* Left: Logo + brand name */}
        <Link to="/" style={styles.logo}>
          {brandLogo ? (
            <img src={brandLogo} alt="Lykke" style={styles.logoImg} />
          ) : (
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Coffee size={26} color={onHero ? '#fff' : 'var(--accent)'} />
            </motion.div>
          )}
          {!brandLogo && <span style={{ ...styles.logoText, color: linkColor }}>Lykke</span>}
        </Link>

        {/* Center: Menu type toggle (desktop) */}
        <div className="navbar-center-nav" style={styles.centerNav}>
          <button
            style={activeType === 'drink'
              ? { ...styles.typeBtn, ...styles.typeBtnActive }
              : { ...styles.typeBtn, color: linkColor, borderColor: 'transparent' }}
            onClick={() => onTypeChange?.('drink')}
          >
            <Coffee size={18} />
            <span>نوشیدنی‌ها</span>
          </button>
          <button
            style={activeType === 'bakery'
              ? { ...styles.typeBtn, ...styles.typeBtnActive }
              : { ...styles.typeBtn, color: linkColor, borderColor: 'transparent' }}
            onClick={() => onTypeChange?.('bakery')}
          >
            <Croissant size={18} />
            <span>شیرینی و کیک</span>
          </button>
        </div>

        {/* Right: Search (desktop) + admin + mobile toggle */}
        <div style={styles.rightNav}>
          <div className="navbar-search-desktop" style={{ ...styles.searchBox, borderColor: onHero ? 'rgba(255,255,255,0.2)' : 'var(--border)' }}>
            <Search size={16} color={onHero ? 'rgba(255,255,255,0.7)' : 'var(--text-light)'} />
            <input
              type="text"
              placeholder="جستجو..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              style={{ ...styles.searchInput, color: onHero ? '#fff' : 'var(--text)' }}
            />
          </div>
          <Link to="/admin" style={{
            ...styles.adminLink,
            background: onHero ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, var(--primary-light) 0%, rgba(200,169,126,0.3) 100%)',
            color: onHero ? '#fff' : 'var(--accent)',
            borderColor: onHero ? 'rgba(255,255,255,0.2)' : 'rgba(200,169,126,0.2)',
          }}>
            <Lock size={16} />
          </Link>
          <button className="navbar-mobile-toggle" style={{ ...styles.mobileToggle, color: linkColor }} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          className="navbar-mobile-menu"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={styles.mobileMenu}
        >
          {/* Mobile type toggle */}
          <div style={styles.mobileTypeRow}>
            <button
              style={activeType === 'drink' ? { ...styles.mobileTypeBtn, ...styles.mobileTypeBtnActive } : styles.mobileTypeBtn}
              onClick={() => { onTypeChange?.('drink'); setMobileOpen(false) }}
            >
              <Coffee size={18} />
              نوشیدنی‌ها
            </button>
            <button
              style={activeType === 'bakery' ? { ...styles.mobileTypeBtn, ...styles.mobileTypeBtnActive } : styles.mobileTypeBtn}
              onClick={() => { onTypeChange?.('bakery'); setMobileOpen(false) }}
            >
              <Croissant size={18} />
              شیرینی و کیک
            </button>
          </div>
          {/* Mobile search */}
          <div style={styles.mobileSearchBox}>
            <Search size={16} color="var(--text-light)" />
            <input
              type="text"
              placeholder="جستجو در منو..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              style={styles.mobileSearchInput}
            />
          </div>
          <Link to="/admin" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>ورود ادمین</Link>
        </motion.div>
      )}
    </motion.nav>
  )
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    padding: '12px 0', transition: 'all 0.4s ease',
  },
  container: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    gap: '16px',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    fontWeight: 800, fontSize: '21px', flexShrink: 0,
  },
  logoImg: {
    height: '36px', width: 'auto', objectFit: 'contain',
  },
  logoText: { fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 600 },
  centerNav: {
    display: 'flex', alignItems: 'center', gap: '6px',
    flex: 1, justifyContent: 'center', maxWidth: '400px',
  },
  typeBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '8px 16px', borderRadius: '10px', fontSize: '14px',
    fontWeight: 600, background: 'transparent',
    border: '1px solid transparent', transition: 'all 0.3s ease',
    whiteSpace: 'nowrap' as const,
  },
  typeBtnActive: {
    color: 'var(--text)', background: 'var(--glass)',
    border: '1px solid var(--border)',
    boxShadow: '0 2px 12px rgba(200,169,126,0.15)',
  },
  rightNav: {
    display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0,
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '0 14px', borderRadius: '10px',
    border: '1px solid', background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(10px)', width: '180px',
    transition: 'width 0.3s ease',
  },
  searchInput: {
    flex: 1, padding: '9px 0', border: 'none', background: 'transparent',
    outline: 'none', fontSize: '14px',
  },
  adminLink: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '38px', height: '38px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
    border: '1px solid', transition: 'all 0.3s ease',
  },
  mobileToggle: {
    alignItems: 'center', justifyContent: 'center',
    width: '40px', height: '40px', borderRadius: '10px',
  },
  mobileMenu: {
    flexDirection: 'column', padding: '16px 24px 20px',
    background: 'rgba(250,248,245,0.97)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border)', gap: '12px',
    overflow: 'hidden',
  },
  mobileTypeRow: {
    display: 'flex', gap: '8px',
  },
  mobileTypeBtn: {
    flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
    background: 'var(--glass)', border: '1px solid var(--border)',
    color: 'var(--text-muted)',
  },
  mobileTypeBtnActive: {
    color: 'var(--text)', background: 'var(--primary-light)',
    border: '1px solid var(--primary)',
  },
  mobileSearchBox: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '0 14px', borderRadius: '10px',
    border: '1px solid var(--border)', background: 'var(--glass)',
  },
  mobileSearchInput: {
    flex: 1, padding: '12px 0', border: 'none', background: 'transparent',
    color: 'var(--text)', outline: 'none', fontSize: '15px',
  },
  mobileLink: {
    padding: '12px 0', fontSize: '16px', fontWeight: 600,
    color: 'var(--text)', borderBottom: '1px solid var(--border)',
  },
}
