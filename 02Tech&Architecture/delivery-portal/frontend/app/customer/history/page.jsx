'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, ExternalLink } from 'lucide-react'
import api from '@/lib/api'
import StatusBadge from '@/components/StatusBadge'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { formatDate, formatCurrency, PACKAGE_LABELS } from '@/lib/utils'

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    api.get('/orders/my').then(({ data }) => setOrders(data)).finally(() => setLoading(false))
  }, [])

  const FILTERS = ['ALL', 'PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']
  const filtered = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter)

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Order History</h1>
        <p className="page-subtitle">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === f ? 'bg-mac-blue text-white' : 'bg-white text-mac-secondary border border-mac-border hover:border-mac-blue hover:text-mac-blue'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No orders found"
          description={filter === 'ALL' ? 'You have not placed any orders yet.' : `No ${filter.replace('_', ' ').toLowerCase()} orders.`}
          action={filter === 'ALL' && <Link href="/customer/new-order" className="btn-primary">Book a Pickup</Link>}
        />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-mac-bg border-b border-mac-border">
              <tr>
                <th className="table-header px-4 py-3 text-left">Tracking ID</th>
                <th className="table-header px-4 py-3 text-left">Route</th>
                <th className="table-header px-4 py-3 text-left">Package</th>
                <th className="table-header px-4 py-3 text-left">Price</th>
                <th className="table-header px-4 py-3 text-left">Status</th>
                <th className="table-header px-4 py-3 text-left">Date</th>
                <th className="table-header px-4 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mac-border">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-mac-bg transition-colors">
                  <td className="table-cell font-mono font-semibold text-mac-blue">{order.trackingId}</td>
                  <td className="table-cell">
                    <p className="text-xs text-mac-secondary truncate max-w-36" title={order.pickupAddress}>{order.pickupAddress}</p>
                    <p className="text-xs font-medium truncate max-w-36" title={order.dropAddress}>→ {order.dropAddress}</p>
                  </td>
                  <td className="table-cell text-xs">{PACKAGE_LABELS[order.packageType]}<br />{order.weight}kg</td>
                  <td className="table-cell font-semibold">{formatCurrency(order.price)}</td>
                  <td className="table-cell"><StatusBadge status={order.status} /></td>
                  <td className="table-cell text-xs text-mac-secondary">{formatDate(order.createdAt)}</td>
                  <td className="table-cell">
                    <Link href={`/track?id=${order.trackingId}`} className="text-mac-blue hover:underline flex items-center gap-1 text-xs">
                      Track <ExternalLink size={11} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
