import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentImportRecord {
  member_id: number;
  payment_month: string;
  payment_status: 'paid' | 'unpaid';
  payment_date?: string;
  amount?: number;
  notes?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Verify admin role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const { data: roleData } = await supabase
      .from('auth_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleData?.role !== 'admin') {
      throw new Error('Admin access required')
    }

    // Parse request body
    const { records } = await req.json()

    console.log(`Processing ${records.length} payment records for bulk import`)

    // Validate records using database function
    const { data: validation, error: validationError } = await supabase
      .rpc('validate_bulk_payment_import', { p_records: records })

    if (validationError) {
      console.error('Validation error:', validationError)
      throw validationError
    }

    if (!validation?.valid) {
      console.warn(`Validation failed: ${validation?.error_count} errors found`)
      return new Response(
        JSON.stringify({ 
          success: false, 
          errors: validation?.errors,
          error_count: validation?.error_count
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Bulk insert with conflict handling (upsert)
    const { data, error } = await supabase
      .from('member_payments')
      .upsert(records, {
        onConflict: 'member_id,payment_month',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('Insert error:', error)
      throw error
    }

    console.log(`Successfully imported ${records.length} payment records`)

    // Log the operation
    await supabase.from('operation_logs').insert({
      operation_type: 'bulk_import_payments',
      table_name: 'member_payments',
      success: true,
      payload: { records_count: records.length },
      result: { imported_count: records.length }
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported_count: records.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Bulk import error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
