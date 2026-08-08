import React from 'react'
import BurgerInfo from '../components/BurgerInfo'
import TrayTouchZone from '../components/TrayTouchZone'

export default function BurgerShowcase({ burger, activeIndex, isReady, isActive, trayDragOffset, onTraySwipe, onBurgerTap }) {
  return (
    <section id="tray" className={`showcase${isReady ? ' is-ready' : ''}${isActive ? ' is-active' : ''}`} aria-label="Burger menüsü">
      <div className="showcase-panel">
        <div className="showcase-topline">
          <span>BAGET SEÇKİSİ</span>
          <span className="progress-count">0{activeIndex + 1} — 05</span>
        </div>
        <BurgerInfo burger={burger} />
        <TrayTouchZone enabled={isReady} dragOffset={trayDragOffset} onSwipe={onTraySwipe} onTap={onBurgerTap} />
        <p className="rotate-prompt"><i /><span className="rotate-copy-desktop">TEPSİYİ DÖNDÜRMEK İÇİN KAYDIR</span><span className="rotate-copy-mobile">KAYDIR / TEPSİYİ SÜRÜKLE</span></p>
        <div className="tray-markers" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => <span className={index === activeIndex ? 'active' : ''} key={index} />)}
        </div>
      </div>
    </section>
  )
}
