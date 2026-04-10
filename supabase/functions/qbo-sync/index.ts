import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface SyncResults {
  bills: { synced: number; errors: number }
  timeEntries: { synced: number; errors: number }
  projects: { synced: number; errors: number }
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { company_id } = await req.json()
    if (!company_id) {
      return new Response(JSON.stringify({ error: 'company_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    // Fetch integration record
    const { data: integ, error: integError } = await supabase
      .from('integrations')
      .select('*')
      .eq('company_id', company_id)
      .eq('provider', 'qbo')
      .single()

    if (integError || !integ) {
      return new Response(JSON.stringify({ error: 'QBO not connected' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Refresh token if expired
    let accessToken = integ.access_token
    if (new Date(integ.token_expires_at) <= new Date()) {
      const refreshRes = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${Deno.env.get('QBO_CLIENT_ID')}:${Deno.env.get('QBO_CLIENT_SECRET')}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: integ.refresh_token,
        }),
      })
      if (!refreshRes.ok) {
        return new Response(JSON.stringify({ error: 'Token refresh failed' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const tokens = await refreshRes.json()
      accessToken = tokens.access_token
      await supabase.from('integrations').update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      }).eq('id', integ.id)
    }

    const baseUrl = integ.metadata?.sandbox
      ? 'https://sandbox-quickbooks.api.intuit.com'
      : 'https://quickbooks.api.intuit.com'
    const qboFetch = (query: string) =>
      fetch(`${baseUrl}/v3/company/${integ.realm_id}/query?query=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' },
      }).then(r => r.json())

    const results: SyncResults = {
      bills: { synced: 0, errors: 0 },
      timeEntries: { synced: 0, errors: 0 },
      projects: { synced: 0, errors: 0 },
    }

    // ─── Sync Bills ──────────────────────────────────────────────────────────
    try {
      const billData = await qboFetch("SELECT * FROM Bill MAXRESULTS 500")
      const bills = billData?.QueryResponse?.Bill || []

      for (const bill of bills) {
        try {
          // Check for existing entry by qbo_id in metadata (no onConflict on JSONB)
          const { data: existing } = await supabase
            .from('bills')
            .select('id')
            .contains('metadata', { qbo_id: bill.Id })
            .maybeSingle()

          const record = {
            company_id,
            vendor: bill.VendorRef?.name || null,
            amount: parseFloat(bill.TotalAmt) || 0,
            date: bill.TxnDate,
            metadata: { qbo_id: bill.Id, sync_source: 'qbo', raw: bill },
          }

          if (existing) {
            await supabase.from('bills').update(record).eq('id', existing.id)
          } else {
            await supabase.from('bills').insert(record)
          }
          results.bills.synced++
        } catch {
          results.bills.errors++
        }
      }
    } catch (err) {
      console.error('Bill sync error:', err)
    }

    // ─── Sync Time Activities ────────────────────────────────────────────────
    try {
      const timeData = await qboFetch("SELECT * FROM TimeActivity MAXRESULTS 500")
      const activities = timeData?.QueryResponse?.TimeActivity || []

      for (const entry of activities) {
        try {
          const { data: existing } = await supabase
            .from('labor_entries')
            .select('id')
            .contains('metadata', { qbo_id: entry.Id })
            .maybeSingle()

          const record = {
            company_id,
            work_date: entry.TxnDate,
            worker_name: entry.EmployeeRef?.name || entry.VendorRef?.name || 'Unknown',
            hours: (entry.Hours || 0) + (entry.Minutes || 0) / 60,
            metadata: { qbo_id: entry.Id, sync_source: 'qbo', raw: entry },
          }

          if (existing) {
            await supabase.from('labor_entries').update(record).eq('id', existing.id)
          } else {
            await supabase.from('labor_entries').insert(record)
          }
          results.timeEntries.synced++
        } catch {
          results.timeEntries.errors++
        }
      }
    } catch (err) {
      console.error('Time sync error:', err)
    }

    // ─── Sync Projects (from Estimates) ──────────────────────────────────────
    try {
      const estData = await qboFetch("SELECT * FROM Estimate MAXRESULTS 500")
      const estimates = estData?.QueryResponse?.Estimate || []

      for (const est of estimates) {
        try {
          const { data: existing } = await supabase
            .from('projects')
            .select('id')
            .contains('metadata', { qbo_id: est.Id })
            .maybeSingle()

          const record = {
            company_id,
            name: est.CustomerRef?.name || `Estimate ${est.DocNumber}`,
            bid_amount: parseFloat(est.TotalAmt) || 0,
            metadata: { qbo_id: est.Id, sync_source: 'qbo', raw: est },
          }

          if (existing) {
            await supabase.from('projects').update(record).eq('id', existing.id)
          } else {
            await supabase.from('projects').insert(record)
          }
          results.projects.synced++
        } catch {
          results.projects.errors++
        }
      }
    } catch (err) {
      console.error('Project sync error:', err)
    }

    // ─── Update integration record with sync results ─────────────────────────
    await supabase
      .from('integrations')
      .update({
        last_sync_at: new Date().toISOString(),
        metadata: {
          ...integ.metadata,
          last_sync_results: results,
        },
      })
      .eq('id', integ.id)

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Sync error:', err)
    return new Response(JSON.stringify({ error: 'Sync failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
