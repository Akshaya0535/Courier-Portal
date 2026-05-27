'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, Briefcase, IndianRupee, User } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import useAuthStore from '@/store/authStore'

const NAV = [
  { label: 'Dashboard', href: '/partner/dashboard', icon: LayoutDashboard },
  { label: 'Jobs',      href: '/partner/jobs',      icon: Briefcase },
  { label: 'Earnings',  href: '/partner/earnings',  icon: IndianRupee },
  { label: 'Profile',   href: '/partner/profile',   icon: User },
]

export default function PartnerLayout({ children }) {
  const { user, token } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!token || user?.role !== 'partner') router.push('/login?role=partner')
  }, [token, user, router])

  if (!token || user?.role !== 'partner') return null

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar items={NAV} accentColor="bg-mac-orange" />
      <main className="flex-1 overflow-y-auto bg-mac-bg">
        <div className="p-6 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
