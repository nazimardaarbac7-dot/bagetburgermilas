import React, { useRef } from 'react'

export default function TrayTouchZone({ enabled, onSwipe, onTap }) {
  const gesture = useRef(null)
  const suppressClick = useRef(false)

  const resetGesture = () => {
    gesture.current = null
  }

  const handlePointerDown = (event) => {
    if (!enabled || (event.pointerType === 'mouse' && event.button !== 0)) return
    suppressClick.current = false
    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      axis: null,
    }
  }

  const handlePointerMove = (event) => {
    const current = gesture.current
    if (!current || current.pointerId !== event.pointerId) return

    const deltaX = event.clientX - current.startX
    const deltaY = event.clientY - current.startY

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    if (!current.axis && Math.hypot(deltaX, deltaY) > 7) {
      if (absX >= absY * 0.85) {
        current.axis = 'horizontal'
        event.currentTarget.setPointerCapture(event.pointerId)
      } else if (absY > 14 && absY > absX * 1.25) {
        current.axis = 'vertical'
      }
    }

    if (current.axis !== 'horizontal') return
    event.preventDefault()
  }

  const handlePointerUp = (event) => {
    const current = gesture.current
    if (!current || current.pointerId !== event.pointerId) return

    const deltaX = event.clientX - current.startX
    if (current.axis === 'horizontal') {
      const swipeThreshold = Math.max(22, Math.min(30, event.currentTarget.clientWidth * 0.065))
      suppressClick.current = Math.abs(deltaX) > 10
      if (Math.abs(deltaX) >= swipeThreshold) onSwipe(deltaX < 0 ? 1 : -1)
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    resetGesture()
  }

  const handlePointerCancel = () => {
    resetGesture()
  }

  const handleClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    onTap()
  }

  return (
    <button
      className="tray-touch-zone"
      type="button"
      disabled={!enabled}
      aria-label="Tepsiyi sürükleyerek burger değiştirin veya aktif burgere dokunun"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClick={handleClick}
    />
  )
}
