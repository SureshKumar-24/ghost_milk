'use client'

import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth'

interface LogoutButtonProps {
  className?: string
}

export function LogoutButton({ className = '' }: LogoutButtonProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await authService.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className={`text-gray-400 hover:text-white transition-colors ${className}`}
    >
      Sign Out
    </button>
  )
}
