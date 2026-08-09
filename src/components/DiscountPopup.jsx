import React, { useEffect } from 'react'

export default function DiscountPopup({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="discount-popup" role="dialog" aria-modal="true" aria-label="Telefon siparişlerinde yüzde 5 indirim">
      <button className="discount-popup-backdrop" type="button" aria-label="İndirim duyurusunu kapat" onClick={onClose} />
      <div className="discount-popup-card">
        <button className="discount-popup-close" type="button" aria-label="Kapat" onClick={onClose}>×</button>
        <img src="/assets/promo/telefon-siparisi-indirim.png" alt="Baget Burger Milas telefon siparişlerine yüzde 5 indirim" />
      </div>
    </div>
  )
}
