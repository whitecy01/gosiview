import { NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { createAdminClient } from '@/app/lib/supabase/admin';

/**
 * 로그인/접속 기록. body.event = 'login'(비번 로그인) | 'access'(앱 접속, 기본).
 * 'access'는 10분 내 중복 skip, 'login'은 항상 기록.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const event = body?.event === 'login' ? 'login' : 'access';

  const admin = createAdminClient();

  // 'access'는 최근 10분 내 같은 사용자 기록이 있으면 중복 skip (로그인은 항상 기록)
  if (event === 'access') {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recent } = await admin
      .from('access_logs')
      .select('id')
      .eq('user_id', user.id)
      .gte('at', tenMinAgo)
      .limit(1);
    if (recent && recent.length > 0) {
      return NextResponse.json({ ok: true, skipped: true });
    }
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? req.headers.get('x-real-ip')
    ?? null;
  const userAgent = req.headers.get('user-agent') ?? null;

  await admin.from('access_logs').insert({
    user_id: user.id,
    email: user.email ?? null,
    ip,
    user_agent: userAgent,
    event,
  });

  return NextResponse.json({ ok: true });
}
