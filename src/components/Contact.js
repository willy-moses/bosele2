'use client'
import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Building, Scale, Send, CheckCircle } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    setIsSubmitted(true)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    })
    
    setTimeout(() => {
      setIsSubmitted(false)
    }, 5000)
  }

  const contactItems = [
    {
      icon: MapPin,
      title: 'Location',
      content: ['Bosele Kgotla', 'Gantsi District', 'Botswana'],
      gradient: 'from-red-500 to-pink-600'
    },
    {
      icon: Phone,
      title: 'Phone',
      content: ['+267 74069451', '(WhatsApp Available)'],
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: Mail,
      title: 'Email',
      content: ['boselevdc@gmail.com'],
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Clock,
      title: 'Meeting Times',
      content: ['Kgotla Meetings:', 'First Saturday of each month', '10:00 AM'],
      gradient: 'from-purple-500 to-violet-600'
    },
    {
      icon: Building,
      title: 'Office Hours',
      content: ['Monday - Friday', '8:00 AM - 5:00 PM', 'Saturday: 8:00 AM - 12:00 PM'],
      gradient: 'from-orange-500 to-amber-600'
    },
    {
      icon: Scale,
      title: 'Traditional Authority',
      content: ['Under Gantsi Traditional Authority', 'Following Setswana customs', 'and government guidelines'],
      gradient: 'from-teal-500 to-cyan-600'
    }
  ]

  return (
    <section id="contact" className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Contact Us
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-blue-600 mx-auto rounded-full"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get in touch with our community development committee. We&apos;re here to listen, assist, and work together for our village&apos;s progress.
          </p>
        </div>

        {/* Contact Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {contactItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                {/* Icon Header */}
                <div className={`bg-gradient-to-r ${item.gradient} p-6 text-center`}>
                  <IconComponent className="w-12 h-12 mx-auto text-white drop-shadow-lg mb-2" />
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                  <div className="space-y-2">
                    {item.content.map((line, idx) => (
                      <p key={idx} className="text-gray-600 text-sm leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Bottom accent */}
                <div className={`h-1 bg-gradient-to-r ${item.gradient}`}></div>
              </div>
            )
          })}
        </div>

        {/* Contact Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-emerald-500">
            {isSubmitted && (
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 text-green-800 px-6 py-4 rounded-xl mb-8 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="font-medium">
                  Your message has been sent successfully! We will get back to you soon.
                </span>
              </div>
            )}
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
                <Send className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-2">Send us a Message</h3>
              <p className="text-gray-600">We&apos;d love to hear from you. Fill out the form below and we&apos;ll get back to you as soon as possible.</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="project">Project Information</option>
                  <option value="complaint">Complaint or Concern</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="assistance">Request for Assistance</option>
                  <option value="meeting">Meeting Request</option>
                  <option value="volunteer">Volunteer Opportunity</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  placeholder="Please provide details about your inquiry..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 resize-vertical bg-gray-50 focus:bg-white"
                ></textarea>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:from-emerald-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </div>
          </div>
        </div>

        {/* Additional Contact Info */}
        <div className="mt-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-8 text-white text-center">
          <h4 className="text-2xl font-bold mb-4">Visit Our Office</h4>
          <p className="text-lg opacity-90 mb-2">We welcome community members to visit us during office hours</p>
          <p className="opacity-75">or join our monthly kgotla meetings for direct engagement</p>
        </div>
      </div>
    </section>
  )
}
