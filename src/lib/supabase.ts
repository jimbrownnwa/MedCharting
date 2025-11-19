import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Patient {
  id: string
  name: string
  date_of_birth: string
  age: number
  gender: string
  email?: string
  phone?: string
  address?: string
  created_at: string
}

export interface ChartEntry {
  id: string
  patient_id: string
  primary_complaint: string
  notes?: string
  status: 'draft' | 'signed'
  owner: string
  created_at: string
}

export interface BodyChartDrawing {
  id: string
  chart_entry_id: string
  drawing_data: string
  created_at: string
}

export interface FileUpload {
  id: string
  chart_entry_id: string
  file_path: string
  file_name: string
  description?: string
  created_at: string
}
