'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Clock, Truck, CheckCircle, Users, Bike, IndianRupee, XCircle, ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import StatsCard from '@/components/StatsCard'
import StatusBadge from '@/components/StatusBadge'
import LoadingSpinner from '@/components/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setData(data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const { stats, recentOrders } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Platform overview — real-time</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Orders"  value={stats.totalOrders}    icon={Package}     iconBg="bg-mac-blue" />
        <StatsCard title="Pending"        value={stats.pendingOrders}  icon={Clock}       iconBg="bg-mac-orange" />
        <StatsCard title="In Transit"     value={stats.inTransitOrders} icon={Truck}      iconBg="bg-mac-teal" />
        <StatsCard title="Delivered"      value={stats.deliveredOrders} icon={CheckCircle} iconBg="bg-mac-green" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Customers"  value={stats.totalCustomers} icon={Users}       iconBg="bg-mac-purple" />
        <StatsCard title="Partners"   value={stats.totalPartners}  icon={Bike}        iconBg="bg-mac-indigo" />
        <StatsCard title="Revenue"    value={formatCurrency(stats.totalRevenue)} icon={IndianRupee} iconBg="bg-mac-green" subtitle="Platform revenue (30%)" />
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-mac-label">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-mac-blue hover:underline flex items-center gap-1">
            View all <ArrowRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-mac-border">
              <tr>
                <th className="table-header text-left pb-3">Tracking ID</th>
                <th className="table-header text-left pb-3">Customer</th>
                <th className="table-header text-left pb-3">Partner</th>
                <th className="table-header text-left pb-3">Route</th>
                <th className="table-header text-left pb-3">Price</th>
                <th className="table-header text-left pb-3">Status</th>
                <th className="table-header text-left pb-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mac-border">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-mac-bg transition-colors">
                  <td className="table-cell font-mono text-mac-blue text-xs font-semibold">{order.trackingId}</td>
                  <td className="table-cell text-sm">{order.customer?.name}</td>
                  <td className="table-cell text-sm">{order.partner?.name || <span className="text-mac-secondary italic text-xs">Unassigned</span>}</td>
                  <td className="table-cell text-xs max-w-xs">
                    <p className="truncate text-mac-secondary" title={order.pickupAddress}>{order.pickupAddress}</p>
                    <p className="truncate font-medium" title={order.dropAddress}>→ {order.dropAddress}</p>
                  </td>
                  <td className="table-cell font-semibold">{formatCurrency(order.price)}</td>
                  <td className="table-cell"><StatusBadge status={order.status} /></td>
                  <td className="table-cell text-xs text-mac-secondary">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: stats.pendingOrders, color: 'bg-gray-100 text-gray-600' },
          { label: 'Assigned', value: stats.assignedOrders, color: 'bg-blue-100 text-mac-blue' },
          { label: 'In Transit', value: stats.inTransitOrders, color: 'bg-orange-100 text-mac-orange' },
          { label: 'Delivered', value: stats.deliveredOrders, color: 'bg-green-100 text-mac-green' },
          { label: 'Cancelled', value: stats.cancelledOrders, color: 'bg-red-100 text-mac-red' },
          { label: 'Total', value: stats.totalOrders, color: 'bg-indigo-100 text-mac-indigo' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-2xl p-4 ${color}`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
