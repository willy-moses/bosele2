'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  BarChart2, TrendingUp, Users, DollarSign, FileText,
  Download, RefreshCw, ChevronDown, ChevronUp,
  Baby, Banknote, ArrowUpRight, ArrowDownRight, Printer
} from 'lucide-react'

// ─── Term definitions ─────────────────────────────────────────────────────────
// Term 1: Jan–Apr (months 1–4)
// Term 2: May–Aug (months 5–8)
// Term 3: Sep–Dec (months 9–12)
const TERMS = [
  { label: 'Term 1', months: [1,2,3,4],    monthNames: 'Jan – Apr', color: 'amber',  bg: 'from-amber-50  to-orange-50  border-amber-200  text-amber-900',  bar: 'bg-amber-400'  },
  { label: 'Term 2', months: [5,6,7,8],    monthNames: 'May – Aug', color: 'sky',    bg: 'from-sky-50    to-blue-50    border-sky-200    text-sky-900',    bar: 'bg-sky-400'    },
  { label: 'Term 3', months: [9,10,11,12], monthNames: 'Sep – Dec', color: 'violet', bg: 'from-violet-50 to-purple-50  border-violet-200 text-violet-900', bar: 'bg-violet-400' },
]

const MONTHS      = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

// Returns 'Term 1' | 'Term 2' | 'Term 3' for a given month number 1–12
const termOf = m => m <= 4 ? 'Term 1' : m <= 8 ? 'Term 2' : 'Term 3'

const currentYear  = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1
const currentTerm  = termOf(currentMonth)

const fmt      = n => `BWP ${Number(n || 0).toFixed(2)}`
const fmtShort = n => { const v = Number(n || 0); return v >= 1000 ? `BWP ${(v/1000).toFixed(1)}k` : `BWP ${v.toFixed(0)}` }

// ─── Mini bar ────────────────────────────────────────────────────────────────
function MiniBar({ value, max, color = 'bg-amber-400', label, valueLabel }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-10 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-20 text-right shrink-0">{valueLabel ?? fmtShort(value)}</span>
    </div>
  )
}

// ─── Stat tile ────────────────────────────────────────────────────────────────
function Tile({ label, value, sub, icon: Icon, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} border shadow-sm`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1">{label}</p>
          <p className="text-2xl font-black tracking-tight">{value}</p>
          {sub && <p className="text-xs opacity-50 mt-0.5">{sub}</p>}
        </div>
        {Icon && <Icon className="h-8 w-8 opacity-15" />}
      </div>
    </div>
  )
}

// ─── Collapsible section ──────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, color = 'amber', badge }) {
  const [open, setOpen] = useState(true)
  const c = {
    amber:  'text-amber-700  border-amber-200',
    blue:   'text-blue-700   border-blue-200',
    green:  'text-green-700  border-green-200',
    purple: 'text-purple-700 border-purple-200',
    sky:    'text-sky-700    border-sky-200',
    violet: 'text-violet-700 border-violet-200',
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-6 py-4 border-b ${c[color] ?? c.amber} hover:bg-gray-50/50 transition`}>
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="h-5 w-5" />}
          <span className="font-bold text-base">{title}</span>
          {badge && <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-current/10 opacity-80">{badge}</span>}
        </div>
        {open ? <ChevronUp className="h-4 w-4 opacity-50" /> : <ChevronDown className="h-4 w-4 opacity-50" />}
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  )
}

// ─── Term progress bar ────────────────────────────────────────────────────────
function TermProgress({ due, paid, label, months, barColor }) {
  const pct = due > 0 ? Math.min(100, (paid / due) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-gray-700">{label}</span>
        <span className="text-xs text-gray-500">{months}</span>
        <span className="text-xs font-semibold text-gray-600">{pct.toFixed(0)}%</span>
      </div>
      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span className="text-green-700 font-medium">Collected {fmt(paid)}</span>
        <span className="text-red-600 font-medium">Outstanding {fmt(Math.max(0, due - paid))}</span>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ReportsManagement() {
  const [reportYear,  setReportYear]  = useState(currentYear)
  const [reportTerm,  setReportTerm]  = useState(currentTerm)   // 'Term 1' | 'Term 2' | 'Term 3'
  const [reportType,  setReportType]  = useState('term')         // 'term' | 'annual'
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  const [children,      setChildren]      = useState([])
  const [staff,         setStaff]         = useState([])
  const [registrations, setRegistrations] = useState([])
  const [allPayments,   setAllPayments]   = useState([])   // all 12 months for the year

  const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - i)

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [childRes, staffRes, regRes] = await Promise.all([
        fetch('/api/daycare/children'),
        fetch('/api/daycare/staff'),
        fetch('/api/registrations'),
      ])
      const childData = await childRes.json()
      const staffData = staffRes.ok ? await staffRes.json() : { staff: [] }
      const regData   = await regRes.json()

      setChildren(childData.children || [])
      setStaff(staffData.staff || staffData || [])
      setRegistrations(Array.isArray(regData) ? regData : regData.registrations || [])

      // Fetch all 12 months in parallel
      const monthResults = await Promise.all(
        Array.from({ length: 12 }, (_, i) =>
          fetch(`/api/daycare/fees?year=${reportYear}&month=${i + 1}`).then(r => r.ok ? r.json() : { payments: [] })
        )
      )
      setAllPayments(monthResults.flatMap(d => d.payments || []))
    } catch (e) {
      console.error(e); setError(e.message)
    } finally { setLoading(false) }
  }, [reportYear])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeChildren = useMemo(() =>
    children.filter(c => {
      const s = (c.status || 'active').toLowerCase()
      return s === 'active' || s === 'enrolled'   // accept both active and enrolled
    }), [children])

  // Payments for selected term months
  const termDef = TERMS.find(t => t.label === reportTerm) ?? TERMS[0]
  const termPayments = useMemo(() =>
    allPayments.filter(p => termDef.months.includes(p.month)), [allPayments, termDef])

  const DEFAULT_FEE = 400

  // Expected monthly fee for a child
  const childFee = useCallback((c) =>
    Number(c.monthly_fee || c.monthlyFee || DEFAULT_FEE), [])

  // Total expected billing for ALL active children for a given set of months
  // = (recorded amountDue from payments) + (default fee × children with NO record that month)
  const expectedForMonths = useCallback((months) => {
    return months.reduce((total, m) => {
      const monthPayments = allPayments.filter(p => p.month === m)
      const paidChildIds  = new Set(monthPayments.map(p => p.childId))
      const recordedDue   = monthPayments.reduce((s, p) => s + Number(p.amountDue || 0), 0)
      const unrecordedDue = activeChildren
        .filter(c => !paidChildIds.has(c.id))
        .reduce((s, c) => s + childFee(c), 0)
      return total + recordedDue + unrecordedDue
    }, 0)
  }, [allPayments, activeChildren, childFee])

  // Per-term fee stats (used in term view)
  const termFeeStats = useMemo(() => {
    const due  = expectedForMonths(termDef.months)
    const paid = termPayments.reduce((s, p) => s + Number(p.amountPaid || 0), 0)
    const pct  = due > 0 ? Math.min(100, (paid / due) * 100) : 0

    // Count children (not records) per status, across all months in the term
    let childrenPaid = 0, childrenPartial = 0, childrenUnpaid = 0, childrenWaived = 0

    termDef.months.forEach(m => {
      const mp = allPayments.filter(p => p.month === m)
      const recordedIds = new Set(mp.map(p => p.childId))

      // Children with a payment record — bucket by status
      mp.forEach(p => {
        if      (p.status === 'Paid')                           childrenPaid++
        else if (p.status === 'Partial')                        childrenPartial++
        else if (p.status === 'Waived')                         childrenWaived++
        else if (['Unpaid','Overdue'].includes(p.status))       childrenUnpaid++
      })

      // Children with NO record for this month — count as unpaid
      activeChildren.forEach(c => {
        if (!recordedIds.has(c.id)) childrenUnpaid++
      })
    })

    return {
      due, paid, pct,
      outstanding:  Math.max(0, due - paid),
      countPaid:    childrenPaid,
      countPartial: childrenPartial,
      countUnpaid:  childrenUnpaid,
      countWaived:  childrenWaived,
      totalChildren: activeChildren.length,
      monthCount:    termDef.months.length,
    }
  }, [termPayments, termDef, expectedForMonths, allPayments, activeChildren])

  // Per-month breakdown within the selected term — with per-child counts
  const termByMonth = useMemo(() =>
  termDef.months.map(m => {
    const mp          = allPayments.filter(p => p.month === m)
    const recordedIds = new Set(mp.map(p => p.childId))

    const recordedDue  = mp.filter(p => p.status !== 'Waived').reduce((s, p) => s + Number(p.amountDue  || 0), 0)
    const unrecorded   = activeChildren.filter(c => !recordedIds.has(c.id)).reduce((s, c) => s + childFee(c), 0)

    const childrenPaid    = mp.filter(p => ['Paid','Partial'].includes(p.status)).length
    const childrenWaived  = mp.filter(p => p.status === 'Waived').length
    const childrenUnpaid  = mp.filter(p => ['Unpaid','Overdue'].includes(p.status)).length
                          + activeChildren.filter(c => !recordedIds.has(c.id)).length

    return {
      month:         MONTHS[m - 1],
      due:           recordedDue + unrecorded,
      paid:          mp.reduce((s, p) => s + Number(p.amountPaid || 0), 0),
      totalChildren: activeChildren.length,
      childrenPaid,
      childrenUnpaid,
      childrenWaived,
    }
  }), [allPayments, termDef, activeChildren, childFee])

  // Per-TERM aggregates for annual view — per child counts
  const annualByTerm = useMemo(() =>
    TERMS.map(t => {
      const tp   = allPayments.filter(p => t.months.includes(p.month))
      const due  = expectedForMonths(t.months)
      const paid = tp.reduce((s, p) => s + Number(p.amountPaid || 0), 0)

      let childrenPaid = 0, childrenUnpaid = 0
      t.months.forEach(m => {
        const mp  = allPayments.filter(p => p.month === m)
        const ids = new Set(mp.map(p => p.childId))
        childrenPaid   += mp.filter(p => ['Paid','Partial'].includes(p.status)).length
        childrenUnpaid += mp.filter(p => ['Unpaid','Overdue'].includes(p.status)).length
                       +  activeChildren.filter(c => !ids.has(c.id)).length
      })

      return {
        ...t,
        due, paid,
        countPaid:    childrenPaid,
        countUnpaid:  childrenUnpaid,
        children:     activeChildren.length,
      }
    }), [allPayments, activeChildren, expectedForMonths])

  const annualTotals = useMemo(() => ({
    due:  annualByTerm.reduce((s, t) => s + t.due,  0),
    paid: annualByTerm.reduce((s, t) => s + t.paid, 0),
  }), [annualByTerm])

  // Children by class
  const childrenByClass = useMemo(() => {
    const map = {}
    activeChildren.forEach(c => { const cls = c.class || 'Unassigned'; map[cls] = (map[cls] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [activeChildren])

  // Show active children only for whichever term today's month falls in; others = 0
  const todayTerm = termOf(new Date().getMonth() + 1)   // e.g. February → 'Term 1'
  const enrolledPerTerm = useMemo(() =>
    TERMS.map(t => ({
      label: t.label,
      months: t.monthNames,
      bar:   t.bar,
      count: t.label === todayTerm ? activeChildren.length : 0,
    })), [activeChildren, todayTerm])

  // Registration stats
  const regStats = useMemo(() => ({
    total:    registrations.length,
    pending:  registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
    waitlist: registrations.filter(r => r.status === 'waitlist').length,
  }), [registrations])

  // Staff
  const staffStats = useMemo(() => {
    const arr = Array.isArray(staff) ? staff : []
    return {
      total:   arr.length,
      active:  arr.filter(s => s.status === 'active').length,
      onLeave: arr.filter(s => s.status === 'on_leave').length,
      byDept:  arr.reduce((acc, s) => { const d = s.department || 'Other'; acc[d] = (acc[d] || 0) + 1; return acc }, {}),
    }
  }, [staff])

  // ── Export CSV ────────────────────────────────────────────────────────────
  const exportCSV = (rows, filename) => {
    if (!rows.length) return
    const keys = Object.keys(rows[0])
    const csv  = [keys.join(','), ...rows.map(r => keys.map(k => `"${r[k] ?? ''}"`).join(','))].join('\n')
    const a    = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = filename; a.click()
  }

  const exportTermFees = () => {
    exportCSV(termPayments.map(p => ({
      child: p.childName, parent: p.parentName || '', class: p.class || '',
      month: FULL_MONTHS[(p.month || 1) - 1],
      due: p.amountDue, paid: p.amountPaid,
      balance: Math.max(0, Number(p.amountDue) - Number(p.amountPaid)),
      status: p.status, method: p.paymentMethod || '',
      paidDate: p.paidDate ? new Date(p.paidDate).toLocaleDateString('en-GB') : '',
      receipt: p.receiptNumber || '',
    })), `fees-${reportTerm.replace(' ','-')}-${reportYear}.csv`)
  }

  const exportChildren = () => {
    exportCSV(activeChildren.map(c => ({
      firstName: c.firstName, lastName: c.lastName, class: c.class || '',
      dob: c.dateOfBirth ? new Date(c.dateOfBirth).toLocaleDateString('en-GB') : '',
      parent: `${c.parentFirstName || ''} ${c.parentLastName || ''}`.trim(),
      phone: c.parentPhone || '', term: c.term || '',
      monthlyFee: c.monthly_fee || c.monthlyFee || '',
    })), `children-${reportYear}.csv`)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-amber-700 font-medium">Generating report…</p>
    </div>
  )
  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6">
      <p className="font-semibold">Failed to load report</p>
      <p className="text-sm mt-1">{error}</p>
      <button onClick={fetchAll} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Retry</button>
    </div>
  )

  const maxTermPaid    = Math.max(...annualByTerm.map(t => t.paid), 1)
  const maxClassCount  = Math.max(...childrenByClass.map(([, n]) => n), 1)
  const maxMonthPaid   = Math.max(...termByMonth.map(m => m.paid), 1)
  const annualCollPct  = annualTotals.due > 0 ? Math.min(100, (annualTotals.paid / annualTotals.due) * 100) : 0

  return (
    <div className="space-y-6 print:space-y-4">

      {/* ── Header ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-amber-900 flex items-center gap-2">
              <BarChart2 className="h-6 w-6 text-amber-500" />Reports &amp; Analytics
            </h2>
            <p className="text-sm text-amber-600 mt-0.5">
              {reportType === 'term'
                ? `${reportTerm} (${TERMS.find(t => t.label === reportTerm)?.monthNames}) — ${reportYear}`
                : `Annual Overview — ${reportYear}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {/* Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              {[['term','By Term'],['annual','Annual']].map(([v, lbl]) => (
                <button key={v} onClick={() => setReportType(v)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                    reportType === v ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-amber-700'
                  }`}>{lbl}</button>
              ))}
            </div>

            {/* Term selector — only when in term mode */}
            {reportType === 'term' && (
              <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                {TERMS.map(t => (
                  <button key={t.label} onClick={() => setReportTerm(t.label)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      reportTerm === t.label ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-amber-700'
                    }`}>{t.label}</button>
                ))}
              </div>
            )}

            <select value={reportYear} onChange={e => setReportYear(Number(e.target.value))}
              className="border border-amber-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-700">
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            <button onClick={fetchAll} disabled={loading}
              className="p-2 border border-amber-200 rounded-lg text-amber-600 hover:bg-amber-50 transition disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
              <Printer className="h-4 w-4" />Print
            </button>
            <button onClick={exportTermFees}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm font-semibold hover:bg-amber-100 transition">
              <Download className="h-4 w-4" />Fees CSV
            </button>
            <button onClick={exportChildren}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-100 transition">
              <Download className="h-4 w-4" />Children CSV
            </button>
          </div>
        </div>
      </div>

      {/* ── Top tiles ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Tile label="Active Children"  value={activeChildren.length} icon={Baby}
          gradient="bg-gradient-to-br from-amber-50  to-orange-50  border-amber-200  text-amber-900" />
        <Tile label="Staff"            value={staffStats.active}     icon={Users}
          gradient="bg-gradient-to-br from-sky-50    to-blue-50    border-sky-200    text-sky-900" />
        <Tile label="Registrations"    value={regStats.total}        icon={FileText}
          gradient="bg-gradient-to-br from-purple-50 to-violet-50  border-purple-200 text-purple-900" />
        <Tile
          label={reportType === 'term' ? `${reportTerm} Collected` : 'Year Collected'}
          value={fmtShort(reportType === 'term' ? termFeeStats.paid : annualTotals.paid)}
          sub={`of ${fmt(reportType === 'term' ? termFeeStats.due : annualTotals.due)}`}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-green-50  to-emerald-50 border-green-200  text-green-900" />
        <Tile
          label="Collection Rate"
          value={`${(reportType === 'term' ? termFeeStats.pct : annualCollPct).toFixed(0)}%`}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-rose-50   to-pink-50    border-rose-200   text-rose-900" />
      </div>

      {/* ══════════════════════ TERM VIEW ══════════════════════ */}
      {reportType === 'term' && (
        <>
          {/* Fee collection for this term */}
          <Section title={`Fee Collection — ${reportTerm} (${termDef.monthNames}) ${reportYear}`} icon={Banknote} color="amber">

            {/* Status counts — per child across all months in term */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label:'Children Paid',    value: termFeeStats.countPaid,    sub: `across ${termFeeStats.monthCount} months`, color:'bg-green-100  text-green-800  border-green-200',  dot:'bg-green-500'  },
                { label:'Partial',          value: termFeeStats.countPartial,  sub: 'part-paid',                                color:'bg-blue-100   text-blue-800   border-blue-200',   dot:'bg-blue-500'   },
                { label:'Children Unpaid',  value: termFeeStats.countUnpaid,   sub: 'no payment yet',                           color:'bg-yellow-100 text-yellow-800 border-yellow-200', dot:'bg-yellow-400' },
                { label:'Waived',           value: termFeeStats.countWaived,   sub: 'fee waived',                               color:'bg-gray-100   text-gray-600   border-gray-200',   dot:'bg-gray-400'   },
              ].map(({ label, value, sub, color, dot }) => (
                <div key={label} className={`rounded-xl border px-4 py-3 flex items-center gap-2.5 ${color}`}>
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
                  <div>
                    <p className="text-xs font-semibold opacity-70">{label}</p>
                    <p className="text-xl font-black">{value}</p>
                    <p className="text-xs opacity-50">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall term progress */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span className="font-semibold">{reportTerm} collection progress</span>
                <span className="font-bold text-amber-700">{termFeeStats.pct.toFixed(1)}%</span>
              </div>
              <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${termDef.bar} rounded-full transition-all duration-700 flex items-center justify-end pr-3`}
                  style={{ width: `${termFeeStats.pct}%` }}>
                  {termFeeStats.pct > 20 && <span className="text-white text-xs font-bold">{fmt(termFeeStats.paid)}</span>}
                </div>
              </div>
              <div className="flex justify-between mt-1 text-xs">
                <span className="text-green-700 font-semibold">Collected: {fmt(termFeeStats.paid)}</span>
                <span className="text-red-600 font-semibold">Outstanding: {fmt(termFeeStats.outstanding)}</span>
              </div>
            </div>

            {/* Monthly breakdown within term — with per-child paid/unpaid */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Month-by-Month within {reportTerm}</p>
            <div className="space-y-3 mb-6">
             {termByMonth.map(m => {
  const maxDue = Math.max(...termByMonth.map(x => x.due), 1)
  const pct    = m.due > 0 ? Math.min(100, (m.paid / m.due) * 100) : 0
  const allWaived = m.childrenWaived === activeChildren.length

  return (
    <div key={m.month} className={`rounded-xl p-3 border ${
      allWaived ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-gray-50 border-gray-100'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">{m.month}</span>
          {allWaived && (
            <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-semibold">All Waived</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs flex-wrap justify-end">
          {m.childrenPaid > 0 && (
            <span className="flex items-center gap-1 text-green-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              {m.childrenPaid} paid
            </span>
          )}
          {m.childrenUnpaid > 0 && (
            <span className="flex items-center gap-1 text-red-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
              {m.childrenUnpaid} unpaid
            </span>
          )}
          {m.childrenWaived > 0 && (
            <span className="flex items-center gap-1 text-gray-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
              {m.childrenWaived} waived
            </span>
          )}
        </div>
      </div>

      {allWaived ? (
        <p className="text-xs text-gray-400 italic">No fee applicable this month</p>
      ) : (
        <>
          {/* Collection progress for this month */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Collection progress</span>
              <span className="font-semibold">{pct.toFixed(0)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full ${termDef.bar} rounded-full transition-all duration-700`}
                style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 w-10 shrink-0">Billed</span>
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-200 rounded-full"
                  style={{ width: maxDue > 0 ? `${(m.due / maxDue) * 100}%` : '0%' }} />
              </div>
              <span className="text-xs text-gray-500 w-16 text-right">{fmtShort(m.due)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 w-10 shrink-0">Paid</span>
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${termDef.bar} rounded-full`}
                  style={{ width: maxDue > 0 ? `${(m.paid / maxDue) * 100}%` : '0%' }} />
              </div>
              <span className="text-xs font-semibold text-green-700 w-16 text-right">{fmtShort(m.paid)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
})}
            </div>

            {/* Per-child table */}
            {termPayments.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-amber-100">
                <table className="w-full text-sm">
                  <thead className="bg-amber-50/80 border-b border-amber-100">
                    <tr>
                      {['Child','Class','Month','Due','Paid','Balance','Status','Method','Date Paid'].map(h => (
                        <th key={h} className="py-2.5 px-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-50">
                    {termPayments
                      .sort((a, b) => a.month - b.month || (a.childName || '').localeCompare(b.childName || ''))
                      .map(p => {
                        const balance = Math.max(0, Number(p.amountDue) - Number(p.amountPaid))
                        const sc = { Paid:'text-green-700', Partial:'text-blue-700', Unpaid:'text-yellow-700', Overdue:'text-red-700', Waived:'text-gray-500' }
                        return (
                          <tr key={p.id} className="hover:bg-amber-50/30 transition">
                            <td className="py-2.5 px-3 font-medium text-amber-900">{p.childName}</td>
                            <td className="py-2.5 px-3 text-gray-500">{p.class || '—'}</td>
                            <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">{MONTHS[(p.month || 1) - 1]}</td>
                            <td className="py-2.5 px-3 text-gray-700">{fmt(p.amountDue)}</td>
                            <td className="py-2.5 px-3 text-green-700 font-semibold">{fmt(p.amountPaid)}</td>
                            <td className="py-2.5 px-3 font-bold">
                              {balance === 0 ? <span className="text-green-600">NIL</span> : <span className="text-red-600">{fmt(balance)}</span>}
                            </td>
                            <td className="py-2.5 px-3"><span className={`font-semibold ${sc[p.status] || 'text-gray-700'}`}>{p.status}</span></td>
                            <td className="py-2.5 px-3 text-gray-500">{p.paymentMethod || '—'}</td>
                            <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">
                              {p.paidDate ? new Date(p.paidDate).toLocaleDateString('en-GB') : '—'}
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                  <tfoot className="border-t-2 border-amber-200 bg-amber-50 font-bold">
                    <tr>
                      <td className="py-2.5 px-3 text-amber-900" colSpan={3}>Total ({termPayments.length} records)</td>
                      <td className="py-2.5 px-3 text-gray-800">{fmt(termFeeStats.due)}</td>
                      <td className="py-2.5 px-3 text-green-700">{fmt(termFeeStats.paid)}</td>
                      <td className="py-2.5 px-3 text-red-700">{fmt(termFeeStats.outstanding)}</td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-amber-600">
                <Banknote className="h-12 w-12 mx-auto mb-2 text-amber-200" />
                <p>No fee records for {reportTerm} {reportYear}</p>
              </div>
            )}
          </Section>

          {/* Children enrolled in this term */}
          <Section title={`Children — ${reportTerm}`} icon={Baby} color="amber">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">By Class</p>
                <div className="space-y-2">
                  {childrenByClass.length > 0 ? childrenByClass.map(([cls, count]) => (
                    <MiniBar key={cls} label={cls.substring(0, 10)} value={count} max={maxClassCount} color={termDef.bar} valueLabel={`${count}`} />
                  )) : <p className="text-sm text-gray-400">No classes found</p>}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Enrolled per Term</p>
                <p className="text-xs text-gray-400 mb-3">Based on current month — active children shown for the current term only</p>
                <div className="space-y-2">
                  {enrolledPerTerm.map(t => (
                    <MiniBar key={t.label} label={t.label} value={t.count} max={activeChildren.length || 1} color={t.bar} valueLabel={`${t.count} children`} />
                  ))}
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-5 mb-3">Gender Split</p>
                {(() => {
                  const boys  = activeChildren.filter(c => c.gender?.toLowerCase() === 'male').length
                  const girls = activeChildren.filter(c => c.gender?.toLowerCase() === 'female').length
                  const total = activeChildren.length || 1
                  return (
                    <div className="space-y-2">
                      <MiniBar label="Boys"  value={boys}  max={total} color="bg-sky-400"  valueLabel={`${boys} (${((boys/total)*100).toFixed(0)}%)`} />
                      <MiniBar label="Girls" value={girls} max={total} color="bg-rose-400" valueLabel={`${girls} (${((girls/total)*100).toFixed(0)}%)`} />
                    </div>
                  )
                })()}
              </div>
            </div>
          </Section>
        </>
      )}

      {/* ══════════════════════ ANNUAL VIEW ══════════════════════ */}
      {reportType === 'annual' && (
        <>
          <Section title={`Annual Fee Summary — ${reportYear}`} icon={Banknote} color="amber">

            {/* Annual totals */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl bg-green-50  border border-green-200  p-4 text-center">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Total Collected</p>
                <p className="text-2xl font-black text-green-800 mt-1">{fmt(annualTotals.paid)}</p>
              </div>
              <div className="rounded-xl bg-amber-50  border border-amber-200  p-4 text-center">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Total Billed</p>
                <p className="text-2xl font-black text-amber-800 mt-1">{fmt(annualTotals.due)}</p>
              </div>
              <div className="rounded-xl bg-red-50    border border-red-200    p-4 text-center">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Outstanding</p>
                <p className="text-2xl font-black text-red-800 mt-1">{fmt(Math.max(0, annualTotals.due - annualTotals.paid))}</p>
              </div>
            </div>

            {/* Per-term progress bars */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Collection by Term</p>
            <div className="space-y-5">
              {annualByTerm.map(t => (
                <div key={t.label} className={`rounded-2xl border p-5 bg-gradient-to-br ${t.bg}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="font-bold text-sm">{t.label}</span>
                      <span className="ml-2 text-xs opacity-60">{t.monthNames}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-green-700 font-semibold">{t.countPaid} children paid</span>
                      <span className="text-red-600 font-semibold">{t.countUnpaid} unpaid</span>
                    </div>
                  </div>
                  <TermProgress
                    due={t.due} paid={t.paid}
                    label={`${t.due > 0 ? ((t.paid/t.due)*100).toFixed(0) : 0}%`}
                    months={t.monthNames}
                    barColor={t.bar}
                  />
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="bg-white/60 rounded-lg py-2">
                      <p className="opacity-60 font-semibold uppercase tracking-wide">Billed</p>
                      <p className="font-black">{fmtShort(t.due)}</p>
                    </div>
                    <div className="bg-white/60 rounded-lg py-2">
                      <p className="opacity-60 font-semibold uppercase tracking-wide">Collected</p>
                      <p className="font-black text-green-700">{fmtShort(t.paid)}</p>
                    </div>
                    <div className="bg-white/60 rounded-lg py-2">
                      <p className="opacity-60 font-semibold uppercase tracking-wide">Children</p>
                      <p className="font-black">{t.children}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Annual children summary */}
          <Section title="Enrollment Overview" icon={Baby} color="green">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Children by Class</p>
                <div className="space-y-2">
                  {childrenByClass.map(([cls, count]) => (
                    <MiniBar key={cls} label={cls.substring(0, 10)} value={count} max={maxClassCount} color="bg-emerald-400" valueLabel={`${count}`} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Enrolled per Term</p>
                <p className="text-xs text-gray-400 mb-3">Based on current month — active children shown for the current term only</p>
                <div className="space-y-3">
                  {enrolledPerTerm.map(t => (
                    <MiniBar key={t.label} label={t.label} value={t.count} max={activeChildren.length || 1} color={t.bar} valueLabel={`${t.count} children`} />
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </>
      )}

      {/* ── Registrations (always shown) ── */}
      <Section title="Registrations Summary" icon={FileText} color="purple">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {[
            { label:'Total',    value:regStats.total,    bg:'from-blue-50   to-blue-100   border-blue-200',   text:'text-blue-900'   },
            { label:'Pending',  value:regStats.pending,  bg:'from-yellow-50 to-yellow-100 border-yellow-200', text:'text-yellow-900' },
            { label:'Approved', value:regStats.approved, bg:'from-green-50  to-green-100  border-green-200',  text:'text-green-900'  },
            { label:'Waitlist', value:regStats.waitlist, bg:'from-purple-50 to-purple-100 border-purple-200', text:'text-purple-900' },
          ].map(({ label, value, bg, text }) => (
            <div key={label} className={`bg-gradient-to-br ${bg} rounded-xl border p-4 text-center`}>
              <p className={`text-xs font-semibold ${text} opacity-70 uppercase tracking-wide`}>{label}</p>
              <p className={`text-2xl font-black ${text} mt-0.5`}>{value}</p>
            </div>
          ))}
        </div>
        {regStats.total > 0 && (
          <div className="h-3 rounded-full bg-gray-100 overflow-hidden flex">
            {[
              { v: regStats.approved, c: 'bg-green-400'  },
              { v: regStats.pending,  c: 'bg-yellow-400' },
              { v: regStats.waitlist, c: 'bg-blue-400'   },
              { v: regStats.rejected, c: 'bg-red-400'    },
            ].map(({ v, c }, i) => (
              <div key={i} className={`h-full ${c}`} style={{ width: `${(v/regStats.total)*100}%` }} />
            ))}
          </div>
        )}
      </Section>

      {/* ── Staff ── */}
      <Section title="Staff Overview" icon={Users} color="blue">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label:'Total',    value: staffStats.total,   color:'text-gray-800'   },
              { label:'Active',   value: staffStats.active,  color:'text-green-700'  },
              { label:'On Leave', value: staffStats.onLeave, color:'text-yellow-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                <p className="text-xs text-gray-500 font-semibold uppercase">{label}</p>
                <p className={`text-2xl font-black ${color} mt-0.5`}>{value}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">By Department</p>
            <div className="space-y-2">
              {Object.entries(staffStats.byDept).length > 0
                ? Object.entries(staffStats.byDept).sort((a,b) => b[1]-a[1]).map(([dept, count]) => (
                    <MiniBar key={dept} label={dept.substring(0,10)} value={count} max={staffStats.total || 1} color="bg-sky-400" valueLabel={`${count}`} />
                  ))
                : <p className="text-sm text-gray-400">No staff data</p>}
            </div>
          </div>
        </div>
      </Section>

      <div className="hidden print:block text-center text-xs text-gray-400 pt-4 border-t border-gray-200">
        Bosele Day Care Pre-school · Report generated {new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}
      </div>
    </div>
  )
}