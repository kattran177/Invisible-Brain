import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Invisible Brain',
  description: 'Voice-powered task capture',
  manifest: '/manifest.json',
  themeColor: '#667eea',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Invisible Brain',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
