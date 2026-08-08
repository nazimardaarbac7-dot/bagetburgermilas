export const TRAY_SETTLE_END = 0.17
export const MOBILE_TRAY_SETTLE_END = 0.075
export const TRAY_ROTATION_START = 0.31
export const TRAY_ROTATION_END = 0.94
export const HAND_PICKUP_START = 0.936
export const HAND_PICKUP_END = 1

const FIRST_BURGER_ROTATION_PROGRESS = 0.25
const FIRST_BURGER_ROTATION_END = TRAY_ROTATION_START + (TRAY_ROTATION_END - TRAY_ROTATION_START) * FIRST_BURGER_ROTATION_PROGRESS
const DESKTOP_FIRST_ROTATION_START = TRAY_ROTATION_START - (TRAY_ROTATION_START - TRAY_SETTLE_END) * 0.2
const MOBILE_FIRST_ROTATION_START = TRAY_ROTATION_START - (TRAY_ROTATION_START - MOBILE_TRAY_SETTLE_END) * 0.2

export function getTrayRotationProgress(progress, isMobile = false) {
  if (progress <= FIRST_BURGER_ROTATION_END) {
    const firstRotationStart = isMobile ? MOBILE_FIRST_ROTATION_START : DESKTOP_FIRST_ROTATION_START
    const normalized = (progress - firstRotationStart) / (FIRST_BURGER_ROTATION_END - firstRotationStart)
    return Math.min(FIRST_BURGER_ROTATION_PROGRESS, Math.max(0, normalized * FIRST_BURGER_ROTATION_PROGRESS))
  }

  const normalized = (progress - TRAY_ROTATION_START) / (TRAY_ROTATION_END - TRAY_ROTATION_START)
  return Math.min(1, Math.max(0, normalized))
}

export function getHandPickupProgress(progress) {
  const normalized = (progress - HAND_PICKUP_START) / (HAND_PICKUP_END - HAND_PICKUP_START)
  return Math.min(1, Math.max(0, normalized))
}
