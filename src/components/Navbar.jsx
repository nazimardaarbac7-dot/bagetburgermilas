import React from 'react'

export default function Navbar({ hiddenOnShowcase = false }) {
  return (
    <nav className={`navbar${hiddenOnShowcase ? ' is-showcase-hidden' : ''}`} aria-label="Ana menü">
      <a className="brand" href="#top" aria-label="Baget Burger ana sayfa">BAGET BURGER<span>®</span></a>
      <div className="nav-links">
        <a href="#tray">MENÜ</a>
        <a href="#milas">MİLAS</a>
      </div>
    </nav>
  )
}
