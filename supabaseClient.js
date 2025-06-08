import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// Supabase project URL and anon key provided by the user
const supabaseUrl = 'https://lbumtzjoxouzoqxmcywi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidW10empveG91em9xeG1jeXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NzQ5MDksImV4cCI6MjA2NDI1MDkwOX0.3GOiiRNQHoui6CnVP07jOKautRCQvKxynbxc-16n0uA';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Optional: Log a message to confirm client creation
// console.log('Supabase client initialized.');

// You can add helper functions here for interacting with Supabase,
// for example, to fetch user data or save game progress.
// For now, we'll just export the client.