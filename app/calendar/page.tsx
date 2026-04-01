'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ROOMS_BY_FLOOR, ALL_ROOMS, ROOM_TENANT_HISTORY, FloorNumber, getDashboardStats, type Room, type TenantBar } from '../lib/mock-data';
import RoomListModal, { type RoomModalType } from '../components/RoomListModal';
import RoomDetailDrawer from '../components/RoomDetailDrawer';

// ──────────── 상수 ────────────

const FLOORS: FloorNumber[] = [1, 2, 3, 4, 5, 6];

// 실제 데이터 기반으로 연도 범위 자동 계산
function calcYearRange() {
  let minYear = 9999;
  let maxYear = 0;
  for (const room of ALL_ROOMS) {
    if (room.moveInDate) {
      const y = parseInt(room.moveInDate.slice(0, 4), 10);
      if (y < minYear) minYear = y;
    }
    if (room.moveOutDate) {
      const y = parseInt(room.moveOutDate.slice(0, 4), 10);
      if (y > maxYear) maxYear = y;
    }
  }
  // 데이터가 없을 경우 fallback
  if (minYear === 9999) minYear = new Date().getFullYear();
  if (maxYear === 0) maxYear = minYear;
  return { startYear: minYear, endYear: maxYear };
}

const { startYear: TIMELINE_START_YEAR, endYear: TIMELINE_END_YEAR } = calcYearRange();

const ROOM_COL_WIDTH = 100;
const ROW_HEIGHT = 46;
const MONTH_H = 56;
const DAY_H = 26;
const FLOOR_ROW_H = 28;
const DAY_WIDTH = 16;

// 방별 색상 팔레트 (12색 순환)
const PALETTE = [
  { from: '#6366f1', to: '#4f46e5', dot: '#a5b4fc' },
  { from: '#ec4899', to: '#db2777', dot: '#f9a8d4' },
  { from: '#14b8a6', to: '#0d9488', dot: '#5eead4' },
  { from: '#f59e0b', to: '#d97706', dot: '#fcd34d' },
  { from: '#22c55e', to: '#16a34a', dot: '#86efac' },
  { from: '#3b82f6', to: '#2563eb', dot: '#93c5fd' },
  { from: '#f43f5e', to: '#e11d48', dot: '#fda4af' },
  { from: '#8b5cf6', to: '#7c3aed', dot: '#c4b5fd' },
  { from: '#06b6d4', to: '#0891b2', dot: '#67e8f9' },
  { from: '#84cc16', to: '#65a30d', dot: '#bef264' },
  { from: '#fb923c', to: '#ea580c', dot: '#fdba74' },
  { from: '#a855f7', to: '#9333ea', dot: '#d8b4fe' },
];

const ROOM_COLOR_MAP: Record<string, typeof PALETTE[number]> = {};
ALL_ROOMS.forEach((room, idx) => {
  ROOM_COLOR_MAP[room.id] = PALETTE[idx % PALETTE.length];
});

const FLOOR_ACCENTS = ['#818cf8', '#c084fc', '#60a5fa', '#22d3ee', '#2dd4bf', '#4ade80'];

// ──────────── 헬퍼 ────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

type MonthInfo = { year: number; month: number; days: number; startDay: number };

function buildAllMonths(): MonthInfo[] {
  const months: MonthInfo[] = [];
  let startDay = 0;
  for (let y = TIMELINE_START_YEAR; y <= TIMELINE_END_YEAR; y++) {
    for (let m = 1; m <= 12; m++) {
      const days = getDaysInMonth(y, m);
      months.push({ year: y, month: m, days, startDay });
      startDay += days;
    }
  }
  return months;
}

const ALL_MONTHS = buildAllMonths();
const TIMELINE_START = new Date(TIMELINE_START_YEAR, 0, 1);
const TOTAL_DAYS = ALL_MONTHS.reduce((s, m) => s + m.days, 0);

// 연도 그룹 (년도 헤더용)
type YearGroup = { year: number; startDay: number; totalDays: number };
function buildYearGroups(): YearGroup[] {
  const groups: YearGroup[] = [];
  for (let y = TIMELINE_START_YEAR; y <= TIMELINE_END_YEAR; y++) {
    const months = ALL_MONTHS.filter((m) => m.year === y);
    groups.push({
      year: y,
      startDay: months[0].startDay,
      totalDays: months.reduce((s, m) => s + m.days, 0),
    });
  }
  return groups;
}
const YEAR_GROUPS = buildYearGroups();

function getBarGeometry(moveInDate: string | null, moveOutDate: string | null) {
  if (!moveInDate || !moveOutDate) return null;

  const timelineEnd = new Date(TIMELINE_END_YEAR, 11, 31);
  const moveIn = new Date(moveInDate);
  const moveOut = new Date(moveOutDate);

  if (moveOut < TIMELINE_START || moveIn > timelineEnd) return null;

  const clampedStart = moveIn < TIMELINE_START ? TIMELINE_START : moveIn;
  const clampedEnd = moveOut > timelineEnd ? timelineEnd : moveOut;

  const startIdx = Math.round((clampedStart.getTime() - TIMELINE_START.getTime()) / 86400000);
  const endIdx = Math.round((clampedEnd.getTime() - TIMELINE_START.getTime()) / 86400000);

  return {
    left: startIdx * DAY_WIDTH,
    width: Math.max((endIdx - startIdx + 1) * DAY_WIDTH, DAY_WIDTH),
  };
}

function getTodayOffset(): number | null {
  const now = new Date();
  const timelineEnd = new Date(TIMELINE_END_YEAR, 11, 31);
  if (now < TIMELINE_START || now > timelineEnd) return null;
  return Math.round((now.getTime() - TIMELINE_START.getTime()) / 86400000);
}

function fmtRent(rent: string | null): string | null {
  if (!rent) return null;
  const num = parseInt(rent.replace(/[₩,\s]/g, ''), 10);
  if (isNaN(num) || num === 0) return null;
  return `${Math.round(num / 10000)}만`;
}

// ──────────── CalendarGrid ────────────

function CalendarGrid({ visibleFloors, onSelectRoom }: { visibleFloors: FloorNumber[]; onSelectRoom: (room: Room) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayOffset = useMemo(() => getTodayOffset(), []);
  const totalWidth = TOTAL_DAYS * DAY_WIDTH;
  const HEADER_H = MONTH_H + DAY_H;

  // 오늘 날짜로 초기 스크롤 위치
  useEffect(() => {
    if (scrollRef.current && todayOffset !== null) {
      const el = scrollRef.current;
      const centerX = todayOffset * DAY_WIDTH - el.clientWidth / 2;
      el.scrollLeft = Math.max(0, centerX);
    }
  }, [todayOffset]);

  return (
    <div className="rounded-2xl border border-[#222222] overflow-hidden shadow-2xl">
      <div ref={scrollRef} className="overflow-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <div style={{ width: ROOM_COL_WIDTH + totalWidth, minWidth: 'max-content' }}>

          {/* ── Month header (연도 + 월 같이 표시) ── */}
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
            {ALL_MONTHS.map((m, i) => (
              <div
                key={i}
                className="relative flex flex-col items-center justify-center gap-0.5 border-r border-[#222222]"
                style={{ width: m.days * DAY_WIDTH, minWidth: m.days * DAY_WIDTH, borderRightColor: m.month === 12 ? '#444' : '#222' }}
              >
                <span className="text-sm font-semibold text-indigo-400 leading-none">{m.year}</span>
                <span className="text-base font-bold text-gray-200 leading-none">{m.month}월</span>
              </div>
            ))}
          </div>

          {/* ── Day header ── */}
          <div
            className="flex sticky z-20 border-b border-[#222222]"
            style={{ top: MONTH_H, height: DAY_H, backgroundColor: '#0D0D0D' }}
          >
            <div
              className="sticky left-0 z-30 border-r border-[#222222]"
              style={{ width: ROOM_COL_WIDTH, minWidth: ROOM_COL_WIDTH, backgroundColor: '#0D0D0D' }}
            />
            {ALL_MONTHS.map((m, mi) =>
              Array.from({ length: m.days }, (_, d) => {
                const day = d + 1;
                const isLastOfMonth = day === m.days;
                const dayIdx = m.startDay + d;
                const isToday = todayOffset === dayIdx;
                const isFirst = day === 1;

                return (
                  <div
                    key={`${mi}-${day}`}
                    className="relative flex items-center justify-center shrink-0"
                    style={{
                      width: DAY_WIDTH,
                      borderRight: `1px solid ${isLastOfMonth ? (m.month === 12 ? '#444' : '#333') : '#1e1e1e'}`,
                      backgroundColor: isToday ? 'rgba(239,68,68,0.12)' : undefined,
                    }}
                  >
                    <span style={{ fontSize: 8, color: isFirst ? '#e5e7eb' : isToday ? '#fca5a5' : '#555' }}>
                      {day}
                    </span>
                    {isToday && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px] h-1.5 rounded-t-full bg-rose-500" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* ── Rows by floor ── */}
          {visibleFloors.map((floor) => {
            const fi = FLOORS.indexOf(floor);
            const accent = FLOOR_ACCENTS[fi];

            return (
              <div key={floor}>
                {/* Floor separator */}
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
                    {/* 연도 구분선 */}
                    {YEAR_GROUPS.slice(0, -1).map((yg) => (
                      <div
                        key={yg.year}
                        className="absolute top-0 bottom-0"
                        style={{ left: (yg.startDay + yg.totalDays) * DAY_WIDTH, width: 1, backgroundColor: '#444' }}
                      />
                    ))}
                    {todayOffset !== null && (
                      <div
                        className="absolute top-0 bottom-0"
                        style={{ left: todayOffset * DAY_WIDTH, width: DAY_WIDTH, backgroundColor: 'rgba(239,68,68,0.08)' }}
                      />
                    )}
                  </div>
                </div>

                {/* Room rows */}
                {ROOMS_BY_FLOOR[floor].map((room, ri) => {
                  const bar = getBarGeometry(room.moveInDate, room.moveOutDate);
                  const color = ROOM_COLOR_MAP[room.id] ?? PALETTE[0];
                  const isEven = ri % 2 === 0;
                  const rentLabel = fmtRent(room.monthlyRent);
                  const pastTenants: TenantBar[] = ROOM_TENANT_HISTORY[room.id] ?? [];

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
                          borderLeft: `2px solid ${color.from}44`,
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
                          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent ${DAY_WIDTH - 1}px, #1a1a1a ${DAY_WIDTH - 1}px, #1a1a1a ${DAY_WIDTH}px)`,
                        }}
                      >
                        {/* 월 구분선 */}
                        {ALL_MONTHS.slice(0, -1).map((m, i) => (
                          <div
                            key={i}
                            className="absolute top-0 bottom-0"
                            style={{
                              left: (m.startDay + m.days) * DAY_WIDTH,
                              width: 1,
                              backgroundColor: m.month === 12 ? '#444' : '#2a2a2a',
                            }}
                          />
                        ))}

                        {/* 오늘 컬럼 */}
                        {todayOffset !== null && (
                          <div
                            className="absolute top-0 bottom-0 z-[5] pointer-events-none"
                            style={{ left: todayOffset * DAY_WIDTH, width: DAY_WIDTH, backgroundColor: 'rgba(239,68,68,0.08)' }}
                          />
                        )}

                        {/* 과거 입실자 바 */}
                        {pastTenants.map((pt, pti) => {
                          const ptBar = getBarGeometry(pt.moveInDate, pt.moveOutDate);
                          if (!ptBar) return null;
                          const ptRent = fmtRent(pt.monthlyRent ?? null);
                          return (
                            <div
                              key={pti}
                              className="absolute flex items-center overflow-hidden z-10 cursor-default select-none"
                              style={{
                                top: 6, bottom: 6,
                                left: ptBar.left + 2,
                                width: ptBar.width - 4,
                                borderRadius: 6,
                                background: `linear-gradient(90deg, ${color.from}55 0%, ${color.to}55 100%)`,
                                border: `1px solid ${color.from}66`,
                              }}
                              title={`${pt.name}${pt.age ? ` (${pt.age}세)` : ''} · ${pt.moveInDate} ~ ${pt.moveOutDate}`}
                            >
                              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md" style={{ backgroundColor: color.dot, opacity: 0.4 }} />
                              <div className="flex items-center gap-1.5 pl-3 pr-2 overflow-hidden">
                                <div
                                  className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                                  style={{ backgroundColor: `${color.dot}30`, color: color.dot, border: `1px solid ${color.dot}60` }}
                                >
                                  {pt.name[0]}
                                </div>
                                <span className="whitespace-nowrap text-[12px] font-semibold text-white opacity-70">{pt.name}</span>
                                {ptRent && ptBar.width > 80 && (
                                  <span className="whitespace-nowrap text-[11px] text-white opacity-50">{ptRent}</span>
                                )}
                                {ptBar.width > 220 && (
                                  <span className="whitespace-nowrap text-[11px] text-white opacity-40">· {pt.moveInDate} ~ {pt.moveOutDate}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* 현재 입실 바 */}
                        {bar && (
                          <div
                            onClick={() => onSelectRoom(room)}
                            className="absolute flex items-center overflow-hidden z-10 cursor-pointer select-none"
                            style={{
                              top: 6,
                              bottom: 6,
                              left: bar.left + 2,
                              width: bar.width - 4,
                              borderRadius: 6,
                              background: `linear-gradient(90deg, ${color.from}99 0%, ${color.to}99 100%)`,
                              boxShadow: `0 1px 8px ${color.from}33`,
                            }}
                            title={`${room.resident} (${room.age}세) · ${room.monthlyRent} · ${room.moveInDate} ~ ${room.moveOutDate}`}
                          >
                            <div
                              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md"
                              style={{ backgroundColor: color.dot, opacity: 0.6 }}
                            />
                            <div className="flex items-center gap-1.5 pl-3 pr-2 overflow-hidden">
                              <div
                                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                                style={{ backgroundColor: `${color.dot}40`, color: color.dot, border: `1px solid ${color.dot}80` }}
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
                                    backgroundColor: `${color.dot}30`,
                                    color: color.dot,
                                    border: `1px solid ${color.dot}50`,
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
  const stats = getDashboardStats();
  const [selectedFloors, setSelectedFloors] = useState<Set<FloorNumber>>(new Set(FLOORS));
  const [activeModal, setActiveModal] = useState<RoomModalType>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const modalRooms = activeModal ? ALL_ROOMS.filter((r) => r.status === activeModal) : [];
  const visibleFloors = FLOORS.filter((f) => selectedFloors.has(f));

  function toggleFloor(floor: FloorNumber) {
    setSelectedFloors((prev) => {
      const next = new Set(prev);
      if (next.has(floor)) {
        if (next.size === 1) return prev;
        next.delete(floor);
      } else {
        next.add(floor);
      }
      return next;
    });
  }

  function toggleAll() {
    setSelectedFloors(
      selectedFloors.size === FLOORS.length ? new Set([FLOORS[0]]) : new Set(FLOORS)
    );
  }

  return (
    <main className="w-full space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">연간 캘린더</h1>
        <p className="mt-1 text-sm text-gray-500">
          {TIMELINE_START_YEAR}~{TIMELINE_END_YEAR}년 입실 현황 · 오늘 날짜 기준으로 자동 스크롤됩니다.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: null,                        title: "총 방 개수",   value: `${stats.totalRooms}개`,    subtitle: "전체 관리 방" },
          { key: "occupied" as RoomModalType, title: "총 입실자 수", value: `${stats.occupiedRooms}명`, subtitle: `${stats.occupancyRate}% 입실률` },
          { key: "vacant"   as RoomModalType, title: "현재 공실",   value: `${stats.vacantRooms}개`,   subtitle: "즉시 입실 가능" },
          { key: "contract" as RoomModalType, title: "계약",        value: `${stats.contractRooms}개`, subtitle: "계약 진행 방" },
        ].map((stat, idx) => (
          <div
            key={idx}
            onClick={() => stat.key && setActiveModal(stat.key)}
            className={`rounded-xl border border-[#2A2A2A] bg-[#111] p-6 shadow-sm transition-colors ${
              stat.key ? "cursor-pointer hover:border-[#3A3A3A] hover:bg-[#161616]" : ""
            }`}
          >
            <h3 className="text-sm font-medium text-gray-400">{stat.title}</h3>
            <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
            <p className="mt-1 text-sm text-gray-500">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Floor filter */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={toggleAll}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
            selectedFloors.size === FLOORS.length
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-gray-400 border-[#2A2A2A] hover:border-gray-500 hover:text-white'
          }`}
        >
          전체
        </button>

        <div className="w-px h-5 bg-[#2A2A2A]" />

        {FLOORS.map((floor, fi) => {
          const accent = FLOOR_ACCENTS[fi];
          const active = selectedFloors.has(floor);
          return (
            <button
              key={floor}
              onClick={() => toggleFloor(floor)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all"
              style={{
                backgroundColor: active ? `${accent}22` : 'transparent',
                borderColor: active ? accent : '#2A2A2A',
                color: active ? accent : '#9ca3af',
              }}
            >
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: active ? accent : '#2A2A2A' }} />
              {floor}층
            </button>
          );
        })}

        <div className="w-px h-5 bg-[#2A2A2A]" />
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-0.5 h-4 rounded-full bg-rose-500" />
          <span className="text-sm text-gray-400 font-medium">오늘</span>
        </div>
      </div>

      {/* 타임라인 */}
      <CalendarGrid visibleFloors={visibleFloors} onSelectRoom={setSelectedRoom} />

      <RoomListModal
        type={activeModal}
        rooms={modalRooms}
        onClose={() => setActiveModal(null)}
      />

      <RoomDetailDrawer
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
      />
    </main>
  );
}
