"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Search, CalendarDays, Wrench, ChevronRight, Plus, Trash2, Pencil } from "lucide-react";
import {
  ALL_ROOMS,
  SCHEDULED_BY_ROOM,
  MAINTENANCE_BY_ROOM,
  type Room,
  type ScheduledResident,
  type MaintenanceRecord,
} from "../lib/mock-data";

const DETAIL_OPTIONS = ["도배", "매트리스교체", "에어컨청소", "전구교체", "장판교체", "화장실청소"];

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
  labelColor = "indigo",
}: {
  initial: Partial<ScheduledResident>;
  onSave: (r: ScheduledResident) => void;
  onCancel: () => void;
  labelColor?: string;
}) {
  const [name, setName] = useState(initial.name ?? "");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [gender, setGender] = useState<'남' | '여'>(initial.gender ?? '남');
  const [age, setAge] = useState(String(initial.age ?? ""));
  const [contractMoveInDate, setContractMoveInDate] = useState(initial.contractMoveInDate ?? "");
  const [actualMoveInDate, setActualMoveInDate] = useState(initial.actualMoveInDate ?? "");
  const [moveOutDate, setMoveOutDate] = useState(initial.moveOutDate ?? "");

  const accentCls = labelColor === "indigo" ? "focus:border-indigo-500" : "focus:border-indigo-500";
  const inputCls = `w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-gray-600 ${accentCls}`;

  function handleSave() {
    if (!name || !phone || !age || !contractMoveInDate) return;
    onSave({
      name, phone, gender, age: Number(age),
      contractMoveInDate,
      actualMoveInDate: actualMoveInDate || undefined,
      moveOutDate: moveOutDate || undefined,
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">이름 <span className="text-rose-500">*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">연락처 <span className="text-rose-500">*</span></label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">성별</label>
          <div className="flex rounded-lg border border-[#2A2A2A] overflow-hidden">
            {(['남', '여'] as const).map((g) => (
              <button key={g} onClick={() => setGender(g)} className={`flex-1 py-2 text-xs font-semibold transition-colors ${gender === g ? (g === '남' ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300') : 'text-gray-500 hover:text-gray-300'}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">나이 <span className="text-rose-500">*</span></label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">계약 입실일 <span className="text-rose-500">*</span></label>
          <input type="date" value={contractMoveInDate} onChange={(e) => setContractMoveInDate(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">실제 입실일 <span className="text-gray-600">(선택)</span></label>
          <input type="date" value={actualMoveInDate} onChange={(e) => setActualMoveInDate(e.target.value)} className={`${inputCls} focus:border-amber-500`} />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">퇴실 예정일 <span className="text-gray-600">(선택)</span></label>
          <input type="date" value={moveOutDate} onChange={(e) => setMoveOutDate(e.target.value)} className={inputCls} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-xs text-gray-400 transition-colors hover:text-white">취소</button>
        <button onClick={handleSave} disabled={!name || !phone || !age || !contractMoveInDate} className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed">저장</button>
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
}: {
  room: Room;
  records: ScheduledResident[];
  onAdd: (r: ScheduledResident) => void;
  onUpdate: (i: number, r: ScheduledResident) => void;
  onDelete: (i: number) => void;
  onClose: () => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const hasRecord = records.length > 0;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#2A2A2A] bg-[#0E0E0E] shadow-2xl max-h-[88vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-5 shrink-0">
          <div>
            <h3 className="text-base font-semibold text-white">예정 입실 정보</h3>
            <p className="mt-0.5 text-sm text-gray-400">{room.id}호 · 앞으로 예정된 입실 일정</p>
          </div>
          <div className="flex items-center gap-2">
            {!hasRecord && (
              <button
                onClick={() => { setShowAddForm((v) => !v); setEditingIdx(null); }}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20"
              >
                <Plus className="h-3.5 w-3.5" />추가
              </button>
            )}
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-[#1A1A1A] hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 현재 입실자 퇴실일 */}
        {room.status === 'occupied' && room.moveOutDate && (
          <div className="px-6 py-3 bg-emerald-500/5 border-b border-emerald-500/15 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-xs text-gray-400">현재 입실자</span>
              <span className="text-xs font-semibold text-white">{room.resident}</span>
              <span className="text-xs text-gray-600">·</span>
              <span className="text-xs text-gray-400">퇴실 예정</span>
              <span className="text-xs font-semibold text-emerald-400">{room.moveOutDate}</span>
            </div>
          </div>
        )}

        {/* 추가 폼 */}
        {showAddForm && (
          <div className="border-b border-[#2A2A2A] px-6 py-4 shrink-0 bg-[#111]">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-3">새 예정 입실자 추가</p>
            <ResidentForm
              initial={{}}
              onSave={(r) => { onAdd(r); setShowAddForm(false); }}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* 예정 입실자 */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!hasRecord ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CalendarDays className="h-8 w-8 text-gray-600 mb-3" />
              <p className="text-sm text-gray-500">예정된 입실 일정이 없습니다.</p>
            </div>
          ) : (
            <div className={`rounded-xl border bg-[#161616] p-4 transition-colors ${editingIdx === 0 ? 'border-indigo-500/40' : 'border-[#2A2A2A]'}`}>
              {editingIdx === 0 ? (
                <>
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-3">정보 수정</p>
                  <ResidentForm
                    initial={records[0]}
                    onSave={(updated) => { onUpdate(0, updated); setEditingIdx(null); }}
                    onCancel={() => setEditingIdx(null)}
                  />
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm font-bold text-indigo-400">
                        {records[0].name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{records[0].name}</span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border ${records[0].gender === '남' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-pink-500/10 text-pink-400 border-pink-500/20'}`}>{records[0].gender}</span>
                          <span className="text-xs text-gray-500">{records[0].age}세</span>
                        </div>
                        <p className="mt-0.5 text-xs text-teal-400">{records[0].phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => { setEditingIdx(0); setShowAddForm(false); }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-indigo-500/10 hover:text-indigo-400"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(0)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 rounded-lg bg-[#1A1A1A] px-3 py-2 text-xs">
                      <span className="text-gray-500 shrink-0 font-medium">계약일</span>
                      <span className="text-indigo-400 font-semibold">{records[0].contractMoveInDate}</span>
                      <span className="text-gray-600 shrink-0">→</span>
                      {records[0].moveOutDate
                        ? <span className="text-gray-300 font-semibold">{records[0].moveOutDate}</span>
                        : <span className="text-gray-600 italic">퇴실일 미정</span>}
                    </div>
                    {records[0].actualMoveInDate && (
                      <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs border ${records[0].actualMoveInDate !== records[0].contractMoveInDate ? 'bg-amber-500/8 border-amber-500/20' : 'bg-[#1A1A1A] border-transparent'}`}>
                        <span className="text-gray-500 shrink-0 font-medium">입실일</span>
                        <span className={`font-semibold ${records[0].actualMoveInDate !== records[0].contractMoveInDate ? 'text-amber-400' : 'text-gray-300'}`}>{records[0].actualMoveInDate}</span>
                        {records[0].actualMoveInDate !== records[0].contractMoveInDate && (
                          <span className="text-amber-500/70 text-[10px]">계약일과 다름</span>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
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
  onDelete: (index: number) => void;
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
                                    onClick={() => onDelete(index)}
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
  const [scheduledData, setScheduledData] = useState<Record<string, ScheduledResident[]>>(
    () => ({ ...SCHEDULED_BY_ROOM })
  );
  const [maintenanceData, setMaintenanceData] = useState<Record<string, MaintenanceRecord[]>>(
    () => ({ ...MAINTENANCE_BY_ROOM })
  );


  function handleAddScheduled(roomId: string, record: ScheduledResident) {
    setScheduledData((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] ?? []), record],
    }));
  }

  function handleDeleteScheduled(roomId: string, index: number) {
    setScheduledData((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] ?? []).filter((_, i) => i !== index),
    }));
  }

  function handleUpdateScheduled(roomId: string, index: number, record: ScheduledResident) {
    setScheduledData((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] ?? []).map((r, i) => (i === index ? record : r)),
    }));
  }

  function handleAddRecord(roomId: string, record: MaintenanceRecord) {
    setMaintenanceData((prev) => ({
      ...prev,
      [roomId]: [record, ...(prev[roomId] ?? [])],
    }));
  }

  function handleDeleteRecord(roomId: string, index: number) {
    setMaintenanceData((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] ?? []).filter((_, i) => i !== index),
    }));
  }

  const keyword = search.trim().toLowerCase();
  const filtered = ALL_ROOMS.filter((room) => {
    if (!keyword) return true;
    return (
      room.id.includes(keyword) ||
      (room.resident ?? "").toLowerCase().includes(keyword) ||
      (room.phone ?? "").includes(keyword)
    );
  });

  const statusLabel: Record<string, string> = {
    occupied: "입실",
    vacant: "공실",
    maintenance: "점검",
  };
  const statusStyle: Record<string, string> = {
    occupied: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
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

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b border-[#2A2A2A] text-xs uppercase tracking-wide">
              <tr>
                <th className="px-6 py-4 font-medium bg-indigo-500/10 text-indigo-400">호실</th>
                <th className="px-6 py-4 font-medium bg-violet-500/10 text-violet-400">이름</th>
                <th className="px-6 py-4 font-medium bg-teal-500/10 text-teal-400">연락처</th>
                <th className="px-6 py-4 font-medium bg-[#1A1A1A] text-gray-400">상태</th>
                <th className="px-6 py-4 font-medium bg-[#1A1A1A] text-gray-400">예정 입실</th>
                <th className="px-6 py-4 font-medium bg-[#1A1A1A] text-gray-400">방 관리</th>
                <th className="px-6 py-4 font-medium bg-[#1A1A1A] text-gray-400">상세</th>
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
                      {room.resident ? (
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
                      <span className="font-medium text-teal-400">{room.phone ?? "-"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyle[room.status]}`}>
                        {statusLabel[room.status]}
                      </span>
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
                        {hasScheduled ? "있음" : "없음"}
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
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {scheduledRoom && (
        <ScheduledInfoModal
          room={scheduledRoom}
          records={scheduledData[scheduledRoom.id] ?? []}
          onAdd={(r) => handleAddScheduled(scheduledRoom.id, r)}
          onUpdate={(i, r) => handleUpdateScheduled(scheduledRoom.id, i, r)}
          onDelete={(i) => handleDeleteScheduled(scheduledRoom.id, i)}
          onClose={() => setScheduledRoom(null)}
        />
      )}
      {managementRoom && (
        <RoomManagementModal
          room={managementRoom}
          records={maintenanceData[managementRoom.id] ?? []}
          onAdd={(record) => handleAddRecord(managementRoom.id, record)}
          onDelete={(index) => handleDeleteRecord(managementRoom.id, index)}
          onClose={() => setManagementRoom(null)}
        />
      )}
    </>
  );
}
