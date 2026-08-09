export const TRAY_SETTLE_END = 0.17
export const MOBILE_TRAY_SETTLE_END = 0.075
export const TRAY_ROTATION_END = 0.62
export const FINAL_TRANSITION_START = TRAY_ROTATION_END

const HAND_PICKUP_END = 0.323
const HAND_REACH_END = HAND_PICKUP_END * 0.6
const HAND_GRIP_END = 0.374
const HAND_LIFT_END = 0.7004
const POST_GRIP_SCROLL_SCALE = 0.9
const GRIP_END_SEQUENCE_PROGRESS = FINAL_TRANSITION_START + HAND_GRIP_END * (1 - FINAL_TRANSITION_START)
const SHOWCASE_SCROLL_SPAN_SCALE = GRIP_END_SEQUENCE_PROGRESS + (1 - GRIP_END_SEQUENCE_PROGRESS) * POST_GRIP_SCROLL_SCALE
const GRIP_END_RAW_PROGRESS = GRIP_END_SEQUENCE_PROGRESS / SHOWCASE_SCROLL_SPAN_SCALE

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
  const normalized = progress / HAND_PICKUP_END
  return Math.min(1, Math.max(0, normalized))
}

export function getHandLiftProgress(progress) {
  // HandPickup visually reaches the burger at 60% of its pickup progress.
  // Start lifting at that exact contact point so continued scrolling always
  // produces visible movement instead of passing through a dead interval.
  const normalized = (progress - HAND_REACH_END) / (HAND_LIFT_END - HAND_REACH_END)
  return Math.min(1, Math.max(0, normalized))
}

export function getFinalTransitionProgress(progress) {
  const normalized = (progress - FINAL_TRANSITION_START) / (1 - FINAL_TRANSITION_START)
  return Math.min(1, Math.max(0, normalized))
}

// The showcase is physically shorter only after the hand has gripped the final
// burger. This piecewise mapping preserves every earlier scroll distance while
// making the lift and the following Milas handoff 10% quicker in both directions.
export function getSequenceProgress(rawProgress) {
  const clamped = Math.min(1, Math.max(0, rawProgress))
  if (clamped <= GRIP_END_RAW_PROGRESS) return clamped * SHOWCASE_SCROLL_SPAN_SCALE

  const postGripProgress = (clamped - GRIP_END_RAW_PROGRESS) / (1 - GRIP_END_RAW_PROGRESS)
  return GRIP_END_SEQUENCE_PROGRESS + postGripProgress * (1 - GRIP_END_SEQUENCE_PROGRESS)
}

export function getRawProgressForSequenceProgress(sequenceProgress) {
  const clamped = Math.min(1, Math.max(0, sequenceProgress))
  if (clamped <= GRIP_END_SEQUENCE_PROGRESS) return clamped / SHOWCASE_SCROLL_SPAN_SCALE

  const postGripProgress = (clamped - GRIP_END_SEQUENCE_PROGRESS) / (1 - GRIP_END_SEQUENCE_PROGRESS)
  return GRIP_END_RAW_PROGRESS + postGripProgress * (1 - GRIP_END_RAW_PROGRESS)
}
