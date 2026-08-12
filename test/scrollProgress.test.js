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
  getTrayDragScrollSensitivity,
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

test('mobil burger mesafesi kısa kalırken Milas finaline ayrı kaydırma alanı ayrılır', () => {
  const mobileTriggerSpan = MOBILE_SHOWCASE_MIN_HEIGHT_SVH + 100
  const finalStopRaw = getRawProgressForSequenceProgress(FINAL_TRANSITION_START, true)
  const burgerDistance = mobileTriggerSpan * finalStopRaw
  const finalDistance = mobileTriggerSpan * (1 - finalStopRaw)

  assert.ok(burgerDistance > 175)
  assert.ok(Math.abs(finalDistance - 92) < 1e-10)
  assert.ok(MOBILE_SHOWCASE_MIN_HEIGHT_SVH > 100)
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
  assert.equal(getTraySwipeDirection(-20), 1)
  assert.equal(getTraySwipeDirection(20), -1)
  assert.equal(getTraySwipeDirection(-19), 0)
  assert.equal(getTraySwipeDirection(19), 0)
  assert.equal(getTraySwipeDirection(null), 0)
})

test('analog yatay tepsi hassasiyeti dikey scroll uzunluğundan bağımsızdır', () => {
  const viewportHeight = 800
  const longSpan = viewportHeight * 8.2
  const shortSpan = longSpan * 0.25
  const longSensitivity = getTrayDragScrollSensitivity(longSpan, viewportHeight)
  const shortSensitivity = getTrayDragScrollSensitivity(shortSpan, viewportHeight)

  assert.ok(Math.abs(longSensitivity - 5) < 1e-12)
  assert.ok(Math.abs(shortSensitivity - 1.25) < 1e-12)
  assert.ok(Math.abs(longSensitivity / longSpan - shortSensitivity / shortSpan) < 1e-12)
})
