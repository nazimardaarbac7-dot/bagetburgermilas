import React, { forwardRef } from 'react'

const Hero = forwardRef(function Hero(_, ref) {
  return (
    <section id="top" className="hero" ref={ref}>
      <div className="hero-stage">
        <div className="hero-copy">
          <p className="eyebrow">EST. 2023 · MİLAS</p>
          <h1><span>BAGET</span><span>BURGER</span></h1>
          <p className="hero-location">MİLAS</p>
        </div>
        <a className="scroll-cue" href="#tray">
          <span>SCROLL TO EXPLORE</span><i aria-hidden="true" />
        </a>
      </div>
    </section>
  )
})

export default Hero
