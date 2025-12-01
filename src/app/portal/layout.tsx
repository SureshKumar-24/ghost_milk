import Link from 'next/link'
import { LogoutButton } from '@/components/LogoutButton'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/portal" className="text-xl font-bold text-purple-400">
            👻 GhostMilk Portal
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/portal"
              className="text-gray-300 hover:text-white transition-colors"
            >
              My Entries
            </Link>
            <Link
              href="/portal/history"
              className="text-gray-300 hover:text-white transition-colors"
            >
              History
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
