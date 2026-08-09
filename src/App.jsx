import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from './components/Navbar'
import MenuOverlay from './components/MenuOverlay'
import Hero from './sections/Hero'
import BurgerShowcase from './sections/BurgerShowcase'
import MilasSection from './sections/MilasSection'
import Experience from './three/Experience'
import { burgers } from './data/burgers'
import { getTrayProgressForBurger, getTrayRotationProgress, MOBILE_TRAY_SETTLE_END, TRAY_SETTLE_END } from './utils/scrollProgress'

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
  const trayRequestedIndex = useRef(0)
  const traySettledIndex = useRef(0)
  const runFinalScene = useRef(null)
  const requestTrayIndex = useRef(null)
  const finalSceneTween = useRef(null)
  const finalSceneRequested = useRef(false)
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

  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const handleSceneReady = useCallback(() => setSceneReady(true), [])

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    let cleanupHeroScroll = () => {}
    let cleanupHeroInput = () => {}
    let heroReturnTween = null
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
          trayRequestedIndex.current = 0
          traySettledIndex.current = 0
          finalSceneRequested.current = false
          finalTransitionProgress.current = 0
          trayEntryProgress.current = 1
          setDisplayedBurger(0)
          scrollProgress.current = firstTrayProgress

          const trayTrigger = trayTriggerRef.current
          if (trayTrigger) {
            jumpToScroll(trayTrigger.start + (trayTrigger.end - trayTrigger.start) * firstTrayProgress)
          }
          releaseHeroScroll()
        },
        onReverseComplete: () => {
          heroPhase.current = 'hero'
          setHeroTransitioning(false)
          setShowcaseVisibility(false, false)
          trayRequestedIndex.current = 0
          traySettledIndex.current = 0
          finalSceneRequested.current = false
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
      const runDigitalTrayStep = () => {
        if (heroPhase.current !== 'tray' || traySnapTween.current || finalSceneTween.current) return

        const currentIndex = traySettledIndex.current
        const requestedIndex = trayRequestedIndex.current
        if (currentIndex === requestedIndex) {
          if (finalSceneRequested.current && currentIndex === burgers.length - 1) {
            runFinalScene.current?.(true)
          }
          return
        }

        const nextIndex = currentIndex + Math.sign(requestedIndex - currentIndex)
        const targetProgress = getTrayProgressForBurger(nextIndex, burgers.length, mobileTray)
        const trayMotion = { progress: scrollProgress.current }

        const stepTimeline = gsap.timeline({
          onComplete: () => {
            scrollProgress.current = targetProgress
            traySettledIndex.current = nextIndex
            setDisplayedBurger(nextIndex)
            traySnapTween.current = null
            if (finalSceneRequested.current && nextIndex === burgers.length - 1) {
              runFinalScene.current?.(true)
            } else {
              runDigitalTrayStep()
            }
          },
        })

        traySnapTween.current = stepTimeline
        stepTimeline.to(trayMotion, {
          progress: targetProgress,
          duration: 0.64,
          ease: 'power2.inOut',
          onUpdate: () => {
            scrollProgress.current = trayMotion.progress
          },
        }, 0)
        stepTimeline.call(() => setDisplayedBurger(nextIndex), [], 0.32)
      }

      const runDigitalFinalTransition = (forward) => {
        if (heroPhase.current !== 'tray') return

        const lastIndex = burgers.length - 1
        if (forward && (trayRequestedIndex.current !== lastIndex || traySettledIndex.current !== lastIndex || traySnapTween.current)) {
          trayRequestedIndex.current = lastIndex
          runDigitalTrayStep()
          return
        }

        finalSceneTween.current?.kill()
        finalSceneTween.current = null

        const lastBurgerProgress = getTrayProgressForBurger(lastIndex, burgers.length, mobileTray)
        const trayTrigger = trayTriggerRef.current
        const lastBurgerScroll = trayTrigger
          ? trayTrigger.start + (trayTrigger.end - trayTrigger.start) * lastBurgerProgress
          : window.scrollY
        const finalMotion = {
          tray: scrollProgress.current,
          section: finalTransitionProgress.current,
          page: window.scrollY,
        }
        const targetTrayProgress = forward ? 1 : lastBurgerProgress
        const targetSectionProgress = forward ? 1 : 0
        const targetPageScroll = forward && trayTrigger
          ? trayTrigger.end + window.innerHeight * 0.78
          : lastBurgerScroll
        let scrollBehaviorRestored = false
        const restoreScrollBehavior = () => {
          if (scrollBehaviorRestored) return
          unlockScrollBehavior()
          scrollBehaviorRestored = true
        }
        lockScrollBehavior()

        if (!forward) setShowcaseVisibility(true, true)

        const finalTimeline = gsap.timeline({
          onComplete: () => {
            scrollProgress.current = targetTrayProgress
            finalTransitionProgress.current = targetSectionProgress
            finalSceneTween.current = null
            restoreScrollBehavior()

            if (forward) {
              setShowcaseVisibility(true, false)
            } else {
              setShowcaseVisibility(true, true)
              runDigitalTrayStep()
            }
          },
          onInterrupt: restoreScrollBehavior,
        })

        finalSceneTween.current = finalTimeline
        finalTimeline.to(finalMotion, {
          tray: targetTrayProgress,
          section: targetSectionProgress,
          page: targetPageScroll,
          duration: 0.96,
          ease: 'power2.inOut',
          onUpdate: () => {
            scrollProgress.current = finalMotion.tray
            finalTransitionProgress.current = finalMotion.section
            scrollingElement.scrollTop = finalMotion.page
          },
        })
      }

      runFinalScene.current = runDigitalFinalTransition

      const requestDigitalTrayIndex = (index, syncScroll = false) => {
        if (heroPhase.current !== 'tray') return false

        const nextIndex = Math.max(0, Math.min(burgers.length - 1, index))
        trayRequestedIndex.current = nextIndex

        if (syncScroll && trayTriggerRef.current) {
          const triggerProgress = getTrayProgressForBurger(nextIndex, burgers.length, mobileTray)
          const trayTrigger = trayTriggerRef.current
          jumpToScroll(trayTrigger.start + (trayTrigger.end - trayTrigger.start) * triggerProgress)
        }

        runDigitalTrayStep()
        return true
      }

      requestTrayIndex.current = requestDigitalTrayIndex

      trayTriggerRef.current = ScrollTrigger.create({
        trigger: '#tray',
        start: 'top bottom',
        end: 'bottom bottom',
        onUpdate: (self) => {
          if (heroPhase.current !== 'tray') return

          const rotationProgress = getTrayRotationProgress(self.progress, mobileTray)
          const nextIndex = getStableBurgerIndex(rotationProgress, trayRequestedIndex.current)

          requestDigitalTrayIndex(nextIndex)

          if (self.progress >= 0.975 && !finalSceneRequested.current) {
            finalSceneRequested.current = true
            trayRequestedIndex.current = burgers.length - 1
            const holdProgress = getTrayProgressForBurger(burgers.length - 1, burgers.length, mobileTray)
            jumpToScroll(self.start + (self.end - self.start) * holdProgress)
            runDigitalTrayStep()
          } else if (self.progress <= 0.91 && finalSceneRequested.current) {
            finalSceneRequested.current = false
            runDigitalFinalTransition(false)
          }

          const finalComplete = finalSceneRequested.current && finalTransitionProgress.current >= 0.999
          setShowcaseVisibility(true, !finalComplete)
        },
      })

      const beginHeroTransition = (forward) => {
        if (heroPhase.current === 'transition') return
        heroPhase.current = 'transition'
        traySnapTween.current?.kill()
        traySnapTween.current = null
        finalSceneTween.current?.kill()
        finalSceneTween.current = null
        finalSceneRequested.current = false
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
            trayRequestedIndex.current = 0
            traySettledIndex.current = 0
            finalSceneRequested.current = false
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
        && trayRequestedIndex.current === 0
        && traySettledIndex.current === 0
        && !traySnapTween.current
        && !finalSceneTween.current
        && finalTransitionProgress.current <= 0.001

      let heroTouchStartY = null
      const preventHeroMomentum = (event) => {
        if (heroPhase.current !== 'transition' || !heroScrollLocked) return false
        if (event.cancelable) event.preventDefault()
        return true
      }
      const handleHeroWheel = (event) => {
        if (preventHeroMomentum(event)) return
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
      traySnapTween.current?.kill()
      traySnapTween.current = null
      finalSceneTween.current?.kill()
      finalSceneTween.current = null
      heroReturnTween?.kill()
      heroReturnTween = null
      cleanupHeroInput()
      cleanupHeroScroll()
      runFinalScene.current = null
      requestTrayIndex.current = null
      trayTriggerRef.current = null
      media.revert()
      context.revert()
    }
  }, [])

  const handleTraySwipe = (direction) => {
    const currentRequest = trayRequestedIndex.current
    const targetIndex = Math.max(0, Math.min(burgers.length - 1, currentRequest + direction))
    if (targetIndex === currentRequest) {
      burgerInteraction.current = { index: activeIndexValue.current, token: burgerInteraction.current.token + 1 }
      return false
    }

    return requestTrayIndex.current?.(targetIndex, true) === true
  }

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
      <BurgerShowcase burger={burgers[activeIndex]} activeIndex={activeIndex} isReady={showcaseReady} isActive={showcaseActive} isInteractive={showcaseActive && !heroTransitioning} onTraySwipe={handleTraySwipe} onBurgerTap={handleBurgerTap} />
      <MilasSection onOpenMenu={openMenu} />
      <MenuOverlay open={menuOpen} onClose={closeMenu} />
    </main>
  )
}
