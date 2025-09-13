import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Img from '../assets/img/bapelit.jpg'
import Logo from '../assets/img/logobapelit.png'
import LoginPopup from './Login'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false)
  const containerRef = useRef(null)
  const headerRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const descriptionRef = useRef(null)
  const buttonRef = useRef(null)
  const statsRef = useRef(null)
  const imageContainerRef = useRef(null)
  const floatingElement1Ref = useRef(null)
  const floatingElement2Ref = useRef(null)
  const backgroundRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create timeline for main animations
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      // Background entrance
      gsap.fromTo(backgroundRef.current?.children || [],
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 2,
          stagger: 0.3,
          ease: "power2.out"
        }
      )

      // Header animation
      tl.fromTo(headerRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1 },
        0
      )

      // Title sequence
      tl.fromTo(titleRef.current,
        { y: 100, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2 },
        0.3
      )

      tl.fromTo(subtitleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1 },
        0.6
      )

      tl.fromTo(descriptionRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        0.9
      )

      tl.fromTo(buttonRef.current,
        { y: 30, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8 },
        1.1
      )

      tl.fromTo(statsRef.current?.children || [],
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
        1.3
      )

      // Image container animation
      tl.fromTo(imageContainerRef.current,
        { x: 100, opacity: 0, scale: 0.8, rotation: 10 },
        { x: 0, opacity: 1, scale: 1, rotation: 0, duration: 1.5 },
        0.5
      )

      // Floating elements
      tl.fromTo([floatingElement1Ref.current, floatingElement2Ref.current],
        { scale: 0, opacity: 0, rotation: 180 },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 1,
          stagger: 0.2,
          ease: "back.out(1.7)"
        },
        1.5
      )

      // Continuous animations
      // Floating animation for decorative elements
      gsap.to([floatingElement1Ref.current, floatingElement2Ref.current], {
        y: -10,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        stagger: 0.5
      })

      // Image hover animation setup
      const imageElement = imageContainerRef.current?.querySelector('img')
      if (imageElement) {
        const handleMouseEnter = () => {
          gsap.to(imageElement, {
            scale: 1.1,
            duration: 0.4,
            ease: "power2.out"
          })
        }

        const handleMouseLeave = () => {
          gsap.to(imageElement, {
            scale: 1,
            duration: 0.4,
            ease: "power2.out"
          })
        }

        imageElement.addEventListener('mouseenter', handleMouseEnter)
        imageElement.addEventListener('mouseleave', handleMouseLeave)

        return () => {
          imageElement.removeEventListener('mouseenter', handleMouseEnter)
          imageElement.removeEventListener('mouseleave', handleMouseLeave)
        }
      }

    }, containerRef.current)

    return () => ctx.revert()
  }, [])

  // Button hover animations
  const handleButtonHover = (isHovering) => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: isHovering ? 1.05 : 1,
        y: isHovering ? -2 : 0,
        duration: 0.3,
        ease: "power2.out"
      })
    }
  }
  const handleLoginShow = () => {
    setShowLogin(true)
    // Add subtle shake animation to button
    gsap.to(buttonRef.current, {
      x: [0, -2, 2, -2, 2, 0],
      duration: 0.4,
      ease: "power3.out"
    })
  }


  return (
    <section
      ref={containerRef}
      className='w-full min-h-screen flex justify-center items-center overflow-hidden px-4 md:px-20 relative'
    >
      {/* Decorative Background Elements - Cocoa Latte Theme */}
      <div ref={backgroundRef} className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#D4A373]/30 to-[#EDE6E3]/20 rounded-full blur-3xl'></div>
        <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#6D4C41]/20 to-[#D4A373]/15 rounded-full blur-3xl'></div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-transparent via-[#EDE6E3]/20 to-transparent rounded-full'></div>
      </div>

      {/* Header - Cocoa Latte Style */}
      <div ref={headerRef} className='absolute top-0 w-full px-4 md:px-20 py-5 z-20'>
        <div className='gap-x-3 items-center backdrop-blur-sm bg-gradient-to-bl from-gray-100 via-white to-gray-100 rounded-2xl p-4 shadow-lg border-2 border-slate-200 inline-flex hover:shadow-xl  '>
          <img src={Logo} alt="" className='w-6' />
          <p className='font-semibold text-[#2E2A27]'>Bapelitbangda Kota Tasikmalaya</p>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex flex-col lg:flex-row gap-12 lg:gap-20 items-center z-10 max-w-7xl mx-auto my-20 lg:my-0'>
        {/* Left Elements */}
        <div className='flex flex-col gap-y-6 lg:w-1/2 text-center lg:text-left'>
          <div className='space-y-4'>
            <h1 ref={titleRef} className='text-6xl lg:text-7xl xl:text-8xl font-bold mt-15'>
              <span className='bg-gradient-to-bl via-neutral-800 from-pink-500 to-black bg-clip-text text-transparent'>
                Magessa
              </span>
            </h1>

            <h2 ref={subtitleRef} className='text-2xl lg:text-3xl font-semibold text-black tracking-wide'>
              Management Sistem Surat
            </h2>
          </div>

          <p ref={descriptionRef} className='text-[#6D4C41] leading-relaxed max-w-lg mx-auto lg:mx-0 text-base lg:text-lg opacity-90'>
            Portal ini hanya dapat diakses oleh pegawai internal Bapelitbangda. Silakan login menggunakan akun resmi untuk mengelola surat.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start mt-4'>
            <button
              ref={buttonRef}
              onClick={handleLoginShow}
              onMouseEnter={() => handleButtonHover(true)}
              onMouseLeave={() => handleButtonHover(false)}
              className='group relative cursor-pointer px-8 py-4 bg-black hover:opacity-90 text-white font-semibold rounded-2xl shadow-xl border-2 border-[#EDE6E3] hover:shadow-2xl flex items-center gap-2 min-w-[140px]   transform hover:scale-105'
            >
              <span>Masuk</span>
              <svg className='w-4 h-4 group-hover:translate-x-1 ' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
              </svg>
            </button>
          </div>

          {/* Stats or Features - Elegant Cocoa Style */}
          <div ref={statsRef} className='flex flex-wrap gap-6 mt-6 text-sm text-[#6D4C41] justify-center lg:justify-start'>
            <div className='flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#EDE6E3] shadow-sm hover:shadow-md  '>
              <div className='w-2 h-2 bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] rounded-full shadow-sm'></div>
              <span className='font-medium'>Sistem Terintegrasi</span>
            </div>
            <div className='flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#EDE6E3] shadow-sm hover:shadow-md  '>
              <div className='w-2 h-2 bg-gradient-to-r from-[#2196F3] to-[#1976D2] rounded-full shadow-sm'></div>
              <span className='font-medium'>Real-time Updates</span>
            </div>
            <div className='flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#EDE6E3] shadow-sm hover:shadow-md  '>
              <div className='w-2 h-2 bg-gradient-to-r from-[#9C27B0] to-[#7B1FA2] rounded-full shadow-sm'></div>
              <span className='font-medium'>Secure Access</span>
            </div>
          </div>
        </div>

        {/* Right Elements - Cocoa Latte Design */}
        <div className='lg:w-1/2 hidden lg:flex justify-center relative'>
          <div ref={imageContainerRef} className='relative group'>
            {/* Decorative rings - Updated colors */}
            <div className='absolute -inset-6 animate-pulse rounded-full bg-gradient-to-br from-pink-300 to-neutral-300 shadow-2xl group-hover:scale-105 transition-all duration-300 opacity-50'></div>

            {/* Main image container */}
            <div className='relative z-10 p-3 bg-gradient-to-br from-white via-[#FDFCFB] to-[#EDE6E3] rounded-full shadow-2xl'>
              {/* Placeholder for image - replace with actual img src */}
              <div className='w-80 h-80 lg:w-96 lg:h-96 xl:w-[440px] xl:h-[440px] rounded-full bg-gradient-to-bl shadow-inner border-4 border-white   flex items-center justify-center'>
                <img src={Img} alt="" className='w-full h-full rounded-full object-cover' />
              </div>
            </div>

            {/* Floating elements - Cocoa Latte Style */}
            <div ref={floatingElement1Ref} className='absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-neutral-700 to-neutral-950 rounded-full shadow-xl flex items-center justify-center border-2 border-pink-300 hover:border-pink-500'>
              <svg className='w-10 h-10 text-pink-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
              </svg>
            </div>

            <div className='absolute w-7 h-7 rounded-full bg-gradient-to-br from-pink-300 to-pink-500 top-17 animate-bounce border-2 border-white shadow-lg'></div>
            <div className='absolute w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-pink-950 bottom-17 right-0 animate-bounce border-2 border-white shadow-lg'></div>

            <div ref={floatingElement2Ref} className='absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-neutral-700 to-neutral-950 rounded-full shadow-xl flex items-center justify-center border-2 border-pink-300 hover:border-pink-500'>
              <svg className='w-10 h-10 text-pink-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlays - Cocoa Latte Style */}
      {showLogin && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4'>
          <LoginPopup onClose={() => setShowLogin(false)} />
        </div>
      )}
    </section>
  )
}

export default LandingPage
