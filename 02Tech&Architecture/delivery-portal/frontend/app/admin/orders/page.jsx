'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import StatusBadge from '@/components/StatusBadge'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { formatCurrency, formatDate, PACKAGE_LABELS } from '@/lib/utils'

const STATUSES = ['ALL', 'PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [partners, setPartners] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast] = useState('')
  const [assignModal, setAssignModal] = useState(null)
  const [selectedPartner, setSelectedPartner] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = () => {
    setLoading(true)
    const params = filter !== 'ALL' ? `?status=${filter}` : ''
    Promise.all([
      api.get(`/admin/orders${params}`),
      api.get('/admin/partners/available')
    ]).then(([ordersRes, partnersRes]) => {
      setOrders(ordersRes.data.orders)
      setPartners(partnersRes.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const assignPartner = async () => {
    if (!selectedPartner) return
    setActionLoading(assignModal.id)
    try {
      await api.patch(`/admin/orders/${assignModal.id}/assign`, { partnerId: selectedPartner })
      showToast('Partner assigned successfully!')
      setAssignModal(null)
      setSelectedPartner('')
      load()
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to assign partner')
    } finally {
      setActionLoading(null)
    }
  }

  const updateStatus = async (orderId, status) => {
    setActionLoading(orderId)
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status })
      showToast('Status updated!')
      load()
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-5 right-5 bg-mac-label text-white px-4 py-3 rounded-xl text-sm shadow-lg z-50">{toast}</div>
      )}

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-mac-label mb-1">Assign Delivery Partner</h3>
            <p className="text-xs text-mac-secondary mb-4">Order: {assignModal.trackingId}</p>
            <select
              className="input mb-4"
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
            >
              <option value="">Select a partner...</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>{p.name} · {p.vehicle} · ⭐ {p.rating}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={assignPartner}
                disabled={!selectedPartner || actionLoading === assignModal.id}
                className="btn-primary flex-1"
              >
                {actionLoading === assignModal.id ? 'Assigning...' : 'Assign'}
              </button>
              <button onClick={() => { setAssignModal(null); setSelectedPartner('') }} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="page-title">All Orders</h1>
        <p className="page-subtitle">Manage and assign all deliveries</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === s ? 'bg-mac-indigo text-white' : 'bg-white text-mac-secondary border border-mac-border hover:border-mac-indigo hover:text-mac-indigo'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : orders.length === 0 ? (
        <EmptyState title="No orders found" />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-mac-bg border-b border-mac-border">
                <tr>
                  {['Tracking ID', 'Customer', 'Partner', 'Package', 'Price', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="table-header px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-mac-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-mac-bg transition-colors">
                    <td className="table-cell font-mono text-mac-blue text-xs font-semibold whitespace-nowrap">{order.trackingId}</td>
                    <td className="table-cell">
                      <p className="text-sm font-medium">{order.customer?.name}</p>
                      <p className="text-xs text-mac-secondary">{order.customer?.phone}</p>
                    </td>
                    <td className="table-cell">
                      {order.partner ? (
                        <div>
                          <p className="text-sm font-medium">{order.partner.name}</p>
                          <p className="text-xs text-mac-secondary">{order.partner.vehicle}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-mac-secondary italic">Unassigned</span>
                      )}
                    </td>
                    <td className="table-cell text-xs whitespace-nowrap">
                      {PACKAGE_LABELS[order.packageType]}<br />{order.weight}kg
                    </td>
                    <td className="table-cell font-semibold whitespace-nowrap">{formatCurrency(order.price)}</td>
                    <td className="table-cell"><StatusBadge status={order.status} /></td>
                    <td className="table-cell text-xs text-mac-secondary whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => setAssignModal(order)}
                            className="text-xs bg-mac-blue text-white px-2.5 py-1 rounded-lg hover:opacity-90 whitespace-nowrap"
                          >
                            Assign
                          </button>
                        )}
                        {!['DELIVERED', 'CANCELLED'].includes(order.status) && (
                          <select
                            onChange={(e) => { if (e.target.value) updateStatus(order.id, e.target.value) }}
                            defaultValue=""
                            className="text-xs border border-mac-border rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-mac-indigo"
                          >
                            <option value="" disabled>Status...</option>
                            {['PENDING','ASSIGNED','PICKED_UP','IN_TRANSIT','DELIVERED','CANCELLED'].map((s) => (
                              <option key={s} value={s}>{s.replace('_', ' ')}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
