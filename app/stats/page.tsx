'use client';

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { ALL_ROOMS, ROOMS_BY_FLOOR, getDashboardStats, type FloorNumber } from '../lib/mock-data';

// ──────────── 상수 ────────────

const FLOORS: FloorNumber[] = [1, 2, 3, 4, 5, 6];
const FLOOR_COLORS = ['#6366f1', '#a855f7', '#3b82f6', '#06b6d4', '#14b8a6', '#22c55e'];
const ROOM_TYPE_COLORS: Record<string, string> = {
  'Cozy':                        '#6366f1',
  'Standard A-1':                '#3b82f6',
  'Standard A-1 +':              '#06b6d4',
  'Standard A-2':                '#14b8a6',
  'Standard A-2 +':              '#22c55e',
  'Standard A-2 (넓은 사이즈)':  '#f59e0b',
  'Standard A-3':                '#fb923c',
  'Standard B-1':                '#f43f5e',
  'Standard B-2':                '#ec4899',
  'Deluxe A':                    '#8b5cf6',
  'Deluxe B':                    '#a855f7',
};

// ──────────── 헬퍼 ────────────

function parsePrice(price: string | null): number {
  if (!price) return 0;
  return parseInt(price.replace(/[₩,\s]/g, ''), 10) || 0;
}
function fmtWon(n: number) {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `${Math.round(n / 10_000)}만`;
  return n.toLocaleString();
}
function fmtWonFull(n: number) {
  return `₩${n.toLocaleString('ko-KR')}`;
}

// ──────────── 타입 ────────────

type MonthData = {
  label: string;
  year: number;
  month: number;
  value: number;
  color: string;
  isCurrent: boolean;
  // 방별 납부 내역
  rows: { id: string; resident: string; roomType: string; rent: number; status: '납부 완료' | '납부 예정' | '미납' }[];
};

// ──────────── 컴포넌트: MonthDetailModal ────────────

function MonthDetailModal({ months, initialIdx, onClose }: { months: MonthData[]; initialIdx: number; onClose: () => void }) {
  const [idx, setIdx] = useState(initialIdx);
  const m = months[idx];

  const paid    = m.rows.filter(r => r.status === '납부 완료').reduce((s, r) => s + r.rent, 0);
  const pending = m.rows.filter(r => r.status === '납부 예정').reduce((s, r) => s + r.rent, 0);
  const overdue = m.rows.filter(r => r.status === '미납').reduce((s, r) => s + r.rent, 0);

  const STATUS_STYLE: Record<string, string> = {
    '납부 완료': 'bg-emerald-500/20 text-emerald-400',
    '납부 예정': 'bg-amber-500/20 text-amber-400',
    '미납':      'bg-rose-500/20 text-rose-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative flex w-full max-w-2xl flex-col rounded-2xl border border-[#2A2A2A] bg-[#111] shadow-2xl max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-white">월별 수입 상세</h2>
            {/* Month tabs */}
            <div className="flex gap-1">
              {months.map((mo, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    i === idx
                      ? 'bg-indigo-500 text-white'
                      : 'text-gray-400 hover:bg-[#1A1A1A] hover:text-white'
                  }`}
                >
                  {mo.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* 요약 */}
        <div className="grid grid-cols-3 gap-4 border-b border-[#2A2A2A] px-6 py-4">
          <div>
            <p className="text-xs text-gray-500">납부 완료</p>
            <p className="mt-1 text-lg font-bold text-emerald-400">{fmtWon(paid)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">납부 예정</p>
            <p className="mt-1 text-lg font-bold text-amber-400">{fmtWon(pending)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">미납</p>
            <p className="mt-1 text-lg font-bold text-rose-400">{fmtWon(overdue)}</p>
          </div>
        </div>

        {/* 테이블 */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#0E0E0E]">
              <tr className="text-xs text-gray-500 border-b border-[#2A2A2A]">
                <th className="px-6 py-3 text-left font-medium">호실</th>
                <th className="px-4 py-3 text-left font-medium">입실자</th>
                <th className="px-4 py-3 text-left font-medium">방 유형</th>
                <th className="px-4 py-3 text-right font-medium">월세</th>
                <th className="px-6 py-3 text-right font-medium">납부 상태</th>
              </tr>
            </thead>
            <tbody>
              {m.rows.map((row, i) => (
                <tr key={row.id} className={`border-b border-[#1A1A1A] ${i % 2 === 0 ? 'bg-[#0C0C0C]' : 'bg-[#0A0A0A]'}`}>
                  <td className="px-6 py-3 font-semibold text-white">{row.id}호</td>
                  <td className="px-4 py-3 text-gray-300">{row.resident}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{row.roomType}</td>
                  <td className="px-4 py-3 text-right font-medium text-white">{fmtWonFull(row.rent)}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer 합계 */}
        <div className="flex items-center justify-between border-t border-[#2A2A2A] px-6 py-4">
          <span className="text-sm text-gray-400">총 {m.rows.length}개 호실</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">합계</span>
            <span className="text-xl font-bold text-white">{fmtWonFull(m.rows.reduce((s, r) => s + r.rent, 0))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────── 컴포넌트: DonutChart ────────────

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;
  const R = 60; const cx = 80; const cy = 80; const strokeWidth = 22;
  let cumAngle = -Math.PI / 2;
  const arcs = segments.map((seg) => {
    const angle = (seg.value / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(cumAngle);
    const y1 = cy + R * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + R * Math.cos(cumAngle);
    const y2 = cy + R * Math.sin(cumAngle);
    return { ...seg, angle, x1, y1, x2, y2, largeArc: angle > Math.PI ? 1 : 0 };
  });
  return (
    <div className="flex items-center gap-6">
      <svg width={160} height={160}>
        {arcs.map((arc, i) => (
          <path key={i} d={`M ${arc.x1} ${arc.y1} A ${R} ${R} 0 ${arc.largeArc} 1 ${arc.x2} ${arc.y2}`}
            fill="none" stroke={arc.color} strokeWidth={strokeWidth} strokeLinecap="butt" />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#fff" fontSize={20} fontWeight="bold">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#6b7280" fontSize={11}>전체</text>
      </svg>
      <div className="flex flex-col gap-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-sm text-gray-300">{seg.label}</span>
            <span className="ml-auto pl-4 text-sm font-bold text-white">{seg.value}</span>
            <span className="text-xs text-gray-500 w-8 text-right">{Math.round((seg.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────── 컴포넌트: BarChart (세로, 클릭 가능) ────────────

function BarChart({ data, height = 140, onBarClick }: {
  data: MonthData[];
  height?: number;
  onBarClick: (idx: number) => void;
}) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <button
          key={i}
          onClick={() => onBarClick(i)}
          className="flex flex-1 flex-col items-center gap-1 group"
        >
          <span className="text-[11px] font-semibold text-white group-hover:text-indigo-300 transition-colors">
            {fmtWon(d.value)}
          </span>
          <div
            className="w-full rounded-t-md transition-all group-hover:opacity-80"
            style={{ height: `${(d.value / max) * (height - 28)}px`, backgroundColor: d.color, minHeight: 4 }}
          />
          <span className="text-[10px] text-gray-500 whitespace-nowrap">{d.label}</span>
        </button>
      ))}
    </div>
  );
}

// ──────────── 컴포넌트: HBarChart (가로) ────────────

function HBarChart({ data }: { data: { label: string; value: number; total: number; color: string }[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-sm text-gray-300 truncate">{d.label}</span>
          <div className="flex-1 h-5 rounded-full bg-[#1A1A1A] overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${(d.value / d.total) * 100}%`, backgroundColor: d.color }} />
          </div>
          <span className="w-8 shrink-0 text-right text-sm font-bold text-white">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

// ──────────── 컴포넌트: StatCard ────────────

function StatCard({ title, value, subtitle, color }: { title: string; value: string; subtitle?: string; color?: string }) {
  return (
    <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-5 shadow-sm">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="mt-2 text-3xl font-bold" style={{ color: color ?? '#fff' }}>{value}</p>
      {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}

// ──────────── Main Page ────────────

export default function StatsPage() {
  const stats = getDashboardStats();
  const [detailIdx, setDetailIdx] = useState<number | null>(null);

  const occupiedRooms = useMemo(() => ALL_ROOMS.filter(r => r.status === 'occupied'), []);

  // 층별 현황
  const floorStats = useMemo(() =>
    FLOORS.map((floor, fi) => {
      const rooms = ROOMS_BY_FLOOR[floor];
      return {
        floor, color: FLOOR_COLORS[fi], total: rooms.length,
        occupied: rooms.filter(r => r.status === 'occupied').length,
        vacant:   rooms.filter(r => r.status === 'vacant').length,
        contract: rooms.filter(r => r.status === 'contract').length,
      };
    }), []);

  // 방 유형별 분포
  const typeStats = useMemo(() => {
    const map: Record<string, number> = {};
    ALL_ROOMS.forEach(r => { map[r.roomType] = (map[r.roomType] ?? 0) + 1; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ label: type, value: count, total: ALL_ROOMS.length, color: ROOM_TYPE_COLORS[type] ?? '#6366f1' }));
  }, []);

  // 납부 상태
  const paymentStats = useMemo(() => {
    const paid    = ALL_ROOMS.filter(r => r.paymentStatus === 'paid').length;
    const overdue = ALL_ROOMS.filter(r => r.paymentStatus === 'overdue').length;
    const upcoming = ALL_ROOMS.filter(r => r.paymentStatus === 'upcoming').length;
    return [
      { label: '납부 완료', value: paid,     color: '#22c55e' },
      { label: '납부 예정', value: upcoming,  color: '#f59e0b' },
      { label: '미납',     value: overdue,   color: '#f43f5e' },
    ];
  }, []);

  // 월별 수입 (최근 6개월) - 방별 납부 내역 포함
  const monthlyRevenue: MonthData[] = useMemo(() => {
    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth() + 1;

    // 각 방의 base rent
    const baseRows = occupiedRooms.map(r => ({ id: r.id, resident: r.resident ?? '', roomType: r.roomType, rent: parsePrice(r.monthlyRent) }));

    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const y = d.getFullYear();
      const mo = d.getMonth() + 1;
      const isCurrent = y === nowYear && mo === nowMonth;

      // 이번 달: 실제 납부 상태 반영 / 과거: 전부 납부 완료
      const rows = baseRows.map(r => {
        let status: '납부 완료' | '납부 예정' | '미납';
        if (isCurrent) {
          const room = ALL_ROOMS.find(room => room.id === r.id);
          const ps = room?.paymentStatus;
          status = ps === 'paid' ? '납부 완료' : ps === 'overdue' ? '미납' : '납부 예정';
        } else {
          status = '납부 완료';
        }
        return { ...r, status };
      });

      const total = rows.reduce((s, r) => s + r.rent, 0);
      return {
        label: `${mo}월`,
        year: y,
        month: mo,
        value: total,
        color: isCurrent ? '#6366f1' : '#3b82f655',
        isCurrent,
        rows,
      };
    });
  }, [occupiedRooms]);

  const thisMonthRevenue = monthlyRevenue[monthlyRevenue.length - 1]?.value ?? 0;
  const overdueCount = ALL_ROOMS.filter(r => r.paymentStatus === 'overdue').length;

  return (
    <main className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">통계</h1>
        <p className="mt-1 text-sm text-gray-400">입실 현황, 수입, 납부 상태를 한눈에 확인하세요.</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="전체 방" value={`${stats.totalRooms}개`} subtitle="관리 호실 수" />
        <StatCard title="입실률" value={`${stats.occupancyRate}%`} subtitle={`${stats.occupiedRooms}명 입실 중`} color="#818cf8" />
        <StatCard title="이번 달 예상 수입" value={fmtWon(thisMonthRevenue)} subtitle="입실 중 호실 기준" color="#4ade80" />
        <StatCard title="미납" value={`${overdueCount}건`} subtitle="즉시 연락 필요" color={overdueCount > 0 ? '#f87171' : '#4ade80'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 층별 입실 현황 */}
        <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-white">층별 입실 현황</h2>
          <div className="flex flex-col gap-3">
            {floorStats.map((f) => (
              <div key={f.floor} className="flex items-center gap-3">
                <span className="w-6 shrink-0 text-sm font-bold" style={{ color: f.color }}>{f.floor}F</span>
                <div className="flex-1 flex h-6 rounded-lg overflow-hidden bg-[#1A1A1A]">
                  {f.occupied > 0 && (
                    <div className="flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ width: `${(f.occupied / f.total) * 100}%`, backgroundColor: f.color }}>{f.occupied}</div>
                  )}
                  {f.contract > 0 && (
                    <div className="flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ width: `${(f.contract / f.total) * 100}%`, backgroundColor: '#eab308' }}>{f.contract}</div>
                  )}
                  {f.vacant > 0 && (
                    <div className="flex items-center justify-center text-[10px] font-semibold text-gray-500"
                      style={{ width: `${(f.vacant / f.total) * 100}%`, backgroundColor: '#1E1E1E' }}>{f.vacant}</div>
                  )}
                </div>
                <span className="w-12 shrink-0 text-right text-xs text-gray-500">{f.total}개</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />입실 중</div>
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-yellow-500" />계약</div>
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-[#1E1E1E] border border-[#333]" />공실</div>
          </div>
        </div>

        {/* 납부 상태 */}
        <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-white">납부 상태 현황</h2>
          <DonutChart segments={paymentStats} />
        </div>

        {/* 월별 수입 추이 */}
        <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">월별 예상 수입 추이</h2>
            <button
              onClick={() => setDetailIdx(monthlyRevenue.length - 1)}
              className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 text-xs font-medium text-gray-300 hover:border-indigo-500/50 hover:text-white transition-colors"
            >
              자세히 보기
            </button>
          </div>
          <BarChart data={monthlyRevenue} height={160} onBarClick={(i) => setDetailIdx(i)} />
          <p className="mt-2 text-center text-[11px] text-gray-600">막대를 클릭하면 해당 월 상세를 볼 수 있습니다.</p>
        </div>

        {/* 방 유형 분포 */}
        <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-white">방 유형별 분포</h2>
          <HBarChart data={typeStats} />
        </div>

      </div>

      {/* 월별 상세 모달 */}
      {detailIdx !== null && (
        <MonthDetailModal
          months={monthlyRevenue}
          initialIdx={detailIdx}
          onClose={() => setDetailIdx(null)}
        />
      )}
    </main>
  );
}
