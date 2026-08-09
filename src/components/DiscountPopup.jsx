import React, { useEffect, useRef } from 'react'
import { isolateModal } from '../utils/modalIsolation'

export default function DiscountPopup({ open, onClose }) {
  const rootRef = useRef(null)
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    const previouslyFocused = document.activeElement
    const restoreIsolation = isolateModal(rootRef.current)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus({ preventScroll: true })

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !rootRef.current) return
      const focusable = [...rootRef.current.querySelectorAll('button, a[href]')]
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
      restoreIsolation()
      previouslyFocused?.focus?.({ preventScroll: true })
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="discount-popup" role="dialog" aria-modal="true" aria-label="Telefon siparişlerinde yüzde 5 indirim" ref={rootRef}>
      <button className="discount-popup-backdrop" type="button" aria-label="İndirim duyurusunu kapat" onClick={onClose} />
      <div className="discount-popup-card">
        <button className="discount-popup-close" type="button" aria-label="Kapat" onClick={onClose} ref={closeRef}>×</button>
        <div className="discount-popup-body">
          <p className="discount-popup-kicker"><i /> SADECE TELEFONDA</p>
          <h2>SİPARİŞİNE<br /><span>BİZDEN.</span></h2>
          <div className="discount-popup-offer" aria-label="Yüzde 5 indirim">
            <strong>%5</strong>
            <span>İNDİRİM</span>
          </div>
          <p className="discount-popup-copy">Sürekli kampanya. Bizi ara, siparişini ver; telefon siparişine özel anında indirim kazan.</p>
          <a className="discount-popup-call" href="tel:+905498232020">
            <span>HEMEN ARA</span>
            <strong>0549 823 20 20</strong>
            <i aria-hidden="true">↗</i>
          </a>
          <button className="discount-popup-later" type="button" onClick={onClose}>ŞİMDİLİK DEĞİL</button>
        </div>
      </div>
    </div>
  )
}
