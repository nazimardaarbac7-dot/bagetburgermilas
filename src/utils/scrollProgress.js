export const TRAY_SETTLE_END = 0.17
export const MOBILE_TRAY_SETTLE_END = 0.075
export const TRAY_ROTATION_END = 0.62
export const FINAL_TRANSITION_START = TRAY_ROTATION_END

const DESKTOP_FIRST_ROTATION_START = TRAY_SETTLE_END
const MOBILE_FIRST_ROTATION_START = MOBILE_TRAY_SETTLE_END

function getFirstRotationStart(isMobile) {
  return isMobile ? MOBILE_FIRST_ROTATION_START : DESKTOP_FIRST_ROTATION_START
}

export function getTrayRotationProgress(progress, isMobile = false) {
  const firstRotationStart = getFirstRotationStart(isMobile)
  const normalized = (progress - firstRotationStart) / (TRAY_ROTATION_END - firstRotationStart)
  return Math.min(1, Math.max(0, normalized))
}

export function getTrayProgressForBurger(index, burgerCount, isMobile = false) {
  const safeCount = Math.max(2, burgerCount)
  const safeIndex = Math.max(0, Math.min(safeCount - 1, index))
  const rotationProgress = safeIndex / (safeCount - 1)
  const firstRotationStart = getFirstRotationStart(isMobile)
  return firstRotationStart + rotationProgress * (TRAY_ROTATION_END - firstRotationStart)
}

export function getHandPickupProgress(progress) {
  const normalized = progress / 0.323
  return Math.min(1, Math.max(0, normalized))
}

export function getHandLiftProgress(progress) {
  const normalized = (progress - 0.374) / 0.408
  return Math.min(1, Math.max(0, normalized))
}

export function getFinalTransitionProgress(progress) {
  const normalized = (progress - FINAL_TRANSITION_START) / (1 - FINAL_TRANSITION_START)
  return Math.min(1, Math.max(0, normalized))
}
