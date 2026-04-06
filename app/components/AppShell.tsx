'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import NewResidentModal from './NewResidentModal';
import { NewResidentContext } from './NewResidentContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [newResidentRoomId, setNewResidentRoomId] = useState<string | undefined>(undefined);

  function openNewResident(roomId?: string) {
    setNewResidentRoomId(roomId);
  }

  return (
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
  );
}
