"use client";

import { useState } from "react";
import { X, Plus, Pencil, Trash2, Settings } from "lucide-react";

export const PURPOSES_LS_KEY = "gosi_purposes";
export const AGENCIES_LS_KEY = "gosi_agencies";
export const DETAIL_OPTIONS_LS_KEY = "gosi_detail_options";
export const DEFAULT_PURPOSES = ["공시생(임용)", "공시생(일행)", "공시생(소방)", "공시생(경찰)", "세무·회계·계리", "취준생", "수능", "직장"];
export const DEFAULT_AGENCIES = ["부동산 A", "부동산 B", "부동산 C", "직거래"];
export const DEFAULT_DETAIL_OPTIONS = ["도배", "매트리스교체", "에어컨청소", "전구교체", "장판교체", "화장실청소"];

function OptionSection({ title, items, onChange }: { title: string; items: string[]; onChange: (v: string[]) => void }) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");
  const [newVal, setNewVal] = useState("");
  const inputCls = "flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-indigo-500";

  function saveEdit() {
    if (editIdx === null || !editVal.trim()) return;
    const next = [...items];
    next[editIdx] = editVal.trim();
    onChange(next);
    setEditIdx(null);
  }
  function addItem() {
    const v = newVal.trim();
    if (!v || items.includes(v)) return;
    onChange([...items, v]);
    setNewVal("");
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</p>
      <div className="space-y-1 mb-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg bg-[#1A1A1A] px-3 py-2">
            {editIdx === i ? (
              <>
                <input autoFocus value={editVal} onChange={(e) => setEditVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditIdx(null); }}
                  className="flex-1 bg-transparent text-sm text-white outline-none" />
                <button onClick={saveEdit} className="text-xs text-indigo-400 hover:text-indigo-300 shrink-0">저장</button>
                <button onClick={() => setEditIdx(null)} className="text-gray-600 hover:text-gray-400 shrink-0"><X className="h-3 w-3" /></button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-gray-300">{item}</span>
                <button onClick={() => { setEditIdx(i); setEditVal(item); }} className="text-gray-600 hover:text-gray-400 shrink-0"><Pencil className="h-3 w-3" /></button>
                <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-gray-600 hover:text-rose-400 shrink-0"><Trash2 className="h-3 w-3" /></button>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={newVal} onChange={(e) => setNewVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="새 항목 추가 후 Enter"
          className={inputCls} />
        <button onClick={addItem}
          className="shrink-0 flex items-center gap-1 rounded-lg bg-indigo-500/20 px-3 py-2 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/30 transition-colors">
          <Plus className="h-3.5 w-3.5" />추가
        </button>
      </div>
    </div>
  );
}

// 단일 카테고리 모달 (거주 목적 또는 부동산 하나씩)
export function SingleOptionManagerModal({
  title, items, onChange, onClose,
}: {
  title: string; items: string[];
  onChange: (v: string[]) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#2A2A2A] bg-[#111] shadow-2xl flex flex-col max-h-[75vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">{title} 옵션 관리</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-[#2A2A2A] hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">
          <OptionSection title={title} items={items} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}

// 거주 목적 + 부동산 + 관리 항목 통합 모달 (입실자 목록 헤더 버튼용)
export function OptionsManagerModal({
  purposes, agencies, detailOptions, onPurposesChange, onAgenciesChange, onDetailOptionsChange, onClose,
}: {
  purposes: string[]; agencies: string[]; detailOptions: string[];
  onPurposesChange: (v: string[]) => void; onAgenciesChange: (v: string[]) => void;
  onDetailOptionsChange: (v: string[]) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#2A2A2A] bg-[#111] shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">옵션 관리</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-[#2A2A2A] hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          <OptionSection title="거주 목적" items={purposes} onChange={onPurposesChange} />
          <div className="border-t border-[#2A2A2A]" />
          <OptionSection title="부동산" items={agencies} onChange={onAgenciesChange} />
          <div className="border-t border-[#2A2A2A]" />
          <OptionSection title="관리 항목" items={detailOptions} onChange={onDetailOptionsChange} />
        </div>
      </div>
    </div>
  );
}
