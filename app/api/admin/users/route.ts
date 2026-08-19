import { NextResponse } from 'next/server';
import { createAdminClient } from '@/app/lib/supabase/admin';
import { getCurrentRole, isAdminRole, type Role } from '@/app/lib/auth';

const ALL_ROLES: Role[] = ['사장', '원장', '총무', '개발자'];

/** 요청자가 사장/원장인지 확인. 아니면 에러 응답 반환. */
async function requireAdmin() {
  const role = await getCurrentRole();
  if (!isAdminRole(role)) {
    return NextResponse.json({ error: '권한이 없습니다. (사장·원장만 가능)' }, { status: 403 });
  }
  return null;
}

/** 사용자 목록 (역할 포함) */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const admin = createAdminClient();
  const { data: list, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: profiles } = await admin.from('profiles').select('id, role, name');
  const roleById = new Map((profiles ?? []).map((p) => [p.id, p]));

  const users = list.users.map((u) => ({
    id: u.id,
    email: u.email ?? '',
    role: (roleById.get(u.id)?.role as Role | undefined) ?? null,
    name: roleById.get(u.id)?.name ?? null,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
  }));

  return NextResponse.json({ users });
}

/** 사용자 생성 { email, password, role, name } */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const email = (body?.email ?? '').trim();
  const password = body?.password ?? '';
  const role = body?.role as Role;
  const name = (body?.name ?? '').trim() || null;

  if (!email || !password) return NextResponse.json({ error: '이메일과 비밀번호를 입력하세요.' }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, { status: 400 });
  if (!ALL_ROLES.includes(role)) return NextResponse.json({ error: '역할이 올바르지 않습니다.' }, { status: 400 });

  const admin = createAdminClient();
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // 가짜 이메일도 인증 없이 바로 로그인 가능
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { error: pErr } = await admin.from('profiles').insert({ id: created.user.id, role, name });
  if (pErr) {
    // profiles 저장 실패 시 방금 만든 유저 롤백
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: `역할 저장 실패: ${pErr.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
