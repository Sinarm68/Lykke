import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut, Plus, Pencil, Trash2, X, Search, Coffee,
  LayoutGrid, ArrowRight, Check, ImageIcon, ArrowUp, ArrowDown as ArrowDownIcon,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { Category, Product } from '../types'
import {
  fetchCategories, fetchProducts,
  createProduct, updateProduct, deleteProduct,
  createCategory, updateCategory, deleteCategory,
  fetchAllHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide,
  fetchSiteSettings, updateSiteSetting,
  formatPrice,
} from '../lib/api'
import type { HeroSlide } from '../lib/api'
import ImagePicker from '../components/ImagePicker'

type Tab = 'products' | 'categories' | 'settings'

export default function AdminDashboard() {
  const { user, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('products')
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setDataLoading(true)
      const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts()])
      setCategories(cats)
      setProducts(prods)
      setError(null)
    } catch {
      setError('خطا در بارگذاری اطلاعات')
    } finally {
      setDataLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    if (user) loadData()
  }, [user, loadData])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const filteredProducts = products.filter((p) => {
    if (filterCategory !== 'all' && p.category_id !== filterCategory) return false
    if (search) {
      const q = search.toLowerCase()
      return p.name.toLowerCase().includes(q) || (p.description?.toLowerCase().includes(q) ?? false)
    }
    return true
  })

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  }

  if (!user) return null

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <Link to="/" style={styles.logo}>
          <Coffee size={24} color="var(--primary)" />
          <span>Lykke</span>
        </Link>

        <div style={styles.sidebarSection}>
          <p style={styles.sidebarLabel}>مدیریت</p>
          <button
            style={tab === 'products' ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem}
            onClick={() => setTab('products')}
          >
            <LayoutGrid size={18} />
            محصولات
            <span style={styles.countBadge}>{products.length}</span>
          </button>
          <button
            style={tab === 'categories' ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem}
            onClick={() => setTab('categories')}
          >
            <Coffee size={18} />
            دسته‌بندی‌ها
            <span style={styles.countBadge}>{categories.length}</span>
          </button>
          <button
            style={tab === 'settings' ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem}
            onClick={() => setTab('settings')}
          >
            <ImageIcon size={18} />
            تصاویر صفحه اصلی
          </button>
        </div>

        <div style={styles.sidebarBottom}>
          <Link to="/" style={styles.viewSiteLink}>
            مشاهده سایت
            <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
          </Link>
          <button style={styles.signOutBtn} onClick={handleSignOut}>
            <LogOut size={18} />
            خروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <header style={styles.mainHeader}>
          <div>
            <h1 style={styles.mainTitle}>
              {tab === 'products' ? 'مدیریت محصولات' : tab === 'categories' ? 'مدیریت دسته‌بندی‌ها' : 'تصاویر صفحه اصلی'}
            </h1>
            <p style={styles.mainSubtitle}>
              {tab === 'products'
                ? 'افزودن، ویرایش و حذف محصولات منو'
                : tab === 'categories'
                ? 'افزودن، ویرایش و حذف دسته‌بندی‌ها'
                : 'مدیریت اسلایدهای صفحه اصلی و لوگوی برند'}
            </p>
          </div>
          {tab !== 'settings' && (
            <button
              className="btn btn-primary"
              onClick={() => {
                if (tab === 'products') {
                  setEditingProduct(null)
                  setShowProductModal(true)
                } else {
                  setEditingCategory(null)
                  setShowCategoryModal(true)
                }
              }}
            >
              <Plus size={18} />
              {tab === 'products' ? 'محصول جدید' : 'دسته جدید'}
            </button>
          )}
        </header>

        {error && <div style={styles.errorBanner}>{error}</div>}

        {tab === 'products' && (
          <>
            <div style={styles.filterRow}>
              <div style={styles.searchBox}>
                <Search size={16} color="var(--text-light)" />
                <input
                  type="text"
                  placeholder="جستجو..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={styles.filterInput}
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">همه دسته‌ها</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name_fa}</option>
                ))}
              </select>
            </div>

            {dataLoading ? (
              <div style={styles.loadingRow}><div className="spinner" /></div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>نام محصول</th>
                      <th style={styles.th}>دسته</th>
                      <th style={styles.th}>قیمت</th>
                      <th style={styles.th}>وضعیت</th>
                      <th style={styles.th}>برچسب</th>
                      <th style={styles.th}>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => {
                      const cat = categories.find((c) => c.id === p.category_id)
                      return (
                        <tr key={p.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={styles.productCell}>
                              <div style={styles.productThumb}>
                                {p.image_url ? (
                                  <img src={p.image_url} alt="" style={styles.thumbImg} />
                                ) : (
                                  <span>{cat?.icon ?? '☕'}</span>
                                )}
                              </div>
                              <span style={styles.productName}>{p.name}</span>
                            </div>
                          </td>
                          <td style={styles.td}>{cat?.name_fa ?? '—'}</td>
                          <td style={styles.td}>{formatPrice(p.price)}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.statusBadge,
                              background: p.is_available ? 'rgba(123, 160, 91, 0.15)' : 'rgba(196, 92, 76, 0.15)',
                              color: p.is_available ? 'var(--success)' : 'var(--error)',
                            }}>
                              {p.is_available ? 'موجود' : 'ناموجود'}
                            </span>
                          </td>
                          <td style={styles.td}>
                            {p.tags.length > 0 ? (
                              <div style={styles.tagRow}>
                                {p.tags.map((t) => (
                                  <span key={t} className={`badge ${t === 'popular' ? 'badge-popular' : 'badge-new'}`}>
                                    {t === 'popular' ? 'محبوب' : t === 'new' ? 'جدید' : t}
                                  </span>
                                ))}
                              </div>
                            ) : '—'}
                          </td>
                          <td style={styles.td}>
                            <div style={styles.actionRow}>
                              <button
                                style={styles.editBtn}
                                onClick={() => { setEditingProduct(p); setShowProductModal(true) }}
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                style={styles.deleteBtn}
                                onClick={async () => {
                                  if (confirm(`«${p.name}» حذف شود؟`)) {
                                    await deleteProduct(p.id)
                                    await loadData()
                                  }
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {filteredProducts.length === 0 && (
                  <div style={styles.emptyState}>محصولی یافت نشد</div>
                )}
              </div>
            )}
          </>
        )}

        {tab === 'settings' && (
          <HeroSettings />
        )}

        {tab === 'categories' && (
          <div style={styles.catGrid}>
            {dataLoading ? (
              <div style={styles.loadingRow}><div className="spinner" /></div>
            ) : (
              categories.map((cat) => {
                const count = products.filter((p) => p.category_id === cat.id).length
                return (
                  <div key={cat.id} style={styles.catCard}>
                    <div style={styles.catCardHeader}>
                      <span style={styles.catIcon}>{cat.icon ?? '📁'}</span>
                      <div>
                        <h3 style={styles.catName}>{cat.name_fa}</h3>
                        <p style={styles.catMeta}>
                          {cat.type === 'drink' ? 'نوشیدنی' : 'شیرینی'} · {count} محصول
                        </p>
                      </div>
                    </div>
                    <div style={styles.catActions}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '8px 14px', fontSize: '13px' }}
                        onClick={() => { setEditingCategory(cat); setShowCategoryModal(true) }}
                      >
                        <Pencil size={14} /> ویرایش
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '8px 14px', fontSize: '13px' }}
                        onClick={async () => {
                          if (confirm(`دسته «${cat.name_fa}» و همه محصولات آن حذف شود؟`)) {
                            await deleteCategory(cat.id)
                            await loadData()
                          }
                        }}
                      >
                        <Trash2 size={14} /> حذف
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </main>

      {/* Product Modal */}
      <AnimatePresence>
        {showProductModal && (
          <ProductModal
            product={editingProduct}
            categories={categories}
            onClose={() => setShowProductModal(false)}
            onSave={async (data) => {
              if (editingProduct) {
                await updateProduct(editingProduct.id, data)
              } else {
                await createProduct(data as Omit<Product, 'id' | 'created_at'>)
              }
              setShowProductModal(false)
              await loadData()
            }}
          />
        )}
      </AnimatePresence>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <CategoryModal
            category={editingCategory}
            onClose={() => setShowCategoryModal(false)}
            onSave={async (data) => {
              if (editingCategory) {
                await updateCategory(editingCategory.id, data)
              } else {
                await createCategory(data as Omit<Category, 'id' | 'created_at'>)
              }
              setShowCategoryModal(false)
              await loadData()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Product Modal ───

interface ProductModalProps {
  product: Product | null
  categories: Category[]
  onClose: () => void
  onSave: (data: Partial<Product>) => Promise<void>
}

function ProductModal({ product, categories, onClose, onSave }: ProductModalProps) {
  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [categoryId, setCategoryId] = useState(product?.category_id ?? categories[0]?.id ?? '')
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '')
  const [isAvailable, setIsAvailable] = useState(product?.is_available ?? true)
  const [sortOrder, setSortOrder] = useState(product ? String(product.sort_order) : '0')
  const [tags, setTags] = useState<string[]>(product?.tags ?? [])
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handleSave = async () => {
    if (!name.trim()) { setErr('نام محصول را وارد کنید'); return }
    if (!categoryId) { setErr('دسته‌بندی را انتخاب کنید'); return }
    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum < 0) { setErr('قیمت معتبر وارد کنید'); return }

    setSaving(true)
    setErr(null)
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        price: priceNum,
        category_id: categoryId,
        image_url: imageUrl.trim() || null,
        is_available: isAvailable,
        sort_order: parseInt(sortOrder) || 0,
        tags,
      })
    } catch {
      setErr('خطا در ذخیره‌سازی')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell title={product ? 'ویرایش محصول' : 'محصول جدید'} onClose={onClose}>
      <div style={styles.modalBody}>
        <Field label="نام محصول">
          <input style={styles.modalInput} value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً: لاته" />
        </Field>
        <Field label="دسته‌بندی">
          <select style={styles.modalInput} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name_fa}</option>
            ))}
          </select>
        </Field>
        <Field label="توضیحات">
          <textarea
            style={{ ...styles.modalInput, minHeight: '80px', resize: 'vertical' }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="توضیح کوتاه درباره محصول..."
          />
        </Field>
        <div style={styles.modalRow}>
          <Field label="قیمت (تومان)">
            <input style={styles.modalInput} type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="80000" />
          </Field>
          <Field label="ترتیب نمایش">
            <input style={styles.modalInput} type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </Field>
        </div>
        <Field label="تصویر محصول">
          <ImagePicker
            folder="products"
            value={imageUrl || null}
            onChange={(url) => setImageUrl(url ?? '')}
          />
        </Field>
        <Field label="برچسب‌ها">
          <div style={styles.tagPicker}>
            {['popular', 'new'].map((t) => (
              <button
                key={t}
                type="button"
                style={tags.includes(t) ? { ...styles.tagPickerBtn, ...styles.tagPickerBtnActive } : styles.tagPickerBtn}
                onClick={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}
              >
                {tags.includes(t) && <Check size={14} />}
                {t === 'popular' ? 'محبوب' : 'جدید'}
              </button>
            ))}
          </div>
        </Field>
        <label style={styles.checkboxRow}>
          <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
          <span>موجود در منو</span>
        </label>

        {err && <div style={styles.modalError}>{err}</div>}

        <div style={styles.modalActions}>
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>انصراف</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'در حال ذخیره...' : 'ذخیره'}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

// ─── Category Modal ───

interface CategoryModalProps {
  category: Category | null
  onClose: () => void
  onSave: (data: Partial<Category>) => Promise<void>
}

function CategoryModal({ category, onClose, onSave }: CategoryModalProps) {
  const [name, setName] = useState(category?.name ?? '')
  const [nameFa, setNameFa] = useState(category?.name_fa ?? '')
  const [type, setType] = useState<'drink' | 'bakery'>(category?.type ?? 'drink')
  const [icon, setIcon] = useState(category?.icon ?? '')
  const [sortOrder, setSortOrder] = useState(category ? String(category.sort_order) : '0')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handleSave = async () => {
    if (!name.trim()) { setErr('نام انگلیسی را وارد کنید'); return }
    if (!nameFa.trim()) { setErr('نام فارسی را وارد کنید'); return }
    setSaving(true)
    setErr(null)
    try {
      await onSave({
        name: name.trim(),
        name_fa: nameFa.trim(),
        type,
        icon: icon.trim() || null,
        sort_order: parseInt(sortOrder) || 0,
      })
    } catch {
      setErr('خطا در ذخیره‌سازی')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell title={category ? 'ویرایش دسته' : 'دسته جدید'} onClose={onClose}>
      <div style={styles.modalBody}>
        <Field label="نام فارسی">
          <input style={styles.modalInput} value={nameFa} onChange={(e) => setNameFa(e.target.value)} placeholder="مثلاً: قهوه گرم" />
        </Field>
        <Field label="نام انگلیسی (slug)">
          <input style={styles.modalInput} value={name} onChange={(e) => setName(e.target.value)} placeholder="hot-coffee" dir="ltr" />
        </Field>
        <div style={styles.modalRow}>
          <Field label="نوع">
            <select style={styles.modalInput} value={type} onChange={(e) => setType(e.target.value as 'drink' | 'bakery')}>
              <option value="drink">نوشیدنی</option>
              <option value="bakery">شیرینی</option>
            </select>
          </Field>
          <Field label="ترتیب نمایش">
            <input style={styles.modalInput} type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </Field>
        </div>
        <Field label="آیکن (ایموجی)">
          <input style={styles.modalInput} value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="☕" />
        </Field>

        {err && <div style={styles.modalError}>{err}</div>}

        <div style={styles.modalActions}>
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>انصراف</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'در حال ذخیره...' : 'ذخیره'}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

// ─── Hero Settings ───

function HeroSettings() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [newUrl, setNewUrl] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchAllHeroSlides()
      setSlides(data)
      setErr(null)
    } catch {
      setErr('خطا در بارگذاری اسلایدها')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAdd = async () => {
    if (!newUrl.trim()) { setErr('آدرس تصویر را وارد کنید'); return }
    setErr(null)
    try {
      await createHeroSlide(newUrl.trim(), slides.length + 1)
      setNewUrl('')
      setMsg('اسلاید اضافه شد')
      setTimeout(() => setMsg(null), 3000)
      await loadData()
    } catch {
      setErr('خطا در افزودن اسلاید')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('این اسلاید حذف شود؟')) return
    try {
      await deleteHeroSlide(id)
      await loadData()
    } catch {
      setErr('خطا در حذف اسلاید')
    }
  }

  const handleMove = async (slide: HeroSlide, direction: 'up' | 'down') => {
    const sorted = [...slides].sort((a, b) => a.sort_order - b.sort_order)
    const idx = sorted.findIndex((s) => s.id === slide.id)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === sorted.length - 1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const other = sorted[swapIdx]
    try {
      await Promise.all([
        updateHeroSlide(slide.id, { sort_order: other.sort_order }),
        updateHeroSlide(other.id, { sort_order: slide.sort_order }),
      ])
      await loadData()
    } catch {
      setErr('خطا در تغییر ترتیب')
    }
  }

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      await updateHeroSlide(slide.id, { is_active: !slide.is_active })
      await loadData()
    } catch {
      setErr('خطا در تغییر وضعیت')
    }
  }

  const sortedSlides = [...slides].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div style={styles.settingsWrap}>
      {/* Brand logo section */}
      <BrandLogoSection onMsg={setMsg} onErr={setErr} />

      <div style={styles.settingsCard}>
        <h3 style={styles.settingsHeading}>افزودن اسلاید جدید</h3>
        <p style={styles.settingsHint}>یک تصویر آپلود کنید یا از گالری انتخاب کنید. تصاویر به‌ترتیب در اسلایدر صفحه اصلی نمایش داده می‌شوند.</p>
        <ImagePicker
          folder="hero"
          value={newUrl || null}
          onChange={(url) => setNewUrl(url ?? '')}
        />
        <button
          className="btn btn-primary"
          onClick={handleAdd}
          disabled={!newUrl.trim()}
          style={{ padding: '12px 24px', alignSelf: 'flex-start' }}
        >
          <Plus size={18} />
          افزودن اسلاید
        </button>
      </div>

      {err && <div style={styles.modalError}>{err}</div>}
      {msg && (
        <div style={styles.savedBanner}>
          <Check size={18} />
          {msg}
        </div>
      )}

      {loading ? (
        <div style={styles.loadingRow}><div className="spinner" /></div>
      ) : sortedSlides.length === 0 ? (
        <div style={styles.emptyState}>هنوز اسلایدی اضافه نشده</div>
      ) : (
        <div style={styles.slidesList}>
          {sortedSlides.map((slide, i) => (
            <div key={slide.id} style={styles.slideItem}>
              <div style={styles.slidePreview}>
                <img src={slide.image_url} alt={`اسلاید ${i + 1}`} style={styles.previewImg} />
              </div>
              <div style={styles.slideInfo}>
                <span style={styles.slideNum}>اسلاید {i + 1}</span>
                <span style={slide.is_active ? styles.slideActive : styles.slideInactive}>
                  {slide.is_active ? 'فعال' : 'غیرفعال'}
                </span>
              </div>
              <div style={styles.slideActions}>
                <button style={styles.slideBtn} onClick={() => handleMove(slide, 'up')} disabled={i === 0}>
                  <ArrowUp size={16} />
                </button>
                <button style={styles.slideBtn} onClick={() => handleMove(slide, 'down')} disabled={i === sortedSlides.length - 1}>
                  <ArrowDownIcon size={16} />
                </button>
                <button style={styles.slideBtn} onClick={() => handleToggleActive(slide)}>
                  {slide.is_active ? 'غیرفعال' : 'فعال'}
                </button>
                <button style={styles.deleteBtn} onClick={() => handleDelete(slide.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function BrandLogoSection({ onMsg, onErr }: { onMsg: (m: string) => void; onErr: (e: string) => void }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSiteSettings()
      .then((s) => { setLogoUrl(s.brand_logo || null) })
      .catch(() => onErr('خطا در بارگذاری لوگو'))
      .finally(() => setLoading(false))
  }, [onErr])

  const handleChange = async (url: string | null) => {
    setLogoUrl(url)
    try {
      await updateSiteSetting('brand_logo', url ?? '')
      onMsg(url ? 'لوگوی برند ذخیره شد' : 'لوگو حذف شد')
      setTimeout(() => onMsg(''), 3000)
    } catch {
      onErr('خطا در ذخیره لوگو')
    }
  }

  if (loading) return null

  return (
    <div style={styles.settingsCard}>
      <h3 style={styles.settingsHeading}>لوگوی برند</h3>
      <p style={styles.settingsHint}>لوگوی کافه‌ی خود را آپلود کنید. این تصویر جایگزین آیکن قهوه در نوار بالای سایت می‌شود.</p>
      <ImagePicker
        folder="brand"
        value={logoUrl}
        onChange={handleChange}
      />
    </div>
  )
}

// ─── Shared Modal ───

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={styles.modalOverlay}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{title}</h2>
          <button style={styles.modalClose} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={styles.modalField}>
      <label style={styles.modalLabel}>{label}</label>
      {children}
    </div>
  )
}

// ─── Styles ───

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg)',
  },
  sidebar: {
    width: '260px',
    background: 'var(--bg-dark)',
    color: 'var(--text-invert)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 20px',
    position: 'sticky',
    top: 0,
    height: '100vh',
    flexShrink: 0,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: 700,
    fontSize: '18px',
    color: 'var(--text-invert)',
    marginBottom: '40px',
  },
  sidebarSection: {
    flex: 1,
  },
  sidebarLabel: {
    fontSize: '12px',
    color: 'var(--text-light)',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 500,
    color: 'var(--text-light)',
    marginBottom: '4px',
    transition: 'all 0.2s ease',
    textAlign: 'right',
  },
  navItemActive: {
    background: 'rgba(200, 169, 126, 0.15)',
    color: 'var(--primary)',
  },
  countBadge: {
    marginRight: 'auto',
    fontSize: '12px',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  sidebarBottom: {
    borderTop: '1px solid var(--border-dark)',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  viewSiteLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    color: 'var(--text-light)',
    borderRadius: '10px',
    transition: 'color 0.2s ease',
  },
  signOutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    color: 'var(--error)',
    borderRadius: '10px',
    transition: 'background 0.2s ease',
  },
  main: {
    flex: 1,
    padding: '32px 40px',
    overflowY: 'auto',
  },
  mainHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  mainTitle: {
    fontSize: '28px',
    fontWeight: 800,
  },
  mainSubtitle: {
    fontSize: '15px',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  errorBanner: {
    padding: '14px 20px',
    borderRadius: '12px',
    background: 'rgba(196, 92, 76, 0.1)',
    color: 'var(--error)',
    marginBottom: '20px',
    fontSize: '14px',
  },
  filterRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 14px',
    borderRadius: '12px',
    border: '2px solid var(--border)',
    background: 'var(--bg-elevated)',
    flex: 1,
    minWidth: '200px',
  },
  filterInput: {
    flex: 1,
    padding: '12px 0',
    border: 'none',
    background: 'transparent',
    color: 'var(--text)',
    outline: 'none',
    fontSize: '14px',
  },
  filterSelect: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '2px solid var(--border)',
    background: 'var(--bg-elevated)',
    color: 'var(--text)',
    outline: 'none',
    fontSize: '14px',
    cursor: 'pointer',
  },
  tableWrap: {
    background: 'var(--bg-elevated)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'right',
    padding: '16px 20px',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    borderBottom: '2px solid var(--border)',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid var(--border)',
    transition: 'background 0.15s ease',
  },
  td: {
    padding: '14px 20px',
    fontSize: '14px',
    color: 'var(--text)',
  },
  productCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  productThumb: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'var(--surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  productName: {
    fontWeight: 500,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 500,
  },
  tagRow: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
  },
  actionRow: {
    display: 'flex',
    gap: '8px',
  },
  editBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    background: 'var(--primary-light)',
    color: 'var(--accent)',
    transition: 'opacity 0.2s ease',
  },
  deleteBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    background: 'rgba(196, 92, 76, 0.12)',
    color: 'var(--error)',
    transition: 'opacity 0.2s ease',
  },
  emptyState: {
    padding: '48px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '15px',
  },
  loadingRow: {
    display: 'flex',
    justifyContent: 'center',
    padding: '60px 0',
  },
  // Category cards
  catGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  catCard: {
    background: 'var(--bg-elevated)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
  },
  catCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '20px',
  },
  catIcon: {
    fontSize: '32px',
    width: '52px',
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    background: 'var(--surface)',
  },
  catName: {
    fontSize: '18px',
    fontWeight: 700,
    marginBottom: '4px',
  },
  catMeta: {
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  catActions: {
    display: 'flex',
    gap: '10px',
  },
  // Modal
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(26, 24, 22, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
  },
  modalCard: {
    width: '100%',
    maxWidth: '560px',
    maxHeight: '90vh',
    overflowY: 'auto',
    background: 'var(--bg-elevated)',
    borderRadius: '20px',
    boxShadow: 'var(--shadow-lg)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 28px',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    background: 'var(--bg-elevated)',
    zIndex: 1,
    borderRadius: '20px 20px 0 0',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 700,
  },
  modalClose: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    color: 'var(--text-muted)',
    transition: 'background 0.2s ease',
  },
  modalBody: {
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  modalField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  modalLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text)',
  },
  modalInput: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '2px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text)',
    outline: 'none',
    fontSize: '15px',
    transition: 'border-color 0.2s ease',
  },
  modalRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '15px',
    cursor: 'pointer',
  },
  tagPicker: {
    display: 'flex',
    gap: '10px',
  },
  tagPickerBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 500,
    border: '2px solid var(--border)',
    color: 'var(--text-muted)',
    transition: 'all 0.2s ease',
  },
  tagPickerBtnActive: {
    border: '2px solid var(--primary)',
    background: 'var(--primary-light)',
    color: 'var(--accent)',
  },
  modalError: {
    padding: '10px 14px',
    borderRadius: '10px',
    background: 'rgba(196, 92, 76, 0.1)',
    color: 'var(--error)',
    fontSize: '14px',
    textAlign: 'center',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '8px',
  },
  // Hero settings
  settingsWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '760px',
  },
  settingsCard: {
    background: 'var(--bg-elevated)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  settingsHeading: {
    fontSize: '18px',
    fontWeight: 700,
  },
  settingsHint: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
  },
  addRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'stretch',
  },
  slidesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  slideItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: 'var(--bg-elevated)',
    borderRadius: '14px',
    padding: '14px',
    boxShadow: 'var(--shadow-sm)',
  },
  slidePreview: {
    width: '160px',
    height: '90px',
    borderRadius: '10px',
    overflow: 'hidden',
    flexShrink: 0,
    background: 'var(--surface)',
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  slideInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  slideNum: {
    fontSize: '15px',
    fontWeight: 600,
  },
  slideActive: {
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--success)',
  },
  slideInactive: {
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--text-light)',
  },
  slideActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  slideBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    background: 'var(--surface)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  savedBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '12px',
    background: 'rgba(123, 160, 91, 0.15)',
    color: 'var(--success)',
    fontSize: '14px',
    fontWeight: 500,
  },
}
