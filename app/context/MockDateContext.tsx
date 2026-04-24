'use client';

import { createContext, useContext } from 'react';

interface TodayContextValue {
  today: Date;
  todayStr: string; // "YYYY-MM-DD" (Asia/Seoul 기준)
}

function getSeoulDateStr(): string {
  // 서울 시간(KST, UTC+9) 기준 YYYY-MM-DD
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
}

function getSeoulMidnight(): Date {
  const [y, m, d] = getSeoulDateStr().split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

const TodayContext = createContext<TodayContextValue>({
  today: getSeoulMidnight(),
  todayStr: getSeoulDateStr(),
});

export function MockDateProvider({ children }: { children: React.ReactNode }) {
  const todayStr = getSeoulDateStr();
  const today = getSeoulMidnight();

  return (
    <TodayContext.Provider value={{ today, todayStr }}>
      {children}
    </TodayContext.Provider>
  );
}

export function useToday() {
  return useContext(TodayContext);
}
