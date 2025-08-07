import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import img from '../assets/img/bapelit.jpg'
import img2 from '../assets/img/logobapelit.png'
import LoginPopup from './Login'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

const HomePage = () => {
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
        duration: 2,
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
      className='bg-gradient-to-br from-slate-50 via-white to-blue-50/30 w-full min-h-screen flex justify-center items-center overflow-hidden px-4 md:px-20 relative'
    >
      {/* Decorative Background Elements */}
      <div ref={backgroundRef} className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/5 rounded-full blur-3xl'></div>
        <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/10 to-blue-400/5 rounded-full blur-3xl'></div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-transparent via-blue-50/20 to-transparent rounded-full'></div>
      </div>

      {/* Header */}
      <div ref={headerRef} className='absolute top-0 w-full px-4 md:px-20 py-5 z-20'>
        <div className='gap-x-3 items-center backdrop-blur-sm bg-white/70 rounded-2xl p-4 shadow-lg border border-white/20 inline-flex'>
          <img src={img2} alt="" className='w-6' />
          <p className='font-semibold text-gray-800'>Bapelitbangda Kota Tasikmalaya</p>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex flex-col lg:flex-row gap-12 lg:gap-20 items-center z-10 max-w-7xl mx-auto'>
        {/* Left Elements */}
        <div className='flex flex-col gap-y-6 lg:w-1/2 text-center lg:text-left'>
          <div className='space-y-4'>
            <h1 ref={titleRef} className='text-6xl lg:text-7xl xl:text-8xl font-bold mt-15'>
              <span className='bg-gradient-to-r from-[#262628] to-[#262628] bg-clip-text text-transparent'>
                Dispoma
              </span>
            </h1>
            
            <h2 ref={subtitleRef} className='text-2xl lg:text-3xl font-semibold text-gray-700 tracking-wide'>
              Disposisi Surat Masuk
            </h2>
          </div>
          
          <p ref={descriptionRef} className='text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0 text-base lg:text-lg'>
            Portal ini hanya dapat diakses oleh pegawai internal Bapelitbangda. Silakan login menggunakan akun resmi untuk mengelola dan memantau surat masuk instansi.
          </p>
          
          <div className='flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start mt-4'>
            <button
              ref={buttonRef}
              onClick={handleLoginShow}
              onMouseEnter={() => handleButtonHover(true)}
              onMouseLeave={() => handleButtonHover(false)}
              className='group relative cursor-pointer px-8 py-4 bg-[#fff] text-black font-semibold rounded-2xl shadow-xl border-[1px] border-black/10 hover:shadow-xl flex items-center gap-2 min-w-[140px]'
            >
              <span>Masuk</span>
              <svg className='w-4 h-4 group-hover:translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
              </svg>
            </button>
          </div>
          
          {/* Stats or Features */}
          <div ref={statsRef} className='flex flex-wrap gap-6 mt-12 text-sm text-gray-500 justify-center lg:justify-start'>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full'></div>
              <span>Sistem Terintegrasi</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
              <span>Real-time Updates</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
              <span>Secure Access</span>
            </div>
          </div>
        </div>

        {/* Right Elements */}
        <div className='lg:w-1/2 hidden lg:flex justify-center relative'>
          <div ref={imageContainerRef} className='relative group'>
            {/* Decorative rings */}
            <div className='absolute -inset-6 animate-pulse rounded-full bg-white shadow-2xl group-hover:scale-105 transition-transform duration-500'></div>
            
            {/* Main image */}
            <div className='relative z-10 p-2 bg-gradient-to-br from-white to-gray-50 rounded-full shadow-2xl'>
              <img 
                src={img} 
                alt="Bapelitbangda Building" 
                className='w-80 h-80 lg:w-96 lg:h-96 xl:w-[440px] xl:h-[440px] rounded-full object-cover shadow-inner border-4 border-white transition-transform duration-700' 
              />
            </div>
            
            {/* Floating elements */}
            <div ref={floatingElement1Ref} className='absolute -top-4 -right-4 w-20 h-20 bg-indigo-400 rounded-full shadow-lg flex items-center justify-center'>
              <svg className='w-10 h-10 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
              </svg>
            </div>

            <div className='absolute w-7 h-7 rounded-full bg-cyan-300 top-17 animate-bounce'></div>
            <div className='absolute w-8 h-8 rounded-full bg-red-300 bottom-17 right-0 animate-bounce'></div>
            
            <div ref={floatingElement2Ref} className='absolute -bottom-4 -left-4 w-20 h-20 bg-green-400 rounded-full shadow-lg flex items-center justify-center'>
              <svg className='w-10 h-10 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlays */}
      {showLogin && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4'>
          <LoginPopup onClose={() => setShowLogin(false)} />
        </div>
      )}
    </section>
  )
}

export default HomePage