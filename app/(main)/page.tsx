'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Plus, Pencil, Trash2, X, Check, Banknote, CalendarX, Repeat, Wrench, GripVertical } from 'lucide-react';
import {
  fetchTodos, insertTodo, updateTodo, deleteTodoById, type DbTodo,
  fetchRecurringTodos, insertRecurringTodo, updateRecurringTodo, deleteRecurringTodo, type DbRecurringTodo,
  fetchAllMaintenanceRecords, insertMaintenanceRecord, deleteMaintenanceRecord, type DbMaintenanceRecord,
  fetchAllRentPayments, type DbRentPayment,
  fetchCommonSpaces, insertCommonSpace, deleteCommonSpace, type DbCommonSpace,
} from '@/app/lib/supabase-data';
import { useRooms } from '@/app/context/RoomsContext';
import { DEFAULT_DETAIL_OPTIONS, DETAIL_OPTIONS_LS_KEY } from '@/app/components/OptionsManagerModal';
import { effectiveDueDay } from '@/app/lib/utils';

// ──────────── 타입 ────────────

type Todo = {
  id: string;
  date: string;
  text: string;
  done: boolean;
  color: string;
  sortOrder: number | null;
};

/** 월세 납부 대상자 + 그 달 납부 여부 */
type RentReminder = { name: string; paid: boolean };

type RecurringTodo = {
  id: string;
  text: string;
  color: string;
  recurrenceType: 'weekday' | 'date';
  weekdays: number[] | null;
  dayOfMonth: number | null;
  startDate: string;
  endDate: string;
};

// ──────────── 색상 설정 ────────────

const COLOR_OPTIONS = ['gray', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink'] as const;
type ColorKey = typeof COLOR_OPTIONS[number];

const COLOR_MAP: Record<ColorKey, { chip: string; dot: string }> = {
  gray:   { chip: 'bg-gray-700/60 text-gray-300',     dot: 'bg-gray-400' },
  red:    { chip: 'bg-red-500/20 text-red-300',       dot: 'bg-red-400' },
  orange: { chip: 'bg-orange-500/20 text-orange-300', dot: 'bg-orange-400' },
  yellow: { chip: 'bg-yellow-500/20 text-yellow-300', dot: 'bg-yellow-400' },
  green:  { chip: 'bg-green-500/20 text-green-300',   dot: 'bg-green-400' },
  blue:   { chip: 'bg-blue-500/20 text-blue-300',     dot: 'bg-blue-400' },
  indigo: { chip: 'bg-indigo-500/20 text-indigo-300', dot: 'bg-indigo-400' },
  purple: { chip: 'bg-purple-500/20 text-purple-300', dot: 'bg-purple-400' },
  pink:   { chip: 'bg-pink-500/20 text-pink-300',     dot: 'bg-pink-400' },
};

function colorStyle(color: string, done: boolean) {
  if (done) return 'bg-gray-700/40 text-gray-500 line-through';
  return COLOR_MAP[(color as ColorKey)] ? COLOR_MAP[color as ColorKey].chip : COLOR_MAP.gray.chip;
}
function dotClass(color: string) {
  return COLOR_MAP[(color as ColorKey)]?.dot ?? COLOR_MAP.gray.dot;
}

// ──────────── 상수 ────────────

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// ──────────── 헬퍼 ────────────

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}
function fromDb(db: DbTodo): Todo {
  return { id: db.id, date: db.date, text: db.text, done: db.done, color: db.color ?? 'gray', sortOrder: db.sort_order };
}
function fromDbRecurring(db: DbRecurringTodo): RecurringTodo {
  return {
    id: db.id,
    text: db.text,
    color: db.color ?? 'gray',
    recurrenceType: db.recurrence_type,
    weekdays: db.weekdays,
    dayOfMonth: db.day_of_month,
    startDate: db.start_date,
    endDate: db.end_date,
  };
}
function addYears(dateStr: string, years: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}
function getRecurringForDate(dateKey: string, recurringTodos: RecurringTodo[]): RecurringTodo[] {
  const date = new Date(dateKey + 'T00:00:00');
  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const daysInThisMonth = getDaysInMonth(year, month);
  return recurringTodos.filter((rt) => {
    if (dateKey < rt.startDate || dateKey > rt.endDate) return false;
    if (rt.recurrenceType === 'weekday') {
      return rt.weekdays?.includes(dayOfWeek) ?? false;
    } else {
      const effectiveDay = Math.min(rt.dayOfMonth!, daysInThisMonth);
      return dayOfMonth === effectiveDay;
    }
  });
}
function recurringDescription(rt: RecurringTodo): string {
  if (rt.recurrenceType === 'weekday') {
    const days = (rt.weekdays ?? []).slice().sort((a, b) => a - b).map((d) => WEEKDAYS[d]).join(', ');
    return `매주 ${days}`;
  }
  return `매월 ${rt.dayOfMonth}일`;
}

// ──────────── 색상 선택기 ────────────

function ColorPicker({ selected, onChange }: { selected: string; onChange: (c: string) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {COLOR_OPTIONS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`w-4 h-4 rounded-full transition-transform ${dotClass(c)} ${selected === c ? 'ring-2 ring-white/60 scale-125' : 'hover:scale-110'}`}
        />
      ))}
    </div>
  );
}

// ──────────── 공용 공간 관리 모달 ────────────

function CommonSpaceManagerModal({
  commonSpaces, onAdd, onDelete, onClose,
}: {
  commonSpaces: DbCommonSpace[];
  onAdd: (name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    const v = name.trim();
    if (!v || saving) return;
    setSaving(true);
    try {
      await onAdd(v);
      setName('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="flex w-full max-w-sm flex-col rounded-2xl border border-[#2A2A2A] bg-[#111] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-4">
          <div className="flex items-center gap-2">
            <Wrench size={16} className="text-violet-400" />
            <h2 className="text-base font-semibold text-white">공용 공간 관리</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-72 flex-1 overflow-y-auto p-4 space-y-2">
          {commonSpaces.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-500">등록된 공용 공간이 없습니다.</p>
          )}
          {commonSpaces.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#161616] px-4 py-2.5">
              <Wrench size={13} className="shrink-0 text-violet-400" />
              <span className="flex-1 text-sm text-white">{s.name}</span>
              <button onClick={() => onDelete(s.id)} className="rounded p-1 text-gray-500 hover:text-rose-400 hover:bg-[#222] transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-[#2A2A2A] p-4">
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              placeholder="예: 공용주방, 세탁실"
              className="flex-1 rounded-xl border border-[#2A2A2A] bg-[#161616] px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-violet-500 transition-colors"
            />
            <button
              onClick={submit}
              disabled={!name.trim() || saving}
              className="flex items-center gap-1.5 rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-400 transition-colors disabled:opacity-40"
            >
              <Plus size={15} />추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────── 반복 일정 관리 모달 ────────────

function RecurringTodoManagerModal({
  recurringTodos,
  onClose,
  onAdd,
  onUpdate,
  onDelete,
}: {
  recurringTodos: RecurringTodo[];
  onClose: () => void;
  onAdd: (rt: Omit<RecurringTodo, 'id'>) => Promise<void>;
  onUpdate: (id: string, rt: Omit<RecurringTodo, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const today = new Date();
  const todayStr = toDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formText, setFormText] = useState('');
  const [formColor, setFormColor] = useState<string>('indigo');
  const [formType, setFormType] = useState<'weekday' | 'date'>('weekday');
  const [formWeekdays, setFormWeekdays] = useState<number[]>([]);
  const [formDayOfMonth, setFormDayOfMonth] = useState<number>(1);
  const [formStartDate, setFormStartDate] = useState(todayStr);
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setEditingId(null);
    setFormText('');
    setFormColor('indigo');
    setFormType('weekday');
    setFormWeekdays([]);
    setFormDayOfMonth(1);
    setFormStartDate(todayStr);
    setShowForm(true);
  }

  function openEdit(rt: RecurringTodo) {
    setEditingId(rt.id);
    setFormText(rt.text);
    setFormColor(rt.color);
    setFormType(rt.recurrenceType);
    setFormWeekdays(rt.weekdays ?? []);
    setFormDayOfMonth(rt.dayOfMonth ?? 1);
    setFormStartDate(rt.startDate);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
  }

  async function saveForm() {
    if (!formText.trim() || saving) return;
    if (formType === 'weekday' && formWeekdays.length === 0) return;
    setSaving(true);
    try {
      const data: Omit<RecurringTodo, 'id'> = {
        text: formText.trim(),
        color: formColor,
        recurrenceType: formType,
        weekdays: formType === 'weekday' ? [...formWeekdays].sort((a, b) => a - b) : null,
        dayOfMonth: formType === 'date' ? formDayOfMonth : null,
        startDate: formStartDate,
        endDate: addYears(formStartDate, 5),
      };
      if (editingId) {
        await onUpdate(editingId, data);
      } else {
        await onAdd(data);
      }
      cancelForm();
    } finally {
      setSaving(false);
    }
  }

  function toggleWeekday(day: number) {
    setFormWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  const canSave = formText.trim() && (formType === 'date' || formWeekdays.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative flex w-full max-w-md flex-col rounded-2xl border border-[#2A2A2A] bg-[#111] shadow-2xl max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <Repeat size={16} className="text-indigo-400" />
            <h2 className="text-base font-semibold text-white">반복 일정 관리</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* List */}
          {!showForm && (
            <div className="p-4 space-y-2">
              {recurringTodos.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-500">등록된 반복 일정이 없습니다.</p>
              )}
              {recurringTodos.map((rt) => (
                <div key={rt.id} className="flex items-center gap-3 rounded-xl border border-[#2A2A2A] bg-[#161616] px-4 py-3">
                  <span className={`shrink-0 w-2.5 h-2.5 rounded-full ${dotClass(rt.color)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{rt.text}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{recurringDescription(rt)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(rt)}
                      className="rounded p-1.5 text-gray-500 hover:text-gray-300 hover:bg-[#222] transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => onDelete(rt.id)}
                      className="rounded p-1.5 text-gray-500 hover:text-rose-400 hover:bg-[#222] transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">내용</label>
                <input
                  autoFocus
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveForm(); if (e.key === 'Escape') cancelForm(); }}
                  placeholder="반복 일정 내용"
                  className="w-full rounded-xl border border-[#2A2A2A] bg-[#161616] px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">색상</label>
                <ColorPicker selected={formColor} onChange={setFormColor} />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">반복 유형</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormType('weekday')}
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
                      formType === 'weekday'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'border border-[#2A2A2A] text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    요일
                  </button>
                  <button
                    onClick={() => setFormType('date')}
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
                      formType === 'date'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'border border-[#2A2A2A] text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    날짜
                  </button>
                </div>
              </div>

              {formType === 'weekday' && (
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">요일 선택</label>
                  <div className="flex gap-1">
                    {WEEKDAYS.map((label, i) => (
                      <button
                        key={i}
                        onClick={() => toggleWeekday(i)}
                        className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
                          formWeekdays.includes(i)
                            ? i === 0
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : i === 6
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                            : 'border border-[#2A2A2A] text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formType === 'date' && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">매월 몇 일 (1–31)</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={formDayOfMonth}
                    onChange={(e) => setFormDayOfMonth(Math.min(31, Math.max(1, Number(e.target.value))))}
                    className="w-full rounded-xl border border-[#2A2A2A] bg-[#161616] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                  {formDayOfMonth > 28 && (
                    <p className="mt-1 text-xs text-gray-500">※ 날짜가 적은 달(2월 등)은 해당 월 마지막 날에 표시됩니다</p>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs text-gray-500 mb-1 block">시작일</label>
                <input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full rounded-xl border border-[#2A2A2A] bg-[#161616] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors [color-scheme:dark]"
                />
              </div>

              <div className="rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] px-3 py-2">
                <p className="text-xs text-gray-500">종료일 (시작일로부터 5년)</p>
                <p className="text-sm text-gray-300 mt-0.5">{addYears(formStartDate, 5)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#2A2A2A] px-4 py-3 shrink-0">
          {!showForm ? (
            <button
              onClick={openAdd}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors"
            >
              <Plus size={15} />
              반복 일정 추가
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={cancelForm}
                className="flex-1 rounded-xl border border-[#2A2A2A] py-2.5 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
              >
                취소
              </button>
              <button
                onClick={saveForm}
                disabled={saving || !canSave}
                className="flex-1 rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                {saving ? '저장 중...' : editingId ? '수정' : '추가'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────── Todo 모달 ────────────

function TodoModal({
  date, todos, recurringTodos, rentReminders, expiryReminders, maintenanceRecords,
  roomIds, commonSpaces, detailOptions,
  onAdd, onEdit, onDelete, onToggle, onColorChange, onReorder, onAddMaintenance, onDeleteMaintenance, onAddDetailOption, onClose,
}: {
  date: string;
  todos: Todo[];
  recurringTodos: RecurringTodo[];
  rentReminders: RentReminder[];
  expiryReminders: string[];
  maintenanceRecords: DbMaintenanceRecord[];
  roomIds: string[];
  commonSpaces: DbCommonSpace[];
  detailOptions: string[];
  onAdd: (text: string, color: string) => Promise<void>;
  onEdit: (id: string, text: string, color: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string) => Promise<void>;
  onColorChange: (id: string, color: string) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
  onAddMaintenance: (target: { roomId?: string; commonSpaceId?: string }, amount: number, details: string[]) => Promise<void>;
  onDeleteMaintenance: (id: string) => Promise<void>;
  onAddDetailOption: (v: string) => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState('');
  const [newColor, setNewColor] = useState<string>('indigo');

  // 유지보수 입력 — mode: 'room'(호실) | 'common'(공용 공간)
  const [maintMode, setMaintMode] = useState<'room' | 'common' | null>(null);
  const [maintTarget, setMaintTarget] = useState(''); // room id 또는 common space id
  const [maintDetails, setMaintDetails] = useState<string[]>([]);
  const [maintCustom, setMaintCustom] = useState('');
  const [showMaintCustom, setShowMaintCustom] = useState(false);
  const [maintAmount, setMaintAmount] = useState('');
  const [maintSaving, setMaintSaving] = useState(false);

  const commonSpaceName = (id: string | null) => commonSpaces.find((s) => s.id === id)?.name ?? '공용 공간';
  const maintLabel = (m: DbMaintenanceRecord) => m.common_space_id ? commonSpaceName(m.common_space_id) : `${m.room_id}호`;

  function openMaint(mode: 'room' | 'common') {
    setMaintMode(mode); setMaintTarget(''); setMaintDetails([]); setMaintCustom(''); setShowMaintCustom(false); setMaintAmount('');
  }
  function resetMaint() {
    setMaintMode(null); setMaintTarget(''); setMaintDetails([]); setMaintCustom(''); setShowMaintCustom(false); setMaintAmount('');
  }
  async function submitMaint() {
    if (!maintTarget || maintDetails.length === 0 || maintSaving) return;
    setMaintSaving(true);
    try {
      const target = maintMode === 'common' ? { commonSpaceId: maintTarget } : { roomId: maintTarget };
      await onAddMaintenance(target, Number(maintAmount) || 0, maintDetails);
      resetMaint();
    } finally {
      setMaintSaving(false);
    }
  }
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editColor, setEditColor] = useState<string>('gray');
  const [adding, setAdding] = useState(false);

  // 할일 순서 변경 (드래그 + 화살표)
  const [dragId, setDragId] = useState<string | null>(null);
  function moveTodo(fromIdx: number, toIdx: number) {
    if (toIdx < 0 || toIdx >= todos.length || fromIdx === toIdx) return;
    const ids = todos.map(t => t.id);
    const [m] = ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, m);
    onReorder(ids);
  }
  function dropOn(targetIdx: number) {
    if (!dragId) return;
    const fromIdx = todos.findIndex(t => t.id === dragId);
    setDragId(null);
    if (fromIdx === -1) return;
    moveTodo(fromIdx, targetIdx);
  }

  const [y, m, d] = date.split('-');
  const label = `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;

  async function submitAdd() {
    if (!input.trim() || adding) return;
    setAdding(true);
    try {
      await onAdd(input.trim(), newColor);
      setInput('');
    } finally {
      setAdding(false);
    }
  }
  async function submitEdit() {
    if (!editText.trim() || !editId) return;
    await onEdit(editId, editText.trim(), editColor);
    setEditId(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-y-auto rounded-2xl border border-[#2A2A2A] bg-[#111] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#2A2A2A] bg-[#111] px-6 py-4">
          <h2 className="text-lg font-semibold text-white">{label}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Todo list */}
        <div className="shrink-0 px-6 py-4 space-y-2">
          {todos.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">등록된 할일이 없습니다.</p>
          )}
          {todos.map((todo, idx) => (
            <div
              key={todo.id}
              draggable={editId !== todo.id}
              onDragStart={() => setDragId(todo.id)}
              onDragEnd={() => setDragId(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dropOn(idx)}
              className={`rounded-xl border bg-[#161616] overflow-hidden transition-colors ${
                dragId === todo.id ? 'border-indigo-500 opacity-60' : 'border-[#2A2A2A]'
              }`}
            >
              <div className="flex items-center gap-2 px-3 py-2.5">
                {/* 드래그 핸들 + 순서 화살표 */}
                <div className="flex shrink-0 items-center">
                  <span className="cursor-grab text-gray-600 hover:text-gray-400" title="드래그해서 순서 변경">
                    <GripVertical size={14} />
                  </span>
                  <div className="flex flex-col">
                    <button onClick={() => moveTodo(idx, idx - 1)} disabled={idx === 0}
                      className="text-gray-600 hover:text-indigo-400 disabled:opacity-25 disabled:hover:text-gray-600">
                      <ChevronUp size={12} />
                    </button>
                    <button onClick={() => moveTodo(idx, idx + 1)} disabled={idx === todos.length - 1}
                      className="text-gray-600 hover:text-indigo-400 disabled:opacity-25 disabled:hover:text-gray-600">
                      <ChevronDown size={12} />
                    </button>
                  </div>
                </div>

                {/* 완료 체크 */}
                <button
                  onClick={() => onToggle(todo.id)}
                  className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    todo.done ? 'bg-indigo-500 border-indigo-500' : 'border-gray-600 hover:border-indigo-400'
                  }`}
                >
                  {todo.done && <Check size={11} className="text-white" />}
                </button>

                {/* 색상 dot */}
                <span className={`shrink-0 w-2.5 h-2.5 rounded-full ${dotClass(todo.color)}`} />

                {/* 텍스트 */}
                {editId === todo.id ? (
                  <input
                    autoFocus
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitEdit(); if (e.key === 'Escape') setEditId(null); }}
                    className="flex-1 rounded-lg border border-indigo-500 bg-[#1A1A1A] px-2 py-1 text-sm text-white outline-none"
                  />
                ) : (
                  <span className={`flex-1 text-sm ${todo.done ? 'line-through text-gray-500' : 'text-gray-100'}`}>
                    {todo.text}
                  </span>
                )}

                {/* 편집/삭제 버튼 */}
                <div className="flex items-center gap-1 shrink-0">
                  {editId === todo.id ? (
                    <button onClick={submitEdit} className="rounded p-1 text-indigo-400 hover:bg-[#222] transition-colors">
                      <Check size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => { setEditId(todo.id); setEditText(todo.text); setEditColor(todo.color); }}
                      className="rounded p-1 text-gray-500 hover:text-gray-300 hover:bg-[#222] transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                  )}
                  <button onClick={() => onDelete(todo.id)} className="rounded p-1 text-gray-500 hover:text-rose-400 hover:bg-[#222] transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* 편집 모드일 때 색상 피커 노출 */}
              {editId === todo.id && (
                <div className="flex items-center gap-2 border-t border-[#2A2A2A] bg-[#111] px-3 py-2">
                  <span className="text-xs text-gray-500 shrink-0">색상</span>
                  <ColorPicker selected={editColor} onChange={setEditColor} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 반복 일정 */}
        {recurringTodos.length > 0 && (
          <div className="border-b border-[#2A2A2A] px-6 py-3 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-500/80 flex items-center gap-1">
              <Repeat size={10} />
              반복 일정
            </p>
            {recurringTodos.map((rt) => (
              <div key={rt.id} className="flex items-center gap-2 rounded-lg border border-[#2A2A2A] bg-[#161616] px-3 py-2">
                <span className={`shrink-0 w-2 h-2 rounded-full ${dotClass(rt.color)}`} />
                <span className="text-sm text-gray-200 flex-1">{rt.text}</span>
                <Repeat size={11} className="shrink-0 text-gray-600" />
              </div>
            ))}
          </div>
        )}

        {/* 월세 납부 알림 */}
        {rentReminders.length > 0 && (
          <div className="border-b border-[#2A2A2A] px-6 py-3 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-500/80">월세 납부일</p>
            {rentReminders.map((r) => (
              <div key={r.name}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                  r.paid ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-rose-500/20 bg-rose-500/10'
                }`}>
                <Banknote size={13} className={`shrink-0 ${r.paid ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span className={`flex-1 text-sm ${r.paid ? 'text-emerald-200' : 'text-rose-200'}`}>{r.name}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  r.paid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {r.paid ? '납부 완료' : '미납'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 계약 만료 알림 */}
        {expiryReminders.length > 0 && (
          <div className="border-b border-[#2A2A2A] px-6 py-3 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-500/80">계약 만료 1개월 전</p>
            {expiryReminders.map((name) => (
              <div key={name} className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2">
                <CalendarX size={13} className="shrink-0 text-rose-400" />
                <span className="text-sm text-rose-200">{name} 계약 만료 예정 (1개월 후)</span>
              </div>
            ))}
          </div>
        )}

        {/* 유지보수 */}
        <div className="border-b border-[#2A2A2A] px-6 py-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-500/80">유지보수</p>
            {maintMode === null && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openMaint('room')}
                  className="flex items-center gap-1 rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-300 hover:bg-violet-500/20 transition-colors"
                >
                  <Plus size={11} />추가
                </button>
                <button
                  onClick={() => openMaint('common')}
                  className="flex items-center gap-1 rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-300 hover:bg-violet-500/20 transition-colors"
                >
                  <Plus size={11} />공용 공간 이력 추가
                </button>
              </div>
            )}
          </div>

          {maintenanceRecords.map((m) => (
            <div key={m.id} className="flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2">
              <Wrench size={13} className="shrink-0 text-violet-400" />
              <span className="flex-1 text-sm text-violet-200">
                {maintLabel(m)} {m.details.join(', ')}
              </span>
              <span className="shrink-0 text-xs font-semibold text-violet-300">
                ₩{m.amount.toLocaleString('ko-KR')}
              </span>
              <button
                onClick={() => onDeleteMaintenance(m.id)}
                className="shrink-0 rounded p-0.5 text-gray-500 hover:text-rose-400 hover:bg-[#222] transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          {maintMode !== null && (
            <div className="rounded-xl border border-[#2A2A2A] bg-[#161616] p-3 space-y-2.5">
              <p className="text-[11px] font-semibold text-violet-300">
                {maintMode === 'common' ? '공용 공간 이력 추가' : '유지보수 추가'}
              </p>
              {/* 대상 선택 */}
              {maintMode === 'room' ? (
                <select
                  value={maintTarget}
                  onChange={(e) => setMaintTarget(e.target.value)}
                  className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2.5 py-1.5 text-sm text-white outline-none focus:border-violet-500"
                >
                  <option value="">호실 선택</option>
                  {roomIds.map((r) => <option key={r} value={r}>{r}호</option>)}
                </select>
              ) : commonSpaces.length === 0 ? (
                <p className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2.5 py-2 text-xs text-gray-500">
                  등록된 공용 공간이 없습니다. 상단 &lsquo;공용 공간&rsquo; 버튼에서 먼저 등록하세요.
                </p>
              ) : (
                <select
                  value={maintTarget}
                  onChange={(e) => setMaintTarget(e.target.value)}
                  className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2.5 py-1.5 text-sm text-white outline-none focus:border-violet-500"
                >
                  <option value="">공용 공간 선택</option>
                  {commonSpaces.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}

              {/* 선택된 항목 칩 */}
              {maintDetails.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {maintDetails.map((d) => (
                    <span key={d} className="flex items-center gap-1 rounded-md bg-violet-500/20 px-2 py-0.5 text-xs text-violet-200">
                      {d}
                      <button onClick={() => setMaintDetails((prev) => prev.filter((x) => x !== d))} className="text-violet-300/70 hover:text-white">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* 항목 선택 (직접 입력 포함) */}
              {!showMaintCustom ? (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value === '__custom__') { setShowMaintCustom(true); setMaintCustom(''); }
                    else if (e.target.value) setMaintDetails((prev) => prev.includes(e.target.value) ? prev : [...prev, e.target.value]);
                  }}
                  className="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2.5 py-1.5 text-sm text-white outline-none focus:border-violet-500"
                >
                  <option value="">항목 선택</option>
                  {detailOptions.filter((d) => !maintDetails.includes(d)).map((d) => <option key={d} value={d}>{d}</option>)}
                  <option value="__custom__">+ 직접 입력</option>
                </select>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    autoFocus
                    value={maintCustom}
                    onChange={(e) => setMaintCustom(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && maintCustom.trim()) {
                        const v = maintCustom.trim();
                        setMaintDetails((prev) => prev.includes(v) ? prev : [...prev, v]);
                        if (!detailOptions.includes(v)) onAddDetailOption(v);
                        setMaintCustom(''); setShowMaintCustom(false);
                      }
                      if (e.key === 'Escape') { setMaintCustom(''); setShowMaintCustom(false); }
                    }}
                    placeholder="직접 입력 후 Enter"
                    className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2.5 py-1.5 text-sm text-white placeholder:text-gray-600 outline-none focus:border-violet-500"
                  />
                  <button
                    onClick={() => { const v = maintCustom.trim(); if (v) { setMaintDetails((prev) => prev.includes(v) ? prev : [...prev, v]); if (!detailOptions.includes(v)) onAddDetailOption(v); } setMaintCustom(''); setShowMaintCustom(false); }}
                    className="shrink-0 rounded-lg bg-violet-500/20 px-2.5 text-xs font-semibold text-violet-300 hover:bg-violet-500/30 transition-colors"
                  >
                    추가
                  </button>
                  <button
                    onClick={() => { setMaintCustom(''); setShowMaintCustom(false); }}
                    className="shrink-0 flex items-center justify-center rounded-lg border border-[#2A2A2A] px-2 text-gray-500 hover:text-white transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}

              {/* 금액 */}
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step={1000}
                  value={maintAmount}
                  onChange={(e) => setMaintAmount(e.target.value)}
                  placeholder="금액"
                  className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2.5 py-1.5 text-sm text-white placeholder:text-gray-600 outline-none focus:border-violet-500"
                />
                <span className="shrink-0 text-xs text-gray-500">원</span>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={resetMaint} className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">취소</button>
                <button
                  onClick={submitMaint}
                  disabled={!maintTarget || maintDetails.length === 0 || maintSaving}
                  className="rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-400 transition-colors disabled:opacity-40"
                >
                  {maintSaving ? '저장 중…' : '저장'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add input */}
        <div className="sticky bottom-0 mt-auto border-t border-[#2A2A2A] bg-[#111] px-6 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">색상</span>
            <ColorPicker selected={newColor} onChange={setNewColor} />
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitAdd(); } }}
              placeholder="할일 입력 후 Enter"
              className="flex-1 rounded-xl border border-[#2A2A2A] bg-[#161616] px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="button"
              onClick={submitAdd}
              disabled={adding}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              <Plus size={15} />
              추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────── Main Page ────────────

export default function TodoListPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [recurringTodos, setRecurringTodos] = useState<RecurringTodo[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<DbMaintenanceRecord[]>([]);
  const [rentPayments, setRentPayments] = useState<DbRentPayment[]>([]);
  const [commonSpaces, setCommonSpaces] = useState<DbCommonSpace[]>([]);
  const [showCommonSpaceModal, setShowCommonSpaceModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<'all' | 'todo' | 'rent' | 'expiry' | 'maintenance'>('all');
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const { contracts, rooms } = useRooms();
  const [detailOptions, setDetailOptions] = useState<string[]>(DEFAULT_DETAIL_OPTIONS);

  const roomIds = useMemo(() => [...rooms].map((r) => r.id).sort((a, b) => a.localeCompare(b)), [rooms]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DETAIL_OPTIONS_LS_KEY);
      if (saved) setDetailOptions(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const loadTodos = useCallback(async () => {
    const data = await fetchTodos();
    setTodos(data.map(fromDb));
  }, []);

  const loadRecurringTodos = useCallback(async () => {
    const data = await fetchRecurringTodos();
    setRecurringTodos(data.map(fromDbRecurring));
  }, []);

  const loadMaintenance = useCallback(async () => {
    const data = await fetchAllMaintenanceRecords();
    setMaintenanceRecords(data);
  }, []);

  const loadRentPayments = useCallback(async () => {
    const data = await fetchAllRentPayments();
    setRentPayments(data);
  }, []);

  const loadCommonSpaces = useCallback(async () => {
    const data = await fetchCommonSpaces();
    setCommonSpaces(data);
  }, []);

  useEffect(() => { loadTodos(); }, [loadTodos]);
  useEffect(() => { loadRecurringTodos(); }, [loadRecurringTodos]);
  useEffect(() => { loadMaintenance(); }, [loadMaintenance]);
  useEffect(() => { loadRentPayments(); }, [loadRentPayments]);
  useEffect(() => { loadCommonSpaces(); }, [loadCommonSpaces]);

  const maintLabel = useCallback((m: DbMaintenanceRecord) => {
    if (m.common_space_id) return commonSpaces.find((s) => s.id === m.common_space_id)?.name ?? '공용 공간';
    return `${m.room_id}호`;
  }, [commonSpaces]);

  // (contract_id|YYYY-MM) → 그 달에 납부(paid) 여부
  const paidKeys = useMemo(() => {
    const set = new Set<string>();
    for (const p of rentPayments) {
      if (p.status === 'paid') set.add(`${p.contract_id}|${p.month}`);
    }
    return set;
  }, [rentPayments]);

  // 날짜별 유지보수 기록
  const maintenanceByDate = useMemo(() => {
    const map: Record<string, DbMaintenanceRecord[]> = {};
    for (const r of maintenanceRecords) {
      const key = r.date.slice(0, 10);
      (map[key] ??= []).push(r);
    }
    return map;
  }, [maintenanceRecords]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const todayKey = toDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());

  // 해당 월의 날짜별 계약 만료 1개월 전 알림
  const contractExpiryRemindersByDate = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const c of contracts) {
      if (c.status !== 'scheduled') continue;
      if (!c.contract_start_end) continue;
      if (c.actual_move_out_date) continue;
      const expiryDate = new Date(c.contract_start_end + 'T00:00:00');
      const reminderDate = new Date(expiryDate);
      reminderDate.setMonth(reminderDate.getMonth() - 1);
      if (reminderDate.getFullYear() === year && reminderDate.getMonth() + 1 === month) {
        const dateKey = toDateKey(year, month, reminderDate.getDate());
        if (!map[dateKey]) map[dateKey] = new Set();
        map[dateKey].add(c.name);
      }
    }
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, [...v]]));
  }, [contracts, year, month]);

  // 해당 월의 날짜별 월세 납부 대상자 + 납부 여부
  const rentRemindersByDate = useMemo(() => {
    const map: Record<string, RentReminder[]> = {};
    const displayMonth = `${year}-${String(month).padStart(2, '0')}`;
    for (const c of contracts) {
      if (c.status !== 'scheduled') continue;
      const moveIn = c.actual_move_in_date;
      if (!moveIn) continue;
      if (moveIn.slice(0, 7) > displayMonth) continue;
      const dueDay = effectiveDueDay(c.payment_due_day ?? new Date(moveIn).getDate(), year, month);
      const dateKey = toDateKey(year, month, dueDay);
      const paid = paidKeys.has(`${c.id}|${displayMonth}`);
      (map[dateKey] ??= []).push({ name: c.name, paid });
    }
    return map;
  }, [contracts, year, month, daysInMonth, paidKeys]);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  function todosFor(date: string) {
    return todos
      .filter(t => t.date === date)
      .sort((a, b) => {
        const ao = a.sortOrder, bo = b.sortOrder;
        if (ao != null && bo != null) return ao - bo;
        if (ao != null) return -1;   // 순서 지정된 것 먼저
        if (bo != null) return 1;
        return 0;                    // 둘 다 없으면 기존(생성) 순서 유지
      });
  }

  async function addTodo(text: string, color: string) {
    if (!selectedDate) return;
    // 그 날짜의 마지막 순서 뒤에 추가
    const dayTodos = todosFor(selectedDate);
    const maxOrder = dayTodos.reduce((mx, t) => t.sortOrder != null && t.sortOrder > mx ? t.sortOrder : mx, dayTodos.length - 1);
    const created = await insertTodo({ date: selectedDate, text, color, sort_order: maxOrder + 1 });
    setTodos(prev => [...prev, fromDb(created)]);
  }

  /** 특정 날짜의 할일 순서를 orderedIds 순으로 재배치 (0..n으로 저장) */
  async function reorderTodos(orderedIds: string[]) {
    setTodos(prev => prev.map(t => {
      const idx = orderedIds.indexOf(t.id);
      return idx >= 0 ? { ...t, sortOrder: idx } : t;
    }));
    await Promise.all(orderedIds.map((id, i) => updateTodo(id, { sort_order: i })));
  }
  async function editTodo(id: string, text: string, color: string) {
    const updated = await updateTodo(id, { text, color });
    setTodos(prev => prev.map(t => t.id === id ? fromDb(updated) : t));
  }
  async function deleteTodo(id: string) {
    await deleteTodoById(id);
    setTodos(prev => prev.filter(t => t.id !== id));
  }
  async function toggleTodo(id: string) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const updated = await updateTodo(id, { done: !todo.done });
    setTodos(prev => prev.map(t => t.id === id ? fromDb(updated) : t));
  }
  async function changeTodoColor(id: string, color: string) {
    const updated = await updateTodo(id, { color });
    setTodos(prev => prev.map(t => t.id === id ? fromDb(updated) : t));
  }

  async function addRecurringTodo(rt: Omit<RecurringTodo, 'id'>) {
    const created = await insertRecurringTodo({
      text: rt.text,
      color: rt.color,
      recurrence_type: rt.recurrenceType,
      weekdays: rt.weekdays,
      day_of_month: rt.dayOfMonth,
      start_date: rt.startDate,
      end_date: rt.endDate,
    });
    setRecurringTodos(prev => [...prev, fromDbRecurring(created)]);
  }
  async function editRecurringTodo(id: string, rt: Omit<RecurringTodo, 'id'>) {
    const updated = await updateRecurringTodo(id, {
      text: rt.text,
      color: rt.color,
      recurrence_type: rt.recurrenceType,
      weekdays: rt.weekdays,
      day_of_month: rt.dayOfMonth,
      start_date: rt.startDate,
      end_date: rt.endDate,
    });
    setRecurringTodos(prev => prev.map(r => r.id === id ? fromDbRecurring(updated) : r));
  }
  async function deleteRecurringTodoHandler(id: string) {
    await deleteRecurringTodo(id);
    setRecurringTodos(prev => prev.filter(r => r.id !== id));
  }

  async function addMaintenance(target: { roomId?: string; commonSpaceId?: string }, amount: number, details: string[]) {
    if (!selectedDate) return;
    const saved = await insertMaintenanceRecord({
      room_id: target.roomId ?? null,
      common_space_id: target.commonSpaceId ?? null,
      date: selectedDate, amount, details,
    });
    setMaintenanceRecords(prev => [...prev, saved]);
  }
  async function deleteMaintenance(id: string) {
    await deleteMaintenanceRecord(id);
    setMaintenanceRecords(prev => prev.filter(r => r.id !== id));
  }
  async function addCommonSpace(name: string) {
    const saved = await insertCommonSpace(name);
    setCommonSpaces(prev => [...prev, saved]);
  }
  async function removeCommonSpace(id: string) {
    await deleteCommonSpace(id);
    setCommonSpaces(prev => prev.filter(s => s.id !== id));
    // 해당 공용 공간의 유지보수 기록도 DB에서 cascade 삭제되므로 목록에서 제거
    setMaintenanceRecords(prev => prev.filter(r => r.common_space_id !== id));
  }
  function addDetailOption(v: string) {
    setDetailOptions((prev) => {
      if (prev.includes(v)) return prev;
      const next = [...prev, v];
      try { localStorage.setItem(DETAIL_OPTIONS_LS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedTodos = selectedDate ? todosFor(selectedDate) : [];
  const selectedRecurring = selectedDate ? getRecurringForDate(selectedDate, recurringTodos) : [];

  return (
    <main className="w-full space-y-6">
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#111] p-6 shadow-sm">
        {/* Month navigation + filter */}
        <div className="mb-6 flex items-center justify-between">
          {/* 필터 버튼 */}
          <div className="flex items-center gap-1 rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] p-1">
            {([
              { key: 'all',         label: '전체' },
              { key: 'todo',        label: '할일' },
              { key: 'rent',        label: '월세 납부' },
              { key: 'expiry',      label: '계약 만료' },
              { key: 'maintenance', label: '유지보수' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setViewFilter(key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewFilter === key
                    ? key === 'rent'
                      ? 'bg-amber-500/20 text-amber-300'
                      : key === 'expiry'
                        ? 'bg-rose-500/20 text-rose-300'
                        : key === 'maintenance'
                          ? 'bg-violet-500/20 text-violet-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 오른쪽: 공용 공간 + 반복 설정 + 월 이동 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCommonSpaceModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-colors"
            >
              <Wrench size={13} />
              공용 공간
            </button>
            <button
              onClick={() => setShowRecurringModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-colors"
            >
              <Repeat size={13} />
              반복 설정
            </button>
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-colors">
                <ChevronLeft size={18} />
              </button>
              <h2 className="text-lg font-bold text-white">{year}년 {month}월</h2>
              <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((day, i) => (
            <div key={day} className="py-2 text-center text-xs font-semibold"
              style={{ color: i === 0 ? '#f87171' : i === 6 ? '#60a5fa' : '#6b7280' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} />;
            const dateKey = toDateKey(year, month, day);
            const dayTodos = todosFor(dateKey);
            const dayRecurring = getRecurringForDate(dateKey, recurringTodos);
            const dayRentReminders = rentRemindersByDate[dateKey] ?? [];
            const dayExpiryReminders = contractExpiryRemindersByDate[dateKey] ?? [];
            const dayMaintenance = maintenanceByDate[dateKey] ?? [];
            const isToday = dateKey === todayKey;
            const isSun = idx % 7 === 0;
            const isSat = idx % 7 === 6;
            const show = (k: 'todo' | 'rent' | 'expiry' | 'maintenance') => viewFilter === 'all' || viewFilter === k;
            // 전체 보기일 때만 위쪽 블록과 구분선을 그림
            const divider = (hasAbove: boolean) =>
              viewFilter === 'all' && hasAbove ? 'mt-2 pt-2 border-t border-[#2A2A2A]' : '';

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(dateKey)}
                className="relative flex min-h-[160px] flex-col rounded-xl border border-[#1E1E1E] p-2 text-left transition-colors hover:border-indigo-500/40 hover:bg-[#161616]"
                style={{ backgroundColor: isToday ? '#1a1a2e' : undefined, borderColor: isToday ? '#4f46e5' : undefined }}
              >
                <span className="mb-1.5 text-sm font-semibold leading-none"
                  style={{ color: isToday ? '#818cf8' : isSun ? '#f87171' : isSat ? '#60a5fa' : '#d1d5db' }}>
                  {day}
                </span>
                <div className="flex flex-col gap-0.5 flex-1">
                  {show('todo') && (dayTodos.length > 0 || dayRecurring.length > 0) && (
                    <div className="flex flex-col gap-1">
                      {viewFilter === 'all' && <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">할일</span>}
                      {dayTodos.map((todo) => (
                        <div key={todo.id} className={`truncate rounded px-1.5 py-1 text-xs leading-tight ${colorStyle(todo.color, todo.done)}`}>
                          {todo.text}
                        </div>
                      ))}
                      {dayRecurring.map((rt) => (
                        <div key={`rt-${rt.id}`} className={`truncate rounded px-1.5 py-1 text-xs leading-tight flex items-center gap-1 ${colorStyle(rt.color, false)}`}>
                          <Repeat size={9} className="shrink-0 opacity-60" />
                          <span className="truncate">{rt.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {show('rent') && dayRentReminders.length > 0 && (
                    <div className={`flex flex-col gap-1 ${divider(dayTodos.length > 0 || dayRecurring.length > 0)}`}>
                      {viewFilter === 'all' && <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-600/80">월세</span>}
                      {dayRentReminders.map((r) => (
                        <div key={`rent-${r.name}`}
                          className={`flex items-center justify-between gap-1 truncate rounded px-1.5 py-1 text-xs leading-tight border ${
                            r.paid
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/20'
                          }`}>
                          <span className="truncate">{r.name}</span>
                          <span className="shrink-0 font-semibold">{r.paid ? '납부' : '미납'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {show('expiry') && dayExpiryReminders.length > 0 && (
                    <div className={`flex flex-col gap-1 ${divider(dayTodos.length > 0 || dayRecurring.length > 0 || dayRentReminders.length > 0)}`}>
                      {viewFilter === 'all' && <span className="text-[11px] font-semibold uppercase tracking-wide text-rose-600/80">만료 예정</span>}
                      {dayExpiryReminders.map((name) => (
                        <div key={`expiry-${name}`} className="truncate rounded px-1.5 py-1 text-xs leading-tight bg-rose-500/15 text-rose-300 border border-rose-500/20">
                          {name} 만료 1개월 전
                        </div>
                      ))}
                    </div>
                  )}
                  {show('maintenance') && dayMaintenance.length > 0 && (
                    <div className={`flex flex-col gap-1 ${divider(dayTodos.length > 0 || dayRecurring.length > 0 || dayRentReminders.length > 0 || dayExpiryReminders.length > 0)}`}>
                      {viewFilter === 'all' && <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-600/80">유지보수</span>}
                      {dayMaintenance.map((m) => (
                        <div key={`mt-${m.id}`} className="flex items-center gap-1 truncate rounded px-1.5 py-1 text-xs leading-tight bg-violet-500/15 text-violet-300 border border-violet-500/20">
                          <Wrench size={9} className="shrink-0 opacity-70" />
                          <span className="truncate">{maintLabel(m)} {m.details.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <TodoModal
          date={selectedDate}
          todos={selectedTodos}
          recurringTodos={selectedRecurring}
          rentReminders={rentRemindersByDate[selectedDate] ?? []}
          expiryReminders={contractExpiryRemindersByDate[selectedDate] ?? []}
          maintenanceRecords={maintenanceByDate[selectedDate] ?? []}
          roomIds={roomIds}
          commonSpaces={commonSpaces}
          detailOptions={detailOptions}
          onAdd={addTodo}
          onEdit={editTodo}
          onDelete={deleteTodo}
          onToggle={toggleTodo}
          onColorChange={changeTodoColor}
          onReorder={reorderTodos}
          onAddMaintenance={addMaintenance}
          onDeleteMaintenance={deleteMaintenance}
          onAddDetailOption={addDetailOption}
          onClose={() => setSelectedDate(null)}
        />
      )}

      {showRecurringModal && (
        <RecurringTodoManagerModal
          recurringTodos={recurringTodos}
          onClose={() => setShowRecurringModal(false)}
          onAdd={addRecurringTodo}
          onUpdate={editRecurringTodo}
          onDelete={deleteRecurringTodoHandler}
        />
      )}

      {showCommonSpaceModal && (
        <CommonSpaceManagerModal
          commonSpaces={commonSpaces}
          onAdd={addCommonSpace}
          onDelete={removeCommonSpace}
          onClose={() => setShowCommonSpaceModal(false)}
        />
      )}
    </main>
  );
}
