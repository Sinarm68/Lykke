import { motion } from 'framer-motion'
import { Coffee, Heart, Phone, MapPin, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={styles.footer}>
      {/* Top gradient line */}
      <div style={styles.topLine} />

      {/* Ambient glow */}
      <div style={styles.ambientGlow} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={styles.top}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={styles.brand}
          >
            <div style={styles.logoRow}>
              <div style={styles.logoCircle}>
                <Coffee size={26} color="var(--primary)" />
              </div>
              <span style={styles.logoText}>Lykke</span>
            </div>
            <p style={styles.tagline}>
              قهوه تخصصی، شیرینی تازه و لحظات دلنشین — Lykke Café
            </p>
            <div style={styles.socials}>
              <div style={styles.socialIcon}><Coffee size={18} /></div>
              <div style={styles.socialIcon}><Phone size={18} /></div>
              <div style={styles.socialIcon}><MapPin size={18} /></div>
            </div>
          </motion.div>

          <div style={styles.links}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={styles.linkCol}
            >
              <div style={styles.linkIcon}><Clock size={16} color="var(--primary)" /></div>
              <h4 style={styles.linkHeading}>ساعات کاری</h4>
              <p style={styles.linkItem}>شنبه تا پنجشنبه: ۸ تا ۲۳</p>
              <p style={styles.linkItem}>جمعه: ۹ تا ۲۳</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              style={styles.linkCol}
            >
              <div style={styles.linkIcon}><Phone size={16} color="var(--primary)" /></div>
              <h4 style={styles.linkHeading}>تماس</h4>
              <p style={styles.linkItem}>۰۲۱-۱۲۳۴۵۶۷۸</p>
              <p style={styles.linkItem}>info@lykke.cafe</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              style={styles.linkCol}
            >
              <div style={styles.linkIcon}><MapPin size={16} color="var(--primary)" /></div>
              <h4 style={styles.linkHeading}>آدرس</h4>
              <p style={styles.linkItem}>تهران، خیابان ولیعصر</p>
              <p style={styles.linkItem}>نرسیده به پارک‌وی</p>
            </motion.div>
          </div>
        </div>

        <div style={styles.bottom}>
          <p style={styles.copy}>
            ساخته شده با <Heart size={14} color="var(--error)" style={{ display: 'inline', verticalAlign: 'middle' }} fill="currentColor" /> برای عاشقان قهوه
          </p>
        </div>
      </div>
    </footer>
  )
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    background: 'linear-gradient(180deg, #1a1612 0%, #252018 100%)',
    color: 'var(--text-invert)', padding: '80px 0 28px',
    position: 'relative', overflow: 'hidden',
  },
  topLine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
    background: 'linear-gradient(90deg, transparent 0%, var(--primary) 50%, transparent 100%)',
  },
  ambientGlow: {
    position: 'absolute', width: '500px', height: '300px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(200,169,126,0.08) 0%, transparent 70%)',
    top: '-100px', left: '30%', pointerEvents: 'none',
  },
  top: {
    display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '56px',
    marginBottom: '48px',
  },
  brand: {},
  logoRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  logoCircle: {
    width: '48px', height: '48px', borderRadius: '14px',
    background: 'rgba(200,169,126,0.15)', border: '1px solid rgba(200,169,126,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: '22px', fontWeight: 800 },
  tagline: { color: 'var(--text-light)', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' },
  socials: { display: 'flex', gap: '10px' },
  socialIcon: {
    width: '38px', height: '38px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-light)', cursor: 'pointer', transition: 'all 0.3s ease',
  },
  links: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' },
  linkCol: {},
  linkIcon: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: 'rgba(200,169,126,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '12px',
  },
  linkHeading: { fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: 'var(--primary)' },
  linkItem: { fontSize: '14px', color: 'var(--text-light)', marginBottom: '6px', lineHeight: 1.6 },
  bottom: { paddingTop: '28px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' },
  copy: { fontSize: '13px', color: 'var(--text-light)' },
}
