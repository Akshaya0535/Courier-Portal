'use client'
import { useRouter } from 'next/navigation'
import { Package, Bike, ShieldCheck, ArrowRight, Zap } from 'lucide-react'

const portals = [
  {
    role: 'customer',
    title: 'Customer Portal',
    description: 'Book pickups, track parcels, view order history',
    icon: Package,
    color: 'mac-blue',
    bg: 'bg-blue-50',
    iconBg: 'bg-mac-blue',
    href: '/customer/dashboard',
    loginHref: '/login?role=customer',
  },
  {
    role: 'partner',
    title: 'Delivery Partner',
    description: 'Accept jobs, update delivery status, track earnings',
    icon: Bike,
    color: 'mac-orange',
    bg: 'bg-orange-50',
    iconBg: 'bg-mac-orange',
    href: '/partner/dashboard',
    loginHref: '/login?role=partner',
  },
  {
    role: 'admin',
    title: 'Admin Panel',
    description: 'Manage orders, assign partners, view analytics',
    icon: ShieldCheck,
    color: 'mac-indigo',
    bg: 'bg-indigo-50',
    iconBg: 'bg-mac-indigo',
    href: '/admin/dashboard',
    loginHref: '/login?role=admin',
  },
]

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-mac-bg flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-mac-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <div className="bg-mac-blue rounded-xl p-2">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-mac-label text-lg">DeliverEase</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-mac-blue text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-mac-green animate-pulse inline-block" />
            MVP — Live & Ready
          </div>
          <h1 className="text-4xl font-bold text-mac-label mb-4">
            Delivery Service Portal
          </h1>
          <p className="text-mac-secondary text-lg max-w-md">
            Doorstep pickup to pan-India delivery — tracked at every step.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl">
          {portals.map(({ role, title, description, icon: Icon, iconBg, bg, loginHref }) => (
            <button
              key={role}
              onClick={() => router.push(loginHref)}
              className="card hover:shadow-md hover:-translate-y-0.5 transition-all text-left group cursor-pointer"
            >
              <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center mb-4`}>
                <Icon size={22} className="text-white" />
              </div>
              <h2 className="font-semibold text-mac-label text-lg mb-1">{title}</h2>
              <p className="text-mac-secondary text-sm mb-5">{description}</p>
              <div className="flex items-center gap-1 text-sm font-medium text-mac-blue">
                Enter Portal <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        {/* Track without login */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/track')}
            className="text-sm text-mac-secondary hover:text-mac-blue transition-colors underline underline-offset-2"
          >
            Track an order without logging in →
          </button>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-mac-secondary border-t border-mac-border">
        DeliverEase MVP · Built for demo
      </footer>
    </div>
  )
}
