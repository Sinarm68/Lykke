import { useState } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Menu from '../components/Menu'
import Footer from '../components/Footer'
import { motion } from 'framer-motion'
import { Award, Leaf, Clock, Sparkles, Heart, Coffee } from 'lucide-react'

type MenuType = 'drink' | 'bakery'

export default function HomePage() {
  const [activeType, setActiveType] = useState<MenuType>('drink')
  const [searchQuery, setSearchQuery] = useState('')

  const handleTypeChange = (t: MenuType) => {
    setActiveType(t)
    const menuEl = document.getElementById('menu')
    if (menuEl) {
      const navHeight = 70
      const top = menuEl.getBoundingClientRect().top + window.scrollY - navHeight
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <>
      <Navbar
        activeType={activeType}
        onTypeChange={handleTypeChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <Hero />
      <FeatureStrip />
      <Menu activeType={activeType} searchQuery={searchQuery} />
      <AboutSection />
      <Footer />
    </>
  )
}

function FeatureStrip() {
  const features = [
    { icon: Award, title: 'کیفیت تخصصی', desc: 'دانه‌های قهوه انتخاب‌شده از بهترین مزارع', color: '#c8a97e' },
    { icon: Leaf, title: 'مواد تازه', desc: 'شیرینی و کیک روزانه با مواد طبیعی', color: '#7ba05b' },
    { icon: Clock, title: 'هر روز باز', desc: 'از صبح زود تا آخر شب منتظر شما هستیم', color: '#d4a943' },
    { icon: Heart, title: 'با عشق', desc: 'هر فنجان و هر شیرینی با عشق آماده می‌شود', color: '#c45c4c' },
  ]
  return (
    <section style={{ padding: '28px 0', background: 'var(--bg-elevated)', position: 'relative', overflow: 'hidden' }}>
      <div style={styles.ambientOrb} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={styles.featureGrid}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -4 }}
              style={styles.featureCard}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{ ...styles.featureIconWrap, background: `${f.color}15` }}
              >
                <f.icon size={24} color={f.color} />
              </motion.div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AboutSection() {
  return (
    <section id="about" style={{ padding: '80px 0', background: 'linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)', position: 'relative', overflow: 'hidden' }}>
      <div style={styles.aboutOrb1} />
      <div style={styles.aboutOrb2} />
      <div className="container" style={{ maxWidth: '840px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div style={styles.aboutBadge}>
            <Sparkles size={14} />
            داستان ما
          </div>
          <h2 style={styles.aboutTitle}>
            <span className="gradient-text">عشق</span> در هر فنجان
          </h2>
          <p style={styles.aboutText}>
            Lykke با عشق به قهوه و شیرینی شروع شد. ما باور داریم که هر فنجان قهوه و هر
            تکه شیرینی باید تجربه‌ای فراموش‌نشدنی باشد. از قهوه‌های تخصصی گرم و سرد گرفته تا
            کیک‌ها، کوکی‌ها و باقلوای سنتی — همه روزانه و با مواد درجه‌یک آماده می‌شوند.
          </p>
          <div style={styles.aboutIcons}>
            <Coffee size={32} color="var(--accent)" style={{ margin: '0 12px' }} />
            <Heart size={28} color="var(--error)" fill="currentColor" style={{ margin: '0 12px' }} />
            <Sparkles size={30} color="var(--primary)" style={{ margin: '0 12px' }} />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const styles: Record<string, React.CSSProperties> = {
  ambientOrb: {
    position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(200,169,126,0.06) 0%, transparent 70%)',
    top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none',
  },
  featureGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px',
  },
  featureCard: {
    textAlign: 'center', padding: '20px 16px', borderRadius: '16px',
    background: 'var(--glass)', backdropFilter: 'blur(10px)',
    border: '1px solid var(--border)', transition: 'all 0.3s ease',
  },
  featureIconWrap: {
    width: '48px', height: '48px', borderRadius: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 12px',
  },
  featureTitle: { fontSize: '16px', fontWeight: 700, marginBottom: '6px' },
  featureDesc: { fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 },
  aboutOrb1: {
    position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(200,169,126,0.06) 0%, transparent 70%)',
    top: '0', right: '-100px', pointerEvents: 'none',
  },
  aboutOrb2: {
    position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,111,71,0.05) 0%, transparent 70%)',
    bottom: '0', left: '-50px', pointerEvents: 'none',
  },
  aboutBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', fontWeight: 600, color: 'var(--accent)',
    letterSpacing: '2px', marginBottom: '20px', padding: '8px 18px',
    background: 'var(--glass)', backdropFilter: 'blur(10px)',
    border: '1px solid var(--glass-border)', borderRadius: '24px',
  },
  aboutTitle: {
    fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, marginBottom: '24px', letterSpacing: '-1px',
  },
  aboutText: {
    fontSize: '18px', lineHeight: 1.9, color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto',
  },
  aboutIcons: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '36px',
  },
}
