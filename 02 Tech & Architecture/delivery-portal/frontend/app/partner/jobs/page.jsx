'use client'
import { useEffect, useState } from 'react'
import { MapPin, Phone, Package } from 'lucide-react'
import api from '@/lib/api'
import StatusBadge from '@/components/StatusBadge'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { formatCurrency, formatDate, PACKAGE_LABELS } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: 'PICKED_UP',  label: 'Mark Picked Up' },
  { value: 'IN_TRANSIT', label: 'Mark In Transit' },
  { value: 'DELIVERED',  label: 'Mark Delivered' },
]

export default function PartnerJobsPage() {
  const [tab, setTab] = useState('available')
  const [available, setAvailable] = useState([])
  const [myJobs, setMyJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/partners/jobs/available'),
      api.get('/partners/jobs/mine')
    ]).then(([avRes, myRes]) => {
      setAvailable(avRes.data)
      setMyJobs(myRes.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const acceptJob = async (orderId) => {
    setActionLoading(orderId)
    try {
      await api.post(`/partners/jobs/${orderId}/accept`)
      showToast('Job accepted! Check My Jobs tab.')
      load()
      setTab('mine')
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to accept job')
    } finally {
      setActionLoading(null)
    }
  }

  const updateStatus = async (orderId, status) => {
    setActionLoading(orderId)
    try {
      await api.patch(`/partners/orders/${orderId}/status`, { status })
      showToast('Status updated!')
      load()
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update status')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <LoadingSpinner />

  const activeMyJobs = myJobs.filter((j) => !['DELIVERED', 'CANCELLED'].includes(j.status))
  const completedJobs = myJobs.filter((j) => j.status === 'DELIVERED')

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-5 right-5 bg-mac-label text-white px-4 py-3 rounded-xl text-sm shadow-lg z-50">
          {toast}
        </div>
      )}

      <div>
        <h1 className="page-title">Jobs</h1>
        <p className="page-subtitle">Available pickups and your active deliveries</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-mac-sidebar rounded-xl p-1 w-fit">
        {[
          { key: 'available', label: `Available (${available.length})` },
          { key: 'mine',      label: `My Jobs (${activeMyJobs.length})` },
          { key: 'completed', label: `Completed (${completedJobs.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-white text-mac-label shadow-sm' : 'text-mac-secondary hover:text-mac-label'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Available Jobs */}
      {tab === 'available' && (
        available.length === 0 ? (
          <EmptyState title="No jobs available" description="New pickup requests will appear here." />
        ) : (
          <div className="grid gap-4">
            {available.map((job) => (
              <div key={job.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono font-bold text-mac-blue text-sm">{job.trackingId}</span>
                    <p className="text-xs text-mac-secondary mt-0.5">{formatDate(job.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-mac-green text-lg">{formatCurrency(job.price * 0.7)}</p>
                    <p className="text-xs text-mac-secondary">your earnings</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={10} className="text-mac-blue" />
                    </div>
                    <div>
                      <p className="text-xs text-mac-secondary">Pickup from</p>
                      <p className="font-medium">{job.pickupAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={10} className="text-mac-green" />
                    </div>
                    <div>
                      <p className="text-xs text-mac-secondary">Deliver to</p>
                      <p className="font-medium">{job.dropAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-mac-border pt-3">
                  <div className="flex items-center gap-3 text-xs text-mac-secondary">
                    <span className="flex items-center gap-1"><Package size={11} /> {PACKAGE_LABELS[job.packageType]}</span>
                    <span>{job.weight}kg</span>
                    {job.customer?.phone && <span className="flex items-center gap-1"><Phone size={11} /> {job.customer.phone}</span>}
                  </div>
                  <button
                    onClick={() => acceptJob(job.id)}
                    disabled={actionLoading === job.id}
                    className="btn-success text-sm py-1.5 px-4"
                  >
                    {actionLoading === job.id ? 'Accepting...' : 'Accept Job'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* My Active Jobs */}
      {tab === 'mine' && (
        activeMyJobs.length === 0 ? (
          <EmptyState title="No active jobs" description="Accept a job from the Available tab to get started." />
        ) : (
          <div className="grid gap-4">
            {activeMyJobs.map((job) => (
              <div key={job.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono font-bold text-mac-blue text-sm">{job.trackingId}</span>
                    <p className="text-xs text-mac-secondary">{job.customer?.name} · {job.customer?.phone}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>

                <div className="text-sm space-y-1 mb-4">
                  <p className="text-mac-secondary text-xs">Pickup: <span className="text-mac-label font-medium">{job.pickupAddress}</span></p>
                  <p className="text-mac-secondary text-xs">Drop: <span className="text-mac-label font-medium">{job.dropAddress}</span></p>
                  <p className="text-mac-secondary text-xs">{PACKAGE_LABELS[job.packageType]} · {job.weight}kg · {formatCurrency(job.price * 0.7)} your cut</p>
                </div>

                <div className="border-t border-mac-border pt-3">
                  <p className="text-xs text-mac-secondary mb-2 font-medium">Update Status</p>
                  <div className="flex gap-2 flex-wrap">
                    {STATUS_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => updateStatus(job.id, value)}
                        disabled={actionLoading === job.id || job.status === value}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                          job.status === value
                            ? 'bg-mac-green text-white border-mac-green'
                            : 'border-mac-border text-mac-label hover:border-mac-blue hover:text-mac-blue'
                        }`}
                      >
                        {actionLoading === job.id ? '...' : label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Completed */}
      {tab === 'completed' && (
        completedJobs.length === 0 ? (
          <EmptyState title="No completed deliveries yet" />
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead className="bg-mac-bg border-b border-mac-border">
                <tr>
                  <th className="table-header px-4 py-3 text-left">Tracking ID</th>
                  <th className="table-header px-4 py-3 text-left">Drop Address</th>
                  <th className="table-header px-4 py-3 text-left">Earned</th>
                  <th className="table-header px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mac-border">
                {completedJobs.map((job) => (
                  <tr key={job.id}>
                    <td className="table-cell font-mono font-semibold text-mac-blue text-xs">{job.trackingId}</td>
                    <td className="table-cell text-xs max-w-xs truncate">{job.dropAddress}</td>
                    <td className="table-cell font-semibold text-mac-green">{formatCurrency(job.price * 0.7)}</td>
                    <td className="table-cell text-xs text-mac-secondary">{formatDate(job.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}
