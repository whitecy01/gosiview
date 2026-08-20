import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // 리다이렉트 시에도 갱신된 세션 쿠키를 실어줘야 세션이 어긋나지 않는다.
  const redirectTo = (dest: string) => {
    const res = NextResponse.redirect(new URL(dest, request.url));
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value));
    return res;
  };

  const isLoginPage = path === '/login';

  // 로그인 안 된 상태에서 /login 외 페이지 접근 시 → /login
  if (!user && !isLoginPage) {
    return redirectTo('/login');
  }

  // 로그인된 상태에서 /login 접근 시 → /
  if (user && isLoginPage) {
    return redirectTo('/');
  }

  // 권한 가드: /stats, /accounts, /login-history 는 사장·원장·개발자만 (총무 차단)
  const adminOnly = path.startsWith('/stats') || path.startsWith('/accounts') || path.startsWith('/login-history');
  if (user && adminOnly) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    const isAdmin = profile?.role === '사장' || profile?.role === '원장' || profile?.role === '개발자';
    if (!isAdmin) {
      return redirectTo('/');
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
