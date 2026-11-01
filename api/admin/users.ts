import { requireAdmin } from '../_lib/requireUser.js';
import { supabaseAdmin } from '../_lib/supabase-server.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = await requireAdmin(req, res);
  if (!auth) return;

  try {
    // 1. Fetch all user profiles
    const { data: profiles, error: profError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('requested_at', { ascending: false });

    if (profError) {
      console.error('Error fetching profiles:', profError);
      return res.status(500).json({ error: profError.message });
    }

    // 2. Fetch image generations to calculate credit usage
    const { data: generations, error: genError } = await supabaseAdmin
      .from('generations')
      .select('id, user_id, kind, slot, model, created_at, status')
      .order('created_at', { ascending: false });

    if (genError) {
      console.warn('Note: Error fetching generations table:', genError.message);
    }

    const genList = generations || [];

    // 3. Compute timestamps for today and past days
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    
    const twentyFourHoursAgoTime = now.getTime() - 24 * 60 * 60 * 1000;

    let creditsToday = 0;
    let creditsYesterday = 0;
    let creditsLast24h = 0;
    const creditsTotal = genList.length;

    // Per-user credit tracking
    const userCreditMap: Record<string, { creditsToday: number; creditsTotal: number; lastActive: string | null }> = {};

    // Grouping by date for daily breakdown
    const dateCounts: Record<string, { count: number; users: Set<string> }> = {};

    // Prepare last 7 days structure
    const dailyBreakdown: Array<{ date: string; label: string; credits: number; activeUsers: number }> = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const ds = d.toISOString().slice(0, 10);
      const label =
        i === 0
          ? 'Today'
          : i === 1
          ? 'Yesterday'
          : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dateCounts[ds] = { count: 0, users: new Set() };
      dailyBreakdown.push({ date: ds, label, credits: 0, activeUsers: 0 });
    }

    // Aggregate generations
    for (const gen of genList) {
      if (!gen.created_at) continue;
      const genParsedDate = new Date(gen.created_at);
      if (isNaN(genParsedDate.getTime())) continue;

      const genTime = genParsedDate.getTime();
      const genDateStr = genParsedDate.toISOString().slice(0, 10);
      const uid = gen.user_id;

      // Initialize user credit map
      if (!userCreditMap[uid]) {
        userCreditMap[uid] = { creditsToday: 0, creditsTotal: 0, lastActive: null };
      }
      userCreditMap[uid].creditsTotal += 1;
      if (!userCreditMap[uid].lastActive || genTime > new Date(userCreditMap[uid].lastActive!).getTime()) {
        userCreditMap[uid].lastActive = gen.created_at;
      }

      // Check today
      if (genDateStr === todayStr) {
        creditsToday += 1;
        userCreditMap[uid].creditsToday += 1;
      }

      // Check yesterday
      if (genDateStr === yesterdayStr) {
        creditsYesterday += 1;
      }

      // Check 24 hours rolling
      if (genTime >= twentyFourHoursAgoTime) {
        creditsLast24h += 1;
      }

      // Daily breakdown
      if (dateCounts[genDateStr]) {
        dateCounts[genDateStr].count += 1;
        if (uid) dateCounts[genDateStr].users.add(uid);
      }
    }

    // Populate daily breakdown values
    for (const day of dailyBreakdown) {
      if (dateCounts[day.date]) {
        day.credits = dateCounts[day.date].count;
        day.activeUsers = dateCounts[day.date].users.size;
      }
    }

    // Enrich profiles with credit usage data
    const enrichedUsers = (profiles || []).map((prof: any) => {
      const usage = userCreditMap[prof.id] || { creditsToday: 0, creditsTotal: 0, lastActive: null };
      return {
        ...prof,
        creditsToday: usage.creditsToday,
        creditsTotal: usage.creditsTotal,
        lastActive: usage.lastActive,
      };
    });

    return res.status(200).json({
      users: enrichedUsers,
      creditStats: {
        creditsToday,
        creditsYesterday,
        creditsLast24h,
        creditsTotal,
        dailyBreakdown,
      },
    });
  } catch (err: any) {
    console.error('admin/users handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
