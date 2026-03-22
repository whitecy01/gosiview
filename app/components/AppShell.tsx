'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import NewResidentModal from './NewResidentModal';
import { NewResidentContext } from './NewResidentContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isNewResidentOpen, setIsNewResidentOpen] = useState(false);

  return (
    <NewResidentContext.Provider value={() => setIsNewResidentOpen(true)}>
      <Sidebar collapsed={collapsed} />
      <Header
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        onNewResident={() => setIsNewResidentOpen(true)}
      />
      <div className={`p-4 pt-20 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
        {children}
      </div>
      {isNewResidentOpen && (
        <NewResidentModal onClose={() => setIsNewResidentOpen(false)} />
      )}
    </NewResidentContext.Provider>
  );
}
