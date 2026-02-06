'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play, Pause, ArrowDown, AlertTriangle, X } from "lucide-react"

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
  {
    image: "/images/foot_mouth.webp",
    title: "⚠️ URGENT: Foot and Mouth Disease Alert",
    subtitle: "Livestock Health Emergency • Immediate Action Required",
    description: "FMD outbreak confirmed in North East District. Movement of cattle, goats, sheep and pigs is STRICTLY PROHIBITED. Report sick animals immediately. Protect your livestock and our community.",
    buttonText: "View Safety Guidelines",
    buttonLink: "#fmd-alert",
    gradient: "from-red-900/75 via-orange-800/65 to-amber-700/70",
    isScrollLink: true,
    isUrgent: true,
  },
]

// Tiny base64 blur placeholder
const blurPlaceholder =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    parentName: '',
    childName: '',
    email: '',
    phone: '',
    address: '',
    childAge: '',
    startDate: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

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
      setIsFormOpen(true)
    } else if (slide.isScrollLink) {
      e.preventDefault()
      const targetElement = document.getElementById(slide.buttonLink.replace("#", ""))
      if (targetElement) targetElement.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Application submitted successfully! We will contact you soon.' })
        setFormData({
          parentName: '',
          childName: '',
          email: '',
          phone: '',
          address: '',
          childAge: '',
          startDate: '',
        })
        setTimeout(() => {
          setIsFormOpen(false)
          setMessage({ type: '', text: '' })
        }, 3000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit application' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again later.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
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
            
            {/* Urgent Alert Banner */}
            {slide.isUrgent && (
              <div className="absolute top-0 left-0 right-0 z-20 bg-red-600/90 backdrop-blur-sm py-3 px-4 border-b-2 border-red-400">
                <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-white">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                  <span className="font-bold text-sm md:text-base tracking-wide">
                    LIVESTOCK HEALTH EMERGENCY - QUARANTINE IN EFFECT
                  </span>
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
              </div>
            )}
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
            <span className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-medium tracking-wide mb-4 ${
              slides[currentSlide].isUrgent 
                ? "bg-red-600/80 border-red-400 animate-pulse" 
                : "bg-white/15 border-white/20"
            }`}>
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
              className={`group inline-flex items-center px-8 py-4 font-semibold rounded-2xl shadow-2xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 text-lg ${
                slides[currentSlide].isUrgent
                  ? "bg-gradient-to-r from-red-600 to-red-500 text-white ring-2 ring-red-400"
                  : "bg-gradient-to-r from-orange-500 to-red-500 text-white"
              }`}
            >
              {slides[currentSlide].buttonText}
              <ChevronRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
          <div className="flex items-center space-x-4 bg-white/10 rounded-full px-6 py-3 border border-white/20">
            {slides.map((slide, index) => (
              <button key={index} onClick={() => goToSlide(index)} className={`relative transition-all duration-300 ${index === currentSlide ? "scale-125" : "hover:scale-110"}`}>
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? slide.isUrgent 
                      ? "bg-red-500 shadow-lg shadow-red-500/50" 
                      : "bg-orange-400 shadow-lg shadow-orange-400/50"
                    : "bg-white/50 hover:bg-white/80"
                }`} />
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

      {/* Registration Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white rounded-t-2xl">
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-3xl font-bold mb-2">Daycare Registration</h2>
              <p className="text-white/90">Bosele Kgotla Day Care Center</p>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {message.text && (
                <div
                  className={`p-4 rounded-lg ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent/Guardian Name *
                  </label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Child's Name *
                  </label>
                  <input
                    type="text"
                    name="childName"
                    value={formData.childName}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="+267 1234 5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Full residential address"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Child's Age *
                  </label>
                  <input
                    type="number"
                    name="childAge"
                    value={formData.childAge}
                    onChange={handleFormChange}
                    required
                    min="0"
                    max="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Age (0-10)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}