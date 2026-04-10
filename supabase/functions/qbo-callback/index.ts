import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY      = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const QBO_CLIENT_ID     = Deno.env.get('QBO_CLIENT_ID')!
const QBO_CLIENT_SECRET = Deno.env.get('QBO_CLIENT_SECRET')!
const APP_URL           = Deno.env.get('APP_URL')!  // e.g. https://user.github.io/CavyProject

serve(async (req) => {
  const url = new URL(req.url)
  const code       = url.searchParams.get('code')
  const realmId    = url.searchParams.get('realmId')
  const state      = url.searchParams.get('state') // company_id
  const errorParam = url.searchParams.get('error')

  // User denied access
  if (errorParam) {
    return Response.redirect(`${APP_URL}/?qbo=denied`, 302)
  }

  if (!code || !realmId || !state) {
    return Response.redirect(`${APP_URL}/?qbo=error&msg=missing_params`, 302)
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${QBO_CLIENT_ID}:${QBO_CLIENT_SECRET}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${SUPABASE_URL}/functions/v1/qbo-callback`,
      }),
    })

    if (!tokenRes.ok) {
      const text = await tokenRes.text()
      console.error('Token exchange failed:', text)
      return Response.redirect(`${APP_URL}/?qbo=error&msg=token_exchange_failed`, 302)
    }

    const tokens = await tokenRes.json()

    // Store integration record in Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    const { error: dbError } = await supabase
      .from('integrations')
      .upsert({
        company_id: state,
        provider: 'qbo',
        realm_id: realmId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        metadata: {
          sandbox: tokens.sandbox ?? false,
        },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'company_id,provider' })

    if (dbError) {
      console.error('DB upsert error:', dbError)
      return Response.redirect(`${APP_URL}/?qbo=error&msg=db_error`, 302)
    }

    return Response.redirect(`${APP_URL}/?qbo=success`, 302)
  } catch (err) {
    console.error('QBO callback error:', err)
    return Response.redirect(`${APP_URL}/?qbo=error&msg=unexpected`, 302)
  }
})
