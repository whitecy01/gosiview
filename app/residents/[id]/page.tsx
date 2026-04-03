"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
  Zap,
  Home,
  Calendar,
  Banknote,
  MapPin,
  Target,
} from "lucide-react";
import {
  ALL_ROOMS,
  RESIDENT_DETAIL_BY_ROOM,
  type ResidentDetail,
  type DepositDeductionReason,
  type RentPaymentMethod,
  type ResidencePurpose,
  type RealEstateAgency,
} from "../../lib/mock-data";

// ────────────── 상수 ──────────────

const PURPOSES: ResidencePurpose[] = [
  "공시생(임용)", "공시생(일행)", "공시생(소방)", "공시생(경찰)",
  "세무·회계·계리", "취준생", "수능", "직장",
];

const REAL_ESTATES: RealEstateAgency[] = [
  "부동산 A", "부동산 B", "부동산 C", "직거래",
];

const DEDUCTION_REASONS: DepositDeductionReason[] = [
  "차임", "미납", "공과금정산", "도배", "타일", "시설손상",
];

const PAYMENT_METHODS: RentPaymentMethod[] = [
  "이체(자진발급)", "이체", "현금",
];

const REASON_COLOR: Record<string, string> = {
  차임: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  미납: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  공과금정산: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  도배: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  타일: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  시설손상: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const METHOD_COLOR: Record<string, string> = {
  "이체(자진발급)": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  이체: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  현금: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

// ────────────── 헬퍼 ──────────────

function fmtDate(d: string) {
  const [y, m, dd] = d.split("-");
  return `${y.slice(2)}/${m}/${dd}`;
}

function fmtMonthKo(m: string) {
  const [y, mo] = m.split("-");
  return `${y}년 ${parseInt(mo)}월`;
}

// ────────────── 공통 스타일 ──────────────

const CARD = "rounded-xl border border-[#2A2A2A] bg-[#111] overflow-hidden";
const SECTION_HEADER = "flex items-center justify-between px-6 py-4 border-b border-[#2A2A2A]";
const INPUT = "w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-indigo-500";

// ────────────── 메인 컴포넌트 ──────────────

export default function ResidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const room = ALL_ROOMS.find((r) => r.id === id);
  const [detail, setDetail] = useState<ResidentDetail | null>(
    () => RESIDENT_DETAIL_BY_ROOM[id] ?? null
  );

  // 기본 정보 수정 모드
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState<Partial<ResidentDetail>>({});

  // 보증금 폼
  const [showDepForm, setShowDepForm] = useState(false);
  const [depDate, setDepDate] = useState(new Date().toISOString().slice(0, 10));
  const [depAmount, setDepAmount] = useState("");
  const [depReason, setDepReason] = useState<DepositDeductionReason>("차임");

  // 한전
  const [editElec, setEditElec] = useState(false);
  const [elecScheduled, setElecScheduled] = useState("");
  const [elecActual, setElecActual] = useState("");
  const [elecUsage, setElecUsage] = useState("");

  // 월세 납부
  const [payingMonthIdx, setPayingMonthIdx] = useState<number | null>(null);
  const [payDate, setPayDate] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<RentPaymentMethod>("이체");

  if (!room) {
    return (
      <main className="flex w-full items-center justify-center py-20">
        <p className="text-gray-500">호실을 찾을 수 없습니다.</p>
      </main>
    );
  }

  // ── 기본 정보 수정 ──

  function startEditInfo() {
    if (!detail) return;
    setInfoForm({ ...detail });
    setEditingInfo(true);
  }

  function saveInfo() {
    if (!detail) return;
    setDetail((prev) => prev ? { ...prev, ...infoForm } : prev);
    setEditingInfo(false);
  }

  // ── 보증금 차감 ──

  function addDeduction() {
    if (!detail || !depDate || !depAmount) return;
    setDetail((prev) =>
      prev
        ? {
            ...prev,
            depositDeductions: [
              ...prev.depositDeductions,
              { date: depDate, amount: Number(depAmount), reason: depReason },
            ],
          }
        : prev
    );
    setDepAmount("");
    setShowDepForm(false);
  }

  function deleteDeduction(i: number) {
    setDetail((prev) =>
      prev ? { ...prev, depositDeductions: prev.depositDeductions.filter((_, idx) => idx !== i) } : prev
    );
  }

  // ── 한전 ──

  function saveElec() {
    if (!detail || !elecScheduled || !elecActual || !elecUsage) return;
    setDetail((prev) =>
      prev
        ? {
            ...prev,
            electricityHandover: {
              scheduledMoveOutDate: elecScheduled,
              actualMoveOutDate: elecActual,
              usageAmount: Number(elecUsage),
            },
          }
        : prev
    );
    setEditElec(false);
  }

  // ── 월세 납부 입력 ──

  function addPayment(monthIdx: number) {
    if (!detail || !payDate || !payAmount) return;
    setDetail((prev) =>
      prev
        ? {
            ...prev,
            rentPayments: prev.rentPayments.map((p, i) =>
              i === monthIdx
                ? { ...p, paidAt: payDate, amount: Number(payAmount), paymentMethod: payMethod, status: "paid" as const }
                : p
            ),
          }
        : prev
    );
    setPayingMonthIdx(null);
  }

  const depositDeducted = detail?.depositDeductions.reduce((s, d) => s + d.amount, 0) ?? 0;
  const depositRemaining = (detail?.depositTotal ?? 0) - depositDeducted;

  return (
    <main className="w-full space-y-6 pb-12">

      {/* ── 헤더 ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/residents")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl font-extrabold tracking-tight text-[#111827]">{id}호</h1>
          {room.resident && (
            <span className="text-xl font-extrabold tracking-tight text-[#111827]">· {room.resident}</span>
          )}
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
              room.status === "occupied"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : room.status === "vacant"
                ? "border-gray-500/20 bg-gray-500/10 text-gray-400"
                : "border-amber-500/20 bg-amber-500/10 text-amber-400"
            }`}
          >
            {room.status === "occupied" ? "입실중" : room.status === "vacant" ? "공실" : "점검"}
          </span>
          <span className="rounded-full border border-[#2A2A2A] bg-[#1A1A1A] px-2.5 py-1 text-xs text-gray-400">
            {room.roomType}
          </span>
        </div>
      </div>

      {!detail ? (
        <div className={CARD}>
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            등록된 상세 정보가 없습니다.
          </div>
        </div>
      ) : (
        <>
          {/* ── 기본 정보 ── */}
          <div className={CARD}>
            <div className={SECTION_HEADER}>
              <div>
                <h2 className="text-base font-semibold text-white">기본 정보</h2>
                <p className="mt-0.5 text-xs text-gray-500">입실자의 계약 및 거주 기본 정보</p>
              </div>
              <button
                onClick={editingInfo ? saveInfo : startEditInfo}
                className={
                  editingInfo
                    ? "flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20"
                    : "flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-white"
                }
              >
                {editingInfo ? (
                  <>✓ 저장</>
                ) : (
                  <><Pencil className="h-3.5 w-3.5" /> 수정</>
                )}
              </button>
            </div>

            {editingInfo ? (
              /* ── 수정 폼 ── */
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-400">금액(관포) <span className="text-gray-600">만원</span></label>
                    <input
                      type="number"
                      value={infoForm.utilityIncludedRent ?? ""}
                      onChange={(e) => setInfoForm((f) => ({ ...f, utilityIncludedRent: Number(e.target.value) }))}
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-400">실제 납부 월세 <span className="text-gray-600">만원</span></label>
                    <input
                      type="number"
                      value={infoForm.actualMonthlyRent ?? ""}
                      onChange={(e) => setInfoForm((f) => ({ ...f, actualMonthlyRent: Number(e.target.value) }))}
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-400">납부 대상 월일</label>
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 text-xs text-gray-500">매월</span>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={infoForm.paymentDueDay ?? ""}
                        onChange={(e) => setInfoForm((f) => ({ ...f, paymentDueDay: Number(e.target.value) }))}
                        className={INPUT}
                      />
                      <span className="shrink-0 text-xs text-gray-500">일</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-400">계약 만료일</label>
                    <input
                      type="date"
                      value={infoForm.contractExpiry ?? ""}
                      onChange={(e) => setInfoForm((f) => ({ ...f, contractExpiry: e.target.value }))}
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-400">계약금 날짜</label>
                    <input
                      type="date"
                      value={infoForm.contractDeposit?.date ?? ""}
                      onChange={(e) =>
                        setInfoForm((f) => ({
                          ...f,
                          contractDeposit: { date: e.target.value, amount: f.contractDeposit?.amount ?? 0 },
                        }))
                      }
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-400">계약금 금액 <span className="text-gray-600">원</span></label>
                    <input
                      type="number"
                      value={infoForm.contractDeposit?.amount ?? ""}
                      onChange={(e) =>
                        setInfoForm((f) => ({
                          ...f,
                          contractDeposit: { date: f.contractDeposit?.date ?? "", amount: Number(e.target.value) },
                        }))
                      }
                      className={INPUT}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-400">거주 목적</label>
                    <select
                      value={infoForm.purpose ?? ""}
                      onChange={(e) => setInfoForm((f) => ({ ...f, purpose: e.target.value as ResidencePurpose }))}
                      className={INPUT}
                    >
                      {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-400">부동산</label>
                    <select
                      value={infoForm.realEstateAgency ?? ""}
                      onChange={(e) => setInfoForm((f) => ({ ...f, realEstateAgency: e.target.value as RealEstateAgency }))}
                      className={INPUT}
                    >
                      {REAL_ESTATES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingInfo(false)} className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-xs text-gray-400 transition-colors hover:text-white">취소</button>
                  <button onClick={saveInfo} className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-400">저장</button>
                </div>
              </div>
            ) : (
              /* ── 조회 뷰 ── */
              <div className="p-6">
                {/* 입실자 프로필 */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10 text-xl font-bold text-indigo-400">
                    {room.resident?.[0] ?? "?"}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{room.resident ?? "-"}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      {room.gender && (
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${room.gender === "남" ? "border-blue-500/20 bg-blue-500/10 text-blue-400" : "border-pink-500/20 bg-pink-500/10 text-pink-400"}`}>
                          {room.gender}
                        </span>
                      )}
                      {room.age && <span className="text-xs text-gray-500">{room.age}세</span>}
                      <span className="text-xs text-teal-400">{room.phone ?? "-"}</span>
                    </div>
                  </div>
                </div>
                {/* 정보 그리드 */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
                  <InfoField icon={<Home className="h-3.5 w-3.5" />} label="호실" value={`${id}호`} />
                  <InfoField icon={<Home className="h-3.5 w-3.5" />} label="방 유형" value={room.roomType} />
                  <InfoField icon={<Banknote className="h-3.5 w-3.5" />} label="금액(관포)" value={`${detail.utilityIncludedRent}만원`} highlight="emerald" />
                  <InfoField icon={<Banknote className="h-3.5 w-3.5" />} label="실제 납부 월세" value={`${detail.actualMonthlyRent}만원`} highlight="emerald" />
                  <InfoField icon={<Calendar className="h-3.5 w-3.5" />} label="입실일" value={room.moveInDate ? fmtDate(room.moveInDate) : "-"} />
                  <InfoField icon={<Calendar className="h-3.5 w-3.5" />} label="퇴실일" value={room.moveOutDate ? fmtDate(room.moveOutDate) : "-"} />
                  <InfoField icon={<Calendar className="h-3.5 w-3.5" />} label="계약 만료일" value={fmtDate(detail.contractExpiry)} />
                  <InfoField icon={<Calendar className="h-3.5 w-3.5" />} label="납부 대상 월일" value={`매월 ${detail.paymentDueDay}일`} highlight="indigo" />
                  <InfoField icon={<Target className="h-3.5 w-3.5" />} label="거주 목적" value={detail.purpose} />
                  <InfoField icon={<Banknote className="h-3.5 w-3.5" />} label="계약금" value={`${fmtDate(detail.contractDeposit.date)} · ₩${detail.contractDeposit.amount.toLocaleString("ko-KR")}`} />
                  <InfoField icon={<MapPin className="h-3.5 w-3.5" />} label="부동산" value={detail.realEstateAgency} />
                </div>
              </div>
            )}
          </div>

          {/* ── 보증금 관리 이력 ── */}
          <div className={CARD}>
            <div className={SECTION_HEADER}>
              <div>
                <h2 className="text-base font-semibold text-white">보증금 관리 이력</h2>
                <p className="mt-0.5 text-xs text-gray-500">보증금 차감 내역 및 잔여 현황</p>
              </div>
              <button
                onClick={() => setShowDepForm((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-500/20"
              >
                <Plus className="h-3.5 w-3.5" />차감 추가
              </button>
            </div>

            {/* 요약 카드 */}
            <div className="grid grid-cols-3 divide-x divide-[#2A2A2A] border-b border-[#2A2A2A]">
              {[
                { label: "총 보증금", value: `₩${detail.depositTotal.toLocaleString("ko-KR")}`, color: "text-white" },
                { label: "총 차감액", value: `₩${depositDeducted.toLocaleString("ko-KR")}`, color: "text-rose-400" },
                { label: "잔여 보증금", value: `₩${depositRemaining.toLocaleString("ko-KR")}`, color: "text-emerald-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="px-6 py-4 text-center">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className={`mt-1 text-base font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {showDepForm && (
              <div className="border-b border-[#2A2A2A] bg-[#0E0E0E] px-6 py-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-400">차감 내역 추가</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-400">날짜</label>
                    <input type="date" value={depDate} onChange={(e) => setDepDate(e.target.value)} className={INPUT} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-400">금액 (원)</label>
                    <input type="number" value={depAmount} onChange={(e) => setDepAmount(e.target.value)} placeholder="50000" className={INPUT} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-400">차감 이유</label>
                    <select value={depReason} onChange={(e) => setDepReason(e.target.value as DepositDeductionReason)} className={INPUT}>
                      {DEDUCTION_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowDepForm(false)} className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-xs text-gray-400 transition-colors hover:text-white">취소</button>
                  <button onClick={addDeduction} disabled={!depDate || !depAmount} className="rounded-lg bg-rose-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-40">저장</button>
                </div>
              </div>
            )}

            <div className="divide-y divide-[#1E1E1E]">
              {detail.depositDeductions.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-gray-500">차감 이력이 없습니다.</div>
              ) : (
                detail.depositDeductions.map((d, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-gray-400">{fmtDate(d.date)}</span>
                      <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${REASON_COLOR[d.reason] ?? "border-gray-500/20 bg-gray-500/10 text-gray-400"}`}>
                        {d.reason}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-rose-400">-₩{d.amount.toLocaleString("ko-KR")}</span>
                      <button onClick={() => deleteDeduction(i)} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-rose-500/10 hover:text-rose-400">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── 월세 납부 관리 ── */}
          <div className={CARD}>
            <div className={SECTION_HEADER}>
              <div>
                <h2 className="text-base font-semibold text-white">월세 납부 관리</h2>
                <p className="mt-0.5 text-xs text-gray-500">월별 납부 내역 및 상태 · 매월 {detail.paymentDueDay}일 기준</p>
              </div>
            </div>
            <div className="divide-y divide-[#1E1E1E]">
              {detail.rentPayments.map((p, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          p.status === "paid"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : p.status === "overdue"
                            ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                            : "border-gray-500/20 bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {p.status === "paid" ? "납부완료" : p.status === "overdue" ? "미납" : "납부예정"}
                      </span>
                      <span className="text-sm font-medium text-white">{fmtMonthKo(p.month)}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      {p.paidAt && <span className="text-xs text-gray-500">{fmtDate(p.paidAt)}</span>}
                      {p.paymentMethod && (
                        <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${METHOD_COLOR[p.paymentMethod] ?? "border-gray-500/20 bg-gray-500/10 text-gray-400"}`}>
                          {p.paymentMethod}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-white">₩{p.amount.toLocaleString("ko-KR")}</span>
                      {p.status !== "paid" && (
                        <button
                          onClick={() => {
                            if (payingMonthIdx === i) { setPayingMonthIdx(null); return; }
                            setPayingMonthIdx(i);
                            setPayDate(new Date().toISOString().slice(0, 10));
                            setPayAmount(String(p.amount));
                            setPayMethod("이체");
                          }}
                          className="flex items-center gap-1 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20"
                        >
                          <Plus className="h-3 w-3" />입력
                        </button>
                      )}
                    </div>
                  </div>
                  {payingMonthIdx === i && (
                    <div className="border-t border-[#2A2A2A] bg-[#0E0E0E] px-6 pb-4 pt-3 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">납부 날짜</label>
                          <input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className={INPUT} />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">금액 (원)</label>
                          <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className={INPUT} />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">결제 방식</label>
                          <select value={payMethod} onChange={(e) => setPayMethod(e.target.value as RentPaymentMethod)} className={INPUT}>
                            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setPayingMonthIdx(null)} className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-xs text-gray-400 transition-colors hover:text-white">취소</button>
                        <button onClick={() => addPayment(i)} disabled={!payDate || !payAmount} className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40">저장</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── 공과금 처리 ── */}
          <div className="grid grid-cols-1 gap-6">

            {/* 한전 */}
            <div className={CARD}>
              <div className={SECTION_HEADER}>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <div>
                    <h2 className="text-base font-semibold text-white">한전 현금 승계</h2>
                    <p className="mt-0.5 text-xs text-gray-500">퇴실일 기준 한전 처리</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (detail.electricityHandover) {
                      setElecScheduled(detail.electricityHandover.scheduledMoveOutDate);
                      setElecActual(detail.electricityHandover.actualMoveOutDate);
                      setElecUsage(String(detail.electricityHandover.usageAmount));
                    } else {
                      setElecScheduled(room.moveOutDate ?? "");
                      setElecActual("");
                      setElecUsage("");
                    }
                    setEditElec((v) => !v);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-1.5 text-xs font-medium text-yellow-400 transition-colors hover:bg-yellow-500/20"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {detail.electricityHandover ? "수정" : "등록"}
                </button>
              </div>

              {editElec ? (
                <div className="px-5 py-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs text-gray-400">계약 퇴실일</label>
                      <input type="date" value={elecScheduled} onChange={(e) => setElecScheduled(e.target.value)} className={INPUT} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs text-gray-400">실제 퇴실일</label>
                      <input type="date" value={elecActual} onChange={(e) => setElecActual(e.target.value)} className={INPUT} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-400">한전 금액 (원)</label>
                    <input type="number" value={elecUsage} onChange={(e) => setElecUsage(e.target.value)} placeholder="35000" className={INPUT} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditElec(false)} className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-xs text-gray-400 transition-colors hover:text-white">취소</button>
                    <button onClick={saveElec} disabled={!elecScheduled || !elecActual || !elecUsage} className="rounded-lg bg-yellow-500 px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-40">저장</button>
                  </div>
                </div>
              ) : detail.electricityHandover ? (
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-[#1A1A1A] px-4 py-3">
                      <p className="mb-1 text-xs text-gray-500">계약 퇴실일</p>
                      <p className="text-sm font-semibold text-white">{fmtDate(detail.electricityHandover.scheduledMoveOutDate)}</p>
                    </div>
                    <div className="rounded-lg bg-[#1A1A1A] px-4 py-3">
                      <p className="mb-1 text-xs text-gray-500">실제 퇴실일</p>
                      <p className="text-sm font-semibold text-white">{fmtDate(detail.electricityHandover.actualMoveOutDate)}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-4 py-3">
                    <p className="mb-1 text-xs text-gray-500">승계 한전 금액</p>
                    <p className="text-lg font-bold text-yellow-400">₩{detail.electricityHandover.usageAmount.toLocaleString("ko-KR")}</p>
                    <p className="mt-1 text-xs text-gray-600">다음 입실자 월세에서 차감됩니다.</p>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-10 text-center">
                  <Zap className="mx-auto mb-3 h-8 w-8 text-gray-600" />
                  <p className="text-sm text-gray-500">한전 승계 정보가 없습니다.</p>
                  <p className="mt-1 text-xs text-gray-600">퇴실 시 한전 금액을 등록해주세요.</p>
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </main>
  );
}

function InfoField({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: "emerald" | "indigo";
}) {
  const valueColor =
    highlight === "emerald" ? "text-emerald-400" :
    highlight === "indigo"  ? "text-indigo-400"  :
    "text-white";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-gray-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-base font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
}

