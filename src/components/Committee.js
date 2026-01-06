"use client"

import { useState } from "react"
import Image from "next/image"

export default function Committee() {
  const [imageErrors, setImageErrors] = useState({})
  const [imageLoading, setImageLoading] = useState({})

  const members = [
    {
      name: "Mr. Komberes Monyatse",
      position: "Chairperson",
      initials: "KM",
      image: "/images/komberes-monyatse.jpg",
      description:
        "Leading committee meetings and community initiatives. Experienced community leader with over 10 years of service."
    },
    {
      name: "Miss. Sandy Botshake",
      position: "Vice Chairperson",
      initials: "SB",
      image: "/images/sandy-botshake.jpg",
      description:
        "Supporting leadership and project coordination. Active in women's development programs and youth mentorship."
    },
    {
      name: "Mrs. Violet Onny Kaome",
      position: "Secretary",
      initials: "VK",
      image: "/images/violet-kaome.jpg",
      description:
        "Managing records and correspondence. Handles all committee documentation and communication with government officials."
    },
    {
  name: "Mrs. Onneile Lodic Stoffel",
  position: "Vice Secretary",
  initials: "OS",
  image: "/images/onneile-stoffel2.jpg",  // this is correct
  description:
    "Managing records and correspondence. Handles all committee documentation and communication with government officials."
},
{
  name: "Mrs. Kebashebile Mbinda Mangate",
  position: "Treasurer",
  initials: "KB",
  image: "/images/kebashebile-mangate2.jpg", // fixed here
  description:
    "Financial management and budget oversight. Ensures transparent handling of committee funds and project finances."
},

    {
      name: "Mr. Tiro Sylvester Ramontsho",
      position: "Additional Member",
      initials: "TR",
      image: "/images/tiro-ramontsho.jpg",
      description:
        "Social Entrepreneurship. Youth Community Mobiliser, Youth Led Advocate. Community engagement."
    },
    {
      name: "Ms. Vetondaje Mbaeva",
      position: "Additional Member",
      initials: "VM",
      image: "/images/vetondaje-mbaeva.jpg",
      description: "Women Empowerment Led initiatives."
    },
    {
      name: "Miss Dinah Molale",
      position: "Additional Member",
      initials: "DM",
      image: "/images/dinah-molale.jpg",
      description: "Molapo Wing Representation ."
    },
    {
      name: "Miss Molapo Golekwang",
      position: "Additional Member",
      initials: "GM",
      image: "/images/golekwang-molapong.jpg",
      description: "Elderly Sapport."
    },
    {
      name: "Mrs. Doreen Ngakaemang",
      position: "Social Worker",
      initials: "DN",
      image: "/images/social-worker.jpg",
      description:
        "Community social welfare programs and support services. Assists families and individuals with social challenges and connects them to resources."
    },
    {
      name: "Mr. Pontsho Ditshwene",
      position: "Village Councillor",
      initials: "VC",
      image: "/images/village-councillor.jpg",
      description:
        "Government liaison and community representation. Serves as the official link between the village and district administration."
    }
  ]

  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }))
    setImageLoading((prev) => ({ ...prev, [index]: false }))
  }

  const handleImageLoad = (index) => {
    setImageLoading((prev) => ({ ...prev, [index]: false }))
  }

  return (
    <section id="committee" className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-green-700 bg-clip-text text-transparent">
          Committee Members
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member, index) => {
            if (imageLoading[index] === undefined) {
              setImageLoading((prev) => ({ ...prev, [index]: true }))
            }

            return (
              <div
                key={`${member.name}-${index}`}
                aria-label={`Committee member ${member.name}`}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-start mb-4">
                  <div className="relative w-28 h-28 md:w-32 md:h-32 mr-4 flex-shrink-0">
                    {!imageErrors[index] ? (
                      <>
                        {imageLoading[index] && (
                          <div className="absolute inset-0 rounded-full bg-gray-200 animate-pulse z-10 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}

                        <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-blue-200">
                          <Image
                            src={member.image}
                            alt={`${member.name} - ${member.position}`}
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 128px, 160px"
                            priority={index === 0}
                            className={`object-cover transition-opacity duration-500 ${
                              imageLoading[index] ? "opacity-0" : "opacity-100"
                            }`}
                            style={{ objectPosition: "center top" }}
                            onError={() => handleImageError(index)}
                            onLoadingComplete={() => handleImageLoad(index)}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-xl font-bold border-4 border-white shadow-lg ring-2 ring-blue-200">
                        {member.initials}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 font-semibold text-sm">
                      {member.position}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
