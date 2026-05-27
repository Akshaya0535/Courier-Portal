'use client'
import { useEffect, useState } from 'react'
import { Users, Package, Search } from 'lucide-react'
import api from '@/lib/api'
import StatsCard from '@/components/StatsCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { formatDateShort } from '@/lib/utils'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/admin/users').then(({ data }) => setUsers(data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Customers</h1>
        <p className="page-subtitle">{users.length} registered customers</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard title="Total Customers" value={users.length} icon={Users} iconBg="bg-mac-purple" />
        <StatsCard title="Total Orders" value={users.reduce((sum, u) => sum + u.orderCount, 0)} icon={Package} iconBg="bg-mac-blue" />
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mac-secondary" />
            <input
              className="input pl-9"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No customers found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-mac-border">
                <tr>
                  {['Name', 'Email', 'Phone', 'Orders', 'Joined'].map((h) => (
                    <th key={h} className="table-header text-left pb-3 px-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-mac-border">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-mac-bg transition-colors">
                    <td className="table-cell px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-mac-purple/20 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-mac-purple text-xs font-bold">{user.name.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td className="table-cell px-2 text-sm text-mac-secondary">{user.email}</td>
                    <td className="table-cell px-2 text-sm">{user.phone || '—'}</td>
                    <td className="table-cell px-2">
                      <span className="bg-blue-100 text-mac-blue text-xs font-semibold px-2 py-0.5 rounded-full">
                        {user.orderCount} orders
                      </span>
                    </td>
                    <td className="table-cell px-2 text-sm text-mac-secondary">{formatDateShort(user.createdAt)}</td>
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
