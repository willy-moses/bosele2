'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Play, Pause, ArrowDown, X, User, Mail, Phone, MapPin, Calendar } from 'lucide-react'

const slides = [
  {
    image: '/images/backimg.jpg',
    title: 'Welcome to Bosele Kgotla',
    subtitle: 'Unity • Progress • Community',
    description: 'Working together to build a stronger, more vibrant community in the heart of Gantsi District.',
    buttonText: 'Discover Our Mission',
    buttonLink: '#about',
    gradient: 'from-emerald-900/80 via-green-800/70 to-teal-700/80',
    isScrollLink: true
  },
  {
    image: '/images/graduation.png',
    title: 'Bosele Day Care Center',
    subtitle: 'Early Learning • Safe Environment • Bright Futures',
    description: 'Give your child the foundation they deserve. Quality early childhood education in a nurturing, caring environment.',
    buttonText: 'Apply Now',
    buttonLink: '#contact',
    gradient: 'from-purple-900/80 via-pink-800/70 to-rose-700/80',
    isApplyButton: true
  },
  {
    image: '/images/youth.png',
    title: 'Empowering Our Youth',
    subtitle: 'Skills • Education • Opportunity',
    description: 'Providing comprehensive programs and meaningful opportunities for the next generation to thrive.',
    buttonText: 'Join Our Programs',
    buttonLink: '#activities',
    gradient: 'from-blue-900/80 via-indigo-800/70 to-purple-700/80',
    isScrollLink: true
  },
  {
    image: '/images/img2.jpg',
    title: 'Preserving Our Heritage',
    subtitle: 'Culture • Tradition • Legacy',
    description: 'Keeping our rich traditions and cultural heritage alive through community events and education.',
    buttonText: 'Explore Our Culture',
    buttonLink: '#gallery',
    gradient: 'from-orange-900/80 via-amber-800/70 to-yellow-700/80',
    isScrollLink: true
  }
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    parentName: '',
    childName: '',
    email: '',
    phone: '',
    address: '',
    childAge: '',
    startDate: ''
  })

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [isAutoPlaying])

  const goToSlide = (index) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.parentName || !formData.childName || !formData.email || !formData.phone || !formData.address || !formData.childAge || !formData.startDate) {
      alert('Please fill in all required fields')
      return
    }
    
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        alert('Application submitted successfully! We will contact you soon.')
        setShowRegistrationForm(false)
        setFormData({
          parentName: '',
          childName: '',
          email: '',
          phone: '',
          address: '',
          childAge: '',
          startDate: ''
        })
      } else {
        alert(data.error || 'Failed to submit application. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit application. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleButtonClick = (e, slide) => {
    if (slide.isApplyButton) {
      e.preventDefault()
      setShowRegistrationForm(true)
    } else if (slide.isScrollLink) {
      e.preventDefault()
      const targetId = slide.buttonLink.replace('#', '')
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <section id="home" className="relative h-screen overflow-hidden bg-gray-900">
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover transition-transform duration-[6000ms] ease-out"
            style={{
              transform: index === currentSlide ? 'scale(1)' : 'scale(1.1)'
            }}
            priority={index === 0}
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
        </div>
      ))}

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-30 p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 group"
      >
        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform duration-300" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 z-30 p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 group"
      >
        <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform duration-300" />
      </button>

      {/* Play/Pause Button */}
      <button
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
        className="absolute top-6 right-6 z-30 p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300"
      >
        {isAutoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>

      {/* Main Content */}
      <div className="absolute inset-0 flex items-center justify-center z-20 px-4">
        <div
          className={`text-center text-white max-w-5xl mx-auto transform transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <div className="mb-4">
            <span className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-sm font-medium tracking-wide">
              {slides[currentSlide].subtitle}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="block transform transition-all duration-700 delay-300">
              {slides[currentSlide].title}
            </span>
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl mb-8 leading-relaxed max-w-3xl mx-auto opacity-90 transform transition-all duration-700 delay-500">
            {slides[currentSlide].description}
          </p>

          <div className="transform transition-all duration-700 delay-700">
            <button
              onClick={(e) => handleButtonClick(e, slides[currentSlide])}
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-orange-500/25 hover:from-orange-400 hover:to-red-400 hover:scale-105 hover:-translate-y-1 transition-all duration-300 text-lg"
            >
              {slides[currentSlide].buttonText}
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowRegistrationForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white relative">
              <button 
                onClick={() => setShowRegistrationForm(false)}
                className="absolute top-4 right-4 hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-300"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <User className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Day Care Center Registration</h3>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <p className="text-gray-600 mb-6 leading-relaxed">
                Please fill out this form to register your child at Bosele Day Care Center. We will contact you soon to confirm your application.
              </p>

              <div className="space-y-4">
                {/* Parent Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Parent/Guardian Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your full name"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Child Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Child&apos;s Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="childName"
                      value={formData.childName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter child's full name"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="your.email@example.com"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="+267 XX XXX XXX"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Residential Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your full address"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Child Age */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Child&apos;s Age *
                  </label>
                  <input
                    type="number"
                    name="childAge"
                    value={formData.childAge}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter child's age"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Start Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="mt-6 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>Note:</strong> This is a preliminary registration form. Our team will contact you within 2-3 business days to complete the enrollment process.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="mt-6 flex gap-4">
                <button 
                  onClick={() => setShowRegistrationForm(false)}
                  className="flex-1 border-2 border-purple-500 text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative transition-all duration-300 ${
                index === currentSlide ? 'scale-125' : 'hover:scale-110'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-orange-400 shadow-lg shadow-orange-400/50'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
              >
                {index === currentSlide && (
                  <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-75"></div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 mx-auto w-32 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-30 mb-6">
        <div className="flex flex-col items-center text-white/80 animate-bounce">
          <span className="text-sm mb-2 font-medium">Scroll to explore</span>
          <ArrowDown className="w-5 h-5" />
        </div>
      </div>

      {/* Slide Counter */}
      <div className="absolute top-6 left-6 z-30 text-white/80 font-medium">
        <span className="text-lg">{currentSlide + 1}</span>
        <span className="text-sm mx-1">/</span>
        <span className="text-sm">{slides.length}</span>
      </div>
    </section>
  )
}