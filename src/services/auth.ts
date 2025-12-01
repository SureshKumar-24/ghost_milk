import { createClient } from '@/lib/supabase/client'
import type { AuthResult, User } from '@/types'

export class AuthService {
  private supabase = createClient()

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data.user) {
      return { success: false, error: 'Authentication failed' }
    }

    // Get user profile with dairy info
    const user = await this.getUser()
    if (!user) {
      return { success: false, error: 'User profile not found' }
    }

    return { success: true, user }
  }

  /**
   * Sign up a new dairy owner
   * Creates auth user, dairy tenant, and user profile
   */
  async signUp(email: string, password: string, dairyName: string): Promise<AuthResult> {
    // 1. Create auth user
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user' }
    }

    const userId = authData.user.id


    // 2. Create dairy tenant
    const { data: dairy, error: dairyError } = await this.supabase
      .from('dairies')
      .insert({ name: dairyName, owner_id: userId })
      .select()
      .single()

    if (dairyError) {
      // Cleanup: delete auth user if dairy creation fails
      await this.supabase.auth.admin?.deleteUser(userId)
      return { success: false, error: `Failed to create dairy: ${dairyError.message}` }
    }

    // 3. Create user profile linking to dairy
    const { error: profileError } = await this.supabase
      .from('users')
      .insert({
        id: userId,
        dairy_id: dairy.id,
        role: 'owner',
      })

    if (profileError) {
      return { success: false, error: `Failed to create user profile: ${profileError.message}` }
    }

    const user: User = {
      id: userId,
      email: email,
      role: 'owner',
      dairy_id: dairy.id,
      created_at: new Date().toISOString(),
    }

    return { success: true, user }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    await this.supabase.auth.signOut()
  }

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session } } = await this.supabase.auth.getSession()
    return session
  }

  /**
   * Get current user with profile data
   */
  async getUser(): Promise<User | null> {
    const { data: { user: authUser } } = await this.supabase.auth.getUser()
    
    if (!authUser) return null

    // Get user profile with dairy info
    const { data: profile, error } = await this.supabase
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

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession()
    return !!session
  }
}

// Singleton instance for client-side use
export const authService = new AuthService()
