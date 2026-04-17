'use client';

import { createContext, useContext, useState } from 'react';

interface MockDateContextValue {
  today: Date;
  todayStr: string; // "YYYY-MM-DD"
  mockDate: string | null; // null = 실제 오늘
  setMockDate: (date: string | null) => void;
}

const MockDateContext = createContext<MockDateContextValue>({
  today: new Date(),
  todayStr: new Date().toISOString().slice(0, 10),
  mockDate: null,
  setMockDate: () => {},
});

function toLocalMidnight(dateStr: string): Date {
  // "YYYY-MM-DD" → 로컬 자정 (UTC 오프셋 문제 없이)
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function todayLocalStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function MockDateProvider({ children }: { children: React.ReactNode }) {
  const [mockDate, setMockDate] = useState<string | null>(null);

  const todayStr = mockDate ?? todayLocalStr();
  const today = toLocalMidnight(todayStr);

  return (
    <MockDateContext.Provider value={{ today, todayStr, mockDate, setMockDate }}>
      {children}
    </MockDateContext.Provider>
  );
}

export function useToday() {
  return useContext(MockDateContext);
}
