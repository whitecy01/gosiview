"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, Home, Search, UserRound, X, XCircle } from "lucide-react";
import { type PaymentHistoryEntry, type PaymentStatus, type Room } from "../lib/mock-data";
import { useRooms } from "../context/RoomsContext";
import PaymentEditModal from "./PaymentEditModal";

type FilterMode = "all" | "overdue" | "paid";

export default function LedgerList() {
  const { rooms } = useRooms();
  const ledgerEntries = rooms.filter((r) => r.status === 'occupied');
  const totalResidents = ledgerEntries.length;
  const totalRooms = rooms.length;
  const paidResidents = ledgerEntries.filter((entry) => entry.paymentStatus === "paid").length;
  const overdueResidents = ledgerEntries.filter((entry) => entry.paymentStatus === "overdue").length;
  const [entries, setEntries] = useState<Room[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedEntry, setSelectedEntry] = useState<Room | null>(null);
  const [editingEntry, setEditingEntry] = useState<Room | null>(null);

  const handleSave = (updated: Partial<Room>) => {
    if (!editingEntry) return;
    setEntries((prev) =>
      prev.map((e) => (e.id === editingEntry.id ? { ...e, ...updated } : e))
    );
    setEditingEntry(null);
  };

  const normalizedKeyword = searchKeyword.trim().toLowerCase();
  const filteredEntries = entries.filter((entry) => {
    const matchesKeyword = (entry.resident ?? "").toLowerCase().includes(normalizedKeyword);
    const matchesStatus =
      filterMode === "all" ||
      (filterMode === "overdue" && entry.paymentStatus === "overdue") ||
      (filterMode === "paid" && entry.paymentStatus === "paid");

    return matchesKeyword && matchesStatus;
  });

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <SummaryCard
            icon={<Home className="h-5 w-5 text-gray-300" />}
            label="총 방 개수"
            value={`${totalRooms}개`}
            accent="border-gray-400/40 bg-gray-500/20"
          />
          <SummaryCard
            icon={<UserRound className="h-5 w-5 text-indigo-300" />}
            label="총 관리 입실자"
            value={`${totalResidents}명`}
            accent="border-indigo-400/40 bg-indigo-500/20"
          />
          <SummaryCard
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-300" />}
            label="이번 달 납부 완료"
            value={`${paidResidents}명`}
            accent="border-emerald-400/40 bg-emerald-500/20"
          />
          <SummaryCard
            icon={<XCircle className="h-5 w-5 text-rose-300" />}
            label="확인 필요한 미납"
            value={`${overdueResidents}명`}
            accent="border-rose-400/40 bg-rose-500/20"
          />
        </div>

        <div className="rounded-xl border border-[#2A2A2A] bg-[#111] shadow-sm overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-[#2A2A2A] p-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">입실자 장부 리스트</h2>
              <p className="mt-1 text-sm text-gray-400">
                입실일, 퇴실일, 월세 납부 시점을 한눈에 볼 수 있도록 정리했습니다.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder="이름으로 검색"
                  className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-indigo-500 sm:w-64"
                />
              </label>
              <div className="flex rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-1">
                <FilterButton
                  label="전체"
                  active={filterMode === "all"}
                  onClick={() => setFilterMode("all")}
                />
                <FilterButton
                  label="미납만"
                  active={filterMode === "overdue"}
                  onClick={() => setFilterMode("overdue")}
                />
                <FilterButton
                  label="납부 완료만"
                  active={filterMode === "paid"}
                  onClick={() => setFilterMode("paid")}
                />
              </div>
              <div className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 text-sm text-gray-300">
                기준 월: <span className="font-medium text-white">2026년 3월</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-gray-300 whitespace-nowrap">
              <thead className="border-b border-[#2A2A2A] bg-[#1A1A1A] text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">호실 / 입실자</th>
                  <th className="px-6 py-4 font-medium">성별</th>
                  <th className="px-6 py-4 font-medium">나이</th>
                  <th className="px-6 py-4 font-medium">입실일</th>
                  <th className="px-6 py-4 font-medium">퇴실일</th>
                  <th className="px-6 py-4 font-medium">월세</th>
                  <th className="px-6 py-4 font-medium">납부 대상 월일</th>
                  <th className="px-6 py-4 font-medium">월세 납부일</th>
                  <th className="px-6 py-4 font-medium">상태</th>
                  <th className="px-6 py-4 font-medium">납부 이력</th>
                  <th className="px-6 py-4 font-medium">수정</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {filteredEntries.map((entry) => (
                  <tr key={`${entry.id}-${entry.resident}`} className="transition-colors hover:bg-[#161616]">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#1A1A1A] text-xs font-semibold text-white">
                          {entry.id}
                        </div>
                        <div>
                          <p className="font-medium text-white">{entry.resident}</p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <Home className="h-3.5 w-3.5" />
                            {entry.id}호
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {entry.gender === '남' ? (
                        <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">남</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-pink-500/20 bg-pink-500/10 px-2.5 py-1 text-xs font-medium text-pink-400">여</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-white font-medium">{entry.age ?? "-"}세</td>
                    <td className="px-6 py-5">
                      <DateCell value={entry.moveInDate ?? "-"} />
                    </td>
                    <td className="px-6 py-5">
                      <DateCell value={entry.moveOutDate ?? "-"} />
                    </td>
                    <td className="px-6 py-5 font-medium text-white">{entry.monthlyRent ?? "-"}</td>
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-2 rounded-lg border border-[#2A2A2A] bg-[#161616] px-3 py-2 text-sm text-gray-200">
                        <CalendarDays className="h-4 w-4 text-gray-500" />
                        {formatPaidMonth(entry.paidMonth)}
                      </div>
                    </td>
                    <td className="px-6 py-5 font-medium text-white">{entry.paidAt ?? "-"}</td>
                    <td className="px-6 py-5">
                      <PaymentStatusBadge status={entry.paymentStatus ?? "paid"} />
                    </td>
                    <td className="px-6 py-5">
                      <button
                        type="button"
                        onClick={() => setSelectedEntry(entry)}
                        className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 text-xs text-gray-300 transition-colors hover:border-indigo-500/50 hover:text-indigo-400"
                      >
                        이력 보기
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        type="button"
                        onClick={() => setEditingEntry(entry)}
                        className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 text-xs text-gray-300 transition-colors hover:border-indigo-500/50 hover:text-indigo-400"
                      >
                        납부 수정
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEntries.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-500">
                      조건에 맞는 입실자가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedEntry && (
        <PaymentHistoryDrawer entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}
      {editingEntry && (
        <PaymentEditModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}

function PaymentHistoryDrawer({ entry, onClose }: { entry: Room; onClose: () => void }) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[#2A2A2A] bg-[#0E0E0E] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-5">
          <div>
            <h3 className="text-base font-semibold text-white">납부 이력</h3>
            <p className="mt-0.5 text-sm text-gray-400">
              {entry.id}호 · {entry.resident}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-[#1A1A1A] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-[#2A2A2A] px-6 py-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-[#1A1A1A] px-4 py-3">
              <p className="text-xs text-gray-500">월세</p>
              <p className="mt-1 text-sm font-semibold text-white">{entry.monthlyRent}</p>
            </div>
            <div className="rounded-lg bg-[#1A1A1A] px-4 py-3">
              <p className="text-xs text-gray-500">입실일</p>
              <p className="mt-1 text-sm font-semibold text-white">{entry.moveInDate}</p>
            </div>
            <div className="rounded-lg bg-[#1A1A1A] px-4 py-3">
              <p className="text-xs text-gray-500">퇴실일</p>
              <p className="mt-1 text-sm font-semibold text-white">{entry.moveOutDate}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-500">납부 현황 차트</p>
            <PaymentHistoryChart history={entry.paymentHistory} />
          </div>
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">월별 납부 내역</p>
            <div className="space-y-3">
              {[...entry.paymentHistory].reverse().map((h) => (
                <PaymentHistoryRow key={h.month} history={h} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PaymentHistoryChart({ history }: { history: PaymentHistoryEntry[] }) {
  const cellBg: Record<PaymentStatus, string> = {
    paid: "bg-emerald-500/20 border-emerald-500/40 hover:bg-emerald-500/30",
    overdue: "bg-rose-500/20 border-rose-500/40 hover:bg-rose-500/30",
    upcoming: "bg-amber-400/20 border-amber-400/40 hover:bg-amber-400/30",
  };
  const dotColor: Record<PaymentStatus, string> = {
    paid: "bg-emerald-400",
    overdue: "bg-rose-400",
    upcoming: "bg-amber-400",
  };
  const statusLabel: Record<PaymentStatus, string> = {
    paid: "납부 완료",
    overdue: "미납",
    upcoming: "납부 예정",
  };

  // 연도별로 그룹핑
  const byYear: Record<string, PaymentHistoryEntry[]> = {};
  for (const h of history) {
    const [year] = h.month.split("-");
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(h);
  }

  return (
    <div className="rounded-xl border border-[#2A2A2A] bg-[#161616] p-4 space-y-4">
      {Object.entries(byYear).map(([year, entries]) => (
        <div key={year}>
          <p className="mb-2 text-xs font-semibold text-gray-400">{year}년</p>
          <div className="grid grid-cols-6 gap-2">
            {entries.map((h) => {
              const [, month] = h.month.split("-");
              return (
                <div
                  key={h.month}
                  className={`group relative flex flex-col items-center justify-center rounded-lg border p-2 transition-colors cursor-default ${cellBg[h.status]}`}
                >
                  <span className="text-[11px] font-semibold text-white">{parseInt(month, 10)}월</span>
                  <div className={`mt-1.5 h-1.5 w-1.5 rounded-full ${dotColor[h.status]}`} />
                  {/* 툴팁 */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-36 -translate-x-1/2 rounded-lg border border-[#2A2A2A] bg-[#0E0E0E] p-2.5 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                    <p className="text-xs font-medium text-white">{year}년 {parseInt(month, 10)}월</p>
                    <p className="mt-1 text-[10px] text-gray-400">{h.amount}</p>
                    <p className="mt-0.5 text-[10px] text-gray-400">
                      {h.paidAt ? `납부일: ${h.paidAt}` : "납부 없음"}
                    </p>
                    <p className={`mt-1.5 text-[10px] font-medium ${
                      h.status === "paid" ? "text-emerald-400" :
                      h.status === "overdue" ? "text-rose-400" : "text-amber-400"
                    }`}>
                      {statusLabel[h.status]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-4 border-t border-[#2A2A2A] pt-3">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-gray-500">납부 완료</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-rose-400" />
          <span className="text-[10px] text-gray-500">미납</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-[10px] text-gray-500">납부 예정</span>
        </div>
      </div>
    </div>
  );
}

function PaymentHistoryRow({ history }: { history: PaymentHistoryEntry }) {
  const [year, month] = history.month.split("-");
  const label = `${year}년 ${parseInt(month, 10)}월`;

  return (
    <div className="flex items-center justify-between rounded-lg border border-[#2A2A2A] bg-[#161616] px-4 py-3">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-0.5 text-xs text-gray-500">
          {history.paidAt ? `납부일: ${history.paidAt}` : "납부 없음"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-300">{history.amount}</span>
        <PaymentStatusBadge status={history.status} />
      </div>
    </div>
  );
}

function formatPaidMonth(paidMonth: string | null): string {
  if (!paidMonth) return "-";
  const match = paidMonth.match(/\d{4}-(\d{2})-(\d{2})/);
  if (match) {
    const month = parseInt(match[1], 10);
    const day = parseInt(match[2], 10);
    return `매월 ${month}월 ${day}일`;
  }
  return paidMonth;
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-indigo-500 text-white" : "text-gray-300 hover:bg-[#222] hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className={`rounded-xl border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${accent}`}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/35 ring-1 ring-white/10">
        {icon}
      </div>
      <p className="text-sm font-medium text-black">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-black">{value}</p>
    </div>
  );
}

function DateCell({ value }: { value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-[#2A2A2A] bg-[#161616] px-3 py-2 text-sm text-gray-200">
      <CalendarDays className="h-4 w-4 text-gray-500" />
      {value}
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        납부 완료
      </span>
    );
  }

  if (status === "overdue") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-400">
        <XCircle className="h-3.5 w-3.5" />
        미납
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
      <Clock3 className="h-3.5 w-3.5" />
      납부 예정
    </span>
  );
}
