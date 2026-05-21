import { Building2, Cross, GraduationCap, Droplets, Zap, Bus, Phone, Wheat } from 'lucide-react'

export default function QuickLinks() {
  const quickLinks = [
    { icon: Building2, title: 'Government Services', href: 'https://www.gov.bw/node/262', gradient: 'from-blue-500 to-indigo-600', bgColor: 'bg-blue-50' },
    { icon: Cross, title: 'Health Clinic', href: 'https://www.gov.bw/information-services', gradient: 'from-red-500 to-rose-600', bgColor: 'bg-red-50' },
    { icon: GraduationCap, title: 'Primary School', href: 'https://www.gov.bw/information-services', gradient: 'from-purple-500 to-violet-600', bgColor: 'bg-purple-50' },
    { icon: Droplets, title: 'Water Issues', href: 'https://www.wuc.bw', gradient: 'from-cyan-500 to-blue-600', bgColor: 'bg-cyan-50' },
    { icon: Zap, title: 'Electricity', href: 'https://www.bpc.bw', gradient: 'from-yellow-500 to-orange-600', bgColor: 'bg-yellow-50' },
    { icon: Bus, title: 'Transport', href: 'https://www.gov.bw/index.php/eservices', gradient: 'from-green-500 to-emerald-600', bgColor: 'bg-green-50' },
    { icon: Phone, title: 'Emergency', href: 'https://www.gov.bw/local-authorities-view', gradient: 'from-red-600 to-red-700', bgColor: 'bg-red-50' },
    { icon: Wheat, title: 'Agriculture', href: 'https://www.gov.bw/index.php/eservices', gradient: 'from-amber-500 to-yellow-600', bgColor: 'bg-amber-50' }
  ]

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Quick Links</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-blue-600 mx-auto rounded-full"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Quick access to essential community services and resources in Gantsi. Click on any service below to get started.
          </p>
        </div>

        {/* Quick Links Grid */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4 border-emerald-500">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
            {quickLinks.map((link, index) => {
              const IconComponent = link.icon
              return (
                
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Access ${link.title} services`}
                  className="group flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-gradient-to-br hover:from-white hover:to-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-xl transform"
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${link.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white drop-shadow-sm" />
                  </div>
                  <span className="text-sm text-center font-semibold text-slate-700 group-hover:text-slate-800 leading-tight">
                    {link.title}
                  </span>
                </a>
              )
            })}
          </div>
        </div>

        {/* Additional Help Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-500">
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-3">Can&apos;t Find What You&apos;re Looking For?</h3>
            <p className="text-gray-600 mb-4 text-sm max-w-2xl mx-auto">
              Visit the local Ghanzi District Council office or contact the service desks directly for help.
            </p>
            <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 mx-auto">
              <Phone className="w-4 h-4" />
              Call (+267) 6596211
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { number: '8', label: 'Essential Services' },
            { number: '24/7', label: 'Emergency Support' },
            { number: '500+', label: 'Monthly Users' },
            { number: '5min', label: 'Average Response' }
          ].map((stat, index) => (
            <div key={index} className="text-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-2xl font-bold text-emerald-600 mb-1">{stat.number}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
