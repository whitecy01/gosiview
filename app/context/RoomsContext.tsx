'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { type Room } from '@/app/lib/mock-data';
import {
  type DbContract,
  type NewContractInput,
  fetchRoomsAndContracts,
  buildRooms,
  insertContract,
  updateContract,
  deleteContract,
} from '@/app/lib/supabase-data';

interface RoomsContextValue {
  rooms: Room[];
  contracts: DbContract[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addContract: (input: NewContractInput) => Promise<void>;
  editContract: (id: string, input: Partial<NewContractInput>) => Promise<void>;
  removeContract: (id: string) => Promise<void>;
}

const RoomsContext = createContext<RoomsContextValue | null>(null);

export function RoomsProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [contracts, setContracts] = useState<DbContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { rooms: dbRooms, contracts: dbContracts } = await fetchRoomsAndContracts();
      setContracts(dbContracts);
      setRooms(buildRooms(dbRooms, dbContracts));
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addContract = useCallback(async (input: NewContractInput) => {
    await insertContract(input);
    await refetch();
  }, [refetch]);

  const editContract = useCallback(async (id: string, input: Partial<NewContractInput>) => {
    await updateContract(id, input);
    await refetch();
  }, [refetch]);

  const removeContract = useCallback(async (id: string) => {
    await deleteContract(id);
    await refetch();
  }, [refetch]);

  return (
    <RoomsContext.Provider value={{ rooms, contracts, loading, error, refetch, addContract, editContract, removeContract }}>
      {children}
    </RoomsContext.Provider>
  );
}

export function useRooms() {
  const ctx = useContext(RoomsContext);
  if (!ctx) throw new Error('useRooms must be used within RoomsProvider');
  return ctx;
}
