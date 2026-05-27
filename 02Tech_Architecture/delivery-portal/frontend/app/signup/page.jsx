'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Zap, Package, Bike } from 'lucide-react'
import api from '@/lib/api'
import useAuthStore from '@/store/authStore'

const VEHICLES = ['Bike', 'Scooter', 'Van', 'Truck', 'Cycle']

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuth } = useAuthStore()

  const [role, setRole] = useState(searchParams.get('role') || 'customer')
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', vehicle: 'Bike' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', { ...form, role })
      setAuth(data.user, data.token)
      router.push(`/${role === 'partner' ? 'partner' : 'customer'}/dashboard`)
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-mac-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="bg-mac-blue rounded-xl p-2.5">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-bold text-mac-label text-xl">DeliverEase</span>
          </div>
          <h1 className="text-2xl font-bold text-mac-label">Create account</h1>
          <p className="text-mac-secondary text-sm mt-1">Join as a customer or delivery partner</p>
        </div>

        <div className="card">
          {/* Role Toggle */}
          <div className="flex rounded-xl bg-mac-bg p-1 gap-1 mb-6">
            {[
              { key: 'customer', label: 'Customer', icon: Package },
              { key: 'partner',  label: 'Partner',  icon: Bike },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setRole(key); setError('') }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  role === key ? 'bg-white text-mac-label shadow-sm' : 'text-mac-secondary hover:text-mac-label'
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" placeholder="Rahul Sharma" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>

            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} required />
            </div>

            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Min 6 characters" value={form.password} onChange={(e) => set('password', e.target.value)} minLength={6} required />
            </div>

            <div>
              <label className="label">Phone <span className="text-mac-secondary font-normal">(optional)</span></label>
              <input className="input" placeholder="9876543210" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>

            {role === 'partner' && (
              <div>
                <label className="label">Vehicle Type</label>
                <select className="input" value={form.vehicle} onChange={(e) => set('vehicle', e.target.value)}>
                  {VEHICLES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-mac-red text-sm px-4 py-2.5 rounded-xl">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-mac-secondary mt-5">
            Already have an account?{' '}
            <Link href={`/login?role=${role}`} className="text-mac-blue font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-sm text-mac-secondary hover:text-mac-blue transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
