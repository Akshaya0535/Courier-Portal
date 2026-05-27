'use client'
import { useEffect, useState } from 'react'
import { User, Mail, Phone, Calendar, Package, CheckCircle } from 'lucide-react'
import api from '@/lib/api'
import useAuthStore from '@/store/authStore'
import LoadingSpinner from '@/components/LoadingSpinner'
import { formatDateShort } from '@/lib/utils'

export default function CustomerProfilePage() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/auth/me'),
      api.get('/orders/my')
    ]).then(([profileRes, ordersRes]) => {
      setProfile(profileRes.data)
      setOrders(ordersRes.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const delivered = orders.filter((o) => o.status === 'DELIVERED').length
  const active = orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status)).length

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Your account details</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-mac-border">
          <div className="w-16 h-16 bg-mac-blue rounded-2xl flex items-center justify-center shrink-0">
            <span className="text-white text-2xl font-bold">{profile?.name?.charAt(0)}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-mac-label">{profile?.name}</h2>
            <p className="text-mac-secondary text-sm">Customer Account</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-mac-bg rounded-lg flex items-center justify-center shrink-0">
              <Mail size={15} className="text-mac-secondary" />
            </div>
            <div>
              <p className="text-mac-secondary text-xs">Email</p>
              <p className="font-medium">{profile?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-mac-bg rounded-lg flex items-center justify-center shrink-0">
              <Phone size={15} className="text-mac-secondary" />
            </div>
            <div>
              <p className="text-mac-secondary text-xs">Phone</p>
              <p className="font-medium">{profile?.phone || 'Not added'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-mac-bg rounded-lg flex items-center justify-center shrink-0">
              <Calendar size={15} className="text-mac-secondary" />
            </div>
            <div>
              <p className="text-mac-secondary text-xs">Member Since</p>
              <p className="font-medium">{profile?.createdAt ? formatDateShort(profile.createdAt) : '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-mac-label">{orders.length}</p>
          <p className="text-xs text-mac-secondary mt-1 flex items-center justify-center gap-1"><Package size={11} /> Total Orders</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-mac-orange">{active}</p>
          <p className="text-xs text-mac-secondary mt-1">Active</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-mac-green">{delivered}</p>
          <p className="text-xs text-mac-secondary mt-1 flex items-center justify-center gap-1"><CheckCircle size={11} /> Delivered</p>
        </div>
      </div>
    </div>
  )
}
