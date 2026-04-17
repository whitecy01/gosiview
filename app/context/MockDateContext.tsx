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

export function MockDateProvider({ children }: { children: React.ReactNode }) {
  const [mockDate, setMockDate] = useState<string | null>(null);

  const today = mockDate ? new Date(mockDate) : new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  return (
    <MockDateContext.Provider value={{ today, todayStr, mockDate, setMockDate }}>
      {children}
    </MockDateContext.Provider>
  );
}

export function useToday() {
  return useContext(MockDateContext);
}
