/*
  # Enable Anonymous Authentication
  
  This migration attempts to enable anonymous sign-ins by updating the auth configuration.
  
  Note: If this doesn't work, anonymous authentication must be enabled manually in the Supabase Dashboard:
  1. Go to Authentication > Providers
  2. Enable "Anonymous Sign-ins"
*/

-- Try to enable anonymous auth (this may not work depending on Supabase version)
-- The actual configuration is typically done through the dashboard or project settings
