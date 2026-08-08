import React, { useRef } from 'react'

const BURGER_STEP_ANGLE = (Math.PI * 2) / 5

export default function TrayTouchZone({ enabled, dragOffset, onGestureStart, onSwipe, onTap }) {
  const gesture = useRef(null)
  const suppressClick = useRef(false)

  const resetGesture = (preserveOffset = false) => {
    if (!preserveOffset) dragOffset.current = 0
    gesture.current = null
  }

  const handlePointerDown = (event) => {
    if (!enabled || (event.pointerType === 'mouse' && event.button !== 0)) return
    onGestureStart?.()
    suppressClick.current = false
    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: dragOffset.current,
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
    const width = Math.max(event.currentTarget.clientWidth, 1)
    const nextOffset = current.startOffset + (deltaX / width) * BURGER_STEP_ANGLE * 1.8
    dragOffset.current = Math.max(-BURGER_STEP_ANGLE * 0.72, Math.min(BURGER_STEP_ANGLE * 0.72, nextOffset))
  }

  const handlePointerUp = (event) => {
    const current = gesture.current
    if (!current || current.pointerId !== event.pointerId) return

    const deltaX = event.clientX - current.startX
    if (current.axis === 'horizontal') {
      const swipeThreshold = Math.max(24, Math.min(34, event.currentTarget.clientWidth * 0.075))
      suppressClick.current = Math.abs(deltaX) > 10
      onSwipe(Math.abs(deltaX) >= swipeThreshold ? (deltaX < 0 ? 1 : -1) : 0)
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    resetGesture(current.axis === 'horizontal')
  }

  const handlePointerCancel = () => {
    if (gesture.current?.axis === 'horizontal') {
      onSwipe(0)
      resetGesture(true)
      return
    }
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
