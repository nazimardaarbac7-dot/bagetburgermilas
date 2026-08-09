import React, { useRef } from 'react'

export default function TrayTouchZone({ enabled, onDrag, onDragEnd, onTap, onStep }) {
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
      lastX: event.clientX,
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
    const movementX = event.clientX - current.lastX
    current.lastX = event.clientX
    onDrag(movementX)
  }

  const handlePointerUp = (event) => {
    const current = gesture.current
    if (!current || current.pointerId !== event.pointerId) return

    if (current.axis === 'horizontal') {
      suppressClick.current = Math.abs(event.clientX - current.startX) > 10
      onDragEnd()
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    resetGesture()
  }

  const handlePointerCancel = () => {
    if (gesture.current?.axis === 'horizontal') onDragEnd()
    resetGesture()
  }

  const handleClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    onTap()
  }

  const handleKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    onStep(event.key === 'ArrowRight' ? 1 : -1)
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
      onKeyDown={handleKeyDown}
    />
  )
}
