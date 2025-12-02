import { createClient } from '@/lib/supabase/client'
import { validateMilkEntry } from '@/lib/validation'
import { rateService } from './rate'
import type { MilkEntry, CreateMilkEntryInput, UpdateMilkEntryInput, DateRange } from '@/types'

export class MilkEntryService {
  private supabase = createClient()

  /**
   * Create a new milk entry
   */
  async create(input: CreateMilkEntryInput): Promise<MilkEntry> {
    // Validate input
    const validation = validateMilkEntry(input)
    if (!validation.isValid) {
      throw new Error(validation.errors.map(e => e.message).join(', '))
    }

    // Get current user's dairy_id
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await this.supabase
      .from('users')
      .select('dairy_id')
      .eq('id', user.id)
      .single()

    if (!profile?.dairy_id) throw new Error('User not associated with a dairy')

    // Calculate amount using rate service
    const rateResult = await rateService.getRateWithFallback(input.fat, input.snf)
    if (!rateResult) {
      throw new Error('No rate configured for this FAT/SNF combination')
    }

    const amount = Math.round(rateResult.rate * input.liters * 100) / 100

    const { data, error } = await this.supabase
      .from('milk_entries')
      .insert({
        dairy_id: profile.dairy_id,
        customer_id: input.customer_id,
        date: input.date,
        shift: input.shift,
        fat: input.fat,
        snf: input.snf,
        liters: input.liters,
        amount,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }


  /**
   * Get milk entry by ID
   */
  async getById(id: string): Promise<MilkEntry | null> {
    const { data, error } = await this.supabase
      .from('milk_entries')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  /**
   * List milk entries by date
   */
  async listByDate(date: string): Promise<MilkEntry[]> {
    const { data, error } = await this.supabase
      .from('milk_entries')
      .select(`
        *,
        customer:customers(name)
      `)
      .eq('date', date)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  }

  /**
   * List milk entries by customer
   */
  async listByCustomer(customerId: string, dateRange?: DateRange): Promise<MilkEntry[]> {
    let query = this.supabase
      .from('milk_entries')
      .select('*')
      .eq('customer_id', customerId)
      .order('date', { ascending: false })

    if (dateRange) {
      query = query
        .gte('date', dateRange.startDate)
        .lte('date', dateRange.endDate)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)
    return data || []
  }

  /**
   * Update milk entry
   */
  async update(id: string, input: UpdateMilkEntryInput): Promise<MilkEntry> {
    // Get existing entry to recalculate amount if needed
    const existing = await this.getById(id)
    if (!existing) throw new Error('Entry not found')

    const fat = input.fat ?? existing.fat
    const snf = input.snf ?? existing.snf
    const liters = input.liters ?? existing.liters

    // Recalculate amount
    const rateResult = await rateService.getRateWithFallback(fat, snf)
    const amount = rateResult ? Math.round(rateResult.rate * liters * 100) / 100 : existing.amount

    const { data, error } = await this.supabase
      .from('milk_entries')
      .update({ ...input, amount })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Delete milk entry
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('milk_entries')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }
}

// Singleton instance
export const milkEntryService = new MilkEntryService()
