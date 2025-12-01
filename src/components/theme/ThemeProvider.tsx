'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { ThemeMode } from '@/types'

interface ThemeContextType {
  mode: ThemeMode
  isSpooky: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'spooky',
  isSpooky: true,
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('spooky')

  useEffect(() => {
    // Read theme from environment variable
    const envMode = process.env.NEXT_PUBLIC_THEME_MODE as ThemeMode
    if (envMode === 'clean' || envMode === 'spooky') {
      setMode(envMode)
    }
  }, [])

  useEffect(() => {
    // Apply theme class to document
    document.documentElement.classList.remove('theme-spooky', 'theme-clean')
    document.documentElement.classList.add(`theme-${mode}`)

    // Set CSS variables
    if (mode === 'spooky') {
      document.documentElement.style.setProperty('--color-background', '#0A0A0F')
      document.documentElement.style.setProperty('--color-primary', '#8A2BE2')
      document.documentElement.style.setProperty('--color-accent', '#4BE1C3')
      document.documentElement.style.setProperty('--color-text', '#F8F8FF')
      document.documentElement.style.setProperty('--color-error', '#FF3B3B')
    } else {
      document.documentElement.style.setProperty('--color-background', '#FFFFFF')
      document.documentElement.style.setProperty('--color-primary', '#3B82F6')
      document.documentElement.style.setProperty('--color-accent', '#10B981')
      document.documentElement.style.setProperty('--color-text', '#1F2937')
      document.documentElement.style.setProperty('--color-error', '#EF4444')
    }
  }, [mode])

  return (
    <ThemeContext.Provider value={{ mode, isSpooky: mode === 'spooky' }}>
      {children}
    </ThemeContext.Provider>
  )
}
