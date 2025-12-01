import { createClient } from '@/lib/supabase/client'
import type { Customer, CreateCustomerInput, UpdateCustomerInput, CustomerFilters } from '@/types'

export class CustomerService {
  private supabase = createClient()

  /**
   * Create a new customer
   * dairy_id is automatically set via RLS from authenticated user context
   */
  async create(input: CreateCustomerInput): Promise<Customer> {
    // Get current user's dairy_id
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await this.supabase
      .from('users')
      .select('dairy_id')
      .eq('id', user.id)
      .single()

    if (!profile?.dairy_id) throw new Error('User not associated with a dairy')

    const { data, error } = await this.supabase
      .from('customers')
      .insert({
        ...input,
        dairy_id: profile.dairy_id,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Get customer by ID
   */
  async getById(id: string): Promise<Customer | null> {
    const { data, error } = await this.supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) return null
    return data
  }


  /**
   * List customers with optional filters
   * RLS ensures only customers from user's dairy are returned
   */
  async list(filters?: CustomerFilters): Promise<Customer[]> {
    let query = this.supabase
      .from('customers')
      .select('*')
      .eq('is_deleted', false)
      .order('name')

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)
    return data || []
  }

  /**
   * Update customer
   */
  async update(id: string, input: UpdateCustomerInput): Promise<Customer> {
    const { data, error } = await this.supabase
      .from('customers')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Soft delete customer (sets is_deleted = true)
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('customers')
      .update({ is_deleted: true })
      .eq('id', id)

    if (error) throw new Error(error.message)
  }

  /**
   * Search customers by name
   * RLS ensures only customers from user's dairy are returned
   */
  async search(query: string): Promise<Customer[]> {
    const { data, error } = await this.supabase
      .from('customers')
      .select('*')
      .eq('is_deleted', false)
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(20)

    if (error) throw new Error(error.message)
    return data || []
  }
}

// Singleton instance
export const customerService = new CustomerService()
