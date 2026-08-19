import { NextResponse } from 'next/server';
import { createAdminClient } from '@/app/lib/supabase/admin';
import { createClient } from '@/app/lib/supabase/server';
import { getCurrentRole, isAdminRole } from '@/app/lib/auth';

async function requireAdmin() {
  const role = await getCurrentRole();
  if (!isAdminRole(role)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }
  return null;
}

/** 비밀번호 재설정 { password } */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const password = body?.password ?? '';
  if (password.length < 6) return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(id, { password });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

/** 사용자 삭제 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  // 본인 계정은 삭제 불가
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id === id) {
    return NextResponse.json({ error: '본인 계정은 삭제할 수 없습니다.' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id); // profiles는 on delete cascade로 함께 삭제
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
