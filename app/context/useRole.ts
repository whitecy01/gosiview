'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';

export type Role = '사장' | '원장' | '총무' | '개발자';

/** 현재 로그인 사용자의 역할을 클라이언트에서 조회한다. */
export function useRole() {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (alive) { setRole(null); setLoading(false); } return; }
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (alive) { setRole((data?.role as Role | undefined) ?? null); setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const isAdmin = role === '사장' || role === '원장' || role === '개발자';
  return { role, isAdmin, loading };
}
