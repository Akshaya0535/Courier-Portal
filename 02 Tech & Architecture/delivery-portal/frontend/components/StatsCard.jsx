export default function StatsCard({ title, value, subtitle, icon: Icon, iconBg = 'bg-mac-blue', trend }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center shrink-0`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-mac-secondary text-xs font-medium uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-mac-label mt-0.5">{value}</p>
        {subtitle && <p className="text-mac-secondary text-xs mt-0.5">{subtitle}</p>}
        {trend && (
          <p className={`text-xs mt-1 font-medium ${trend > 0 ? 'text-mac-green' : 'text-mac-red'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% this week
          </p>
        )}
      </div>
    </div>
  )
}
