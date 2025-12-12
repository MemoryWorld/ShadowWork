import { NextRequest, NextResponse } from 'next/server';

/**
 * GitHub OAuth Route (Placeholder)
 * 
 * For MVP: This is a placeholder for GitHub authentication.
 * In production, implement full OAuth flow with Supabase Auth.
 * 
 * Implementation Guide:
 * 1. Register GitHub OAuth App: https://github.com/settings/developers
 * 2. Configure Supabase Auth: https://supabase.com/docs/guides/auth/social-login/auth-github
 * 3. Use Supabase Auth helpers for Next.js
 */

export async function GET(request: NextRequest) {
  // TODO: Implement GitHub OAuth with Supabase
  
  // For MVP, redirect to challenge with mock mode
  return NextResponse.redirect(new URL('/challenge?mock=true', request.url));
}

