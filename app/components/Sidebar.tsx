'use client';

import { Building2, CalendarRange, LayoutDashboard, Users, LogOut, ListTodo, BarChart2, Printer, UserCog, History, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { useRole } from '@/app/context/useRole';

interface SidebarProps {
  collapsed: boolean;
  /** 모바일 드로어 열림 여부 (lg 이상에서는 무시됨) */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

// 공용 기능 (모든 계정)
const GENERAL_ITEMS = [
  { href: '/', icon: ListTodo, label: 'Todo List' },
  { href: '/dashboard', icon: LayoutDashboard, label: '대시보드' },
  { href: '/residents', icon: Users, label: '입실자 관리' },
  { href: '/calendar', icon: CalendarRange, label: '연간 캘린더' },
  { href: '/print', icon: Printer, label: '출력' },
];

// 관리자 전용 (사장·원장·개발자만)
const ADMIN_ITEMS = [
  { href: '/stats', icon: BarChart2, label: '통계' },
  { href: '/accounts', icon: UserCog, label: '계정 관리' },
  { href: '/login-history', icon: History, label: '로그인 이력' },
];

export default function Sidebar({ collapsed, mobileOpen = false, onMobileClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin } = useRole();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  // 접힘(collapsed)은 데스크톱에만 적용한다. 모바일 드로어에서는 항상 라벨을 보여준다.
  const labelHidden = collapsed ? 'lg:hidden' : '';
  const rowCenter = collapsed ? 'lg:justify-center' : '';

  function renderItems(items: typeof GENERAL_ITEMS) {
    return (
      <ul className="space-y-1">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onMobileClose}
                className={`group flex items-center rounded-lg p-2.5 transition-colors lg:p-2 ${rowCenter} ${
                  active ? 'bg-indigo-500/15 text-indigo-300' : 'text-white hover:bg-[#1A1A1A]'
                }`}
                title={collapsed ? label : undefined}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition duration-75 ${
                    active ? 'text-indigo-400' : 'text-gray-400 group-hover:text-white'
                  }`}
                />
                <span className={`ml-3 whitespace-nowrap ${labelHidden}`}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <>
      {/* 모바일 드로어 배경 */}
      <div
        onClick={onMobileClose}
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-[#2A2A2A] bg-[#0A0A0A] transition-all duration-300 lg:z-40 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } ${collapsed ? 'lg:w-16' : 'lg:w-64'}`}
      >
        <div className="flex h-full flex-col overflow-y-auto overflow-x-hidden py-4">
          {/* 로고 */}
          <div className={`mb-8 flex items-center justify-between px-3 ${collapsed ? 'lg:px-3' : ''}`}>
            <Link
              href="/"
              onClick={onMobileClose}
              className={`flex items-center ${collapsed ? 'lg:w-full lg:justify-center' : 'pl-1'}`}
            >
              <Building2 className="h-6 w-6 shrink-0 text-indigo-500" />
              <span className={`ml-3 whitespace-nowrap text-xl font-semibold text-white ${labelHidden}`}>
                gosiview
              </span>
            </Link>
            {/* 드로어 닫기 (모바일 전용) */}
            <button
              onClick={onMobileClose}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[#1A1A1A] hover:text-white lg:hidden"
              title="메뉴 닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 메뉴 */}
          <nav className="flex-1 space-y-6 px-2 font-medium">
            {/* 운영 기능 (모든 계정) */}
            <div>
              <p className={`mb-2 px-2 text-sm font-semibold uppercase tracking-wider text-gray-500 ${labelHidden}`}>
                운영
              </p>
              {renderItems(GENERAL_ITEMS)}
            </div>

            {/* 관리자 전용 (사장·원장·개발자) */}
            {isAdmin && (
              <div>
                <p className={`mb-2 px-2 text-sm font-semibold uppercase tracking-wider text-amber-500/80 ${labelHidden}`}>
                  관리자 전용
                </p>
                {collapsed && <div className="mx-2 mb-1 hidden border-t border-[#2A2A2A] lg:block" />}
                {renderItems(ADMIN_ITEMS)}
              </div>
            )}
          </nav>

          {/* 하단 */}
          <ul className="space-y-1 border-t border-[#2A2A2A] px-2 pt-4 font-medium">
            <li>
              <button
                onClick={handleLogout}
                className={`group flex w-full items-center rounded-lg p-2.5 text-white transition-colors hover:bg-[#1A1A1A] lg:p-2 ${rowCenter}`}
                title={collapsed ? '로그아웃' : undefined}
              >
                <LogOut className="h-5 w-5 shrink-0 text-rose-500 transition duration-75 group-hover:text-rose-400" />
                <span className={`ml-3 whitespace-nowrap text-rose-500 group-hover:text-rose-400 ${labelHidden}`}>
                  로그아웃
                </span>
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
}
