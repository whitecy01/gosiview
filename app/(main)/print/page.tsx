"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Printer, Zap, X } from "lucide-react";
import { fetchAllCashSuccessions, type DbCashSuccession } from "@/app/lib/supabase-data";
import { fromDbCash } from "@/app/lib/cash-succession";
import { useRooms } from "@/app/context/RoomsContext";
import { type CashSuccessionRecord } from "@/app/lib/mock-data";

// ────────────── 상수 ──────────────

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const PRINT_STYLE = `
  body{font-family:sans-serif;font-size:12px;color:#000;padding:24px;}
  h2{font-size:16px;font-weight:bold;margin-bottom:4px;}
  p{margin-bottom:16px;font-size:11px;color:#555;}
  table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:24px;}
  th,td{border:1px solid #ccc;padding:6px 8px;text-align:center;vertical-align:middle;}
  th{background:#f5f5f5;}
  @page{margin:1cm;}
`;

// ────────────── 헬퍼 ──────────────

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}
function fmtMoney(n: number | undefined) {
  return `₩${(n ?? 0).toLocaleString("ko-KR")}`;
}

/** 방 번호를 포함한 현금 승계 항목 */
type CashItem = { id: string; roomId: string; name: string; rec: CashSuccessionRecord };

function buildCashTableHtml(item: CashItem): string {
  const { roomId, rec } = item;
  const td = 'style="border:1px solid #ccc;padding:6px 8px;"';
  const tdHl = 'style="border:1px solid #ccc;padding:6px 8px;background:#fffde7;"';
  const tdHlBold = 'style="border:1px solid #ccc;padding:6px 8px;background:#fffde7;font-weight:bold;"';
  return `
    <div style="margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th ${td}>호실</th>
            <th ${td}>청구기간</th>
            <th ${td}>임대인<br/>현금승계 기간</th>
            <th ${td}>임차인<br/>실 사용 기간</th>
            <th ${td}>계좌번호</th>
            <th ${td}>비고</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td ${td} rowspan="2">${roomId}호</td>
            <td ${td}>${rec.billingStart ?? ""} ~ ${rec.billingEnd ?? ""}</td>
            <td ${td}>${rec.landlordStart ?? ""} ~ ${rec.landlordEnd ?? ""}</td>
            <td ${tdHl}>${rec.tenantStart ?? ""} ~ ${rec.tenantEnd ?? ""}</td>
            <td ${td} rowspan="2">${rec.bankName ?? ""} ${rec.accountHolder ?? ""}<br/>${rec.accountNumber ?? ""}</td>
            <td ${td} rowspan="2">${rec.paymentDate ? `<div style="font-weight:bold;margin-bottom:2px;">${rec.paymentDate}</div>` : ""}${rec.notes ?? ""}</td>
          </tr>
          <tr>
            <td ${td}>₩${(rec.totalAmount ?? 0).toLocaleString("ko-KR")}<br/><span style="color:#666;">사용량 ${rec.totalKwh ?? 0}kWh</span></td>
            <td ${td}>₩${(rec.landlordAmount ?? 0).toLocaleString("ko-KR")}<br/><span style="color:#666;">사용량 ${rec.landlordKwh ?? 0}kWh</span></td>
            <td ${tdHlBold}>₩${(rec.tenantAmount ?? 0).toLocaleString("ko-KR")}<br/><span style="color:#666;font-weight:normal;">사용량 ${rec.tenantKwh ?? 0}kWh</span></td>
          </tr>
        </tbody>
      </table>
    </div>`;
}

function printItems(items: CashItem[], title: string) {
  if (items.length === 0) return;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.head.innerHTML = `<meta charset="utf-8"><title>${title}</title><style>${PRINT_STYLE}</style>`;
  win.document.body.innerHTML = `
    <h2>전기 현금 승계 — ${title}</h2>
    <p>이번달 청구요금은 현금 승계만 가능하여 호림에서 직접 납부하고 있습니다.<br/>
    다음달 부터는 임차인에게서 직접 납부하시면 됩니다.(종이 청구서 배부 예정)<br/>
    실 사용 금액(형광펜 부분)만 저희 계좌로 입금 부탁드립니다. 감사합니다.</p>
  ` + items.map(buildCashTableHtml).join("");
  win.focus();
  win.print();
}

// ────────────── 날짜별 모달 ──────────────

function DayModal({ date, items, onClose }: { date: string; items: CashItem[]; onClose: () => void }) {
  const [y, m, d] = date.split("-");
  const label = `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
  const totalTenant = items.reduce((s, i) => s + (i.rec.tenantAmount ?? 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#111] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">{label} 청구 종료</h2>
            <p className="mt-0.5 text-xs text-gray-500">현금 승계 {items.length}건 · 임차인 부담 합계 {fmtMoney(totalTenant)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[#1A1A1A] hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-[#2A2A2A] bg-[#0D0D0D] p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-bold text-indigo-400">{item.roomId}호</span>
                  <span className="text-sm text-white">{item.name}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {item.rec.billingStart ?? "-"} ~ {item.rec.billingEnd ?? "-"}
                </span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-[#2A2A2A] overflow-hidden rounded-lg border border-[#2A2A2A]">
                {[
                  { label: "임대인", value: item.rec.landlordAmount, color: "text-white" },
                  { label: "총(지로)", value: item.rec.totalAmount, color: "text-white" },
                  { label: "임차인", value: item.rec.tenantAmount, color: "text-sky-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="px-2 py-2 text-center">
                    <p className="text-[10px] text-gray-500">{label}</p>
                    <p className={`mt-0.5 text-xs font-bold ${color}`}>{fmtMoney(value)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => printItems([item], `${item.roomId}호`)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2.5 py-1 text-[11px] text-gray-400 transition-colors hover:text-white"
                >
                  <Printer className="h-3 w-3" />개별 출력
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#2A2A2A] px-6 py-4">
          <button
            onClick={() => printItems(items, label)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
          >
            <Printer size={16} />
            {items.length}건 한 번에 출력
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────── 페이지 ──────────────

export default function PrintPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [rows, setRows] = useState<DbCashSuccession[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { contracts } = useRooms();

  const load = useCallback(async () => {
    const data = await fetchAllCashSuccessions();
    setRows(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  /** 청구 종료일(billing_end) 기준으로 그룹핑 */
  const itemsByDate = useMemo(() => {
    const contractById = new Map(contracts.map((c) => [c.id, c]));
    const map: Record<string, CashItem[]> = {};
    for (const r of rows) {
      if (!r.billing_end) continue;
      const key = r.billing_end.slice(0, 10);
      const c = contractById.get(r.contract_id);
      const item: CashItem = {
        id: r.id,
        roomId: c?.room_id ?? "-",
        name: c?.name ?? "-",
        rec: fromDbCash(r),
      };
      (map[key] ??= []).push(item);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.roomId.localeCompare(b.roomId));
    }
    return map;
  }, [rows, contracts]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const todayKey = toDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthItems = useMemo(() => {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    return Object.entries(itemsByDate)
      .filter(([k]) => k.startsWith(prefix))
      .flatMap(([, v]) => v);
  }, [itemsByDate, year, month]);

  function prevMonth() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  }

  return (
    <main className="w-full space-y-6">
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#111] p-6 shadow-sm">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <div>
              <h2 className="text-sm font-semibold text-white">현금 승계 출력</h2>
              <p className="text-xs text-gray-500">청구 종료일 기준 · 날짜를 클릭하면 해당 일자 건을 한 번에 출력합니다</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => printItems(monthItems, `${year}년 ${month}월`)}
              disabled={monthItems.length === 0}
              className="flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-[#1A1A1A] hover:text-white disabled:opacity-40"
            >
              <Printer size={13} />
              이번 달 전체 출력 ({monthItems.length})
            </button>
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-[#1A1A1A] hover:text-white">
                <ChevronLeft size={18} />
              </button>
              <h2 className="text-lg font-bold text-white">{year}년 {month}월</h2>
              <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-[#1A1A1A] hover:text-white">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* 요일 */}
        <div className="mb-2 grid grid-cols-7">
          {WEEKDAYS.map((day, i) => (
            <div key={day} className="py-2 text-center text-xs font-semibold"
              style={{ color: i === 0 ? "#f87171" : i === 6 ? "#60a5fa" : "#6b7280" }}>
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} />;
            const dateKey = toDateKey(year, month, day);
            const dayItems = itemsByDate[dateKey] ?? [];
            const isToday = dateKey === todayKey;
            const isSun = idx % 7 === 0;
            const isSat = idx % 7 === 6;

            return (
              <button
                key={idx}
                onClick={() => dayItems.length > 0 && setSelectedDate(dateKey)}
                disabled={dayItems.length === 0}
                className={`flex min-h-[120px] flex-col rounded-xl border border-[#1E1E1E] p-2 text-left transition-colors ${
                  dayItems.length > 0 ? "hover:border-indigo-500/40 hover:bg-[#161616]" : "cursor-default opacity-60"
                }`}
                style={{ backgroundColor: isToday ? "#1a1a2e" : undefined, borderColor: isToday ? "#4f46e5" : undefined }}
              >
                <span className="mb-1.5 text-sm font-semibold leading-none"
                  style={{ color: isToday ? "#818cf8" : isSun ? "#f87171" : isSat ? "#60a5fa" : "#d1d5db" }}>
                  {day}
                </span>
                <div className="flex flex-1 flex-col gap-1">
                  {dayItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="truncate rounded border border-amber-500/20 bg-amber-500/15 px-1.5 py-1 text-xs leading-tight text-amber-300">
                      {item.roomId}호 {item.name}
                    </div>
                  ))}
                  {dayItems.length > 3 && (
                    <span className="px-1 text-[11px] text-gray-500">+{dayItems.length - 3}건 더</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <DayModal
          date={selectedDate}
          items={itemsByDate[selectedDate] ?? []}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </main>
  );
}
