import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'お年玉管理',
  description: '夫婦で共有するお年玉管理アプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <meta name="theme-color" content="#f8fafc" />
      </head>
      <body>{children}</body>
    </html>
  )
}
