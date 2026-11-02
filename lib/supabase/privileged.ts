import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function upsertUserProfile(
  userId: string,
  opts: {
    firstName?: string;
    lastName?: string;
    role?: string;
    avatarUrl?: string;
  }
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, serviceKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // no‑op – cookies are managed by the auth client
      },
    },
  });

  const payload: any = {
    user_id: userId,
    first_name: opts.firstName ?? '',
    last_name: opts.lastName ?? '',
    role: opts.role ?? 'member',
    // avatar_url column does not exist in the new schema; ignore if provided
  };

  const { error } = await supabase.from('users').upsert(payload, { onConflict: 'user_id' });
  if (error) {
    console.error('Failed to upsert user profile:', error);
    throw error;
  }
}
