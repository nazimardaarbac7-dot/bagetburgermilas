import React from 'react'

const GOOGLE_MAPS_URL = 'https://www.google.com/maps?q=Baget+Burger+Milas'

const reviews = [
  { quote: "Milas'ta hamburger yiyeceksen başka adres aramaya gerek yok.", name: 'KORAY ETYEMEZ', rotation: -7, tone: 'cream' },
  { quote: 'Lezzet ve atmosfer çok güzel. Her şey için teşekkür ederiz.', name: 'HAMDİ KARADAĞ', rotation: 6, tone: 'ink' },
  { quote: "Nihayet! Milas'ta kaliteli hamburger yeme zamanı.", name: 'UFUK M.', rotation: -4, tone: 'clay' },
  { quote: "Milas'ta yediğim açık ara en iyi burger.", name: 'YAVUZ YAVUZER', rotation: 5, tone: 'sand' },
]

export default function MilasSection({ onOpenMenu }) {
  return (
    <section id="milas" className="milas-section">
      <div className="milas-rule" />
      <div className="milas-intro">
        <div className="reviews-composition" aria-label="Müşteri yorumları">
          <p className="reviews-label">MİLAS'TAN NOTLAR <span>04 / 04</span></p>
          {reviews.map((review, index) => (
            <article
              className={`review-card review-card-${index + 1} ${review.tone}`}
              data-rotation={review.rotation}
              key={review.name}
            >
              <div className="review-stars" aria-label="5 yıldız">★★★★★</div>
              <blockquote>“{review.quote}”</blockquote>
              <footer><span>{review.name}</span><a href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer" aria-label={`${review.name} yorumunu Google'da görüntüle`}>GOOGLE ↗</a></footer>
            </article>
          ))}
        </div>
        <div className="milas-copy">
          <p className="eyebrow">YEREL BİR TUTKU</p>
          <h2>MADE<br />IN MILAS</h2>
          <img
            className="bitten-burger"
            src="/assets/burgers/baldicanli-burger-bitten.webp"
            alt="Yarısı yenmiş Badılcanlı Burger"
          />
          <button className="menu-cta" type="button" onClick={onOpenMenu} aria-label="Tüm menüyü gör">
            <span className="menu-cta-art" aria-hidden="true">
              <img src="/assets/interaction/menu-drumstick-cutout.png" alt="" loading="lazy" decoding="async" />
              <span className="menu-cta-label">TÜM MENÜ</span>
            </span>
          </button>
        </div>
      </div>
      <div className="milas-details">
        <p>Baget Burger<br />İsmet Paşa, Halilbey Blv. No:8/B<br />48200 Milas / Muğla<br /><strong>HER GÜN 11.00–23.00</strong></p>
        <a href="tel:+905498232020">0549 823 20 20</a>
        <a className="directions" href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer">YOL TARİFİ <span>↗</span></a>
      </div>
      <p className="footer-note">İYİ YEMEK, TAVİZ YOK <span>✦</span> İYİ YEMEK, TAVİZ YOK</p>
    </section>
  )
}
