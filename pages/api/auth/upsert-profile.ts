import type { NextApiRequest, NextApiResponse } from 'next';
import { upsertUserProfile } from '@/lib/supabase/privileged';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId, firstName, lastName, role } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    await upsertUserProfile(userId, { firstName, lastName, role });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('API upsert profile error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}