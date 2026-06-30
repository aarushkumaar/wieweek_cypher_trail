/**
 * src/lib/auth.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Google OAuth helpers using Supabase Auth.
 *
 * Flow:
 *   1. signInWithGoogle()   → redirects browser to Google
 *   2. handleAuthCallback() → exchanges code for session (called from /auth/callback)
 *   3. getAuthUser()        → returns current Supabase auth user (or null)
 *   4. signOut()            → signs out + clears local session
 *   5. onAuthChange()       → subscribe to auth state changes
 *
 * Supabase setup required:
 *   Dashboard → Auth → Providers → Google → enable, add Client ID + Secret.
 *   Dashboard → Auth → URL Configuration → add  <your-origin>/auth/callback
 *   to the Redirect URLs allowlist.
 */

import { supabase } from './supabase.js';

const REDIRECT_URL = `${window.location.origin}/auth/callback`;

// ── Sign in ───────────────────────────────────────────────────────────────────
/**
 * Starts the Google OAuth flow.
 * Supabase redirects the browser to Google, then back to REDIRECT_URL.
 */
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: REDIRECT_URL,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) throw error;
  // Browser navigates away — nothing after this line runs
}

// ── Handle the OAuth callback ─────────────────────────────────────────────────
/**
 * Called from /auth/callback after Google redirects back.
 *
 * Supabase JS v2 processes the hash fragment (#access_token=...) or PKCE code
 * asynchronously on client init. We first try getSession() — if it resolves
 * immediately we're done. If not (race condition), we wait for the SIGNED_IN
 * event from onAuthStateChange (up to 8 seconds).
 *
 * @returns {Promise<import('@supabase/supabase-js').User | null>}
 */
export async function handleAuthCallback() {
  // Fast path — session already processed by the time we get here
  const { data: { session: existing }, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr) throw sessionErr;
  if (existing?.user) return existing.user;

  // Slow path — wait for Supabase to finish exchanging the code / hash
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      subscription.unsubscribe();
      reject(new Error('No authenticated user returned from Google. Please try again.'));
    }, 8000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        clearTimeout(timer);
        subscription.unsubscribe();
        resolve(session.user);
      } else if (event === 'SIGNED_OUT') {
        clearTimeout(timer);
        subscription.unsubscribe();
        reject(new Error('Sign-in was cancelled or failed. Please try again.'));
      }
    });
  });
}

// ── Get current user ──────────────────────────────────────────────────────────
/**
 * Returns the currently logged-in Supabase auth user, or null.
 * @returns {Promise<import('@supabase/supabase-js').User | null>}
 */
export async function getAuthUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user ?? null;
}

// ── Sign out ──────────────────────────────────────────────────────────────────
export async function signOut() {
  await supabase.auth.signOut();
}

// ── Subscribe to auth state changes ──────────────────────────────────────────
/**
 * Calls callback(user) whenever the Supabase auth session changes.
 * user is null when signed out.
 *
 * @param {(user: import('@supabase/supabase-js').User | null) => void} callback
 * @returns {() => void} unsubscribe function
 */
export function onAuthChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => callback(session?.user ?? null)
  );
  return () => subscription.unsubscribe();
}
