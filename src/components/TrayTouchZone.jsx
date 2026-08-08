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

    if (!current.axis && Math.hypot(deltaX, deltaY) > 8) {
      current.axis = Math.abs(deltaX) > Math.abs(deltaY) * 1.15 ? 'horizontal' : 'vertical'
      if (current.axis === 'horizontal') event.currentTarget.setPointerCapture(event.pointerId)
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
    let transitionAccepted = false
    if (current.axis === 'horizontal' && Math.abs(deltaX) > 42) {
      suppressClick.current = true
      transitionAccepted = onSwipe(deltaX < 0 ? 1 : -1) === true
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    resetGesture(transitionAccepted)
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
      onPointerCancel={() => resetGesture()}
      onClick={handleClick}
    />
  )
}
