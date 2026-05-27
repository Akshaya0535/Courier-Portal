'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Briefcase, IndianRupee, CheckCircle, Bike, ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import useAuthStore from '@/store/authStore'
import StatsCard from '@/components/StatsCard'
import StatusBadge from '@/components/StatusBadge'
import LoadingSpinner from '@/components/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function PartnerDashboard() {
  const { user } = useAuthStore()
  const [jobs, setJobs] = useState([])
  const [available, setAvailable] = useState([])
  const [earnings, setEarnings] = useState({ totalEarned: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/partners/jobs/mine'),
      api.get('/partners/jobs/available'),
      api.get('/partners/earnings')
    ]).then(([myRes, avRes, earRes]) => {
      setJobs(myRes.data)
      setAvailable(avRes.data)
      setEarnings(earRes.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const active = jobs.filter((j) => !['DELIVERED', 'CANCELLED'].includes(j.status))
  const delivered = jobs.filter((j) => j.status === 'DELIVERED')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Hey, {user?.name?.split(' ')[0]} 🚴</h1>
        <p className="page-subtitle">Your delivery dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatsCard title="Available Jobs" value={available.length} icon={Briefcase} iconBg="bg-mac-blue" />
        <StatsCard title="Active Jobs" value={active.length} icon={Bike} iconBg="bg-mac-orange" />
        <StatsCard title="Delivered" value={delivered.length} icon={CheckCircle} iconBg="bg-mac-green" />
        <StatsCard title="Total Earned" value={formatCurrency(earnings.totalEarned)} icon={IndianRupee} iconBg="bg-mac-indigo" />
      </div>

      {/* Available Jobs Preview */}
      {available.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-mac-label">Available Jobs ({available.length})</h2>
            <Link href="/partner/jobs" className="text-sm text-mac-blue hover:underline flex items-center gap-1">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            {available.slice(0, 3).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 bg-mac-bg rounded-xl">
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{job.trackingId}</p>
                  <p className="text-xs text-mac-secondary truncate">{job.pickupAddress} → {job.dropAddress}</p>
                  <p className="text-xs text-mac-secondary mt-0.5">{job.packageType} · {job.weight}kg</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="font-bold text-mac-green">{formatCurrency(job.price * 0.7)}</p>
                  <p className="text-xs text-mac-secondary">your cut</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Jobs */}
      {active.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-mac-label">Your Active Jobs</h2>
            <Link href="/partner/jobs" className="text-sm text-mac-blue hover:underline">Manage</Link>
          </div>
          <div className="space-y-3">
            {active.slice(0, 3).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 bg-mac-bg rounded-xl">
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{job.trackingId}</p>
                  <p className="text-xs text-mac-secondary truncate">{job.dropAddress}</p>
                  <p className="text-xs text-mac-secondary">{formatDate(job.updatedAt)}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
