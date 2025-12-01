import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test connection by querying the dairies table
    const { data, error } = await supabase.from('dairies').select('id').limit(1)
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        hint: error.hint || 'Check if the table exists and RLS policies are configured'
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection successful!',
      tableExists: true
    })
  } catch (err) {
    return NextResponse.json({ 
      success: false, 
      error: String(err) 
    }, { status: 500 })
  }
}
