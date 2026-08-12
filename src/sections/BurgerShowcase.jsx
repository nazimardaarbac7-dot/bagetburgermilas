import React from 'react'
import BurgerInfo from '../components/BurgerInfo'
import TrayTouchZone from '../components/TrayTouchZone'

export default function BurgerShowcase({ burger, activeIndex, isReady, isActive, isInteractive, finalSequenceActive, mobileMinHeight, onTrayGestureStart, onTrayGestureEnd, onBurgerTap, onTrayStep }) {
  const isLastBurger = activeIndex === 5
  const showMilasPreview = isLastBurger && !finalSequenceActive

  return (
    <section id="tray" className={`showcase${isReady ? ' is-ready' : ''}${isActive ? ' is-active' : ''}${showMilasPreview ? ' has-milas-preview' : ''}`} style={{ '--mobile-showcase-min-height': mobileMinHeight }} aria-label="Burger menüsü">
      <div className="showcase-panel">
        <div className="showcase-topline">
          <span className="selector-label">BURGERİNİ SEÇ</span>
          <span className="progress-status">
            <span className="progress-count">0{activeIndex + 1} — 06</span>
            <span className="tray-markers" aria-hidden="true">
              {Array.from({ length: 6 }, (_, index) => <span className={index === activeIndex ? 'active' : ''} key={index} />)}
            </span>
          </span>
        </div>
        <BurgerInfo burger={burger} />
        <div className="tap-hint" aria-hidden="true">
          <span>BANA TIKLA</span>
          <svg viewBox="0 0 96 64" focusable="false">
            <path d="M82 13C59 5 28 17 13 49" />
            <path d="m13 49 1-12M13 49l12-1" />
          </svg>
        </div>
        <TrayTouchZone enabled={isInteractive} onGestureStart={onTrayGestureStart} onGestureEnd={onTrayGestureEnd} onTap={onBurgerTap} onStep={onTrayStep} />
        {!showMilasPreview && <p className={`rotate-prompt${isLastBurger ? ' is-final' : ''}`}><i /><span className="rotate-copy-desktop">AŞAĞI KAYDIR</span><span className="rotate-copy-mobile">{isLastBurger ? 'AŞAĞI KAYDIR' : 'TEPSİYİ KAYDIR'}</span></p>}
        {showMilasPreview && (
          <div className="milas-preview" aria-label="Made in Milas bölümüne ilerlemek için yukarı kaydırın">
            <strong>MADE IN MILAS</strong>
            <span>YUKARI KAYDIR</span>
            <i aria-hidden="true">↑</i>
          </div>
        )}
      </div>
    </section>
  )
}
