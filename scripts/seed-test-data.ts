/**
 * Seed script for test data
 * Run with: npx tsx scripts/seed-test-data.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oyrmpqcnjsaaicpthuiy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95cm1wcWNuanNhYWljcHRodWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0OTY4OTMsImV4cCI6MjA4MDA3Mjg5M30.AJNnizf0VjxogvR6VH9OVJGdhapCzjkmw_2MwYaFVBE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedTestData() {
  console.log('🌱 Seeding test data...')

  // Test credentials
  const testEmail = 'sk20012404@gmail.com'
  const testPassword = '248517Aws@'
  const dairyName = 'Suresh Dairy'

  try {
    // 1. Create test user
    console.log('Creating test user...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    if (authError) {
      console.error('Auth error:', authError.message)
      return
    }

    if (!authData.user) {
      console.error('No user created')
      return
    }

    const userId = authData.user.id
    console.log('✓ User created:', userId)

    // 2. Create dairy
    console.log('Creating dairy...')
    const { data: dairy, error: dairyError } = await supabase
      .from('dairies')
      .insert({ name: dairyName, owner_id: userId })
      .select()
      .single()

    if (dairyError) {
      console.error('Dairy error:', dairyError.message)
      return
    }

    console.log('✓ Dairy created:', dairy.id)

    // 3. Create user profile
    console.log('Creating user profile...')
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: userId,
        dairy_id: dairy.id,
        role: 'owner',
      })

    if (profileError) {
      console.error('Profile error:', profileError.message)
      return
    }

    console.log('✓ User profile created')

    // 4. Add sample customers
    console.log('Adding sample customers...')
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .insert([
        { dairy_id: dairy.id, name: 'Rajesh Kumar', phone: '9876543210', address: 'Village Road, District' },
        { dairy_id: dairy.id, name: 'Priya Sharma', phone: '9876543211', address: 'Main Street, Town' },
        { dairy_id: dairy.id, name: 'Amit Patel', phone: '9876543212', address: 'Farm House, Village' },
      ])
      .select()

    if (customersError) {
      console.error('Customers error:', customersError.message)
      return
    }

    console.log('✓ Sample customers added:', customers?.length)

    // 5. Add sample rates
    console.log('Adding sample rates...')
    const { error: ratesError } = await supabase
      .from('rates')
      .insert([
        { dairy_id: dairy.id, fat: 3.5, snf: 8.5, rate_per_liter: 45.00 },
        { dairy_id: dairy.id, fat: 4.0, snf: 8.5, rate_per_liter: 48.00 },
        { dairy_id: dairy.id, fat: 4.5, snf: 9.0, rate_per_liter: 52.00 },
        { dairy_id: dairy.id, fat: 5.0, snf: 9.0, rate_per_liter: 55.00 },
      ])

    if (ratesError) {
      console.error('Rates error:', ratesError.message)
      return
    }

    console.log('✓ Sample rates added')

    // 6. Add sample milk entries
    if (customers && customers.length > 0) {
      console.log('Adding sample milk entries...')
      const today = new Date().toISOString().split('T')[0]
      
      const { error: entriesError } = await supabase
        .from('milk_entries')
        .insert([
          { dairy_id: dairy.id, customer_id: customers[0].id, date: today, shift: 'morning', fat: 4.0, snf: 8.5, liters: 10.5, amount: 504.00 },
          { dairy_id: dairy.id, customer_id: customers[0].id, date: today, shift: 'evening', fat: 4.2, snf: 8.6, liters: 9.5, amount: 456.00 },
          { dairy_id: dairy.id, customer_id: customers[1].id, date: today, shift: 'morning', fat: 3.5, snf: 8.5, liters: 8.0, amount: 360.00 },
          { dairy_id: dairy.id, customer_id: customers[2].id, date: today, shift: 'evening', fat: 4.5, snf: 9.0, liters: 12.0, amount: 624.00 },
        ])

      if (entriesError) {
        console.error('Entries error:', entriesError.message)
        return
      }

      console.log('✓ Sample milk entries added')
    }

    console.log('\n✅ Test data seeded successfully!')
    console.log('\nTest Credentials:')
    console.log('Email:', testEmail)
    console.log('Password:', testPassword)
    console.log('Dairy:', dairyName)

  } catch (error) {
    console.error('Error seeding data:', error)
  }
}

seedTestData()
