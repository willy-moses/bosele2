'use client'
import { useState, useEffect, useMemo } from 'react'
import { RefreshCw, MapPin, Users, Filter, X, Briefcase, Phone,FileDown } from 'lucide-react'

const STATUS_META = {
  waiting:     { label: 'Waiting',     color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  hired:       { label: 'Hired',       color: 'bg-green-100  text-green-800  border-green-200'  },
  unavailable: { label: 'Unavailable', color: 'bg-gray-100   text-gray-600   border-gray-200'   },
}

const SKILLS_OPTIONS = [
  'General Labour', 'Cleaning', 'Gardening', 'Construction', 'Painting',
  'Carpentry', 'Plumbing', 'Electrical', 'Driving', 'Security',
  'Cooking', 'Childcare', 'Farming', 'Other'
]

export default function CasualLabourManagement() {
  const [workers,       setWorkers]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [showForm,      setShowForm]      = useState(false)
  const [editingId,     setEditingId]     = useState(null)
  const [statusFilter,  setStatusFilter]  = useState('all')
  const [villageFilter, setVillageFilter] = useState('all')
  const [exporting, setExporting] = useState(false)
  const [searchTerm,    setSearch]        = useState('')

  const [form, setForm] = useState({
    fullName: '', idNumber: '', gender: '', age: '',
    villageTown: '', phone: '', skills: '', notes: '', status: 'waiting'
  })

  useEffect(() => { fetchWorkers() }, [])

  const fetchWorkers = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/casual-labour')
      const data = await res.json()
      setWorkers(data.workers || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleExportPdf = async () => {
  if (filtered.length === 0) return
  setExporting(true)
  try {
    const res = await fetch('/api/casual-labour/export-pdf', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ workers: filtered })
    })
    if (!res.ok) {
      const err = await res.json()
      alert(err.error || 'Failed to export')
      return
    }
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `casual-labour-waitlist-${new Date().toISOString().split('T')[0]}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (e) {
    alert('Export failed')
  } finally { setExporting(false) }
}

  const villages = useMemo(() => {
    const set = new Set(workers.map(w => w.village_town?.trim()).filter(Boolean))
    return Array.from(set).sort()
  }, [workers])

  const filtered = useMemo(() => {
    return workers.filter(w => {
      const matchStatus  = statusFilter  === 'all' || w.status === statusFilter
      const matchVillage = villageFilter === 'all' || w.village_town?.trim() === villageFilter
      const q            = searchTerm.toLowerCase()
      const matchSearch  = !q ||
        w.full_name?.toLowerCase().includes(q) ||
        w.skills?.toLowerCase().includes(q) ||
        w.village_town?.toLowerCase().includes(q) ||
        w.phone?.includes(q)
      return matchStatus && matchVillage && matchSearch
    })
  }, [workers, statusFilter, villageFilter, searchTerm])

  const stats = useMemo(() => ({
    total:       workers.length,
    waiting:     workers.filter(w => w.status === 'waiting').length,
    hired:       workers.filter(w => w.status === 'hired').length,
    unavailable: workers.filter(w => w.status === 'unavailable').length,
  }), [workers])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/casual-labour', {
        method:  editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(editingId ? { id: editingId, ...form } : form)
      })
      const result = await res.json()
      if (!res.ok) { alert(result.error || 'Failed to save'); return }
      await fetchWorkers()
      resetForm()
    } catch (e) { alert('An error occurred') }
  }

  const handleEdit = (w) => {
    setForm({
      fullName:    w.full_name    || '',
      idNumber:    w.id_number    || '',
      gender:      w.gender       || '',
      age:         w.age?.toString() || '',
      villageTown: w.village_town || '',
      phone:       w.phone        || '',
      skills:      w.skills       || '',
      notes:       w.notes        || '',
      status:      w.status       || 'waiting',
    })
    setEditingId(w.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this person from the waitlist?')) return
    await fetch(`/api/casual-labour?id=${id}`, { method: 'DELETE' })
    await fetchWorkers()
  }

  const handleStatusChange = async (id, status) => {
    const worker = workers.find(w => w.id === id)
    if (!worker) return
    await fetch('/api/casual-labour', {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        id,
        fullName:    worker.full_name,
        idNumber:    worker.id_number,
        gender:      worker.gender,
        age:         worker.age,
        villageTown: worker.village_town,
        phone:       worker.phone,
        skills:      worker.skills,
        notes:       worker.notes,
        status,
      })
    })
    await fetchWorkers()
  }

  const resetForm = () => {
    setForm({ fullName:'', idNumber:'', gender:'', age:'', villageTown:'', phone:'', skills:'', notes:'', status:'waiting' })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-emerald-600" />Casual Labour Waitlist
          </h2>
          <p className="text-gray-600 mt-1">Community members available for casual work at the Kgotla</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchWorkers}
            className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={handleExportPdf} disabled={exporting || filtered.length === 0}
  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
  {exporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
  {exporting ? 'Exporting…' : 'Export PDF'}
</button>
          <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm() }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold">
            {showForm ? 'Cancel' : '+ Add Person'}
          </button>
          
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:'Total',       value: stats.total,       color:'text-gray-800',   bg:'bg-white        border-gray-200'   },
          { label:'Waiting',     value: stats.waiting,     color:'text-yellow-700', bg:'bg-yellow-50    border-yellow-200' },
          { label:'Hired',       value: stats.hired,       color:'text-green-700',  bg:'bg-green-50     border-green-200'  },
          { label:'Unavailable', value: stats.unavailable, color:'text-gray-500',   bg:'bg-gray-50      border-gray-200'   },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl border p-4 shadow-sm ${bg}`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-black ${color} mt-0.5`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-emerald-500">
          <h3 className="text-lg font-bold mb-4 text-gray-900">
            {editingId ? 'Edit Person' : 'Add to Waitlist'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name *</label>
                <input type="text" required value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Enter full name" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">ID Number / Omang</label>
                <input type="text" value={form.idNumber}
                  onChange={e => setForm(f => ({ ...f, idNumber: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="National ID number" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Gender</label>
                <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Age</label>
                <input type="number" min="1" max="100" value={form.age}
                  onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="e.g. 35" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Village / Town</label>
                <input type="text" value={form.villageTown}
                  onChange={e => setForm(f => ({ ...f, villageTown: e.target.value }))}
                  list="village-suggestions-labour"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="e.g. Gaborone, Maun..." />
                <datalist id="village-suggestions-labour">
                  {villages.map(v => <option key={v} value={v} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone Number</label>
                <input type="tel" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="e.g. 71234567" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Skills / Type of Work</label>
                <input type="text" value={form.skills}
                  onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                  list="skills-suggestions"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="e.g. General Labour, Cleaning..." />
                <datalist id="skills-suggestions">
                  {SKILLS_OPTIONS.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>

              {editingId && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                    <option value="waiting">Waiting</option>
                    <option value="hired">Hired</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              )}

              <div className={editingId ? '' : 'md:col-span-2'}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</label>
                <input type="text" value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Any additional notes..." />
              </div>

            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition">Cancel</button>
              <button type="submit"
                className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition">
                {editingId ? 'Update' : 'Add to Waitlist'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="text-sm font-semibold text-gray-600 mr-1">Status:</span>
          {['all', 'waiting', 'hired', 'unavailable'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {s === 'all' ? `All (${stats.total})` : `${STATUS_META[s].label} (${stats[s]})`}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="text-sm font-semibold text-gray-600 mr-1">Village:</span>
          <button onClick={() => setVillageFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              villageFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>All</button>
          {villages.map(v => (
            <button key={v} onClick={() => setVillageFilter(v)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                villageFilter === v ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>{v}</button>
          ))}
        </div>

        <div className="relative">
          <input type="text" placeholder="Search by name, skill, village or phone…"
            value={searchTerm} onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          {searchTerm && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No people found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or add someone new</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['#','Name','Age','Gender','Village / Town','Phone','Skills','Status','Actions'].map(h => (
                    <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((w, idx) => {
                  const meta = STATUS_META[w.status] ?? STATUS_META.waiting
                  return (
                    <tr key={w.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 text-gray-400 text-xs">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900">{w.full_name}</p>
                        {w.id_number && <p className="text-xs text-gray-400 font-mono">{w.id_number}</p>}
                        {w.notes && <p className="text-xs text-gray-400 italic mt-0.5">{w.notes}</p>}
                      </td>
                      <td className="py-3 px-4 text-gray-500">{w.age || '—'}</td>
                      <td className="py-3 px-4 text-gray-500">{w.gender || '—'}</td>
                      <td className="py-3 px-4">
                        {w.village_town ? (
                          <button onClick={() => setVillageFilter(w.village_town.trim())}
                            className="inline-flex items-center gap-1 text-emerald-700 hover:underline text-xs">
                            <MapPin className="h-3 w-3" />{w.village_town}
                          </button>
                        ) : '—'}
                      </td>
                      <td className="py-3 px-4">
                        {w.phone ? (
                          <a href={`tel:${w.phone}`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs">
                            <Phone className="h-3 w-3" />{w.phone}
                          </a>
                        ) : '—'}
                      </td>
                      <td className="py-3 px-4">
                        {w.skills ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                            <Briefcase className="h-3 w-3" />{w.skills}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <select value={w.status}
                          onChange={e => handleStatusChange(w.id, e.target.value)}
                          className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer ${meta.color}`}>
                          <option value="waiting">Waiting</option>
                          <option value="hired">Hired</option>
                          <option value="unavailable">Unavailable</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(w)}
                            className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold">Edit</button>
                          <button onClick={() => handleDelete(w.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold">Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
              Showing {filtered.length} of {workers.length} people
            </div>
          </div>
        )}
      </div>

    </div>
  )
}