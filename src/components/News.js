import { Calendar, Users, Wrench, Clock, Droplets, Zap, Radio } from 'lucide-react';

export default function News() {
  const newsItems = [
    {
      date: 'August 2025',
      title: 'Community Water Project Update - Ghanzi Blocks 1-6 Land Servicing',
      content: 'Major infrastructure development is underway for Bosele, Morama, Kgapamadi South, Khurakhura, and Meriting areas. The comprehensive land servicing project, scheduled for completion in September 2026, includes construction of 36 km of bituminous roads with drainage systems, installation of 40 km of water reticulation network, implementation of a 43.8 km vacuum sewer system with wastewater treatment facility, and electrical, mechanical, and telecommunications civil works. Community members are requested to attend the next kgotla meeting for detailed updates on progress and timelines.',
      category: 'Infrastructure',
      icon: <Wrench className="w-5 h-5" />,
      priority: 'high',
      highlights: [
        { icon: <Wrench className="w-4 h-4" />, text: '36 km roads & drainage' },
        { icon: <Droplets className="w-4 h-4" />, text: '40 km water network' },
        { icon: <Radio className="w-4 h-4" />, text: '43.8 km sewer system' },
        { icon: <Zap className="w-4 h-4" />, text: 'Full utilities infrastructure' }
      ]
    },
    {
      date: 'July 2025',
      title: 'Bosele Youth Community Hub Opening',
      content: 'Plans are underway to open the Bosele Youth Community Hub, a dedicated space for youth empowerment and development. The hub will provide a safe, secure, and conducive learning environment for young people. Key objectives include strengthening skills development and knowledge-sharing initiatives that promote innovation, creativity, and entrepreneurship; creating an inclusive platform for community rehabilitation where vulnerable youth can access resources and economic opportunities; enhancing collaboration with local institutions, government departments, and stakeholders in building a resilient youth community; and promoting cultural and artistic expression by providing spaces for young people to showcase their talents and preserve cultural heritage. Registration and participation details will be announced soon.',
      category: 'Community',
      icon: <Users className="w-5 h-5" />,
      priority: 'high',
      highlights: [
        { icon: <Users className="w-4 h-4" />, text: 'Safe learning environment' },
        { icon: <Wrench className="w-4 h-4" />, text: 'Skills & entrepreneurship' },
        { icon: <Calendar className="w-4 h-4" />, text: 'Resources & opportunities' },
        { icon: <Users className="w-4 h-4" />, text: 'Cultural expression space' }
      ]
    },
    {
      date: 'June 2025',
      title: 'Road Capstone Installation Project',
      content: 'A new project to install capstones (kerbs) along paved roads in Bosele is set to kick start soon. The capstones will be installed along road edges to improve drainage, road definition, and overall infrastructure quality. Community cooperation and support are appreciated as work commences.',
      category: 'Infrastructure',
      icon: <Wrench className="w-5 h-5" />,
      priority: 'medium'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-400 bg-red-50';
      case 'medium': return 'border-yellow-400 bg-yellow-50';
      case 'low': return 'border-green-400 bg-green-50';
      default: return 'border-blue-400 bg-blue-50';
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  }

  return (
    <section id="news" className="relative py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Calendar className="w-4 h-4" />
            Latest Updates
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Community
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> News</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay informed about the latest developments and important updates in our community
          </p>
        </div>

        {/* News Grid */}
        <div className="max-w-4xl mx-auto space-y-8">
          {newsItems.map((item, index) => (
            <div 
              key={index} 
              className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-l-[6px] ${getPriorityColor(item.priority)} overflow-hidden`}
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityBadge(item.priority)}`}>
                          <Clock className="w-3 h-3" />
                          {item.date}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {item.category}
                        </span>
                        {item.priority === 'high' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                            Target: Sep 2026
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">
                  {item.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed text-lg mb-4">
                  {item.content}
                </p>

                {/* Project highlights for the main infrastructure project */}
                {item.highlights && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    {item.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                          {highlight.icon}
                        </div>
                        <span className="font-medium">{highlight.text}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Read more button */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold group-hover:translate-x-1 transition-all duration-300">
                    Read more
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <Users className="w-5 h-5" />
            <span className="font-semibold">Join Community Updates</span>
          </div>
        </div>
      </div>
    </section>
  )
}