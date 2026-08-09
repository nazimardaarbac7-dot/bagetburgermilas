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
        <div className="discount-popup-body">
          <p className="discount-popup-kicker"><i /> SADECE TELEFONDA</p>
          <h2>SİPARİŞİNE<br /><span>BİZDEN.</span></h2>
          <div className="discount-popup-offer" aria-label="Yüzde 5 indirim">
            <strong>%5</strong>
            <span>İNDİRİM</span>
          </div>
          <p className="discount-popup-copy">Bizi ara, siparişini ver.<br />Telefon siparişine özel anında indirim kazan.</p>
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
