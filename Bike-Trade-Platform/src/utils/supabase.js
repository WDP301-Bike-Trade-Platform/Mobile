import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://qcbwpxpvjeotxehobxaz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjYndweHB2amVvdHhlaG9ieGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMzI0NDAsImV4cCI6MjA3NDgwODQ0MH0.SxsQn27vVzlcoApUV8V88ij99OU34jux8xc_qwgOTVs'
)
