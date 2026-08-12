export const TRAY_SETTLE_END = 0.17
export const MOBILE_TRAY_SETTLE_END = 0.075
export const TRAY_ROTATION_END = 0.62
export const FINAL_TRANSITION_START = TRAY_ROTATION_END
const ACTIVE_INDEX_HYSTERESIS = 0.08
export const TRAY_SWIPE_STEP_THRESHOLD = 20

const HAND_PICKUP_END = 0.323
const HAND_REACH_END = HAND_PICKUP_END * 0.6
const HAND_GRIP_END = 0.374
const HAND_LIFT_END = 0.7004
const POST_GRIP_SCROLL_SCALE = 0.9
export const GRIP_END_SEQUENCE_PROGRESS = FINAL_TRANSITION_START + HAND_GRIP_END * (1 - FINAL_TRANSITION_START)
const SHOWCASE_SCROLL_SPAN_SCALE = GRIP_END_SEQUENCE_PROGRESS + (1 - GRIP_END_SEQUENCE_PROGRESS) * POST_GRIP_SCROLL_SCALE
const GRIP_END_RAW_PROGRESS = GRIP_END_SEQUENCE_PROGRESS / SHOWCASE_SCROLL_SPAN_SCALE
const MOBILE_INITIAL_POST_GRIP_DISTANCE_SCALE = 0.85
const MOBILE_ADDITIONAL_POST_GRIP_DISTANCE_SCALE = 0.92
const MOBILE_COUPLED_FINAL_PHASE_SCALE = 0.85 * 0.8
const MOBILE_POST_GRIP_DISTANCE_SCALE = MOBILE_INITIAL_POST_GRIP_DISTANCE_SCALE
  * MOBILE_ADDITIONAL_POST_GRIP_DISTANCE_SCALE
  * MOBILE_COUPLED_FINAL_PHASE_SCALE
const MOBILE_BASE_SHOWCASE_MIN_HEIGHT_SVH = 760
const VIEWPORT_TRIGGER_PADDING_SVH = 100
const MOBILE_SCROLL_SENSITIVITY = 1.06 * 1.2 / 0.9 / 0.85 / 0.75 / 0.8 / 0.8 / 0.75
const MOBILE_BASE_TRIGGER_SPAN_SVH = MOBILE_BASE_SHOWCASE_MIN_HEIGHT_SVH + VIEWPORT_TRIGGER_PADDING_SVH
const MOBILE_TRIGGER_SPAN_SCALE = GRIP_END_RAW_PROGRESS + (1 - GRIP_END_RAW_PROGRESS) * MOBILE_POST_GRIP_DISTANCE_SCALE
const MOBILE_REFERENCE_TRIGGER_SPAN_SVH = MOBILE_BASE_TRIGGER_SPAN_SVH * MOBILE_TRIGGER_SPAN_SCALE / 1.06
const MOBILE_GRIP_END_RAW_PROGRESS = GRIP_END_RAW_PROGRESS / MOBILE_TRIGGER_SPAN_SCALE
const MOBILE_COMPACT_TRIGGER_SPAN_SVH = MOBILE_BASE_TRIGGER_SPAN_SVH * MOBILE_TRIGGER_SPAN_SCALE / MOBILE_SCROLL_SENSITIVITY
const MOBILE_BASE_FINAL_STOP_RAW_PROGRESS = FINAL_TRANSITION_START * MOBILE_GRIP_END_RAW_PROGRESS / GRIP_END_SEQUENCE_PROGRESS
const MOBILE_BURGER_SCROLL_DISTANCE_SCALE = 4
const MOBILE_PRE_FINAL_SCROLL_DISTANCE_SVH = MOBILE_COMPACT_TRIGGER_SPAN_SVH
  * MOBILE_BASE_FINAL_STOP_RAW_PROGRESS
  * MOBILE_BURGER_SCROLL_DISTANCE_SCALE
const MOBILE_FINAL_SCROLL_DISTANCE_SVH = 92
const MOBILE_TRIGGER_SPAN_SVH = MOBILE_PRE_FINAL_SCROLL_DISTANCE_SVH + MOBILE_FINAL_SCROLL_DISTANCE_SVH
const MOBILE_FINAL_STOP_RAW_PROGRESS = MOBILE_PRE_FINAL_SCROLL_DISTANCE_SVH / MOBILE_TRIGGER_SPAN_SVH
export const MOBILE_SHOWCASE_MIN_HEIGHT_SVH = MOBILE_TRIGGER_SPAN_SVH - VIEWPORT_TRIGGER_PADDING_SVH
const DESKTOP_REFERENCE_TRIGGER_SPAN_VH = 820
const BASE_TRAY_DRAG_SENSITIVITY = 5

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

export function getStableBurgerIndex(rotationProgress, currentIndex, burgerCount = 6) {
  const safeCount = Math.max(2, burgerCount)
  const position = Math.min(1, Math.max(0, rotationProgress)) * (safeCount - 1)
  let nextIndex = Math.max(0, Math.min(safeCount - 1, currentIndex))

  while (nextIndex < safeCount - 1 && position >= nextIndex + 0.5 + ACTIVE_INDEX_HYSTERESIS) {
    nextIndex += 1
  }
  while (nextIndex > 0 && position <= nextIndex - 0.5 - ACTIVE_INDEX_HYSTERESIS) {
    nextIndex -= 1
  }

  return nextIndex
}

export function getTraySwipeDirection(deltaX, threshold = TRAY_SWIPE_STEP_THRESHOLD) {
  if (!Number.isFinite(deltaX) || Math.abs(deltaX) < threshold) return 0
  return deltaX < 0 ? 1 : -1
}

export function getTrayDragScrollSensitivity(triggerSpan, viewportHeight, isMobile = false) {
  if (!Number.isFinite(triggerSpan) || triggerSpan <= 0) return 0
  const safeViewportHeight = Number.isFinite(viewportHeight) && viewportHeight > 0 ? viewportHeight : 1
  const referenceSpanVh = isMobile ? MOBILE_REFERENCE_TRIGGER_SPAN_SVH : DESKTOP_REFERENCE_TRIGGER_SPAN_VH
  return BASE_TRAY_DRAG_SENSITIVITY * triggerSpan / (safeViewportHeight * referenceSpanVh / 100)
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

function getBaseSequenceProgress(rawProgress, isMobile = false) {
  const clamped = Math.min(1, Math.max(0, rawProgress))
  const gripEndRawProgress = isMobile ? MOBILE_GRIP_END_RAW_PROGRESS : GRIP_END_RAW_PROGRESS
  if (clamped <= gripEndRawProgress) return clamped * (GRIP_END_SEQUENCE_PROGRESS / gripEndRawProgress)

  const postGripProgress = (clamped - gripEndRawProgress) / (1 - gripEndRawProgress)
  return GRIP_END_SEQUENCE_PROGRESS + postGripProgress * (1 - GRIP_END_SEQUENCE_PROGRESS)
}

function getBaseRawProgressForSequenceProgress(sequenceProgress, isMobile = false) {
  const clamped = Math.min(1, Math.max(0, sequenceProgress))
  const gripEndRawProgress = isMobile ? MOBILE_GRIP_END_RAW_PROGRESS : GRIP_END_RAW_PROGRESS
  if (clamped <= GRIP_END_SEQUENCE_PROGRESS) return clamped * (gripEndRawProgress / GRIP_END_SEQUENCE_PROGRESS)

  const postGripProgress = (clamped - GRIP_END_SEQUENCE_PROGRESS) / (1 - GRIP_END_SEQUENCE_PROGRESS)
  return gripEndRawProgress + postGripProgress * (1 - gripEndRawProgress)
}

// Mobile keeps the compact burger-selection distance, but reserves a separate
// near-viewport scroll distance for the hand and Milas finale.
export function getSequenceProgress(rawProgress, isMobile = false) {
  const clamped = Math.min(1, Math.max(0, rawProgress))
  if (!isMobile) return getBaseSequenceProgress(clamped)

  const baseRawProgress = clamped <= MOBILE_FINAL_STOP_RAW_PROGRESS
    ? clamped * MOBILE_BASE_FINAL_STOP_RAW_PROGRESS / MOBILE_FINAL_STOP_RAW_PROGRESS
    : MOBILE_BASE_FINAL_STOP_RAW_PROGRESS
      + (clamped - MOBILE_FINAL_STOP_RAW_PROGRESS)
        * (1 - MOBILE_BASE_FINAL_STOP_RAW_PROGRESS)
        / (1 - MOBILE_FINAL_STOP_RAW_PROGRESS)
  return getBaseSequenceProgress(baseRawProgress, true)
}

export function getRawProgressForSequenceProgress(sequenceProgress, isMobile = false) {
  const clamped = Math.min(1, Math.max(0, sequenceProgress))
  const baseRawProgress = getBaseRawProgressForSequenceProgress(clamped, isMobile)
  if (!isMobile) return baseRawProgress

  return baseRawProgress <= MOBILE_BASE_FINAL_STOP_RAW_PROGRESS
    ? baseRawProgress * MOBILE_FINAL_STOP_RAW_PROGRESS / MOBILE_BASE_FINAL_STOP_RAW_PROGRESS
    : MOBILE_FINAL_STOP_RAW_PROGRESS
      + (baseRawProgress - MOBILE_BASE_FINAL_STOP_RAW_PROGRESS)
        * (1 - MOBILE_FINAL_STOP_RAW_PROGRESS)
        / (1 - MOBILE_BASE_FINAL_STOP_RAW_PROGRESS)
}
