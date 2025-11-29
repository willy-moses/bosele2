"use client"
import { useState } from 'react'
import Image from 'next/image'

export default function Committee() {
  const [imageErrors, setImageErrors] = useState({})
  const [imageLoading, setImageLoading] = useState({})

  const members = [
    {
      name: 'Mr. Komberes Monyatse',
      position: 'Chairperson',
      initials: 'KM',
      image: '/images/komberes-monyatse.jpg',
      description: 'Leading committee meetings and community initiatives. Experienced community leader with over 10 years of service.'
    },
    {
      name: 'Mrs. Sandy Botshake',
      position: 'Vice Chairperson',
      initials: 'SB',
      image: '/images/sandy-botshake.jpg',
      description: 'Supporting leadership and project coordination. Active in women\'s development programs and youth mentorship.'
    },
    {
      name: 'Mrs. Violet Onny Kaome',
      position: 'Secretary',
      initials: 'VK',
      image: '/images/violet-kaome.jpg',
      description: 'Managing records and correspondence. Handles all committee documentation and communication with government officials.'
    },
    {
      name: 'Mrs. Onneile Lodic Stoffel',
      position: 'Vice Secretary',
      initials: 'OS',
      image: '/images/onneile-stoffel2.jpg',
      description: 'Managing records and correspondence. Handles all committee documentation and communication with government officials.'
    },
    {
      name: 'Mrs. Kebashebile Mbinda Mangate',
      position: 'Treasurer',
      initials: 'KB', // Changed from KM to avoid confusion
      image: '/images/kebashebile-mangate2.jpg',
      description: 'Financial management and budget oversight. Ensures transparent handling of committee funds and project finances.'
    },
    {
      name: 'Mr. Tiro Sylvester Ramontsho',
      position: 'Additional Member',
      initials: 'TR',
      image: '/images/tiro-ramontsho.jpg',
      description: 'Social Entrepreneurship. Youth Community Mobiliser, Youth Led Advocate. Community engagement'
    },
    {
      name: 'Mrs. Vetondaje Mbaeva',
      position: 'Additional Member',
      initials: 'VM',
      image: '/images/vetondaje-mbaeva.jpg',
      description: 'Women Empowerment Led initiatives.'
    },
    {
      name: 'Mrs. Doreen Ngakaemang',
      position: 'Social Worker',
      initials: 'DN',
      image: '/images/social-worker.jpg',
      description: 'Community social welfare programs and support services. Assists families and individuals with social challenges and connects them to resources.'
    },
    {
      name: 'Mr. Pontsho Ditshwene',
      position: 'Village Councillor',
      initials: 'VC',
      image: '/images/village-councillor.jpg',
      description: 'Government liaison and community representation. Serves as the official link between the village and district administration.'
    }
  ]

  const handleImageError = (index) => {
    setImageErrors(prev => ({
      ...prev,
      [index]: true
    }))
    setImageLoading(prev => ({
      ...prev,
      [index]: false
    }))
  }

  const handleImageLoad = (index) => {
    setImageErrors(prev => ({
      ...prev,
      [index]: false
    }))
    setImageLoading(prev => ({
      ...prev,
      [index]: false
    }))
  }

  const handleImageStart = (index) => {
    setImageLoading(prev => ({
      ...prev,
      [index]: true
    }))
  }

  return (
    <section id="committee" className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-green-700 bg-clip-text text-transparent">
          Committee Members
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {members.map((member, index) => (
            <div 
              key={`${member.name}-${index}`} 
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {/* Profile Picture - Improved version */}
              <div className="flex items-start mb-4">
                <div className="w-24 h-24 mr-4 relative flex-shrink-0"> {/* Increased size for better quality */}
                  {!imageErrors[index] ? (
                    <>
                      {imageLoading[index] && (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse flex items-center justify-center z-10">
                          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      
                      {/* Using Next.js Image for better optimization */}
                      <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-blue-200">
                        <Image
                          src={member.image}
                          alt={`${member.name} - ${member.position}`}
                          fill
                          sizes="(max-width: 768px) 96px, 96px"
                          className={`object-cover transition-opacity duration-500 ${
                            imageLoading[index] ? 'opacity-0' : 'opacity-100'
                          }`}
                          quality={95} // Higher quality
                          priority={index < 4} // Prioritize first 4 images
                          onError={() => handleImageError(index)}
                          onLoad={() => handleImageLoad(index)}
                          onLoadStart={() => handleImageStart(index)}
                          style={{ 
                            objectPosition: 'center top',
                            imageRendering: 'high-quality',
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full flex items-center justify-center text-xl font-bold border-4 border-white shadow-lg ring-2 ring-blue-200">
                      {member.initials}
                    </div>
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-gray-800 break-words leading-tight mb-1">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-semibold text-sm mb-2">
                    {member.position}
                  </p>
                </div>
              </div>
              
              {/* Description */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Contact Info */}
        <div className="mt-16 text-center bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-blue-600 mb-4">Contact the Committee</h3>
            <p className="text-gray-600 mb-6 text-lg">
              For community matters, project inquiries, or to join our initiatives, reach out to any committee member.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div className="flex items-center text-gray-700 bg-gray-50 px-4 py-3 rounded-lg">
                <svg className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002-2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="font-medium">committee@community.bw</span>
              </div>
              
              <div className="flex items-center text-gray-700 bg-gray-50 px-4 py-3 rounded-lg">
                <svg className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Kgotla Grounds, Every Saturday 10 AM</span>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-4">Join our community meetings and be part of the change</p>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">Community Development</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">Youth Programs</span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">Women Empowerment</span>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">Social Enterprise</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}