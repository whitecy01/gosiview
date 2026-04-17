'use client';

import { useState } from 'react';
import { Bell, PanelLeftClose, PanelLeftOpen, Search, UserPlus, CalendarClock, X } from 'lucide-react';
import { useToday } from '../context/MockDateContext';

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  onNewResident: () => void;
}

export default function Header({ collapsed, onToggle, onNewResident }: HeaderProps) {
  const { todayStr, mockDate, setMockDate } = useToday();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [inputDate, setInputDate] = useState(todayStr);
  const isMock = !!mockDate;

  function applyDate() {
    setMockDate(inputDate || null);
    setShowDatePicker(false);
  }
  function resetDate() {
    setMockDate(null);
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setInputDate(`${y}-${m}-${day}`);
    setShowDatePicker(false);
  }

  return (
    <header className={`fixed top-0 z-30 border-b border-[#2A2A2A] bg-[#0A0A0A]/80 backdrop-blur-md transition-all duration-300 ${collapsed ? 'left-16' : 'left-64'} right-0`}>
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Toggle + Search */}
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

          <form action="#" method="GET" className="hidden lg:block w-full max-w-sm">
            <label htmlFor="topbar-search" className="sr-only">검색</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                id="topbar-search"
                className="block w-full rounded-md border border-[#2A2A2A] bg-[#1A1A1A] p-2.5 pl-10 text-sm text-gray-200 focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-500 transition-colors"
                placeholder="검색어 입력..."
              />
            </div>
          </form>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">

          {/* 날짜 테스트 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setInputDate(todayStr); setShowDatePicker((v) => !v); }}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                isMock
                  ? 'border-amber-500/50 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                  : 'border-[#2A2A2A] bg-[#1A1A1A] text-gray-400 hover:text-white'
              }`}
              title="테스트 날짜 변경"
            >
              <CalendarClock className="h-3.5 w-3.5" />
              <span>{isMock ? `테스트: ${todayStr}` : todayStr}</span>
              {isMock && (
                <span
                  role="button"
                  onClick={(e) => { e.stopPropagation(); resetDate(); }}
                  className="ml-0.5 rounded-full hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </span>
              )}
            </button>

            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border border-[#2A2A2A] bg-[#111] shadow-2xl p-4 space-y-3">
                <p className="text-xs font-semibold text-amber-400">테스트 날짜 설정</p>
                <p className="text-[10px] text-gray-500">오늘 날짜를 임시로 변경해 날짜 기반 로직을 테스트합니다.</p>
                <input
                  type="date"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-white outline-none focus:border-amber-500 transition-colors"
                />
                <div className="flex gap-2">
                  <button onClick={resetDate} className="flex-1 rounded-lg border border-[#2A2A2A] py-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                    실제 오늘로 리셋
                  </button>
                  <button onClick={applyDate} className="flex-1 rounded-lg bg-amber-500 py-1.5 text-xs font-semibold text-black hover:bg-amber-400 transition-colors">
                    적용
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onNewResident}
            className="hidden sm:flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-sm font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            신규 입실자 등록
          </button>
          <button
            type="button"
            className="rounded-full p-2 text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-colors"
          >
            <span className="sr-only">알림 보기</span>
            <Bell className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="flex rounded-full bg-gray-800 text-sm focus:ring-4 focus:ring-gray-700 transition-transform active:scale-95"
          >
            <span className="sr-only">사용자 메뉴 열기</span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">
              AM
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
