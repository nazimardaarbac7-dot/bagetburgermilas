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
        <div className="restaurant-price" role="note" aria-label={`Restoranda ${restaurantPrice} TL, normal fiyat ${burger.price} TL`}>
          <span className="restaurant-price-label" aria-hidden="true">RESTORANDA</span>
          <div className="price-comparison" aria-hidden="true">
            <div className="price"><span>₺</span>{restaurantPrice}</div>
            <del className="original-price">₺{burger.price}</del>
          </div>
        </div>
      </div>
    </aside>
  )
}
