'use client';

import { useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { MAINTENANCE_BY_ROOM } from '@/app/lib/mock-data';
import { useEffectiveRooms } from '@/app/context/useEffectiveRooms';

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

const STATUS_STYLE: Record<string, { badge: string; dot: string }> = {
  '납부 완료': { badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dot: '#22c55e' },
  '납부 예정': { badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',       dot: '#f59e0b' },
  '미납':      { badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30',           dot: '#f43f5e' },
};

type StatusFilter = '전체' | '납부 완료' | '납부 예정' | '미납';

function MonthDetailModal({ months, initialIdx, onClose }: { months: MonthData[]; initialIdx: number; onClose: () => void }) {
  const [idx, setIdx] = useState(initialIdx);
  const [filter, setFilter] = useState<StatusFilter>('전체');
  const m = months[idx];

  const paidCount    = m.rows.filter(r => r.status === '납부 완료').length;
  const upcomingCount = m.rows.filter(r => r.status === '납부 예정').length;
  const overdueCount  = m.rows.filter(r => r.status === '미납').length;

  const filtered = filter === '전체' ? m.rows : m.rows.filter(r => r.status === filter);

  const FILTERS: { label: StatusFilter; count: number; style: string; activeStyle: string }[] = [
    { label: '전체',    count: m.rows.length, style: 'border-[#2A2A2A] text-gray-500', activeStyle: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    { label: '납부 완료', count: paidCount,    style: 'border-[#2A2A2A] text-gray-500', activeStyle: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { label: '납부 예정', count: upcomingCount, style: 'border-[#2A2A2A] text-gray-500', activeStyle: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { label: '미납',    count: overdueCount,  style: 'border-[#2A2A2A] text-gray-500', activeStyle: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative flex w-full max-w-2xl flex-col rounded-2xl border border-[#2A2A2A] bg-[#111] shadow-2xl max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-white">월별 납부 상세</h2>
            <div className="flex gap-1">
              {months.map((mo, i) => (
                <button
                  key={i}
                  onClick={() => { setIdx(i); setFilter('전체'); }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    i === idx ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:bg-[#1A1A1A] hover:text-white'
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
        <div className="grid grid-cols-3 border-b border-[#2A2A2A] shrink-0">
          {[
            { label: '납부 완료', count: paidCount,     color: '#22c55e' },
            { label: '납부 예정', count: upcomingCount, color: '#f59e0b' },
            { label: '미납',     count: overdueCount,  color: '#f43f5e' },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex flex-col items-center py-4 gap-0.5">
              <span className="text-2xl font-bold" style={{ color }}>{count}</span>
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-1.5 px-6 py-3 border-b border-[#2A2A2A] shrink-0">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setFilter(f.label)}
              className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-colors ${
                filter === f.label ? f.activeStyle : `${f.style} hover:text-gray-300`
              }`}
            >
              {f.label} {f.count}
            </button>
          ))}
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-gray-500">해당 상태의 호실이 없습니다.</td>
                </tr>
              ) : (
                filtered.map((row, i) => (
                  <tr key={row.id} className={`border-b border-[#1A1A1A] ${i % 2 === 0 ? 'bg-[#0C0C0C]' : 'bg-[#0A0A0A]'}`}>
                    <td className="px-6 py-3 font-semibold text-white">{row.id}호</td>
                    <td className="px-4 py-3 text-gray-300">{row.resident}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{row.roomType}</td>
                    <td className="px-4 py-3 text-right font-medium text-white">{fmtWonFull(row.rent)}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[row.status].badge}`}>
                        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_STYLE[row.status].dot }} />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#2A2A2A] px-6 py-4 shrink-0">
          <span className="text-sm text-gray-400">총 {filtered.length}개 호실</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">합계</span>
            <span className="text-xl font-bold text-white">{fmtWonFull(filtered.reduce((s, r) => s + r.rent, 0))}</span>
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
    <div className="flex items-center justify-center gap-6">
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

// ──────────── 컴포넌트: MaintenanceGrid ────────────

const DETAIL_COLOR: Record<string, string> = {
  '도배':       'bg-violet-500/20 text-violet-300 border-violet-500/30',
  '매트리스교체': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  '에어컨청소':  'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  '전구교체':   'bg-amber-500/20 text-amber-300 border-amber-500/30',
  '장판교체':   'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  '화장실청소':  'bg-rose-500/20 text-rose-300 border-rose-500/30',
};
const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

function MaintenanceGrid() {
  const { effectiveRooms } = useEffectiveRooms();
  const [year, setYear] = useState(new Date().getFullYear());

  // 해당 연도에 기록이 하나라도 있는 방만
  const roomsWithData = effectiveRooms.filter(room => {
    const records = MAINTENANCE_BY_ROOM[room.id] ?? [];
    return records.some(r => r.date.startsWith(String(year)));
  });

  // 해당 연도에 기록이 아예 없으면 전체 표시
  const rows = roomsWithData.length > 0 ? roomsWithData : [];

  function recordsFor(roomId: string, month: number) {
    return (MAINTENANCE_BY_ROOM[roomId] ?? []).filter(r => {
      const [y, m] = r.date.split('-').map(Number);
      return y === year && m === month;
    });
  }

  return (
    <div className="rounded-xl border border-[#2A2A2A] bg-[#111] shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-white">연간 유지보수 현황</h2>
          <p className="mt-0.5 text-xs text-gray-500">방별 유지보수 및 비품 교체 이력</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setYear(y => y - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="w-16 text-center text-sm font-semibold text-white">{year}년</span>
          <button
            onClick={() => setYear(y => y + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <p className="text-sm text-gray-500">{year}년 유지보수 기록이 없습니다.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 900 }}>
            <thead>
              <tr className="border-b border-[#2A2A2A] bg-[#0E0E0E]">
                <th className="sticky left-0 z-10 bg-[#0E0E0E] w-16 px-4 py-3 text-left text-xs font-semibold text-gray-500">호실</th>
                {MONTHS.map(m => (
                  <th key={m} className="px-2 py-3 text-center text-xs font-semibold text-gray-500 min-w-[80px]">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((room, ri) => (
                <tr key={room.id} className={`border-b border-[#1A1A1A] ${ri % 2 === 0 ? 'bg-[#0C0C0C]' : 'bg-[#0A0A0A]'}`}>
                  <td className="sticky left-0 z-10 px-4 py-2 font-semibold text-gray-200 text-sm whitespace-nowrap"
                    style={{ backgroundColor: ri % 2 === 0 ? '#0C0C0C' : '#0A0A0A' }}>
                    {room.id}호
                  </td>
                  {MONTHS.map((_, mi) => {
                    const recs = recordsFor(room.id, mi + 1);
                    return (
                      <td key={mi} className="px-1.5 py-2 align-top">
                        {recs.length > 0 && (
                          <div className="flex flex-col gap-1">
                            {recs.map((rec, i) => (
                              <div key={i} className="rounded-lg border border-[#2A2A2A] bg-[#161616] px-2 py-1.5">
                                <div className="mb-1 text-[10px] text-gray-500">{rec.date.slice(8)}일 · ₩{(rec.amount / 10000).toFixed(0)}만</div>
                                <div className="flex flex-wrap gap-0.5">
                                  {rec.details.map(d => (
                                    <span key={d} className={`rounded border px-1 py-0.5 text-[9px] font-medium ${DETAIL_COLOR[d] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                                      {d}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
  const { effectiveRooms, stats } = useEffectiveRooms();
  const [detailIdx, setDetailIdx] = useState<number | null>(null);
  const [paymentMonthIdx, setPaymentMonthIdx] = useState(5); // 마지막 달 (현재)

  const occupiedRooms = useMemo(() => effectiveRooms.filter(r => r.status === 'occupied'), [effectiveRooms]);

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
          const room = effectiveRooms.find(room => room.id === r.id);
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
  }, [occupiedRooms, effectiveRooms]);

  const thisMonthRevenue = monthlyRevenue[monthlyRevenue.length - 1]?.value ?? 0;
  const overdueCount = effectiveRooms.filter(r => r.paymentStatus === 'overdue').length;

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
        {/* 납부 상태 */}
        <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">납부 상태 현황</h2>
            <div className="flex items-center gap-2">
              {/* 월 네비게이션 */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setPaymentMonthIdx(i => Math.max(0, i - 1))}
                  disabled={paymentMonthIdx === 0}
                  className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="min-w-[60px] text-center text-xs font-semibold text-gray-300">
                  {monthlyRevenue[paymentMonthIdx]?.year}년 {monthlyRevenue[paymentMonthIdx]?.month}월
                </span>
                <button
                  onClick={() => setPaymentMonthIdx(i => Math.min(monthlyRevenue.length - 1, i + 1))}
                  disabled={paymentMonthIdx === monthlyRevenue.length - 1}
                  className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
              <button
                onClick={() => setDetailIdx(paymentMonthIdx)}
                className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 text-xs font-medium text-gray-300 hover:border-indigo-500/50 hover:text-white transition-colors"
              >
                자세히 보기
              </button>
            </div>
          </div>
          <DonutChart segments={[
            { label: '납부 완료', value: monthlyRevenue[paymentMonthIdx]?.rows.filter(r => r.status === '납부 완료').length ?? 0, color: '#22c55e' },
            { label: '납부 예정', value: monthlyRevenue[paymentMonthIdx]?.rows.filter(r => r.status === '납부 예정').length ?? 0, color: '#f59e0b' },
            { label: '미납',     value: monthlyRevenue[paymentMonthIdx]?.rows.filter(r => r.status === '미납').length ?? 0,     color: '#f43f5e' },
          ]} />
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
      </div>

      {/* 연간 유지보수 현황 */}
      <MaintenanceGrid />

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
