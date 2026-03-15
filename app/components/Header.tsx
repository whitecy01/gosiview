import { Bell, Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 z-30 w-full border-b border-[#2A2A2A] bg-[#0A0A0A]/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:ml-64 lg:px-6">
        <div className="flex flex-1 items-center">
          <form action="#" method="GET" className="hidden lg:block w-full max-w-sm">
            <label htmlFor="topbar-search" className="sr-only">검색</label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                name="email" 
                id="topbar-search" 
                className="block w-full rounded-md border border-[#2A2A2A] bg-[#1A1A1A] p-2.5 pl-10 text-sm text-gray-200 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm placeholder-gray-500 transition-colors" 
                placeholder="검색어 입력..." 
              />
            </div>
          </form>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" className="rounded-full p-2 text-gray-400 hover:bg-[#1A1A1A] hover:text-white focus:ring-4 focus:ring-gray-700 transition-colors">
            <span className="sr-only">알림 보기</span>
            <Bell className="h-5 w-5" />
          </button>
          
          <div className="relative ml-2">
            <button type="button" className="flex rounded-full bg-gray-800 text-sm focus:ring-4 focus:ring-gray-700 md:mr-0 transition-transform active:scale-95">
              <span className="sr-only">사용자 메뉴 열기</span>
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">
                AM
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
