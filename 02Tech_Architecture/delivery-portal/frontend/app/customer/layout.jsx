'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, PlusCircle, MapPin, ClipboardList, User } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import useAuthStore from '@/store/authStore'

const NAV = [
  { label: 'Dashboard',    href: '/customer/dashboard', icon: LayoutDashboard },
  { label: 'New Order',    href: '/customer/new-order', icon: PlusCircle },
  { label: 'Track Order',  href: '/customer/track',     icon: MapPin },
  { label: 'Order History',href: '/customer/history',   icon: ClipboardList },
  { label: 'Profile',      href: '/customer/profile',   icon: User },
]

export default function CustomerLayout({ children }) {
  const { user, token } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!token || user?.role !== 'customer') router.push('/login?role=customer')
  }, [token, user, router])

  if (!token || user?.role !== 'customer') return null

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar items={NAV} accentColor="bg-mac-blue" />
      <main className="flex-1 overflow-y-auto bg-mac-bg">
        <div className="p-6 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
