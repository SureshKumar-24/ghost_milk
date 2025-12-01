import { createClient } from '@/lib/supabase/client'
import type { MilkEntry, DailySummary, DateRangeSummary } from '@/types'

export class PortalService {
  private supabase = createClient()

  /**
   * Get current customer's ID from their user profile
   */
  private async getCustomerId(): Promise<string> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await this.supabase
      .from('users')
      .select('customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.customer_id) throw new Error('Not a customer account')
    return profile.customer_id
  }

  /**
   * List customer's own milk entries
   */
  async listMyEntries(limit = 50): Promise<MilkEntry[]> {
    const customerId = await this.getCustomerId()

    const { data, error } = await this.supabase
      .from('milk_entries')
      .select('*')
      .eq('customer_id', customerId)
      .order('date', { ascending: false })
      .limit(limit)

    if (error) throw new Error(error.message)
    return data || []
  }

  /**
   * Get customer's entries for a specific month
   */
  async getMonthlyEntries(year: number, month: number): Promise<MilkEntry[]> {
    const customerId = await this.getCustomerId()
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    const { data, error } = await this.supabase
      .from('milk_entries')
      .select('*')
      .eq('customer_id', customerId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  }


  /**
   * Get customer's monthly summary
   */
  async getMonthlySummary(year: number, month: number): Promise<DateRangeSummary> {
    const customerId = await this.getCustomerId()
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    const { data, error } = await this.supabase
      .from('milk_entries')
      .select('liters, amount')
      .eq('customer_id', customerId)
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) throw new Error(error.message)

    const entries = data || []
    return {
      start_date: startDate,
      end_date: endDate,
      total_liters: entries.reduce((sum, e) => sum + Number(e.liters), 0),
      total_amount: entries.reduce((sum, e) => sum + Number(e.amount), 0),
      entry_count: entries.length,
    }
  }

  /**
   * Get customer's historical summaries by month
   */
  async getHistoricalSummaries(monthsBack = 6): Promise<DateRangeSummary[]> {
    const customerId = await this.getCustomerId()
    const summaries: DateRangeSummary[] = []

    const now = new Date()
    for (let i = 0; i < monthsBack; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      const { data } = await this.supabase
        .from('milk_entries')
        .select('liters, amount')
        .eq('customer_id', customerId)
        .gte('date', startDate)
        .lte('date', endDate)

      const entries = data || []
      summaries.push({
        start_date: startDate,
        end_date: endDate,
        total_liters: entries.reduce((sum, e) => sum + Number(e.liters), 0),
        total_amount: entries.reduce((sum, e) => sum + Number(e.amount), 0),
        entry_count: entries.length,
      })
    }

    return summaries
  }
}

// Singleton instance
export const portalService = new PortalService()
