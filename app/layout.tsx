import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bookshelf 書架',
  description: '分享你的書單，發現好書',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
