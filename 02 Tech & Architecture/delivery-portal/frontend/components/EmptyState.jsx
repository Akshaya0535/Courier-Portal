import { PackageSearch } from 'lucide-react'

export default function EmptyState({ title = 'Nothing here yet', description = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <div className="w-14 h-14 bg-mac-sidebar rounded-2xl flex items-center justify-center">
        <PackageSearch size={26} className="text-mac-secondary" />
      </div>
      <p className="font-semibold text-mac-label">{title}</p>
      {description && <p className="text-mac-secondary text-sm max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
