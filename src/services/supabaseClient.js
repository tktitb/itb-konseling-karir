import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://cjubzimgynglwitfvifn.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqdWJ6aW1neW5nbHdpdGZ2aWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NDcwODUsImV4cCI6MjA4OTQyMzA4NX0.ZW0MU9OkFLVdJwOaERPvJO5-xGGtIKFMDArga46tJTg"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
