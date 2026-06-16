"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Search, CalendarDays, Wrench, ChevronRight, Plus, Trash2, Pencil, History, Settings } from "lucide-react";
import { OptionsManagerModal, SingleOptionManagerModal, DEFAULT_PURPOSES, DEFAULT_AGENCIES, PURPOSES_LS_KEY, AGENCIES_LS_KEY } from "./OptionsManagerModal";
import {
  ROOM_TYPE_INFO,
  type Room,
  type ScheduledResident,
  type MaintenanceRecord,
  type ResidencePurpose,
  type RealEstateAgency,
} from "../lib/mock-data";
import { useEffectiveRooms } from "../context/useEffectiveRooms";
import { useRooms } from "../context/RoomsContext";
import { useToday } from "../context/MockDateContext";
import {
  fetchAllMaintenanceRecords,
  insertMaintenanceRecord,
  deleteMaintenanceRecord,
  fetchAllRentPayments,
  type DbRentPayment,
} from "../lib/supabase-data";

const DETAIL_OPTIONS = ["도배", "매트리스교체", "에어컨청소", "전구교체", "장판교체", "화장실청소"];

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/** 월세 납부일 계산: payment_due_day 우선, 없으면 입실일 기준 */
function getRentDueInfo(moveInDate: string | null, today: Date, paymentDueDay?: number | null): { day: number; nextDue: Date; daysUntil: number } | null {
  if (!moveInDate && !paymentDueDay) return null;
  const day = paymentDueDay ?? (moveInDate ? new Date(moveInDate).getDate() : 1);
  const thisMonthDue = new Date(today.getFullYear(), today.getMonth(), day);
  const nextDue = thisMonthDue >= today
    ? thisMonthDue
    : new Date(today.getFullYear(), today.getMonth() + 1, day);
  const daysUntil = Math.round((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return { day, nextDue, daysUntil };
}


/**
 * 실제 유효 입실일 결정:
 * - actualMoveInDate 있으면 그 값
 * - 없고 오늘 >= contractMoveInDate 이면 contractMoveInDate (자동 적용)
 * - 없고 아직 미래이면 null (아직 입실 전)
 */
function getEffectiveMoveInDate(r: { contractMoveInDate: string; actualMoveInDate?: string }, today: Date): string {
  if (r.actualMoveInDate) return r.actualMoveInDate;
  const contract = new Date(r.contractMoveInDate);
  return contract <= today ? r.contractMoveInDate : r.contractMoveInDate;
}

/** 예약/계약 기준 납부일 */
function getScheduledDueDay(r: { contractMoveInDate: string; actualMoveInDate?: string }, today: Date): number {
  return new Date(getEffectiveMoveInDate(r, today)).getDate();
}

const DETAIL_COLOR: Record<string, string> = {
  "도배": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "매트리스교체": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "에어컨청소": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "전구교체": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "장판교체": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "화장실청소": "bg-rose-500/10 text-rose-400 border-rose-500/20",
};



function ResidentForm({
  initial,
  onSave,
  onCancel,
  saving,
  saveError,
  allPurposes,
  allAgencies,
  onPurposesChange,
  onAgenciesChange,
}: {
  initial: Partial<ScheduledResident>;
  onSave: (r: ScheduledResident) => void;
  onCancel: () => void;
  saving?: boolean;
  saveError?: string | null;
  allPurposes: string[];
  allAgencies: string[];
  onPurposesChange: (v: string[]) => void;
  onAgenciesChange: (v: string[]) => void;
}) {
  const inputCls = "w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-indigo-500 [color-scheme:dark]";
  const selectCls = "w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-indigo-500 appearance-none";

  const [optionsTarget, setOptionsTarget] = useState<'purpose' | 'agency' | null>(null);

  const [name, setName] = useState(initial.name ?? "");
  const [phone, setPhone] = useState(formatPhone(initial.phone ?? ""));
  const [gender, setGender] = useState<'남' | '여'>(initial.gender ?? '남');
  const [birthDate, setBirthDate] = useState(initial.birth_date ?? "");

  // 계약 정보
  const [contractMoveInDate, setContractMoveInDate] = useState(initial.contractMoveInDate ?? "");
  const [contractEndDate, setContractEndDate] = useState(initial.contractEndDate ?? "");
  // 입실 정보
  const [actualMoveInDate, setActualMoveInDate] = useState(initial.actualMoveInDate ?? "");
  const [moveOutDate, setMoveOutDate] = useState(initial.moveOutDate ?? "");

  // 추가 계약 정보
  const [purpose, setPurpose] = useState<string>(initial.purpose ?? "");
  const [purposeCustom, setPurposeCustom] = useState(
    !!initial.purpose && !allPurposes.includes(initial.purpose)
  );
  const [monthlyRent, setMonthlyRent] = useState(
    initial.monthlyRent ? String(initial.monthlyRent / 10000) : ""
  );
  const [contractDeposit, setContractDeposit] = useState(String(initial.contractDeposit ?? ""));
  const [earnestMoney, setEarnestMoney] = useState(String(initial.earnestMoney ?? ""));
  const [realEstateAgency, setRealEstateAgency] = useState<string>(initial.realEstateAgency ?? "");
  const [agencyCustom, setAgencyCustom] = useState(
    !!initial.realEstateAgency && !allAgencies.includes(initial.realEstateAgency)
  );

  function handleContractStartChange(val: string) {
    setContractMoveInDate(val);
  }
  function handleActualMoveInChange(val: string) {
    setActualMoveInDate(val);
  }

  const moveInError = !!(actualMoveInDate && contractMoveInDate && actualMoveInDate < contractMoveInDate);
  const canSave = !!(name && phone && birthDate && contractMoveInDate && actualMoveInDate) && !moveInError;

  function handleSave() {
    if (!canSave) return;
    onSave({
      name, phone, gender, birth_date: birthDate || null,
      contractMoveInDate,
      contractEndDate: contractEndDate || undefined,
      actualMoveInDate: actualMoveInDate || undefined,
      moveOutDate: moveOutDate || undefined,
      purpose: (purpose || undefined) as ResidencePurpose | undefined,
      monthlyRent: monthlyRent ? Number(monthlyRent) * 10000 : undefined,
      contractDeposit: contractDeposit ? Number(contractDeposit) : undefined,
      earnestMoney: earnestMoney ? Number(earnestMoney) : undefined,
      realEstateAgency: (realEstateAgency || undefined) as RealEstateAgency | undefined,
    });
  }

  const effectiveMoveIn = actualMoveInDate || contractMoveInDate;
  const effectiveMoveOut = moveOutDate;

  return (
    <div className="space-y-4">
      {/* 기본 정보 */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-600">기본 정보</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">이름 <span className="text-rose-500">*</span></label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">연락처 <span className="text-rose-500">*</span></label>
            <input value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="010-0000-0000" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">성별</label>
            <div className="flex rounded-lg border border-[#2A2A2A] overflow-hidden">
              {(['남', '여'] as const).map((g) => (
                <button key={g} type="button" onClick={() => setGender(g)} className={`flex-1 py-2 text-xs font-semibold transition-colors ${gender === g ? (g === '남' ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300') : 'text-gray-500 hover:text-gray-300'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">출생년도 <span className="text-rose-500">*</span></label>
            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>

      {/* 계약 정보 */}
      <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-400">계약 정보</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">계약일(문서 작성 날짜) <span className="text-rose-500">*</span></label>
            <input type="date" value={contractMoveInDate} onChange={(e) => handleContractStartChange(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">계약 만료일</label>
            <input type="date" value={contractEndDate} onChange={(e) => setContractEndDate(e.target.value)} className={`${inputCls} ${contractEndDate ? 'text-indigo-300' : ''}`} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">금액(관포)</label>
            <div className="flex items-center gap-1.5">
              <input type="number" min={0} value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} placeholder="70" className={inputCls} />
              <span className="text-xs text-gray-500 shrink-0">만원</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">보증금</label>
            <div className="flex items-center gap-1.5">
              <input type="number" min={0} step={10000} value={contractDeposit} onChange={(e) => setContractDeposit(e.target.value)} placeholder="200000" className={inputCls} />
              <span className="text-xs text-gray-500 shrink-0">원</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">계약금</label>
            <div className="flex items-center gap-1.5">
              <input type="number" min={0} step={10000} value={earnestMoney} onChange={(e) => setEarnestMoney(e.target.value)} placeholder="100000" className={inputCls} />
              <span className="text-xs text-gray-500 shrink-0">원</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-gray-400">거주 목적</label>
              <button type="button" onClick={() => setOptionsTarget('purpose')}
                className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-indigo-400 transition-colors">
                <Settings className="h-3 w-3" />옵션 관리
              </button>
            </div>
            {purposeCustom ? (
              <div className="flex gap-1.5">
                <input autoFocus value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="직접 입력" className={inputCls} />
                <button type="button" onClick={() => { setPurposeCustom(false); setPurpose(""); }}
                  className="shrink-0 flex items-center justify-center h-9 w-9 rounded-lg border border-[#2A2A2A] text-gray-500 hover:text-white transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <select value={purpose} onChange={(e) => {
                if (e.target.value === '__custom__') { setPurposeCustom(true); setPurpose(""); }
                else setPurpose(e.target.value);
              }} className={selectCls}>
                <option value="">선택 안 함</option>
                {allPurposes.map((p) => <option key={p} value={p}>{p}</option>)}
                <option value="__custom__">+ 직접 입력</option>
              </select>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-gray-400">부동산</label>
              <button type="button" onClick={() => setOptionsTarget('agency')}
                className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-indigo-400 transition-colors">
                <Settings className="h-3 w-3" />옵션 관리
              </button>
            </div>
            {agencyCustom ? (
              <div className="flex gap-1.5">
                <input autoFocus value={realEstateAgency} onChange={(e) => setRealEstateAgency(e.target.value)} placeholder="직접 입력" className={inputCls} />
                <button type="button" onClick={() => { setAgencyCustom(false); setRealEstateAgency(""); }}
                  className="shrink-0 flex items-center justify-center h-9 w-9 rounded-lg border border-[#2A2A2A] text-gray-500 hover:text-white transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <select value={realEstateAgency} onChange={(e) => {
                if (e.target.value === '__custom__') { setAgencyCustom(true); setRealEstateAgency(""); }
                else setRealEstateAgency(e.target.value);
              }} className={selectCls}>
                <option value="">선택 안 함</option>
                {allAgencies.map((a) => <option key={a} value={a}>{a}</option>)}
                <option value="__custom__">+ 직접 입력</option>
              </select>
            )}
          </div>

          {optionsTarget === 'purpose' && (
            <SingleOptionManagerModal title="거주 목적" items={allPurposes} onChange={onPurposesChange} onClose={() => setOptionsTarget(null)} />
          )}
          {optionsTarget === 'agency' && (
            <SingleOptionManagerModal title="부동산" items={allAgencies} onChange={onAgenciesChange} onClose={() => setOptionsTarget(null)} />
          )}
        </div>
      </div>

      {/* 입실 정보 */}
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-400">입실 정보</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">입실일 <span className="text-rose-500">*</span></label>
            <input type="date" value={actualMoveInDate} onChange={(e) => handleActualMoveInChange(e.target.value)} className={`${inputCls} focus:border-amber-500 ${moveInError ? 'border-rose-500 text-rose-400' : actualMoveInDate ? 'text-amber-300' : ''}`} />
            {moveInError && (
              <p className="mt-1 text-[10px] text-rose-400">입실일은 계약일(문서 작성 날짜) 이후여야 합니다</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">확정 퇴실일</label>
            <input type="date" value={moveOutDate} onChange={(e) => setMoveOutDate(e.target.value)} className={`${inputCls} ${moveOutDate ? 'text-emerald-300' : ''}`} />
          </div>
        </div>
        {effectiveMoveIn && effectiveMoveOut && (
          <p className="text-[10px] text-amber-400/70">
            입실 기준: <span className="font-semibold">{effectiveMoveIn}</span>
            {" "}→ 월세 납부일 <span className="font-semibold">매월 {new Date(effectiveMoveIn).getDate()}일</span>
          </p>
        )}
      </div>

      {saveError && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">{saveError}</p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={saving} className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-xs text-gray-400 transition-colors hover:text-white disabled:opacity-40">취소</button>
        <button type="button" onClick={handleSave} disabled={!canSave || saving} className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed">
          {saving ? "저장 중…" : "저장"}
        </button>
      </div>
    </div>
  );
}

function ScheduledInfoModal({
  room,
  records,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
  allPurposes,
  allAgencies,
  onPurposesChange,
  onAgenciesChange,
}: {
  room: Room;
  records: ScheduledResident[];
  onAdd: (r: ScheduledResident) => Promise<void>;
  onUpdate: (i: number, r: ScheduledResident) => Promise<void>;
  onDelete: (i: number) => Promise<void>;
  onClose: () => void;
  allPurposes: string[];
  allAgencies: string[];
  onPurposesChange: (v: string[]) => void;
  onAgenciesChange: (v: string[]) => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { today } = useToday();

  const sortedReservations = [...records]
    .map((r, i) => ({ ...r, originalIdx: i }))
    .sort((a, b) => {
      const aDate = a.actualMoveInDate ?? "";
      const bDate = b.actualMoveInDate ?? "";
      return aDate.localeCompare(bDate);
    });

  // 타임라인 범위 계산 — 전부 입실일(actualMoveInDate) 기준
  const allDates: Date[] = [today];
  if (room.moveInDate) allDates.push(new Date(room.moveInDate));
  if (room.moveOutDate) allDates.push(new Date(room.moveOutDate));
  sortedReservations.forEach((r) => {
    if (r.actualMoveInDate) allDates.push(new Date(r.actualMoveInDate));
    const endDate = r.moveOutDate;
    if (endDate) allDates.push(new Date(endDate));
  });

  const earliest = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const latest = new Date(Math.max(...allDates.map((d) => d.getTime())));

  const timelineStart = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
  const minEnd = new Date(timelineStart.getFullYear(), timelineStart.getMonth() + 14, 0);
  const naturalEnd = new Date(latest.getFullYear(), latest.getMonth() + 2, 0);
  const timelineEnd = naturalEnd > minEnd ? naturalEnd : minEnd;
  const totalMs = timelineEnd.getTime() - timelineStart.getTime();

  function toPercent(dateStr: string): number {
    const d = new Date(dateStr);
    return Math.max(0, Math.min(100, ((d.getTime() - timelineStart.getTime()) / totalMs) * 100));
  }

  function barWidth(startStr: string, endStr?: string): number {
    const s = new Date(startStr);
    const e = endStr ? new Date(endStr) : timelineEnd;
    return Math.max(1, ((e.getTime() - s.getTime()) / totalMs) * 100);
  }

  const months: Date[] = [];
  let cur = new Date(timelineStart);
  while (cur <= timelineEnd) {
    months.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }

  const todayPercent = toPercent(today.toISOString().slice(0, 10));

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#2A2A2A] bg-[#0E0E0E] shadow-2xl max-h-[88vh] flex flex-col">

        {/* Header */}
        <div className="border-b border-[#2A2A2A] px-6 py-5 shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">입실 예약 현황</h3>
              <p className="mt-0.5 text-sm text-gray-400">{room.id}호 · 예약 {records.length}건</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowAddForm((v) => !v); setEditingIdx(null); setSelectedIdx(null); }}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  showAddForm
                    ? "border-indigo-500/60 bg-indigo-500/20 text-indigo-300"
                    : "border-indigo-500/40 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />예약 추가
              </button>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-[#1A1A1A] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 방 정보 카드 */}
          {(() => {
            const typeInfo = ROOM_TYPE_INFO[room.roomType];
            const statusLabel: Record<string, { text: string; cls: string }> = {
              occupied: { text: "입실 중", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
              vacant:   { text: "공실",   cls: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
              contract: { text: "계약",   cls: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
            };
            const st = statusLabel[room.status] ?? statusLabel.vacant;
            return (
              <div className="rounded-xl border border-[#2A2A2A] bg-[#0D0D0D] px-4 py-3 flex flex-wrap items-center gap-4">
                {/* 호실 + 타입 */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-sm font-bold text-indigo-400">{room.id}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{room.name}</p>
                    <p className="text-xs text-gray-500">{room.roomType}</p>
                  </div>
                </div>

                <div className="h-8 w-px bg-[#2A2A2A] hidden sm:block" />

                {/* 상태 */}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${st.cls}`}>{st.text}</span>

                {/* 기준 월세 */}
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-600">기준 월세</span>
                  <span className="text-sm font-bold text-white">{room.roomPrice}</span>
                </div>

                {/* 현재 입실자 */}
                {room.resident && (
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-600">현재 입실자</span>
                    <span className="text-sm font-semibold text-emerald-400">{room.resident}</span>
                  </div>
                )}

                {/* 편의시설 */}
                {typeInfo && (
                  <div className="flex flex-wrap gap-1 ml-auto">
                    {typeInfo.amenities.slice(0, 6).map((a) => (
                      <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-[#1A1A1A] border border-[#2A2A2A] text-gray-500">{a}</span>
                    ))}
                    {typeInfo.amenities.length > 6 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1A1A1A] border border-[#2A2A2A] text-gray-600">+{typeInfo.amenities.length - 6}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* 타임라인 */}
          <div className="px-6 pt-5 pb-4">
            <div className="overflow-x-auto">
              <div style={{ minWidth: `${Math.max(600, months.length * 72)}px` }}>

                {/* 월 헤더 */}
                <div className="flex mb-1 ml-28">
                  {months.map((m, i) => (
                    <div key={i} className="flex-1 text-center border-l border-[#222] first:border-l-0 pb-1.5">
                      {m.getMonth() === 0
                        ? <span className="text-[10px] font-bold text-gray-300">{m.getFullYear()}년</span>
                        : <span className="text-[10px] text-gray-600">{m.getMonth() + 1}월</span>
                      }
                    </div>
                  ))}
                </div>

                {/* 현재 입실자 */}
                {room.status === 'occupied' && room.moveInDate && (
                  <div className="flex items-center mb-2">
                    <div className="w-28 shrink-0 pr-3 text-right">
                      <span className="text-[10px] font-semibold text-emerald-400 block">현재 입실자</span>
                      <span className="text-xs font-medium text-white truncate block">{room.resident ?? '-'}</span>
                    </div>
                    <div className="flex-1 relative h-10 bg-[#111] rounded border border-[#1E1E1E]">
                      {months.map((_, i) => (
                        <div key={i} className="absolute top-0 bottom-0 border-l border-[#1A1A1A]" style={{ left: `${(i / months.length) * 100}%` }} />
                      ))}
                      <div
                        className="absolute top-1.5 bottom-1.5 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center gap-2 px-2.5 overflow-hidden"
                        style={{ left: `${toPercent(room.moveInDate)}%`, width: `${barWidth(room.moveInDate, room.moveOutDate ?? undefined)}%` }}
                      >
                        <span className="text-[10px] font-bold text-emerald-300 shrink-0">{room.resident}</span>
                        <span className="text-[10px] text-emerald-500/70 shrink-0">입실 {room.moveInDate}</span>
                        {room.moveOutDate && <span className="text-[10px] text-emerald-500/50 shrink-0">~ {room.moveOutDate}</span>}
                      </div>
                      <div className="absolute top-0 bottom-0 w-px bg-rose-500/70 z-10" style={{ left: `${todayPercent}%` }} />
                    </div>
                  </div>
                )}

                {/* 빈 상태 */}
                {sortedReservations.length === 0 && !room.moveInDate && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CalendarDays className="h-7 w-7 text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500">예약된 입실 일정이 없습니다.</p>
                  </div>
                )}

                {/* 예약 행 */}
                {sortedReservations.map((res, order) => (
                  <div
                    key={res.originalIdx}
                    className="flex items-center mb-2 cursor-pointer group"
                    onClick={() => {
                      setSelectedIdx(selectedIdx === res.originalIdx ? null : res.originalIdx);
                      setShowAddForm(false);
                      setEditingIdx(null);
                    }}
                  >
                    <div className="w-28 shrink-0 pr-3 text-right">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                        예약 {order + 1}
                      </span>
                      <span className="text-xs font-medium text-white mt-0.5 block truncate">{res.name}</span>
                    </div>
                    <div
                      className={`flex-1 relative h-10 rounded border transition-colors ${
                        selectedIdx === res.originalIdx
                          ? 'bg-indigo-500/5 border-indigo-500/30'
                          : 'bg-[#111] border-[#1E1E1E] group-hover:border-indigo-500/20'
                      }`}
                    >
                      {months.map((_, i) => (
                        <div key={i} className="absolute top-0 bottom-0 border-l border-[#1A1A1A]" style={{ left: `${(i / months.length) * 100}%` }} />
                      ))}
                      <div
                        className={`absolute top-1.5 bottom-1.5 rounded flex items-center gap-2 px-2.5 overflow-hidden transition-colors ${
                          selectedIdx === res.originalIdx
                            ? 'bg-indigo-500/30 border border-indigo-400/60'
                            : 'bg-indigo-500/15 border border-indigo-500/30 group-hover:bg-indigo-500/25'
                        }`}
                        style={{ left: `${toPercent(res.actualMoveInDate ?? res.contractMoveInDate)}%`, width: `${barWidth(res.actualMoveInDate ?? res.contractMoveInDate, res.moveOutDate)}%` }}
                      >
                        <span className="text-[10px] font-bold text-indigo-200 shrink-0">{res.name}</span>
                        <span className="text-[10px] text-indigo-300/80 shrink-0">
                          입실 {res.actualMoveInDate ?? res.contractMoveInDate}
                        </span>
                        {res.actualMoveInDate && res.actualMoveInDate !== res.contractMoveInDate && (
                          <span className="text-[10px] text-gray-500/70 shrink-0">계약 {res.contractMoveInDate}</span>
                        )}
                      </div>
                      <div className="absolute top-0 bottom-0 w-px bg-rose-500/70 z-10" style={{ left: `${todayPercent}%` }} />
                    </div>
                  </div>
                ))}

                {/* 오늘 범례 */}
                <div className="flex justify-end mt-1 ml-28">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                    <div className="w-3 h-px bg-rose-500/70" />오늘
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 선택된 예약 상세 */}
          {selectedIdx !== null && records[selectedIdx] && (
            <div className="border-t border-[#222] px-6 py-4 bg-[#0A0A0A]">
              {editingIdx === selectedIdx ? (
                <>
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-3">정보 수정</p>
                  <ResidentForm
                    initial={records[selectedIdx]}
                    onSave={async (updated) => {
                      setSaving(true); setSaveError(null);
                      try { await onUpdate(selectedIdx, updated); setEditingIdx(null); }
                      catch (e) { setSaveError(e instanceof Error ? e.message : '저장 실패'); }
                      finally { setSaving(false); }
                    }}
                    onCancel={() => setEditingIdx(null)}
                    saving={saving}
                    saveError={saveError}
                    allPurposes={allPurposes}
                    allAgencies={allAgencies}
                    onPurposesChange={onPurposesChange}
                    onAgenciesChange={onAgenciesChange}
                  />
                </>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm font-bold text-indigo-400">
                        {records[selectedIdx].name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{records[selectedIdx].name}</span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border ${records[selectedIdx].gender === '남' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-pink-500/10 text-pink-400 border-pink-500/20'}`}>{records[selectedIdx].gender}</span>
                          {records[selectedIdx].birth_date && <span className="text-xs text-gray-500">{new Date().getFullYear() - parseInt(records[selectedIdx].birth_date!.slice(0, 4), 10)}세</span>}
                        </div>
                        <p className="mt-0.5 text-xs text-teal-400">{records[selectedIdx].phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingIdx(selectedIdx); setShowAddForm(false); }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-indigo-500/10 hover:text-indigo-400"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => { onDelete(selectedIdx); setSelectedIdx(null); }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {(() => {
                    const r = records[selectedIdx];
                    const effectiveMoveIn = r.actualMoveInDate ?? "";
                    const effectiveMoveOut = r.moveOutDate;
                    const isActualDiff = r.actualMoveInDate && r.actualMoveInDate !== r.contractMoveInDate;
                    return (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-[#1A1A1A] px-3 py-2 text-xs">
                            <span className="text-gray-500 block mb-0.5">계약일(문서 작성 날짜)</span>
                            <span className="text-indigo-400 font-semibold">{r.contractMoveInDate}</span>
                          </div>
                          <div className="rounded-lg bg-[#1A1A1A] px-3 py-2 text-xs">
                            <span className="text-gray-500 block mb-0.5">계약 만료일</span>
                            {r.contractEndDate
                              ? <span className="text-indigo-300 font-semibold">{r.contractEndDate}</span>
                              : <span className="text-gray-600 italic">미정</span>
                            }
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className={`rounded-lg px-3 py-2 text-xs border ${isActualDiff ? 'bg-amber-500/10 border-amber-500/20' : 'bg-[#1A1A1A] border-transparent'}`}>
                            <span className="text-gray-500 block mb-0.5">입실일</span>
                            {r.actualMoveInDate
                              ? <span className="text-amber-400 font-semibold">{r.actualMoveInDate}</span>
                              : <span className="text-gray-500 text-[10px]">계약일(문서 작성 날짜) 자동 적용</span>
                            }
                          </div>
                          <div className="rounded-lg bg-[#1A1A1A] px-3 py-2 text-xs">
                            <span className="text-gray-500 block mb-0.5">확정 퇴실일</span>
                            {effectiveMoveOut
                              ? <span className="text-emerald-400 font-semibold">{effectiveMoveOut}</span>
                              : <span className="text-gray-600 italic">미정</span>
                            }
                          </div>
                          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs">
                            <span className="text-gray-500 block mb-0.5">월세 납부일</span>
                            <span className="text-amber-400 font-semibold">매월 {new Date(effectiveMoveIn).getDate()}일</span>
                            <span className="text-gray-600 block text-[10px] mt-0.5">
                              {r.actualMoveInDate ? "입실일 기준" : "계약일(문서 작성 날짜) 기준"}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-[#1A1A1A] px-3 py-2 text-xs">
                            <span className="text-gray-500 block mb-0.5">계약금</span>
                            {r.earnestMoney != null
                              ? <span className="text-white font-semibold">₩{r.earnestMoney.toLocaleString('ko-KR')}</span>
                              : <span className="text-gray-600 italic">미입력</span>
                            }
                          </div>
                          <div className="rounded-lg bg-[#1A1A1A] px-3 py-2 text-xs">
                            <span className="text-gray-500 block mb-0.5">보증금</span>
                            {r.contractDeposit != null
                              ? <span className="text-white font-semibold">₩{r.contractDeposit.toLocaleString('ko-KR')}</span>
                              : <span className="text-gray-600 italic">미입력</span>
                            }
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* 예약 추가 폼 */}
          {showAddForm && (
            <div className="border-t border-[#222] px-6 py-4 bg-[#0A0A0A]">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-3">새 예약 추가</p>
              <ResidentForm
                initial={{}}
                onSave={async (r) => {
                  setSaving(true); setSaveError(null);
                  try { await onAdd(r); setShowAddForm(false); }
                  catch (e) { setSaveError(e instanceof Error ? e.message : '저장 실패'); }
                  finally { setSaving(false); }
                }}
                onCancel={() => setShowAddForm(false)}
                saving={saving}
                saveError={saveError}
                allPurposes={allPurposes}
                allAgencies={allAgencies}
                onPurposesChange={onPurposesChange}
                onAgenciesChange={onAgenciesChange}
              />
            </div>
          )}

        </div>
      </div>
    </>
  );
}

function RoomManagementModal({
  room,
  records,
  onAdd,
  onDelete,
  onClose,
}: {
  room: Room;
  records: MaintenanceRecord[];
  onAdd: (record: MaintenanceRecord) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(() => now.toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [selectedDetails, setSelectedDetails] = useState<string[]>([]);

  const MONTH_NAMES = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

  // 연도별로 해당 월에 속한 records 인덱스 모아두기
  function recordsForMonth(month: number): { record: MaintenanceRecord; index: number }[] {
    return records
      .map((r, i) => ({ record: r, index: i }))
      .filter(({ record }) => {
        const [y, m] = record.date.split("-").map(Number);
        return y === viewYear && m === month;
      })
      .sort((a, b) => b.record.date.localeCompare(a.record.date));
  }

  function toggleDetail(d: string) {
    setSelectedDetails((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  }

  function handleAdd() {
    if (!date || !amount || selectedDetails.length === 0) return;
    onAdd({ date, amount: Number(amount), details: selectedDetails });
    setDate(now.toISOString().slice(0, 10));
    setAmount("");
    setSelectedDetails([]);
    setShowForm(false);
  }

  // 해당 연도에 기록이 있는지
  const hasRecordsInYear = records.some(r => r.date.startsWith(String(viewYear)));

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#2A2A2A] bg-[#0E0E0E] shadow-2xl max-h-[88vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-5 shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-base font-semibold text-white">방 관리</h3>
              <p className="mt-0.5 text-sm text-gray-400">{room.id}호 · 관리 이력</p>
            </div>
            {/* 연도 선택 */}
            <div className="flex items-center gap-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-1 py-1">
              <button onClick={() => setViewYear(y => y - 1)} className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-white transition-colors">‹</button>
              <span className="w-14 text-center text-sm font-semibold text-white">{viewYear}년</span>
              <button onClick={() => setViewYear(y => y + 1)} className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:text-white transition-colors">›</button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
            >
              <Plus className="h-3.5 w-3.5" />추가
            </button>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-[#1A1A1A] hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 추가 폼 */}
        {showForm && (
          <div className="border-b border-[#2A2A2A] px-6 py-4 shrink-0 space-y-4 bg-[#111]">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">새 관리 이력 추가</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">날짜</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-white outline-none focus:border-amber-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">금액 (원)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="300000" className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-white outline-none focus:border-amber-500 transition-colors placeholder:text-gray-600" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2">관리 항목</label>
              <div className="flex flex-wrap gap-2">
                {DETAIL_OPTIONS.map((d) => {
                  const active = selectedDetails.includes(d);
                  return (
                    <button key={d} onClick={() => toggleDetail(d)} className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${active ? (DETAIL_COLOR[d] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20") : "border-[#2A2A2A] bg-[#1A1A1A] text-gray-500 hover:text-gray-300"}`}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-xs text-gray-400 transition-colors hover:text-white">취소</button>
              <button onClick={handleAdd} disabled={!date || !amount || selectedDetails.length === 0} className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed">저장</button>
            </div>
          </div>
        )}

        {/* 월별 달력 뷰 */}
        <div className="flex-1 overflow-y-auto p-6">
          {!hasRecordsInYear ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Wrench className="h-8 w-8 text-gray-600 mb-3" />
              <p className="text-sm text-gray-500">{viewYear}년 관리 이력이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {MONTH_NAMES.map((name, mi) => {
                const month = mi + 1;
                const monthRecords = recordsForMonth(month);
                const isEmpty = monthRecords.length === 0;

                return (
                  <div
                    key={month}
                    className={`rounded-xl border p-3 flex flex-col gap-2 min-h-[100px] ${isEmpty ? "border-[#1A1A1A] bg-[#0C0C0C]" : "border-[#2A2A2A] bg-[#161616]"}`}
                  >
                    {/* 월 헤더 */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isEmpty ? "text-gray-700" : "text-amber-400"}`}>{name}</span>
                      {!isEmpty && (
                        <span className="text-[10px] text-gray-500">{monthRecords.length}건</span>
                      )}
                    </div>

                    {/* 이벤트 */}
                    {!isEmpty && (
                      <div className="flex flex-col gap-1.5">
                        {monthRecords.map(({ record, index }) => {
                          const day = record.date.split("-")[2];
                          return (
                            <div key={index} className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-1.5">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-gray-500">{parseInt(day)}일</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-semibold text-emerald-400">₩{record.amount.toLocaleString("ko-KR")}</span>
                                  <button
                                    onClick={() => record.id && onDelete(record.id)}
                                    className="flex h-4 w-4 items-center justify-center rounded text-gray-700 hover:text-rose-400 transition-colors"
                                  >
                                    <Trash2 className="h-2.5 w-2.5" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {record.details.map((d) => (
                                  <span key={d} className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${DETAIL_COLOR[d] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                                    {d}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function TenantListTable() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [scheduledRoom, setScheduledRoom] = useState<Room | null>(null);
  const [managementRoom, setManagementRoom] = useState<Room | null>(null);
  const [showOptionsManager, setShowOptionsManager] = useState(false);
  const [managedPurposes, setManagedPurposes] = useState<string[]>(DEFAULT_PURPOSES);
  const [managedAgencies, setManagedAgencies] = useState<string[]>(DEFAULT_AGENCIES);
  const { effectiveRooms, today, todayStr } = useEffectiveRooms();
  const { contracts, addContract, editContract, removeContract } = useRooms();
  const [maintenanceData, setMaintenanceData] = useState<Record<string, MaintenanceRecord[]>>({});
  const [allRentPayments, setAllRentPayments] = useState<DbRentPayment[]>([]);

  useEffect(() => {
    try {
      const p = localStorage.getItem(PURPOSES_LS_KEY);
      const a = localStorage.getItem(AGENCIES_LS_KEY);
      if (p) setManagedPurposes(JSON.parse(p));
      if (a) setManagedAgencies(JSON.parse(a));
    } catch { /* ignore */ }
  }, []);

  function updatePurposes(v: string[]) {
    setManagedPurposes(v);
    try { localStorage.setItem(PURPOSES_LS_KEY, JSON.stringify(v)); } catch { /* ignore */ }
  }
  function updateAgencies(v: string[]) {
    setManagedAgencies(v);
    try { localStorage.setItem(AGENCIES_LS_KEY, JSON.stringify(v)); } catch { /* ignore */ }
  }

  useEffect(() => {
    fetchAllMaintenanceRecords().then((rows) => {
      const grouped: Record<string, MaintenanceRecord[]> = {};
      for (const r of rows) {
        grouped[r.room_id] = [...(grouped[r.room_id] ?? []), { id: r.id, date: r.date, amount: r.amount, details: r.details }];
      }
      setMaintenanceData(grouped);
    }).catch(console.error);
    fetchAllRentPayments().then(setAllRentPayments).catch(console.error);
  }, []);

  // 미납 계약 ID 집합: overdue 레코드가 있거나, 지난 달까지 미입력 월이 있는 경우
  const unpaidContractIds = useMemo(() => {
    const set = new Set<string>();

    // contract_id → paid 월 집합
    const paidMonthsByContract = new Map<string, Set<string>>();
    for (const p of allRentPayments) {
      if (p.status === 'overdue') set.add(p.contract_id);
      if (p.status === 'paid') {
        if (!paidMonthsByContract.has(p.contract_id)) paidMonthsByContract.set(p.contract_id, new Set());
        paidMonthsByContract.get(p.contract_id)!.add(p.month);
      }
    }

    // 지난 달까지 중 paid 미입력 월이 있으면 미납
    const lastMonthStart = new Date(todayStr.slice(0, 7) + '-01');
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    for (const c of contracts) {
      if (set.has(c.id) || c.status !== 'scheduled') continue;
      const moveIn = c.actual_move_in_date;
      if (!moveIn) continue;
      const paidMonths = paidMonthsByContract.get(c.id) ?? new Set<string>();
      let cur = new Date(moveIn.slice(0, 7) + '-01');
      while (cur <= lastMonthStart) {
        const m = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`;
        if (!paidMonths.has(m)) { set.add(c.id); break; }
        cur.setMonth(cur.getMonth() + 1);
      }
    }

    return set;
  }, [allRentPayments, contracts, todayStr]);

  // 방별 활성 계약 ID (실제 입실한 계약만 — 미래 예약건 제외)
  const activeContractByRoom = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of contracts) {
      if (c.status !== 'scheduled') continue;
      if (!c.actual_move_in_date || c.actual_move_in_date > todayStr) continue;
      const effectiveOut = c.actual_move_out_date ?? c.contract_start_end;
      if (effectiveOut && effectiveOut < todayStr) continue;
      map[c.room_id] = c.id;
    }
    return map;
  }, [contracts, todayStr]);

  // 방별 퇴실 완료 계약 수
  const historyCountByRoom = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of contracts) {
      const histOut = c.actual_move_out_date ?? c.contract_start_end;
      if (c.status === 'completed' || (histOut && histOut < todayStr)) {
        map[c.room_id] = (map[c.room_id] ?? 0) + 1;
      }
    }
    return map;
  }, [contracts, todayStr]);

  // contracts에서 scheduled 항목을 ScheduledResident 형태로 변환
  const scheduledData = useMemo<Record<string, ScheduledResident[]>>(() => {
    const result: Record<string, ScheduledResident[]> = {};
    // 이미 입실한 계약(입실일 ≤ 오늘)은 예약 목록에서 제외 (문자열 비교로 타임존 버그 방지)
    const pendingContracts = contracts.filter((c) => {
      if (c.status !== 'scheduled') return false;
      const moveInStr = (c.actual_move_in_date ?? "").slice(0, 10);
      return !!moveInStr && moveInStr > todayStr;
    });
    for (const c of pendingContracts) {
      const r: ScheduledResident = {
        name: c.name,
        phone: c.phone,
        gender: c.gender ?? '남',
        birth_date: c.birth_date ?? null,
        contractMoveInDate: c.contract_start_date,
        contractEndDate: c.contract_start_end ?? undefined,
        actualMoveInDate: c.actual_move_in_date ?? undefined,
        moveOutDate: c.actual_move_out_date ?? undefined,
        purpose: (c.purpose as ResidencePurpose) ?? undefined,
        monthlyRent: c.monthly_rent ?? undefined,
        contractDeposit: c.contract_deposit ?? undefined,
        earnestMoney: c.earnest_money ?? undefined,
        realEstateAgency: (c.real_estate_agency as RealEstateAgency) ?? undefined,
      };
      result[c.room_id] = [...(result[c.room_id] ?? []), r];
    }
    return result;
  }, [contracts, todayStr]);

  async function handleAddScheduled(roomId: string, record: ScheduledResident) {
    await addContract({
      room_id: roomId,
      name: record.name,
      phone: record.phone,
      gender: record.gender ?? null,
      birth_date: record.birth_date ?? null,
      purpose: record.purpose ?? null,
      real_estate_agency: record.realEstateAgency ?? null,
      contract_start_date: record.contractMoveInDate,
      contract_start_end: record.contractEndDate ?? null,
      actual_move_in_date: record.actualMoveInDate ?? null,
      actual_move_out_date: record.moveOutDate ?? null,
      monthly_rent: record.monthlyRent ?? null,
      contract_deposit: record.contractDeposit ?? null,
      earnest_money: record.earnestMoney ?? null,
      deposit_total: record.contractDeposit ?? null,
      status: 'scheduled',
    });
  }

  // scheduledData와 동일한 필터(미래 예약만)로 인덱스 정합성 유지
  function pendingContractsForRoom(roomId: string) {
    return contracts.filter((c) => {
      if (c.status !== 'scheduled' || c.room_id !== roomId) return false;
      const moveInStr = (c.actual_move_in_date ?? "").slice(0, 10);
      return !!moveInStr && moveInStr > todayStr;
    });
  }

  async function handleDeleteScheduled(roomId: string, index: number) {
    const target = pendingContractsForRoom(roomId)[index];
    if (target) await removeContract(target.id);
  }

  async function handleUpdateScheduled(roomId: string, index: number, record: ScheduledResident) {
    const target = pendingContractsForRoom(roomId)[index];
    if (!target) return;
    await editContract(target.id, {
      name: record.name,
      phone: record.phone,
      gender: record.gender ?? null,
      birth_date: record.birth_date ?? null,
      purpose: record.purpose ?? null,
      real_estate_agency: record.realEstateAgency ?? null,
      contract_start_date: record.contractMoveInDate,
      contract_start_end: record.contractEndDate ?? null,
      actual_move_in_date: record.actualMoveInDate ?? null,
      actual_move_out_date: record.moveOutDate ?? null,
      monthly_rent: record.monthlyRent ?? null,
      contract_deposit: record.contractDeposit ?? null,
      earnest_money: record.earnestMoney ?? null,
    });
  }

  async function handleAddRecord(roomId: string, record: MaintenanceRecord) {
    const saved = await insertMaintenanceRecord({ room_id: roomId, date: record.date, amount: record.amount, details: record.details });
    setMaintenanceData((prev) => ({
      ...prev,
      [roomId]: [{ id: saved.id, date: saved.date, amount: saved.amount, details: saved.details }, ...(prev[roomId] ?? [])],
    }));
  }

  async function handleDeleteRecord(roomId: string, id: string) {
    await deleteMaintenanceRecord(id);
    setMaintenanceData((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] ?? []).filter((r) => r.id !== id),
    }));
  }

  const keyword = search.trim().toLowerCase();
  const filtered = effectiveRooms.filter((room) => {
    if (!keyword) return true;
    return (
      room.id.includes(keyword) ||
      (room.resident ?? "").toLowerCase().includes(keyword) ||
      (room.phone ?? "").includes(keyword)
    );
  });

  const statusLabel: Record<string, string> = {
    occupied: "입실중",
    contract: "입실 전",
    vacant: "공실",
    maintenance: "점검",
  };
  const statusStyle: Record<string, string> = {
    occupied: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    contract: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    vacant: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    maintenance: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };

  return (
    <>
      <div className="rounded-xl border border-[#2A2A2A] bg-[#111] shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[#2A2A2A] p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">입실자 목록</h2>
            <p className="mt-1 text-sm text-gray-400">
              전체 호실의 입실 현황과 예정 일정, 방 관리 이력을 확인할 수 있습니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOptionsManager(true)}
              className="flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2.5 text-xs font-medium text-gray-400 transition-colors hover:border-indigo-500/50 hover:text-indigo-400"
            >
              <Settings className="h-3.5 w-3.5" />옵션 관리
            </button>
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="호실, 이름, 연락처 검색"
                className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-indigo-500 sm:w-64"
              />
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b border-[#2A2A2A] text-xs uppercase tracking-wide">
              <tr>
                <th className="px-6 py-4 font-medium bg-indigo-500/10 text-indigo-400">호실</th>
                <th className="px-6 py-4 font-medium bg-violet-500/10 text-violet-400">이름</th>
                <th className="px-6 py-4 font-medium bg-teal-500/10 text-teal-400">연락처</th>
                <th className="px-6 py-4 font-medium bg-[#1A1A1A] text-gray-400">상태</th>
                <th className="px-6 py-4 font-medium bg-[#1A1A1A] text-gray-400">납부 상태</th>
                <th className="px-6 py-4 font-medium bg-amber-500/10 text-amber-400">월세 납부일</th>
                <th className="px-6 py-4 font-medium bg-[#1A1A1A] text-gray-400">예약(예정 입실)</th>
                <th className="px-6 py-4 font-medium bg-[#1A1A1A] text-gray-400">방 관리</th>
                <th className="px-6 py-4 font-medium bg-[#1A1A1A] text-gray-400">상세</th>
                <th className="px-6 py-4 font-medium bg-[#1A1A1A] text-gray-400">이력</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E1E]">
              {filtered.map((room) => {
                const roomScheduled = scheduledData[room.id] ?? [];
                const hasScheduled = roomScheduled.length > 0;
                const roomRecords = maintenanceData[room.id] ?? [];
                const hasMaintenance = roomRecords.length > 0;

                return (
                  <tr key={room.id} className="transition-colors hover:bg-[#161616]">
                    <td className="px-6 py-4 bg-indigo-500/5">
                      <span className="text-base font-bold text-indigo-400">{room.id}호</span>
                    </td>
                    <td className="px-6 py-4 bg-violet-500/5">
                      {room.status === 'occupied' && room.resident ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-bold text-violet-300">
                            {room.resident[0]}
                          </div>
                          <span className="font-medium text-violet-200">{room.resident}</span>
                        </div>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 bg-teal-500/5">
                      <span className="font-medium text-teal-400">{room.status === 'occupied' ? (room.phone ?? "-") : "-"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyle[room.status]}`}>
                        {statusLabel[room.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        if (room.status !== 'occupied') return <span className="text-gray-600">-</span>;
                        const contractId = activeContractByRoom[room.id];
                        if (!contractId) return <span className="text-gray-600">-</span>;
                        if (unpaidContractIds.has(contractId)) {
                          return (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400">
                              미납
                            </span>
                          );
                        }
                        return (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                            정상
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 bg-amber-500/5">
                      {(() => {
                        if (room.status === "occupied") {
                          const activeC = contracts.find(c => c.id === activeContractByRoom[room.id]);
                          const info = getRentDueInfo(room.moveInDate, today, activeC?.payment_due_day);
                          if (!info) return <span className="text-gray-600">-</span>;
                          const { day, daysUntil } = info;
                          return (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs text-gray-500">매월 <span className="text-amber-300 font-semibold">{day}일</span></span>
                              {daysUntil === 0 && (
                                <span className="text-xs font-medium text-amber-400">🔔 오늘</span>
                              )}
                            </div>
                          );
                        }
                        // 공실인데 예약자 있으면 예약자 기준 납부일 표시
                        const scheduled = scheduledData[room.id] ?? [];
                        if (scheduled.length > 0) {
                          const next = [...scheduled].sort((a, b) => a.contractMoveInDate.localeCompare(b.contractMoveInDate))[0];
                          const day = getScheduledDueDay(next, today);
                          const base = next.actualMoveInDate ?? "";
                          return (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs text-gray-600">예약자 기준</span>
                              <span className="text-xs text-indigo-400 font-medium">매월 {day}일</span>
                              <span className="text-[10px] text-gray-600">{base} 입실</span>
                            </div>
                          );
                        }
                        return <span className="text-gray-600">-</span>;
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setScheduledRoom(room)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          hasScheduled
                            ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                            : "border-[#2A2A2A] bg-[#1A1A1A] text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
                        {hasScheduled ? `${roomScheduled.length}건` : "없음"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setManagementRoom(room)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          hasMaintenance
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                            : "border-[#2A2A2A] bg-[#1A1A1A] text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        <Wrench className="h-3.5 w-3.5" />
                        {hasMaintenance ? `${roomRecords.length}건` : "없음"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/residents/${room.id}`)}
                        className="flex items-center gap-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-indigo-500/50 hover:text-indigo-400"
                      >
                        상세 보기
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/rooms/${room.id}/history`)}
                        className="flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-indigo-500/50 hover:text-indigo-400"
                      >
                        <History className="h-3.5 w-3.5" />
                        이력
                        {(historyCountByRoom[room.id] ?? 0) > 0 && (
                          <span className="ml-0.5 rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400">
                            {historyCountByRoom[room.id]}
                          </span>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-500">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showOptionsManager && (
        <OptionsManagerModal
          purposes={managedPurposes}
          agencies={managedAgencies}
          onPurposesChange={updatePurposes}
          onAgenciesChange={updateAgencies}
          onClose={() => setShowOptionsManager(false)}
        />
      )}
      {scheduledRoom && (
        <ScheduledInfoModal
          room={scheduledRoom}
          records={scheduledData[scheduledRoom.id] ?? []}
          onAdd={(r) => handleAddScheduled(scheduledRoom.id, r)}
          onUpdate={(i, r) => handleUpdateScheduled(scheduledRoom.id, i, r)}
          onDelete={(i) => handleDeleteScheduled(scheduledRoom.id, i)}
          onClose={() => setScheduledRoom(null)}
          allPurposes={managedPurposes}
          allAgencies={managedAgencies}
          onPurposesChange={updatePurposes}
          onAgenciesChange={updateAgencies}
        />
      )}
      {managementRoom && (
        <RoomManagementModal
          room={managementRoom}
          records={maintenanceData[managementRoom.id] ?? []}
          onAdd={(record) => handleAddRecord(managementRoom.id, record)}
          onDelete={(id) => handleDeleteRecord(managementRoom.id, id)}
          onClose={() => setManagementRoom(null)}
        />
      )}
    </>
  );
}
