'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import NewResidentModal from './NewResidentModal';
import { NewResidentContext } from './NewResidentContext';
import { MockDateProvider } from '../context/MockDateContext';
import { RoomsProvider } from '../context/RoomsContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [newResidentRoomId, setNewResidentRoomId] = useState<string | undefined>(undefined);
  // 모바일(lg 미만)에서는 사이드바를 드로어로 띄운다.
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // 메뉴로 이동하면 드로어를 닫는다.
  useEffect(() => setMobileOpen(false), [pathname]);

  // 드로어가 열린 동안 뒤 화면이 스크롤되지 않게 한다.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  // 앱 접속 기록 (탭당 1회, 로그인 상태면 서버에서 기록)
  useEffect(() => {
    if (sessionStorage.getItem('access_logged')) return;
    fetch('/api/access-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'access' }),
    })
      .then(() => sessionStorage.setItem('access_logged', '1'))
      .catch(() => {});
  }, []);

  function openNewResident(roomId?: string) {
    setNewResidentRoomId(roomId ?? '');
  }

  return (
    <RoomsProvider>
    <MockDateProvider>
    <NewResidentContext.Provider value={openNewResident}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Header
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        onMobileMenu={() => setMobileOpen(true)}
        onNewResident={() => openNewResident()}
      />
      {/* 모바일에서는 사이드바가 화면 위에 덮이므로 본문을 밀지 않는다. */}
      <div className={`p-3 pt-20 transition-all duration-300 sm:p-4 sm:pt-20 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {children}
      </div>
      {newResidentRoomId !== undefined && (
        <NewResidentModal
          initialRoomId={newResidentRoomId}
          onClose={() => setNewResidentRoomId(undefined)}
        />
      )}
    </NewResidentContext.Provider>
    </MockDateProvider>
    </RoomsProvider>
  );
}
