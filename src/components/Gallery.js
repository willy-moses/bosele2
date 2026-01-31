'use client'

import Image from 'next/image'

export default function Gallery() {
  const galleryItems = [
   
    {
      src: '/images/garden.webp',
      alt: 'Community Garden',
      title: 'Community Garden',
      description: 'Fresh vegetables for all'
    },
    {
      src: '/images/dropout.webp',
      alt: 'Street Children Rescue Education',
      title: 'Hope Restored',
      description: 'Reaching forgotten children who never had the chance to go to school'
    },
    {
      src: '/images/culture1.webp',
      alt: 'Bosele Cultural Village',
      title: 'Bosele Kgotla Heritage',
      description: 'Preserving traditional Setswana culture and architecture'
    },
    {
      src: '/images/culture2.webp',
      alt: 'Traditional Setswana Architecture',
      title: 'Living History',
      description: 'Experience authentic traditional life with community guides at Bosele'
    }
  ]

  // Tiny base64 blur placeholder for faster perceived loading
  const blurPlaceholder =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='

  return (
    <section id="gallery" className="py-20 px-4 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Community in Action</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-emerald-600 mx-auto rounded-full"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Witness the vibrant life of our community through moments of growth, culture, and togetherness.
          </p>
        </div>

        {/* Gallery Grid - Now 3 columns for larger images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryItems.map((item, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
            >
              {/* Larger Image Container */}
              <div className="relative aspect-[4/3] w-full bg-slate-100">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-contain transition-transform duration-700 group-hover:scale-105"
                  placeholder="blur"
                  blurDataURL={blurPlaceholder}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={index < 3} // Load first three images faster
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                
                {/* Text Content - Always visible but enhanced on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h4 className="font-bold text-xl mb-2 transform group-hover:translate-y-0 transition-transform duration-300">
                    {item.title}
                  </h4>
                  <p className="text-sm opacity-90 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Decorative corner accent */}
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6 text-lg">
            Want to be part of these moments? Join us in making a difference!
          </p>
          <button className="bg-gradient-to-r from-blue-500 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
            Get Involved
          </button>
        </div>
      </div>
    </section>
  )
}