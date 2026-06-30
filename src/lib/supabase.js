/**
 * src/lib/supabase.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Supabase client singleton for WIE2026 – Crewmate Protocol
 * Uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from import.meta.env
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    '[Crewmate Protocol] Missing env var: VITE_SUPABASE_URL\n' +
    'Add it to your .env file at the project root.'
  );
}

if (!supabaseKey) {
  throw new Error(
    '[Crewmate Protocol] Missing env var: VITE_SUPABASE_ANON_KEY\n' +
    'Add it to your .env file at the project root.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
