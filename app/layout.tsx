import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tudo Junto — Todas as IAs no mesmo lugar',
  description: 'Hub de inteligência artificial com os melhores modelos do mundo. Groq, Mistral, Claude, GPT e muito mais em um só lugar.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
