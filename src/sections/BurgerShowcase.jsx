import React from 'react'
import BurgerInfo from '../components/BurgerInfo'
import TrayTouchZone from '../components/TrayTouchZone'

export default function BurgerShowcase({ burger, activeIndex, isReady, isActive, isInteractive, onTrayDrag, onTrayDragEnd, onBurgerTap, onTrayStep }) {
  return (
    <section id="tray" className={`showcase${isReady ? ' is-ready' : ''}${isActive ? ' is-active' : ''}`} aria-label="Burger menüsü">
      <div className="showcase-panel">
        <div className="showcase-topline">
          <span className="selector-label">BURGERİNİ SEÇ</span>
          <span className="progress-count">0{activeIndex + 1} — 06</span>
        </div>
        <BurgerInfo burger={burger} />
        <div className="tap-hint" aria-hidden="true">
          <span>BANA TIKLA</span>
          <svg viewBox="0 0 96 64" focusable="false">
            <path d="M82 13C59 5 28 17 13 49" />
            <path d="m13 49 1-12M13 49l12-1" />
          </svg>
        </div>
        <TrayTouchZone enabled={isInteractive} onDrag={onTrayDrag} onDragEnd={onTrayDragEnd} onTap={onBurgerTap} onStep={onTrayStep} />
        <p className="rotate-prompt"><i /><span className="rotate-copy-desktop">TEPSİYİ KAYDIR / BURGERE DOKUN</span><span className="rotate-copy-mobile">TEPSİYİ KAYDIR</span></p>
        <div className="tray-markers" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => <span className={index === activeIndex ? 'active' : ''} key={index} />)}
        </div>
      </div>
    </section>
  )
}
