import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Invisible Brain',
  description: 'Voice-powered task capture',
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
