'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ROOMS_BY_FLOOR, FloorNumber } from '../lib/mock-data';

const FLOORS: FloorNumber[] = [1, 2, 3, 4, 5, 6];
const ROOM_COL_WIDTH = 100;
const DAY_WIDTH = 28;
const ROW_HEIGHT = 46;
const MONTH_H = 38;
const DAY_H = 30;
const FLOOR_ROW_H = 28;

const FLOOR_COLORS = [
  { from: '#4f46e5', to: '#3730a3', text: '#ffffff', accent: '#818cf8', dot: '#a5b4fc' },
  { from: '#9333ea', to: '#7e22ce', text: '#ffffff', accent: '#c084fc', dot: '#d8b4fe' },
  { from: '#2563eb', to: '#1d4ed8', text: '#ffffff', accent: '#60a5fa', dot: '#93c5fd' },
  { from: '#0891b2', to: '#0e7490', text: '#ffffff', accent: '#22d3ee', dot: '#67e8f9' },
  { from: '#0d9488', to: '#0f766e', text: '#ffffff', accent: '#2dd4bf', dot: '#5eead4' },
  { from: '#16a34a', to: '#15803d', text: '#ffffff', accent: '#4ade80', dot: '#86efac' },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

type MonthInfo = { month: number; name: string; days: number; startDay: number };

function buildMonths(year: number): MonthInfo[] {
  const months: MonthInfo[] = [];
  let startDay = 0;
  for (let m = 1; m <= 12; m++) {
    const days = getDaysInMonth(year, m);
    months.push({ month: m, name: `${m}월`, days, startDay });
    startDay += days;
  }
  return months;
}

function getBarGeometry(moveInDate: string | null, moveOutDate: string | null, year: number) {
  if (!moveInDate || !moveOutDate) return null;

  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  const moveIn = new Date(moveInDate);
  const moveOut = new Date(moveOutDate);

  if (moveOut < yearStart || moveIn > yearEnd) return null;

  const clampedStart = moveIn < yearStart ? yearStart : moveIn;
  const clampedEnd = moveOut > yearEnd ? yearEnd : moveOut;

  const startIdx = Math.round((clampedStart.getTime() - yearStart.getTime()) / 86400000);
  const endIdx = Math.round((clampedEnd.getTime() - yearStart.getTime()) / 86400000);

  return {
    left: startIdx * DAY_WIDTH,
    width: Math.max((endIdx - startIdx + 1) * DAY_WIDTH, DAY_WIDTH),
  };
}

function getTodayOffset(year: number): number | null {
  const now = new Date();
  const seoulDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }); // "YYYY-MM-DD"
  const [y, m, d] = seoulDateStr.split('-').map(Number);
  if (y !== year) return null;
  const yearStart = new Date(year, 0, 1);
  const todayDate = new Date(year, m - 1, d);
  return Math.round((todayDate.getTime() - yearStart.getTime()) / 86400000);
}

export default function CalendarPage() {
  const [year, setYear] = useState(2026);
  const [selectedFloors, setSelectedFloors] = useState<Set<FloorNumber>>(new Set(FLOORS));

  const months = useMemo(() => buildMonths(year), [year]);
  const totalDays = useMemo(() => (isLeapYear(year) ? 366 : 365), [year]);
  const totalWidth = totalDays * DAY_WIDTH;
  const todayOffset = useMemo(() => getTodayOffset(year), [year]);
  const visibleFloors = useMemo(
    () => FLOORS.filter((f) => selectedFloors.has(f)),
    [selectedFloors]
  );

  function toggleFloor(floor: FloorNumber) {
    setSelectedFloors((prev) => {
      const next = new Set(prev);
      if (next.has(floor)) {
        if (next.size === 1) return prev; // 최소 1개는 유지
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">연간 캘린더</h1>
          <p className="mt-1 text-sm text-gray-500">
            연도별 입실 현황을 한눈에 확인할 수 있습니다.
          </p>
        </div>

        {/* Year selector */}
        <div className="flex items-center gap-1 rounded-xl border border-[#2A2A2A] bg-[#111111] p-1">
          <button
            onClick={() => setYear((y) => y - 1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-[#222222] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="w-20 text-center text-sm font-semibold text-white tabular-nums">{year}년</span>
          <button
            onClick={() => setYear((y) => y + 1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-[#222222] transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* 전체 버튼 */}
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

        {/* 층별 버튼 */}
        {FLOORS.map((floor, fi) => {
          const color = FLOOR_COLORS[fi];
          const active = selectedFloors.has(floor);
          return (
            <button
              key={floor}
              onClick={() => toggleFloor(floor)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all"
              style={{
                backgroundColor: active ? `${color.from}22` : 'transparent',
                borderColor: active ? color.from : '#2A2A2A',
                color: '#000000',
              }}
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm"
                style={{
                  background: active
                    ? `linear-gradient(135deg, ${color.from}, ${color.to})`
                    : '#2A2A2A',
                }}
              />
              {floor}층
            </button>
          );
        })}

        {/* 오늘 표시 */}
        {todayOffset !== null && (
          <>
            <div className="w-px h-5 bg-[#2A2A2A]" />
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-0.5 h-4 rounded-full bg-rose-500" />
              <span className="text-sm text-gray-400 font-medium">오늘</span>
            </div>
          </>
        )}
      </div>

      {/* Calendar */}
      <div className="rounded-2xl border border-[#222222] overflow-hidden shadow-2xl">
        <div
          className="overflow-auto"
          style={{ maxHeight: 'calc(100vh - 260px)' }}
        >
          <div style={{ width: ROOM_COL_WIDTH + totalWidth, minWidth: 'max-content' }}>

            {/* ── Month header ── */}
            <div
              className="flex sticky top-0 z-20 border-b border-[#222222]"
              style={{ height: MONTH_H, background: 'linear-gradient(180deg, #161616 0%, #111111 100%)' }}
            >
              <div
                className="sticky left-0 z-30 flex items-center justify-center text-xs font-semibold text-gray-400 tracking-wider uppercase border-r border-[#222222]"
                style={{
                  width: ROOM_COL_WIDTH,
                  minWidth: ROOM_COL_WIDTH,
                  background: 'linear-gradient(180deg, #161616 0%, #111111 100%)',
                }}
              >
                호수
              </div>
              {months.map((m) => (
                <div
                  key={m.month}
                  className="relative flex items-center justify-center border-r border-[#222222]"
                  style={{ width: m.days * DAY_WIDTH, minWidth: m.days * DAY_WIDTH }}
                >
                  <span className="text-sm font-bold text-white tracking-wide">{m.name}</span>
                  {/* bottom accent line */}
                  <div
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t-full opacity-40"
                    style={{
                      background: [
                        'linear-gradient(90deg,#6366f1,#818cf8)',
                        'linear-gradient(90deg,#6366f1,#818cf8)',
                        'linear-gradient(90deg,#6366f1,#818cf8)',
                        'linear-gradient(90deg,#22c55e,#4ade80)',
                        'linear-gradient(90deg,#22c55e,#4ade80)',
                        'linear-gradient(90deg,#22c55e,#4ade80)',
                        'linear-gradient(90deg,#f59e0b,#fbbf24)',
                        'linear-gradient(90deg,#f59e0b,#fbbf24)',
                        'linear-gradient(90deg,#f59e0b,#fbbf24)',
                        'linear-gradient(90deg,#3b82f6,#60a5fa)',
                        'linear-gradient(90deg,#3b82f6,#60a5fa)',
                        'linear-gradient(90deg,#3b82f6,#60a5fa)',
                      ][m.month - 1],
                    }}
                  />
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
              {months.map((m) =>
                Array.from({ length: m.days }, (_, d) => {
                  const day = d + 1;
                  const isLastOfMonth = day === m.days;
                  const isFirst = day === 1;
                  const dayIdx = m.startDay + d;
                  const isToday = todayOffset === dayIdx;

                  return (
                    <div
                      key={`${m.month}-${day}`}
                      className="relative flex items-center justify-center shrink-0"
                      style={{
                        width: DAY_WIDTH,
                        borderRight: `1px solid ${isLastOfMonth ? '#333333' : '#222222'}`,
                        backgroundColor: isToday ? 'rgba(239,68,68,0.1)' : undefined,
                      }}
                    >
                      <span
                        className="text-[12px] font-medium"
                        style={{ color: isFirst ? '#e5e7eb' : isToday ? '#fca5a5' : '#9ca3af' }}
                      >
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
              const color = FLOOR_COLORS[fi];
              return (
                <div key={floor}>
                  {/* Floor separator */}
                  <div
                    className="flex items-center sticky z-10 border-b border-[#222222]"
                    style={{ height: FLOOR_ROW_H, backgroundColor: '#0F0F0F', top: MONTH_H + DAY_H }}
                  >
                    <div
                      className="sticky left-0 z-20 flex items-center gap-2 px-3 border-r border-[#222222]"
                      style={{ width: ROOM_COL_WIDTH, minWidth: ROOM_COL_WIDTH, backgroundColor: '#0F0F0F' }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: color.accent }}
                      />
                      <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: color.dot }}>
                        {floor}F
                      </span>
                    </div>
                    <div style={{ width: totalWidth, position: 'relative' }}>
                      {/* Month grid lines in floor row */}
                      {months.slice(0, -1).map((m) => (
                        <div
                          key={m.month}
                          className="absolute top-0 bottom-0"
                          style={{ left: (m.startDay + m.days) * DAY_WIDTH, width: 1, backgroundColor: '#1A1A1A' }}
                        />
                      ))}
                      {/* Today line in floor row */}
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
                    const bar = getBarGeometry(room.moveInDate, room.moveOutDate, year);
                    const isEven = ri % 2 === 0;

                    return (
                      <div
                        key={room.id}
                        className="flex group transition-colors"
                        style={{
                          height: ROW_HEIGHT,
                          backgroundColor: isEven ? '#0C0C0C' : '#0A0A0A',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.backgroundColor = '#161616';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.backgroundColor = isEven ? '#0C0C0C' : '#0A0A0A';
                        }}
                      >
                        {/* Room label */}
                        <div
                          className="sticky left-0 z-10 flex items-center gap-1.5 px-3 border-r border-[#222222] transition-colors overflow-hidden"
                          style={{
                            width: ROOM_COL_WIDTH,
                            minWidth: ROOM_COL_WIDTH,
                            backgroundColor: 'inherit',
                            borderLeft: `2px solid ${color.from}22`,
                          }}
                        >
                          <span className="text-[15px] font-semibold text-gray-200 whitespace-nowrap">{room.id}호</span>
                          {room.status === 'vacant' && (
                            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-[#1A1A1A] text-gray-400 whitespace-nowrap shrink-0">공실</span>
                          )}
                          {room.status === 'maintenance' && (
                            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-[#1A1A1A] text-yellow-600 whitespace-nowrap shrink-0">점검</span>
                          )}
                        </div>

                        {/* Timeline area */}
                        <div
                          className="relative flex-none"
                          style={{
                            width: totalWidth,
                            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent ${DAY_WIDTH - 1}px, #1e1e1e ${DAY_WIDTH - 1}px, #1e1e1e ${DAY_WIDTH}px)`,
                          }}
                        >
                          {/* Month dividers */}
                          {months.slice(0, -1).map((m) => (
                            <div
                              key={m.month}
                              className="absolute top-0 bottom-0"
                              style={{
                                left: (m.startDay + m.days) * DAY_WIDTH,
                                width: 1,
                                backgroundColor: '#333333',
                              }}
                            />
                          ))}

                          {/* Today column highlight */}
                          {todayOffset !== null && (
                            <div
                              className="absolute top-0 bottom-0 z-[5] pointer-events-none"
                              style={{
                                left: todayOffset * DAY_WIDTH,
                                width: DAY_WIDTH,
                                backgroundColor: 'rgba(239,68,68,0.08)',
                              }}
                            />
                          )}

                          {/* Occupancy bar */}
                          {bar && (
                            <div
                              className="absolute flex items-center overflow-hidden z-10 cursor-default select-none"
                              style={{
                                top: 6,
                                bottom: 6,
                                left: bar.left + 2,
                                width: bar.width - 4,
                                borderRadius: 6,
                                background: `linear-gradient(90deg, ${color.from} 0%, ${color.to} 100%)`,
                                boxShadow: `0 1px 8px ${color.from}55`,
                              }}
                              title={`${room.resident} (${room.age}세) · ${room.monthlyRent} · ${room.moveInDate} ~ ${room.moveOutDate}`}
                            >
                              {/* Left accent */}
                              <div
                                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md"
                                style={{ backgroundColor: color.dot, opacity: 0.6 }}
                              />
                              <div className="flex items-center gap-1.5 pl-3 pr-2 overflow-hidden">
                                {/* Avatar dot */}
                                <div
                                  className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                                  style={{ backgroundColor: `${color.dot}40`, color: color.dot, border: `1px solid ${color.dot}80` }}
                                >
                                  {room.resident?.[0]}
                                </div>
                                <span
                                  className="whitespace-nowrap text-[14px] font-bold tracking-tight"
                                  style={{ color: '#ffffff' }}
                                >
                                  {room.resident}
                                </span>
                                {room.gender && (
                                  <span
                                    className="whitespace-nowrap text-[11px] font-bold px-1.5 py-0.5 rounded"
                                    style={{
                                      backgroundColor: room.gender === '남' ? 'rgba(96,165,250,0.3)' : 'rgba(244,114,182,0.3)',
                                      color: room.gender === '남' ? '#93c5fd' : '#f9a8d4',
                                    }}
                                  >
                                    {room.gender}
                                  </span>
                                )}
                                {room.age && bar.width > 100 && (
                                  <span
                                    className="whitespace-nowrap text-[14px] font-semibold"
                                    style={{ color: '#ffffff' }}
                                  >
                                    · {room.age}세
                                  </span>
                                )}
                                {room.monthlyRent && bar.width > 180 && (
                                  <span
                                    className="whitespace-nowrap text-[14px] font-semibold"
                                    style={{ color: '#ffffff' }}
                                  >
                                    · {room.monthlyRent}
                                  </span>
                                )}
                                {room.moveInDate && room.moveOutDate && bar.width > 320 && (
                                  <span
                                    className="whitespace-nowrap text-[14px] font-bold opacity-80"
                                    style={{ color: '#ffffff' }}
                                  >
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
    </main>
  );
}
