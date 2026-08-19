'use client';

import { Building2, CalendarRange, LayoutDashboard, Users, LogOut, ListTodo, BarChart2, Printer, UserCog } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { useRole } from '@/app/context/useRole';

interface SidebarProps {
  collapsed: boolean;
}

// adminOnly: 사장·원장만 노출 (관리자에게 미노출)
const NAV_ITEMS = [
  { href: '/', icon: ListTodo, label: 'Todo List' },
  { href: '/dashboard', icon: LayoutDashboard, label: '대시보드' },
  { href: '/residents', icon: Users, label: '입실자 관리' },
  { href: '/calendar', icon: CalendarRange, label: '연간 캘린더' },
  { href: '/print', icon: Printer, label: '출력' },
  { href: '/stats', icon: BarChart2, label: '통계', adminOnly: true },
  { href: '/accounts', icon: UserCog, label: '계정 관리', adminOnly: true },
];

export default function Sidebar({ collapsed }: SidebarProps) {
  const router = useRouter();
  const { isAdmin } = useRole();
  const navItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen border-r border-[#2A2A2A] bg-[#0A0A0A] transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex h-full flex-col overflow-y-auto overflow-x-hidden py-4">
        {/* Logo */}
        <Link
          href="/"
          className={`mb-8 flex items-center px-3 ${collapsed ? 'justify-center' : 'pl-4'}`}
        >
          <Building2 className="h-6 w-6 shrink-0 text-indigo-500" />
          {!collapsed && (
            <span className="ml-3 whitespace-nowrap text-xl font-semibold text-white">
              gosiview
            </span>
          )}
        </Link>

        {/* Navigation */}
        <ul className="flex-1 space-y-1 px-2 font-medium">
          {navItems.map(({ href, icon: Icon, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`group flex items-center rounded-lg p-2 text-white hover:bg-[#1A1A1A] transition-colors ${
                  collapsed ? 'justify-center' : ''
                }`}
                title={collapsed ? label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0 text-gray-400 transition duration-75 group-hover:text-white" />
                {!collapsed && <span className="ml-3 whitespace-nowrap">{label}</span>}
              </Link>
            </li>
          ))}
        </ul>

        {/* Bottom */}
        <ul className="space-y-1 border-t border-[#2A2A2A] px-2 pt-4 font-medium">
          <li>
            <button
              onClick={handleLogout}
              className={`group flex w-full items-center rounded-lg p-2 text-white hover:bg-[#1A1A1A] transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
              title={collapsed ? '로그아웃' : undefined}
            >
              <LogOut className="h-5 w-5 shrink-0 text-rose-500 transition duration-75 group-hover:text-rose-400" />
              {!collapsed && (
                <span className="ml-3 whitespace-nowrap text-rose-500 group-hover:text-rose-400">
                  로그아웃
                </span>
              )}
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
