'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Weight, CheckCircle, CreditCard, Wallet } from 'lucide-react'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import AddressAutocomplete from '@/components/AddressAutocomplete'

const PACKAGE_TYPES = [
  { value: 'DOCUMENT', label: 'Document',  desc: 'Papers, envelopes',  base: 49  },
  { value: 'SMALL',    label: 'Small',     desc: 'Upto 2kg',           base: 79  },
  { value: 'MEDIUM',   label: 'Medium',    desc: '2–5kg',              base: 99  },
  { value: 'LARGE',    label: 'Large',     desc: '5–15kg',             base: 149 },
  { value: 'FRAGILE',  label: 'Fragile',   desc: 'Glass, ceramics',    base: 199 },
]

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

export default function NewOrderPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    pickupAddress: '', dropAddress: '', packageType: 'MEDIUM', weight: '1', notes: ''
  })
  const [estimate, setEstimate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [payLoading, setPayLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    if (!form.packageType || !form.weight) return
    api.get(`/orders/estimate?packageType=${form.packageType}&weight=${form.weight}`)
      .then(({ data }) => setEstimate(data.price))
      .catch(() => {})
  }, [form.packageType, form.weight])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/orders', form)
      setSuccess(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const handleRazorpay = async () => {
    if (!success) return
    setPayLoading(true)
    setError('')

    try {
      const loaded = await loadRazorpay()
      if (!loaded) throw new Error('Razorpay failed to load')

      const { data } = await api.post('/payments/create-order', { orderId: success.id })

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'DeliverEase',
        description: `Order ${data.trackingId}`,
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: success.id,
            })
            setSuccess((s) => ({ ...s, isPaid: true, paymentId: response.razorpay_payment_id }))
          } catch {
            setError('Payment verified but confirmation failed. Contact support.')
          }
        },
        prefill: { name: data.customerName },
        theme: { color: '#007AFF' },
        modal: { ondismiss: () => setPayLoading(false) },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Payment failed')
    } finally {
      setPayLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card text-center py-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-mac-green" />
          </div>
          <h2 className="text-xl font-bold text-mac-label mb-1">Order Placed!</h2>
          <p className="text-mac-secondary text-sm mb-6">A rider will be assigned shortly.</p>

          <div className="bg-mac-bg rounded-xl p-4 mb-6 text-left space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-mac-secondary">Tracking ID</span>
              <span className="font-bold text-mac-blue">{success.trackingId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-mac-secondary">Price</span>
              <span className="font-semibold">{formatCurrency(success.price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-mac-secondary">Payment</span>
              <span className={`font-semibold ${success.isPaid ? 'text-mac-green' : 'text-mac-orange'}`}>
                {success.isPaid ? `✅ Paid (${success.paymentId?.slice(0, 12)}...)` : 'Pending'}
              </span>
            </div>
          </div>

          {/* Razorpay CTA */}
          {!success.isPaid && (
            <button
              onClick={handleRazorpay}
              disabled={payLoading}
              className="btn-primary w-full mb-3 flex items-center justify-center gap-2 py-3"
            >
              <CreditCard size={16} />
              {payLoading ? 'Opening Payment...' : `Pay ${formatCurrency(success.price)} via Razorpay`}
            </button>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-mac-red text-xs px-3 py-2 rounded-xl mb-3">{error}</div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/track?id=${success.trackingId}`)}
              className="btn-secondary flex-1"
            >
              Track Order
            </button>
            <button
              onClick={() => { setSuccess(null); setForm({ pickupAddress: '', dropAddress: '', packageType: 'MEDIUM', weight: '1', notes: '' }) }}
              className="btn-secondary flex-1"
            >
              New Order
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Book a Pickup</h1>
        <p className="page-subtitle">Fill in the details and we'll assign a rider to your door</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Addresses */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-mac-label">Addresses</h2>
          <AddressAutocomplete
            label="Pickup Address"
            placeholder="Start typing your address..."
            value={form.pickupAddress}
            onChange={(val) => set('pickupAddress', val)}
            required
          />
          <AddressAutocomplete
            label="Delivery Address"
            placeholder="Where should we deliver?"
            value={form.dropAddress}
            onChange={(val) => set('dropAddress', val)}
            required
          />
        </div>

        {/* Package Details */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-mac-label flex items-center gap-2">
            <Package size={16} className="text-mac-blue" /> Package Details
          </h2>

          <div>
            <label className="label">Package Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PACKAGE_TYPES.map(({ value, label, desc, base }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('packageType', value)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    form.packageType === value
                      ? 'border-mac-blue bg-blue-50'
                      : 'border-mac-border bg-white hover:border-mac-blue/50'
                  }`}
                >
                  <p className="font-semibold text-sm text-mac-label">{label}</p>
                  <p className="text-xs text-mac-secondary">{desc}</p>
                  <p className="text-xs font-medium text-mac-blue mt-1">from ₹{base}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-1"><Weight size={13} /> Weight (kg)</label>
            <input
              type="number"
              className="input"
              min="0.1" max="100" step="0.1"
              value={form.weight}
              onChange={(e) => set('weight', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Notes <span className="text-mac-secondary font-normal">(optional)</span></label>
            <input
              className="input"
              placeholder="e.g. Fragile, handle with care"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>
        </div>

        {/* Price estimate */}
        {estimate !== null && (
          <div className="card bg-gradient-to-br from-blue-50 to-white border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-mac-secondary font-medium uppercase tracking-wide">Estimated Price</p>
                <p className="text-3xl font-bold text-mac-label">{formatCurrency(estimate)}</p>
                <p className="text-xs text-mac-secondary mt-0.5">Includes doorstep pickup · Pay after booking</p>
              </div>
              <div className="text-right text-xs text-mac-secondary space-y-0.5">
                <p>Base: ₹{PACKAGE_TYPES.find(p => p.value === form.packageType)?.base}</p>
                <p>Weight: ₹{(parseFloat(form.weight || 0) * 10).toFixed(0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-blue-100">
              <Wallet size={13} className="text-mac-blue" />
              <p className="text-xs text-mac-blue font-medium">Pay via Razorpay (UPI, Cards, Netbanking) after placing order</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-mac-red text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
          {loading ? 'Placing Order...' : `Confirm Booking${estimate ? ` — ${formatCurrency(estimate)}` : ''}`}
        </button>
      </form>
    </div>
  )
}
