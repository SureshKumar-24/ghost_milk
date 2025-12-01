'use client'

import { useTheme } from './ThemeProvider'

export function GhostFloat({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { isSpooky } = useTheme()
  return (
    <div className={`${isSpooky ? 'ghost-float' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function NeonText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { isSpooky } = useTheme()
  return (
    <span className={`${isSpooky ? 'neon-text' : ''} ${className}`}>
      {children}
    </span>
  )
}

export function FlickerText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { isSpooky } = useTheme()
  return (
    <span className={`${isSpooky ? 'flicker-text' : ''} ${className}`}>
      {children}
    </span>
  )
}

export function FogOverlay() {
  const { isSpooky } = useTheme()
  if (!isSpooky) return null
  return <div className="fog-overlay" />
}

export function SkeletonLoader({ className = '' }: { className?: string }) {
  return <div className={`skeleton h-4 ${className}`} />
}

export function GhostPopup({ show }: { show: boolean }) {
  const { isSpooky } = useTheme()
  
  if (!show) return null
  
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className={`text-8xl ${isSpooky ? 'ghost-float' : ''}`}>
        {isSpooky ? '👻' : '✓'}
      </div>
    </div>
  )
}
