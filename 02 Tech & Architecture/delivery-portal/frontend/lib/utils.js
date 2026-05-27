export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date))

export const formatDateShort = (date) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))

export const STATUS_LABELS = {
  PENDING: 'Pending',
  ASSIGNED: 'Assigned',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

export const STATUS_COLORS = {
  PENDING:    { bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400' },
  ASSIGNED:   { bg: 'bg-blue-100',   text: 'text-mac-blue',   dot: 'bg-mac-blue' },
  PICKED_UP:  { bg: 'bg-teal-100',   text: 'text-teal-600',   dot: 'bg-mac-teal' },
  IN_TRANSIT: { bg: 'bg-orange-100', text: 'text-orange-600', dot: 'bg-mac-orange' },
  DELIVERED:  { bg: 'bg-green-100',  text: 'text-green-600',  dot: 'bg-mac-green' },
  CANCELLED:  { bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-mac-red' },
}

export const PACKAGE_LABELS = {
  DOCUMENT: 'Document',
  SMALL: 'Small Package',
  MEDIUM: 'Medium Package',
  LARGE: 'Large Package',
  FRAGILE: 'Fragile Item',
}
