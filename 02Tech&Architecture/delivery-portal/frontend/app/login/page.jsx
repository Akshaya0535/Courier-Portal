'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Zap, Package, Bike, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import api from '@/lib/api'
import useAuthStore from '@/store/authStore'

const ROLES = [
  { key: 'customer', label: 'Customer',  icon: Package,    color: 'text-mac-blue',   active: 'bg-mac-blue' },
  { key: 'partner',  label: 'Partner',   icon: Bike,       color: 'text-mac-orange', active: 'bg-mac-orange' },
  { key: 'admin',    label: 'Admin',     icon: ShieldCheck, color: 'text-mac-indigo', active: 'bg-mac-indigo' },
]

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuth } = useAuthStore()

  const [role, setRole] = useState(searchParams.get('role') || 'customer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const DEMO = {
    customer: { email: 'rahul@gmail.com',    password: 'password123' },
    partner:  { email: 'raju@partner.com',   password: 'partner123' },
    admin:    { email: 'admin@delivery.com', password: 'admin123' },
  }

  const fillDemo = () => {
    setEmail(DEMO[role].email)
    setPassword(DEMO[role].password)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password, role })
      setAuth(data.user, data.token)
      router.push(`/${role === 'admin' ? 'admin' : role === 'partner' ? 'partner' : 'customer'}/dashboard`)
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-mac-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="bg-mac-blue rounded-xl p-2.5">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-bold text-mac-label text-xl">DeliverEase</span>
          </div>
          <h1 className="text-2xl font-bold text-mac-label">Welcome back</h1>
          <p className="text-mac-secondary text-sm mt-1">Sign in to your portal</p>
        </div>

        <div className="card">
          {/* Role Tabs */}
          <div className="flex rounded-xl bg-mac-bg p-1 gap-1 mb-6">
            {ROLES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setRole(key); setError('') }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  role === key ? 'bg-white text-mac-label shadow-sm' : 'text-mac-secondary hover:text-mac-label'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mac-secondary"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-mac-red text-sm px-4 py-2.5 rounded-xl">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo fill */}
          <button
            onClick={fillDemo}
            className="mt-4 w-full text-center text-xs text-mac-secondary hover:text-mac-blue transition-colors py-2 border border-dashed border-mac-border rounded-xl"
          >
            Fill demo credentials for <span className="font-semibold capitalize">{role}</span>
          </button>

          {role !== 'admin' && (
            <p className="text-center text-sm text-mac-secondary mt-5">
              No account?{' '}
              <Link href={`/signup?role=${role}`} className="text-mac-blue font-medium hover:underline">
                Sign up
              </Link>
            </p>
          )}
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
