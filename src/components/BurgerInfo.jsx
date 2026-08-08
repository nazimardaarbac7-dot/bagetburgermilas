import React from 'react'

export default function BurgerInfo({ burger }) {
  return (
    <aside className={`burger-info burger-info-${burger.id}`} key={burger.id} aria-live="polite">
      <div className="info-index">{burger.number}<span> / 05</span></div>
      <h2>{burger.name.map((word) => <span key={word}>{word}</span>)}</h2>
      <ul>
        {burger.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
      </ul>
      <div className="price"><span>₺</span>{burger.price}</div>
    </aside>
  )
}
