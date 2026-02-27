'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  DollarSign, Search, RefreshCw, Plus, X, CheckCircle,
  AlertTriangle, Clock, ChevronDown, ChevronUp,
  Edit2, Filter, TrendingUp, Users, Bell,
  BadgeCheck, ReceiptText, Phone, Settings,
  Download, Banknote
} from 'lucide-react'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]
const PAYMENT_METHODS = ['Cash','Bank Transfer','Mobile Money','Cheque','Other']
const REMINDER_CHANNELS = ['Manual','SMS','Email','WhatsApp']
const STATUS_META = {
  Paid:    { color: 'bg-green-100 text-green-800 border-green-200',     icon: CheckCircle   },
  Partial: { color: 'bg-blue-100 text-blue-800 border-blue-200',        icon: TrendingUp    },
  Unpaid:  { color: 'bg-yellow-100 text-yellow-800 border-yellow-200',  icon: Clock         },
  Overdue: { color: 'bg-red-100 text-red-800 border-red-200',           icon: AlertTriangle },
  Waived:  { color: 'bg-gray-100 text-gray-600 border-gray-200',        icon: BadgeCheck    },
}

const DEFAULT_FEE  = 400
const currentYear  = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1
const fmt          = n => `BWP ${Number(n || 0).toFixed(2)}`
const monthName    = m => MONTHS[(m ?? 1) - 1]

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.Unpaid
  const Icon = meta.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.color}`}>
      <Icon className="h-3 w-3" />{status}
    </span>
  )
}


function Tag({ children, color = 'amber' }) {
  const c = { amber:'bg-amber-100 text-amber-800', blue:'bg-blue-100 text-blue-800', purple:'bg-purple-100 text-purple-800', gray:'bg-gray-100 text-gray-600' }
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${c[color]}`}>{children}</span>
}

function SummaryCard({ label, value, sub, colorClass, Icon, onClick, active }) {
  return (
    <button onClick={onClick}
      className={`text-left w-full rounded-2xl border p-5 transition-all shadow-sm ${colorClass}
        ${onClick ? 'hover:shadow-md cursor-pointer' : 'cursor-default'}
        ${active  ? 'ring-2 ring-offset-2 ring-amber-400 shadow-lg' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-1">{label}</p>
          <p className="text-2xl font-extrabold tracking-tight">{value}</p>
          {sub && <p className="text-xs opacity-50 mt-0.5">{sub}</p>}
        </div>
        {Icon && <Icon className="h-7 w-7 opacity-20" />}
      </div>
    </button>
  )
}

// ─── Set Fee Modal ────────────────────────────────────────────────────────────
function SetFeeModal({ child, onClose, onSave }) {
  const [fee, setFee]     = useState(child.monthlyFee ?? '')
  const [notes, setNotes] = useState(child.feeNotes   ?? '')
  const [saving, setSaving] = useState(false)
  const handleSave = async () => {
    setSaving(true)
    try { await onSave(child.id, fee === '' ? null : Number(fee), notes); onClose() }
    finally { setSaving(false) }
  }
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-5 rounded-t-2xl flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold">Set Monthly Fee</h3>
            <p className="text-teal-100 text-xs mt-0.5">{child.firstName} {child.lastName}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Monthly Fee (BWP) — leave blank to use school default ({fmt(DEFAULT_FEE)})
            </label>
            <input type="number" min="0" step="0.01" value={fee}
              onChange={e => setFee(e.target.value)}
              placeholder={`Default: ${DEFAULT_FEE}`}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fee Notes</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Sponsored, 50% discount…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
          </div>
        </div>
        <div className="px-5 pb-5 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm hover:bg-gray-200 transition">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-50">
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}Save
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Payment Modal ────────────────────────────────────────────────────────────
function PaymentModal({ child, month, year, existing, onClose, onSave }) {
  const defaultFee = child.monthlyFee ?? DEFAULT_FEE
  const [form, setForm] = useState({
    amountDue:     existing?.amountDue     ?? defaultFee,
    amountPaid:    existing?.amountPaid    ?? '',
    paymentMethod: existing?.paymentMethod ?? 'Cash',
    reference:     existing?.reference     ?? '',
    paidDate:      existing?.paidDate ? String(existing.paidDate).slice(0,10) : new Date().toISOString().slice(0,10),
    notes:         existing?.notes  ?? '',
    status:        existing?.status ?? 'auto',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState('')
  const balance = Math.max(0, Number(form.amountDue || 0) - Number(form.amountPaid || 0))

  const handleSave = async () => {
    if (!form.amountDue || isNaN(Number(form.amountDue))) { setErr('Amount due is required'); return }
    setSaving(true); setErr('')
    try {
      await onSave({
        childId: child.id,
        childName: `${child.firstName} ${child.lastName}`,
        parentName: `${child.parentFirstName ?? ''} ${child.parentLastName ?? ''}`.trim(),
        parentPhone: child.parentPhone || null,
        parentEmail: child.parentEmail || null,
        class: child.class || null,
        amountDue: Number(form.amountDue),
        amountPaid: Number(form.amountPaid || 0),
        month, year,
        dueDate: `${year}-${String(month).padStart(2,'0')}-07`,
        paidDate: form.amountPaid > 0 ? form.paidDate : null,
        paymentMethod: form.paymentMethod,
        reference: form.reference,
        status: form.status,
        notes: form.notes,
      })
      onClose()
    } catch (e) { setErr(e.message) } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 rounded-t-2xl flex justify-between items-start">
          <div>
            <h3 className="text-white font-bold text-lg">Record Payment</h3>
            <p className="text-amber-100 text-sm mt-0.5">{child.firstName} {child.lastName} — {monthName(month)} {year}</p>
            {child.feeNotes && <span className="mt-1 inline-block text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{child.feeNotes}</span>}
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{err}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Amount Due (BWP)</label>
              <input type="number" min="0" step="0.01" value={form.amountDue}
                onChange={e => setForm(f => ({ ...f, amountDue: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Amount Paid (BWP)</label>
              <input type="number" min="0" step="0.01" value={form.amountPaid}
                onChange={e => setForm(f => ({ ...f, amountPaid: e.target.value }))}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>
          <div className={`rounded-xl px-4 py-3 text-sm font-semibold flex justify-between items-center ${
            balance === 0 ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            <span>{balance === 0 ? '✓ Fully settled' : 'Outstanding balance'}</span>
            {balance > 0 && <span className="font-bold">{fmt(balance)}</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Payment Method</label>
              <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date Paid</label>
              <input type="date" value={form.paidDate} onChange={e => setForm(f => ({ ...f, paidDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Reference / Receipt No.</label>
            <input type="text" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
              placeholder="e.g. REC-001, TXN-2025-003…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="auto">Auto-calculate from amounts</option>
              {Object.keys(STATUS_META).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Any additional notes…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50">
            {saving ? <><RefreshCw className="h-4 w-4 animate-spin" />Saving…</> : <><CheckCircle className="h-4 w-4" />Save Payment</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Reminder Modal ───────────────────────────────────────────────────────────
function ReminderModal({ targets, month, year, onClose, onSend }) {
  const [channel, setChannel] = useState('Manual')
  const [message, setMessage] = useState(
    `Dear Parent,\n\nThis is a friendly reminder that the school fee for ${monthName(month)} ${year} is outstanding.\n\nPlease make payment at your earliest convenience.\n\nThank you,\nBosele Day Care Pre-school`
  )
  const [sending, setSending] = useState(false)
  const handleSend = async () => {
    setSending(true)
    try { await onSend({ childIds: targets.map(t => t.child.id), month, year, channel, message }); onClose() }
    finally { setSending(false) }
  }
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-8">
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-5 rounded-t-2xl flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-lg">Send Fee Reminders</h3>
            <p className="text-violet-100 text-sm mt-0.5">{targets.length} parent{targets.length !== 1 ? 's' : ''} — {monthName(month)} {year}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recipients</p>
            <div className="max-h-32 overflow-y-auto space-y-1.5 bg-gray-50 rounded-xl p-3 border border-gray-100">
              {targets.map(({ child, payment }) => (
                <div key={child.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-800">{child.firstName} {child.lastName}</span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {child.parentPhone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{child.parentPhone}</span>}
                    <StatusBadge status={payment?.status ?? 'Unpaid'} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Channel</label>
            <div className="grid grid-cols-4 gap-2">
              {REMINDER_CHANNELS.map(ch => (
                <button key={ch} onClick={() => setChannel(ch)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                    channel === ch ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
                  }`}>{ch}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Message Template</label>
            <textarea rows={6} value={message} onChange={e => setMessage(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none font-mono" />
          </div>
          {channel === 'Manual' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              <strong>Manual:</strong> This logs the reminder in the system. Use the contact info above to reach out directly.
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition">Cancel</button>
          <button onClick={handleSend} disabled={sending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition disabled:opacity-50">
            {sending ? <><RefreshCw className="h-4 w-4 animate-spin" />Sending…</> : <><Bell className="h-4 w-4" />Log Reminder</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SchoolFeesManagement() {
  const [children,  setChildren]  = useState([])
  const [payments,  setPayments]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear,  setSelectedYear]  = useState(currentYear)
  const [searchTerm,    setSearch]        = useState('')
  const [statusFilter,  setStatusFilter]  = useState('All')
  const [expanded,      setExpanded]      = useState(null)
  const [paymentModal,  setPaymentModal]  = useState(null)
  const [setFeeModal,   setSetFeeModal]   = useState(null)
  const [reminderModal, setReminderModal] = useState(null)
  const [downloading,   setDownloading]   = useState(null)
  const [toastMsg,      setToast]         = useState('')

  

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3500) }

  const fetchChildren = useCallback(async () => {
    try {
    const res = await fetch('/api/daycare/children')
    const d = await res.json()
    console.log('first child:', d.children?.[0])  // ← add this
    setChildren(d.children || d || [])
  } catch (e) { console.error(e) }
  }, [])

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try { const res = await fetch(`/api/daycare/fees?year=${selectedYear}&month=${selectedMonth}`); const d = await res.json(); setPayments(d.payments || []) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }, [selectedMonth, selectedYear])

  useEffect(() => { fetchChildren() }, [fetchChildren])
  useEffect(() => { fetchPayments() }, [fetchPayments])

  const rows = useMemo(() => {
    return children.filter(c => (c.status || 'active').toLowerCase() === 'active').map(child => {
      const payment = payments.find(p => p.childId === child.id) || null
      let status = payment?.status ?? (
        (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)) ? 'Overdue' : 'Unpaid'
      )
      return { child, payment, status }
    })
  }, [children, payments, selectedMonth, selectedYear])

  const filtered = rows.filter(({ child, status }) => {
    const q = searchTerm.toLowerCase()
    const nm = `${child.firstName} ${child.lastName}`.toLowerCase().includes(q) ||
               `${child.parentFirstName ?? ''} ${child.parentLastName ?? ''}`.toLowerCase().includes(q)
    return nm && (statusFilter === 'All' || status === statusFilter)
  })

  const stats = useMemo(() => ({
    total:     rows.length,
    collected: rows.reduce((s, r) => s + Number(r.payment?.amountPaid || 0), 0),
    expected:  rows.reduce((s, r) => s + Number(r.payment?.amountDue || r.child.monthlyFee || DEFAULT_FEE), 0),
    paid:      rows.filter(r => r.status === 'Paid').length,
    partial:   rows.filter(r => r.status === 'Partial').length,
    unpaid:    rows.filter(r => r.status === 'Unpaid').length,
    overdue:   rows.filter(r => r.status === 'Overdue').length,
  }), [rows])

  const handleSavePayment = async payload => {
    const res = await fetch('/api/daycare/fees', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    const d   = await res.json()
    if (!res.ok) throw new Error(d.error || 'Failed to save')
    await fetchPayments(); showToast('Payment recorded successfully')
  }

  const handleSetFee = async (childId, monthlyFee, feeNotes) => {
    const res = await fetch(`/api/daycare/children/${childId}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ monthlyFee, feeNotes }) })
    if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to update fee') }
    await fetchChildren(); showToast('Fee updated')
  }

  const handleDownloadReceipt = async (payment, childName) => {
    if (!payment?.id) return
    setDownloading(payment.id)
    try {
      const res = await fetch('/api/daycare/fees/receipt', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ paymentId: payment.id }) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      const blob = await res.blob(); const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url
      a.download = `receipt-${payment.receiptNumber || payment.id}-${childName?.replace(/\s+/g,'-')}.pdf`
      a.click(); URL.revokeObjectURL(url); showToast('Receipt downloaded')
    } catch (e) { alert('Could not generate receipt: ' + e.message) }
    finally { setDownloading(null) }
  }

  const handleSendReminders = async payload => {
    const res = await fetch('/api/daycare/fees/reminders', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    const d   = await res.json()
    if (!res.ok) throw new Error(d.error || 'Failed')
    await fetchPayments(); showToast(d.message || `Reminder logged for ${payload.childIds.length} parent(s)`)
  }

  const unpaidTargets = rows.filter(r => ['Unpaid','Overdue','Partial'].includes(r.status))
  const yearOptions   = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
  const collectionPct = stats.expected > 0 ? Math.min(100, (stats.collected / stats.expected) * 100) : 0

  return (
    <div className="space-y-6">

      {toastMsg && (
        <div className="fixed top-5 right-5 z-[100] bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />{toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
              <ReceiptText className="h-6 w-6 text-amber-500" />School Fees
            </h2>
            <p className="text-sm text-amber-600 mt-0.5">
              {monthName(selectedMonth)} {selectedYear}
              <span className="mx-2 text-amber-300">·</span>
              Per-child monthly fees
              <span className="mx-2 text-amber-300">·</span>
              <span className="font-semibold text-amber-800">Principal only</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
              className="border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-700">
              {MONTHS.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
            </select>
            <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
              className="border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-700">
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={() => { fetchChildren(); fetchPayments() }} disabled={loading}
              className="p-2 border border-amber-200 rounded-lg text-amber-600 hover:bg-amber-50 transition disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => unpaidTargets.length > 0 ? setReminderModal(unpaidTargets) : showToast('No outstanding fees this month')}
              className="inline-flex items-center gap-2 px-4 py-2 border border-violet-300 text-violet-700 bg-violet-50 rounded-lg text-sm font-semibold hover:bg-violet-100 transition">
              <Bell className="h-4 w-4" />Reminders
              {unpaidTargets.length > 0 && (
                <span className="bg-violet-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">{unpaidTargets.length}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <SummaryCard label="Expected"  value={fmt(stats.expected)}  sub={`${stats.total} children`}  colorClass="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 text-amber-800"   Icon={DollarSign} />
        <SummaryCard label="Collected" value={fmt(stats.collected)} sub={`${stats.paid} fully paid`} colorClass="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 text-green-800"  Icon={CheckCircle}   onClick={() => setStatusFilter(s => s==='Paid'    ?'All':'Paid')}    active={statusFilter==='Paid'} />
        <SummaryCard label="Partial"   value={stats.partial}                                         colorClass="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200 text-blue-800"         Icon={TrendingUp}    onClick={() => setStatusFilter(s => s==='Partial'  ?'All':'Partial')}  active={statusFilter==='Partial'} />
        <SummaryCard label="Unpaid"    value={stats.unpaid}                                          colorClass="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800" Icon={Clock}         onClick={() => setStatusFilter(s => s==='Unpaid'   ?'All':'Unpaid')}   active={statusFilter==='Unpaid'} />
        <SummaryCard label="Overdue"   value={stats.overdue}                                         colorClass="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 text-red-800"           Icon={AlertTriangle} onClick={() => setStatusFilter(s => s==='Overdue'  ?'All':'Overdue')}  active={statusFilter==='Overdue'} />
      </div>

      {/* Progress bar */}
      {stats.expected > 0 && (
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-700">Collection Progress — {monthName(selectedMonth)} {selectedYear}</span>
            <span className="text-sm font-bold text-amber-700">{collectionPct.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
            <div className="h-5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-700 flex items-center justify-end pr-2"
              style={{ width: `${collectionPct}%` }}>
              {collectionPct > 15 && <span className="text-white text-xs font-bold">{fmt(stats.collected)}</span>}
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Collected: <strong className="text-green-700">{fmt(stats.collected)}</strong></span>
            <span>Outstanding: <strong className="text-red-600">{fmt(Math.max(0, stats.expected - stats.collected))}</strong></span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100">
        <div className="p-4 border-b border-amber-100 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search child or parent…" value={searchTerm} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {['All', ...Object.keys(STATUS_META)].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                  statusFilter === s ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:text-amber-700'
                }`}>{s}</button>
            ))}
          </div>
          <span className="ml-auto text-xs text-gray-400">{filtered.length} of {rows.length}</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="mt-3 text-amber-600 text-sm">Loading fees…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Banknote className="h-14 w-14 text-amber-200 mx-auto mb-3" />
              <p className="text-amber-700 font-medium">No records found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-amber-100 bg-amber-50/60 text-left">
                  {['Child','Class','Monthly Fee','Amount Paid','Balance','Status','Date Paid','Method','Actions'].map(h => (
                    <th key={h} className="py-3 px-4 text-xs font-semibold text-amber-800 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {filtered.map(({ child, payment, status }) => {
                  const due     = Number(payment?.amountDue ?? child.monthlyFee ?? DEFAULT_FEE)
                  const paid    = Number(payment?.amountPaid ?? 0)
                  const balance = Math.max(0, due - paid)
                  const isExp   = expanded === child.id
                  return (
                    <>
                      <tr key={child.id} className={`transition-colors ${
                        status==='Overdue' ? 'bg-red-50/20' : status==='Paid' ? 'bg-green-50/10' : 'hover:bg-amber-50/30'
                      }`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              status==='Overdue' ? 'bg-red-100 text-red-700' : status==='Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'
                            }`}>{child.firstName?.[0]}{child.lastName?.[0]}</div>
                            <div>
                              <p className="font-semibold text-amber-900 whitespace-nowrap">{child.firstName} {child.lastName}</p>
                              <p className="text-xs text-gray-400">{child.parentFirstName} {child.parentLastName}</p>
                              {child.feeNotes && <Tag color="purple">{child.feeNotes}</Tag>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-500">{child.class || '—'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-gray-800">{fmt(due)}</span>
                            {child.monthlyFee != null && <Tag color="blue">Custom</Tag>}
                          </div>
                        </td>
                        <td className="py-3 px-4"><span className={`font-semibold ${paid > 0 ? 'text-green-700' : 'text-gray-400'}`}>{paid > 0 ? fmt(paid) : '—'}</span></td>
                        <td className="py-3 px-4"><span className={`font-bold text-sm ${balance===0 ? 'text-green-600' : balance<due ? 'text-blue-600' : 'text-red-600'}`}>{balance===0 ? 'NIL' : fmt(balance)}</span></td>
                        <td className="py-3 px-4"><StatusBadge status={status} /></td>
                        <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">{payment?.paidDate ? new Date(payment.paidDate).toLocaleDateString('en-GB') : '—'}</td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{payment?.paymentMethod || '—'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {payment && (
                              <button onClick={() => setExpanded(isExp ? null : child.id)}
                                className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition" title="Details">
                                {isExp ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              </button>
                            )}
                            <button onClick={() => setSetFeeModal(child)} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition" title="Set fee">
                              <Settings className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setPaymentModal({ child, existing: payment })}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-100 transition whitespace-nowrap">
                              {payment ? <Edit2 className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                              {payment ? 'Edit' : 'Record'}
                            </button>
                            {payment && ['Paid','Partial'].includes(status) && (
                              <button onClick={() => handleDownloadReceipt(payment, `${child.firstName} ${child.lastName}`)}
                                disabled={downloading === payment.id}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition disabled:opacity-50" title="Download receipt">
                                {downloading===payment.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                              </button>
                            )}
                            {['Unpaid','Overdue','Partial'].includes(status) && (
                              <button onClick={() => setReminderModal([{ child, payment }])}
                                className="p-1.5 text-violet-600 hover:bg-violet-50 rounded transition" title="Send reminder">
                                <Bell className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExp && payment && (
                        <tr key={`${child.id}-exp`} className="bg-amber-50/40">
                          <td colSpan={9} className="px-4 py-3">
                            <div className="flex flex-wrap gap-6 text-xs text-gray-600">
                              {payment.receiptNumber && <span><strong className="text-gray-800">Receipt #:</strong> {payment.receiptNumber}</span>}
                              {payment.reference     && <span><strong className="text-gray-800">Reference:</strong> {payment.reference}</span>}
                              {payment.notes         && <span><strong className="text-gray-800">Notes:</strong> {payment.notes}</span>}
                              {payment.reminderSent  && <span className="text-violet-700"><strong>Reminder sent:</strong> {payment.reminderSentAt ? new Date(payment.reminderSentAt).toLocaleDateString('en-GB') : 'yes'}</span>}
                              <span><strong className="text-gray-800">Recorded by:</strong> {payment.recordedBy || '—'}</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
              <tfoot className="border-t-2 border-amber-200 bg-amber-50">
                <tr>
                  <td colSpan={2} className="py-3 px-4 text-sm font-bold text-amber-900">Total ({filtered.length} children)</td>
                  <td className="py-3 px-4 text-sm font-bold text-gray-800">{fmt(stats.expected)}</td>
                  <td className="py-3 px-4 text-sm font-bold text-green-700">{fmt(stats.collected)}</td>
                  <td className="py-3 px-4 text-sm font-bold text-red-700">{fmt(Math.max(0, stats.expected - stats.collected))}</td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      {paymentModal  && <PaymentModal  child={paymentModal.child} month={selectedMonth} year={selectedYear} existing={paymentModal.existing} onClose={() => setPaymentModal(null)}  onSave={handleSavePayment}  />}
      {setFeeModal   && <SetFeeModal   child={setFeeModal}                                                                                    onClose={() => setSetFeeModal(null)}   onSave={handleSetFee}       />}
      {reminderModal && <ReminderModal targets={reminderModal}   month={selectedMonth} year={selectedYear}                                     onClose={() => setReminderModal(null)} onSend={handleSendReminders}/>}
    </div>
  )
}