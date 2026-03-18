import { Bell, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Header({ collapsed, onToggle }: HeaderProps) {
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
