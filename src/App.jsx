import React, { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from './components/Navbar'
import Hero from './sections/Hero'
import BurgerShowcase from './sections/BurgerShowcase'
import MilasSection from './sections/MilasSection'
import Experience from './three/Experience'
import { burgers } from './data/burgers'
import { getTrayRotationProgress, MOBILE_TRAY_SETTLE_END, TRAY_ROTATION_END, TRAY_ROTATION_START, TRAY_SETTLE_END } from './utils/scrollProgress'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const heroExitProgress = useRef(0)
  const scrollProgress = useRef(0)
  const finalTransitionProgress = useRef(0)
  const trayTriggerRef = useRef(null)
  const trayDragOffset = useRef(0)
  const burgerInteraction = useRef({ index: -1, token: 0 })
  const heroRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [showcaseReady, setShowcaseReady] = useState(false)
  const [showcaseActive, setShowcaseActive] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [navbarOnYellow, setNavbarOnYellow] = useState(false)

  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    const context = gsap.context(() => {
      const heroMotion = { progress: 0 }
      const heroTimeline = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: () => {
          heroExitProgress.current = heroMotion.progress
        },
        scrollTrigger: {
          trigger: '#top',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.75,
        },
      })

      heroTimeline.to(heroMotion, {
        progress: 1,
        duration: 1,
      }, 0)

      heroTimeline.to('.hero-copy', {
        scale: 1.08,
        opacity: 0,
        yPercent: -8,
        duration: 1,
      }, 0)

      heroTimeline.to('.scroll-cue', {
        autoAlpha: 0,
        y: -12,
        duration: 0.45,
      }, 0)

      const mobileTray = window.matchMedia('(max-width: 720px)').matches
      trayTriggerRef.current = ScrollTrigger.create({
        trigger: '#tray',
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: 0.7,
        onUpdate: (self) => {
          scrollProgress.current = self.progress
          const rotationProgress = getTrayRotationProgress(self.progress, mobileTray)
          const nextIndex = Math.min(burgers.length - 1, Math.round(rotationProgress * (burgers.length - 1)))
          setActiveIndex((current) => current === nextIndex ? current : nextIndex)
          const isReady = self.progress >= (mobileTray ? MOBILE_TRAY_SETTLE_END : TRAY_SETTLE_END)
          const isActive = self.progress > 0 && self.progress < 1
          setShowcaseReady((current) => current === isReady ? current : isReady)
          setShowcaseActive((current) => current === isActive ? current : isActive)
        },
      })

      ScrollTrigger.create({
        trigger: '#milas',
        start: 'top bottom',
        end: 'top top',
        scrub: 0.7,
        onUpdate: (self) => {
          finalTransitionProgress.current = self.progress
        },
      })

      ScrollTrigger.create({
        trigger: '#milas',
        start: 'top 20px',
        end: 'bottom top',
        onToggle: (self) => setNavbarOnYellow(self.isActive),
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
        duration: 1.44,
        stagger: 0.28,
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
      trayTriggerRef.current = null
      media.revert()
      context.revert()
    }
  }, [])

  const handleTraySwipe = (direction) => {
    const targetIndex = Math.max(0, Math.min(burgers.length - 1, activeIndex + direction))
    if (targetIndex === activeIndex) {
      burgerInteraction.current = { index: activeIndex, token: burgerInteraction.current.token + 1 }
      return
    }

    const trayTrigger = trayTriggerRef.current
    if (!trayTrigger) return
    const rotationProgress = targetIndex / (burgers.length - 1)
    const triggerProgress = TRAY_ROTATION_START + rotationProgress * (TRAY_ROTATION_END - TRAY_ROTATION_START)
    const targetScroll = trayTrigger.start + (trayTrigger.end - trayTrigger.start) * triggerProgress
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: targetScroll, behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  const handleBurgerTap = () => {
    burgerInteraction.current = { index: activeIndex, token: burgerInteraction.current.token + 1 }
  }

  return (
    <main>
      <Experience heroExitProgress={heroExitProgress} scrollProgress={scrollProgress} finalTransitionProgress={finalTransitionProgress} activeIndex={activeIndex} trayDragOffset={trayDragOffset} burgerInteraction={burgerInteraction} onReady={() => setSceneReady(true)} />
      <div className={`scene-curtain${sceneReady ? ' is-hidden' : ''}`} aria-hidden="true" />
      <div className="grain" />
      <Navbar hiddenOnShowcase={showcaseActive} onYellow={navbarOnYellow} />
      <Hero ref={heroRef} />
      <BurgerShowcase burger={burgers[activeIndex]} activeIndex={activeIndex} isReady={showcaseReady} isActive={showcaseActive} trayDragOffset={trayDragOffset} onTraySwipe={handleTraySwipe} onBurgerTap={handleBurgerTap} />
      <MilasSection />
    </main>
  )
}
