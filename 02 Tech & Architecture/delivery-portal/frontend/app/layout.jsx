import './globals.css'

export const metadata = {
  title: 'DeliverEase — Delivery Service Portal',
  description: 'Book, track and manage deliveries across India',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
