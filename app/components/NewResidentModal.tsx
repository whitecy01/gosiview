'use client';

import { useState } from 'react';
import { X, UserPlus, CheckCircle2, ChevronDown } from 'lucide-react';
import { ALL_ROOMS, ROOM_TYPE_INFO } from '@/app/lib/mock-data';

interface NewResidentModalProps {
  onClose: () => void;
  initialRoomId?: string;
}

const FLOOR_LABELS: Record<number, string> = {
  1: '1층', 2: '2층', 3: '3층', 4: '4층', 5: '5층', 6: '6층',
};

export default function NewResidentModal({ onClose, initialRoomId = '' }: NewResidentModalProps) {
  const vacantRooms = ALL_ROOMS.filter((r) => r.status === 'vacant');

  const [form, setForm] = useState({
    roomId: initialRoomId,
    name: '',
    gender: '' as '남' | '여' | '',
    age: '',
    moveInDate: '',
    moveOutDate: '',
    paymentDay: '5',
  });
  const [submitted, setSubmitted] = useState(false);

  const selectedRoom = ALL_ROOMS.find((r) => r.id === form.roomId);
  const typeInfo = selectedRoom ? ROOM_TYPE_INFO[selectedRoom.roomType] : null;
  const monthlyRent = typeInfo
    ? `₩${typeInfo.price.toLocaleString()}`
    : null;

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  // Success screen
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-2xl border border-[#2A2A2A] bg-[#111] p-8 shadow-2xl text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">등록 완료</h3>
          <p className="text-gray-400 mb-1">
            <span className="text-white font-semibold">{form.name}</span>님이
          </p>
          <p className="text-gray-400 mb-6">
            <span className="text-white font-semibold">
              {selectedRoom?.name}
            </span>
            에 입실 등록되었습니다.
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
        {/* Header */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-6 py-5 space-y-5">

            {/* 호실 선택 */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">호실 선택 <span className="text-rose-400">*</span></label>
              <div className="relative">
                <select
                  required
                  value={form.roomId}
                  onChange={(e) => set('roomId', e.target.value)}
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
              {selectedRoom && (
                <div className="mt-2 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{selectedRoom.roomType}</span>
                  <span className="text-sm font-semibold text-indigo-300">{monthlyRent} / 월</span>
                </div>
              )}
            </div>

            {/* 이름 */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">이름 <span className="text-rose-400">*</span></label>
              <input
                required
                type="text"
                placeholder="홍길동"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            {/* 성별 + 나이 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">성별 <span className="text-rose-400">*</span></label>
                <div className="flex gap-2">
                  {(['남', '여'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => set('gender', g)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                        form.gender === g
                          ? g === '남'
                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                            : 'bg-pink-500/20 border-pink-500/50 text-pink-300'
                          : 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-400 hover:border-[#3A3A3A]'
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
                  value={form.age}
                  onChange={(e) => set('age', e.target.value)}
                  className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* 입실일 + 퇴실일 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">입실일 <span className="text-rose-400">*</span></label>
                <input
                  required
                  type="date"
                  value={form.moveInDate}
                  onChange={(e) => set('moveInDate', e.target.value)}
                  className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">퇴실 예정일 <span className="text-rose-400">*</span></label>
                <input
                  required
                  type="date"
                  value={form.moveOutDate}
                  onChange={(e) => set('moveOutDate', e.target.value)}
                  className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors [color-scheme:dark]"
                />
              </div>
            </div>

            {/* 월세 납부일 */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">월세 납부일 (매월 몇 일)</label>
              <div className="relative">
                <select
                  value={form.paymentDay}
                  onChange={(e) => set('paymentDay', e.target.value)}
                  className="w-full appearance-none rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors pr-8"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>매월 {d}일</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#2A2A2A] flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] py-2.5 text-sm font-medium text-gray-300 hover:bg-[#2A2A2A] transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!form.gender}
              className="flex-1 rounded-lg bg-indigo-500 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
