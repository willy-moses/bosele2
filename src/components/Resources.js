'use client'

import { ClipboardList, BarChart3, FileText, BookOpen, Download, Eye, FileDown, BookMarked, X } from 'lucide-react'
import { useState } from 'react'

export default function Resources() {
  const [showGuidelines, setShowGuidelines] = useState(false)
  const [showMinutes, setShowMinutes] = useState(false)
  const [showReports, setShowReports] = useState(false)
  const [showForms, setShowForms] = useState(false)

  // Sample data - replace with actual data from your backend
  const meetingMinutes = [
    { id: 1, title: 'Kgotla Meeting - January 2026', date: '2026-01-04', file: '/documents/minutes-jan-2026.pdf' },
    { id: 2, title: 'Kgotla Meeting - December 2025', date: '2025-12-07', file: '/documents/minutes-dec-2025.pdf' },
    { id: 3, title: 'Kgotla Meeting - November 2025', date: '2025-11-02', file: '/documents/minutes-nov-2025.pdf' },
    { id: 4, title: 'Kgotla Meeting - October 2025', date: '2025-10-05', file: '/documents/minutes-oct-2025.pdf' },
  ]

  const projectReports = [
    { id: 1, title: 'Ghanzi Blocks 1-6 Land Servicing Progress Report', date: '2025-12-15', file: '/documents/land-servicing-report.pdf', status: 'In Progress' },
    { id: 2, title: 'Youth Community Hub Development Report', date: '2025-12-10', file: '/documents/youth-hub-report.pdf', status: 'Planning' },
    { id: 3, title: 'Capstone Road Installation Project Report', date: '2025-11-20', file: '/documents/capstone-report.pdf', status: 'Upcoming' },
    { id: 4, title: 'Day Care Center Annual Report 2025', date: '2025-11-01', file: '/documents/daycare-report-2025.pdf', status: 'Completed' },
  ]

  const applicationForms = [
    { id: 1, title: 'Day Care Center Registration Form', description: 'Register your child at Bosele Day Care Center', file: '/forms/daycare-registration.pdf' },
    { id: 2, title: 'Community Assistance Application', description: 'Apply for community support and assistance', file: '/forms/community-assistance.pdf' },
    { id: 3, title: 'Project Proposal Template', description: 'Submit proposals for community projects', file: '/forms/project-proposal.pdf' },
    { id: 4, title: 'Youth Program Enrollment Form', description: 'Enroll in youth development programs', file: '/forms/youth-enrollment.pdf' },
    { id: 5, title: 'Complaint/Suggestion Form', description: 'Submit complaints or suggestions to the committee', file: '/forms/complaint-form.pdf' },
  ]

  const handleDownload = (filePath, fileName) => {
    // In production, this would trigger an actual file download
    // For now, it will show an alert
    alert(`Downloading: ${fileName}\n\nNote: In production, this will download from: ${filePath}`)
    
    // Actual download code (uncomment when files are available):
    // const link = document.createElement('a')
    // link.href = filePath
    // link.download = fileName
    // document.body.appendChild(link)
    // link.click()
    // document.body.removeChild(link)
  }

  const resources = [
    {
      icon: ClipboardList,
      title: 'Meeting Minutes',
      description: 'Access minutes from recent kgotla meetings and committee discussions.',
      buttonText: 'Download Minutes',
      buttonIcon: Download,
      gradient: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      onClick: () => setShowMinutes(true)
    },
    {
      icon: BarChart3,
      title: 'Project Reports',
      description: 'Detailed reports on completed and ongoing community development projects.',
      buttonText: 'View Reports',
      buttonIcon: Eye,
      gradient: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50',
      onClick: () => setShowReports(true)
    },
    {
      icon: FileText,
      title: 'Application Forms',
      description: 'Forms for community assistance, project proposals, and various services.',
      buttonText: 'Get Forms',
      buttonIcon: FileDown,
      gradient: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50',
      onClick: () => setShowForms(true)
    },
    {
      icon: BookOpen,
      title: 'Community Guidelines',
      description: 'Rules and guidelines for community participation and kgotla proceedings.',
      buttonText: 'Read Guidelines',
      buttonIcon: BookMarked,
      gradient: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      onClick: () => setShowGuidelines(true)
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Upcoming': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <section id="resources" className="py-20 px-4 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Community Resources</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-blue-600 mx-auto rounded-full"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Access important documents, reports, and guidelines to stay informed and engaged with our community initiatives.
          </p>
        </div>

        {/* Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource, index) => {
            const IconComponent = resource.icon
            const ButtonIcon = resource.buttonIcon

            return (
              <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                {/* Icon Header */}
                <div className={`bg-gradient-to-r ${resource.gradient} p-8 text-center relative`}>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <IconComponent className="w-12 h-12 mx-auto text-white drop-shadow-lg mb-3" />
                  <h4 className="font-bold text-xl text-white">{resource.title}</h4>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6 leading-relaxed text-sm">{resource.description}</p>
                  <button 
                    onClick={resource.onClick}
                    className={`w-full bg-gradient-to-r ${resource.gradient} text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2`}>
                    <ButtonIcon className="w-4 h-4" />
                    {resource.buttonText}
                  </button>
                </div>

                {/* Bottom accent */}
                <div className={`h-1 bg-gradient-to-r ${resource.gradient}`}></div>
              </div>
            )
          })}
        </div>

        {/* Meeting Minutes Modal */}
        {showMinutes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowMinutes(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white relative">
                <button 
                  onClick={() => setShowMinutes(false)}
                  className="absolute top-4 right-4 hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Meeting Minutes</h3>
                </div>
              </div>

              <div className="p-8">
                <p className="text-gray-600 mb-6">Download minutes from recent kgotla meetings and committee discussions.</p>
                <div className="space-y-4">
                  {meetingMinutes.map((minute) => (
                    <div key={minute.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                      <div>
                        <h4 className="font-semibold text-slate-800">{minute.title}</h4>
                        <p className="text-sm text-gray-600">{minute.date}</p>
                      </div>
                      <button 
                        onClick={() => handleDownload(minute.file, minute.title)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Project Reports Modal */}
        {showReports && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowReports(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white relative">
                <button 
                  onClick={() => setShowReports(false)}
                  className="absolute top-4 right-4 hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Project Reports</h3>
                </div>
              </div>

              <div className="p-8">
                <p className="text-gray-600 mb-6">View detailed reports on completed and ongoing community development projects.</p>
                <div className="space-y-4">
                  {projectReports.map((report) => (
                    <div key={report.id} className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-slate-800 flex-1">{report.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{report.date}</p>
                      <button 
                        onClick={() => handleDownload(report.file, report.title)}
                        className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Report
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Application Forms Modal */}
        {showForms && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowForms(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-6 text-white relative">
                <button 
                  onClick={() => setShowForms(false)}
                  className="absolute top-4 right-4 hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Application Forms</h3>
                </div>
              </div>

              <div className="p-8">
                <p className="text-gray-600 mb-6">Download forms for community assistance, project proposals, and various services.</p>
                <div className="space-y-4">
                  {applicationForms.map((form) => (
                    <div key={form.id} className="p-4 bg-purple-50 rounded-lg border border-purple-100 hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-slate-800 mb-1">{form.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{form.description}</p>
                      <button 
                        onClick={() => handleDownload(form.file, form.title)}
                        className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                      >
                        <FileDown className="w-4 h-4" />
                        Download Form
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guidelines Modal */}
        {showGuidelines && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowGuidelines(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white relative">
                <button 
                  onClick={() => setShowGuidelines(false)}
                  className="absolute top-4 right-4 hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Kgotla Meeting Guidelines</h3>
                </div>
              </div>

              <div className="p-8">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  These guidelines ensure respectful and productive kgotla meetings for all community members. Please familiarize yourself with these rules before attending.
                </p>

                <div className="space-y-6">
                  {[
                    { title: 'Dress Code - Women', text: 'Women should not wear trousers at kgotla during meetings. Traditional and respectful attire is expected.' },
                    { title: 'Dress Code - Men', text: 'Men should not wear hats during kgotla meetings as a sign of respect.' },
                    { title: 'Sobriety Requirement', text: 'People should not attend kgotla meetings if they are under the influence of alcohol. Sobriety is essential for meaningful participation.' },
                    { title: 'No Fighting or Scandals', text: 'Fighting and scandalous behavior are not tolerated at kgotla meetings. Maintain peace and dignity at all times.' },
                    { title: 'Respectful Participation', text: 'People are expected to remain quiet and listen attentively. When contributing, argue in a respectful and polite manner. All voices should be heard with dignity.' }
                  ].map((guideline, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 mb-2">{guideline.title}</h4>
                        <p className="text-gray-600 leading-relaxed">{guideline.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>Please note:</strong> These guidelines help maintain the dignity and effectiveness of our kgotla meetings. Your cooperation ensures a productive environment for all community members.
                  </p>
                </div>

                <div className="mt-6 text-center">
                  <button 
                    onClick={() => setShowGuidelines(false)}
                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    I Understand
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 border-t-4 border-emerald-500">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Need Help Finding Something?</h3>
            <p className="text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto">
              Can&apos;t find the resource you&apos;re looking for? Contact our community office for assistance or additional information about available services and documents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Request Document
              </button>
              <button className="border-2 border-emerald-500 text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                Contact Office
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { number: '50+', label: 'Documents Available' },
            { number: '12', label: 'Active Projects' },
            { number: '200+', label: 'Downloads This Month' },
            { number: '24/7', label: 'Online Access' }
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