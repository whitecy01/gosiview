'use client';

import { createContext, useContext } from 'react';

export const NewResidentContext = createContext<(roomId?: string) => void>(() => {});

export function useNewResident() {
  return useContext(NewResidentContext);
}
