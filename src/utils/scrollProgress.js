export const TRAY_SETTLE_END = 0.17
export const MOBILE_TRAY_SETTLE_END = 0.075
export const TRAY_ROTATION_START = 0.31
export const TRAY_ROTATION_END = 0.94
export const HAND_PICKUP_START = 0.936
export const HAND_PICKUP_END = 1

export function getTrayRotationProgress(progress) {
  const normalized = (progress - TRAY_ROTATION_START) / (TRAY_ROTATION_END - TRAY_ROTATION_START)
  return Math.min(1, Math.max(0, normalized))
}

export function getHandPickupProgress(progress) {
  const normalized = (progress - HAND_PICKUP_START) / (HAND_PICKUP_END - HAND_PICKUP_START)
  return Math.min(1, Math.max(0, normalized))
}
