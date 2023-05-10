import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jwfyrkfpqfkzovzdpkqt.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3Znlya2ZwcWZrem92emRwa3F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzkyNDg4MjcsImV4cCI6MTk5NDgyNDgyN30.ECsAuWRN08LWBqJZqa4v3Qmnx03N8wkGrTRgVMotCS8';
export const supabase = createClient(supabaseUrl, supabaseKey);