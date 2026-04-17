import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // console.log('===== middleware start =====');
  // console.log('pathname:', request.nextUrl.pathname);
  // console.log('full url:', request.url);
  // console.log('method:', request.method);

  // console.log(
  //   'headers:',
  //   Object.fromEntries(request.headers.entries())
  // );

  // console.log(
  //   'cookies:',
  //   request.cookies.getAll().map((cookie) => ({
  //     name: cookie.name,
  //     value: cookie.value.length > 20
  //       ? cookie.value.slice(0, 20) + '...'
  //       : cookie.value,
  //   }))
  // );
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

  // 로그인 안 된 상태에서 /login 외 페이지 접근 시 → /login 리다이렉트
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 로그인된 상태에서 /login 접근 시 → / 리다이렉트
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
