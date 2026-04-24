'use client';

import { useState, useMemo } from 'react';
import { X, UserPlus, CheckCircle2, ChevronDown } from 'lucide-react';
import { ROOM_TYPE_INFO, type ResidencePurpose, type RealEstateAgency } from '@/app/lib/mock-data';
import { calcEndDate } from '@/app/lib/utils';
import { useRooms } from '@/app/context/RoomsContext';
import { useEffectiveRooms } from '@/app/context/useEffectiveRooms';

const RESIDENCE_PURPOSES: ResidencePurpose[] = [
  "공시생(임용)", "공시생(일행)", "공시생(소방)", "공시생(경찰)",
  "세무·회계·계리", "취준생", "수능", "직장",
];
const REAL_ESTATE_AGENCIES: RealEstateAgency[] = ["부동산 A", "부동산 B", "부동산 C", "직거래"];

interface NewResidentModalProps {
  onClose: () => void;
  initialRoomId?: string;
}

const FLOOR_LABELS: Record<number, string> = {
  1: '1층', 2: '2층', 3: '3층', 4: '4층', 5: '5층', 6: '6층',
};

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}


export default function NewResidentModal({ onClose, initialRoomId = '' }: NewResidentModalProps) {
  const { addContract, contracts } = useRooms();
  const { effectiveRooms } = useEffectiveRooms();

  const extraPurposes = useMemo(() => {
    const vals = contracts.map((c) => c.purpose).filter((p): p is string => !!p && !RESIDENCE_PURPOSES.includes(p as ResidencePurpose));
    return [...new Set(vals)];
  }, [contracts]);
  const extraAgencies = useMemo(() => {
    const vals = contracts.map((c) => c.real_estate_agency).filter((a): a is string => !!a && !REAL_ESTATE_AGENCIES.includes(a as RealEstateAgency));
    return [...new Set(vals)];
  }, [contracts]);
  const vacantRooms = effectiveRooms.filter((r) => r.status === 'vacant' || r.status === 'contract');
  const isRoomFixed = !!initialRoomId;

  // 기본 정보
  const [roomId, setRoomId] = useState(initialRoomId);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'남' | '여' | ''>('');
  const [age, setAge] = useState('');

  // 계약 정보
  const [contractMoveInDate, setContractMoveInDate] = useState('');
  const [contractMonths, setContractMonths] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');

  // 입실 정보
  const [actualMoveInDate, setActualMoveInDate] = useState('');
  const [moveOutDate, setMoveOutDate] = useState('');

  // 추가 계약 정보
  const [purpose, setPurpose] = useState('');
  const [purposeCustom, setPurposeCustom] = useState(false);
  const [rentAmount, setRentAmount] = useState('');
  const [contractDeposit, setContractDeposit] = useState('');
  const [realEstateAgency, setRealEstateAgency] = useState('');
  const [agencyCustom, setAgencyCustom] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const selectedRoom = effectiveRooms.find((r) => r.id === roomId);
  const typeInfo = selectedRoom ? ROOM_TYPE_INFO[selectedRoom.roomType] : null;
  const monthlyRent = typeInfo ? `₩${typeInfo.price.toLocaleString()}` : null;

  const inputCls = "w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-indigo-500 [color-scheme:dark]";

  function handleContractStartChange(val: string) {
    setContractMoveInDate(val);
    const months = Number(contractMonths);
    if (val && months > 0) setContractEndDate(calcEndDate(val, months));
  }

  function handleContractMonthsChange(val: string) {
    setContractMonths(val);
    const months = Number(val);
    if (contractMoveInDate && months > 0) setContractEndDate(calcEndDate(contractMoveInDate, months));
    const base = actualMoveInDate || contractMoveInDate;
    if (base && months > 0) setMoveOutDate(calcEndDate(base, months));
  }

  function handleActualMoveInChange(val: string) {
    setActualMoveInDate(val);
    const months = Number(contractMonths);
    if (val && months > 0) setMoveOutDate(calcEndDate(val, months));
  }

  const effectiveMoveIn = actualMoveInDate || contractMoveInDate;
  const effectiveMoveOut = moveOutDate || contractEndDate;

  const moveInError = !!(actualMoveInDate && contractMoveInDate && actualMoveInDate < contractMoveInDate);
  const canSubmit = !!(roomId && name && phone && gender && age && contractMoveInDate && contractMonths) && !moveInError;

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit || saving) return;

    setSaving(true);
    setSaveError(null);
    try {
      await addContract({
        room_id: roomId,
        name,
        phone,
        gender: gender as '남' | '여',
        age: Number(age),
        purpose: purpose || null,
        real_estate_agency: realEstateAgency || null,
        contract_start_date: contractMoveInDate,
        contract_end_date: contractEndDate || null,
        contract_months: contractMonths ? Number(contractMonths) : null,
        actual_move_in_date: actualMoveInDate || null,
        actual_move_out_date: moveOutDate || null,
        monthly_rent: rentAmount ? Number(rentAmount) * 10000 : null,
        contract_deposit: contractDeposit ? Number(contractDeposit) : null,
        deposit_total: contractDeposit ? Number(contractDeposit) : null,
        status: 'scheduled',
      });
      setSubmitted(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

  // 성공 화면
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-2xl border border-[#2A2A2A] bg-[#111] p-8 shadow-2xl text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">등록 완료</h3>
          <p className="text-gray-400 mb-1">
            <span className="text-white font-semibold">{name}</span>님이
          </p>
          <p className="text-gray-400 mb-6">
            <span className="text-white font-semibold">{selectedRoom?.name}</span>에 입실 등록되었습니다.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#2A2A2A] bg-[#111] shadow-2xl flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">신규 입실자 등록</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-[#2A2A2A] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-6 py-5 space-y-5">

            {/* 호실 선택 */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">호실 선택 <span className="text-rose-400">*</span></label>
              {isRoomFixed ? (
                <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 px-3 py-2.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-indigo-300">{selectedRoom?.name}</span>
                  <span className="text-xs text-gray-500">{selectedRoom?.roomType}</span>
                </div>
              ) : (
                <div className="relative">
                  <select
                    required
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors pr-8"
                  >
                    <option value="">공실 호실을 선택하세요</option>
                    {[1, 2, 3, 4, 5, 6].map((floor) => {
                      const floorRooms = vacantRooms.filter((r) => r.floor === floor);
                      if (floorRooms.length === 0) return null;
                      return (
                        <optgroup key={floor} label={FLOOR_LABELS[floor]}>
                          {floorRooms.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({r.roomType})
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              )}
              {selectedRoom && (
                <div className="mt-2 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{selectedRoom.roomType}</span>
                  <span className="text-sm font-semibold text-indigo-300">{monthlyRent} / 월</span>
                </div>
              )}
            </div>

            {/* 기본 정보 */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-600">기본 정보</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">이름 <span className="text-rose-400">*</span></label>
                  <input
                    required
                    type="text"
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">연락처 <span className="text-rose-400">*</span></label>
                  <input
                    required
                    type="text"
                    placeholder="010-0000-0000"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">성별 <span className="text-rose-400">*</span></label>
                  <div className="flex rounded-lg border border-[#2A2A2A] overflow-hidden">
                    {(['남', '여'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                          gender === g
                            ? g === '남'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-pink-500/20 text-pink-300'
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">나이 <span className="text-rose-400">*</span></label>
                  <input
                    required
                    type="number"
                    min={10}
                    max={99}
                    placeholder="25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* 계약 정보 */}
            <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-400">계약 정보</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">계약일(시작) <span className="text-rose-400">*</span></label>
                  <input
                    type="date"
                    value={contractMoveInDate}
                    onChange={(e) => handleContractStartChange(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">개월 수 <span className="text-rose-400">*</span></label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={60}
                      placeholder="3"
                      value={contractMonths}
                      onChange={(e) => handleContractMonthsChange(e.target.value)}
                      className={inputCls}
                    />
                    <span className="text-xs text-gray-500 shrink-0">개월</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">계약일(끝) <span className="text-gray-600 font-normal">(자동)</span></label>
                  <input
                    type="date"
                    value={contractEndDate}
                    onChange={(e) => setContractEndDate(e.target.value)}
                    className={`${inputCls} ${contractEndDate ? 'text-indigo-300' : ''}`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">실제 납부 월세</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      placeholder="70"
                      value={rentAmount}
                      onChange={(e) => setRentAmount(e.target.value)}
                      className={inputCls}
                    />
                    <span className="text-xs text-gray-500 shrink-0">만원</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">계약금</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      step={10000}
                      placeholder="200000"
                      value={contractDeposit}
                      onChange={(e) => setContractDeposit(e.target.value)}
                      className={inputCls}
                    />
                    <span className="text-xs text-gray-500 shrink-0">원</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">거주 목적</label>
                  {purposeCustom ? (
                    <div className="flex gap-1.5">
                      <input
                        autoFocus
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="직접 입력"
                        className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
                      />
                      <button type="button" onClick={() => { setPurposeCustom(false); setPurpose(''); }}
                        className="shrink-0 flex items-center justify-center h-10 w-10 rounded-lg border border-[#2A2A2A] text-gray-500 hover:text-white transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <select value={purpose} onChange={(e) => {
                      if (e.target.value === '__custom__') { setPurposeCustom(true); setPurpose(''); }
                      else setPurpose(e.target.value);
                    }} className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-indigo-500 appearance-none">
                      <option value="">선택 안 함</option>
                      {RESIDENCE_PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
                      {extraPurposes.map((p) => <option key={p} value={p}>{p}</option>)}
                      <option value="__custom__">+ 직접 입력</option>
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">부동산</label>
                  {agencyCustom ? (
                    <div className="flex gap-1.5">
                      <input
                        autoFocus
                        value={realEstateAgency}
                        onChange={(e) => setRealEstateAgency(e.target.value)}
                        placeholder="직접 입력"
                        className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
                      />
                      <button type="button" onClick={() => { setAgencyCustom(false); setRealEstateAgency(''); }}
                        className="shrink-0 flex items-center justify-center h-10 w-10 rounded-lg border border-[#2A2A2A] text-gray-500 hover:text-white transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <select value={realEstateAgency} onChange={(e) => {
                      if (e.target.value === '__custom__') { setAgencyCustom(true); setRealEstateAgency(''); }
                      else setRealEstateAgency(e.target.value);
                    }} className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-indigo-500 appearance-none">
                      <option value="">선택 안 함</option>
                      {REAL_ESTATE_AGENCIES.map((a) => <option key={a} value={a}>{a}</option>)}
                      {extraAgencies.map((a) => <option key={a} value={a}>{a}</option>)}
                      <option value="__custom__">+ 직접 입력</option>
                    </select>
                  )}
                </div>
              </div>
              {contractMoveInDate && contractEndDate && (
                <p className="text-[10px] text-indigo-400/70">
                  {contractMoveInDate} ~ {contractEndDate} ({contractMonths}개월)
                </p>
              )}
            </div>

            {/* 입실 정보 */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-400">입실 정보</p>
                <span className="text-[10px] text-gray-600">입실일 변경이 없으면 계약일(시작)이 자동 적용됩니다</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">입실일 <span className="text-gray-600 font-normal">(변경 시만 입력)</span></label>
                  <input
                    type="date"
                    value={actualMoveInDate}
                    onChange={(e) => handleActualMoveInChange(e.target.value)}
                    className={`${inputCls} focus:border-amber-500 ${moveInError ? 'border-rose-500 text-rose-400' : actualMoveInDate ? 'text-amber-300' : ''}`}
                  />
                  {moveInError && (
                    <p className="mt-1 text-[10px] text-rose-400">입실일은 계약일(시작) 이후여야 합니다</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">퇴실일 <span className="text-gray-600 font-normal">(자동 계산)</span></label>
                  <input
                    type="date"
                    value={moveOutDate}
                    onChange={(e) => setMoveOutDate(e.target.value)}
                    className={`${inputCls} ${moveOutDate ? 'text-emerald-300' : ''}`}
                  />
                </div>
              </div>
              {effectiveMoveIn && effectiveMoveOut && (
                <p className="text-[10px] text-amber-400/70">
                  입실 기준: <span className="font-semibold">{effectiveMoveIn}</span>
                  {actualMoveInDate && actualMoveInDate !== contractMoveInDate && (
                    <span className="text-gray-600 ml-1">(계약일 {contractMoveInDate}에서 변경)</span>
                  )}
                  {!actualMoveInDate && <span className="text-gray-600 ml-1">(계약일(시작) 자동 적용)</span>}
                  {' '}→ 월세 납부일 <span className="font-semibold">매월 {new Date(effectiveMoveIn).getDate()}일</span>
                </p>
              )}
            </div>

          </div>

          {/* 푸터 */}
          <div className="px-6 py-4 border-t border-[#2A2A2A] space-y-3">
            {saveError && (
              <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
                {saveError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] py-2.5 text-sm font-medium text-gray-300 hover:bg-[#2A2A2A] disabled:opacity-40 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={!canSubmit || saving}
                className="flex-1 rounded-lg bg-indigo-500 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? '저장 중…' : '등록하기'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
