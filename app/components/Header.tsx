'use client';

import { useState, useEffect, useRef } from 'react';
import { PanelLeftClose, PanelLeftOpen, UserPlus, LogOut } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  onNewResident: () => void;
}

export default function Header({ collapsed, onToggle, onNewResident }: HeaderProps) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const initials = email ? email[0].toUpperCase() : '?';

  return (
    <header className={`fixed top-0 z-30 border-b border-[#2A2A2A] bg-[#0A0A0A]/80 backdrop-blur-md transition-all duration-300 ${collapsed ? 'left-16' : 'left-64'} right-0`}>
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Toggle */}
        <div className="flex flex-1 items-center gap-3">
          <button
            onClick={onToggle}
            className="flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-colors"
            title={collapsed ? '사이드바 열기' : '사이드바 닫기'}
          >
            {collapsed
              ? <PanelLeftOpen className="h-5 w-5" />
              : <PanelLeftClose className="h-5 w-5" />
            }
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onNewResident}
            className="hidden sm:flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-sm font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            신규 입실자 등록
          </button>

          {/* 프로필 드롭다운 */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowProfile((v) => !v)}
              className="flex rounded-full transition-transform active:scale-95"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg text-sm">
                {initials}
              </div>
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border border-[#2A2A2A] bg-[#111] shadow-2xl overflow-hidden">
                {/* 계정 정보 */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#2A2A2A]">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-sm">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">로그인된 계정</p>
                    <p className="text-sm font-medium text-white truncate">{email ?? '—'}</p>
                  </div>
                </div>

                {/* 로그아웃 */}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
