import { GraduationCap, Users, Sprout, Heart, Lightbulb, Shield } from 'lucide-react'

export default function About() {
  const features = [
    {
      icon: GraduationCap,
      title: 'Our Mission',
      description: 'To foster sustainable community development through participatory decision-making, preserving our cultural heritage while embracing progress for the betterment of all residents in our village.',
      gradient: 'from-emerald-500 to-green-600'
    },
    {
      icon: Users,
      title: 'Community Unity',
      description: 'We bring together community members from all walks of life to work collaboratively on projects that address local needs and improve our quality of life.',
      gradient: 'from-teal-500 to-emerald-600'
    },
    {
      icon: Sprout,
      title: 'Sustainable Development',
      description: 'Our initiatives focus on long-term sustainability, ensuring that development projects benefit current and future generations while respecting our environment.',
      gradient: 'from-green-500 to-teal-600'
    }
  ]

  const values = [
    {
      icon: Heart,
      name: 'Botho',
      description: 'Humanity and respect for all'
    },
    {
      icon: Lightbulb,
      name: 'Innovation',
      description: 'Creative solutions for progress'
    },
    {
      icon: Users,
      name: 'Teamwork',
      description: 'Together we achieve more'
    },
    {
      icon: GraduationCap,
      name: 'Excellence',
      description: 'Striving for the highest standards'
    },
    {
      icon: Shield,
      name: 'Integrity',
      description: 'Honesty in all we do'
    }
  ]

  return (
    <section id="about" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-green-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-800 mb-4">
            About Bosele Kgotla VDC
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-600 mx-auto rounded-full"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Building stronger communities through collaboration, sustainability, and shared vision for the future.
          </p>
          {/* Motto */}
          <div className="mt-8">
            <p className="text-2xl md:text-3xl font-semibold text-emerald-700 italic">
              "Equality for All, Progress for Bosele"
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                {/* Icon Header with Gradient */}
                <div className={`bg-gradient-to-r ${feature.gradient} p-8 text-center relative`}>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <IconComponent className="w-16 h-16 mx-auto text-white drop-shadow-lg" />
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-emerald-800 mb-4 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-center">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom accent */}
                <div className={`h-1 bg-gradient-to-r ${feature.gradient}`}></div>
              </div>
            )
          })}
        </div>

        {/* Our Values Section */}
        <div className="mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-2 text-center">
            Our Core Values
          </h3>
          <p className="text-center text-gray-600 mb-8">
            The principles that guide our work and community engagement
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-center group hover:-translate-y-1"
                >
                  <div className="bg-gradient-to-br from-emerald-100 to-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-emerald-200 group-hover:to-green-200 transition-all duration-300">
                    <IconComponent className="w-8 h-8 text-emerald-700" />
                  </div>
                  <h4 className="font-bold text-emerald-800 text-lg mb-2">
                    {value.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {value.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto border-t-4 border-emerald-500">
            <h3 className="text-2xl font-bold text-emerald-800 mb-4">
              Join Our Community Initiative
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Together, we can create lasting positive change in our village. Your voice matters in shaping our community&apos;s future.
            </p>
            <button className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-full font-semibold hover:from-emerald-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Get Involved
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}