import { createClient } from '@supabase/supabase-js'
import { getRequiredEnv } from './env'

const supabaseUrl = getRequiredEnv('VITE_SUPABASE_URL')
const supabasePublishableKey = getRequiredEnv('VITE_SUPABASE_PUBLISHABLE_KEY')

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
