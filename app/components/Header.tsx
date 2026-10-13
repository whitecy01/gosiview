'use client';

import { useState, useEffect, useRef } from 'react';
import { PanelLeftClose, PanelLeftOpen, UserPlus, LogOut, Bell, Menu } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import { useRouter } from 'next/navigation';
import ChangelogModal from './ChangelogModal';
import { CHANGELOG_SEEN_KEY, LATEST_VERSION } from '@/app/lib/changelog';

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  /** 모바일에서 사이드바 드로어 열기 */
  onMobileMenu: () => void;
  onNewResident: () => void;
}

export default function Header({ collapsed, onToggle, onMobileMenu, onNewResident }: HeaderProps) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  // 마지막으로 본 버전과 다르면 배지 표시
  useEffect(() => {
    try {
      const seen = localStorage.getItem(CHANGELOG_SEEN_KEY);
      if (seen !== LATEST_VERSION) setHasUnread(true);
    } catch { /* ignore */ }
  }, []);

  function openChangelog() {
    setShowChangelog(true);
    setHasUnread(false);
    try {
      localStorage.setItem(CHANGELOG_SEEN_KEY, LATEST_VERSION);
    } catch { /* ignore */ }
  }

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
    <header className={`fixed top-0 right-0 left-0 z-30 border-b border-[#2A2A2A] bg-[#0A0A0A]/80 backdrop-blur-md transition-all duration-300 ${collapsed ? 'lg:left-16' : 'lg:left-64'}`}>
      <div className="flex h-16 items-center justify-between px-3 sm:px-4 lg:px-6">
        {/* 왼쪽: 메뉴 / 사이드바 토글 */}
        <div className="flex flex-1 items-center gap-2">
          {/* 모바일 — 드로어 열기 */}
          <button
            onClick={onMobileMenu}
            className="flex items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#1A1A1A] hover:text-white lg:hidden"
            title="메뉴 열기"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* 데스크톱 — 접기/펼치기 */}
          <button
            onClick={onToggle}
            className="hidden items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#1A1A1A] hover:text-white lg:flex"
            title={collapsed ? '사이드바 열기' : '사이드바 닫기'}
          >
            {collapsed
              ? <PanelLeftOpen className="h-5 w-5" />
              : <PanelLeftClose className="h-5 w-5" />
            }
          </button>

          {/* 모바일에서는 사이드바가 숨어 있으니 로고로 현재 앱을 알려준다 */}
          <span className="text-base font-semibold text-white lg:hidden">gosiview</span>
        </div>

        {/* 오른쪽 액션 */}
        <div className="flex items-center gap-1 sm:gap-3 lg:gap-4">
          <button
            type="button"
            onClick={onNewResident}
            className="hidden sm:flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-sm font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            신규 입실자 등록
          </button>

          {/* 모바일 — 아이콘만 (위 버튼이 sm 미만에서 숨으므로) */}
          <button
            type="button"
            onClick={onNewResident}
            title="신규 입실자 등록"
            className="flex items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-2 text-indigo-300 transition-colors hover:bg-indigo-500/20 sm:hidden"
          >
            <UserPlus className="h-4 w-4" />
          </button>

          {/* 업데이트 소식 */}
          <button
            type="button"
            onClick={openChangelog}
            title="업데이트 소식"
            className="relative flex items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#1A1A1A] hover:text-white"
          >
            <Bell className="h-5 w-5" />
            {hasUnread && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-[#0A0A0A]" />
            )}
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

      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
    </header>
  );
}
