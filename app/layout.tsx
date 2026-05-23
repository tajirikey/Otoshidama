import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'お年玉管理',
  description: '夫婦で共有するお年玉管理アプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.Node
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
