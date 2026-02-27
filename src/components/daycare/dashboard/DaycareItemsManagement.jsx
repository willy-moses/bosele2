'use client'
import { useState, useEffect } from 'react'

const CATEGORIES = [
  'Classroom Supplies',
  'Toys & Play Equipment',
  'Furniture',
  'Kitchen & Catering',
  'Cleaning & Hygiene',
  'Office & Electronics',
  'Safety & First Aid',
  'Outdoor Equipment',
  'Books & Learning',
  'Other',
]

const CONDITIONS = ['New', 'Good', 'Fair', 'Poor', 'Damaged']
const STATUSES   = ['Available', 'In Use', 'Under Repair', 'Retired', 'Lost']

const emptyForm = {
  itemName:       '',
  categories:     [],
  serialNumber:   '',
  quantity:       1,
  condition:      'Good',
  status:         'Available',
  assignedTo:     '',
  location:       '',
  purchaseDate:   '',
  purchasePrice:  '',
  supplier:       '',
  warrantyExpiry: '',
  notes:          '',
}

/** Format a raw integer as "DC-0001" */
const fmtNumber = (n) => `DC-${String(n).padStart(4, '0')}`

export default function DaycareItemsManagement() {
  const [items,          setItems]          = useState([])
  const [loading,        setLoading]        = useState(true)
  const [showForm,       setShowForm]       = useState(false)
  const [form,           setForm]           = useState(emptyForm)
  const [editId,         setEditId]         = useState(null)
  const [saving,         setSaving]         = useState(false)
  const [search,         setSearch]         = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus,   setFilterStatus]   = useState('')
  const [deleteConfirm,  setDeleteConfirm]  = useState(null)
  const [viewItem,       setViewItem]       = useState(null)
  const [error,          setError]          = useState(null)
  const [exporting,      setExporting]      = useState(false)

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/daycare/items')
      const data = await res.json()
      setItems(data.items || [])
    } catch {
      setError('Failed to load items.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.categories.length === 0) {
      setError('Please select at least one category.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const method = editId ? 'PUT' : 'POST'
      const url    = editId ? `/api/daycare/items/${editId}` : '/api/daycare/items'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      await fetchItems()
      resetForm()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item) => {
    setForm({
      itemName:       item.itemName       || '',
      categories:     item.categories     || [],
      serialNumber:   item.serialNumber   || '',
      quantity:       item.quantity       ?? 1,
      condition:      item.condition      || 'Good',
      status:         item.status         || 'Available',
      assignedTo:     item.assignedTo     || '',
      location:       item.location       || '',
      purchaseDate:   item.purchaseDate   ? item.purchaseDate.slice(0, 10)   : '',
      purchasePrice:  item.purchasePrice  || '',
      supplier:       item.supplier       || '',
      warrantyExpiry: item.warrantyExpiry ? item.warrantyExpiry.slice(0, 10) : '',
      notes:          item.notes          || '',
    })
    setEditId(item.id)
    setShowForm(true)
    setViewItem(null)
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/daycare/items/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      await fetchItems()
      setDeleteConfirm(null)
      if (viewItem?.id === id) setViewItem(null)
    } catch {
      setError('Failed to delete item.')
    }
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditId(null)
    setShowForm(false)
  }

  const toggleCategory = (cat) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat],
    }))
  }

  const filtered = items.filter((item) => {
    const q = search.toLowerCase()
    const matchSearch =
      !search ||
      item.itemName?.toLowerCase().includes(q)     ||
      item.serialNumber?.toLowerCase().includes(q) ||
      item.assignedTo?.toLowerCase().includes(q)   ||
      fmtNumber(item.itemNumber).toLowerCase().includes(q) ||
      item.categories?.some(c => c.toLowerCase().includes(q))
    const matchCategory = !filterCategory || item.categories?.includes(filterCategory)
    const matchStatus   = !filterStatus   || item.status === filterStatus
    return matchSearch && matchCategory && matchStatus
  })

  const exportPdf = async () => {
    setExporting(true)
    setError(null)
    try {
      const res = await fetch('/api/daycare/items/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: filtered }),
      })
      if (!res.ok) throw new Error('Failed to generate PDF')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `daycare-items-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setExporting(false)
    }
  }

  const statusColor = (s) => ({
    'Available':    'bg-green-100 text-green-800',
    'In Use':       'bg-blue-100 text-blue-800',
    'Under Repair': 'bg-yellow-100 text-yellow-800',
    'Retired':      'bg-gray-100 text-gray-600',
    'Lost':         'bg-red-100 text-red-800',
  }[s] || 'bg-gray-100 text-gray-600')

  const conditionColor = (c) => ({
    'New':     'text-green-600',
    'Good':    'text-blue-600',
    'Fair':    'text-yellow-600',
    'Poor':    'text-orange-600',
    'Damaged': 'text-red-600',
  }[c] || 'text-gray-600')

  const stats = {
    total:     items.length,
    available: items.filter(i => i.status === 'Available').length,
    inUse:     items.filter(i => i.status === 'In Use').length,
    repair:    items.filter(i => i.status === 'Under Repair').length,
  }

  /* ─────────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 border-b-4 border-b-amber-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-amber-900">Items &amp; Tools</h2>
            <p className="text-sm text-amber-600 mt-1">Register and manage Day Care Centre equipment and supplies</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportPdf}
              disabled={exporting || filtered.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-amber-200 text-amber-700 rounded-xl hover:bg-amber-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              {exporting ? 'Exporting…' : 'Export PDF'}
            </button>
            <button
              onClick={() => { resetForm(); setShowForm(true) }}
              className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-xl font-medium transition-colors"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Register Item
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Total Items',   value: stats.total,     bg: 'from-amber-50 to-amber-100',   border: 'border-amber-200',   text: 'text-amber-900',  sub: 'text-amber-600'  },
            { label: 'Available',     value: stats.available, bg: 'from-green-50 to-green-100',   border: 'border-green-200',   text: 'text-green-900',  sub: 'text-green-600'  },
            { label: 'In Use',        value: stats.inUse,     bg: 'from-blue-50 to-blue-100',     border: 'border-blue-200',    text: 'text-blue-900',   sub: 'text-blue-600'   },
            { label: 'Under Repair',  value: stats.repair,    bg: 'from-yellow-50 to-yellow-100', border: 'border-yellow-200',  text: 'text-yellow-900', sub: 'text-yellow-600' },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.bg} rounded-xl p-4 border ${s.border}`}>
              <p className={`text-sm font-semibold ${s.sub}`}>{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.text}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-sm flex justify-between items-center">
          {error}
          <button onClick={() => setError(null)} className="font-bold ml-4 text-red-600">✕</button>
        </div>
      )}

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name, DC-number, serial, category…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-amber-400">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mb-3"></div>
            Loading items…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
            No items found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-200 text-gray-700 uppercase text-xs tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">ID No.</th>
                  <th className="text-left px-4 py-3 font-semibold">Item Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Categories</th>
                  <th className="text-left px-4 py-3 font-semibold">Serial No.</th>
                  <th className="text-left px-4 py-3 font-semibold">Qty</th>
                  <th className="text-left px-4 py-3 font-semibold">Condition</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Assigned To</th>
                  <th className="text-left px-4 py-3 font-semibold">Location</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {filtered.map((item, idx) => (
                  <tr key={item.id} className={`hover:bg-amber-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-orange-50/30'}`}>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-amber-100 text-amber-800 font-mono text-xs font-bold px-2 py-1 rounded-lg">
                        {fmtNumber(item.itemNumber)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.itemName}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(item.categories || []).map(cat => (
                          <span key={cat} className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.serialNumber || '—'}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{item.quantity}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium text-xs ${conditionColor(item.condition)}`}>{item.condition}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{item.assignedTo || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{item.location || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewItem(item)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button onClick={() => handleEdit(item)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => setDeleteConfirm(item)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Register / Edit Modal ────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-amber-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h3 className="text-lg font-bold text-amber-900">
                  {editId ? 'Edit Item' : 'Register Day Care Item / Tool'}
                </h3>
                {!editId && (
                  <p className="text-xs text-amber-500 mt-0.5">ID number (DC-XXXX) will be assigned automatically</p>
                )}
              </div>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Item Details */}
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Item Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Item Name *</label>
                  <input
                    required
                    value={form.itemName}
                    onChange={e => setForm({ ...form, itemName: e.target.value })}
                    className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g. Crayons, Plastic Chairs, First Aid Kit"
                  />
                </div>

                {/* Categories multi-select */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                    Categories * <span className="text-gray-400 normal-case font-normal">(select all that apply)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => (
                      <label
                        key={cat}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors text-sm ${
                          form.categories.includes(cat)
                            ? 'bg-amber-50 border-amber-400 text-amber-900 font-medium'
                            : 'border-gray-200 text-gray-600 hover:bg-amber-50 hover:border-amber-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-amber-500"
                          checked={form.categories.includes(cat)}
                          onChange={() => toggleCategory(cat)}
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                  {form.categories.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">Please select at least one category.</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Serial / Ref Number</label>
                  <input
                    value={form.serialNumber}
                    onChange={e => setForm({ ...form, serialNumber: e.target.value })}
                    className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g. SN-2024-001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Quantity *</label>
                  <input
                    required type="number" min={1}
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Condition</label>
                  <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}
                    className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                    {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <hr className="border-amber-100" />

              {/* Assignment */}
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Assignment &amp; Location</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Assigned To</label>
                  <input value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                    className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Staff name, classroom, or department" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Location / Storage</label>
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                    className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="e.g. Classroom A, Store Room, Office" />
                </div>
              </div>

              <hr className="border-amber-100" />

              {/* Purchase Info */}
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Purchase Info</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Purchase Date</label>
                  <input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })}
                    className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Purchase Price (BWP)</label>
                  <input type="number" step="0.01" min="0" value={form.purchasePrice}
                    onChange={e => setForm({ ...form, purchasePrice: e.target.value })}
                    className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Supplier</label>
                  <input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })}
                    className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Supplier / vendor name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Warranty Expiry</label>
                  <input type="date" value={form.warrantyExpiry} onChange={e => setForm({ ...form, warrantyExpiry: e.target.value })}
                    className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Notes</label>
                <textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  placeholder="Any additional notes…" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetForm}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 text-white rounded-xl text-sm font-medium disabled:opacity-60 transition-colors"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                  {saving ? 'Saving…' : editId ? 'Save Changes' : 'Register Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Detail Modal ────────────────────────────────────────── */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-amber-100">
              <div>
                <span className="inline-block bg-amber-100 text-amber-800 font-mono text-xs font-bold px-2 py-1 rounded-lg mb-1">
                  {fmtNumber(viewItem.itemNumber)}
                </span>
                <h3 className="text-lg font-bold text-amber-900">{viewItem.itemName}</h3>
              </div>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(viewItem.status)}`}>{viewItem.status}</span>
                <span className={`text-sm font-medium ${conditionColor(viewItem.condition)}`}>{viewItem.condition}</span>
              </div>
              {viewItem.categories?.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {viewItem.categories.map(cat => (
                    <span key={cat} className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-medium">
                      {cat}
                    </span>
                  ))}
                </div>
              )}
              {[
                ['Serial Number',   viewItem.serialNumber],
                ['Quantity',        viewItem.quantity],
                ['Assigned To',     viewItem.assignedTo],
                ['Location',        viewItem.location],
                ['Purchase Date',   viewItem.purchaseDate?.slice(0, 10)],
                ['Purchase Price',  viewItem.purchasePrice ? `BWP ${Number(viewItem.purchasePrice).toLocaleString()}` : null],
                ['Supplier',        viewItem.supplier],
                ['Warranty Expiry', viewItem.warrantyExpiry?.slice(0, 10)],
                ['Notes',           viewItem.notes],
              ].filter(([, v]) => v != null && v !== '').map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase w-36 pt-0.5 flex-shrink-0">{label}</span>
                  <span className="text-sm text-gray-800">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-amber-100">
              <button onClick={() => setDeleteConfirm(viewItem)}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm hover:bg-red-50">Delete</button>
              <button onClick={() => handleEdit(viewItem)}
                className="px-4 py-2 text-white rounded-xl text-sm font-medium"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Item?</h3>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-mono text-amber-700 font-bold">{fmtNumber(deleteConfirm.itemNumber)}</span>
              {' '}— {deleteConfirm.itemName}
            </p>
            <p className="text-sm text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}