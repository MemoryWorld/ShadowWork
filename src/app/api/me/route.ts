import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getMockUser } from '@/lib/mockAuth';

export async function GET(req: NextRequest) {
  try {
    // Default response shape
    const base = {
      user: null as null | { id: string; email: string },
      role: 'user' as 'user' | 'enterprise',
      source: 'local' as 'local' | 'supabase',
    };

    // If Supabase is configured, you should plug real auth here.
    // For this demo we return a best-effort role hint from headers.
    if (supabase) {
      const roleHintHeader = req.headers.get('x-demo-role');
      const roleHint = roleHintHeader === 'enterprise' ? 'enterprise' : 'user';
      return NextResponse.json({
        ...base,
        role: roleHint,
        source: 'supabase',
      });
    }

    // Fallback: local mock user; role based on header or email hint
    const mockUser = getMockUser();
    let role: 'user' | 'enterprise' = 'user';
    const roleHintHeader = req.headers.get('x-demo-role');
    if (roleHintHeader === 'enterprise') role = 'enterprise';
    if (mockUser?.email && (mockUser.email.includes('+enterprise') || mockUser.email.includes('corp'))) {
      role = 'enterprise';
    }

    return NextResponse.json({
      ...base,
      user: mockUser ? { id: mockUser.id, email: mockUser.email } : null,
      role,
      source: supabase ? 'supabase' : 'local',
    });
  } catch (error) {
    console.error('[me] error:', error);
    return NextResponse.json({ error: 'Failed to fetch user info' }, { status: 500 });
  }
}
