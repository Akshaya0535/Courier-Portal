'use client'
import { useState } from 'react'
import { Search, MapPin } from 'lucide-react'
import api from '@/lib/api'
import StatusBadge from '@/components/StatusBadge'
import { formatDate, formatCurrency, PACKAGE_LABELS } from '@/lib/utils'

const STATUS_STEPS = ['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED']

export default function CustomerTrackPage() {
  const [trackingId, setTrackingId] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setOrder(null)
    try {
      const { data } = await api.get(`/orders/track/${trackingId.trim().toUpperCase()}`)
      setOrder(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Order not found')
    } finally {
      setLoading(false)
    }
  }

  const currentStepIdx = order ? STATUS_STEPS.indexOf(order.status) : -1

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Track Order</h1>
        <p className="page-subtitle">Enter a tracking ID to see real-time status</p>
      </div>

      <form onSubmit={handleTrack} className="card">
        <div className="flex gap-3">
          <input
            className="input flex-1 uppercase placeholder:normal-case"
            placeholder="e.g. TRKABC001"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
          />
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 shrink-0">
            <Search size={16} /> {loading ? '...' : 'Track'}
          </button>
        </div>
      </form>

      {error && <div className="bg-red-50 border border-red-200 text-mac-red text-sm px-4 py-3 rounded-xl">{error}</div>}

      {order && (
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-mac-secondary">Tracking ID</p>
                <p className="font-bold text-lg">{order.trackingId}</p>
              </div>
              <StatusBadge status={order.status} size="md" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm border-t border-mac-border pt-4">
              <div><p className="text-mac-secondary text-xs mb-0.5">Package</p><p className="font-medium">{PACKAGE_LABELS[order.packageType]} · {order.weight}kg</p></div>
              <div><p className="text-mac-secondary text-xs mb-0.5">Price</p><p className="font-medium">{formatCurrency(order.price)}</p></div>
              <div><p className="text-mac-secondary text-xs mb-0.5 flex items-center gap-1"><MapPin size={10} />Pickup</p><p className="font-medium leading-snug">{order.pickupAddress}</p></div>
              <div><p className="text-mac-secondary text-xs mb-0.5 flex items-center gap-1"><MapPin size={10} />Delivery</p><p className="font-medium leading-snug">{order.dropAddress}</p></div>
            </div>
            {order.partner && (
              <div className="mt-4 pt-4 border-t border-mac-border flex items-center gap-3">
                <div className="w-9 h-9 bg-mac-orange rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{order.partner.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-xs text-mac-secondary">Your delivery partner</p>
                  <p className="font-semibold text-sm">{order.partner.name} · {order.partner.vehicle}</p>
                  {order.partner.phone && <p className="text-xs text-mac-secondary">{order.partner.phone}</p>}
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold mb-5">Delivery Timeline</h3>
            {order.status === 'CANCELLED' ? (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-mac-red text-sm">This order has been cancelled.</div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-5 bottom-5 w-0.5 bg-mac-border" />
                <div className="absolute left-4 top-5 w-0.5 bg-mac-green" style={{ height: `${Math.max(0, (currentStepIdx / (STATUS_STEPS.length - 1)) * 100)}%` }} />
                <div className="space-y-6">
                  {STATUS_STEPS.map((step, idx) => {
                    const done = idx <= currentStepIdx
                    const hist = order.statusHistory?.find((h) => h.status === step)
                    return (
                      <div key={step} className="flex items-start gap-4 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${done ? 'bg-mac-green border-mac-green' : 'bg-white border-mac-border'}`}>
                          {done && <span className="text-white text-xs">✓</span>}
                        </div>
                        <div className="pt-1">
                          <p className={`text-sm font-semibold ${done ? 'text-mac-label' : 'text-mac-secondary'}`}>{step.replace('_', ' ')}</p>
                          {hist && <><p className="text-xs text-mac-secondary">{hist.message}</p><p className="text-xs text-mac-secondary">{formatDate(hist.createdAt)}</p></>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
