'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import NewResidentModal from './NewResidentModal';
import { NewResidentContext } from './NewResidentContext';
import { MockDateProvider } from '../context/MockDateContext';
import { RoomsProvider } from '../context/RoomsContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [newResidentRoomId, setNewResidentRoomId] = useState<string | undefined>(undefined);

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
      <Sidebar collapsed={collapsed} />
      <Header
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        onNewResident={() => openNewResident()}
      />
      <div className={`p-4 pt-20 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
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
