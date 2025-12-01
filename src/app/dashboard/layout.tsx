import Link from 'next/link'
import { LogoutButton } from '@/components/LogoutButton'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <Link href="/dashboard" className="text-2xl font-bold text-purple-400">
            👻 GhostMilk
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/dashboard"
            className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/dashboard/entries"
            className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            🥛 Milk Entries
          </Link>
          <Link
            href="/dashboard/customers"
            className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            👥 Customers
          </Link>
          <Link
            href="/dashboard/rates"
            className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            💰 Rates
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <LogoutButton className="w-full px-4 py-2 text-left rounded-lg hover:bg-gray-700" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
