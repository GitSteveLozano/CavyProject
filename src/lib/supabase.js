import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  || ''
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Guard: createClient needs valid URL + key. If env vars are missing,
// export null so consumers can check before calling.
export const supabase = (supabaseUrl && supabaseAnon)
  ? createClient(supabaseUrl, supabaseAnon)
  : null

export const isConfigured = Boolean(supabase)
