"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  X, ExternalLink, Home, Banknote, Calendar, MapPin, Target,
  Plus, Trash2, History, Pencil, StickyNote,
} from "lucide-react";
import {
  type Room,
  type ResidentDetail,
  type RentPayment,
  type DepositDeductionReason,
  type RentPaymentMethod,
  type ResidencePurpose,
  type RealEstateAgency,
  type CashSuccessionRecord,
} from "../lib/mock-data";
import { useRooms } from "@/app/context/RoomsContext";
import {
  fetchCashSuccessions,
  insertCashSuccession,
  updateCashSuccession,
  deleteCashSuccession,
  fetchRentPayments,
  upsertRentPayment,
  fetchDeductions,
  insertDeduction,
  deleteDeductionById,
  updateRoomPrice,
  type DbCashSuccession,
  type DbRentPayment,
  type DbDepositDeduction,
} from "@/app/lib/supabase-data";
import { fromDbCash, toDbCashInput } from "@/app/lib/cash-succession";
import { DEFAULT_PURPOSES, DEFAULT_AGENCIES, PURPOSES_LS_KEY, AGENCIES_LS_KEY } from "@/app/components/OptionsManagerModal";

// ────────────── 상수 ──────────────

const DEDUCTION_REASONS: DepositDeductionReason[] = ["차임", "미납", "공과금정산", "도배", "타일", "시설손상"];
const PAYMENT_METHODS: RentPaymentMethod[] = ["이체(자진발급)", "이체", "현금"];

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

const INPUT = "w-full rounded-lg border border-[#2A2A2A] bg-[#161616] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-indigo-500";

// ────────────── 헬퍼 ──────────────

function fmtDate(d: string) {
  const [y, m, dd] = d.split("-");
  return `${y.slice(2)}/${m}/${dd}`;
}
function fmtMonthKo(m: string) {
  const [y, mo] = m.split("-");
  return `${y}년 ${parseInt(mo)}월`;
}

// ────────────── InfoField ──────────────

function InfoField({ icon, label, value, highlight }: {
  icon: React.ReactNode; label: string; value: string; highlight?: "emerald" | "indigo";
}) {
  const valueColor = highlight === "emerald" ? "text-emerald-400" : highlight === "indigo" ? "text-indigo-400" : "text-white";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-gray-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-sm font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
}

// ────────────── SectionTitle ──────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
      {children}
    </h3>
  );
}

// ────────────── 공과금(현금 승계) 폼 ──────────────

function CashForm({
  value, onChange,
}: {
  value: CashSuccessionRecord;
  onChange: (v: CashSuccessionRecord) => void;
}) {
  const num = (v: string) => (v === "" ? undefined : Number(v));
  const set = (patch: Partial<CashSuccessionRecord>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-sky-400">청구기간</p>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={value.billingStart ?? ""} onChange={(e) => set({ billingStart: e.target.value || undefined })} className={INPUT} />
          <input type="date" value={value.billingEnd ?? ""} onChange={(e) => set({ billingEnd: e.target.value || undefined })} className={INPUT} />
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">총(지로)</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[11px] text-gray-600">금액 (원)</label>
            <input type="number" value={value.totalAmount ?? ""} placeholder="0" className={INPUT}
              onChange={(e) => { const v = num(e.target.value); set({ totalAmount: v, tenantAmount: v != null ? v - (value.landlordAmount ?? 0) : undefined }); }} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-gray-600">사용량 (kWh)</label>
            <input type="number" value={value.totalKwh ?? ""} placeholder="0" className={INPUT}
              onChange={(e) => { const v = num(e.target.value); set({ totalKwh: v, tenantKwh: v != null ? v - (value.landlordKwh ?? 0) : undefined }); }} />
          </div>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">임대인</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[11px] text-gray-600">금액 (원)</label>
            <input type="number" value={value.landlordAmount ?? ""} placeholder="0" className={INPUT}
              onChange={(e) => { const v = num(e.target.value); set({ landlordAmount: v, tenantAmount: v != null ? (value.totalAmount ?? 0) - v : undefined }); }} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-gray-600">사용량 (kWh)</label>
            <input type="number" value={value.landlordKwh ?? ""} placeholder="0" className={INPUT}
              onChange={(e) => { const v = num(e.target.value); set({ landlordKwh: v, tenantKwh: v != null ? (value.totalKwh ?? 0) - v : undefined }); }} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-gray-600">검침 시작</label>
            <input type="number" value={value.landlordStartMeter ?? ""} placeholder="0.00" className={INPUT}
              onChange={(e) => {
                const s = num(e.target.value);
                const kwh = s != null && value.landlordEndMeter != null ? Math.max(0, value.landlordEndMeter - s) : value.landlordKwh;
                set({ landlordStartMeter: s, landlordKwh: kwh, tenantKwh: kwh != null ? (value.totalKwh ?? 0) - kwh : undefined });
              }} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-gray-600">검침 종료</label>
            <input type="number" value={value.landlordEndMeter ?? ""} placeholder="0.00" className={INPUT}
              onChange={(e) => {
                const en = num(e.target.value);
                const kwh = en != null && value.landlordStartMeter != null ? Math.max(0, en - value.landlordStartMeter) : value.landlordKwh;
                set({ landlordEndMeter: en, landlordKwh: kwh, tenantKwh: kwh != null ? (value.totalKwh ?? 0) - kwh : undefined });
              }} />
          </div>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-sky-400">임차인 <span className="font-normal normal-case text-gray-600">자동 계산</span></p>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" readOnly value={value.tenantAmount ?? ""} placeholder="금액 (원)" className={`${INPUT} font-semibold`} />
          <input type="number" readOnly value={value.tenantKwh ?? ""} placeholder="kWh" className={`${INPUT} font-semibold`} />
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">납부 정보</p>
        <div className="space-y-2">
          <input type="date" value={value.paymentDate ?? ""} onChange={(e) => set({ paymentDate: e.target.value || undefined })} className={INPUT} />
          <div className="grid grid-cols-2 gap-2">
            <input value={value.bankName ?? ""} onChange={(e) => set({ bankName: e.target.value || undefined })} placeholder="은행" className={INPUT} />
            <input value={value.accountHolder ?? ""} onChange={(e) => set({ accountHolder: e.target.value || undefined })} placeholder="예금주" className={INPUT} />
          </div>
          <input value={value.accountNumber ?? ""} onChange={(e) => set({ accountNumber: e.target.value || undefined })} placeholder="계좌번호" className={INPUT} />
          <input value={value.notes ?? ""} onChange={(e) => set({ notes: e.target.value || undefined })} placeholder="메모" className={INPUT} />
        </div>
      </div>
    </div>
  );
}

// ────────────── 메인 컴포넌트 ──────────────

interface Props {
  room: Room | null;
  onClose: () => void;
}

export default function RoomDetailDrawer({ room, onClose }: Props) {
  const router = useRouter();
  const { contracts, editContract } = useRooms();
  const [detail, setDetail] = useState<ResidentDetail | null>(null);
  const [cashSuccessions, setCashSuccessions] = useState<DbCashSuccession[]>([]);
  const [dbRentPayments, setDbRentPayments] = useState<DbRentPayment[]>([]);
  const [dbDeductions, setDbDeductions] = useState<DbDepositDeduction[]>([]);

  // 기본 정보 수정
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState<Partial<ResidentDetail>>({});
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editGender, setEditGender] = useState<"남" | "여" | null>(null);
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoSaveError, setInfoSaveError] = useState<string | null>(null);
  const [allPurposes, setAllPurposes] = useState<string[]>(DEFAULT_PURPOSES);
  const [allAgencies, setAllAgencies] = useState<string[]>(DEFAULT_AGENCIES);

  // 메모 (기본 정보와 독립 섹션)
  const [editingMemo, setEditingMemo] = useState(false);
  const [memoDraft, setMemoDraft] = useState("");
  const [memoSaving, setMemoSaving] = useState(false);

  // 공과금(현금 승계) 편집
  const [showCashNew, setShowCashNew] = useState(false);
  const [newCashForm, setNewCashForm] = useState<CashSuccessionRecord>({});
  const [cashEditIdx, setCashEditIdx] = useState<number | null>(null);
  const [cashEditForm, setCashEditForm] = useState<CashSuccessionRecord>({});

  // 입실자 상세 페이지와 동일: 오늘 기준 현재 계약(room.contractId) 우선
  const activeContract = useMemo(() => {
    if (!room) return null;
    if (room.contractId) return contracts.find((c) => c.id === room.contractId) ?? null;
    return contracts.find((c) => c.room_id === room.id && c.status === "scheduled") ?? null;
  }, [room?.id, room?.contractId, contracts]); // eslint-disable-line react-hooks/exhaustive-deps

  // room이 바뀔 때마다 detail과 폼 상태 초기화
  useEffect(() => {
    setShowDepForm(false);
    setDepAmount("");
    setPayingMonthIdx(null);
    setPayDate("");
    setPayAmount("");
    setEditingInfo(false);
    setEditingMemo(false);
    setShowCashNew(false);
    setNewCashForm({});
    setCashEditIdx(null);

    if (!room || !activeContract) {
      setDetail(null);
      setCashSuccessions([]);
      setDbDeductions([]);
      return;
    }

    fetchCashSuccessions(activeContract.id).then(setCashSuccessions).catch(console.error);
    fetchDeductions(activeContract.id).then(setDbDeductions).catch(console.error);

    fetchRentPayments(activeContract.id).then((rows) => {
      setDbRentPayments(rows);
      setDetail((prev) => {
        if (!prev) return prev;
        const merged = prev.rentPayments.map((p) => {
          const db = rows.find((r) => r.month === p.month);
          if (!db) return p;
          return {
            ...p,
            paidAt: db.paid_at,
            amount: db.amount,
            paymentMethod: db.payment_method as RentPaymentMethod | null,
            status: db.status,
          };
        });
        return { ...prev, rentPayments: merged };
      });
    }).catch(console.error);

    const moveIn = activeContract.actual_move_in_date ?? "";
    const moveOut = activeContract.actual_move_out_date ?? activeContract.contract_start_end ?? "";
    const rent = activeContract.monthly_rent ?? 0;
    const dueDay = activeContract.payment_due_day ?? (moveIn ? new Date(moveIn).getDate() : 1);

    const rentPayments: RentPayment[] = [];
    if (moveIn && moveOut) {
      let cur = new Date(moveIn.slice(0, 7) + "-01");
      const end = new Date(moveOut.slice(0, 7) + "-01");
      while (cur <= end) {
        const monthStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`;
        rentPayments.push({ month: monthStr, paidAt: null, amount: rent, paymentMethod: null, status: "upcoming" });
        cur.setMonth(cur.getMonth() + 1);
      }
    }

    setDetail({
      roomId: room.id,
      purpose: (activeContract.purpose as ResidencePurpose) ?? undefined,
      utilityIncludedRent: Math.round(room.monthlyPriceRaw / 10000),
      actualMonthlyRent: Math.round(rent / 10000),
      paymentDueDay: dueDay,
      contractMoveInDate: activeContract.contract_start_date,
      actualMoveInDate: activeContract.actual_move_in_date ?? undefined,
      actualMoveOutDate: activeContract.actual_move_out_date ?? undefined,
      contractDeposit: {
        amount: activeContract.contract_deposit ?? 0,
      },
      realEstateAgency: (activeContract.real_estate_agency as RealEstateAgency) ?? undefined,
      depositTotal: activeContract.deposit_total ?? 0,
      depositDeductions: [],
      depositReturn: {
        returned: activeContract.deposit_returned ?? false,
        returnedAt: activeContract.deposit_returned_at ?? null,
      },
      rentPayments,
      cashSuccessions: [],
      memo: activeContract.memo ?? undefined,
      contractMonths: activeContract.contract_months ?? undefined,
    });
  }, [room?.id, activeContract?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 보증금 폼
  const [showDepForm, setShowDepForm] = useState(false);
  const [depDate, setDepDate] = useState(new Date().toISOString().slice(0, 10));
  const [depAmount, setDepAmount] = useState("");
  const [depReason, setDepReason] = useState<DepositDeductionReason>("차임");

  // 보증금 반환
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().slice(0, 10));

  // 월세
  const [payingMonthIdx, setPayingMonthIdx] = useState<number | null>(null);
  const [payDate, setPayDate] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<RentPaymentMethod>("이체");

  useEffect(() => {
    try {
      const p = localStorage.getItem(PURPOSES_LS_KEY);
      if (p) setAllPurposes(JSON.parse(p));
      const a = localStorage.getItem(AGENCIES_LS_KEY);
      if (a) setAllAgencies(JSON.parse(a));
    } catch { /* ignore */ }
  }, []);

  const isOpen = !!room;

  // ── 기본 정보 수정 ──

  function startEditInfo() {
    if (!detail) return;
    setInfoForm({ ...detail });
    setEditName(activeContract?.name ?? "");
    setEditPhone(activeContract?.phone ?? "");
    setEditBirthDate(activeContract?.birth_date ?? "");
    setEditGender(activeContract?.gender ?? null);
    setInfoSaveError(null);
    setEditingInfo(true);
  }

  async function saveInfo() {
    if (!detail || !activeContract || !room) return;
    setInfoSaving(true);
    setInfoSaveError(null);
    try {
      // 금액(관포) 변경 시 방 DB도 함께 업데이트
      if (infoForm.utilityIncludedRent != null && infoForm.utilityIncludedRent !== detail.utilityIncludedRent) {
        await updateRoomPrice(room.id, infoForm.utilityIncludedRent * 10000);
      }
      await editContract(activeContract.id, {
        name: editName || activeContract.name,
        phone: editPhone || activeContract.phone,
        birth_date: editBirthDate || activeContract.birth_date || null,
        gender: editGender,
        payment_due_day: infoForm.paymentDueDay ?? null,
        monthly_rent: infoForm.actualMonthlyRent ? infoForm.actualMonthlyRent * 10000 : null,
        contract_start_date: infoForm.contractMoveInDate ?? activeContract.contract_start_date,
        contract_start_end: infoForm.contractEndDate || null,
        actual_move_in_date: infoForm.actualMoveInDate || null,
        actual_move_out_date: infoForm.actualMoveOutDate || null,
        contract_deposit: infoForm.contractDeposit?.amount ?? null,
        earnest_money: infoForm.earnestMoney ?? null,
        deposit_total: infoForm.contractDeposit?.amount ?? null,
        purpose: infoForm.purpose || null,
        real_estate_agency: infoForm.realEstateAgency || null,
        contract_months: infoForm.contractMonths ?? null,
      });
      setDetail((prev) => prev ? {
        ...prev,
        ...infoForm,
        depositTotal: infoForm.contractDeposit?.amount ?? prev.depositTotal,
      } : prev);
      setEditingInfo(false);
    } catch (e) {
      setInfoSaveError(e instanceof Error ? e.message : "DB 저장 실패. 다시 시도해 주세요.");
    } finally {
      setInfoSaving(false);
    }
  }

  // ── 메모 ──

  async function saveMemo() {
    if (!activeContract) return;
    setMemoSaving(true);
    try {
      const value = memoDraft.trim() || null;
      await editContract(activeContract.id, { memo: value });
      setDetail((p) => p ? { ...p, memo: value ?? undefined } : p);
      setEditingMemo(false);
    } finally {
      setMemoSaving(false);
    }
  }

  async function deleteMemo() {
    if (!activeContract) return;
    setMemoSaving(true);
    try {
      await editContract(activeContract.id, { memo: null });
      setDetail((p) => p ? { ...p, memo: undefined } : p);
      setEditingMemo(false);
    } finally {
      setMemoSaving(false);
    }
  }

  // ── 공과금(현금 승계) ──

  async function addNewCash() {
    if (!activeContract) return;
    const saved = await insertCashSuccession(toDbCashInput(activeContract.id, newCashForm));
    setCashSuccessions((prev) => [...prev, saved]);
    setNewCashForm({});
    setShowCashNew(false);
  }

  function startCashEdit(i: number) {
    setCashEditIdx(i);
    setCashEditForm(fromDbCash(cashSuccessions[i]));
  }

  async function saveCashEdit() {
    if (cashEditIdx === null || !activeContract) return;
    const rec = cashSuccessions[cashEditIdx];
    const updated = await updateCashSuccession(rec.id, toDbCashInput(activeContract.id, cashEditForm));
    setCashSuccessions((prev) => prev.map((r, idx) => idx === cashEditIdx ? updated : r));
    setCashEditIdx(null);
    setCashEditForm({});
  }

  async function deleteCash(i: number) {
    const rec = cashSuccessions[i];
    if (!rec) return;
    await deleteCashSuccession(rec.id);
    setCashSuccessions((prev) => prev.filter((_, idx) => idx !== i));
    if (cashEditIdx === i) setCashEditIdx(null);
  }

  async function addDeduction() {
    if (!detail || !activeContract || !depDate || !depAmount) return;
    const amount = Number(depAmount);
    const saved = await insertDeduction({
      contract_id: activeContract.id,
      date: depDate,
      amount,
      reason: depReason,
    });
    setDbDeductions((prev) => [...prev, saved]);
    // deposit_total = 잔여 보증금, 차감 시 줄어듦
    const newTotal = detail.depositTotal - amount;
    setDetail((p) => p ? { ...p, depositTotal: newTotal } : p);
    await editContract(activeContract.id, { deposit_total: newTotal });
    setDepAmount("");
    setShowDepForm(false);
  }

  async function deleteDeduction(deductionId: string) {
    const target = dbDeductions.find((d) => d.id === deductionId);
    if (!target || !activeContract || !detail) return;
    await deleteDeductionById(deductionId);
    setDbDeductions((prev) => prev.filter((d) => d.id !== deductionId));
    // 차감 취소 → deposit_total 복구
    const newTotal = detail.depositTotal + target.amount;
    setDetail((p) => p ? { ...p, depositTotal: newTotal } : p);
    await editContract(activeContract.id, { deposit_total: newTotal });
  }
  async function addPayment(monthIdx: number) {
    if (!detail || !payDate || !payAmount || !activeContract) return;
    const payment = detail.rentPayments[monthIdx];
    if (!payment) return;
    await upsertRentPayment({
      contract_id: activeContract.id,
      month: payment.month,
      amount: Number(payAmount),
      paid_at: payDate,
      payment_method: payMethod,
      status: "paid",
    });
    setDetail((p) => p ? { ...p, rentPayments: p.rentPayments.map((r, i) => i === monthIdx ? { ...r, paidAt: payDate, amount: Number(payAmount), paymentMethod: payMethod, status: "paid" as const } : r) } : p);
    setPayingMonthIdx(null);
  }

  const depositDeducted = dbDeductions.reduce((s, d) => s + d.amount, 0);
  const depositRemaining = detail?.depositTotal ?? 0; // deposit_total = 잔여 보증금

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[560px] flex-col border-l border-[#2A2A2A] bg-[#0E0E0E] shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {!room ? null : (
          <>
            {/* 헤더 */}
            <div className="flex shrink-0 items-center justify-between border-b border-[#2A2A2A] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                    room.status === "occupied" ? "border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
                    : room.status === "vacant" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : "border-rose-500/20 bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {room.status === "occupied" ? "입실 중" : room.status === "vacant" ? "공실" : "계약"}
                </span>
                <h2 className="text-base font-bold text-white">{room.name}</h2>
                {room.resident && <span className="text-sm text-gray-400">· {room.resident}</span>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/rooms/${room.id}/history`)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 text-xs text-gray-400 transition-colors hover:text-white"
                >
                  <History className="h-3.5 w-3.5" />이력
                </button>
                {room.status === "occupied" && (
                  <button
                    onClick={() => router.push(`/residents/${room.id}`)}
                    className="flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 text-xs text-gray-400 transition-colors hover:text-white"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />상세 페이지
                  </button>
                )}
                <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-[#1A1A1A] hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 컨텐츠 */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#2A2A2A]">

              {/* 비어있는 방 */}
              {room.status !== "occupied" && (
                <div className="p-5 space-y-4">
                  <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Home className="h-4 w-4 text-gray-500 shrink-0" />
                      <span className="text-gray-400 w-20">방 유형</span>
                      <span className="text-white font-medium">{room.roomType}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Banknote className="h-4 w-4 text-gray-500 shrink-0" />
                      <span className="text-gray-400 w-20">기준 가격</span>
                      <span className="text-white font-medium">{room.roomPrice}</span>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-500">
                    {room.status === "vacant" ? "현재 비어 있는 방으로 입실 가능합니다." : "이 방은 현재 계약 진행 중입니다."}
                  </p>
                </div>
              )}

              {/* 기본 정보 */}
              {room.status === "occupied" && (
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">기본 정보</h3>
                    {detail && !editingInfo && (
                      <button
                        onClick={startEditInfo}
                        className="flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2.5 py-1 text-xs text-gray-400 transition-colors hover:text-white"
                      >
                        <Pencil className="h-3 w-3" />수정
                      </button>
                    )}
                  </div>

                  {/* 기본 정보 수정 폼 */}
                  {detail && editingInfo && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">이름</label>
                          <input value={editName} onChange={(e) => setEditName(e.target.value)} className={INPUT} />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">연락처</label>
                          <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className={INPUT} />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">출생년도</label>
                          <input value={editBirthDate} onChange={(e) => setEditBirthDate(e.target.value)} placeholder="1998" className={INPUT} />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">성별</label>
                          <select value={editGender ?? ""} onChange={(e) => setEditGender((e.target.value || null) as "남" | "여" | null)} className={INPUT}>
                            <option value="">-</option>
                            <option value="남">남</option>
                            <option value="여">여</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">금액(관포) <span className="text-gray-600">만원</span></label>
                          <input type="number" step={0.1} value={infoForm.utilityIncludedRent ?? ""} onChange={(e) => setInfoForm((f) => ({ ...f, utilityIncludedRent: Number(e.target.value) }))} className={INPUT} />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">실제 납부 월세 <span className="text-gray-600">만원</span></label>
                          <input type="number" step={0.1} value={infoForm.actualMonthlyRent ?? ""} onChange={(e) => setInfoForm((f) => ({ ...f, actualMonthlyRent: Number(e.target.value) }))} className={INPUT} />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">납부 대상 월일</label>
                          <input type="number" min={1} max={31} value={infoForm.paymentDueDay ?? ""} onChange={(e) => setInfoForm((f) => ({ ...f, paymentDueDay: Number(e.target.value) }))} className={INPUT} />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">거주 목적</label>
                          <select value={infoForm.purpose ?? ""} onChange={(e) => setInfoForm((f) => ({ ...f, purpose: (e.target.value || undefined) as ResidencePurpose }))} className={INPUT}>
                            <option value="">-</option>
                            {allPurposes.map((p) => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">부동산</label>
                          <select value={infoForm.realEstateAgency ?? ""} onChange={(e) => setInfoForm((f) => ({ ...f, realEstateAgency: (e.target.value || undefined) as RealEstateAgency }))} className={INPUT}>
                            <option value="">-</option>
                            {allAgencies.map((a) => <option key={a} value={a}>{a}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">계약일</label>
                          <input type="date" value={infoForm.contractMoveInDate ?? ""} onChange={(e) => setInfoForm((f) => ({ ...f, contractMoveInDate: e.target.value }))} className={INPUT} />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">계약 개월 수 <span className="text-gray-600">개월</span></label>
                          <input type="number" min={1} value={infoForm.contractMonths ?? ""} onChange={(e) => setInfoForm((f) => ({ ...f, contractMonths: e.target.value ? Number(e.target.value) : undefined }))} placeholder="24" className={INPUT} />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">입실일</label>
                          <input type="date" value={infoForm.actualMoveInDate ?? ""} onChange={(e) => setInfoForm((f) => ({ ...f, actualMoveInDate: e.target.value }))} className={INPUT} />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">계약 만료일</label>
                          <input type="date" value={infoForm.contractEndDate ?? ""} onChange={(e) => setInfoForm((f) => ({ ...f, contractEndDate: e.target.value }))} className={INPUT} />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">확정 퇴실일</label>
                          <input type="date" value={infoForm.actualMoveOutDate ?? ""} onChange={(e) => setInfoForm((f) => ({ ...f, actualMoveOutDate: e.target.value }))} className={INPUT} />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">계약금 <span className="text-gray-600">원</span></label>
                          <input type="number" step={1000} value={infoForm.earnestMoney ?? ""} onChange={(e) => setInfoForm((f) => ({ ...f, earnestMoney: e.target.value ? Number(e.target.value) : undefined }))} className={INPUT} />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">보증금 <span className="text-gray-600">원</span></label>
                          <input type="number" step={1000} value={infoForm.contractDeposit?.amount ?? ""} onChange={(e) => setInfoForm((f) => ({ ...f, contractDeposit: { amount: Number(e.target.value) } }))} className={INPUT} />
                        </div>
                      </div>

                      {infoSaveError && <p className="text-xs text-rose-400">{infoSaveError}</p>}

                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingInfo(false)} className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-xs text-gray-400 hover:text-white">취소</button>
                        <button onClick={saveInfo} disabled={infoSaving} className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-400 disabled:opacity-40">
                          {infoSaving ? "저장 중…" : "저장"}
                        </button>
                      </div>
                    </div>
                  )}

                  {!editingInfo && <>
                  {/* 프로필 */}
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10 text-lg font-bold text-indigo-400">
                      {room.resident?.[0] ?? "?"}
                    </div>
                    <div>
                      <p className="font-bold text-white">{room.resident ?? "-"}</p>
                      <div className="mt-1 flex items-center gap-2">
                        {room.gender && (
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${room.gender === "남" ? "border-blue-500/20 bg-blue-500/10 text-blue-400" : "border-pink-500/20 bg-pink-500/10 text-pink-400"}`}>
                            {room.gender}
                          </span>
                        )}
                        {room.birth_date && <span className="text-xs text-gray-500">{new Date().getFullYear() - parseInt(room.birth_date.slice(0, 4), 10)}세</span>}
                        <span className="text-xs text-teal-400">{room.phone ?? "-"}</span>
                      </div>
                    </div>
                  </div>

                  {detail ? (
                    <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                      <InfoField icon={<Home className="h-3.5 w-3.5" />} label="호실" value={`${room.id}호`} />
                      <InfoField icon={<Home className="h-3.5 w-3.5" />} label="방 유형" value={room.roomType} />
                      <InfoField icon={<Banknote className="h-3.5 w-3.5" />} label="금액(관포)" value={`${detail.utilityIncludedRent}만원`} highlight="emerald" />
                      <InfoField icon={<Banknote className="h-3.5 w-3.5" />} label="실제 납부 월세" value={`${detail.actualMonthlyRent}만원`} highlight="emerald" />
                      <InfoField icon={<Calendar className="h-3.5 w-3.5" />} label="입실일" value={room.moveInDate ? fmtDate(room.moveInDate) : "-"} />
                      <InfoField icon={<Calendar className="h-3.5 w-3.5" />} label="확정 퇴실일" value={room.moveOutDate ? fmtDate(room.moveOutDate) : "-"} />
                      <InfoField icon={<Calendar className="h-3.5 w-3.5" />} label="계약 개월 수" value={detail.contractMonths != null ? `${detail.contractMonths}개월` : "-"} highlight="indigo" />
                      <InfoField icon={<Calendar className="h-3.5 w-3.5" />} label="납부 대상 월일" value={`매월 ${detail.paymentDueDay}일`} highlight="indigo" />
                      <InfoField icon={<Target className="h-3.5 w-3.5" />} label="거주 목적" value={detail.purpose} />
                      <InfoField icon={<MapPin className="h-3.5 w-3.5" />} label="부동산" value={detail.realEstateAgency} />
                      <InfoField icon={<Banknote className="h-3.5 w-3.5" />} label="보증금" value={`₩${detail.contractDeposit.amount.toLocaleString("ko-KR")}`} />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-5 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Home className="h-4 w-4 text-gray-500 shrink-0" />
                        <span className="text-gray-400 w-20">방 유형</span>
                        <span className="text-white font-medium">{room.roomType}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Banknote className="h-4 w-4 text-gray-500 shrink-0" />
                        <span className="text-gray-400 w-20">기준 가격</span>
                        <span className="text-white font-medium">{room.roomPrice}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500 shrink-0" />
                        <span className="text-gray-400 w-20">입실일</span>
                        <span className="text-white font-medium">{room.moveInDate ?? "-"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500 shrink-0" />
                        <span className="text-gray-400 w-20">확정 퇴실일</span>
                        <span className="text-white font-medium">{room.moveOutDate ?? "-"}</span>
                      </div>
                    </div>
                  )}
                  </>}
                </div>
              )}

              {/* 메모 */}
              {room.status === "occupied" && detail && (
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <StickyNote className="h-3.5 w-3.5 text-amber-400" />
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">메모</h3>
                    </div>
                    {!editingMemo && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setMemoDraft(detail.memo ?? ""); setEditingMemo(true); }}
                          className="flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2.5 py-1 text-xs text-gray-400 transition-colors hover:text-white"
                        >
                          <Pencil className="h-3 w-3" />{detail.memo ? "수정" : "작성"}
                        </button>
                        {detail.memo && (
                          <button
                            onClick={deleteMemo}
                            disabled={memoSaving}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-gray-600 transition-colors hover:border-rose-500/40 hover:text-rose-400 disabled:opacity-40"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {editingMemo ? (
                    <div className="space-y-3">
                      <textarea
                        autoFocus
                        rows={5}
                        value={memoDraft}
                        onChange={(e) => setMemoDraft(e.target.value)}
                        placeholder="입실자 관련 메모를 입력하세요"
                        className={`${INPUT} resize-y`}
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingMemo(false)} disabled={memoSaving} className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-xs text-gray-400 hover:text-white disabled:opacity-40">취소</button>
                        <button onClick={saveMemo} disabled={memoSaving} className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-400 disabled:opacity-40">
                          {memoSaving ? "저장 중…" : "저장"}
                        </button>
                      </div>
                    </div>
                  ) : detail.memo ? (
                    <p className="whitespace-pre-wrap rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] px-3 py-2.5 text-sm leading-relaxed text-gray-200">{detail.memo}</p>
                  ) : (
                    <p className="py-4 text-center text-sm text-gray-500">작성된 메모가 없습니다.</p>
                  )}
                </div>
              )}

              {/* 보증금 */}
              {room.status === "occupied" && detail && (
                <div className="p-5 space-y-4">
                  <SectionTitle>보증금</SectionTitle>
                  {/* 요약 */}
                  <div className="grid grid-cols-3 divide-x divide-[#2A2A2A] rounded-xl border border-[#2A2A2A] bg-[#111] overflow-hidden">
                    {[
                      { label: "총 보증금", value: `₩${(detail.contractDeposit?.amount ?? 0).toLocaleString("ko-KR")}`, color: "text-white" },
                      { label: "총 차감액", value: `₩${depositDeducted.toLocaleString("ko-KR")}`, color: "text-rose-400" },
                      { label: "잔여 보증금", value: `₩${depositRemaining.toLocaleString("ko-KR")}`, color: "text-emerald-400" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="px-3 py-4 text-center">
                        <p className="text-[11px] text-gray-500">{label}</p>
                        <p className={`mt-1 text-sm font-bold ${color}`}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* 차감 추가 버튼 */}
                  <button
                    onClick={() => setShowDepForm((v) => !v)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 py-2 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-500/20"
                  >
                    <Plus className="h-3.5 w-3.5" />차감 내역 추가
                  </button>

                  {showDepForm && (
                    <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">날짜</label>
                          <input type="date" value={depDate} onChange={(e) => setDepDate(e.target.value)} className={INPUT} />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">금액 (원)</label>
                          <input type="number" value={depAmount} onChange={(e) => setDepAmount(e.target.value)} placeholder="50000" className={INPUT} />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs text-gray-400">차감 이유</label>
                        <select value={depReason} onChange={(e) => setDepReason(e.target.value as DepositDeductionReason)} className={INPUT}>
                          {DEDUCTION_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setShowDepForm(false)} className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-xs text-gray-400 hover:text-white">취소</button>
                        <button onClick={addDeduction} disabled={!depDate || !depAmount} className="rounded-lg bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-400 disabled:opacity-40">저장</button>
                      </div>
                    </div>
                  )}

                  {/* 이력 목록 */}
                  <div className="rounded-xl border border-[#2A2A2A] bg-[#111] divide-y divide-[#1E1E1E] overflow-hidden">
                    {dbDeductions.length === 0 ? (
                      <p className="py-8 text-center text-sm text-gray-500">차감 이력이 없습니다.</p>
                    ) : (
                      dbDeductions.map((d) => (
                        <div key={d.id} className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-gray-400">{fmtDate(d.date)}</span>
                            <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${REASON_COLOR[d.reason] ?? "border-gray-500/20 bg-gray-500/10 text-gray-400"}`}>{d.reason}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-rose-400">-₩{d.amount.toLocaleString("ko-KR")}</span>
                            <button onClick={() => deleteDeduction(d.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 hover:bg-rose-500/10 hover:text-rose-400">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 보증금 반환 */}
                  <div className="rounded-xl border border-[#2A2A2A] bg-[#111] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${detail.depositReturn.returned ? "bg-emerald-400" : "bg-gray-600"}`} />
                        <span className="text-sm font-semibold text-white">보증금 반환</span>
                        {detail.depositReturn.returned && (
                          <span className="text-xs text-emerald-400 font-medium">{fmtDate(detail.depositReturn.returnedAt!)}</span>
                        )}
                      </div>
                      {detail.depositReturn.returned ? (
                        <button
                          onClick={async () => {
                            setDetail((p) => p ? { ...p, depositReturn: { returned: false, returnedAt: null } } : p);
                            if (activeContract) {
                              await editContract(activeContract.id, { deposit_returned: false, deposit_returned_at: null });
                            }
                          }}
                          className="text-xs text-gray-500 hover:text-rose-400 transition-colors"
                        >
                          취소
                        </button>
                      ) : (
                        <button
                          onClick={() => { setShowReturnForm((v) => !v); setReturnDate(new Date().toISOString().slice(0, 10)); }}
                          className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        >
                          반환 완료 처리
                        </button>
                      )}
                    </div>

                    {!detail.depositReturn.returned && showReturnForm && (
                      <div className="px-4 py-3 space-y-3 bg-[#0E0E0E]">
                        <div>
                          <label className="mb-1.5 block text-xs text-gray-400">반환 날짜</label>
                          <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className={INPUT} />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setShowReturnForm(false)} className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-xs text-gray-400 hover:text-white">취소</button>
                          <button
                            onClick={async () => {
                              setDetail((p) => p ? { ...p, depositReturn: { returned: true, returnedAt: returnDate } } : p);
                              setShowReturnForm(false);
                              if (activeContract) {
                                await editContract(activeContract.id, {
                                  deposit_returned: true,
                                  deposit_returned_at: returnDate,
                                });
                              }
                            }}
                            disabled={!returnDate}
                            className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-400 disabled:opacity-40"
                          >
                            저장
                          </button>
                        </div>
                      </div>
                    )}

                    {detail.depositReturn.returned && (
                      <div className="px-4 py-3 flex items-center gap-2">
                        <span className="text-xs text-gray-500">잔여 보증금</span>
                        <span className="text-sm font-bold text-emerald-400">₩{depositRemaining.toLocaleString("ko-KR")}</span>
                        <span className="text-xs text-gray-600">반환 완료</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 월세 납부 */}
              {room.status === "occupied" && detail && (
                <div>
                  <div className="px-5 pt-5">
                    <SectionTitle>월세 납부</SectionTitle>
                  </div>
                  {detail.rentPayments.length === 0 && (
                    <p className="px-5 pb-5 text-sm text-gray-500">납부 내역이 없습니다.</p>
                  )}
                  <div className="divide-y divide-[#1E1E1E]">
                  {detail.rentPayments.map((p, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${p.status === "paid" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : p.status === "overdue" ? "border-rose-500/20 bg-rose-500/10 text-rose-400" : "border-gray-500/20 bg-gray-500/10 text-gray-400"}`}>
                            {p.status === "paid" ? "납부완료" : p.status === "overdue" ? "미납" : "예정"}
                          </span>
                          <span className="text-sm font-medium text-white">{fmtMonthKo(p.month)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {p.paidAt && <span className="text-xs text-gray-500">{fmtDate(p.paidAt)}</span>}
                          {p.paymentMethod && (
                            <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${METHOD_COLOR[p.paymentMethod] ?? "border-gray-500/20 bg-gray-500/10 text-gray-400"}`}>{p.paymentMethod}</span>
                          )}
                          <span className="text-sm font-semibold text-white">₩{p.amount.toLocaleString("ko-KR")}</span>
                          {p.status !== "paid" && (
                            <button
                              onClick={() => {
                                if (payingMonthIdx === i) { setPayingMonthIdx(null); return; }
                                setPayingMonthIdx(i); setPayDate(new Date().toISOString().slice(0, 10)); setPayAmount(String(p.amount)); setPayMethod("이체");
                              }}
                              className="flex items-center gap-1 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-400 hover:bg-indigo-500/20"
                            >
                              <Plus className="h-3 w-3" />입력
                            </button>
                          )}
                        </div>
                      </div>
                      {payingMonthIdx === i && (
                        <div className="border-t border-[#2A2A2A] bg-[#0E0E0E] px-5 pb-4 pt-3 space-y-3">
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
                            <button onClick={() => setPayingMonthIdx(null)} className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-xs text-gray-400 hover:text-white">취소</button>
                            <button onClick={() => addPayment(i)} disabled={!payDate || !payAmount} className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-400 disabled:opacity-40">저장</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  </div>
                </div>
              )}

              {/* 공과금 — 현금 승계 */}
              {room.status === "occupied" && (
                <div className="p-5 space-y-3">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">공과금</h3>
                    {!showCashNew && cashEditIdx === null && (
                      <button
                        onClick={() => { setShowCashNew(true); setNewCashForm({}); }}
                        className="flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-400 hover:bg-sky-500/20"
                      >
                        <Plus className="h-3 w-3" />추가
                      </button>
                    )}
                  </div>

                  {/* 새 항목 추가 */}
                  {showCashNew && (
                    <div className="rounded-xl border border-sky-500/30 bg-[#111] p-4 space-y-3">
                      <CashForm value={newCashForm} onChange={setNewCashForm} />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setShowCashNew(false); setNewCashForm({}); }} className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-xs text-gray-400 hover:text-white">취소</button>
                        <button onClick={addNewCash} className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-400">저장</button>
                      </div>
                    </div>
                  )}

                  {cashSuccessions.length === 0 && !showCashNew && (
                    <p className="py-8 text-center text-sm text-gray-500">현금 승계 내역이 없습니다.</p>
                  )}

                  {cashSuccessions.map((cs, i) => (
                    <div key={cs.id} className="rounded-xl border border-[#2A2A2A] bg-[#111] p-4 space-y-2">
                      {cashEditIdx === i ? (
                        <>
                          <CashForm value={cashEditForm} onChange={setCashEditForm} />
                          <div className="flex justify-end gap-2">
                            <button onClick={() => { setCashEditIdx(null); setCashEditForm({}); }} className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-xs text-gray-400 hover:text-white">취소</button>
                            <button onClick={saveCashEdit} className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-400">저장</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-sky-400">청구기간</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-300">{cs.billing_start ?? "-"} ~ {cs.billing_end ?? "-"}</span>
                              <button onClick={() => startCashEdit(i)} className="flex h-6 w-6 items-center justify-center rounded text-gray-600 hover:bg-[#222] hover:text-indigo-400">
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button onClick={() => deleteCash(i)} className="flex h-6 w-6 items-center justify-center rounded text-gray-600 hover:bg-rose-500/10 hover:text-rose-400">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 divide-x divide-[#2A2A2A] rounded-lg border border-[#2A2A2A] overflow-hidden">
                            {[
                              { label: "임대인", value: cs.landlord_amount, color: "text-white" },
                              { label: "총(지로)", value: cs.total_amount, color: "text-white" },
                              { label: "임차인", value: cs.tenant_amount, color: "text-sky-400" },
                            ].map(({ label, value, color }) => (
                              <div key={label} className="px-2 py-2 text-center">
                                <p className="text-[10px] text-gray-500">{label}</p>
                                <p className={`mt-0.5 text-xs font-bold ${color}`}>
                                  {value != null ? `₩${value.toLocaleString("ko-KR")}` : "-"}
                                </p>
                              </div>
                            ))}
                          </div>
                          {cs.payment_date && (
                            <p className="text-[11px] text-gray-500 text-right">납부일 {cs.payment_date}</p>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </>
  );
}
