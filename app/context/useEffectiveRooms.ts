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
  const { today, todayStr } = useToday();

  // 오늘 날짜 기준으로 방 상태 계산 (YYYY-MM-DD 문자열 비교로 타임존 버그 방지)
  const effectiveRooms = useMemo(() => {
    return rooms.map((room) => {

      // ── Case 1: active 계약이 있는 방 — 퇴실일이 안 지났으면 그대로 ──
      if (room.status === 'occupied') {
        const moveOut = room.moveOutDate;
        if (!moveOut || moveOut.slice(0, 10) > todayStr) {
          return room; // 아직 거주 중
        }
        // 퇴실일 경과 → 아래 scheduled 검색으로 fall-through
      } else if (room.status !== 'contract') {
        return room; // vacant 등 변경 불필요
      }

      // ── Case 2 (+ Case 1 퇴실 후): scheduled 계약에서 현재 입실자 계산 ──
      // 조건: 입실일 ≤ 오늘 AND (퇴실일 없음 OR 퇴실일 > 오늘)
      // → 같은 방에 이전 입실자·신규 입실자가 모두 scheduled여도 정확히 구분
      const scheduledContracts = contracts.filter(
        (c) => c.room_id === room.id && c.status === 'scheduled'
      );

      const current = scheduledContracts
        .filter((c) => {
          const moveInStr = (c.actual_move_in_date ?? c.contract_start_date).slice(0, 10);
          if (moveInStr > todayStr) return false; // 아직 입실 전
          const moveOutDate = c.actual_move_out_date ?? c.contract_end_date;
          if (moveOutDate && moveOutDate.slice(0, 10) <= todayStr) return false; // 이미 퇴실
          return true;
        })
        .sort((a, b) => {
          // 가장 최근에 입실한 사람 우선
          const aDate = a.actual_move_in_date ?? a.contract_start_date;
          const bDate = b.actual_move_in_date ?? b.contract_start_date;
          return bDate.localeCompare(aDate);
        })[0];

      if (current) {
        const moveIn = current.actual_move_in_date ?? current.contract_start_date;
        return {
          ...room,
          status: 'occupied' as const,
          resident: current.name,
          phone: current.phone,
          gender: current.gender,
          age: current.age,
          moveInDate: moveIn,
          moveOutDate: current.actual_move_out_date ?? current.contract_end_date ?? null,
          monthlyRent: current.monthly_rent
            ? `₩${current.monthly_rent.toLocaleString('ko-KR')}`
            : room.roomPrice,
          contractId: current.id,
          paymentStatus: 'upcoming' as const,
          rentStatus: 'upcoming',
        };
      }

      // scheduled 중 현재 입실자 없음 → 공실
      return {
        ...room,
        status: 'vacant' as const,
        resident: null,
        phone: null,
        gender: null,
        age: null,
        moveInDate: null,
        moveOutDate: null,
        monthlyRent: null,
        contractId: null,
        paymentStatus: null,
        rentStatus: 'vacant',
      };
    });
  }, [rooms, contracts, todayStr]);

  const stats = useMemo(() => getDashboardStats(effectiveRooms), [effectiveRooms]);

  return { effectiveRooms, stats, today, todayStr, loading, error, refetch };
}
