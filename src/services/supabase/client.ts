import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

/** Whether Supabase env vars are configured */
export const isSupabaseAvailable = !!(supabaseUrl && supabaseAnonKey)

if (!isSupabaseAvailable) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Supabase features will not work. See .env.example for setup.'
  )
}

/**
 * Supabase client — safe to import everywhere.
 * When env vars are missing, this is a dummy client that will fail gracefully
 * on any operation. Services using it should check isSupabaseAvailable first,
 * or use the Local service implementations instead.
 */
export const supabase: SupabaseClient = isSupabaseAvailable
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: { persistSession: false, autoRefreshToken: false },
    })
