import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from './components/Navbar'
import MenuOverlay from './components/MenuOverlay'
import DiscountPopup from './components/DiscountPopup'
import Hero from './sections/Hero'
import BurgerShowcase from './sections/BurgerShowcase'
import MilasSection from './sections/MilasSection'
import Experience from './three/Experience'
import { burgers } from './data/burgers'
import { FINAL_TRANSITION_START, getFinalTransitionProgress, getRawProgressForSequenceProgress, getSequenceProgress, getTrayProgressForBurger, getTrayRotationProgress, MOBILE_TRAY_SETTLE_END, TRAY_SETTLE_END } from './utils/scrollProgress'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

const ACTIVE_INDEX_HYSTERESIS = 0.08
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

function getStableBurgerIndex(rotationProgress, currentIndex) {
  const position = rotationProgress * (burgers.length - 1)
  let nextIndex = currentIndex

  while (nextIndex < burgers.length - 1 && position >= nextIndex + 0.5 + ACTIVE_INDEX_HYSTERESIS) {
    nextIndex += 1
  }
  while (nextIndex > 0 && position <= nextIndex - 0.5 - ACTIVE_INDEX_HYSTERESIS) {
    nextIndex -= 1
  }

  return nextIndex
}

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

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    let cleanupHeroScroll = () => {}
    let cleanupHeroInput = () => {}
    let heroReturnTween = null
    let traySnapTimer = null
    const context = gsap.context(() => {
      const mobileScene = window.matchMedia('(max-width: 720px)').matches
      const firstTrayProgress = mobileScene ? MOBILE_TRAY_SETTLE_END : TRAY_SETTLE_END
      const scrollingElement = document.scrollingElement ?? document.documentElement
      let scrollBehaviorLockDepth = 0
      let originalScrollBehavior = scrollingElement.style.scrollBehavior
      let heroScrollLocked = false
      let heroScrollAnchor = 0

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
          trayEntryProgress.current = 1
          setDisplayedBurger(0)
          scrollProgress.current = firstTrayProgress

          const trayTrigger = trayTriggerRef.current
          if (trayTrigger) {
            jumpToScroll(trayTrigger.start + (trayTrigger.end - trayTrigger.start) * getRawProgressForSequenceProgress(firstTrayProgress))
          }
          releaseHeroScroll()
        },
        onReverseComplete: () => {
          heroPhase.current = 'hero'
          setHeroTransitioning(false)
          setShowcaseVisibility(false, false)
          traySettledIndex.current = 0
          finalTransitionProgress.current = 0
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

      const mobileTray = mobileScene
      let trayPointerDragging = false

      const cancelTraySnap = () => {
        if (traySnapTimer) window.clearTimeout(traySnapTimer)
        traySnapTimer = null
        traySnapTween.current?.kill()
        traySnapTween.current = null
      }

      const snapTrayToNearest = () => {
        if (heroPhase.current !== 'tray' || finalTransitionProgress.current > 0.001) return
        const trayTrigger = trayTriggerRef.current
        if (!trayTrigger) return

        const rotationProgress = getTrayRotationProgress(scrollProgress.current, mobileTray)
        const targetIndex = Math.round(rotationProgress * (burgers.length - 1))
        const targetProgress = getTrayProgressForBurger(targetIndex, burgers.length, mobileTray)
        const targetScroll = trayTrigger.start + (trayTrigger.end - trayTrigger.start) * getRawProgressForSequenceProgress(targetProgress)
        const distance = Math.abs(targetScroll - scrollingElement.scrollTop)

        if (distance < 1) {
          traySettledIndex.current = targetIndex
          setDisplayedBurger(targetIndex)
          return
        }

        const snapMotion = { scroll: scrollingElement.scrollTop }
        traySnapTween.current = gsap.to(snapMotion, {
          scroll: targetScroll,
          duration: Math.min(0.52, Math.max(0.28, distance / window.innerHeight * 0.34)),
          ease: 'power2.out',
          onUpdate: () => {
            scrollingElement.scrollTop = snapMotion.scroll
            ScrollTrigger.update()
          },
          onComplete: () => {
            traySnapTween.current = null
            traySettledIndex.current = targetIndex
            setDisplayedBurger(targetIndex)
          },
        })
      }

      const scheduleTraySnap = () => {
        if (trayPointerDragging || traySnapTween.current || finalTransitionProgress.current > 0.001) return
        if (traySnapTimer) window.clearTimeout(traySnapTimer)
        traySnapTimer = window.setTimeout(() => {
          traySnapTimer = null
          snapTrayToNearest()
        }, 150)
      }

      adjustTrayProgress.current = (movementX) => {
        if (heroPhase.current !== 'tray' || finalTransitionProgress.current > 0.001) return false
        cancelTraySnap()
        trayPointerDragging = true
        const trayTrigger = trayTriggerRef.current
        if (!trayTrigger) return false
        const minScroll = trayTrigger.start + (trayTrigger.end - trayTrigger.start) * getRawProgressForSequenceProgress(firstTrayProgress)
        const maxScroll = trayTrigger.start + (trayTrigger.end - trayTrigger.start) * getRawProgressForSequenceProgress(FINAL_TRANSITION_START)
        const targetScroll = Math.max(minScroll, Math.min(maxScroll, scrollingElement.scrollTop - movementX * 3.15))
        jumpToScroll(targetScroll)
        return true
      }

      settleTrayProgress.current = () => {
        trayPointerDragging = false
        snapTrayToNearest()
      }

      trayTriggerRef.current = ScrollTrigger.create({
        trigger: '#tray',
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          if (heroPhase.current !== 'tray') return

          const sequenceProgress = getSequenceProgress(self.progress)
          scrollProgress.current = sequenceProgress
          const finalProgress = getFinalTransitionProgress(sequenceProgress)
          finalTransitionProgress.current = finalProgress
          const rotationProgress = getTrayRotationProgress(sequenceProgress, mobileTray)
          const nextIndex = finalProgress > 0
            ? burgers.length - 1
            : getStableBurgerIndex(rotationProgress, activeIndexValue.current)
          const trayMenuActive = finalProgress <= 0.001 && sequenceProgress >= firstTrayProgress - 0.002
          traySettledIndex.current = nextIndex
          setDisplayedBurger(nextIndex)
          setShowcaseVisibility(trayMenuActive, finalProgress < 0.995)

          if (finalProgress > 0) {
            if (traySnapTimer) window.clearTimeout(traySnapTimer)
            traySnapTimer = null
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
        if (preventHeroMomentum(event)) return
        if (heroPhase.current === 'tray' && traySnapTween.current) cancelTraySnap()
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
        heroTouchStartY = event.touches.length === 1 ? event.touches[0].clientY : null
      }
      const handleHeroTouchMove = (event) => {
        if (preventHeroMomentum(event)) return
        if (heroTouchStartY === null || event.touches.length !== 1) return
        const verticalDistance = heroTouchStartY - event.touches[0].clientY
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
        heroTouchStartY = null
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
        duration: 1.584,
        stagger: 0.308,
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
          duration: 1.15,
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
      traySnapTween.current?.kill()
      traySnapTween.current = null
      heroReturnTween?.kill()
      heroReturnTween = null
      cleanupHeroInput()
      cleanupHeroScroll()
      adjustTrayProgress.current = null
      settleTrayProgress.current = null
      trayTriggerRef.current = null
      media.revert()
      context.revert()
    }
  }, [])

  const handleTrayDrag = (movementX) => adjustTrayProgress.current?.(movementX) === true
  const handleTrayDragEnd = () => settleTrayProgress.current?.()

  const handleBurgerTap = () => {
    burgerInteraction.current = { index: activeIndex, token: burgerInteraction.current.token + 1 }
  }

  return (
    <main className={heroTransitioning ? 'is-hero-transitioning' : undefined}>
      <Experience heroExitProgress={heroExitProgress} trayEntryProgress={trayEntryProgress} scrollProgress={scrollProgress} finalTransitionProgress={finalTransitionProgress} activeIndex={activeIndex} burgerInteraction={burgerInteraction} onReady={handleSceneReady} />
      <div className={`scene-curtain${sceneReady ? ' is-hidden' : ''}`} aria-hidden="true" />
      <div className="grain" />
      <Navbar hiddenOnShowcase={showcaseActive} onYellow={navbarOnYellow} />
      <Hero ref={heroRef} />
      <BurgerShowcase burger={burgers[activeIndex]} activeIndex={activeIndex} isReady={showcaseReady} isActive={showcaseActive} isInteractive={showcaseReady && showcaseActive && !heroTransitioning} onTrayDrag={handleTrayDrag} onTrayDragEnd={handleTrayDragEnd} onBurgerTap={handleBurgerTap} />
      <MilasSection onOpenMenu={openMenu} />
      <MenuOverlay open={menuOpen} onClose={closeMenu} />
      <DiscountPopup open={discountOpen} onClose={() => setDiscountOpen(false)} />
    </main>
  )
}
