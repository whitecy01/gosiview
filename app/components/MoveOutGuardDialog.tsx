'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * 예약/입실자 추가 전, 같은 방의 현재 입실자에게 확정 퇴실일이 없을 때
 * 먼저 퇴실일을 지정하도록 막는 경고 다이얼로그 (인라인 입력).
 */
export default function MoveOutGuardDialog({
  roomId,
  occupantName,
  defaultDate,
  onConfirm,
  onCancel,
}: {
  roomId: string;
  occupantName: string;
  /** 기본 퇴실일 (보통 새 입실자의 입실일) */
  defaultDate: string;
  onConfirm: (moveOutDate: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(defaultDate || new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  async function confirm() {
    if (!date || saving) return;
    setSaving(true);
    try {
      await onConfirm(date);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onCancel}>
      <div className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-[#111] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h2 className="text-base font-semibold text-white">현재 입실자 퇴실 처리 필요</h2>
          </div>
          <button onClick={onCancel} className="rounded-lg p-1.5 text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm leading-relaxed text-gray-300">
            <span className="font-semibold text-white">{roomId}호</span>에 현재 입실자{' '}
            <span className="font-semibold text-amber-300">{occupantName}</span>님이 있습니다.
            <br />
            확정 퇴실일이 없어 이대로 예약을 추가하면 이 입실자가 이력에서 사라질 수 있습니다.
            먼저 <span className="font-semibold text-white">{occupantName}</span>님의 확정 퇴실일을 지정해주세요.
          </p>

          <div>
            <label className="mb-1.5 block text-xs text-gray-400">{occupantName}님 확정 퇴실일</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-[#2A2A2A] bg-[#161616] px-3 py-2 text-sm text-white outline-none focus:border-amber-500 [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#2A2A2A] px-6 py-4">
          <button onClick={onCancel} disabled={saving} className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-40">
            취소
          </button>
          <button
            onClick={confirm}
            disabled={!date || saving}
            className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-black hover:bg-amber-400 transition-colors disabled:opacity-40"
          >
            {saving ? '처리 중…' : '퇴실 처리하고 계속'}
          </button>
        </div>
      </div>
    </div>
  );
}
