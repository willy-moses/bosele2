import { MapPin, Phone, Mail, Facebook, MessageCircle, Instagram, Twitter, Youtube, Calendar, Clock, Users, Heart } from 'lucide-react'

export default function Footer() {
  const socialLinks = [
    { name: 'Facebook', href: 'https://web.facebook.com/profile.php?id=61584966610948&sk=about', icon: Facebook, gradient: 'from-blue-500 to-blue-600' },
    { name: 'WhatsApp', href: 'https://chat.whatsapp.com/GU1seuB79LZ0WPOdKsygDq', icon: MessageCircle, gradient: 'from-green-500 to-green-600' },
    { name: 'Instagram', href: 'https://instagram.com/bosele_kgotla', icon: Instagram, gradient: 'from-pink-500 to-pink-600' },
    { name: 'Twitter', href: 'https://twitter.com/bosele_kgotla', icon: Twitter, gradient: 'from-blue-400 to-blue-500' },
    { name: 'YouTube', href: 'https://youtube.com/@boselekgotla', icon: Youtube, gradient: 'from-red-500 to-red-600' }
  ]

  return (
    <footer className="text-white relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #2c5530 0%, #4a7c59 100%)'
      }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-emerald-500/10"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.08) 0%, transparent 50%), 
                          radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
                          radial-gradient(circle at 40% 80%, rgba(5, 150, 105, 0.08) 0%, transparent 50%)`
      }}></div>
      
      <div className="max-w-7xl mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Contact Information */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <h4 className="text-green-200 font-bold text-lg mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-lg">
                <Phone className="w-4 h-4 text-white" />
              </div>
              Contact Information
            </h4>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-green-200 mt-1 flex-shrink-0" />
                <p className="text-sm">Bosele Kgotla, Gantsi District, Botswana</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-green-200 flex-shrink-0" />
                <p className="text-sm">+267 74 069451</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-green-200 flex-shrink-0" />
                <p className="text-sm">boselevdc@gmail.com</p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className={`w-10 h-10 bg-gradient-to-r ${social.gradient} rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group`}
                    title={social.name}
                  >
                    <IconComponent className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <h4 className="text-green-200 font-bold text-lg mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-lg">
                <Users className="w-4 h-4 text-white" />
              </div>
              Quick Links
            </h4>
            <div className="space-y-3">
              {[
                { text: 'About Us', href: '#about' },
                { text: 'Our Activities', href: '#activities' },
                { text: 'Committee Members', href: '#committee' },
                { text: 'Resources', href: '#resources' }
              ].map((link, index) => (
                <a 
                  key={index}
                  href={link.href} 
                  className="block text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 text-sm group flex items-center gap-2"
                >
                  <div className="w-1 h-1 bg-green-200 rounded-full group-hover:w-2 transition-all duration-300"></div>
                  {link.text}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <h4 className="text-green-200 font-bold text-lg mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-lg">
                <Heart className="w-4 h-4 text-white" />
              </div>
              Services
            </h4>
            <div className="space-y-3 text-gray-300">
              {[
                'Water & Sanitation',
                'Infrastructure Development', 
                'Education Support',
                'Health Initiatives'
              ].map((service, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1 h-1 bg-green-200 rounded-full"></div>
                  <p>{service}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Meeting Schedule */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <h4 className="text-green-200 font-bold text-lg mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-lg">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              Meeting Schedule
            </h4>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-green-200 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-white">Monthly Kgotla Meeting</p>
                  <p className="text-xs text-gray-400">First Saturday of each month</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-green-200 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm">10:00 AM at Bosele Kgotla</p>
                  <p className="text-xs text-gray-400">All community members welcome</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/20 pt-8">
          <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <p className="text-gray-300 mb-2">
              &copy; 2025 <span className="font-semibold text-white">Bosele Kgotla Village Development Committee</span>
            </p>
            <p className="text-gray-300 text-sm">
              Serving our community with pride and dedication
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-green-200 text-sm">
              <Heart className="w-4 h-4" />
              <span>Working together for a better tomorrow • Gantsi District, Botswana</span>
              <Heart className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-green-400/20 to-green-500/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-r from-green-500/20 to-green-600/30 rounded-full blur-xl"></div>
      </div>
    </footer>
  )
}
