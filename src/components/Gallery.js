'use client'

import Image from 'next/image'

export default function Gallery() {
  const galleryItems = [
    {
      src: '/images/kgotla.webp',
      alt: 'Kgotla Meeting',
      title: 'Kgotla Meeting',
      description: 'Community discussing water project'
    },
    {
      src: '/images/youthtwo.webp',
      alt: 'Youth Training',
      title: 'Skills Training',
      description: 'Youth learning new skills'
    },
    {
      src: '/images/health.webp',
      alt: 'Health Day',
      title: 'Health Screening',
      description: 'Community health initiative'
    },
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
    <section id="gallery" className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-600">
          Community in Action
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {galleryItems.map((item, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="relative h-48">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  placeholder="blur"
                  blurDataURL={blurPlaceholder}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  priority={index < 2} // Load first two images faster
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h4 className="font-bold mb-1">{item.title}</h4>
                  <p className="text-sm opacity-90">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
