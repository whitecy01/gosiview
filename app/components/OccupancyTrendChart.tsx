'use client';

import { useMemo, useRef, useState } from 'react';
import { type DbContract } from '@/app/lib/supabase-data';

export type TrendUnit = 'day' | 'week' | 'month' | 'year';

type Point = { label: string; date: Date; count: number };

const DAY = 86400000;

/** 특정 날짜(ms)에 입실 중인 계약 수 */
function occupiedOn(contracts: DbContract[], dayMs: number): number {
  let n = 0;
  for (const c of contracts) {
    const mi = c.actual_move_in_date;
    if (!mi) continue;
    const inMs = new Date(mi).getTime();
    if (inMs > dayMs) continue;
    const moOut = c.actual_move_out_date ?? c.contract_start_end ?? c.contract_start_date;
    const outMs = moOut ? new Date(moOut).getTime() : Infinity;
    if (outMs > dayMs) n++;
  }
  return n;
}

function fmtLabel(d: Date, unit: TrendUnit): string {
  const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
  if (unit === 'year') return `${y}`;
  if (unit === 'month') return `${String(y).slice(2)}.${m}`;
  return `${m}/${day}`; // day, week
}

/** 일 단위 점유수를 unit 버킷으로 묶어 평균 */
function buildSeries(contracts: DbContract[], start: Date, end: Date, unit: TrendUnit): Point[] {
  const startMs = start.getTime();
  const endMs = end.getTime();
  const buckets = new Map<string, { date: Date; sum: number; cnt: number }>();

  for (let ms = startMs; ms <= endMs; ms += DAY) {
    const d = new Date(ms);
    let key: string;
    if (unit === 'day') key = String(ms);
    else if (unit === 'week') key = String(Math.floor((ms - startMs) / (7 * DAY)));
    else if (unit === 'month') key = `${d.getFullYear()}-${d.getMonth()}`;
    else key = String(d.getFullYear());

    const occ = occupiedOn(contracts, ms);
    const b = buckets.get(key);
    if (b) { b.sum += occ; b.cnt += 1; }
    else buckets.set(key, { date: d, sum: occ, cnt: 1 });
  }

  return [...buckets.values()].map((b) => ({
    label: fmtLabel(b.date, unit),
    date: b.date,
    count: Math.round(b.sum / b.cnt),
  }));
}

export default function OccupancyTrendChart({
  contracts, totalRooms, timelineStart, timelineEnd, unit, today,
}: {
  contracts: DbContract[];
  totalRooms: number;
  timelineStart: Date;
  timelineEnd: Date;
  unit: TrendUnit;
  today: Date;
}) {
  const points = useMemo(
    () => buildSeries(contracts, timelineStart, timelineEnd, unit),
    [contracts, timelineStart, timelineEnd, unit],
  );

  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  // 뷰박스 좌표계 (CSS로 100% 폭에 맞춤)
  const W = 1000, H = 340;
  const padL = 44, padR = 20, padT = 24, padB = 40;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const maxY = Math.max(totalRooms, ...points.map((p) => p.count), 1);
  const n = points.length;

  const x = (i: number) => padL + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v: number) => padT + plotH - (v / maxY) * plotH;

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.count).toFixed(1)}`).join(' ');
  const areaPath = n > 0
    ? `${linePath} L ${x(n - 1).toFixed(1)} ${(padT + plotH).toFixed(1)} L ${x(0).toFixed(1)} ${(padT + plotH).toFixed(1)} Z`
    : '';

  // Y축 눈금 (0, 1/2, max)
  const yTicks = [0, Math.round(maxY / 2), maxY];

  // X축 라벨: 최대 ~10개만
  const labelStep = Math.max(1, Math.ceil(n / 10));

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg || n === 0) return;
    const rect = svg.getBoundingClientRect();
    const vbX = ((e.clientX - rect.left) / rect.width) * W;
    // 가장 가까운 점
    let best = 0, bestD = Infinity;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(x(i) - vbX);
      if (d < bestD) { bestD = d; best = i; }
    }
    setHover(best);
  }

  const hp = hover != null ? points[hover] : null;
  const rate = hp ? Math.round((hp.count / (totalRooms || 1)) * 100) : 0;

  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-[#111] p-5 shadow-sm">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 'auto' }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="occFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y 그리드 + 눈금 */}
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={padL} y1={y(t)} x2={W - padR} y2={y(t)} stroke="#1E1E1E" strokeWidth="1" />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="12" fill="#6b7280">{t}</text>
          </g>
        ))}

        {/* 영역 + 라인 */}
        {areaPath && <path d={areaPath} fill="url(#occFill)" />}
        {linePath && <path d={linePath} fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}

        {/* X 라벨 */}
        {points.map((p, i) => (i % labelStep === 0 || i === n - 1) && (
          <text key={i} x={x(i)} y={H - 14} textAnchor="middle" fontSize="11" fill="#6b7280">{p.label}</text>
        ))}

        {/* Hover 크로스헤어 */}
        {hp && (
          <g>
            <line x1={x(hover!)} y1={padT} x2={x(hover!)} y2={padT + plotH} stroke="#4f46e5" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={x(hover!)} cy={y(hp.count)} r="5" fill="#818cf8" stroke="#0A0A0A" strokeWidth="2" />
          </g>
        )}
      </svg>

      {/* 툴팁 (하단 요약) */}
      <div className="mt-2 flex items-center justify-between px-1 text-sm">
        <span className="text-gray-500">
          {hp ? `${hp.label}` : `${unit === 'year' ? '연' : unit === 'month' ? '월' : unit === 'week' ? '주' : '일'}별 입실 추이`}
        </span>
        {hp && (
          <span className="flex items-center gap-3">
            <span className="text-white font-semibold">{hp.count}명</span>
            <span className="text-indigo-300">입실률 {rate}%</span>
          </span>
        )}
      </div>
    </div>
  );
}
