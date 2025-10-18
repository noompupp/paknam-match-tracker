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

interface DiffRecord {
  member_id: number;
  payment_month: string;
  db_status?: string;
  csv_status: string;
  db_amount?: number;
  csv_amount?: number;
  db_payment_date?: string;
  csv_payment_date?: string;
  mismatch_fields: string[];
}

// Normalize month to YYYY-MM-01 format
function normalizeMonthKey(monthStr: string): string {
  if (!monthStr || monthStr.length < 7) {
    throw new Error(`Invalid month format: ${monthStr}`);
  }
  return `${monthStr.substring(0, 7)}-01`;
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
    const { records, mode = 'import' } = await req.json()

    console.log(`Processing ${records.length} payment records for ${mode} mode`)

    // Normalize all month keys to YYYY-MM-01 format
    const normalizedRecords = records.map((record: PaymentImportRecord) => ({
      ...record,
      payment_month: normalizeMonthKey(record.payment_month)
    }))

    // Validate records using database function
    const { data: validation, error: validationError } = await supabase
      .rpc('validate_bulk_payment_import', { p_records: normalizedRecords })

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

    // If dry-run mode, compare with existing data and return diff
    if (mode === 'dry_run') {
      const diffRecords: DiffRecord[] = []

      for (const record of normalizedRecords) {
        const { data: existing } = await supabase
          .from('member_payments')
          .select('*')
          .eq('member_id', record.member_id)
          .eq('payment_month', record.payment_month)
          .maybeSingle()

        const mismatch_fields: string[] = []

        if (!existing) {
          mismatch_fields.push('missing_in_db')
        } else {
          if (existing.payment_status !== record.payment_status) {
            mismatch_fields.push('payment_status')
          }
          if (existing.amount !== record.amount) {
            mismatch_fields.push('amount')
          }
          if (existing.payment_date !== record.payment_date) {
            mismatch_fields.push('payment_date')
          }
        }

        if (mismatch_fields.length > 0) {
          diffRecords.push({
            member_id: record.member_id,
            payment_month: record.payment_month,
            db_status: existing?.payment_status,
            csv_status: record.payment_status,
            db_amount: existing?.amount,
            csv_amount: record.amount,
            db_payment_date: existing?.payment_date,
            csv_payment_date: record.payment_date,
            mismatch_fields
          })
        }
      }

      console.log(`Dry run complete: ${diffRecords.length} mismatches found out of ${normalizedRecords.length} records`)

      return new Response(
        JSON.stringify({
          success: true,
          mode: 'dry_run',
          total_records: normalizedRecords.length,
          mismatch_count: diffRecords.length,
          mismatches: diffRecords
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Bulk insert with conflict handling (upsert)
    const { data, error } = await supabase
      .from('member_payments')
      .upsert(normalizedRecords, {
        onConflict: 'member_id,payment_month',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('Insert error:', error)
      throw error
    }

    console.log(`Successfully imported ${normalizedRecords.length} payment records`)

    // Log the operation
    await supabase.from('operation_logs').insert({
      operation_type: 'bulk_import_payments',
      table_name: 'member_payments',
      success: true,
      payload: { records_count: normalizedRecords.length },
      result: { imported_count: normalizedRecords.length }
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported_count: normalizedRecords.length 
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
