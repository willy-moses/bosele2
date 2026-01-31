'use client'
import { useState } from 'react'
import { Plus, Minus, HelpCircle } from 'lucide-react'

export default function FAQ() {
  const [openItem, setOpenItem] = useState(null)

  const faqItems = [
    {
      question: 'How can I get involved in community projects?',
      answer: 'Attend our monthly kgotla meetings either from 11ᵗʰ to 15ᵗʰ of each month. You can also contact any committee member to express your interest in volunteering for specific projects or initiatives.',
      category: 'Participation'
    },
    {
      question: 'How are projects funded in our community?',
      answer: 'Projects are funded through a combination of government grants, NGO partnerships, community contributions, and fundraising activities. All financial decisions are made transparently through kgotla consensus.',
      category: 'Funding'
    },
    {
      question: 'What is the role of traditional leadership in development?',
      answer: 'Traditional leadership works alongside elected committee members to ensure development respects our cultural values and follows proper consultation processes through the kgotla system.',
      category: 'Leadership'
    },
    {
      question: 'How can I report community issues or concerns?',
      answer: 'Issues can be raised during kgotla meetings, reported to any committee member, or brought to the attention of the village headman. We encourage open communication and community participation.',
      category: 'Communication'
    },
    {
      question: 'Are committee meetings open to all community members?',
      answer: 'Yes, all kgotla meetings are open to community members. We encourage active participation in discussions and decision-making processes that affect our village.',
      category: 'Participation'
    },
    {
      question: 'What development projects are currently active?',
      answer: 'Current projects include Construction of Cultural Village , Youth Community Innovation Hub , and Cummunity Garden. Visit our projects section for detailed updates.',
      category: 'Projects'
    }
  ]

  const toggleItem = (index) => setOpenItem(openItem === index ? null : index)

  const getCategoryColor = (category) => {
    const colors = {
      'Participation': 'bg-blue-100 text-blue-800',
      'Funding': 'bg-green-100 text-green-800',
      'Leadership': 'bg-purple-100 text-purple-800',
      'Communication': 'bg-orange-100 text-orange-800',
      'Projects': 'bg-teal-100 text-teal-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <section id="faq" className="py-20 px-4 bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Frequently Asked Questions
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-600 mx-auto rounded-full"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions about our community development committee, meetings, and how to get involved.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
              <button
                onClick={() => toggleItem(index)}
                className="w-full flex justify-between items-start p-6 text-left hover:bg-gray-50 transition-colors"
                aria-expanded={openItem === index}
                aria-controls={`faq-content-${index}`}
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </div>
                  <span className="font-bold text-slate-800 text-lg leading-tight transition-colors">
                    {item.question}
                  </span>
                </div>
                <div className="flex-shrink-0 ml-4">
                  {openItem === index ? (
                    <Minus className="w-6 h-6 text-emerald-600 transition-transform duration-300" />
                  ) : (
                    <Plus className="w-6 h-6 text-emerald-600 transition-transform duration-300" />
                  )}
                </div>
              </button>

              <div
                id={`faq-content-${index}`}
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  openItem === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-6">
                  <div className="w-full h-px bg-gradient-to-r from-emerald-200 to-green-200 mb-4"></div>
                  <p className="text-gray-600 leading-relaxed text-base">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 border-t-4 border-emerald-500">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Still Have Questions?
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto">
              Can&apos;t find the answer you&apos;re looking for? Our committee members are here to help. Reach out to us directly or attend our next community meeting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Contact Committee
              </button>
              <button className="border-2 border-emerald-500 text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-500 hover:text-white transition-all duration-300">
                Join Next Meeting
              </button>
            </div>
          </div>
        </div>

        {/* Meeting Info */}
        <div className="mt-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="text-center">
            <h4 className="text-xl font-bold mb-2">Next Kgotla Meeting</h4>
            <p className="opacity-90 mb-2">Ranges from 11ᵗʰ to 15ᵗʰ  of every month at 10:00 AM</p>
            <p className="text-sm opacity-75">Community Hall - All residents welcome</p>
          </div>
        </div>
      </div>
    </section>
  )
}
