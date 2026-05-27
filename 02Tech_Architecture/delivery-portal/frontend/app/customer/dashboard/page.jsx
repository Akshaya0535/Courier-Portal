'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Truck, CheckCircle, PlusCircle, MapPin } from 'lucide-react'
import api from '@/lib/api'
import useAuthStore from '@/store/authStore'
import StatsCard from '@/components/StatsCard'
import StatusBadge from '@/components/StatusBadge'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { formatDate, formatCurrency, PACKAGE_LABELS } from '@/lib/utils'

export default function CustomerDashboard() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/my').then(({ data }) => setOrders(data)).finally(() => setLoading(false))
  }, [])

  const total = orders.length
  const active = orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status)).length
  const delivered = orders.filter((o) => o.status === 'DELIVERED').length

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Hello, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your deliveries</p>
        </div>
        <Link href="/customer/new-order" className="btn-primary flex items-center gap-2">
          <PlusCircle size={16} /> New Order
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Orders" value={total} icon={Package} iconBg="bg-mac-blue" subtitle="All time" />
        <StatsCard title="Active" value={active} icon={Truck} iconBg="bg-mac-orange" subtitle="In progress" />
        <StatsCard title="Delivered" value={delivered} icon={CheckCircle} iconBg="bg-mac-green" subtitle="Completed" />
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-mac-label">Recent Orders</h2>
          <Link href="/customer/history" className="text-sm text-mac-blue hover:underline">View all</Link>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Book your first doorstep pickup and we'll handle the rest."
            action={<Link href="/customer/new-order" className="btn-primary">Book a Pickup</Link>}
          />
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-mac-bg rounded-xl hover:bg-mac-sidebar transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-mac-blue/10 rounded-xl flex items-center justify-center shrink-0">
                    <Package size={18} className="text-mac-blue" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-mac-label">{order.trackingId}</p>
                    <p className="text-xs text-mac-secondary truncate">{order.dropAddress}</p>
                    <p className="text-xs text-mac-secondary">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-semibold text-mac-label">{formatCurrency(order.price)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Track */}
      <div className="card bg-gradient-to-br from-blue-50 to-white border-blue-100">
        <div className="flex items-center gap-3 mb-3">
          <MapPin size={18} className="text-mac-blue" />
          <h2 className="font-semibold text-mac-label">Quick Track</h2>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const id = e.target.trackingId.value.trim().toUpperCase()
            if (id) window.location.href = `/track?id=${id}`
          }}
          className="flex gap-3"
        >
          <input name="trackingId" className="input flex-1" placeholder="Enter tracking ID" />
          <button type="submit" className="btn-primary">Track</button>
        </form>
      </div>
    </div>
  )
}
