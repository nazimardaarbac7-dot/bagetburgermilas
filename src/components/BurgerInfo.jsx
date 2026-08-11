import React from 'react'

export default function BurgerInfo({ burger }) {
  const restaurantPrice = Number(burger.price) - 30

  return (
    <aside className={`burger-info burger-info-${burger.id}`} key={burger.id} aria-live="polite">
      <div className="info-index">{burger.number}<span> / 06</span></div>
      <h2>{burger.name.map((word) => <span key={word}>{word}</span>)}</h2>
      <ul>
        {burger.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
      </ul>
      <div className="price-row">
        <div className="price"><span>₺</span>{burger.price}</div>
        <div className="restaurant-price-badge" role="note" aria-label={`Restoranda ${restaurantPrice} TL, normal fiyat ${burger.price} TL`}>
          <span className="restaurant-price-label" aria-hidden="true">RESTORANDA</span>
          <span className="restaurant-price-values" aria-hidden="true">
            <del>₺{burger.price}</del>
            <strong>₺{restaurantPrice}</strong>
          </span>
        </div>
      </div>
    </aside>
  )
}
