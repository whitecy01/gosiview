'use client';

import { createContext, useContext } from 'react';

export const NewResidentContext = createContext<() => void>(() => {});

export function useNewResident() {
  return useContext(NewResidentContext);
}
