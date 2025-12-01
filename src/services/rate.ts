import { createClient } from '@/lib/supabase/client'
import type { Rate, CreateRateInput } from '@/types'

export class RateService {
  private supabase = createClient()

  /**
   * Set or update a rate for a FAT/SNF combination
   */
  async setRate(input: CreateRateInput): Promise<Rate> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await this.supabase
      .from('users')
      .select('dairy_id')
      .eq('id', user.id)
      .single()

    if (!profile?.dairy_id) throw new Error('User not associated with a dairy')

    // Upsert: update if exists, insert if not
    const { data, error } = await this.supabase
      .from('rates')
      .upsert({
        dairy_id: profile.dairy_id,
        fat: input.fat,
        snf: input.snf,
        rate_per_liter: input.rate_per_liter,
      }, {
        onConflict: 'dairy_id,fat,snf',
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Get rate for a specific FAT/SNF combination
   */
  async getRate(fat: number, snf: number): Promise<number | null> {
    const { data, error } = await this.supabase
      .from('rates')
      .select('rate_per_liter')
      .eq('fat', fat)
      .eq('snf', snf)
      .single()

    if (error || !data) return null
    return data.rate_per_liter
  }


  /**
   * Calculate amount based on FAT, SNF, and liters
   * Returns null if no rate is configured
   */
  async calculateAmount(fat: number, snf: number, liters: number): Promise<number | null> {
    const rate = await this.getRate(fat, snf)
    if (rate === null) return null
    return Math.round(rate * liters * 100) / 100 // Round to 2 decimal places
  }

  /**
   * List all rates for the dairy
   */
  async listRates(): Promise<Rate[]> {
    const { data, error } = await this.supabase
      .from('rates')
      .select('*')
      .order('fat')
      .order('snf')

    if (error) throw new Error(error.message)
    return data || []
  }

  /**
   * Delete a rate
   */
  async deleteRate(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('rates')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }

  /**
   * Get rate with interpolation fallback
   * If exact rate not found, tries to find nearest rate
   */
  async getRateWithFallback(fat: number, snf: number): Promise<{ rate: number; isExact: boolean } | null> {
    // Try exact match first
    const exactRate = await this.getRate(fat, snf)
    if (exactRate !== null) {
      return { rate: exactRate, isExact: true }
    }

    // Fallback: find nearest rate
    const { data: rates } = await this.supabase
      .from('rates')
      .select('fat, snf, rate_per_liter')
      .order('fat')
      .order('snf')

    if (!rates || rates.length === 0) return null

    // Find closest rate by FAT/SNF distance
    let closest = rates[0]
    let minDistance = Math.abs(rates[0].fat - fat) + Math.abs(rates[0].snf - snf)

    for (const r of rates) {
      const distance = Math.abs(r.fat - fat) + Math.abs(r.snf - snf)
      if (distance < minDistance) {
        minDistance = distance
        closest = r
      }
    }

    return { rate: closest.rate_per_liter, isExact: false }
  }
}

// Singleton instance
export const rateService = new RateService()
