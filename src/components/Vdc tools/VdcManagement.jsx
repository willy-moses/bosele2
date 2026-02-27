'use client'
import { useState, useEffect } from 'react'

const CATEGORIES = [
  'Power Tools',
  'Hand Tools',
  'Machinery',
  'Equipment',
  'Office Supplies',
  'Furniture',
  'Electronics',
  'Safety Gear',
  'Vehicles',
  'Other',
]

const CONDITIONS = ['New', 'Good', 'Fair', 'Poor', 'Damaged']
const STATUSES   = ['Available', 'In Use', 'Under Repair', 'Retired', 'Lost']

const emptyForm = {
  item_name:      '',
  category:       '',
  serial_number:  '',
  quantity:       1,
  condition:      'Good',
  status:         'Available',
  assigned_to:    'Modulatshipi Godibayo',
  location:       'Store Room',
  purchase_date:  '',
  purchase_price: '',
  supplier:       '',
  warranty_expiry:'',
  notes:          '',
}

/** Format a raw integer as "VDC-0001" */
const fmtNumber = (n) => `VDC-${String(n).padStart(4, '0')}`

export default function VdcManagement() {
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
      const res  = await fetch('/api/vdc-items')
      const data = await res.json()
      setItems(data.items || [])
    } catch {
      setError('Failed to load VDC items.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const method = editId ? 'PUT' : 'POST'
      const url    = editId ? `/api/vdc-items/${editId}` : '/api/vdc-items'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Save failed')
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
      item_name:       item.item_name       || '',
      category:        item.category        || '',
      serial_number:   item.serial_number   || '',
      quantity:        item.quantity        ?? 1,
      condition:       item.condition       || 'Good',
      status:          item.status          || 'Available',
      assigned_to:     item.assigned_to     || '',
      location:        item.location        || '',
      purchase_date:   item.purchase_date   ? item.purchase_date.slice(0, 10)   : '',
      purchase_price:  item.purchase_price  || '',
      supplier:        item.supplier        || '',
      warranty_expiry: item.warranty_expiry ? item.warranty_expiry.slice(0, 10) : '',
      notes:           item.notes           || '',
    })
    setEditId(item.id)
    setShowForm(true)
    setViewItem(null)
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/vdc-items/${id}`, { method: 'DELETE' })
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

  const exportPdf = async () => {
    setExporting(true)
    setError(null)
    try {
      const res = await fetch('/api/vdc-items/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: filtered }),
      })
      if (!res.ok) throw new Error('Failed to generate PDF')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `vdc-items-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setExporting(false)
    }
  }

  const filtered = items.filter((item) => {
    const q = search.toLowerCase()
    const matchSearch =
      !search ||
      item.item_name?.toLowerCase().includes(q)     ||
      item.serial_number?.toLowerCase().includes(q) ||
      item.assigned_to?.toLowerCase().includes(q)   ||
      fmtNumber(item.item_number).toLowerCase().includes(q)
    const matchCategory = !filterCategory || item.category === filterCategory
    const matchStatus   = !filterStatus   || item.status   === filterStatus
    return matchSearch && matchCategory && matchStatus
  })

  const statusColor = (s) => ({
    'Available':    'bg-emerald-100 text-emerald-800',
    'In Use':       'bg-blue-100 text-blue-800',
    'Under Repair': 'bg-yellow-100 text-yellow-800',
    'Retired':      'bg-gray-100 text-gray-600',
    'Lost':         'bg-red-100 text-red-800',
  }[s] || 'bg-gray-100 text-gray-600')

  const conditionColor = (c) => ({
    'New':     'text-emerald-600',
    'Good':    'text-blue-600',
    'Fair':    'text-yellow-600',
    'Poor':    'text-orange-600',
    'Damaged': 'text-red-600',
  }[c] || 'text-gray-600')

  const stats = {
    total:     items.length,
    available: items.filter((i) => i.status === 'Available').length,
    inUse:     items.filter((i) => i.status === 'In Use').length,
    repair:    items.filter((i) => i.status === 'Under Repair').length,
  }

  /* ─────────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">VDC Items &amp; Tools</h2>
          <p className="text-sm text-gray-500 mt-1">Register and manage VDC equipment and tools</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportPdf}
            disabled={exporting || filtered.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            {exporting ? 'Exporting…' : 'Export PDF'}
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Register Item
          </button>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Items',   value: stats.total,     color: 'text-gray-900'    },
          { label: 'Available',     value: stats.available, color: 'text-emerald-600' },
          { label: 'In Use',        value: stats.inUse,     color: 'text-blue-600'    },
          { label: 'Under Repair',  value: stats.repair,    color: 'text-yellow-600'  },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Error ───────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm flex justify-between">
          {error}
          <button onClick={() => setError(null)} className="font-bold ml-4">✕</button>
        </div>
      )}

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name, VDC-number, serial, assigned to…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading items…</div>
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
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">ID No.</th>
                  <th className="text-left px-4 py-3 font-semibold">Item / Category</th>
                  <th className="text-left px-4 py-3 font-semibold">Serial No.</th>
                  <th className="text-left px-4 py-3 font-semibold">Qty</th>
                  <th className="text-left px-4 py-3 font-semibold">Condition</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Assigned To</th>
                  <th className="text-left px-4 py-3 font-semibold">Location</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">

                    {/* Auto-increment ID */}
                    <td className="px-4 py-3">
                      <span className="inline-block bg-emerald-50 text-emerald-700 font-mono text-xs font-bold px-2 py-1 rounded">
                        {fmtNumber(item.item_number)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{item.item_name}</div>
                      <div className="text-xs text-gray-400">{item.category}</div>
                    </td>

                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.serial_number || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{item.quantity}</td>

                    <td className="px-4 py-3">
                      <span className={`font-medium text-xs ${conditionColor(item.condition)}`}>{item.condition}</span>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-600 text-xs">{item.assigned_to || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{item.location || '—'}</td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View */}
                        <button
                          onClick={() => setViewItem(item)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => setDeleteConfirm(item)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editId ? 'Edit Item' : 'Register VDC Item / Tool'}
                </h3>
                {!editId && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    ID number (VDC-XXXX) will be assigned automatically
                  </p>
                )}
              </div>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* ── Section: Item Details ── */}
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Item Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Item Name *</label>
                  <input
                    required
                    value={form.item_name}
                    onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="e.g. Hammer, Drill, Laptop"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Category *</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Serial / Ref Number</label>
                  <input
                    value={form.serial_number}
                    onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="e.g. SN-2024-001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Quantity *</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Condition</label>
                  <select
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* ── Section: Assignment ── */}
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Assignment &amp; Location</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Assigned To</label>
                  <input
                    value={form.assigned_to}
                    onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Staff name or department"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Location / Storage</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="e.g. Store Room A, Office"
                  />
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* ── Section: Purchase Info ── */}
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Purchase Info</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={form.purchase_date}
                    onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Purchase Price (BWP)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.purchase_price}
                    onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Supplier</label>
                  <input
                    value={form.supplier}
                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Supplier / vendor name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Warranty Expiry</label>
                  <input
                    type="date"
                    value={form.warranty_expiry}
                    onChange={(e) => setForm({ ...form, warranty_expiry: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                  placeholder="Any additional notes…"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetForm}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 transition-colors">
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <span className="inline-block bg-emerald-50 text-emerald-700 font-mono text-xs font-bold px-2 py-1 rounded mb-1">
                  {fmtNumber(viewItem.item_number)}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">{viewItem.item_name}</h3>
              </div>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600 p-1">
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
              {[
                ['ID Number',       fmtNumber(viewItem.item_number)],
                ['Category',        viewItem.category],
                ['Serial Number',   viewItem.serial_number],
                ['Quantity',        viewItem.quantity],
                ['Assigned To',     viewItem.assigned_to],
                ['Location',        viewItem.location],
                ['Purchase Date',   viewItem.purchase_date?.slice(0, 10)],
                ['Purchase Price',  viewItem.purchase_price ? `BWP ${Number(viewItem.purchase_price).toLocaleString()}` : null],
                ['Supplier',        viewItem.supplier],
                ['Warranty Expiry', viewItem.warranty_expiry?.slice(0, 10)],
                ['Notes',           viewItem.notes],
              ].filter(([, v]) => v != null && v !== '').map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase w-36 pt-0.5 flex-shrink-0">{label}</span>
                  <span className="text-sm text-gray-800">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setDeleteConfirm(viewItem)}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50"
              >
                Delete
              </button>
              <button
                onClick={() => handleEdit(viewItem)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Item?</h3>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-mono text-emerald-700 font-bold">{fmtNumber(deleteConfirm.item_number)}</span>
              {' '}— {deleteConfirm.item_name}
            </p>
            <p className="text-sm text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}