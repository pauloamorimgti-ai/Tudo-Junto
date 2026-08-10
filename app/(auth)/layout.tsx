import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <span className="text-white">✦</span>
        </div>
        <span className="font-semibold text-text group-hover:text-accent transition-colors">Tudo Junto</span>
      </Link>
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}
