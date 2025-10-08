import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { OfflineIndicator } from '@/components/pwa-offline-indicator'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import './globals.css'

export const metadata: Metadata = {
  title: 'KairuFlow - Productivité Énergétique',
  description: 'Application de productivité intelligente avec suivi énergétique et gestion de tâches optimale',
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: ['productivité', 'énergie', 'tâches', 'gestion du temps', 'offline'],
  authors: [{ name: 'KairuFlow' }],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KairuFlow',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <OfflineIndicator />
        <PWAInstallPrompt />
        <Analytics />
      </body>
    </html>
  )
}
