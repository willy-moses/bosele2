'use client'

const UsersIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.02 3.02 0 0016.86 6H15c-.8 0-1.54.37-2.01.96l-.94 1.21c-.22.28-.26.67-.11.98l.9 1.87L9.5 12.8c-.49.2-.8.67-.8 1.2v4c0 1.1.9 2 2 2h7c1.1 0 2-.9 2-2zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2.5 16v-7H6v-2.5c0-1.1.9-2 2-2h2c.37 0 .72.11 1.02.3l1.54-.9c.28-.16.62-.24.96-.24.96 0 1.76.71 1.93 1.64L16.5 18H15v4h-7z"/>
  </svg>
)

const HammerIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.73 14.23l-3.96-3.96-1.41 1.41 3.96 3.96c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41zM13.42 7.12l1.41-1.41 1.06 1.06c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41L15.24 3.3c-.39-.39-1.02-.39-1.41 0l-4.24 4.24-1.77-1.77c-.39-.39-1.02-.39-1.41 0s-.39 1.02 0 1.41l1.77 1.77L2.3 14.83c-.39.39-.39 1.02 0 1.41l4.24 4.24c.39.39 1.02.39 1.41 0l5.88-5.88 1.06 1.06c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41l-1.06-1.06 1.41-1.41-2.23-2.23z"/>
  </svg>
)

const WaterIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.2L7.8 6.4c-3.1 3.1-3.1 8.2 0 11.3 1.5 1.5 3.5 2.3 5.6 2.3s4.1-.8 5.6-2.3c3.1-3.1 3.1-8.2 0-11.3L12 2.2zm0 17.1c-1.4 0-2.7-.5-3.7-1.5-2-2-2-5.4 0-7.4L12 6.8l3.7 3.6c2 2 2 5.4 0 7.4-1 1-2.3 1.5-3.7 1.5z"/>
  </svg>
)

const GraduationIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
  </svg>
)

export default function Statistics() {
  const stats = [
    { icon: UsersIcon, number: '10', label: 'Community Members Served' },
    { icon: HammerIcon, number: '2', label: 'Projects Completed' },
    { icon: WaterIcon, number: '0', label: 'Water Points Installed' },
    { icon: GraduationIcon, number: '20', label: 'Students Supported' }
  ]

  return (
    <section id="statistics" className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#2c5530' }}>
          Community Impact at a Glance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="text-4xl mb-4 opacity-70" style={{ color: '#4a7c59' }}>
                  <IconComponent className="w-12 h-12 mx-auto" />
                </div>
                <div className="text-4xl font-bold mb-2" style={{ color: '#2c5530' }}>{stat.number}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
