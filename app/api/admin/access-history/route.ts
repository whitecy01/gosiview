import { NextResponse } from 'next/server';
import { createAdminClient } from '@/app/lib/supabase/admin';
import { getCurrentRole, isAdminRole } from '@/app/lib/auth';

/** 접속 기록 조회 (사장·원장·개발자만) */
export async function GET(req: Request) {
  const role = await getCurrentRole();
  if (!isAdminRole(role)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get('limit')) || 300, 1000);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('access_logs')
    .select('email, ip, user_agent, event, at')
    .order('at', { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ logs: data ?? [] });
}
