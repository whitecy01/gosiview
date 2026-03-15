"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, Home, Search, UserRound, XCircle } from "lucide-react";
import { getOccupiedRooms, type PaymentStatus } from "../lib/mock-data";

type FilterMode = "all" | "overdue" | "paid";

const ledgerEntries = getOccupiedRooms();
const totalResidents = ledgerEntries.length;
const paidResidents = ledgerEntries.filter((entry) => entry.paymentStatus === "paid").length;
const overdueResidents = ledgerEntries.filter((entry) => entry.paymentStatus === "overdue").length;

export default function LedgerList() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const normalizedKeyword = searchKeyword.trim().toLowerCase();
  const filteredEntries = ledgerEntries.filter((entry) => {
    const matchesKeyword = (entry.resident ?? "").toLowerCase().includes(normalizedKeyword);
    const matchesStatus =
      filterMode === "all" ||
      (filterMode === "overdue" && entry.paymentStatus === "overdue") ||
      (filterMode === "paid" && entry.paymentStatus === "paid");

    return matchesKeyword && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                <th className="px-6 py-4 font-medium">입실일</th>
                <th className="px-6 py-4 font-medium">퇴실일</th>
                <th className="px-6 py-4 font-medium">월세</th>
                <th className="px-6 py-4 font-medium">납부 대상 월</th>
                <th className="px-6 py-4 font-medium">월세 납부일</th>
                <th className="px-6 py-4 font-medium">상태</th>
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
                    <DateCell value={entry.moveInDate ?? "-"} />
                  </td>
                  <td className="px-6 py-5">
                    <DateCell value={entry.moveOutDate ?? "-"} />
                  </td>
                  <td className="px-6 py-5 font-medium text-white">{entry.monthlyRent ?? "-"}</td>
                  <td className="px-6 py-5">
                    <div className="inline-flex items-center gap-2 rounded-lg border border-[#2A2A2A] bg-[#161616] px-3 py-2 text-sm text-gray-200">
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                      {entry.paidMonth ?? "-"}
                    </div>
                  </td>
                  <td className="px-6 py-5 font-medium text-white">{entry.paidAt ?? "-"}</td>
                  <td className="px-6 py-5">
                    <PaymentStatusBadge status={entry.paymentStatus ?? "paid"} />
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    조건에 맞는 입실자가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
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
