import React, { useEffect, useRef, useState } from 'react'
import { GETIR_MENU_URL, menuCategories } from '../data/fullMenu'

export default function MenuOverlay({ open, onClose }) {
  const [activeCategoryId, setActiveCategoryId] = useState(menuCategories[0].id)
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const categoryNavRef = useRef(null)
  const contentRef = useRef(null)
  const sectionRefs = useRef({})

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    const previouslyFocused = document.activeElement
    document.body.style.overflow = 'hidden'
    setActiveCategoryId(menuCategories[0].id)
    contentRef.current?.scrollTo({ top: 0 })
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

  useEffect(() => {
    if (!open) return

    const nav = categoryNavRef.current
    const activeButton = nav?.querySelector(`[data-category-tab="${activeCategoryId}"]`)
    if (!nav || !activeButton) return

    nav.scrollTo({
      left: activeButton.offsetLeft - (nav.clientWidth - activeButton.clientWidth) / 2,
      behavior: 'smooth',
    })
  }, [activeCategoryId, open])

  const selectCategory = (categoryId) => {
    const content = contentRef.current
    const section = sectionRefs.current[categoryId]
    if (!content || !section) return

    setActiveCategoryId(categoryId)
    content.scrollTo({ top: section.offsetTop - 18, behavior: 'smooth' })
  }

  const updateActiveCategory = () => {
    const content = contentRef.current
    if (!content) return

    const marker = content.scrollTop + 80
    let nextCategoryId = menuCategories[0].id

    menuCategories.forEach((category) => {
      const section = sectionRefs.current[category.id]
      if (section && section.offsetTop <= marker) nextCategoryId = category.id
    })

    setActiveCategoryId((currentCategoryId) => (
      currentCategoryId === nextCategoryId ? currentCategoryId : nextCategoryId
    ))
  }

  return (
    <div className={`menu-overlay${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <button className="menu-overlay-backdrop" type="button" aria-label="Menüyü kapat" onClick={onClose} tabIndex={-1} />
      <section className="menu-dialog" role="dialog" aria-modal="true" aria-label="Baget Burger tam menü" ref={dialogRef}>
        <button className="menu-close" type="button" onClick={onClose} ref={closeButtonRef} aria-label="Menüyü kapat">
          <span>KAPAT</span><i aria-hidden="true">×</i>
        </button>

        <nav className="menu-category-nav" aria-label="Menü kategorileri" ref={categoryNavRef}>
          {menuCategories.map((category, index) => (
            <button
              className={category.id === activeCategoryId ? 'is-active' : ''}
              type="button"
              aria-pressed={category.id === activeCategoryId}
              onClick={() => selectCategory(category.id)}
              data-category-tab={category.id}
              key={category.id}
            >
              <span>0{index + 1}</span>{category.label}
            </button>
          ))}
        </nav>

        <div className="menu-dialog-content" ref={contentRef} onScroll={updateActiveCategory}>
          {menuCategories.map((category) => (
            <section
              className="menu-category-section"
              ref={(section) => { sectionRefs.current[category.id] = section }}
              key={category.id}
            >
              <div className="menu-category-heading">
                <div>
                  <p>KATEGORİ</p>
                  <h3>{category.label}</h3>
                </div>
                <p>{category.note}</p>
                <span>{String(category.items.length).padStart(2, '0')} SEÇENEK</span>
              </div>

              <div className="menu-product-grid">
                {category.items.map((item, index) => (
                  <article
                    className="menu-product"
                    style={{ '--menu-item-delay': `${Math.min(index, 10) * 32}ms` }}
                    key={`${category.id}-${item.name}`}
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
            </section>
          ))}
        </div>

        <footer className="menu-dialog-footer">
          <p>GÜNCEL STOK VE SİPARİŞ İÇİN</p>
          <a href={GETIR_MENU_URL} target="_blank" rel="noreferrer">
            <span>GETİR'DEN SİPARİŞ VER</span>
            <i aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </i>
          </a>
        </footer>
      </section>
    </div>
  )
}
