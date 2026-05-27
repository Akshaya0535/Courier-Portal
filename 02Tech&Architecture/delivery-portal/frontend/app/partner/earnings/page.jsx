'use client'
import { useEffect, useState } from 'react'
import { IndianRupee, TrendingUp, CheckCircle } from 'lucide-react'
import api from '@/lib/api'
import StatsCard from '@/components/StatsCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function PartnerEarningsPage() {
  const [data, setData] = useState({ earnings: [], totalEarned: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/partners/earnings').then(({ data }) => setData(data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const thisMonth = data.earnings
    .filter((e) => new Date(e.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Earnings</h1>
        <p className="page-subtitle">Your delivery income summary</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Earned" value={formatCurrency(data.totalEarned)} icon={IndianRupee} iconBg="bg-mac-green" />
        <StatsCard title="This Month" value={formatCurrency(thisMonth)} icon={TrendingUp} iconBg="bg-mac-blue" />
        <StatsCard title="Deliveries" value={data.earnings.length} icon={CheckCircle} iconBg="bg-mac-orange" />
      </div>

      <div className="card">
        <h2 className="font-semibold text-mac-label mb-5">Earnings History</h2>

        {data.earnings.length === 0 ? (
          <EmptyState title="No earnings yet" description="Complete your first delivery to start earning." />
        ) : (
          <div className="overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-mac-border">
                <tr>
                  <th className="table-header text-left pb-3">Tracking ID</th>
                  <th className="table-header text-left pb-3">Delivery Address</th>
                  <th className="table-header text-left pb-3">Order Value</th>
                  <th className="table-header text-left pb-3">Your Earning</th>
                  <th className="table-header text-left pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mac-border">
                {data.earnings.map((e) => (
                  <tr key={e.id} className="hover:bg-mac-bg transition-colors">
                    <td className="table-cell font-mono text-mac-blue text-xs">{e.order?.trackingId}</td>
                    <td className="table-cell text-xs max-w-xs truncate text-mac-secondary">{e.order?.dropAddress}</td>
                    <td className="table-cell text-xs">{formatCurrency(e.order?.price)}</td>
                    <td className="table-cell font-semibold text-mac-green">{formatCurrency(e.amount)}</td>
                    <td className="table-cell text-xs text-mac-secondary">{formatDate(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-mac-border pt-4 mt-2 flex justify-end">
              <div className="text-right">
                <p className="text-xs text-mac-secondary">Total Earnings</p>
                <p className="text-xl font-bold text-mac-green">{formatCurrency(data.totalEarned)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card bg-gradient-to-br from-green-50 to-white border-green-100">
        <p className="text-sm font-semibold text-mac-label mb-1">Payout Info</p>
        <p className="text-xs text-mac-secondary">You earn 70% of each order value. Payouts are processed weekly via bank transfer to your registered account.</p>
      </div>
    </div>
  )
}
