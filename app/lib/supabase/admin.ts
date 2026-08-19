import { createClient } from '@supabase/supabase-js';

/**
 * 서버 전용 관리자 클라이언트 (service_role 키).
 * ⚠️ 절대 클라이언트 컴포넌트에서 import 하지 말 것. API 라우트/서버에서만 사용한다.
 * SUPABASE_SERVICE_ROLE_KEY 는 NEXT_PUBLIC_ 접두어 없이 .env.local 에 둔다.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다. (.env.local 확인)');
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
