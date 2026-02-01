'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// SVG Icons
const MenuIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const CloseIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

// Social Icons
const FacebookIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const WhatsAppIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.531 3.488"/>
  </svg>
)

const InstagramIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const TwitterIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
)

const YouTubeIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

// Navigation & Social Links
const navigation = [
  { name: 'Home', href: '#home' },
  { name: 'About Us', href: '#about' },
  { name: 'Activities', href: '#activities' },
  { name: 'Statistics', href: '#statistics' },
  { name: 'Calendar', href: '#calendar' },
  { name: 'Gallery', href: '#gallery' },
  { name: 'Resources', href: '#resources' },
  { name: 'Committee', href: '#committee' },
  { name: 'Community Voice', href: '#testimonials' },
  { name: 'FAQ', href: '#faq' },
  { name: 'News', href: '#news' },
  { name: 'Contact', href: '#contact' },
]

const socialLinks = [
  { name: 'Facebook', href: 'https://www.facebook.com/BoseleVDC', icon: FacebookIcon, color: '#1877F2' },
  { name: 'WhatsApp', href: 'https://chat.whatsapp.com/GU1seuB79LZ0WPOdKsygDq', icon: WhatsAppIcon, color: '#25D366' },
  { name: 'Instagram', href: 'https://instagram.com/bosele_kgotla', icon: InstagramIcon, color: '#E4405F' },
  { name: 'Twitter', href: 'https://twitter.com/bosele_kgotla', icon: TwitterIcon, color: '#1DA1F2' },
  { name: 'YouTube', href: 'https://youtube.com/@boselekgotla', icon: YouTubeIcon, color: '#FF0000' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      const sections = navigation.map(item => item.href.substring(1))
      const scrollPosition = window.scrollY + 100

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i])
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href) => {
    setMobileMenuOpen(false)
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'backdrop-blur-md shadow-2xl bg-gradient-to-r from-emerald-800/95 to-green-700/95' 
        : 'bg-gradient-to-r from-emerald-800 to-green-700'
    }`}>
      <div className="h-1 bg-gradient-to-r from-yellow-400 via-green-300 to-blue-400"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 lg:py-6">
          <div className="flex items-center space-x-3 lg:space-x-4 group">
            {/* Logo */}
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl border-2 border-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 overflow-hidden">
                <img
  src="/images/logo.webp"
  alt="Bosele Kgotla VDC Logo"
  className="w-full h-full object-contain"
/>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-green-300/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="text-white">
              <h1 className="text-base sm:text-lg lg:text-2xl xl:text-3xl font-bold leading-tight group-hover:text-green-100 transition-colors duration-300">
                Bosele Kgotla Village Development Committee
              </h1>
              <p className="text-xs sm:text-sm lg:text-base opacity-90 text-green-100 mt-1">
                🏛️ Serving Gantsi District • 🤝 Building Community Together
              </p>
            </div>
          </div>

          {/* Social Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-2">
            {socialLinks.map((social) => {
              const IconComponent = social.icon
              return (
                <a
                  key={social.name}
                  href={social.href}
                  className="group relative w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  title={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconComponent className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                       style={{ background: `linear-gradient(135deg, ${social.color}20, ${social.color}10)` }}>
                  </div>
                </a>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden relative z-10 p-3 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="relative w-6 h-6">
              <MenuIcon className={`absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 rotate-45' : 'opacity-100 rotate-0'}`} />
              <CloseIcon className={`absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-45'}`} />
            </div>
          </button>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden lg:block pb-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 shadow-lg">
            <ul className="flex flex-wrap justify-center gap-1 xl:gap-2">
              {navigation.map((item) => {
                const isActive = activeSection === item.href.substring(1)
                return (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault()
                        handleNavClick(item.href)
                      }}
                      className={`relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 block hover:-translate-y-0.5 hover:shadow-lg group ${
                        isActive 
                          ? 'bg-white/20 text-white shadow-lg' 
                          : 'text-green-100 hover:bg-white/15 hover:text-white'
                      }`}
                    >
                      {item.name}
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
                      )}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden fixed inset-0 top-[var(--header-height,88px)] transition-all duration-500 ease-in-out ${
        mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div className="h-full bg-emerald-900/95 backdrop-blur-md border-t border-white/20 overflow-y-auto">
          <nav className="max-w-7xl mx-auto px-4 py-6">
            <ul className="space-y-2">
              {navigation.map((item, index) => {
                const isActive = activeSection === item.href.substring(1)
                return (
                  <li key={item.name} 
                      className="transform transition-all duration-300"
                      style={{ 
                        transitionDelay: mobileMenuOpen ? `${index * 50}ms` : '0ms',
                        transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)'
                      }}>
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault()
                        handleNavClick(item.href)
                      }}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                        isActive
                          ? 'bg-white/20 text-white shadow-lg'
                          : 'text-green-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="font-medium">{item.name}</span>
                      {isActive && (
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      )}
                    </a>
                  </li>
                )
              })}
            </ul>

            {/* Social Links - Mobile */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-green-100 text-sm text-center mb-4 font-medium">Connect with us</p>
              <div className="flex justify-center space-x-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                      title={social.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        transitionDelay: mobileMenuOpen ? `${(index + navigation.length) * 50}ms` : '0ms'
                      }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  )
                })}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}