'use client';

import { useState } from 'react';
import { X, CheckCircle2, XCircle, Clock3, Pencil } from 'lucide-react';
import type { Room, PaymentStatus } from '../lib/mock-data';

interface PaymentEditModalProps {
  entry: Room;
  onClose: () => void;
  onSave: (updated: Partial<Room>) => void;
}

const STATUS_OPTIONS: { value: PaymentStatus; label: string; color: string; icon: React.ReactNode }[] = [
  {
    value: 'paid',
    label: '납부 완료',
    color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  {
    value: 'overdue',
    label: '미납',
    color: 'border-rose-500/50 bg-rose-500/10 text-rose-300',
    icon: <XCircle className="h-4 w-4" />,
  },
  {
    value: 'upcoming',
    label: '납부 예정',
    color: 'border-amber-500/50 bg-amber-500/10 text-amber-300',
    icon: <Clock3 className="h-4 w-4" />,
  },
];

export default function PaymentEditModal({ entry, onClose, onSave }: PaymentEditModalProps) {
  const [status, setStatus] = useState<PaymentStatus>(entry.paymentStatus ?? 'upcoming');
  const [paidAt, setPaidAt] = useState(entry.paidAt ?? '');
  const [monthlyRent, setMonthlyRent] = useState(
    entry.monthlyRent ? entry.monthlyRent.replace(/[₩,]/g, '') : ''
  );
  const handleSave = () => {
    const rentValue = monthlyRent ? `₩${Number(monthlyRent).toLocaleString()}` : entry.monthlyRent;
    onSave({
      paymentStatus: status,
      paidAt: paidAt || null,
      monthlyRent: rentValue,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#2A2A2A] bg-[#111] shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-indigo-400" />
            <div>
              <h2 className="text-sm font-semibold text-white">납부 정보 수정</h2>
              <p className="text-xs text-gray-500">{entry.id}호 · {entry.resident}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-[#2A2A2A] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* 납부 상태 */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">납부 상태</label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setStatus(opt.value);
                    if (opt.value !== 'paid') setPaidAt('');
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-medium transition-colors ${
                    status === opt.value
                      ? opt.color
                      : 'border-[#2A2A2A] bg-[#1A1A1A] text-gray-500 hover:border-[#3A3A3A]'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 실제 납부일 */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              실제 납부일
              {status !== 'paid' && <span className="ml-1 text-gray-600">(납부 완료 시 입력)</span>}
            </label>
            <input
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              disabled={status !== 'paid'}
              className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors [color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* 월세 금액 */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">월세 금액 (원)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₩</span>
              <input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                placeholder="700000"
                className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2.5 pl-7 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
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
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-lg bg-indigo-500 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 transition-colors"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
