import assert from 'node:assert/strict'
import test from 'node:test'
import {
  FINAL_TRANSITION_START,
  GRIP_END_SEQUENCE_PROGRESS,
  MOBILE_SHOWCASE_MIN_HEIGHT_SVH,
  TRAY_ROTATION_END,
  getFinalTransitionProgress,
  getHandLiftProgress,
  getRawProgressForSequenceProgress,
  getSequenceProgress,
  getStableBurgerIndex,
  getTrayProgressForBurger,
  getTrayRotationProgress,
  getTraySwipeDirection,
} from '../src/utils/scrollProgress.js'

test('el geçişi son burger durağında boşluk bırakmadan başlar', () => {
  assert.equal(FINAL_TRANSITION_START, TRAY_ROTATION_END)
  assert.equal(getFinalTransitionProgress(TRAY_ROTATION_END), 0)
  assert.ok(getFinalTransitionProgress(FINAL_TRANSITION_START + 0.0001) > 0)
})

test('el, burgere temasın hemen ardından kaydırmaya tepki verir', () => {
  const contactProgress = 0.323 * 0.6
  assert.equal(getHandLiftProgress(contactProgress), 0)
  assert.ok(getHandLiftProgress(contactProgress + 0.0001) > 0)
})

test('ham ve sahne ilerlemesi birbirinin tersidir', () => {
  for (const isMobile of [false, true]) {
    for (let step = 0; step <= 100; step += 1) {
      const raw = step / 100
      const roundTrip = getRawProgressForSequenceProgress(getSequenceProgress(raw, isMobile), isMobile)
      assert.ok(Math.abs(roundTrip - raw) < 1e-10)
    }
  }
})

test('mobil akış kısaltılmış mesafeyi korur ve el ile Milas ortak finali kısa kalır', () => {
  const previousMobileTriggerSpan = 760 + 100
  const mobileTriggerSpan = MOBILE_SHOWCASE_MIN_HEIGHT_SVH + 100
  const sensitivity = 1.06 * 1.2 / 0.9 / 0.85 / 0.75 / 0.8 / 0.8
  const previousGripRaw = getRawProgressForSequenceProgress(GRIP_END_SEQUENCE_PROGRESS)
  const mobileGripRaw = getRawProgressForSequenceProgress(GRIP_END_SEQUENCE_PROGRESS, true)
  const previousPreGripDistance = previousMobileTriggerSpan * previousGripRaw
  const mobilePreGripDistance = mobileTriggerSpan * mobileGripRaw
  const previousPostGripDistance = previousMobileTriggerSpan * (1 - previousGripRaw)
  const mobilePostGripDistance = mobileTriggerSpan * (1 - mobileGripRaw)

  assert.ok(Math.abs(mobilePreGripDistance / previousPreGripDistance - 1 / sensitivity) < 1e-10)
  const previousLivePostGripDistance = previousPostGripDistance * 0.85 * 0.92 * 0.85
  assert.ok(Math.abs(mobilePostGripDistance / previousLivePostGripDistance - 0.8 / sensitivity) < 1e-10)
})

test('burger durakları tepsi dönüşüyle aynı indekse karşılık gelir', () => {
  for (const isMobile of [false, true]) {
    for (let index = 0; index < 6; index += 1) {
      const progress = getTrayProgressForBurger(index, 6, isMobile)
      assert.ok(Math.abs(getTrayRotationProgress(progress, isMobile) - index / 5) < 1e-10)
    }
  }
})

test('aktif burger merkez eşiği geçildiğinde anında ve kararlı biçimde güncellenir', () => {
  assert.equal(getStableBurgerIndex(0.11, 0, 6), 0)
  assert.equal(getStableBurgerIndex(0.12, 0, 6), 1)
  assert.equal(getStableBurgerIndex(0.29, 1, 6), 1)
  assert.equal(getStableBurgerIndex(0.32, 1, 6), 2)
  assert.equal(getStableBurgerIndex(1, 4, 6), 5)
})

test('ilerleme fonksiyonları güvenli aralıkta kalır', () => {
  assert.equal(getSequenceProgress(-1), 0)
  assert.equal(getSequenceProgress(2), 1)
  assert.equal(getHandLiftProgress(-1), 0)
  assert.equal(getHandLiftProgress(2), 1)
})

test('short intentional tray swipe advances one burger in its direction', () => {
  assert.equal(getTraySwipeDirection(-28), 1)
  assert.equal(getTraySwipeDirection(28), -1)
  assert.equal(getTraySwipeDirection(-27), 0)
  assert.equal(getTraySwipeDirection(27), 0)
  assert.equal(getTraySwipeDirection(null), 0)
})
