import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Wajeeha Traders',
  description: 'Simple inventory and sales management',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
