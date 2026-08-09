import React from 'react'

export default function Navbar({ onYellow = false, onOpenMenu, onNavigate }) {
  return (
    <nav className={`navbar${onYellow ? ' is-on-yellow' : ''}`} aria-label="Ana menü">
      <a className="brand" href="#top" aria-label="Baget Burger ana sayfa" onClick={(event) => { event.preventDefault(); onNavigate('top') }}>BAGET BURGER<span>®</span><small>MİLAS</small></a>
      <div className="nav-links">
        <button type="button" onClick={onOpenMenu}>MENÜ</button>
        <button type="button" onClick={() => onNavigate('milas')}>MİLAS</button>
        <a className="nav-call" href="tel:+905498232020">ARA</a>
      </div>
    </nav>
  )
}
