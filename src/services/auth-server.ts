import { createClient } from '@/lib/supabase/server'
import type { User } from '@/types'

/**
 * Server-side auth utilities for use in Server Components and API routes
 */

export async function getServerSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getServerUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) return null

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (error || !profile) return null

  return {
    id: authUser.id,
    email: authUser.email || '',
    role: profile.role,
    dairy_id: profile.dairy_id,
    customer_id: profile.customer_id,
    created_at: profile.created_at,
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getServerUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireOwner(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== 'owner') {
    throw new Error('Forbidden: Owner access required')
  }
  return user
}
