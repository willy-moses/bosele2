'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play, Pause, ArrowDown } from "lucide-react"

const slides = [
  {
    image: "/images/kgt.webp",
    title: "Welcome to Bosele Kgotla",
    subtitle: "Unity • Progress • Community",
    description: "Working together to build a stronger, more vibrant community in the heart of Gantsi District.",
    buttonText: "Discover Our Mission",
    buttonLink: "#about",
    gradient: "from-emerald-900/60 via-green-800/50 to-teal-700/60",
    isScrollLink: true,
  },
  {
    image: "/images/pre.webp",
    title: "Bosele Day Care Center",
    subtitle: "Early Learning • Safe Environment • Bright Futures",
    description: "Give your child the foundation they deserve. Quality early childhood education in a nurturing, caring environment.",
    buttonText: "Apply Now",
    buttonLink: "#contact",
    gradient: "from-purple-900/60 via-pink-800/50 to-rose-700/60",
    isApplyButton: true,
  },
  {
    image: "/images/caravan.webp",
    title: "Help Revive Our Youth Center",
    subtitle: "Renovation • Partnership • Investment",
    description: "Our youth center needs your support! We are seeking donations and partnerships to refurbish this vital community space for the next generation.",
    buttonText: "Support Our Youth",
    buttonLink: "#contact",
    gradient: "from-slate-900/65 via-blue-900/55 to-indigo-800/65",
    isScrollLink: true,
  },
  {
    image: "/images/garden.webp",
    title: "Growing Together at Bosele",
    subtitle: "Agriculture • Education • Community",
    description: "Our VDC community garden teaches sustainable farming practices while providing fresh, healthy produce. Join us in cultivating a greener, more self-sufficient future.",
    buttonText: "Explore Our Garden",
    buttonLink: "#activities",
    gradient: "from-green-900/60 via-teal-800/50 to-cyan-700/60",
    isScrollLink: true,
  },
]

// Tiny base64 blur placeholder
const blurPlaceholder =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => setIsLoaded(true), [])

  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const handleButtonClick = (e, slide) => {
    if (slide.isApplyButton) {
      e.preventDefault()
      alert("Registration form will open here.") // Keep as placeholder
    } else if (slide.isScrollLink) {
      e.preventDefault()
      const targetElement = document.getElementById(slide.buttonLink.replace("#", ""))
      if (targetElement) targetElement.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <section id="home" className="relative h-screen overflow-hidden bg-gray-900">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover transition-transform duration-[6000ms] ease-out"
            style={{ transform: index === currentSlide ? "scale(1)" : "scale(1.1)" }}
            priority={index === 0}
            placeholder="blur"
            blurDataURL={blurPlaceholder}
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        </div>
      ))}

      {/* Navigation */}
      <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/10 rounded-full border border-white/20 text-white hover:scale-110 transition-all duration-300">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/10 rounded-full border border-white/20 text-white hover:scale-110 transition-all duration-300">
        <ChevronRight className="w-6 h-6" />
      </button>
      <button onClick={() => setIsAutoPlaying(!isAutoPlaying)} className="absolute top-6 right-6 z-30 p-3 bg-white/10 rounded-full border border-white/20 text-white hover:scale-110 transition-all duration-300">
        {isAutoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>

      {/* Hero Content */}
      <div className="absolute inset-0 flex items-center justify-center z-20 px-4">
        <div className={`text-center text-white max-w-5xl mx-auto transform transition-all duration-1000 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          <span className="inline-flex items-center px-4 py-2 bg-white/15 rounded-full border text-sm font-medium tracking-wide mb-4">
            {slides[currentSlide].subtitle}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight drop-shadow-2xl">
            {slides[currentSlide].title}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
            {slides[currentSlide].description}
          </p>
          <button
            onClick={(e) => handleButtonClick(e, slides[currentSlide])}
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-2xl shadow-2xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 text-lg"
          >
            {slides[currentSlide].buttonText}
            <ChevronRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
        <div className="flex items-center space-x-4 bg-white/10 rounded-full px-6 py-3 border border-white/20">
          {slides.map((_, index) => (
            <button key={index} onClick={() => goToSlide(index)} className={`relative transition-all duration-300 ${index === currentSlide ? "scale-125" : "hover:scale-110"}`}>
              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-orange-400 shadow-lg shadow-orange-400/50" : "bg-white/50 hover:bg-white/80"}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 mb-6 flex flex-col items-center text-white/80 animate-bounce">
        <span className="text-sm mb-2 font-medium">Scroll to explore</span>
        <ArrowDown className="w-5 h-5" />
      </div>

      {/* Slide counter */}
      <div className="absolute top-6 left-6 z-30 text-white/80 font-medium">
        <span className="text-lg">{currentSlide + 1}</span>
        <span className="text-sm mx-1">/</span>
        <span className="text-sm">{slides.length}</span>
      </div>
    </section>
  )
}
