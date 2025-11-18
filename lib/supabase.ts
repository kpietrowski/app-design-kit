import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

// Client-side Supabase client (for use in components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side admin client (for use in API routes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// TypeScript type for our design_kit_submissions table
export type DesignKitSubmission = {
  id: string
  created_at: string
  email: string
  name: string | null
  app_idea: string
  app_name: string | null
  target_audience: string
  main_action: string
  feelings: string[]
  color_palette: string
  design_inspiration: string
  personality_serious_fun: number
  personality_minimal_rich: number
  personality_gentle_motivating: number
  dark_mode: boolean
  animations: boolean
  illustrations: boolean
  photos: boolean
  gradients: boolean
  rounded_corners: boolean
  generated_prompt: string | null
  moodboard_images: string[] | null
  email_sent: boolean
  opted_in_marketing: boolean
}
