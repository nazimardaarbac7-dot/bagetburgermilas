import React from 'react'
import { YEMEKSEPETI_MENU_URL } from '../data/fullMenu'

const PHONE_NUMBER = '+905498232020'

export default function MilasCallBar({ visible }) {
  return (
    <div
      className={`milas-call-bar${visible ? ' is-visible' : ''}`}
    >
      <a
        className="milas-call-action"
        href={`tel:${PHONE_NUMBER}`}
        aria-label="Baget Burger Milas'ı ara: 0549 823 20 20"
        tabIndex={visible ? 0 : -1}
      >
        <span className="milas-call-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M7.1 3.7 9.4 7c.3.5.3 1.1-.1 1.5L8 9.8c1.3 2.6 3.5 4.8 6.2 6.2l1.3-1.3c.4-.4 1-.5 1.5-.1l3.3 2.3c.5.3.7.9.5 1.5l-.7 2.1c-.2.6-.8 1-1.4 1C9.8 21.5 2.5 14.2 2.5 5.3c0-.6.4-1.2 1-1.4l2.1-.7c.6-.2 1.2 0 1.5.5Z" />
          </svg>
        </span>
        <span className="milas-call-copy" aria-hidden="true">
          <span>BİZİ ARAYIN</span>
          <span>ALO PAKET</span>
        </span>
      </a>
      <a
        className="milas-call-action milas-order-action"
        href={YEMEKSEPETI_MENU_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Baget Burger ürünlerini Yemeksepeti'nde keşfet"
        tabIndex={visible ? 0 : -1}
      >
        <span className="milas-call-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </span>
        <strong>YEMEKSEPETİ</strong>
      </a>
    </div>
  )
}
