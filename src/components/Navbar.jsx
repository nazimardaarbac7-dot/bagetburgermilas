import React from 'react'

export default function Navbar({ hiddenOnShowcase = false, onYellow = false }) {
  return (
    <nav className={`navbar${hiddenOnShowcase ? ' is-showcase-hidden' : ''}${onYellow ? ' is-on-yellow' : ''}`} aria-label="Ana menü">
      <a className="brand" href="#top" aria-label="Baget Burger ana sayfa">BAGET BURGER<span>®</span><small>MİLAS</small></a>
      <div className="nav-links">
        <a href="#tray">MENÜ</a>
        <a href="#milas">MİLAS</a>
      </div>
    </nav>
  )
}
