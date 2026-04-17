'use client';

import { useMemo } from 'react';
import { getDashboardStats } from '@/app/lib/mock-data';
import { useRooms } from './RoomsContext';
import { useToday } from './MockDateContext';

/**
 * 모든 페이지에서 공통으로 사용하는 방 상태 훅.
 * Supabase에서 가져온 rooms + contracts 기반으로 계산합니다.
 */
export function useEffectiveRooms() {
  const { rooms, contracts, loading, error, refetch } = useRooms();
  const { today } = useToday();

  // 오늘 날짜 기준으로 scheduled → active 전환
  const effectiveRooms = useMemo(() => {
    return rooms.map((room) => {
      if (room.status !== 'contract') return room;

      // scheduled 계약 중 입실일이 오늘 이전인 것 → active로 취급
      const scheduledContracts = contracts.filter(
        (c) => c.room_id === room.id && c.status === 'scheduled'
      );
      const movedIn = scheduledContracts.find((c) => {
        const moveIn = new Date(c.actual_move_in_date ?? c.contract_start_date);
        return moveIn <= today;
      });

      if (!movedIn) return room;

      const moveIn = movedIn.actual_move_in_date ?? movedIn.contract_start_date;
      return {
        ...room,
        status: 'occupied' as const,
        resident: movedIn.name,
        phone: movedIn.phone,
        gender: movedIn.gender,
        age: movedIn.age,
        moveInDate: moveIn,
        moveOutDate: movedIn.actual_move_out_date ?? movedIn.contract_end_date ?? null,
        monthlyRent: movedIn.monthly_rent
          ? `₩${movedIn.monthly_rent.toLocaleString('ko-KR')}`
          : room.roomPrice,
        paymentStatus: 'upcoming' as const,
        rentStatus: 'upcoming',
      };
    });
  }, [rooms, contracts, today]);

  const stats = useMemo(() => getDashboardStats(effectiveRooms), [effectiveRooms]);

  return { effectiveRooms, stats, today, loading, error, refetch };
}
