'use client'
import { useEffect, useState } from 'react'
import { Bike, CheckCircle, IndianRupee, Star, Search, Plus, X } from 'lucide-react'
import api from '@/lib/api'
import StatsCard from '@/components/StatsCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { formatCurrency, formatDateShort } from '@/lib/utils'

const VEHICLES = ['Bike', 'Scooter', 'Van', 'Truck', 'Cycle']

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', vehicle: 'Bike' })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const load = () => {
    setLoading(true)
    api.get('/admin/partners').then(({ data }) => setPartners(data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)
    try {
      await api.post('/admin/partners', form)
      showToast(`Partner ${form.name} added successfully!`)
      setShowModal(false)
      setForm({ name: '', email: '', password: '', phone: '', vehicle: 'Bike' })
      load()
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create partner')
    } finally {
      setFormLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const filtered = partners.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  )

  const available = partners.filter((p) => p.isAvailable).length

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 bg-mac-label text-white px-4 py-3 rounded-xl text-sm shadow-lg z-50">{toast}</div>
      )}

      {/* Add Partner Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-mac-label text-lg">Add Delivery Partner</h3>
              <button onClick={() => { setShowModal(false); setFormError('') }} className="text-mac-secondary hover:text-mac-label">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="Raju Kumar" value={form.name} onChange={(e) => setF('name', e.target.value)} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="raju@partner.com" value={form.email} onChange={(e) => setF('email', e.target.value)} required />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" className="input" placeholder="Min 6 characters" value={form.password} onChange={(e) => setF('password', e.target.value)} minLength={6} required />
              </div>
              <div>
                <label className="label">Phone <span className="text-mac-secondary font-normal">(optional)</span></label>
                <input className="input" placeholder="9876543210" value={form.phone} onChange={(e) => setF('phone', e.target.value)} />
              </div>
              <div>
                <label className="label">Vehicle Type</label>
                <select className="input" value={form.vehicle} onChange={(e) => setF('vehicle', e.target.value)}>
                  {VEHICLES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-mac-red text-sm px-3 py-2 rounded-xl">{formError}</div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={formLoading} className="btn-primary flex-1">
                  {formLoading ? 'Adding...' : 'Add Partner'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setFormError('') }} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Delivery Partners</h1>
          <p className="page-subtitle">{partners.length} registered partners</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Partner
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Partners" value={partners.length} icon={Bike} iconBg="bg-mac-indigo" />
        <StatsCard title="Available Now" value={available} icon={CheckCircle} iconBg="bg-mac-green" />
        <StatsCard title="Total Deliveries" value={partners.reduce((s, p) => s + p.totalDeliveries, 0)} icon={CheckCircle} iconBg="bg-mac-orange" />
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mac-secondary" />
            <input className="input pl-9" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No partners yet"
            description="Add your first delivery partner to get started."
            action={<button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={14} /> Add Partner</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-mac-border">
                <tr>
                  {['Partner', 'Email', 'Phone', 'Vehicle', 'Status', 'Rating', 'Deliveries', 'Earned', 'Joined'].map((h) => (
                    <th key={h} className="table-header text-left pb-3 px-2 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-mac-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-mac-bg transition-colors">
                    <td className="table-cell px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-mac-orange/20 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-mac-orange text-xs font-bold">{p.name.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-sm whitespace-nowrap">{p.name}</span>
                      </div>
                    </td>
                    <td className="table-cell px-2 text-sm text-mac-secondary">{p.email}</td>
                    <td className="table-cell px-2 text-sm">{p.phone || '—'}</td>
                    <td className="table-cell px-2 text-sm">{p.vehicle}</td>
                    <td className="table-cell px-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        p.isAvailable ? 'bg-green-100 text-mac-green' : 'bg-red-100 text-mac-red'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.isAvailable ? 'bg-mac-green' : 'bg-mac-red'}`} />
                        {p.isAvailable ? 'Available' : 'On Job'}
                      </span>
                    </td>
                    <td className="table-cell px-2">
                      <span className="flex items-center gap-1 text-sm font-semibold text-mac-yellow">
                        <Star size={12} fill="currentColor" /> {p.rating?.toFixed(1)}
                      </span>
                    </td>
                    <td className="table-cell px-2 text-sm font-semibold">{p.totalDeliveries}</td>
                    <td className="table-cell px-2 text-sm font-semibold text-mac-green">{formatCurrency(p.totalEarned)}</td>
                    <td className="table-cell px-2 text-sm text-mac-secondary whitespace-nowrap">{formatDateShort(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
