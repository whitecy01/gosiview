import { Building2, LayoutDashboard, Settings, Users, LogOut, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[#2A2A2A] bg-[#0A0A0A] transition-transform">
      <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
        {/* Logo area */}
        <Link href="/" className="mb-8 flex items-center pl-2.5">
          <Building2 className="mr-3 h-6 w-6 text-indigo-500" />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-white">gosiview</span>
        </Link>
        
        {/* Navigation links */}
        <ul className="space-y-2 font-medium flex-1">
          <li>
            <Link href="/" className="group flex items-center rounded-lg p-2 text-white hover:bg-[#1A1A1A]">
              <LayoutDashboard className="h-5 w-5 text-gray-400 transition duration-75 group-hover:text-white" />
              <span className="ml-3">대시보드</span>
            </Link>
          </li>
          {/* <li>
            <Link href="/ledger" className="group flex items-center rounded-lg p-2 text-white hover:bg-[#1A1A1A]">
              <BookOpen className="h-5 w-5 text-gray-400 transition duration-75 group-hover:text-white" />
              <span className="ml-3">장부 관리</span>
            </Link>
          </li> */}
          <li>
            <Link href="/residents" className="group flex items-center rounded-lg p-2 text-white hover:bg-[#1A1A1A]">
              <Users className="h-5 w-5 text-gray-400 transition duration-75 group-hover:text-white" />
              <span className="ml-3">입실자 관리</span>
            </Link>
          </li>
          <li>
            <Link href="/settings" className="group flex items-center rounded-lg p-2 text-white hover:bg-[#1A1A1A]">
              <Settings className="h-5 w-5 text-gray-400 transition duration-75 group-hover:text-white" />
              <span className="ml-3">설정</span>
            </Link>
          </li>
        </ul>

        {/* Bottom Actions */}
        <ul className="space-y-2 font-medium mt-auto border-t border-[#2A2A2A] pt-4">
          <li>
            <button className="group flex w-full items-center rounded-lg p-2 text-white hover:bg-[#1A1A1A]">
              <LogOut className="h-5 w-5 text-rose-500 transition duration-75 group-hover:text-rose-400" />
              <span className="ml-3 text-rose-500 group-hover:text-rose-400">로그아웃</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
