'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { type FloorNumber, type Room, type TenantBar } from '@/app/lib/mock-data';
import { fetchAllContractsForCalendar, type DbContract } from '@/app/lib/supabase-data';
import { useEffectiveRooms } from '@/app/context/useEffectiveRooms';
import RoomListModal, { type RoomModalType } from '@/app/components/RoomListModal';
import RoomDetailDrawer from '@/app/components/RoomDetailDrawer';
import ContractDetailPanel from '@/app/components/ContractDetailPanel';
import OccupancyTrendChart, { type TrendUnit } from '@/app/components/OccupancyTrendChart';

// ──────────── 상수 ────────────

const FLOORS: FloorNumber[] = [1, 2, 3, 4, 5, 6];

const ROOM_COL_WIDTH = 100;
const ROW_HEIGHT = 34;
const MONTH_H = 56;
const DAY_H = 26;
const FLOOR_ROW_H = 28;
const DAY_WIDTH = 16;

const CURRENT_BAR  = { from: '#6366f1', to: '#4f46e5', dot: '#a5b4fc' };
const PAST_BAR     = { from: '#6366f1', to: '#4f46e5', dot: '#a5b4fc' };
const FUTURE_BAR   = { from: '#f59e0b', to: '#d97706', dot: '#fbbf24' };

const FLOOR_ACCENTS = ['#818cf8', '#c084fc', '#60a5fa', '#22d3ee', '#2dd4bf', '#4ade80'];

// ──────────── 헬퍼 ────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

type MonthInfo = { year: number; month: number; days: number; startDay: number };

function buildAllMonths(startYear: number, endYear: number): MonthInfo[] {
  const months: MonthInfo[] = [];
  let startDay = 0;
  for (let y = startYear; y <= endYear; y++) {
    for (let m = 1; m <= 12; m++) {
      const days = getDaysInMonth(y, m);
      months.push({ year: y, month: m, days, startDay });
      startDay += days;
    }
  }
  return months;
}

type YearGroup = { year: number; startDay: number; totalDays: number };
function buildYearGroups(startYear: number, endYear: number, allMonths: MonthInfo[]): YearGroup[] {
  const groups: YearGroup[] = [];
  for (let y = startYear; y <= endYear; y++) {
    const months = allMonths.filter((m) => m.year === y);
    groups.push({
      year: y,
      startDay: months[0].startDay,
      totalDays: months.reduce((s, m) => s + m.days, 0),
    });
  }
  return groups;
}

function getBarGeometry(
  moveInDate: string | null,
  moveOutDate: string | null,
  timelineStart: Date,
  timelineEnd: Date,
  dayWidth: number = DAY_WIDTH,
) {
  if (!moveInDate || !moveOutDate) return null;

  const moveIn = new Date(moveInDate);
  const moveOut = new Date(moveOutDate);

  if (moveOut < timelineStart || moveIn > timelineEnd) return null;

  const clampedStart = moveIn < timelineStart ? timelineStart : moveIn;
  const clampedEnd = moveOut > timelineEnd ? timelineEnd : moveOut;

  const startIdx = Math.round((clampedStart.getTime() - timelineStart.getTime()) / 86400000);
  const endIdx = Math.round((clampedEnd.getTime() - timelineStart.getTime()) / 86400000);

  return {
    left: startIdx * dayWidth,
    width: Math.max((endIdx - startIdx + 1) * dayWidth, dayWidth),
  };
}

function getTodayOffset(today: Date, timelineStart: Date, timelineEnd: Date): number | null {
  if (today < timelineStart || today > timelineEnd) return null;
  return Math.round((today.getTime() - timelineStart.getTime()) / 86400000);
}

function fmtRent(rent: string | number | null | undefined): string | null {
  if (rent == null) return null;
  const num = typeof rent === 'number' ? rent : parseInt(rent.replace(/[₩,\s]/g, ''), 10);
  if (isNaN(num) || num === 0) return null;
  return `${Math.round(num / 10000)}만`;
}

function contractToTenantBar(c: DbContract): TenantBar {
  return {
    contractId: c.id,
    name: c.name,
    moveInDate: c.actual_move_in_date ?? "",
    moveOutDate: c.actual_move_out_date ?? c.contract_start_end ?? c.contract_start_date,
    gender: c.gender ?? undefined,
    birth_date: c.birth_date ?? undefined,
    monthlyRent: c.monthly_rent ?? undefined,
    phone: c.phone,
    purpose: c.purpose ?? undefined,
    realEstateAgency: c.real_estate_agency ?? undefined,
    depositTotal: c.deposit_total ?? undefined,
    depositReturned: c.deposit_returned,
    depositReturnedAt: c.deposit_returned_at,
  };
}

// ──────────── CalendarGrid ────────────

type CalendarGridProps = {
  visibleFloors: FloorNumber[];
  onSelectRoom: (room: Room) => void;
  onSelectPastTenant: (contractId: string) => void;
  effectiveRooms: Room[];
  allMonths: MonthInfo[];
  yearGroups: YearGroup[];
  timelineStart: Date;
  timelineEnd: Date;
  totalDays: number;
  today: Date;
  pastTenantsMap: Record<string, TenantBar[]>;
  futureTenantsMap: Record<string, TenantBar[]>;
  dayWidth: number;
  unit: TrendUnit;
  hideFloorSeparator?: boolean;
};

function CalendarGrid({
  visibleFloors, onSelectRoom, onSelectPastTenant, effectiveRooms,
  allMonths, yearGroups, timelineStart, timelineEnd,
  totalDays, today, pastTenantsMap, futureTenantsMap, dayWidth, unit,
  hideFloorSeparator = false,
}: CalendarGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayOffset = useMemo(() => getTodayOffset(today, timelineStart, timelineEnd), [today, timelineStart, timelineEnd]);
  const totalWidth = totalDays * dayWidth;
  // 단위에 따라 헤더/격자 굵기 조절
  const showDayHeader = unit === 'day' || unit === 'week';   // 일별 칸·격자
  const showDayNumbers = unit === 'day';                     // 날짜 숫자
  const showMonthLabel = unit !== 'year';                    // N월 텍스트
  const HEADER_H = MONTH_H + (showDayHeader ? DAY_H : 0);

  useEffect(() => {
    if (scrollRef.current && todayOffset !== null) {
      const el = scrollRef.current;
      const centerX = todayOffset * dayWidth - el.clientWidth / 2;
      el.scrollLeft = Math.max(0, centerX);
    }
  }, [todayOffset]);

  return (
    <div className="rounded-2xl border border-[#222222] overflow-hidden shadow-2xl">
      <div ref={scrollRef} className="overflow-x-auto overflow-y-visible">
        <div style={{ width: ROOM_COL_WIDTH + totalWidth, minWidth: 'max-content' }}>

          {/* ── Month header ── */}
          <div
            className="flex sticky top-0 z-20 border-b border-[#222222]"
            style={{ height: MONTH_H, background: 'linear-gradient(180deg,#161616 0%,#111111 100%)' }}
          >
            <div
              className="sticky left-0 z-30 flex items-center justify-center text-xs font-semibold text-gray-400 tracking-wider uppercase border-r border-[#222222]"
              style={{ width: ROOM_COL_WIDTH, minWidth: ROOM_COL_WIDTH, background: 'linear-gradient(180deg,#161616 0%,#111111 100%)' }}
            >
              호수
            </div>
            {unit === 'year'
              ? yearGroups.map((yg) => (
                  <div
                    key={yg.year}
                    className="relative flex items-center justify-center border-r border-[#444]"
                    style={{ width: yg.totalDays * dayWidth, minWidth: yg.totalDays * dayWidth }}
                  >
                    <span className="text-base font-bold text-indigo-300 leading-none">{yg.year}</span>
                  </div>
                ))
              : allMonths.map((m, i) => (
                  <div
                    key={i}
                    className="relative flex flex-col items-center justify-center gap-0.5 border-r border-[#222222] overflow-hidden"
                    style={{ width: m.days * dayWidth, minWidth: m.days * dayWidth, borderRightColor: m.month === 12 ? '#444' : '#222' }}
                  >
                    {(showMonthLabel && m.month === 1) || dayWidth >= 5
                      ? <span className="text-[11px] font-semibold text-indigo-400 leading-none">{m.year}</span>
                      : null}
                    {showMonthLabel && (
                      <span className="text-sm font-bold text-gray-200 leading-none whitespace-nowrap">{m.month}월</span>
                    )}
                  </div>
                ))}
          </div>

          {/* ── Day header (일·주 단위에서만) ── */}
          {showDayHeader && (
          <div
            className="flex sticky z-20 border-b border-[#222222]"
            style={{ top: MONTH_H, height: DAY_H, backgroundColor: '#0D0D0D' }}
          >
            <div
              className="sticky left-0 z-30 border-r border-[#222222]"
              style={{ width: ROOM_COL_WIDTH, minWidth: ROOM_COL_WIDTH, backgroundColor: '#0D0D0D' }}
            />
            {allMonths.map((m, mi) =>
              Array.from({ length: m.days }, (_, d) => {
                const day = d + 1;
                const isLastOfMonth = day === m.days;
                const dayIdx = m.startDay + d;
                const isToday = todayOffset === dayIdx;
                const isFirst = day === 1;
                // 주 단위에선 날짜 숫자를 7일마다만 표시 (빽빽함 방지)
                const showNum = showDayNumbers || d % 7 === 0;

                return (
                  <div
                    key={`${mi}-${day}`}
                    className="relative flex items-center justify-center shrink-0"
                    style={{
                      width: dayWidth,
                      borderRight: `1px solid ${isLastOfMonth ? (m.month === 12 ? '#444' : '#333') : '#1e1e1e'}`,
                      backgroundColor: isToday ? 'rgba(239,68,68,0.12)' : undefined,
                    }}
                  >
                    {showNum && (
                      <span style={{ fontSize: 8, color: isFirst ? '#e5e7eb' : isToday ? '#fca5a5' : '#555' }}>
                        {day}
                      </span>
                    )}
                    {isToday && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px] h-1.5 rounded-t-full bg-rose-500" />
                    )}
                  </div>
                );
              })
            )}
          </div>
          )}

          {/* ── Rows by floor ── */}
          {visibleFloors.map((floor) => {
            const fi = FLOORS.indexOf(floor);
            const accent = FLOOR_ACCENTS[fi];

            return (
              <div key={floor}>
                {!hideFloorSeparator && (
                <div
                  className="flex items-center sticky z-10 border-b border-[#222222]"
                  style={{ height: FLOOR_ROW_H, backgroundColor: '#0F0F0F', top: HEADER_H }}
                >
                  <div
                    className="sticky left-0 z-20 flex items-center gap-2 px-3 border-r border-[#222222]"
                    style={{ width: ROOM_COL_WIDTH, minWidth: ROOM_COL_WIDTH, backgroundColor: '#0F0F0F' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                    <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: accent }}>
                      {floor}F
                    </span>
                  </div>
                  <div className="relative" style={{ width: totalWidth }}>
                    {yearGroups.slice(0, -1).map((yg) => (
                      <div
                        key={yg.year}
                        className="absolute top-0 bottom-0"
                        style={{ left: (yg.startDay + yg.totalDays) * dayWidth, width: 1, backgroundColor: '#444' }}
                      />
                    ))}
                    {todayOffset !== null && (
                      <div
                        className="absolute top-0 bottom-0"
                        style={{ left: todayOffset * dayWidth, width: dayWidth, backgroundColor: 'rgba(239,68,68,0.08)' }}
                      />
                    )}
                  </div>
                </div>
                )}

                {/* Room rows */}
                {effectiveRooms.filter((r) => r.floor === floor).map((room, ri) => {
                  const effectiveMoveOut = room.moveOutDate ?? timelineEnd.toISOString().slice(0, 10);
                  const bar = getBarGeometry(room.moveInDate, effectiveMoveOut, timelineStart, timelineEnd, dayWidth);
                  const isEven = ri % 2 === 0;
                  const rentLabel = fmtRent(room.monthlyRent);
                  const pastTenants: TenantBar[] = pastTenantsMap[room.id] ?? [];
                  const futureTenants: TenantBar[] = futureTenantsMap[room.id] ?? [];

                  return (
                    <div
                      key={room.id}
                      className="flex group transition-colors"
                      style={{ height: ROW_HEIGHT, backgroundColor: isEven ? '#0C0C0C' : '#0A0A0A' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#161616'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = isEven ? '#0C0C0C' : '#0A0A0A'; }}
                    >
                      {/* Room label */}
                      <div
                        className="sticky left-0 z-10 flex items-center gap-1.5 px-3 border-r border-[#222222] overflow-hidden"
                        style={{
                          width: ROOM_COL_WIDTH,
                          minWidth: ROOM_COL_WIDTH,
                          backgroundColor: 'inherit',
                          borderLeft: `2px solid ${CURRENT_BAR.from}44`,
                        }}
                      >
                        <span className="text-[14px] font-semibold text-gray-200 whitespace-nowrap">{room.id}호</span>
                        {room.status === 'vacant' && (
                          <span className="text-[10px] font-semibold px-1 py-0.5 rounded bg-[#1A1A1A] text-gray-400 whitespace-nowrap shrink-0">공실</span>
                        )}
                        {room.status === 'contract' && (
                          <span className="text-[10px] font-semibold px-1 py-0.5 rounded bg-[#1A1A1A] text-yellow-600 whitespace-nowrap shrink-0">계약</span>
                        )}
                      </div>

                      {/* Timeline area */}
                      <div
                        className="relative flex-none"
                        style={{
                          width: totalWidth,
                          // 일 단위에서만 하루 격자, 그 외엔 격자 없음
                          backgroundImage: showDayNumbers
                            ? `repeating-linear-gradient(90deg, transparent, transparent ${dayWidth - 1}px, #1a1a1a ${dayWidth - 1}px, #1a1a1a ${dayWidth}px)`
                            : undefined,
                        }}
                      >
                        {/* 구분선: 월 이하 단위면 월 구분선, 년 단위면 연 구분선만 */}
                        {unit === 'year'
                          ? yearGroups.slice(0, -1).map((yg) => (
                              <div
                                key={yg.year}
                                className="absolute top-0 bottom-0"
                                style={{ left: (yg.startDay + yg.totalDays) * dayWidth, width: 1, backgroundColor: '#444' }}
                              />
                            ))
                          : allMonths.slice(0, -1).map((m, i) => (
                              <div
                                key={i}
                                className="absolute top-0 bottom-0"
                                style={{
                                  left: (m.startDay + m.days) * dayWidth,
                                  width: 1,
                                  backgroundColor: m.month === 12 ? '#444' : '#2a2a2a',
                                }}
                              />
                            ))}

                        {/* 오늘 컬럼 */}
                        {todayOffset !== null && (
                          <div
                            className="absolute top-0 bottom-0 z-[5] pointer-events-none"
                            style={{ left: todayOffset * dayWidth, width: dayWidth, backgroundColor: 'rgba(239,68,68,0.08)' }}
                          />
                        )}

                        {/* 과거 입실자 바 */}
                        {pastTenants.map((pt, pti) => {
                          const ptBar = getBarGeometry(pt.moveInDate, pt.moveOutDate, timelineStart, timelineEnd, dayWidth);
                          if (!ptBar) return null;
                          const ptRent = fmtRent(pt.monthlyRent ?? null);
                          const c = PAST_BAR;
                          const hasDetail = !!pt.contractId;
                          return (
                            <div
                              key={`past-${pti}`}
                              onClick={hasDetail ? (e) => { e.stopPropagation(); onSelectPastTenant(pt.contractId!); } : undefined}
                              className={`absolute flex items-center overflow-hidden z-10 select-none ${hasDetail ? 'cursor-pointer' : 'cursor-default'}`}
                              style={{
                                top: 6, bottom: 6,
                                left: ptBar.left + 2,
                                width: ptBar.width - 4,
                                borderRadius: 6,
                                background: `linear-gradient(90deg, ${c.from}44 0%, ${c.to}44 100%)`,
                                border: `1px solid ${c.from}55`,
                              }}
                              title={`[과거] ${pt.name}${pt.birth_date ? ` (${new Date().getFullYear() - parseInt(pt.birth_date.slice(0, 4), 10)}세)` : ''} · ${pt.moveInDate} ~ ${pt.moveOutDate}${hasDetail ? ' · 클릭하여 상세 보기' : ''}`}
                            >
                              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md" style={{ backgroundColor: c.dot, opacity: 0.3 }} />
                              <div className="flex items-center gap-1.5 pl-3 pr-2 overflow-hidden">
                                <div
                                  className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                                  style={{ backgroundColor: `${c.dot}20`, color: c.dot, border: `1px solid ${c.dot}40` }}
                                >
                                  {pt.name[0]}
                                </div>
                                <span className="whitespace-nowrap text-[12px] font-semibold text-white opacity-60">{pt.name}</span>
                                {ptRent && ptBar.width > 80 && (
                                  <span className="whitespace-nowrap text-[11px] text-white opacity-40">{ptRent}</span>
                                )}
                                {ptBar.width > 220 && (
                                  <span className="whitespace-nowrap text-[11px] text-white opacity-30">· {pt.moveInDate} ~ {pt.moveOutDate}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* 예정 입실자 바 */}
                        {futureTenants.map((ft, fti) => {
                          const ftBar = getBarGeometry(ft.moveInDate, ft.moveOutDate, timelineStart, timelineEnd, dayWidth);
                          if (!ftBar) return null;
                          const ftRent = fmtRent(ft.monthlyRent ?? null);
                          const fc = FUTURE_BAR;
                          return (
                            <div
                              key={`future-${fti}`}
                              className="absolute flex items-center overflow-hidden z-10 cursor-default select-none"
                              style={{
                                top: 6, bottom: 6,
                                left: ftBar.left + 2,
                                width: ftBar.width - 4,
                                borderRadius: 6,
                                background: `linear-gradient(90deg, ${fc.from}55 0%, ${fc.to}55 100%)`,
                                border: `1px dashed ${fc.from}88`,
                              }}
                              title={`[예정] ${ft.name}${ft.birth_date ? ` (${new Date().getFullYear() - parseInt(ft.birth_date.slice(0, 4), 10)}세)` : ''} · ${ft.moveInDate} ~ ${ft.moveOutDate}`}
                            >
                              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md" style={{ backgroundColor: fc.dot, opacity: 0.5 }} />
                              <div className="flex items-center gap-1.5 pl-3 pr-2 overflow-hidden">
                                <div
                                  className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                                  style={{ backgroundColor: `${fc.dot}30`, color: fc.dot, border: `1px solid ${fc.dot}60` }}
                                >
                                  {ft.name[0]}
                                </div>
                                <span className="whitespace-nowrap text-[12px] font-semibold" style={{ color: fc.dot }}>{ft.name}</span>
                                {ftRent && ftBar.width > 80 && (
                                  <span className="whitespace-nowrap text-[11px]" style={{ color: fc.dot, opacity: 0.7 }}>{ftRent}</span>
                                )}
                                {ftBar.width > 220 && (
                                  <span className="whitespace-nowrap text-[11px]" style={{ color: fc.dot, opacity: 0.5 }}>· {ft.moveInDate} ~ {ft.moveOutDate}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* 현재 입실 바 */}
                        {bar && room.status === 'occupied' && (
                          <div
                            onClick={() => onSelectRoom(room)}
                            className="absolute flex items-center overflow-hidden z-20 cursor-pointer select-none"
                            style={{
                              top: 6,
                              bottom: 6,
                              left: bar.left + 2,
                              width: bar.width - 4,
                              borderRadius: 6,
                              background: `linear-gradient(90deg, ${CURRENT_BAR.from}bb 0%, ${CURRENT_BAR.to}bb 100%)`,
                              boxShadow: `0 1px 8px ${CURRENT_BAR.from}44`,
                            }}
                            title={`${room.resident}${room.birth_date ? ` (${new Date().getFullYear() - parseInt(room.birth_date.slice(0, 4), 10)}세)` : ''} · ${room.monthlyRent} · ${room.moveInDate} ~ ${room.moveOutDate}`}
                          >
                            <div
                              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md"
                              style={{ backgroundColor: CURRENT_BAR.dot, opacity: 0.8 }}
                            />
                            <div className="flex items-center gap-1.5 pl-3 pr-2 overflow-hidden">
                              <div
                                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                                style={{ backgroundColor: `${CURRENT_BAR.dot}40`, color: CURRENT_BAR.dot, border: `1px solid ${CURRENT_BAR.dot}80` }}
                              >
                                {room.resident?.[0]}
                              </div>
                              <span className="whitespace-nowrap text-[13px] font-bold tracking-tight text-white">
                                {room.resident}
                              </span>
                              {rentLabel && bar.width > 80 && (
                                <span
                                  className="whitespace-nowrap text-[12px] font-bold px-1.5 py-0.5 rounded"
                                  style={{
                                    backgroundColor: `${CURRENT_BAR.dot}30`,
                                    color: CURRENT_BAR.dot,
                                    border: `1px solid ${CURRENT_BAR.dot}50`,
                                  }}
                                >
                                  {rentLabel}
                                </span>
                              )}
                              {room.moveInDate && room.moveOutDate && bar.width > 220 && (
                                <span className="whitespace-nowrap text-[12px] font-bold text-white opacity-90">
                                  · {room.moveInDate} ~ {room.moveOutDate}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ──────────── Page ────────────

export default function CalendarPage() {
  const { effectiveRooms, today, todayStr } = useEffectiveRooms();

  const [allContracts, setAllContracts] = useState<DbContract[]>([]);
  const [pastTenantsMap, setPastTenantsMap] = useState<Record<string, TenantBar[]>>({});
  const [futureTenantsMap, setFutureTenantsMap] = useState<Record<string, TenantBar[]>>({});

  // 타임라인 연도 범위: effectiveRooms + 모든 계약 날짜 포함
  const { startYear: TIMELINE_START_YEAR, endYear: TIMELINE_END_YEAR } = useMemo(() => {
    const currentYear = parseInt(todayStr.slice(0, 4), 10);
    let minYear = currentYear;
    let maxYear = currentYear;

    for (const room of effectiveRooms) {
      if (room.moveInDate) {
        const y = parseInt(room.moveInDate.slice(0, 4), 10);
        if (y < minYear) minYear = y;
      }
      if (room.moveOutDate) {
        const y = parseInt(room.moveOutDate.slice(0, 4), 10);
        if (y > maxYear) maxYear = y;
      }
    }
    for (const c of allContracts) {
      const start = c.actual_move_in_date;
      const end = c.actual_move_out_date;
      if (start) {
        const y = parseInt(start.slice(0, 4), 10);
        if (y < minYear) minYear = y;
      }
      if (end) {
        const y = parseInt(end.slice(0, 4), 10);
        if (y > maxYear) maxYear = y;
      }
    }
    return { startYear: minYear, endYear: maxYear };
  }, [effectiveRooms, allContracts, todayStr]);

  const allMonths = useMemo(() => buildAllMonths(TIMELINE_START_YEAR, TIMELINE_END_YEAR), [TIMELINE_START_YEAR, TIMELINE_END_YEAR]);
  const timelineStart = useMemo(() => new Date(TIMELINE_START_YEAR, 0, 1), [TIMELINE_START_YEAR]);
  const timelineEnd = useMemo(() => new Date(TIMELINE_END_YEAR, 11, 31), [TIMELINE_END_YEAR]);
  const totalDays = useMemo(() => allMonths.reduce((s, m) => s + m.days, 0), [allMonths]);
  const yearGroups = useMemo(() => buildYearGroups(TIMELINE_START_YEAR, TIMELINE_END_YEAR, allMonths), [TIMELINE_START_YEAR, TIMELINE_END_YEAR, allMonths]);

  const [activeModal, setActiveModal] = useState<RoomModalType>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [detailContract, setDetailContract] = useState<DbContract | null>(null);

  // 뷰: 입실 추이(라인) / 간트(막대)
  const [view, setView] = useState<'trend' | 'gantt'>('trend');
  const [trendUnit, setTrendUnit] = useState<TrendUnit>('month');
  // 간트 확대: 하루당 픽셀(dayWidth)이 기준, 단위는 폭에서 파생 (헤더/격자 굵기)
  const [dayWidth, setDayWidth] = useState(8);
  const ganttUnit: TrendUnit = dayWidth >= 16 ? 'day' : dayWidth >= 6 ? 'week' : dayWidth >= 2.5 ? 'month' : 'year';
  const UNIT_WIDTH: Record<TrendUnit, number> = { day: 24, week: 8, month: 3.5, year: 1.1 };

  // contractId로 DbContract 빠른 조회
  const contractsById = useMemo(() => {
    const map = new Map<string, DbContract>();
    for (const c of allContracts) map.set(c.id, c);
    return map;
  }, [allContracts]);

  function handleSelectPastTenant(contractId: string) {
    const contract = contractsById.get(contractId);
    if (contract) setDetailContract(contract);
  }

  // 모든 계약 조회 후 과거/예정으로 분류
  useEffect(() => {
    fetchAllContractsForCalendar().then((contracts) => {
      setAllContracts(contracts);

      const pastMap: Record<string, TenantBar[]> = {};
      const futureMap: Record<string, TenantBar[]> = {};

      for (const c of contracts) {
        const moveIn = c.actual_move_in_date;
        const moveOut = c.actual_move_out_date;

        if (!moveIn) continue;

        const tenant = contractToTenantBar(c);

        if (moveOut && moveOut < todayStr) {
          // 과거: 퇴실일이 오늘 이전
          pastMap[c.room_id] = [...(pastMap[c.room_id] ?? []), tenant];
        } else if (moveIn > todayStr) {
          // 예정: 입실일이 오늘 이후
          futureMap[c.room_id] = [...(futureMap[c.room_id] ?? []), tenant];
        }
        // 현재 (moveIn <= today <= moveOut): effectiveRooms 바가 담당
      }

      setPastTenantsMap(pastMap);
      setFutureTenantsMap(futureMap);
    }).catch(console.error);
  }, [todayStr]);

  const modalRooms = activeModal ? effectiveRooms.filter((r) => r.status === activeModal) : [];
  // 층 선택: 전체 또는 특정 층만
  const [floorFilter, setFloorFilter] = useState<'all' | FloorNumber>('all');
  const visibleFloors = floorFilter === 'all' ? FLOORS : [floorFilter];

  // 마우스 휠로 확대/축소 (위=확대, 아래=축소). shift+휠은 가로 스크롤 유지
  const ganttWrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ganttWrapRef.current;
    if (!el || view !== 'gantt') return;
    const onWheel = (e: WheelEvent) => {
      if (e.shiftKey || e.ctrlKey || e.metaKey) return; // 가로 스크롤/브라우저 확대는 그대로
      if (Math.abs(e.deltaY) < 1) return;
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      setDayWidth((w) => Math.min(36, Math.max(0.6, w * factor)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [view]);

  return (
    <main className="w-full space-y-5">
      {/* 뷰 전환 + 단위/줌 컨트롤 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] p-1">
          {([['trend', '입실 추이'], ['gantt', '입실 현황']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                view === key ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {view === 'trend' ? (
          <div className="flex items-center gap-1 rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] p-1">
            {([['day', '일'], ['week', '주'], ['month', '월'], ['year', '년']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTrendUnit(key)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  trendUnit === key ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-gray-500 sm:inline">휠로 확대·축소</span>
            <div className="flex items-center gap-1 rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] p-1">
              {([['day', '일'], ['week', '주'], ['month', '월'], ['year', '년']] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setDayWidth(UNIT_WIDTH[key])}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    ganttUnit === key ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {view === 'trend' && (
        <OccupancyTrendChart
          contracts={allContracts}
          totalRooms={effectiveRooms.length}
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          unit={trendUnit}
          today={today}
        />
      )}

      {/* Floor filter + 범례 (간트 뷰에서만) */}
      {view === 'gantt' && (
      <div className="flex flex-wrap items-center gap-2">
        {/* 층 선택 */}
        <div className="flex items-center gap-1 rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] p-1">
          <button
            onClick={() => setFloorFilter('all')}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
              floorFilter === 'all' ? 'bg-white text-black' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            전체
          </button>
          {FLOORS.map((floor, fi) => {
            const accent = FLOOR_ACCENTS[fi];
            const active = floorFilter === floor;
            return (
              <button
                key={floor}
                onClick={() => setFloorFilter(floor)}
                className="rounded-md px-3 py-1 text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: active ? `${accent}26` : 'transparent',
                  color: active ? accent : '#6b7280',
                }}
              >
                {floor}층
              </button>
            );
          })}
        </div>

        <div className="w-px h-5 bg-[#2A2A2A]" />

        {/* 범례 */}
        <div className="flex items-center gap-4 ml-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: `linear-gradient(90deg, ${PAST_BAR.from}44, ${PAST_BAR.to}44)`, border: `1px solid ${PAST_BAR.from}55` }} />
            <span className="text-xs text-gray-500">과거</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: `linear-gradient(90deg, ${CURRENT_BAR.from}bb, ${CURRENT_BAR.to}bb)` }} />
            <span className="text-xs text-gray-500">현재</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: `linear-gradient(90deg, ${FUTURE_BAR.from}55, ${FUTURE_BAR.to}55)`, border: `1px dashed ${FUTURE_BAR.from}88` }} />
            <span className="text-xs text-gray-500">예정</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-0.5 h-4 rounded-full bg-rose-500" />
            <span className="text-xs text-gray-500">오늘</span>
          </div>
        </div>
      </div>
      )}

      {/* 타임라인 (간트) — 층별 섹션 */}
      {view === 'gantt' && (
        <div ref={ganttWrapRef} className="space-y-6">
          {visibleFloors.map((floor, fi) => {
            const accent = FLOOR_ACCENTS[FLOORS.indexOf(floor)];
            return (
              <section key={floor} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: accent }} />
                  <h3 className="text-sm font-bold tracking-wide" style={{ color: accent }}>{floor}층</h3>
                  <span className="text-xs text-gray-600">
                    {effectiveRooms.filter((r) => r.floor === floor).length}개 방
                  </span>
                </div>
                <CalendarGrid
                  visibleFloors={[floor]}
                  onSelectRoom={setSelectedRoom}
                  onSelectPastTenant={handleSelectPastTenant}
                  effectiveRooms={effectiveRooms}
                  allMonths={allMonths}
                  yearGroups={yearGroups}
                  timelineStart={timelineStart}
                  timelineEnd={timelineEnd}
                  totalDays={totalDays}
                  today={today}
                  pastTenantsMap={pastTenantsMap}
                  futureTenantsMap={futureTenantsMap}
                  dayWidth={dayWidth}
                  unit={ganttUnit}
                  hideFloorSeparator
                />
              </section>
            );
          })}
        </div>
      )}

      <RoomListModal
        type={activeModal}
        rooms={modalRooms}
        onClose={() => setActiveModal(null)}
      />

      <RoomDetailDrawer
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
      />

      {detailContract && (
        <ContractDetailPanel
          contract={detailContract}
          onClose={() => setDetailContract(null)}
        />
      )}
    </main>
  );
}
