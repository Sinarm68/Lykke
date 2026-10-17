import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, ArrowRight, Coffee } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError('ایمیل و رمز عبور را وارد کنید')
      return
    }
    setLoading(true)
    const fn = mode === 'login' ? signIn : signUp
    const { error: err } = await fn(email, password)
    setLoading(false)
    if (err) {
      setError(err)
    } else {
      navigate('/admin/dashboard')
    }
  }

  return (
    <div style={styles.page}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.card}
      >
        <Link to="/" style={styles.backLink}>
          <Coffee size={24} color="var(--accent)" />
          <span>کافه بیکری</span>
        </Link>

        <div style={styles.iconCircle}>
          <Lock size={28} color="var(--primary)" />
        </div>
        <h1 style={styles.title}>
          {mode === 'login' ? 'ورود ادمین' : 'ساخت حساب ادمین'}
        </h1>
        <p style={styles.subtitle}>
          {mode === 'login'
            ? 'برای مدیریت منو وارد شوید'
            : 'یک حساب ادمین جدید بسازید'}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>ایمیل</label>
            <div style={styles.inputRow}>
              <Mail size={18} color="var(--text-light)" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cafe.ir"
                style={styles.input}
                autoComplete="email"
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>رمز عبور</label>
            <div style={styles.inputRow}>
              <Lock size={18} color="var(--text-light)" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={styles.submitBtn}
          >
            {loading ? 'در حال پردازش...' : mode === 'login' ? 'ورود' : 'ثبت‌نام'}
            <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
          </button>
        </form>

        <button
          style={styles.modeSwitch}
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
        >
          {mode === 'login' ? 'حساب ندارید؟ ثبت‌نام کنید' : 'حساب دارید؟ وارد شوید'}
        </button>
      </motion.div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, var(--surface) 0%, var(--bg) 100%)',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: 'var(--bg-elevated)',
    borderRadius: '24px',
    padding: '40px 36px',
    boxShadow: 'var(--shadow-lg)',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 700,
    fontSize: '16px',
    marginBottom: '32px',
    color: 'var(--text)',
  },
  iconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    background: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '15px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    marginBottom: '32px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text)',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 16px',
    borderRadius: '12px',
    border: '2px solid var(--border)',
    background: 'var(--bg)',
    transition: 'border-color 0.2s ease',
  },
  input: {
    flex: 1,
    padding: '14px 0',
    border: 'none',
    background: 'transparent',
    color: 'var(--text)',
    outline: 'none',
    fontSize: '15px',
  },
  error: {
    padding: '12px 16px',
    borderRadius: '10px',
    background: 'rgba(196, 92, 76, 0.1)',
    color: 'var(--error)',
    fontSize: '14px',
    textAlign: 'center',
  },
  submitBtn: {
    width: '100%',
    padding: '15px',
    fontSize: '16px',
    marginTop: '4px',
  },
  modeSwitch: {
    width: '100%',
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: 'var(--accent)',
    padding: '8px',
    transition: 'opacity 0.2s ease',
  },
}
