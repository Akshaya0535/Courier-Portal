import { STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'

export default function StatusBadge({ status, size = 'sm' }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.PENDING
  const label = STATUS_LABELS[status] || status

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${colors.bg} ${colors.text} ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} inline-block`} />
      {label}
    </span>
  )
}
