import { createClient } from '@/lib/supabase/client'
import type { DailySummary, WeeklySummary, MonthlySummary, DateRangeSummary } from '@/types'

export class SummaryService {
  private supabase = createClient()

  /**
   * Get daily summary for a specific date
   */
  async getDailySummary(date: string): Promise<DailySummary> {
    const { data, error } = await this.supabase
      .from('milk_entries')
      .select('liters, amount')
      .eq('date', date)

    if (error) throw new Error(error.message)

    const entries = data || []
    return {
      date,
      total_liters: entries.reduce((sum, e) => sum + Number(e.liters), 0),
      total_amount: entries.reduce((sum, e) => sum + Number(e.amount), 0),
      entry_count: entries.length,
    }
  }

  /**
   * Get weekly summary starting from a date
   */
  async getWeeklySummary(startDate: string): Promise<WeeklySummary> {
    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    const endDate = end.toISOString().split('T')[0]

    const { data, error } = await this.supabase
      .from('milk_entries')
      .select('date, liters, amount')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) throw new Error(error.message)

    const entries = data || []

    // Group by date
    const byDate: Record<string, { liters: number; amount: number; count: number }> = {}
    for (const entry of entries) {
      if (!byDate[entry.date]) {
        byDate[entry.date] = { liters: 0, amount: 0, count: 0 }
      }
      byDate[entry.date].liters += Number(entry.liters)
      byDate[entry.date].amount += Number(entry.amount)
      byDate[entry.date].count += 1
    }


    // Build daily breakdown
    const daily_breakdown: DailySummary[] = []
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const dayData = byDate[dateStr] || { liters: 0, amount: 0, count: 0 }
      daily_breakdown.push({
        date: dateStr,
        total_liters: dayData.liters,
        total_amount: dayData.amount,
        entry_count: dayData.count,
      })
    }

    return {
      start_date: startDate,
      end_date: endDate,
      daily_breakdown,
      total_liters: entries.reduce((sum, e) => sum + Number(e.liters), 0),
      total_amount: entries.reduce((sum, e) => sum + Number(e.amount), 0),
    }
  }

  /**
   * Get monthly summary
   */
  async getMonthlySummary(year: number, month: number): Promise<MonthlySummary> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    const { data, error } = await this.supabase
      .from('milk_entries')
      .select('date, liters, amount')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) throw new Error(error.message)

    const entries = data || []

    // Group by week
    const weeks: WeeklySummary[] = []
    let weekStart = new Date(startDate)
    
    while (weekStart.getMonth() + 1 === month || weekStart < new Date(startDate)) {
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      const weekEntries = entries.filter(e => {
        const d = new Date(e.date)
        return d >= weekStart && d <= weekEnd
      })

      const daily_breakdown: DailySummary[] = []
      for (let d = new Date(weekStart); d <= weekEnd && d.getMonth() + 1 === month; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        const dayEntries = entries.filter(e => e.date === dateStr)
        daily_breakdown.push({
          date: dateStr,
          total_liters: dayEntries.reduce((sum, e) => sum + Number(e.liters), 0),
          total_amount: dayEntries.reduce((sum, e) => sum + Number(e.amount), 0),
          entry_count: dayEntries.length,
        })
      }

      weeks.push({
        start_date: weekStart.toISOString().split('T')[0],
        end_date: weekEnd.toISOString().split('T')[0],
        daily_breakdown,
        total_liters: weekEntries.reduce((sum, e) => sum + Number(e.liters), 0),
        total_amount: weekEntries.reduce((sum, e) => sum + Number(e.amount), 0),
      })

      weekStart.setDate(weekStart.getDate() + 7)
      if (weekStart.getMonth() + 1 !== month) break
    }

    return {
      year,
      month,
      weekly_breakdown: weeks,
      total_liters: entries.reduce((sum, e) => sum + Number(e.liters), 0),
      total_amount: entries.reduce((sum, e) => sum + Number(e.amount), 0),
    }
  }

  /**
   * Get summary for a date range
   */
  async getDateRangeSummary(startDate: string, endDate: string): Promise<DateRangeSummary> {
    const { data, error } = await this.supabase
      .from('milk_entries')
      .select('liters, amount')
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
}

// Singleton instance
export const summaryService = new SummaryService()
