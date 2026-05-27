'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, ClipboardList, Users, Bike } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import useAuthStore from '@/store/authStore'

const NAV = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'All Orders', href: '/admin/orders',   icon: ClipboardList },
  { label: 'Customers',  href: '/admin/users',    icon: Users },
  { label: 'Partners',   href: '/admin/partners', icon: Bike },
]

export default function AdminLayout({ children }) {
  const { user, token } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!token || user?.role !== 'admin') router.push('/login?role=admin')
  }, [token, user, router])

  if (!token || user?.role !== 'admin') return null

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar items={NAV} accentColor="bg-mac-indigo" />
      <main className="flex-1 overflow-y-auto bg-mac-bg">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
