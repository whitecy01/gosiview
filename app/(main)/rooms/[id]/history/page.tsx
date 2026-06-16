"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Home, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Banknote, RotateCcw, Loader2, LogOut, Eye,
} from "lucide-react";
import { useRooms } from "@/app/context/RoomsContext";
import { useEffectiveRooms } from "@/app/context/useEffectiveRooms";
import { fetchRoomHistory, updateContract, type DbContract } from "@/app/lib/supabase-data";
import ContractDetailPanel from "@/app/components/ContractDetailPanel";

// ────────────── 헬퍼 ──────────────

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function fmtDate(d: string) {
  const [y, m, dd] = d.split("-");
  return `${y}.${m}.${dd}`;
}

function fmtStay(from: string, to: string) {
  const total = daysBetween(from, to);
  const months = Math.floor(total / 30);
  const days = total % 30;
  if (months > 0 && days > 0) return `${months}개월 ${days}일`;
  if (months > 0) return `${months}개월`;
  return `${days}일`;
}

const GENDER_STYLE = {
  남: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  여: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

// ────────────── 확장 행 ──────────────

function ExpandedRow({
  contract,
  onRestore,
  restoring,
}: {
  contract: DbContract;
  onRestore: () => void;
  restoring: boolean;
}) {
  return (
    <tr className="border-t border-[#1E1E1E]">
      <td colSpan={10} className="px-6 py-4 bg-[#0D0D0D]">
        <div className="grid gap-3 sm:grid-cols-3">
          {/* 보증금 */}
          {contract.deposit_total != null && (
            <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[#2A2A2A] bg-[#111] px-4 py-2.5">
                <Banknote className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-gray-300">보증금</span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-[#1E1E1E]">
                <div className="px-3 py-2.5">
                  <p className="mb-0.5 text-xs text-gray-500">총액</p>
                  <p className="text-sm font-bold text-white">₩{contract.deposit_total.toLocaleString("ko-KR")}</p>
                </div>
                <div className="px-3 py-2.5">
                  <p className="mb-0.5 text-xs text-gray-500">반환</p>
                  <div className="flex items-center gap-1">
                    {contract.deposit_returned ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-xs text-emerald-400">
                          {contract.deposit_returned_at ? fmtDate(contract.deposit_returned_at) : "완료"}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5 text-rose-400" />
                        <span className="text-xs text-rose-400">미반환</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 계약 정보 */}
          <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[#2A2A2A] bg-[#111] px-4 py-2.5">
              <Home className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-gray-300">계약 정보</span>
            </div>
            <div className="divide-y divide-[#1E1E1E]">
              {contract.purpose && (
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-500">거주 목적</p>
                  <p className="text-xs text-white mt-0.5">{contract.purpose}</p>
                </div>
              )}
              {contract.real_estate_agency && (
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-500">부동산</p>
                  <p className="text-xs text-white mt-0.5">{contract.real_estate_agency}</p>
                </div>
              )}
              {contract.contract_deposit != null && (
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-500">보증금</p>
                  <p className="text-xs text-white mt-0.5">₩{contract.contract_deposit.toLocaleString("ko-KR")}</p>
                </div>
              )}
            </div>
          </div>

          {/* 액션 */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex flex-col justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-indigo-400 mb-1">다시 입실 처리</p>
              <p className="text-xs text-gray-500">
                이 계약을 입실 중 상태로 복원합니다.
                퇴실 처리 취소 또는 재입실 시 사용하세요.
              </p>
            </div>
            <button
              onClick={onRestore}
              disabled={restoring}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-400 hover:bg-indigo-500/20 transition-colors disabled:opacity-40"
            >
              {restoring ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
              {restoring ? "처리 중…" : "다시 입실 처리"}
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ────────────── 메인 ──────────────

export default function RoomHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { rooms } = useRooms();
  const { effectiveRooms, refetch, todayStr } = useEffectiveRooms();

  const room = effectiveRooms.find((r) => r.id === id) ?? rooms.find((r) => r.id === id);

  const [history, setHistory] = useState<DbContract[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [detailContract, setDetailContract] = useState<DbContract | null>(null);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await fetchRoomHistory(id, todayStr);
      setHistory(data);
    } catch (e) {
      setHistoryError(e instanceof Error ? e.message : "이력을 불러오지 못했습니다.");
    } finally {
      setHistoryLoading(false);
    }
  }, [id, todayStr]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function handleRestore(contract: DbContract) {
    setRestoringId(contract.id);
    try {
      await updateContract(contract.id, {
        status: 'scheduled',
        actual_move_out_date: null,
      });
      await Promise.all([loadHistory(), refetch()]);
      setExpandedIdx(null);
    } finally {
      setRestoringId(null);
    }
  }

  async function handleMarkCompleted(contract: DbContract) {
    setRestoringId(contract.id);
    try {
      const moveOut = contract.actual_move_out_date;
      await updateContract(contract.id, {
        status: 'completed',
        actual_move_out_date: contract.actual_move_out_date ?? moveOut ?? undefined,
      });
      await Promise.all([loadHistory(), refetch()]);
    } finally {
      setRestoringId(null);
    }
  }

  const totalVacancy = (() => {
    const sorted = [...history].sort((a, b) => {
      const aDate = a.actual_move_in_date ?? "";
      const bDate = b.actual_move_in_date ?? "";
      return aDate.localeCompare(bDate);
    });
    let days = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      const aOut = sorted[i].actual_move_out_date ?? sorted[i].contract_start_end;
      const bIn = sorted[i + 1].actual_move_in_date;
      if (aOut && bIn) {
        const gap = daysBetween(aOut, bIn);
        if (gap > 0) days += gap;
      }
    }
    return days;
  })();

  const avgStay = history.length > 0
    ? Math.round(
        history.reduce((s, c) => {
          const moveIn = c.actual_move_in_date;
          const moveOut = c.actual_move_out_date ?? c.contract_start_end;
          return s + (moveIn && moveOut ? daysBetween(moveIn, moveOut) : 0);
        }, 0) / history.length
      )
    : 0;

  return (
    <>
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">

        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A2A2A] text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <Home className="h-4 w-4 text-indigo-400" />
            <h1 className="text-xl font-bold text-black">{id}호 입실 이력</h1>
            {room && <span className="rounded-full border border-[#2A2A2A] px-2.5 py-0.5 text-xs text-gray-500">{room.roomType}</span>}
          </div>
        </div>

        {/* 요약 */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "총 입실 횟수", value: `${history.length}건`, color: "text-indigo-400" },
            { label: "총 공실 기간", value: `${totalVacancy}일`, color: "text-gray-400" },
            { label: "평균 거주 기간", value: avgStay > 0 ? `${avgStay}일` : "—", color: "text-emerald-400" },
            { label: "보증금 미반환", value: `${history.filter((c) => !c.deposit_returned).length}건`, color: "text-rose-400" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-[#2A2A2A] bg-[#111] px-4 py-3.5">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`mt-1.5 text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* 테이블 */}
        {historyLoading ? (
          <div className="flex items-center justify-center rounded-2xl border border-[#2A2A2A] bg-[#111] py-16">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
          </div>
        ) : historyError ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-6 py-8 text-center">
            <p className="text-sm text-rose-400">{historyError}</p>
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#111] px-6 py-16 text-center">
            <p className="text-sm text-gray-500">퇴실 처리된 이력이 없습니다.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A2A2A] bg-[#0D0D0D] text-xs text-gray-500">
                  <th className="px-4 py-3 text-left font-medium">이름</th>
                  <th className="px-4 py-3 text-left font-medium">성별·나이</th>
                  <th className="px-4 py-3 text-left font-medium">입실일</th>
                  <th className="px-4 py-3 text-left font-medium">확정 퇴실일</th>
                  <th className="px-4 py-3 text-left font-medium">거주 기간</th>
                  <th className="px-4 py-3 text-left font-medium">월세</th>
                  <th className="px-4 py-3 text-left font-medium">보증금 반환</th>
                  <th className="px-4 py-3 text-left font-medium">퇴실 상태</th>
                  <th className="px-4 py-3 text-left font-medium">상세</th>
                  <th className="px-4 py-3 text-left font-medium w-8" />
                </tr>
              </thead>
              <tbody>
                {history.map((contract, i) => {
                  const isExpanded = expandedIdx === i;
                  const moveIn = contract.actual_move_in_date ?? "";
                  const moveOut = contract.actual_move_out_date;

                  return (
                    <>
                      <tr
                        key={contract.id}
                        onClick={() => setExpandedIdx(isExpanded ? null : i)}
                        className="cursor-pointer border-t border-[#1A1A1A] transition-colors hover:bg-[#161616]"
                        style={{ backgroundColor: i % 2 === 0 ? "#0C0C0C" : "#0A0A0A" }}
                      >
                        {/* 이름 */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${contract.gender === "여" ? "bg-rose-500/10 text-rose-400" : "bg-indigo-500/10 text-indigo-400"}`}>
                              {contract.name[0]}
                            </div>
                            <span className="font-semibold text-white">{contract.name}</span>
                          </div>
                        </td>

                        {/* 성별·나이 */}
                        <td className="px-4 py-3.5">
                          {contract.gender && (
                            <span className={`rounded-full border px-2 py-0.5 text-xs ${GENDER_STYLE[contract.gender]}`}>
                              {contract.gender}{contract.birth_date ? ` · ${new Date().getFullYear() - parseInt(contract.birth_date.slice(0, 4), 10)}세` : ""}
                            </span>
                          )}
                        </td>

                        {/* 입실일 */}
                        <td className="px-4 py-3.5 text-gray-300 tabular-nums">{fmtDate(moveIn)}</td>

                        {/* 퇴실일 */}
                        <td className="px-4 py-3.5 text-gray-300 tabular-nums">
                          {moveOut ? fmtDate(moveOut) : <span className="text-gray-600">—</span>}
                        </td>

                        {/* 거주 기간 */}
                        <td className="px-4 py-3.5 text-indigo-400 font-medium tabular-nums">
                          {moveOut ? fmtStay(moveIn, moveOut) : <span className="text-gray-600">—</span>}
                        </td>

                        {/* 월세 */}
                        <td className="px-4 py-3.5 text-gray-300 tabular-nums">
                          {contract.monthly_rent != null ? `₩${contract.monthly_rent.toLocaleString("ko-KR")}` : "—"}
                        </td>

                        {/* 보증금 반환 */}
                        <td className="px-4 py-3.5">
                          {contract.deposit_returned ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-xs text-emerald-400">
                                {contract.deposit_returned_at ? fmtDate(contract.deposit_returned_at) : "완료"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <XCircle className="h-3.5 w-3.5 text-rose-400" />
                              <span className="text-xs text-rose-400">미반환</span>
                            </div>
                          )}
                        </td>

                        {/* 퇴실 상태 */}
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          {contract.status === 'completed' ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />퇴실 처리
                            </span>
                          ) : (
                            <button
                              onClick={() => handleMarkCompleted(contract)}
                              disabled={restoringId === contract.id}
                              className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-40"
                            >
                              {restoringId === contract.id
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <LogOut className="h-3 w-3" />}
                              {restoringId === contract.id ? "처리 중…" : "미처리 → 퇴실"}
                            </button>
                          )}
                        </td>

                        {/* 상세 보기 */}
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setDetailContract(contract)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#2A2A2A] bg-[#111] px-2.5 py-1.5 text-xs text-gray-400 hover:border-indigo-500/40 hover:text-indigo-400 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            상세
                          </button>
                        </td>

                        {/* 펼치기 */}
                        <td className="px-4 py-3.5 text-gray-600">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </td>
                      </tr>

                      {isExpanded && (
                        <ExpandedRow
                          key={`exp-${contract.id}`}
                          contract={contract}
                          onRestore={() => handleRestore(contract)}
                          restoring={restoringId === contract.id}
                        />
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {detailContract && (
        <ContractDetailPanel
          contract={detailContract}
          onClose={() => setDetailContract(null)}
        />
      )}
    </>
  );
}
