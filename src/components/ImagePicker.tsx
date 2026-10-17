import { useState, useEffect, useRef } from 'react'
import { Upload, Image as ImageIcon, Check, X } from 'lucide-react'
import { uploadImage, listImages } from '../lib/api'

interface Props {
  folder: string
  value: string | null
  onChange: (url: string | null) => void
}

export default function ImagePicker({ folder, value, onChange }: Props) {
  const [gallery, setGallery] = useState<{ name: string; url: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadGallery = async () => {
    try {
      setLoading(true)
      const items = await listImages(folder)
      setGallery(items)
      setErr(null)
    } catch {
      setErr('خطا در بارگذاری تصاویر')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGallery()
  }, [folder])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setErr('حجم فایل باید کمتر از ۵ مگابایت باشد')
      return
    }
    setUploading(true)
    setErr(null)
    try {
      const url = await uploadImage(file, folder)
      onChange(url)
      await loadGallery()
    } catch {
      setErr('خطا در آپلود تصویر')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div style={styles.wrap}>
      {/* Preview of selected image */}
      {value ? (
        <div style={styles.previewWrap}>
          <img src={value} alt="selected" style={styles.previewImg} />
          <button
            type="button"
            style={styles.removeBtn}
            onClick={() => onChange(null)}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div style={styles.noImage}>
          <ImageIcon size={28} color="var(--text-light)" />
          <span style={styles.noImageText}>تصویری انتخاب نشده</span>
        </div>
      )}

      {/* Upload button */}
      <div style={styles.actions}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleUpload}
        />
        <button
          type="button"
          className="btn btn-primary"
          style={styles.uploadBtn}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <Upload size={16} />
          {uploading ? 'در حال آپلود...' : 'آپلود تصویر'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          style={styles.galleryBtn}
          onClick={() => {
            setShowGallery(!showGallery)
            if (!showGallery) loadGallery()
          }}
        >
          <ImageIcon size={16} />
          انتخاب از گالری
        </button>
      </div>

      {err && <div style={styles.err}>{err}</div>}

      {/* Gallery */}
      {showGallery && (
        <div style={styles.gallery}>
          {loading ? (
            <div style={styles.galleryLoading}>در حال بارگذاری...</div>
          ) : gallery.length === 0 ? (
            <div style={styles.galleryEmpty}>هنوز تصویری آپلود نشده</div>
          ) : (
            <div style={styles.galleryGrid}>
              {gallery.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  style={
                    value === item.url
                      ? { ...styles.galleryItem, ...styles.galleryItemSelected }
                      : styles.galleryItem
                  }
                  onClick={() => {
                    onChange(item.url)
                    setShowGallery(false)
                  }}
                >
                  <img src={item.url} alt={item.name} style={styles.galleryImg} />
                  {value === item.url && (
                    <div style={styles.selectedCheck}>
                      <Check size={16} color="#fff" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  previewWrap: {
    position: 'relative',
    width: '100%',
    height: '180px',
    borderRadius: '12px',
    overflow: 'hidden',
    background: 'var(--surface)',
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
  noImage: {
    width: '100%',
    height: '180px',
    borderRadius: '12px',
    background: 'var(--surface)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: '2px dashed var(--border)',
  },
  noImageText: {
    fontSize: '14px',
    color: 'var(--text-light)',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
  },
  uploadBtn: {
    padding: '10px 20px',
    fontSize: '14px',
  },
  galleryBtn: {
    padding: '10px 20px',
    fontSize: '14px',
  },
  err: {
    padding: '8px 12px',
    borderRadius: '8px',
    background: 'rgba(196, 92, 76, 0.1)',
    color: 'var(--error)',
    fontSize: '13px',
    textAlign: 'center',
  },
  gallery: {
    background: 'var(--bg)',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid var(--border)',
  },
  galleryLoading: {
    textAlign: 'center',
    padding: '24px',
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
  galleryEmpty: {
    textAlign: 'center',
    padding: '24px',
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '10px',
  },
  galleryItem: {
    position: 'relative',
    width: '80px',
    height: '80px',
    borderRadius: '10px',
    overflow: 'hidden',
    cursor: 'pointer',
    border: '2px solid transparent',
    padding: 0,
    transition: 'border-color 0.2s ease',
  },
  galleryItemSelected: {
    border: '2px solid var(--primary)',
  },
  galleryImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  selectedCheck: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(200,169,126,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}
