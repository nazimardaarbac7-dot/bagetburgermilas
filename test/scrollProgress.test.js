import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getHandLiftProgress,
  getRawProgressForSequenceProgress,
  getSequenceProgress,
  getTrayProgressForBurger,
  getTrayRotationProgress,
} from '../src/utils/scrollProgress.js'

test('el, burgere temasın hemen ardından kaydırmaya tepki verir', () => {
  const contactProgress = 0.323 * 0.6
  assert.equal(getHandLiftProgress(contactProgress), 0)
  assert.ok(getHandLiftProgress(contactProgress + 0.0001) > 0)
})

test('ham ve sahne ilerlemesi birbirinin tersidir', () => {
  for (let step = 0; step <= 100; step += 1) {
    const raw = step / 100
    const roundTrip = getRawProgressForSequenceProgress(getSequenceProgress(raw))
    assert.ok(Math.abs(roundTrip - raw) < 1e-10)
  }
})

test('burger durakları tepsi dönüşüyle aynı indekse karşılık gelir', () => {
  for (const isMobile of [false, true]) {
    for (let index = 0; index < 6; index += 1) {
      const progress = getTrayProgressForBurger(index, 6, isMobile)
      assert.ok(Math.abs(getTrayRotationProgress(progress, isMobile) - index / 5) < 1e-10)
    }
  }
})

test('ilerleme fonksiyonları güvenli aralıkta kalır', () => {
  assert.equal(getSequenceProgress(-1), 0)
  assert.equal(getSequenceProgress(2), 1)
  assert.equal(getHandLiftProgress(-1), 0)
  assert.equal(getHandLiftProgress(2), 1)
})
