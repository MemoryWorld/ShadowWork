import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Global Middleware - The "Anti-Crash" Layer
 * 
 * Critical: This middleware applies COOP/COEP headers to ALL routes
 * to enable SharedArrayBuffer for WebContainers.
 * 
 * DO NOT use restrictive matcher logic that might exclude the main document.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Required for WebContainer API to enable SharedArrayBuffer
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  return response;
}

// Apply to all routes - this is critical for WebContainers
// Include root path, all paths, and _next internal routes
export const config = {
  matcher: [
    '/',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

