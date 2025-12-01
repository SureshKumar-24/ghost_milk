// User types
export interface User {
  id: string
  email: string
  role: 'owner' | 'customer'
  dairy_id: string
  customer_id?: string
  created_at: string
}

// Dairy (tenant) types
export interface Dairy {
  id: string
  name: string
  owner_id: string
  created_at: string
  updated_at: string
}

// Customer types
export interface Customer {
  id: string
  dairy_id: string
  name: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface CreateCustomerInput {
  name: string
  phone?: string
  address?: string
}

export interface UpdateCustomerInput {
  name?: string
  phone?: string
  address?: string
}

export interface CustomerFilters {
  search?: string
  limit?: number
  offset?: number
}

// Milk Entry types
export interface MilkEntry {
  id: string
  dairy_id: string
  customer_id: string
  date: string
  fat: number
  snf: number
  liters: number
  amount: number
  created_at: string
}

export interface CreateMilkEntryInput {
  customer_id: string
  date: string
  fat: number
  snf: number
  liters: number
}

export interface UpdateMilkEntryInput {
  fat?: number
  snf?: number
  liters?: number
}

export interface DateRange {
  startDate: string
  endDate: string
}

// Rate types
export interface Rate {
  id: string
  dairy_id: string
  fat: number
  snf: number
  rate_per_liter: number
  created_at: string
}

export interface CreateRateInput {
  fat: number
  snf: number
  rate_per_liter: number
}

// Summary types
export interface DailySummary {
  date: string
  total_liters: number
  total_amount: number
  entry_count: number
}

export interface WeeklySummary {
  start_date: string
  end_date: string
  daily_breakdown: DailySummary[]
  total_liters: number
  total_amount: number
}

export interface MonthlySummary {
  year: number
  month: number
  weekly_breakdown: WeeklySummary[]
  total_liters: number
  total_amount: number
}

export interface DateRangeSummary {
  start_date: string
  end_date: string
  total_liters: number
  total_amount: number
  entry_count: number
}

// Auth types
export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

// Theme types
export type ThemeMode = 'spooky' | 'clean'

export interface ThemeColors {
  background: string
  primary: string
  accent: string
  text: string
  error: string
}

export interface AnimationConfig {
  enabled: boolean
  ghostFloat: boolean
  flickerText: boolean
  fogOverlay: boolean
  batsBackground: boolean
}

export interface ThemeConfig {
  mode: ThemeMode
  colors: ThemeColors
  animations: AnimationConfig
}
