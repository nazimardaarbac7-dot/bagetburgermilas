import React, { useEffect, useMemo, useRef, useState } from 'react'
import { GETIR_MENU_URL, menuCategories } from '../data/fullMenu'

const totalItems = menuCategories.reduce((total, category) => total + category.items.length, 0)

export default function MenuOverlay({ open, onClose }) {
  const [activeCategoryId, setActiveCategoryId] = useState(menuCategories[0].id)
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const contentRef = useRef(null)

  const activeCategory = useMemo(
    () => menuCategories.find((category) => category.id === activeCategoryId) ?? menuCategories[0],
    [activeCategoryId],
  )

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    const previouslyFocused = document.activeElement
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus({ preventScroll: true })

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = [...dialogRef.current.querySelectorAll('button:not([disabled]), a[href]')]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.({ preventScroll: true })
    }
  }, [open, onClose])

  const selectCategory = (categoryId) => {
    setActiveCategoryId(categoryId)
    requestAnimationFrame(() => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' }))
  }

  return (
    <div className={`menu-overlay${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <button className="menu-overlay-backdrop" type="button" aria-label="Menüyü kapat" onClick={onClose} tabIndex={-1} />
      <section className="menu-dialog" role="dialog" aria-modal="true" aria-labelledby="full-menu-title" ref={dialogRef}>
        <header className="menu-dialog-header">
          <div>
            <p className="menu-dialog-kicker">BAGET BURGER · MİLAS</p>
            <h2 id="full-menu-title">TAM<br />MENÜ</h2>
          </div>
          <div className="menu-dialog-meta">
            <span>{String(totalItems).padStart(2, '0')} ÜRÜN</span>
            <span>06 KATEGORİ</span>
          </div>
          <button className="menu-close" type="button" onClick={onClose} ref={closeButtonRef}>
            <span>KAPAT</span><i aria-hidden="true">×</i>
          </button>
        </header>

        <nav className="menu-category-nav" aria-label="Menü kategorileri">
          {menuCategories.map((category, index) => (
            <button
              className={category.id === activeCategory.id ? 'is-active' : ''}
              type="button"
              aria-pressed={category.id === activeCategory.id}
              onClick={() => selectCategory(category.id)}
              key={category.id}
            >
              <span>0{index + 1}</span>{category.label}
            </button>
          ))}
        </nav>

        <div className="menu-dialog-content" ref={contentRef}>
          <div className="menu-category-heading" key={`${activeCategory.id}-heading`}>
            <div>
              <p>SEÇİLİ KATEGORİ</p>
              <h3>{activeCategory.label}</h3>
            </div>
            <p>{activeCategory.note}</p>
            <span>{String(activeCategory.items.length).padStart(2, '0')} SEÇENEK</span>
          </div>

          <div className="menu-product-grid" key={activeCategory.id}>
            {activeCategory.items.map((item, index) => (
              <article
                className="menu-product"
                style={{ '--menu-item-delay': `${Math.min(index, 10) * 32}ms` }}
                key={item.name}
              >
                <span className="menu-product-index">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h4>{item.name}</h4>
                  {item.description && <p>{item.description}</p>}
                </div>
                <strong><small>₺</small>{item.price}</strong>
              </article>
            ))}
          </div>
        </div>

        <footer className="menu-dialog-footer">
          <p>GÜNCEL STOK VE SİPARİŞ İÇİN</p>
          <a href={GETIR_MENU_URL} target="_blank" rel="noreferrer">
            <span>GETİR'DEN SİPARİŞ VER</span><i aria-hidden="true">↗</i>
          </a>
        </footer>
      </section>
    </div>
  )
}
