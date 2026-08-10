import React from 'react'

export default function BurgerInfo({ burger }) {
  return (
    <aside className={`burger-info burger-info-${burger.id}`} key={burger.id} aria-live="polite">
      <div className="info-index">{burger.number}<span> / 06</span></div>
      <h2>{burger.name.map((word) => <span key={word}>{word}</span>)}</h2>
      <ul>
        {burger.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
      </ul>
      <div className="price">
        <span>₺</span>{burger.price}
        <div className="restoran-badge" aria-label={`Restoranda ₺${Number(burger.price) - 30}`}>
          <div className="restoran-badge-inner">
            <div className="restoran-badge-label">RESTORANDA</div>
            <div className="restoran-badge-price"><span>₺</span>{Number(burger.price) - 30}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
