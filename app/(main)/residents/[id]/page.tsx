"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
  Home,
  Calendar,
  Banknote,
  MapPin,
  Target,
  Printer,
} from "lucide-react";
import {
  RESIDENT_DETAIL_BY_ROOM,
  ROOM_TYPE_INFO,
  type ResidentDetail,
  type RentPayment,
  type DepositDeductionReason,
  type RentPaymentMethod,
  type ResidencePurpose,
  type RealEstateAgency,
  type CashSuccessionRecord,
} from "@/app/lib/mock-data";
import { useRooms } from "@/app/context/RoomsContext";
import { useEffectiveRooms } from "@/app/context/useEffectiveRooms";
import { calcEndDate as calcMoveOutDate, formatPhone } from "@/app/lib/utils";

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
  const { contracts, loading, editContract } = useRooms();
  const { effectiveRooms, todayStr } = useEffectiveRooms();

  const room = effectiveRooms.find((r) => r.id === id);
  // room.contractId는 useEffectiveRooms가 오늘 날짜 기준으로 계산한 현재 입실자의 계약 ID
  const activeContract = (room?.contractId
    ? contracts.find((c) => c.id === room.contractId)
    : contracts.find((c) => c.room_id === id && c.status === "scheduled")
  ) ?? null;
  const [detail, setDetail] = useState<ResidentDetail | null>(
    () => RESIDENT_DETAIL_BY_ROOM[id] ?? null
  );

  // 계약이 바뀌면 detail 리셋 후 재초기화 (날짜 변경으로 입실자 전환 시 반영)
  useEffect(() => {
    if (!loading) {
      setDetail(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeContract?.id]);

  // 데이터 로드 완료 후 detail 자동 초기화
  useEffect(() => {
    if (!loading && detail === null) initDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, detail, activeContract]);

  // 계약 데이터로 detail 초기화
  function initDetail() {
    const moveIn = activeContract?.actual_move_in_date ?? activeContract?.contract_start_date ?? "";
    const moveOut = activeContract?.actual_move_out_date ?? activeContract?.contract_end_date ?? "";
    const rent = activeContract?.monthly_rent ?? 0;
    const dueDay = moveIn ? new Date(moveIn).getDate() : 1;

    // 입실일~퇴실일 사이 월별 납부 항목 자동 생성
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
      roomId: id,
      purpose: (activeContract?.purpose as ResidencePurpose) ?? undefined,
      utilityIncludedRent: Math.round((ROOM_TYPE_INFO[room?.roomType ?? "Cozy"]?.price ?? 0) / 10000),
      actualMonthlyRent: Math.round(rent / 10000),
      paymentDueDay: dueDay,
      contractMoveInDate: activeContract?.contract_start_date,
      contractExpiry: activeContract?.contract_end_date ?? "",
      actualMoveInDate: activeContract?.actual_move_in_date ?? undefined,
      actualMoveOutDate: activeContract?.actual_move_out_date ?? undefined,
      contractDeposit: {
        date: activeContract?.contract_start_date ?? "",
        amount: activeContract?.contract_deposit ?? 0,
      },
      realEstateAgency: (activeContract?.real_estate_agency as RealEstateAgency) ?? undefined,
      depositTotal: activeContract?.deposit_total ?? 0,
      depositDeductions: [],
      depositReturn: { returned: false, returnedAt: null },
      rentPayments,
      gasBills: [],
      cashSuccessions: [],
    });
  }

  // 기본 정보 수정 모드
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState<Partial<ResidentDetail>>({});
  const [contractMonths, setContractMonths] = useState<string>("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAge, setEditAge] = useState("");

  // 퇴실 처리
  const [confirmCheckout, setConfirmCheckout] = useState(false);

  async function handleCheckout() {
    if (!activeContract) return;
    await editContract(activeContract.id, {
      status: 'completed',
      actual_move_out_date: todayStr,
    });
    router.push('/residents');
  }

  // 총 보증금 수정
  const [editingDepTotal, setEditingDepTotal] = useState(false);
  const [depTotalInput, setDepTotalInput] = useState("");

  async function saveDepTotal() {
    if (!activeContract) return;
    const amount = Number(depTotalInput);
    setDetail((prev) => prev ? { ...prev, depositTotal: amount } : prev);
    setEditingDepTotal(false);
    await editContract(activeContract.id, { deposit_total: amount });
  }

  // 보증금 폼
  const [showDepForm, setShowDepForm] = useState(false);
  const [depDate, setDepDate] = useState(new Date().toISOString().slice(0, 10));
  const [depAmount, setDepAmount] = useState("");
  const [depReason, setDepReason] = useState<DepositDeductionReason>("차임");

  // 보증금 반환
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().slice(0, 10));


  // 현금 승계
  const [showCashNew, setShowCashNew] = useState(false);
  // 섹션별 편집: { [recordIdx]: { [section]: localValue } }
  type CashSection = 'billing' | 'landlord' | 'tenant' | 'amount' | 'account';
  const [cashSectionEdit, setCashSectionEdit] = useState<Record<number, CashSection | null>>({});
  const [cashSectionForm, setCashSectionForm] = useState<Record<number, Partial<CashSuccessionRecord>>>({});
  // 새 항목 폼
  const [newCashForm, setNewCashForm] = useState<CashSuccessionRecord>({});

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
    setContractMonths("");
    setEditName(activeContract?.name ?? "");
    setEditPhone(activeContract?.phone ?? "");
    setEditAge(String(activeContract?.age ?? ""));
    setEditingInfo(true);
  }

  async function saveInfo() {
    if (!detail || !activeContract) return;
    setDetail((prev) => prev ? {
      ...prev,
      ...infoForm,
      depositTotal: infoForm.contractDeposit?.amount ?? prev.depositTotal,
    } : prev);
    setEditingInfo(false);
    await editContract(activeContract.id, {
      name: editName || activeContract.name,
      phone: editPhone || activeContract.phone,
      age: editAge ? Number(editAge) : activeContract.age ?? undefined,
      monthly_rent: infoForm.actualMonthlyRent ? infoForm.actualMonthlyRent * 10000 : undefined,
      contract_start_date: infoForm.contractMoveInDate ?? activeContract.contract_start_date,
      contract_end_date: infoForm.contractExpiry || null,
      actual_move_in_date: infoForm.actualMoveInDate || null,
      actual_move_out_date: infoForm.actualMoveOutDate || null,
      contract_deposit: infoForm.contractDeposit?.amount ?? null,
      deposit_total: infoForm.contractDeposit?.amount ?? null,
      purpose: infoForm.purpose || null,
      real_estate_agency: infoForm.realEstateAgency || null,
    });
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


  // ── 현금 승계 ──

  // 새 항목 추가
  function addNewCash() {
    setDetail((prev) => {
      if (!prev) return prev;
      return { ...prev, cashSuccessions: [...prev.cashSuccessions, { ...newCashForm }] };
    });
    setNewCashForm({});
    setShowCashNew(false);
  }

  // 섹션별 저장
  function saveCashSection(i: number) {
    const patch = cashSectionForm[i] ?? {};
    setDetail((prev) => {
      if (!prev) return prev;
      const updated = [...prev.cashSuccessions];
      updated[i] = { ...updated[i], ...patch };
      return { ...prev, cashSuccessions: updated };
    });
    setCashSectionEdit((p) => ({ ...p, [i]: null }));
    setCashSectionForm((p) => ({ ...p, [i]: {} }));
  }

  function startCashSection(i: number, section: CashSection) {
    if (!detail) return;
    setCashSectionEdit((p) => ({ ...p, [i]: section }));
    setCashSectionForm((p) => ({ ...p, [i]: { ...detail.cashSuccessions[i] } }));
  }

  function cancelCashSection(i: number) {
    setCashSectionEdit((p) => ({ ...p, [i]: null }));
    setCashSectionForm((p) => ({ ...p, [i]: {} }));
  }

  function deleteCash(i: number) {
    setDetail((prev) =>
      prev ? { ...prev, cashSuccessions: prev.cashSuccessions.filter((_, idx) => idx !== i) } : prev
    );
  }

  function printCashSuccessions() {
    const printDiv = document.getElementById("cash-succession-print");
    if (!printDiv) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.head.innerHTML = `<meta charset="utf-8"><title>${id}호 현금 승계</title><style>
      body{font-family:sans-serif;font-size:12px;color:#000;padding:24px;}
      h2{font-size:16px;font-weight:bold;margin-bottom:4px;}
      p{margin-bottom:16px;font-size:11px;color:#555;}
      table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:24px;}
      th,td{border:1px solid #ccc;padding:6px 8px;text-align:center;vertical-align:middle;}
      th{background:#f5f5f5;}
      .highlight{background:#fffde7;font-weight:bold;}
      @page{margin:1cm;}
    </style>`;
    win.document.body.innerHTML = printDiv.innerHTML;
    win.focus();
    win.print();
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
          <h1 className="text-xl font-extrabold tracking-tight text-black-100">{id}호</h1>
          {(room.resident ?? activeContract?.name) && (
            <span className="text-xl font-extrabold tracking-tight text-black-100">· {room.resident ?? activeContract?.name}</span>
          )}
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
              room.status === "occupied"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : room.status === "vacant"
                ? "border-gray-500/20 bg-gray-500/10 text-gray-400"
                : room.status === "contract"
                ? "border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
                : "border-amber-500/20 bg-amber-500/10 text-amber-400"
            }`}
          >
            {room.status === "occupied" ? "입실중" : room.status === "vacant" ? "공실" : room.status === "contract" ? "입실 전" : "점검"}
          </span>
          {room.status === "occupied" && activeContract && (
            confirmCheckout ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">퇴실 처리할까요?</span>
                <button
                  onClick={handleCheckout}
                  className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition-colors"
                >
                  확인
                </button>
                <button
                  onClick={() => setConfirmCheckout(false)}
                  className="rounded-lg border border-[#2A2A2A] px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmCheckout(true)}
                className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition-colors"
              >
                퇴실 처리
              </button>
            )
          )}
          <span className="rounded-full border border-[#2A2A2A] bg-[#1A1A1A] px-2.5 py-1 text-xs text-gray-400">
            {room.roomType}
          </span>
        </div>
      </div>

      {detail && (
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
                {/* 인적 사항 */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-400">이름</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-400">연락처</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(formatPhone(e.target.value))}
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-400">나이</label>
                    <input
                      type="number"
                      value={editAge}
                      onChange={(e) => setEditAge(e.target.value)}
                      className={INPUT}
                    />
                  </div>
                </div>
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
                {/* 계약 기간 */}
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">계약 기간</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs text-gray-400">계약일(시작)</label>
                      <input
                        type="date"
                        value={infoForm.contractMoveInDate ?? ""}
                        onChange={(e) => setInfoForm((f) => ({ ...f, contractMoveInDate: e.target.value }))}
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs text-gray-400">계약일(끝)</label>
                      <input
                        type="date"
                        value={infoForm.contractExpiry ?? ""}
                        onChange={(e) => setInfoForm((f) => ({ ...f, contractExpiry: e.target.value }))}
                        className={INPUT}
                      />
                    </div>
                  </div>
                </div>

                {/* 실제 입·퇴실일 */}
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">실제 입·퇴실</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs text-gray-400">입실일</label>
                      <input
                        type="date"
                        value={infoForm.actualMoveInDate ?? ""}
                        onChange={(e) => {
                          const moveIn = e.target.value;
                          const months = Number(contractMonths);
                          setInfoForm((f) => ({
                            ...f,
                            actualMoveInDate: moveIn,
                            actualMoveOutDate: moveIn && months > 0 ? calcMoveOutDate(moveIn, months) : f.actualMoveOutDate,
                          }));
                        }}
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs text-gray-400">계약 개월 수</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={60}
                          value={contractMonths}
                          onChange={(e) => {
                            const months = e.target.value;
                            setContractMonths(months);
                            const moveIn = infoForm.actualMoveInDate;
                            if (moveIn && Number(months) > 0) {
                              setInfoForm((f) => ({
                                ...f,
                                actualMoveOutDate: calcMoveOutDate(moveIn, Number(months)),
                              }));
                            }
                          }}
                          placeholder="3"
                          className={INPUT}
                        />
                        <span className="shrink-0 text-xs text-gray-500">개월</span>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs text-gray-400">
                        퇴실일 <span className="text-gray-600 font-normal">(자동 계산)</span>
                      </label>
                      <input
                        type="date"
                        value={infoForm.actualMoveOutDate ?? ""}
                        onChange={(e) => setInfoForm((f) => ({ ...f, actualMoveOutDate: e.target.value }))}
                        className={`${INPUT} ${infoForm.actualMoveOutDate ? "text-emerald-400" : ""}`}
                      />
                    </div>
                  </div>
                  {infoForm.actualMoveInDate && infoForm.actualMoveOutDate && (
                    <p className="mt-2 text-xs text-gray-500">
                      입실일 <span className="text-white">{infoForm.actualMoveInDate}</span> +{" "}
                      {contractMonths || "?"} 개월 − 1일 →{" "}
                      퇴실일 <span className="text-emerald-400 font-semibold">{infoForm.actualMoveOutDate}</span>
                    </p>
                  )}
                </div>

                {/* 계약금 */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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
                      value={infoForm.contractDeposit?.amount || ""}
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
                  <button onClick={saveInfo} disabled={!activeContract} className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed">저장</button>
                </div>
              </div>
            ) : (
              /* ── 조회 뷰 ── */
              <div className="p-6">
                {/* 입실자 프로필 */}
                {(() => {
                  const name    = room.resident   ?? activeContract?.name   ?? "-";
                  const gender  = room.gender     ?? activeContract?.gender ?? null;
                  const age     = room.age        ?? activeContract?.age    ?? null;
                  const phone   = room.phone      ?? activeContract?.phone  ?? "-";
                  return (
                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10 text-xl font-bold text-indigo-400">
                        {name[0] !== "-" ? name[0] : "?"}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-3">
                          {gender && (
                            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${gender === "남" ? "border-blue-500/20 bg-blue-500/10 text-blue-400" : "border-pink-500/20 bg-pink-500/10 text-pink-400"}`}>
                              {gender}
                            </span>
                          )}
                          {age && <span className="text-xs text-gray-500">{age}세</span>}
                          <span className="text-xs text-teal-400">{phone}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                {/* 정보 그리드 */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
                  <InfoField icon={<Home className="h-3.5 w-3.5" />} label="호실" value={`${id}호`} />
                  <InfoField icon={<Home className="h-3.5 w-3.5" />} label="방 유형" value={room.roomType} />
                  <InfoField icon={<Banknote className="h-3.5 w-3.5" />} label="기존 금액" value={`${detail.utilityIncludedRent}만원`} />
                  <InfoField icon={<Banknote className="h-3.5 w-3.5" />} label="금액(관포)" value={`${detail.actualMonthlyRent}만원`} highlight="emerald" />
                  <InfoField icon={<Calendar className="h-3.5 w-3.5" />} label="계약일(시작)" value={detail.contractMoveInDate ? fmtDate(detail.contractMoveInDate) : "-"} highlight="indigo" />
                  <InfoField icon={<Calendar className="h-3.5 w-3.5" />} label="계약일(끝)" value={fmtDate(detail.contractExpiry)} />
                  <InfoField icon={<Calendar className="h-3.5 w-3.5" />} label="입실일" value={detail.actualMoveInDate ? fmtDate(detail.actualMoveInDate) : (room.moveInDate ? fmtDate(room.moveInDate) : "-")} />
                  <InfoField icon={<Calendar className="h-3.5 w-3.5" />} label="퇴실일" value={detail.actualMoveOutDate ? fmtDate(detail.actualMoveOutDate) : (room.moveOutDate ? fmtDate(room.moveOutDate) : "-")} />
                  <InfoField icon={<Calendar className="h-3.5 w-3.5" />} label="월세 납부일" value={`매월 ${new Date(detail.actualMoveInDate ?? room.moveInDate ?? detail.contractMoveInDate ?? detail.contractDeposit.date).getDate()}일`} highlight="indigo" />
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
              {/* 총 보증금 — 클릭해서 수정 */}
              <div className="px-6 py-4 text-center">
                <p className="text-xs text-gray-500">총 보증금</p>
                {editingDepTotal ? (
                  <div className="mt-1 flex items-center gap-1 justify-center">
                    <input
                      autoFocus
                      type="number"
                      value={depTotalInput}
                      onChange={(e) => setDepTotalInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveDepTotal(); if (e.key === 'Escape') setEditingDepTotal(false); }}
                      className="w-28 rounded border border-indigo-500/50 bg-[#1A1A1A] px-2 py-1 text-sm text-white outline-none text-center"
                    />
                    <button onClick={saveDepTotal} className="text-xs text-indigo-400 hover:text-indigo-300">✓</button>
                    <button onClick={() => setEditingDepTotal(false)} className="text-xs text-gray-500 hover:text-white">✕</button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setDepTotalInput(String(detail.depositTotal)); setEditingDepTotal(true); }}
                    className="mt-1 text-base font-bold text-white hover:text-indigo-300 transition-colors"
                    title="클릭해서 수정"
                  >
                    ₩{detail.depositTotal.toLocaleString("ko-KR")}
                  </button>
                )}
              </div>
              {[
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

            {/* 보증금 반환 */}
            <div className="border-t border-[#2A2A2A]">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <div className={`h-2 w-2 rounded-full ${detail.depositReturn.returned ? "bg-emerald-400" : "bg-gray-600"}`} />
                  <span className="text-sm font-semibold text-white">보증금 반환</span>
                  {detail.depositReturn.returned && (
                    <span className="text-xs text-emerald-400 font-medium">{fmtDate(detail.depositReturn.returnedAt!)}</span>
                  )}
                </div>
                {detail.depositReturn.returned ? (
                  <button
                    onClick={() => setDetail((p) => p ? { ...p, depositReturn: { returned: false, returnedAt: null } } : p)}
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
                <div className="px-6 pb-4 space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-400">반환 날짜</label>
                    <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className={INPUT} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowReturnForm(false)} className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-xs text-gray-400 hover:text-white">취소</button>
                    <button
                      onClick={() => {
                        setDetail((p) => p ? { ...p, depositReturn: { returned: true, returnedAt: returnDate } } : p);
                        setShowReturnForm(false);
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
                <div className="px-6 pb-4 flex items-center gap-2">
                  <span className="text-xs text-gray-500">잔여 보증금</span>
                  <span className="text-sm font-bold text-emerald-400">₩{depositRemaining.toLocaleString("ko-KR")}</span>
                  <span className="text-xs text-gray-600">반환 완료</span>
                </div>
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

          {/* ── 현금 승계 ── */}
          <div className={CARD}>
            <div className={SECTION_HEADER}>
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-sky-400" />
                <div>
                  <h2 className="text-base font-semibold text-white">현금 승계</h2>
                  <p className="mt-0.5 text-xs text-gray-500">전기 현금 승계 내역 관리 및 PDF 출력</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {detail.cashSuccessions.length > 0 && (
                  <button
                    onClick={printCashSuccessions}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-500/40 bg-gray-500/10 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-500/20"
                  >
                    <Printer className="h-3.5 w-3.5" />PDF 출력
                  </button>
                )}
                <button
                  onClick={() => setShowCashNew((v) => !v)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    showCashNew
                      ? "border-sky-500/60 bg-sky-500/20 text-sky-300"
                      : "border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20"
                  }`}
                >
                  <Plus className="h-3.5 w-3.5" />추가
                </button>
              </div>
            </div>

            {/* 새 항목 입력 폼 */}
            {showCashNew && (
              <div className="border-b border-[#2A2A2A] px-6 py-4 space-y-4 bg-[#0A0A0A]">
                <p className="text-xs font-semibold text-sky-400 uppercase tracking-wide">새 현금 승계 추가</p>

                {/* 청구 기간 */}
                <div>
                  <p className="mb-2 text-xs text-gray-500 font-medium">청구기간</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-gray-600">시작</label>
                      <input type="date" value={newCashForm.billingStart ?? ""} onChange={(e) => setNewCashForm(p => ({ ...p, billingStart: e.target.value }))} className={INPUT} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-600">종료</label>
                      <input type="date" value={newCashForm.billingEnd ?? ""} onChange={(e) => setNewCashForm(p => ({ ...p, billingEnd: e.target.value }))} className={INPUT} />
                    </div>
                  </div>
                </div>

                {/* 임대인 / 임차인 기간 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2 text-xs text-gray-500 font-medium">임대인 현금승계 기간</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">시작</label>
                        <input type="date" value={newCashForm.landlordStart ?? ""} onChange={(e) => setNewCashForm(p => ({ ...p, landlordStart: e.target.value }))} className={INPUT} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">종료</label>
                        <input type="date" value={newCashForm.landlordEnd ?? ""} onChange={(e) => setNewCashForm(p => ({ ...p, landlordEnd: e.target.value }))} className={INPUT} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs text-gray-500 font-medium">임차인 실 사용 기간</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">시작</label>
                        <input type="date" value={newCashForm.tenantStart ?? ""} onChange={(e) => setNewCashForm(p => ({ ...p, tenantStart: e.target.value }))} className={INPUT} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">종료</label>
                        <input type="date" value={newCashForm.tenantEnd ?? ""} onChange={(e) => setNewCashForm(p => ({ ...p, tenantEnd: e.target.value }))} className={INPUT} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 금액/사용량 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500 font-medium">금액 및 사용량</p>
                    <a
                      href="https://search.naver.com/search.naver?query=전기요금+계산기"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-md border border-green-500/30 bg-green-500/10 px-2 py-1 text-xs text-green-400 hover:bg-green-500/20 transition-colors"
                    >
                      <span className="text-[10px]">⚡</span>
                      네이버 전기요금 계산기
                    </a>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-[#2A2A2A] bg-[#111] p-3 space-y-2">
                      <p className="text-xs font-semibold text-sky-400">임대인</p>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">금액 (원)</label>
                        <input type="number" value={newCashForm.landlordAmount ?? ""} onChange={(e) => { const v = Number(e.target.value); setNewCashForm(p => ({ ...p, landlordAmount: v, totalAmount: v + (p.tenantAmount ?? 0) })); }} placeholder="0" className={INPUT} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">사용량 (kWh)</label>
                        <input type="number" value={newCashForm.landlordKwh ?? ""} onChange={(e) => { const v = Number(e.target.value); setNewCashForm(p => ({ ...p, landlordKwh: v, totalKwh: v + (p.tenantKwh ?? 0) })); }} placeholder="0" className={INPUT} />
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#2A2A2A] bg-[#111] p-3 space-y-2">
                      <p className="text-xs font-semibold text-emerald-400">임차인</p>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">금액 (원)</label>
                        <input type="number" value={newCashForm.tenantAmount ?? ""} onChange={(e) => { const v = Number(e.target.value); setNewCashForm(p => ({ ...p, tenantAmount: v, totalAmount: (p.landlordAmount ?? 0) + v })); }} placeholder="0" className={INPUT} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">사용량 (kWh)</label>
                        <input type="number" value={newCashForm.tenantKwh ?? ""} onChange={(e) => { const v = Number(e.target.value); setNewCashForm(p => ({ ...p, tenantKwh: v, totalKwh: (p.landlordKwh ?? 0) + v })); }} placeholder="0" className={INPUT} />
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] p-3 space-y-2 opacity-80">
                      <p className="text-xs font-semibold text-gray-400">총 <span className="text-[10px] font-normal text-gray-600">(자동계산)</span></p>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">금액 (원)</label>
                        <input type="number" readOnly value={newCashForm.totalAmount ?? ""} placeholder="자동입력" className={`${INPUT} text-white font-semibold`} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">사용량 (kWh)</label>
                        <input type="number" readOnly value={newCashForm.totalKwh ?? ""} placeholder="자동입력" className={`${INPUT} text-white font-semibold`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 계좌 정보 */}
                <div>
                  <p className="mb-2 text-xs text-gray-500 font-medium">계좌번호</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-gray-600">은행</label>
                      <input value={newCashForm.bankName ?? ""} onChange={(e) => setNewCashForm(p => ({ ...p, bankName: e.target.value }))} placeholder="신한" className={INPUT} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-600">예금주</label>
                      <input value={newCashForm.accountHolder ?? ""} onChange={(e) => setNewCashForm(p => ({ ...p, accountHolder: e.target.value }))} placeholder="홍길동" className={INPUT} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-600">계좌번호</label>
                      <input value={newCashForm.accountNumber ?? ""} onChange={(e) => setNewCashForm(p => ({ ...p, accountNumber: e.target.value }))} placeholder="110-000-000000" className={INPUT} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">납부 일자</label>
                    <input type="date" value={newCashForm.paymentDate ?? ""} onChange={(e) => setNewCashForm(p => ({ ...p, paymentDate: e.target.value }))} className={INPUT} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">비고</label>
                    <input value={newCashForm.notes ?? ""} onChange={(e) => setNewCashForm(p => ({ ...p, notes: e.target.value }))} placeholder="반환완료 등" className={INPUT} />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button onClick={() => { setShowCashNew(false); setNewCashForm({}); }} className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-xs text-gray-400 hover:text-white transition-colors">취소</button>
                  <button onClick={addNewCash} className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-400 transition-colors">저장</button>
                </div>
              </div>
            )}

            {/* 목록 */}
            {detail.cashSuccessions.length === 0 && !showCashNew ? (
              <div className="px-5 py-10 text-center">
                <Banknote className="mx-auto mb-3 h-8 w-8 text-gray-600" />
                <p className="text-sm text-gray-500">현금 승계 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1E1E1E]">
                {detail.cashSuccessions.map((rec, i) => {
                  const sec = cashSectionEdit[i] ?? null;
                  const sf = cashSectionForm[i] ?? {};
                  return (
                    <div key={i} className="px-6 py-4 space-y-3">

                      {/* 청구기간 헤더 */}
                      <div className="flex items-center justify-between">
                        {sec === 'billing' ? (
                          <div className="flex items-center gap-2 flex-1 mr-3">
                            <p className="text-xs text-gray-500 shrink-0">청구기간</p>
                            <input type="date" value={sf.billingStart ?? rec.billingStart ?? ""} onChange={(e) => setCashSectionForm(p => ({ ...p, [i]: { ...sf, billingStart: e.target.value } }))} className={`${INPUT} text-xs py-1`} />
                            <span className="text-gray-600 shrink-0">~</span>
                            <input type="date" value={sf.billingEnd ?? rec.billingEnd ?? ""} onChange={(e) => setCashSectionForm(p => ({ ...p, [i]: { ...sf, billingEnd: e.target.value } }))} className={`${INPUT} text-xs py-1`} />
                            <button onClick={() => saveCashSection(i)} className="shrink-0 rounded-lg bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-400 transition-colors">저장</button>
                            <button onClick={() => cancelCashSection(i)} className="shrink-0 rounded-lg border border-[#2A2A2A] px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors">취소</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500">청구기간</p>
                            <p className="text-sm font-semibold text-white">{rec.billingStart ?? "-"} ~ {rec.billingEnd ?? "-"}</p>
                            <button onClick={() => startCashSection(i, 'billing')} className="flex h-6 w-6 items-center justify-center rounded text-gray-600 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors">
                              <Pencil className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        <button onClick={() => deleteCash(i)} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 hover:bg-rose-500/10 hover:text-rose-400 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* 테이블 */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#1A1A1A]">
                              <th className="border border-[#2A2A2A] px-3 py-2 text-gray-400 font-medium text-center">호수</th>
                              <th className="border border-[#2A2A2A] px-3 py-2 text-gray-400 font-medium text-left">구분</th>
                              <th className="border border-[#2A2A2A] px-3 py-2 text-gray-400 font-medium">
                                기간
                              </th>
                              <th className="border border-[#2A2A2A] px-3 py-2 text-gray-400 font-medium">
                                금액
                              </th>
                              <th className="border border-[#2A2A2A] px-3 py-2 text-gray-400 font-medium">사용량</th>
                              <th className="border border-[#2A2A2A] px-3 py-2 text-gray-400 font-medium">계좌번호</th>
                              <th className="border border-[#2A2A2A] px-3 py-2 text-gray-400 font-medium">비고</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-[#2A2A2A] px-3 py-2 text-center font-bold text-indigo-400" rowSpan={3}>{id}호</td>
                              <td className="border border-[#2A2A2A] px-3 py-2 text-gray-300 font-medium">
                                임대인<br/><span className="text-gray-500 font-normal">현금승계</span>
                              </td>
                              <td className="border border-[#2A2A2A] px-3 py-2 text-center text-gray-300">
                                {rec.landlordStart ?? "-"}<br/>~ {rec.landlordEnd ?? "-"}
                              </td>
                              <td className="border border-[#2A2A2A] px-3 py-2 text-center text-sky-400 font-semibold">
                                {rec.landlordAmount != null ? `₩${rec.landlordAmount.toLocaleString("ko-KR")}` : "-"}
                              </td>
                              <td className="border border-[#2A2A2A] px-3 py-2 text-center text-gray-300">{rec.landlordKwh != null ? `${rec.landlordKwh} kWh` : "-"}</td>
                              <td className="border border-[#2A2A2A] px-3 py-2 text-center text-gray-300" rowSpan={2}>
                                {rec.bankName ?? "-"} {rec.accountHolder ?? ""}<br/>{rec.accountNumber ?? ""}
                              </td>
                              <td className="border border-[#2A2A2A] px-3 py-2 text-center text-gray-400" rowSpan={2}>
                                {rec.paymentDate && <p className="text-xs text-amber-400 font-medium mb-0.5">{rec.paymentDate}</p>}
                                {rec.notes ?? "-"}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-[#2A2A2A] px-3 py-2 text-gray-300 font-medium">
                                임차인<br/><span className="text-gray-500 font-normal">실 사용</span>
                              </td>
                              <td className="border border-[#2A2A2A] px-3 py-2 text-center text-gray-300">
                                {rec.tenantStart ?? "-"}<br/>~ {rec.tenantEnd ?? "-"}
                              </td>
                              <td className="border border-[#2A2A2A] px-3 py-2 text-center text-emerald-400 font-semibold">
                                {rec.tenantAmount != null ? `₩${rec.tenantAmount.toLocaleString("ko-KR")}` : "-"}
                              </td>
                              <td className="border border-[#2A2A2A] px-3 py-2 text-center text-gray-300">{rec.tenantKwh != null ? `${rec.tenantKwh} kWh` : "-"}</td>
                            </tr>
                            <tr className="bg-[#1A1A1A]">
                              <td className="border border-[#2A2A2A] px-3 py-2 text-gray-400 font-medium">합계</td>
                              <td className="border border-[#2A2A2A] px-3 py-2 text-center text-gray-400">{rec.billingStart ?? "-"} ~ {rec.billingEnd ?? "-"}</td>
                              <td className="border border-[#2A2A2A] px-3 py-2 text-center text-white font-bold">
                                {rec.totalAmount != null ? `₩${rec.totalAmount.toLocaleString("ko-KR")}` : "-"}
                              </td>
                              <td className="border border-[#2A2A2A] px-3 py-2 text-center text-gray-300">{rec.totalKwh != null ? `${rec.totalKwh} kWh` : "-"}</td>
                              <td className="border border-[#2A2A2A] px-3 py-2" colSpan={2} />
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* 섹션별 편집 버튼 & 패널 */}
                      <div className="flex flex-wrap gap-2">
                        {(['landlord', 'tenant', 'amount', 'account'] as const).map((s) => {
                          const labels: Record<string, string> = { landlord: '임대인 기간', tenant: '임차인 기간', amount: '금액/사용량', account: '계좌번호' };
                          return (
                            <button
                              key={s}
                              onClick={() => sec === s ? cancelCashSection(i) : startCashSection(i, s)}
                              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                                sec === s
                                  ? "border-indigo-500/60 bg-indigo-500/20 text-indigo-300"
                                  : "border-[#2A2A2A] text-gray-500 hover:border-indigo-500/40 hover:text-indigo-400"
                              }`}
                            >
                              <Pencil className="h-2.5 w-2.5" />{labels[s]}
                            </button>
                          );
                        })}
                      </div>

                      {/* 임대인 기간 편집 */}
                      {sec === 'landlord' && (
                        <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-3">
                          <p className="text-xs font-semibold text-indigo-400">임대인 현금승계 기간</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-xs text-gray-600">시작</label>
                              <input type="date" value={sf.landlordStart ?? rec.landlordStart ?? ""} onChange={(e) => setCashSectionForm(p => ({ ...p, [i]: { ...sf, landlordStart: e.target.value } }))} className={INPUT} />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs text-gray-600">종료</label>
                              <input type="date" value={sf.landlordEnd ?? rec.landlordEnd ?? ""} onChange={(e) => setCashSectionForm(p => ({ ...p, [i]: { ...sf, landlordEnd: e.target.value } }))} className={INPUT} />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button onClick={() => cancelCashSection(i)} className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">취소</button>
                            <button onClick={() => saveCashSection(i)} className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400 transition-colors">저장</button>
                          </div>
                        </div>
                      )}

                      {/* 임차인 기간 편집 */}
                      {sec === 'tenant' && (
                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                          <p className="text-xs font-semibold text-emerald-400">임차인 실 사용 기간</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-xs text-gray-600">시작</label>
                              <input type="date" value={sf.tenantStart ?? rec.tenantStart ?? ""} onChange={(e) => setCashSectionForm(p => ({ ...p, [i]: { ...sf, tenantStart: e.target.value } }))} className={INPUT} />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs text-gray-600">종료</label>
                              <input type="date" value={sf.tenantEnd ?? rec.tenantEnd ?? ""} onChange={(e) => setCashSectionForm(p => ({ ...p, [i]: { ...sf, tenantEnd: e.target.value } }))} className={INPUT} />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button onClick={() => cancelCashSection(i)} className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">취소</button>
                            <button onClick={() => saveCashSection(i)} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-400 transition-colors">저장</button>
                          </div>
                        </div>
                      )}

                      {/* 금액/사용량 편집 */}
                      {sec === 'amount' && (
                        <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-sky-400">금액 및 사용량</p>
                            <a href="https://search.naver.com/search.naver?query=전기요금+계산기" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-md border border-green-500/30 bg-green-500/10 px-2 py-1 text-xs text-green-400 hover:bg-green-500/20 transition-colors">
                              <span className="text-[10px]">⚡</span>네이버 전기요금 계산기
                            </a>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-lg border border-[#2A2A2A] bg-[#111] p-3 space-y-2">
                              <p className="text-xs font-semibold text-sky-400">임대인</p>
                              <div>
                                <label className="mb-1 block text-xs text-gray-600">금액 (원)</label>
                                <input type="number" value={sf.landlordAmount ?? rec.landlordAmount ?? ""} onChange={(e) => { const v = Number(e.target.value); setCashSectionForm(p => ({ ...p, [i]: { ...sf, landlordAmount: v, totalAmount: v + (sf.tenantAmount ?? rec.tenantAmount ?? 0) } })); }} placeholder="0" className={INPUT} />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs text-gray-600">사용량 (kWh)</label>
                                <input type="number" value={sf.landlordKwh ?? rec.landlordKwh ?? ""} onChange={(e) => { const v = Number(e.target.value); setCashSectionForm(p => ({ ...p, [i]: { ...sf, landlordKwh: v, totalKwh: v + (sf.tenantKwh ?? rec.tenantKwh ?? 0) } })); }} placeholder="0" className={INPUT} />
                              </div>
                            </div>
                            <div className="rounded-lg border border-[#2A2A2A] bg-[#111] p-3 space-y-2">
                              <p className="text-xs font-semibold text-emerald-400">임차인</p>
                              <div>
                                <label className="mb-1 block text-xs text-gray-600">금액 (원)</label>
                                <input type="number" value={sf.tenantAmount ?? rec.tenantAmount ?? ""} onChange={(e) => { const v = Number(e.target.value); setCashSectionForm(p => ({ ...p, [i]: { ...sf, tenantAmount: v, totalAmount: (sf.landlordAmount ?? rec.landlordAmount ?? 0) + v } })); }} placeholder="0" className={INPUT} />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs text-gray-600">사용량 (kWh)</label>
                                <input type="number" value={sf.tenantKwh ?? rec.tenantKwh ?? ""} onChange={(e) => { const v = Number(e.target.value); setCashSectionForm(p => ({ ...p, [i]: { ...sf, tenantKwh: v, totalKwh: (sf.landlordKwh ?? rec.landlordKwh ?? 0) + v } })); }} placeholder="0" className={INPUT} />
                              </div>
                            </div>
                            <div className="rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] p-3 space-y-2 opacity-80">
                              <p className="text-xs font-semibold text-gray-400">총 <span className="text-[10px] font-normal text-gray-600">(자동계산)</span></p>
                              <div>
                                <label className="mb-1 block text-xs text-gray-600">금액 (원)</label>
                                <input type="number" readOnly value={sf.totalAmount ?? rec.totalAmount ?? ""} placeholder="자동입력" className={`${INPUT} text-white font-semibold`} />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs text-gray-600">사용량 (kWh)</label>
                                <input type="number" readOnly value={sf.totalKwh ?? rec.totalKwh ?? ""} placeholder="자동입력" className={`${INPUT} text-white font-semibold`} />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button onClick={() => cancelCashSection(i)} className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">취소</button>
                            <button onClick={() => saveCashSection(i)} className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-400 transition-colors">저장</button>
                          </div>
                        </div>
                      )}

                      {/* 계좌번호 편집 */}
                      {sec === 'account' && (
                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                          <p className="text-xs font-semibold text-amber-400">계좌번호</p>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="mb-1 block text-xs text-gray-600">은행</label>
                              <input value={sf.bankName ?? rec.bankName ?? ""} onChange={(e) => setCashSectionForm(p => ({ ...p, [i]: { ...sf, bankName: e.target.value } }))} placeholder="신한" className={INPUT} />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs text-gray-600">예금주</label>
                              <input value={sf.accountHolder ?? rec.accountHolder ?? ""} onChange={(e) => setCashSectionForm(p => ({ ...p, [i]: { ...sf, accountHolder: e.target.value } }))} placeholder="홍길동" className={INPUT} />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs text-gray-600">계좌번호</label>
                              <input value={sf.accountNumber ?? rec.accountNumber ?? ""} onChange={(e) => setCashSectionForm(p => ({ ...p, [i]: { ...sf, accountNumber: e.target.value } }))} placeholder="110-000-000000" className={INPUT} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-xs text-gray-600">납부 일자</label>
                              <input type="date" value={sf.paymentDate ?? rec.paymentDate ?? ""} onChange={(e) => setCashSectionForm(p => ({ ...p, [i]: { ...sf, paymentDate: e.target.value } }))} className={INPUT} />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs text-gray-600">비고</label>
                              <input value={sf.notes ?? rec.notes ?? ""} onChange={(e) => setCashSectionForm(p => ({ ...p, [i]: { ...sf, notes: e.target.value } }))} placeholder="반환완료 등" className={INPUT} />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button onClick={() => cancelCashSection(i)} className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">취소</button>
                            <button onClick={() => saveCashSection(i)} className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-400 transition-colors">저장</button>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── PDF 출력 영역 (print only) ── */}
          <style>{`
            @media print {
              body > * { display: none !important; }
              #cash-succession-print { display: block !important; position: fixed; top: 0; left: 0; width: 100%; padding: 24px; background: white; }
            }
          `}</style>
          <div id="cash-succession-print" style={{ display: "none" }}>
            <div style={{ fontFamily: "sans-serif", fontSize: "12px", color: "#000" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "4px" }}>
                {id}호 · {room.resident} — 전기 현금 승계
              </h2>
              <p style={{ color: "#555", marginBottom: "16px", fontSize: "11px" }}>
                이번달 청구요금은 현금 승계만 가능하여 호림에서 직접 납부하고 있습니다.<br />
                다음달 부터는 임차인에게서 직접 납부하시면 됩니다.(종이 청구서 배부 예정)<br />
                실 사용 금액(형광펜 부분)만 저희 계좌로 입금 부탁드립니다. 감사합니다.
              </p>
              {detail.cashSuccessions.map((rec, i) => (
                <div key={i} style={{ marginBottom: "24px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                    <thead>
                      <tr style={{ background: "#f5f5f5" }}>
                        <th style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "center" }}>호실</th>
                        <th style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "center" }}>청구기간</th>
                        <th style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "center" }}>임대인<br/>현금승계 기간</th>
                        <th style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "center" }}>임차인<br/>실 사용 기간</th>
                        <th style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "center" }}>계좌번호</th>
                        <th style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "center" }}>비고</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "center", verticalAlign: "middle" }} rowSpan={2}>
                          {id}호
                        </td>
                        <td style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "center" }}>
                          {rec.billingStart} ~ {rec.billingEnd}
                        </td>
                        <td style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "center" }}>
                          {rec.landlordStart} ~ {rec.landlordEnd}
                        </td>
                        <td style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "center", background: "#fffde7" }}>
                          {rec.tenantStart} ~ {rec.tenantEnd}
                        </td>
                        <td style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "center", verticalAlign: "middle" }} rowSpan={2}>
                          {rec.bankName} {rec.accountHolder}<br />{rec.accountNumber}
                        </td>
                        <td style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "center", verticalAlign: "middle" }} rowSpan={2}>
                          {rec.paymentDate && <div style={{ fontWeight: "bold", marginBottom: "2px" }}>{rec.paymentDate}</div>}
                          {rec.notes ?? ""}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "center" }}>
                          ₩{(rec.totalAmount ?? 0).toLocaleString("ko-KR")}<br />
                          <span style={{ color: "#666" }}>사용량 {rec.totalKwh ?? 0}kWh</span>
                        </td>
                        <td style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "center" }}>
                          ₩{(rec.landlordAmount ?? 0).toLocaleString("ko-KR")}<br />
                          <span style={{ color: "#666" }}>사용량 {rec.landlordKwh ?? 0}kWh</span>
                        </td>
                        <td style={{ border: "1px solid #ccc", padding: "6px 8px", textAlign: "center", background: "#fffde7", fontWeight: "bold" }}>
                          ₩{(rec.tenantAmount ?? 0).toLocaleString("ko-KR")}<br />
                          <span style={{ color: "#666", fontWeight: "normal" }}>사용량 {rec.tenantKwh}kWh</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
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
  value: string | null | undefined;
  highlight?: "emerald" | "indigo";
}) {
  const isEmpty = !value;
  const valueColor =
    isEmpty ? "text-gray-600" :
    highlight === "emerald" ? "text-emerald-400" :
    highlight === "indigo"  ? "text-indigo-400"  :
    "text-white";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-gray-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-base font-semibold ${valueColor}`}>{value || "없음"}</p>
    </div>
  );
}

