'use client'
import { useEffect, useState } from 'react'
import { Mail, Phone, Bike, Star, IndianRupee, CheckCircle, Calendar } from 'lucide-react'
import api from '@/lib/api'
import LoadingSpinner from '@/components/LoadingSpinner'
import { formatCurrency, formatDateShort } from '@/lib/utils'

export default function PartnerProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/partners/profile').then(({ data }) => setProfile(data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Your delivery partner account</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-mac-border">
          <div className="w-16 h-16 bg-mac-orange rounded-2xl flex items-center justify-center shrink-0">
            <span className="text-white text-2xl font-bold">{profile?.name?.charAt(0)}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-mac-label">{profile?.name}</h2>
            <p className="text-mac-secondary text-sm">Delivery Partner</p>
            <div className="flex items-center gap-1 mt-1">
              <span className={`w-2 h-2 rounded-full ${profile?.isAvailable ? 'bg-mac-green' : 'bg-mac-red'}`} />
              <span className="text-xs text-mac-secondary">{profile?.isAvailable ? 'Available' : 'On a job'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { icon: Mail,      label: 'Email',   value: profile?.email },
            { icon: Phone,     label: 'Phone',   value: profile?.phone || 'Not added' },
            { icon: Bike,      label: 'Vehicle', value: profile?.vehicle },
            { icon: Calendar,  label: 'Member Since', value: profile?.createdAt ? formatDateShort(profile.createdAt) : '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-mac-bg rounded-lg flex items-center justify-center shrink-0">
                <Icon size={15} className="text-mac-secondary" />
              </div>
              <div>
                <p className="text-mac-secondary text-xs">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="flex items-center justify-center gap-1 text-mac-yellow mb-1">
            <Star size={16} fill="currentColor" />
            <span className="font-bold text-mac-label">{profile?.rating?.toFixed(1)}</span>
          </div>
          <p className="text-xs text-mac-secondary">Rating</p>
        </div>
        <div className="card text-center">
          <p className="text-xl font-bold text-mac-green">{formatCurrency(profile?.totalEarned)}</p>
          <p className="text-xs text-mac-secondary mt-1 flex items-center justify-center gap-1"><IndianRupee size={10} /> Total Earned</p>
        </div>
        <div className="card text-center">
          <p className="text-xl font-bold text-mac-label">{profile?.totalDeliveries}</p>
          <p className="text-xs text-mac-secondary mt-1 flex items-center justify-center gap-1"><CheckCircle size={10} /> Delivered</p>
        </div>
      </div>
    </div>
  )
}
