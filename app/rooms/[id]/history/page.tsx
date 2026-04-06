"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Home, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Banknote, Zap, Clock,
} from "lucide-react";
import {
  ALL_ROOMS,
  ROOM_TENANT_HISTORY,
  MAINTENANCE_BY_ROOM,
  type TenantBar,
} from "../../../lib/mock-data";

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

function ExpandedRow({ t, maintenance }: { t: TenantBar; maintenance: typeof MAINTENANCE_BY_ROOM[string] }) {
  const tenantCost =
    t.electricityHandover?.giroCost != null && t.electricityHandover?.vacancyCost != null
      ? t.electricityHandover.giroCost - t.electricityHandover.vacancyCost
      : null;

  const relatedMaintenance = maintenance.filter((m) => {
    const md = new Date(m.date);
    return md >= new Date(t.moveInDate) && md <= new Date(t.moveOutDate);
  });

  return (
    <tr className="border-t border-[#1E1E1E]">
      <td colSpan={8} className="px-6 py-4 bg-[#0D0D0D]">
        <div className="grid gap-3 sm:grid-cols-3">
          {/* 보증금 */}
          {t.depositTotal != null && (
            <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[#2A2A2A] bg-[#111] px-4 py-2.5">
                <Banknote className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-gray-300">보증금</span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-[#1E1E1E]">
                <div className="px-3 py-2.5">
                  <p className="mb-0.5 text-xs text-gray-500">총액</p>
                  <p className="text-sm font-bold text-white">₩{t.depositTotal.toLocaleString("ko-KR")}</p>
                </div>
                <div className="px-3 py-2.5">
                  <p className="mb-0.5 text-xs text-gray-500">차감</p>
                  <p className={`text-sm font-bold ${(t.depositDeducted ?? 0) > 0 ? "text-rose-400" : "text-gray-600"}`}>
                    {(t.depositDeducted ?? 0) > 0 ? `–₩${(t.depositDeducted ?? 0).toLocaleString("ko-KR")}` : "없음"}
                  </p>
                </div>
                <div className="px-3 py-2.5">
                  <p className="mb-0.5 text-xs text-gray-500">반환</p>
                  <div className="flex items-center gap-1">
                    {t.depositReturned ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-xs text-emerald-400">
                          {t.depositReturnedAt ? fmtDate(t.depositReturnedAt) : "완료"}
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

          {/* 한전 */}
          {t.electricityHandover && (
            <div className="rounded-xl border border-yellow-500/20 overflow-hidden">
              <div className="flex items-center gap-2 border-b border-yellow-500/10 bg-yellow-500/5 px-4 py-2.5">
                <Zap className="h-3.5 w-3.5 text-yellow-400" />
                <span className="text-xs font-semibold text-yellow-400">한전 현금 승계</span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-[#1E1E1E]">
                <div className="px-3 py-2.5">
                  <p className="mb-0.5 text-xs text-gray-500">사용량</p>
                  <p className="text-sm font-bold text-white">
                    {t.electricityHandover.vacancyMeter - t.electricityHandover.moveOutMeter} kWh
                  </p>
                </div>
                {t.electricityHandover.vacancyCost != null && (
                  <div className="px-3 py-2.5">
                    <p className="mb-0.5 text-xs text-gray-500">공백 요금</p>
                    <p className="text-sm font-bold text-white">
                      ₩{t.electricityHandover.vacancyCost.toLocaleString("ko-KR")}
                    </p>
                  </div>
                )}
                {tenantCost != null && (
                  <div className="px-3 py-2.5">
                    <p className="mb-0.5 text-xs text-gray-500">입주자 부담</p>
                    <p className="text-sm font-bold text-yellow-400">₩{tenantCost.toLocaleString("ko-KR")}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 유지보수 */}
          {relatedMaintenance.length > 0 && (
            <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[#2A2A2A] bg-[#111] px-4 py-2.5">
                <Clock className="h-3.5 w-3.5 text-orange-400" />
                <span className="text-xs font-semibold text-gray-300">유지보수</span>
                <span className="ml-auto text-xs text-orange-400 font-semibold">
                  ₩{relatedMaintenance.reduce((s, m) => s + m.amount, 0).toLocaleString("ko-KR")}
                </span>
              </div>
              <div className="divide-y divide-[#1A1A1A]">
                {relatedMaintenance.map((m, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5">
                    <div>
                      <p className="text-xs text-gray-500">{fmtDate(m.date)}</p>
                      <p className="mt-0.5 text-xs text-gray-300">{m.details.join(", ")}</p>
                    </div>
                    <p className="text-sm font-semibold text-orange-400">₩{m.amount.toLocaleString("ko-KR")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

// ────────────── 메인 ──────────────

export default function RoomHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const room = ALL_ROOMS.find((r) => r.id === id);
  const rawHistory: TenantBar[] = ROOM_TENANT_HISTORY[id] ?? [];
  const maintenance = MAINTENANCE_BY_ROOM[id] ?? [];

  const history = useMemo(
    () => [...rawHistory].sort((a, b) => new Date(b.moveInDate).getTime() - new Date(a.moveInDate).getTime()),
    [rawHistory]
  );

  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (!room) {
    return (
      <main className="flex items-center justify-center py-20">
        <p className="text-gray-500">호실을 찾을 수 없습니다.</p>
      </main>
    );
  }

  const totalVacancy = (() => {
    const sorted = [...history].sort((a, b) => new Date(a.moveInDate).getTime() - new Date(b.moveInDate).getTime());
    let days = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = daysBetween(sorted[i].moveOutDate, sorted[i + 1].moveInDate);
      if (gap > 0) days += gap;
    }
    return days;
  })();

  const avgStay = history.length > 0
    ? Math.round(history.reduce((s, t) => s + daysBetween(t.moveInDate, t.moveOutDate), 0) / history.length)
    : 0;

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">

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
          <h1 className="text-xl font-bold text-gray-900">{room.name} 입실 이력</h1>
          <span className="rounded-full border border-[#2A2A2A] px-2.5 py-0.5 text-xs text-gray-500">{room.roomType}</span>
        </div>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "총 입실 횟수", value: `${history.length}건`, color: "text-indigo-400" },
          { label: "총 공실 기간", value: `${totalVacancy}일`, color: "text-gray-400" },
          { label: "평균 거주 기간", value: avgStay > 0 ? `${avgStay}일` : "—", color: "text-emerald-400" },
          { label: "보증금 미반환", value: `${history.filter((t) => !t.depositReturned).length}건`, color: "text-rose-400" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[#2A2A2A] bg-[#111] px-4 py-3.5">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`mt-1.5 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 테이블 */}
      {history.length === 0 ? (
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#111] px-6 py-16 text-center">
          <p className="text-sm text-gray-500">등록된 입실 이력이 없습니다.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2A2A] bg-[#0D0D0D] text-xs text-gray-500">
                <th className="px-4 py-3 text-left font-medium">이름</th>
                <th className="px-4 py-3 text-left font-medium">성별·나이</th>
                <th className="px-4 py-3 text-left font-medium">입실일</th>
                <th className="px-4 py-3 text-left font-medium">퇴실일</th>
                <th className="px-4 py-3 text-left font-medium">거주 기간</th>
                <th className="px-4 py-3 text-left font-medium">월세</th>
                <th className="px-4 py-3 text-left font-medium">보증금 반환</th>
                <th className="px-4 py-3 text-left font-medium w-8" />
              </tr>
            </thead>
            <tbody>
              {history.map((t, i) => {
                const isExpanded = expandedIdx === i;
                const isEven = i % 2 === 0;

                return (
                  <>
                    <tr
                      key={i}
                      onClick={() => setExpandedIdx(isExpanded ? null : i)}
                      className="cursor-pointer border-t border-[#1A1A1A] transition-colors hover:bg-[#161616]"
                      style={{ backgroundColor: isEven ? "#0C0C0C" : "#0A0A0A" }}
                    >
                      {/* 이름 */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              t.gender === "여"
                                ? "bg-rose-500/10 text-rose-400"
                                : "bg-indigo-500/10 text-indigo-400"
                            }`}
                          >
                            {t.name[0]}
                          </div>
                          <span className="font-semibold text-white">{t.name}</span>
                        </div>
                      </td>

                      {/* 성별·나이 */}
                      <td className="px-4 py-3.5">
                        {t.gender && (
                          <span className={`rounded-full border px-2 py-0.5 text-xs ${GENDER_STYLE[t.gender]}`}>
                            {t.gender}{t.age ? ` · ${t.age}세` : ""}
                          </span>
                        )}
                      </td>

                      {/* 입실일 */}
                      <td className="px-4 py-3.5 text-gray-300 tabular-nums">{fmtDate(t.moveInDate)}</td>

                      {/* 퇴실일 */}
                      <td className="px-4 py-3.5 text-gray-300 tabular-nums">{fmtDate(t.moveOutDate)}</td>

                      {/* 거주 기간 */}
                      <td className="px-4 py-3.5 text-indigo-400 font-medium tabular-nums">
                        {fmtStay(t.moveInDate, t.moveOutDate)}
                      </td>

                      {/* 월세 */}
                      <td className="px-4 py-3.5 text-gray-300 tabular-nums">
                        {t.monthlyRent != null ? `₩${t.monthlyRent.toLocaleString("ko-KR")}` : "—"}
                      </td>

                      {/* 보증금 반환 */}
                      <td className="px-4 py-3.5">
                        {t.depositReturned ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-xs text-emerald-400">
                              {t.depositReturnedAt ? fmtDate(t.depositReturnedAt) : "완료"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <XCircle className="h-3.5 w-3.5 text-rose-400" />
                            <span className="text-xs text-rose-400">미반환</span>
                          </div>
                        )}
                      </td>

                      {/* 펼치기 */}
                      <td className="px-4 py-3.5 text-gray-600">
                        {isExpanded
                          ? <ChevronUp className="h-4 w-4" />
                          : <ChevronDown className="h-4 w-4" />}
                      </td>
                    </tr>

                    {isExpanded && (
                      <ExpandedRow key={`exp-${i}`} t={t} maintenance={maintenance} />
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
