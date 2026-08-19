import { createClient } from '@/app/lib/supabase/server';

export type Role = '사장' | '원장' | '총무' | '개발자';

/** 통계·계정 관리 등 상위 권한 (사장·원장·개발자). 총무는 제외 */
export const ADMIN_ROLES: Role[] = ['사장', '원장', '개발자'];

/** 현재 로그인한 사용자의 역할을 반환한다. 없으면 null. */
export async function getCurrentRole(): Promise<Role | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  return (data?.role as Role | undefined) ?? null;
}

export function isAdminRole(role: Role | null): boolean {
  return role === '사장' || role === '원장' || role === '개발자';
}
