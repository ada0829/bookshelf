import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '書架 Bookshelf',
  description: '分享你的書單，發現好書',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
