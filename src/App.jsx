import React, { Component, lazy, Suspense, useCallback, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from './components/Navbar'
import MenuOverlay from './components/MenuOverlay'
import DiscountPopup from './components/DiscountPopup'
import Hero from './sections/Hero'
import BurgerShowcase from './sections/BurgerShowcase'
import MilasSection from './sections/MilasSection'
import { burgers } from './data/burgers'
import { FINAL_TRANSITION_START, getFinalTransitionProgress, getRawProgressForSequenceProgress, getSequenceProgress, getStableBurgerIndex, getTrayProgressForBurger, getTrayRotationProgress, MOBILE_SHOWCASE_MIN_HEIGHT_SVH, MOBILE_TRAY_SETTLE_END, TRAY_SETTLE_END } from './utils/scrollProgress'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

const Experience = lazy(() => import('./three/Experience'))

class ExperienceBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() { return { failed: true } }

  componentDidCatch() { this.props.onError() }

  render() {
    return this.state.failed
      ? <div className="canvas-fallback" aria-hidden="true"><span>BAGET BURGER</span><small>MİLAS</small></div>
      : this.props.children
  }
}

const HERO_TRANSITION_DURATION = 2.35
const HERO_COPY_EXIT_DURATION = 1.16
const TRAY_ENTRY_START = 1.16
const TRAY_ENTRY_DURATION = 1.64
const TRAY_INFO_REVEAL_PROGRESS = 0.72
const TRAY_RETURN_DURATION = 0.82
const HERO_RETURN_START = 0.66
const HERO_RETURN_DURATION = 1.62
const HERO_COPY_RETURN_DURATION = 0.92
const HERO_COPY_RETURN_START = HERO_RETURN_START + HERO_RETURN_DURATION - HERO_COPY_RETURN_DURATION

export default function App() {
  const heroExitProgress = useRef(0)
  const trayEntryProgress = useRef(0)
  const scrollProgress = useRef(0)
  const finalTransitionProgress = useRef(0)
  const trayTriggerRef = useRef(null)
  const traySnapTween = useRef(null)
  const traySettledIndex = useRef(0)
  const adjustTrayProgress = useRef(null)
  const settleTrayProgress = useRef(null)
  const stepTrayProgress = useRef(null)
  const sectionNavigation = useRef(null)
  const heroPhase = useRef('hero')
  const burgerInteraction = useRef({ index: -1, token: 0 })
  const heroRef = useRef(null)
  const activeIndexValue = useRef(0)
  const showcaseReadyValue = useRef(false)
  const showcaseActiveValue = useRef(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [showcaseReady, setShowcaseReady] = useState(false)
  const [showcaseActive, setShowcaseActive] = useState(false)
  const [heroTransitioning, setHeroTransitioning] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [navbarOnYellow, setNavbarOnYellow] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [discountOpen, setDiscountOpen] = useState(true)

  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const handleSceneReady = useCallback(() => setSceneReady(true), [])
  const closeDiscount = useCallback(() => setDiscountOpen(false), [])
  const handleNavigate = useCallback((target) => sectionNavigation.current?.(target), [])

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    let cleanupHeroScroll = () => {}
    let cleanupHeroInput = () => {}
    let heroReturnTween = null
    let traySnapTimer = null
    let trayDisplayTimer = null
    let finalGateTimer = null
    let finalGateClampFrame = null
    const context = gsap.context(() => {
      const mobileScene = window.matchMedia('(max-width: 720px)').matches
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const firstTrayProgress = mobileScene ? MOBILE_TRAY_SETTLE_END : TRAY_SETTLE_END
      const scrollingElement = document.scrollingElement ?? document.documentElement
      let scrollBehaviorLockDepth = 0
      let originalScrollBehavior = scrollingElement.style.scrollBehavior
      let heroScrollLocked = false
      let heroScrollAnchor = 0
      let pendingNavigation = null
      let finalGateReady = false
      let finalGateOpen = false
      let finalGateClamping = false
      let touchActive = false
      let touchStartedAtFinalStop = false

      const lockScrollBehavior = () => {
        if (scrollBehaviorLockDepth === 0) {
          originalScrollBehavior = scrollingElement.style.scrollBehavior
          scrollingElement.style.scrollBehavior = 'auto'
        }
        scrollBehaviorLockDepth += 1
      }

      const unlockScrollBehavior = () => {
        scrollBehaviorLockDepth = Math.max(0, scrollBehaviorLockDepth - 1)
        if (scrollBehaviorLockDepth === 0) {
          scrollingElement.style.scrollBehavior = originalScrollBehavior
        }
      }

      const releaseHeroScroll = () => {
        if (!heroScrollLocked) return
        heroScrollLocked = false
        unlockScrollBehavior()
      }
      cleanupHeroScroll = releaseHeroScroll

      lockScrollBehavior()
      scrollingElement.scrollTop = 0
      unlockScrollBehavior()

      const setShowcaseVisibility = (ready, active) => {
        if (showcaseReadyValue.current !== ready) {
          showcaseReadyValue.current = ready
          setShowcaseReady(ready)
        }
        if (showcaseActiveValue.current !== active) {
          showcaseActiveValue.current = active
          setShowcaseActive(active)
        }
      }

      const setDisplayedBurger = (index) => {
        if (activeIndexValue.current === index) return
        activeIndexValue.current = index
        setActiveIndex(index)
      }

      const jumpToScroll = (targetScroll) => {
        lockScrollBehavior()
        scrollingElement.scrollTop = targetScroll
        ScrollTrigger.update()
        unlockScrollBehavior()
      }

      const clearFinalGateTimer = () => {
        if (finalGateTimer) window.clearTimeout(finalGateTimer)
        finalGateTimer = null
      }

      const isAtFinalStop = () => finalTransitionProgress.current <= 0.001
        && scrollProgress.current >= FINAL_TRANSITION_START - 0.002

      const resetFinalGate = () => {
        clearFinalGateTimer()
        finalGateReady = false
        finalGateOpen = false
        touchStartedAtFinalStop = false
      }

      const scheduleFinalGateReady = () => {
        if (finalGateOpen) return
        clearFinalGateTimer()
        finalGateReady = false
        finalGateTimer = window.setTimeout(() => {
          finalGateTimer = null
          if (!touchActive && isAtFinalStop()) finalGateReady = true
        }, mobileScene ? 90 : 120)
      }

      const holdAtFinalStop = () => {
        const trayTrigger = trayTriggerRef.current
        if (!trayTrigger || finalGateClamping) return
        const targetScroll = trayTrigger.start
          + (trayTrigger.end - trayTrigger.start) * getRawProgressForSequenceProgress(FINAL_TRANSITION_START, mobileScene)
        if (Math.abs(scrollingElement.scrollTop - targetScroll) < 0.5) return
        finalGateClamping = true
        jumpToScroll(targetScroll)
        finalGateClamping = false
      }

      const openFinalGate = () => {
        clearFinalGateTimer()
        finalGateReady = false
        finalGateOpen = true
      }

      const heroMotion = { progress: 0 }
      const trayEntryMotion = { progress: 0 }
      const heroTimeline = gsap.timeline({
        paused: true,
        onUpdate: () => {
          if (heroScrollLocked) scrollingElement.scrollTop = heroScrollAnchor
          heroExitProgress.current = heroMotion.progress
          trayEntryProgress.current = trayEntryMotion.progress
          const trayVisible = trayEntryMotion.progress > 0.001
          const infoVisible = trayEntryMotion.progress >= TRAY_INFO_REVEAL_PROGRESS
          setShowcaseVisibility(infoVisible, trayVisible)
        },
        onComplete: () => {
          heroPhase.current = 'tray'
          setHeroTransitioning(false)
          setShowcaseVisibility(true, true)
          traySettledIndex.current = 0
          finalTransitionProgress.current = 0
          resetFinalGate()
          trayEntryProgress.current = 1
          setDisplayedBurger(0)
          scrollProgress.current = firstTrayProgress

          const trayTrigger = trayTriggerRef.current
          if (trayTrigger) {
            jumpToScroll(trayTrigger.start + (trayTrigger.end - trayTrigger.start) * getRawProgressForSequenceProgress(firstTrayProgress, mobileScene))
          }
          releaseHeroScroll()
          if (pendingNavigation === 'milas') {
            pendingNavigation = null
            const milasSection = document.getElementById('milas')
            if (milasSection) jumpToScroll(milasSection.offsetTop + 1)
          }
        },
        onReverseComplete: () => {
          heroPhase.current = 'hero'
          setHeroTransitioning(false)
          setShowcaseVisibility(false, false)
          traySettledIndex.current = 0
          finalTransitionProgress.current = 0
          resetFinalGate()
          trayEntryProgress.current = 0
          setDisplayedBurger(0)
          scrollProgress.current = 0
          jumpToScroll(0)
          releaseHeroScroll()
        },
      })

      heroTimeline.to(heroMotion, {
        progress: 1,
        duration: HERO_TRANSITION_DURATION,
        ease: 'power2.inOut',
      }, 0)

      heroTimeline.to(trayEntryMotion, {
        progress: 1,
        duration: TRAY_ENTRY_DURATION,
        ease: 'sine.inOut',
      }, TRAY_ENTRY_START)

      heroTimeline.to('.hero-copy', {
        scale: 1.06,
        opacity: 0,
        yPercent: -7,
        force3D: true,
        duration: HERO_COPY_EXIT_DURATION,
        ease: 'power2.inOut',
      }, 0)

      heroTimeline.to('.scroll-cue', {
        autoAlpha: 0,
        y: -12,
        duration: 0.46,
        ease: 'power2.out',
      }, 0)
      if (reduceMotion) heroTimeline.timeScale(100)

      const mobileTray = mobileScene
      let trayPointerDragging = false

      const cancelTraySnap = () => {
        if (traySnapTimer) window.clearTimeout(traySnapTimer)
        traySnapTimer = null
        if (trayDisplayTimer) window.clearTimeout(trayDisplayTimer)
        trayDisplayTimer = null
        traySnapTween.current?.kill()
        traySnapTween.current = null
      }

      const snapTrayToIndex = (requestedIndex) => {
        if (heroPhase.current !== 'tray' || finalTransitionProgress.current > 0.001) return
        const trayTrigger = trayTriggerRef.current
        if (!trayTrigger) return
        const targetIndex = Math.max(0, Math.min(burgers.length - 1, requestedIndex))
        const targetProgress = getTrayProgressForBurger(targetIndex, burgers.length, mobileTray)
        const targetScroll = trayTrigger.start + (trayTrigger.end - trayTrigger.start) * getRawProgressForSequenceProgress(targetProgress, mobileTray)
        const distance = Math.abs(targetScroll - scrollingElement.scrollTop)
        const finishSnap = () => {
          trayDisplayTimer = null
          traySettledIndex.current = targetIndex
          setDisplayedBurger(targetIndex)
        }

        if (distance < 1) {
          if (activeIndexValue.current !== targetIndex) {
            if (trayDisplayTimer) window.clearTimeout(trayDisplayTimer)
            trayDisplayTimer = window.setTimeout(finishSnap, mobileTray ? 90 : 70)
          } else {
            finishSnap()
          }
          return
        }

        const snapMotion = { scroll: scrollingElement.scrollTop }
        traySnapTween.current = gsap.to(snapMotion, {
          scroll: targetScroll,
          duration: reduceMotion
            ? 0.01
            : mobileTray
              ? Math.min(0.22, Math.max(0.12, distance / window.innerHeight * 0.15))
              : Math.min(0.24, Math.max(0.13, distance / window.innerHeight * 0.17)),
          ease: 'power3.out',
          onUpdate: () => {
            scrollingElement.scrollTop = snapMotion.scroll
            ScrollTrigger.update()
          },
          onComplete: () => {
            traySnapTween.current = null
            trayDisplayTimer = window.setTimeout(finishSnap, mobileTray ? 40 : 55)
          },
        })
      }

      const snapTrayToNearest = () => {
        const rotationProgress = getTrayRotationProgress(scrollProgress.current, mobileTray)
        snapTrayToIndex(Math.round(rotationProgress * (burgers.length - 1)))
      }

      const scheduleTraySnap = () => {
        if (trayPointerDragging || traySnapTween.current || finalTransitionProgress.current > 0.001) return
        if (scrollProgress.current >= FINAL_TRANSITION_START - 0.002) {
          if (traySnapTimer) window.clearTimeout(traySnapTimer)
          traySnapTimer = null
          return
        }
        if (traySnapTimer) {
          window.clearTimeout(traySnapTimer)
        }
        traySnapTimer = window.setTimeout(() => {
          traySnapTimer = null
          snapTrayToNearest()
        }, mobileScene ? 70 : 90)
      }

      adjustTrayProgress.current = (movementX) => {
        if (heroPhase.current !== 'tray' || finalTransitionProgress.current > 0.001) return false
        cancelTraySnap()
        trayPointerDragging = true
        const trayTrigger = trayTriggerRef.current
        if (!trayTrigger) return false
        const minScroll = trayTrigger.start + (trayTrigger.end - trayTrigger.start) * getRawProgressForSequenceProgress(firstTrayProgress, mobileTray)
        const maxScroll = trayTrigger.start + (trayTrigger.end - trayTrigger.start) * getRawProgressForSequenceProgress(FINAL_TRANSITION_START, mobileTray)
        const dragSensitivity = mobileTray ? 4.4 : 5
        const targetScroll = Math.max(minScroll, Math.min(maxScroll, scrollingElement.scrollTop - movementX * dragSensitivity))
        jumpToScroll(targetScroll)
        return true
      }

      settleTrayProgress.current = () => {
        trayPointerDragging = false
        snapTrayToNearest()
      }
      stepTrayProgress.current = (direction) => {
        cancelTraySnap()
        snapTrayToIndex(activeIndexValue.current + direction)
      }

      trayTriggerRef.current = ScrollTrigger.create({
        trigger: '#tray',
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          if (heroPhase.current !== 'tray') return

          let sequenceProgress = getSequenceProgress(self.progress, mobileTray)
          let returnedToFinalStop = false
          if (!finalGateOpen && sequenceProgress > FINAL_TRANSITION_START) {
            sequenceProgress = FINAL_TRANSITION_START
            scheduleFinalGateReady()
            if (!finalGateClampFrame) {
              finalGateClampFrame = window.requestAnimationFrame(() => {
                finalGateClampFrame = null
                holdAtFinalStop()
              })
            }
          } else if (finalGateOpen && self.direction < 0 && sequenceProgress <= FINAL_TRANSITION_START + 0.001) {
            resetFinalGate()
            returnedToFinalStop = true
          } else if (sequenceProgress < FINAL_TRANSITION_START - 0.015 && (finalGateOpen || finalGateReady)) {
            resetFinalGate()
          }
          scrollProgress.current = sequenceProgress
          const finalProgress = getFinalTransitionProgress(sequenceProgress)
          finalTransitionProgress.current = finalProgress
          if (returnedToFinalStop) scheduleFinalGateReady()
          const rotationProgress = getTrayRotationProgress(sequenceProgress, mobileTray)
          const nextIndex = finalProgress > 0
            ? burgers.length - 1
            : getStableBurgerIndex(rotationProgress, activeIndexValue.current, burgers.length)
          const trayMenuActive = finalProgress <= 0.001 && sequenceProgress >= firstTrayProgress - 0.002
          setDisplayedBurger(nextIndex)
          if (finalProgress > 0) {
            traySettledIndex.current = nextIndex
          }
          setShowcaseVisibility(trayMenuActive, finalProgress < 0.995)

          if (finalProgress > 0) {
            clearFinalGateTimer()
            if (traySnapTimer) window.clearTimeout(traySnapTimer)
            traySnapTimer = null
          } else if (sequenceProgress >= FINAL_TRANSITION_START - 0.002) {
            if (traySnapTimer) window.clearTimeout(traySnapTimer)
            traySnapTimer = null
            if (traySettledIndex.current !== burgers.length - 1 && !traySnapTween.current && !trayDisplayTimer) {
              snapTrayToIndex(burgers.length - 1)
            }
          } else if (!traySnapTween.current) {
            scheduleTraySnap()
          }
        },
      })

      const beginHeroTransition = (forward) => {
        if (heroPhase.current === 'transition') return
        heroPhase.current = 'transition'
        cancelTraySnap()
        finalTransitionProgress.current = 0
        heroScrollAnchor = forward ? 0 : window.scrollY
        if (forward && scrollingElement.scrollTop !== 0) scrollingElement.scrollTop = 0
        if (!heroScrollLocked) {
          heroScrollLocked = true
          lockScrollBehavior()
        }
        setHeroTransitioning(true)

        if (forward) {
          heroTimeline.play()
          return
        }

        setShowcaseVisibility(false, true)
        scrollProgress.current = 0
        heroReturnTween?.kill()
        heroReturnTween = gsap.timeline({
          onUpdate: () => {
            if (heroScrollLocked) scrollingElement.scrollTop = heroScrollAnchor
            heroExitProgress.current = heroMotion.progress
            trayEntryProgress.current = trayEntryMotion.progress
          },
          onComplete: () => {
            heroReturnTween = null
            heroTimeline.pause(0)
            heroPhase.current = 'hero'
            setHeroTransitioning(false)
            setShowcaseVisibility(false, false)
            traySettledIndex.current = 0
            finalTransitionProgress.current = 0
            trayEntryProgress.current = 0
            heroExitProgress.current = 0
            setDisplayedBurger(0)
            scrollProgress.current = 0
            jumpToScroll(0)
            releaseHeroScroll()
          },
        })
        if (reduceMotion) heroReturnTween.timeScale(100)

        heroReturnTween.to(trayEntryMotion, {
          progress: 0,
          duration: TRAY_RETURN_DURATION,
          ease: 'sine.inOut',
        }, 0)

        heroReturnTween.call(() => setShowcaseVisibility(false, false), [], TRAY_RETURN_DURATION)

        heroReturnTween.to(heroMotion, {
          progress: 0,
          duration: HERO_RETURN_DURATION,
          ease: 'power2.inOut',
        }, HERO_RETURN_START)

        heroReturnTween.to('.hero-copy', {
          scale: 1,
          opacity: 1,
          yPercent: 0,
          force3D: true,
          duration: HERO_COPY_RETURN_DURATION,
          ease: 'power2.inOut',
        }, HERO_COPY_RETURN_START)

        heroReturnTween.to('.scroll-cue', {
          autoAlpha: 1,
          y: 0,
          duration: 0.38,
          ease: 'power2.out',
        }, HERO_RETURN_START + HERO_RETURN_DURATION - 0.38)
      }

      sectionNavigation.current = (target) => {
        if (target === 'milas') {
          window.history.replaceState(null, '', '#milas')
          if (heroPhase.current === 'hero') {
            pendingNavigation = 'milas'
            beginHeroTransition(true)
          } else if (heroPhase.current === 'tray') {
            const milasSection = document.getElementById('milas')
            if (milasSection) jumpToScroll(milasSection.offsetTop + 1)
          }
          return
        }
        window.history.replaceState(null, '', '#top')
        pendingNavigation = null
        if (heroPhase.current === 'tray') beginHeroTransition(false)
        else if (heroPhase.current === 'hero') jumpToScroll(0)
      }

      const canReturnToHero = () => heroPhase.current === 'tray'
        && traySettledIndex.current === 0
        && !traySnapTween.current
        && finalTransitionProgress.current <= 0.001
        && Math.abs(scrollProgress.current - firstTrayProgress) < 0.002

      let heroTouchStartY = null
      const preventHeroMomentum = (event) => {
        if (heroPhase.current !== 'transition' || !heroScrollLocked) return false
        if (event.cancelable) event.preventDefault()
        return true
      }
      const handleHeroWheel = (event) => {
        if (document.querySelector('.discount-popup, .menu-overlay.is-open')) return
        if (preventHeroMomentum(event)) return
        if (heroPhase.current === 'tray' && (traySnapTween.current || trayDisplayTimer)) cancelTraySnap()
        if (heroPhase.current === 'tray' && event.deltaY > 0 && isAtFinalStop() && !finalGateOpen) {
          if (finalGateReady) {
            openFinalGate()
            return
          }
          if (event.cancelable) event.preventDefault()
          holdAtFinalStop()
          scheduleFinalGateReady()
          return
        }
        if (heroPhase.current === 'hero' && event.deltaY > 0) {
          if (event.cancelable) event.preventDefault()
          beginHeroTransition(true)
          return
        }
        if (event.deltaY < 0 && canReturnToHero()) {
          if (event.cancelable) event.preventDefault()
          beginHeroTransition(false)
        }
      }
      const handleHeroTouchStart = (event) => {
        touchActive = event.touches.length === 1
        heroTouchStartY = event.touches.length === 1 ? event.touches[0].clientY : null
        touchStartedAtFinalStop = touchActive && isAtFinalStop()
        if (touchStartedAtFinalStop) clearFinalGateTimer()
      }
      const handleHeroTouchMove = (event) => {
        if (document.querySelector('.discount-popup, .menu-overlay.is-open')) return
        if (preventHeroMomentum(event)) return
        if (heroTouchStartY === null || event.touches.length !== 1) return
        const verticalDistance = heroTouchStartY - event.touches[0].clientY
        if (heroPhase.current === 'tray' && verticalDistance >= 4 && !finalGateOpen) {
          if (touchStartedAtFinalStop) {
            openFinalGate()
            return
          }
          if (isAtFinalStop()) {
            if (event.cancelable) event.preventDefault()
            holdAtFinalStop()
            return
          }
        }
        if (heroPhase.current === 'hero' && verticalDistance >= 4) {
          if (event.cancelable) event.preventDefault()
          beginHeroTransition(true)
          return
        }
        if (verticalDistance <= -4 && canReturnToHero()) {
          if (event.cancelable) event.preventDefault()
          beginHeroTransition(false)
        }
      }
      const clearHeroTouch = () => {
        touchActive = false
        touchStartedAtFinalStop = false
        heroTouchStartY = null
        if (isAtFinalStop() && !finalGateOpen) {
          scheduleFinalGateReady()
        } else if (heroPhase.current === 'tray' && finalTransitionProgress.current <= 0.001) {
          cancelTraySnap()
          window.requestAnimationFrame(snapTrayToNearest)
        }
      }

      window.addEventListener('wheel', handleHeroWheel, { passive: false, capture: true })
      window.addEventListener('touchstart', handleHeroTouchStart, { passive: true, capture: true })
      window.addEventListener('touchmove', handleHeroTouchMove, { passive: false, capture: true })
      window.addEventListener('touchend', clearHeroTouch, { passive: true, capture: true })
      window.addEventListener('touchcancel', clearHeroTouch, { passive: true, capture: true })
      cleanupHeroInput = () => {
        window.removeEventListener('wheel', handleHeroWheel, true)
        window.removeEventListener('touchstart', handleHeroTouchStart, true)
        window.removeEventListener('touchmove', handleHeroTouchMove, true)
        window.removeEventListener('touchend', clearHeroTouch, true)
        window.removeEventListener('touchcancel', clearHeroTouch, true)
      }

      ScrollTrigger.create({
        trigger: '#top',
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          if (self.direction > 0 && self.progress > 0 && heroPhase.current === 'hero') {
            beginHeroTransition(true)
          }
        },
        onEnterBack: () => {
          if (heroPhase.current === 'tray') beginHeroTransition(false)
        },
      })

      ScrollTrigger.create({
        trigger: '#milas',
        start: 'top 20px',
        end: 'bottom top',
        onToggle: (self) => setNavbarOnYellow(self.isActive && heroPhase.current === 'tray'),
      })

      const reviewCards = gsap.utils.toArray('.review-card')
      gsap.fromTo(reviewCards, {
        autoAlpha: 0,
        y: 72,
        rotation: (index, element) => Number(element.dataset.rotation) - 7,
      }, {
        autoAlpha: 1,
        y: 0,
        rotation: (index, element) => Number(element.dataset.rotation),
        duration: reduceMotion ? 0.01 : 1.584,
        stagger: reduceMotion ? 0 : 0.308,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#milas',
          start: 'top 70%',
          toggleActions: 'restart none restart reverse',
        },
      })

      media.add('(prefers-reduced-motion: no-preference)', () => {
        const burgerImpactTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: '.milas-copy',
            start: 'top 82%',
            toggleActions: 'restart none restart reverse',
          },
        })

        burgerImpactTimeline
          .set('.bitten-burger', { autoAlpha: 1 }, .34)
          .fromTo('.bitten-burger', {
            xPercent: 110,
            yPercent: -38,
            scale: 1.45,
            rotation: 24,
          }, {
            xPercent: -4,
            yPercent: 2,
            scale: .93,
            rotation: -11,
            duration: .34,
            ease: 'power4.in',
          }, .34)

        burgerImpactTimeline
          .to('.milas-copy h2', { x: -10, duration: .055, ease: 'none' }, .68)
          .to('.milas-copy h2', { x: 7, duration: .055, ease: 'none' }, .735)
          .to('.milas-copy h2', { x: -3, duration: .055, ease: 'none' }, .79)
          .to('.milas-copy h2', { x: 0, duration: .09, ease: 'power2.out' }, .845)
          .to('.bitten-burger', {
            xPercent: 0,
            yPercent: 0,
            scale: 1.07,
            rotation: -5,
            duration: .12,
            ease: 'power2.out',
          }, .68)
          .to('.bitten-burger', {
            scale: 1,
            rotation: -7,
            duration: .34,
            ease: 'elastic.out(1, .45)',
          }, .8)
      })

      media.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('.bitten-burger', { autoAlpha: 1, xPercent: 0, yPercent: 0, scale: 1, rotation: -7 })
      })

      media.add('(max-width: 720px)', () => {
        gsap.fromTo('.milas-copy', {
          autoAlpha: 0,
          y: 64,
        }, {
          autoAlpha: 1,
          y: 0,
          duration: reduceMotion ? 0.01 : 1.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.milas-copy',
            start: 'top 82%',
            toggleActions: 'restart none restart reverse',
          },
        })
      })
    })
    return () => {
      if (traySnapTimer) window.clearTimeout(traySnapTimer)
      if (trayDisplayTimer) window.clearTimeout(trayDisplayTimer)
      if (finalGateTimer) window.clearTimeout(finalGateTimer)
      if (finalGateClampFrame) window.cancelAnimationFrame(finalGateClampFrame)
      traySnapTween.current?.kill()
      traySnapTween.current = null
      heroReturnTween?.kill()
      heroReturnTween = null
      cleanupHeroInput()
      cleanupHeroScroll()
      adjustTrayProgress.current = null
      settleTrayProgress.current = null
      stepTrayProgress.current = null
      sectionNavigation.current = null
      trayTriggerRef.current = null
      media.revert()
      context.revert()
    }
  }, [])

  const handleTrayDrag = (movementX) => adjustTrayProgress.current?.(movementX) === true
  const handleTrayDragEnd = () => settleTrayProgress.current?.()
  const handleTrayStep = (direction) => stepTrayProgress.current?.(direction)

  const handleBurgerTap = () => {
    burgerInteraction.current = { index: activeIndex, token: burgerInteraction.current.token + 1 }
  }

  return (
    <main className={heroTransitioning ? 'is-hero-transitioning' : undefined}>
      <button className="skip-link" type="button" onClick={openMenu}>Doğrudan menüye geç</button>
      <ExperienceBoundary onError={handleSceneReady}>
        <Suspense fallback={null}>
          <Experience heroExitProgress={heroExitProgress} trayEntryProgress={trayEntryProgress} scrollProgress={scrollProgress} finalTransitionProgress={finalTransitionProgress} activeIndex={activeIndex} burgerInteraction={burgerInteraction} onReady={handleSceneReady} paused={menuOpen || discountOpen} />
        </Suspense>
      </ExperienceBoundary>
      <div className={`scene-curtain${sceneReady ? ' is-hidden' : ''}`} aria-hidden="true"><span>BAGET BURGER</span><i /></div>
      <div className="grain" />
      <Navbar hiddenOnShowcase={showcaseActive} onYellow={navbarOnYellow} onOpenMenu={openMenu} onNavigate={handleNavigate} />
      <Hero ref={heroRef} />
      <BurgerShowcase burger={burgers[activeIndex]} activeIndex={activeIndex} isReady={showcaseReady} isActive={showcaseActive} isInteractive={showcaseReady && showcaseActive && !heroTransitioning && !menuOpen && !discountOpen} mobileMinHeight={`${MOBILE_SHOWCASE_MIN_HEIGHT_SVH}svh`} onTrayDrag={handleTrayDrag} onTrayDragEnd={handleTrayDragEnd} onBurgerTap={handleBurgerTap} onTrayStep={handleTrayStep} />
      <MilasSection onOpenMenu={openMenu} />
      <MenuOverlay open={menuOpen} onClose={closeMenu} />
      <DiscountPopup open={discountOpen} onClose={closeDiscount} />
    </main>
  )
}
