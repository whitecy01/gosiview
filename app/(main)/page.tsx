'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X, Check, Banknote, CalendarX } from 'lucide-react';
import { fetchTodos, insertTodo, updateTodo, deleteTodoById, type DbTodo } from '@/app/lib/supabase-data';
import { useRooms } from '@/app/context/RoomsContext';

// ──────────── 타입 ────────────

type Todo = {
  id: string;
  date: string;
  text: string;
  done: boolean;
  color: string;
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
  return { id: db.id, date: db.date, text: db.text, done: db.done, color: db.color ?? 'gray' };
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

// ──────────── Todo 모달 ────────────

function TodoModal({
  date, todos, rentReminders, expiryReminders, onAdd, onEdit, onDelete, onToggle, onColorChange, onClose,
}: {
  date: string;
  todos: Todo[];
  rentReminders: string[];
  expiryReminders: string[];
  onAdd: (text: string, color: string) => Promise<void>;
  onEdit: (id: string, text: string, color: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string) => Promise<void>;
  onColorChange: (id: string, color: string) => Promise<void>;
  onClose: () => void;
}) {
  const [input, setInput] = useState('');
  const [newColor, setNewColor] = useState<string>('indigo');
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editColor, setEditColor] = useState<string>('gray');
  const [adding, setAdding] = useState(false);

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
        className="relative flex w-full max-w-md flex-col rounded-2xl border border-[#2A2A2A] bg-[#111] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-4">
          <h2 className="text-base font-semibold text-white">{label}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* 월세 납부 알림 */}
        {rentReminders.length > 0 && (
          <div className="border-b border-[#2A2A2A] px-6 py-3 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-500/80">월세 납부일</p>
            {rentReminders.map((name) => (
              <div key={name} className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2">
                <Banknote size={13} className="shrink-0 text-amber-400" />
                <span className="text-sm text-amber-200">{name} 월세 납부 필요</span>
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

        {/* Todo list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 max-h-72">
          {todos.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">등록된 할일이 없습니다.</p>
          )}
          {todos.map((todo) => (
            <div key={todo.id} className="rounded-xl border border-[#2A2A2A] bg-[#161616] overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2.5">
                {/* 완료 체크 */}
                <button
                  onClick={() => onToggle(todo.id)}
                  className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    todo.done ? 'bg-indigo-500 border-indigo-500' : 'border-gray-600 hover:border-indigo-400'
                  }`}
                >
                  {todo.done && <Check size={11} className="text-white" />}
                </button>

                {/* 색상 dot (현재 색상 표시) */}
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

        {/* Add input */}
        <div className="border-t border-[#2A2A2A] px-6 py-4 space-y-3">
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<'all' | 'todo' | 'rent' | 'expiry'>('all');
  const { contracts } = useRooms();

  const loadTodos = useCallback(async () => {
    const data = await fetchTodos();
    setTodos(data.map(fromDb));
  }, []);

  useEffect(() => { loadTodos(); }, [loadTodos]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const todayKey = toDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());

  // 해당 월의 날짜별 계약 만료 1개월 전 알림
  const contractExpiryRemindersByDate = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const c of contracts) {
      if (c.status !== 'scheduled') continue;
      if (!c.contract_start_end) continue;
      if (c.actual_move_out_date) continue; // 확정 퇴실일 있으면 제외
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

  // 해당 월의 날짜별 월세 납부 대상자 이름 목록
  const rentRemindersByDate = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    const displayMonth = `${year}-${String(month).padStart(2, '0')}`;
    for (const c of contracts) {
      if (c.status !== 'scheduled') continue;
      const moveIn = c.actual_move_in_date;
      if (!moveIn) continue;
      if (moveIn.slice(0, 7) > displayMonth) continue;
      const dueDay = Math.min(c.payment_due_day ?? new Date(moveIn).getDate(), daysInMonth);
      const dateKey = toDateKey(year, month, dueDay);
      if (!map[dateKey]) map[dateKey] = new Set();
      map[dateKey].add(c.name);
    }
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, [...v]]));
  }, [contracts, year, month, daysInMonth]);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  function todosFor(date: string) { return todos.filter(t => t.date === date); }

  async function addTodo(text: string, color: string) {
    if (!selectedDate) return;
    const created = await insertTodo({ date: selectedDate, text, color });
    setTodos(prev => [...prev, fromDb(created)]);
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

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedTodos = selectedDate ? todosFor(selectedDate) : [];

  return (
    <main className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Todo List</h1>
        <p className="mt-1 text-sm text-gray-400">날짜를 클릭해 할일을 추가·수정·삭제하세요.</p>
      </div>

      <div className="rounded-2xl border border-[#2A2A2A] bg-[#111] p-6 shadow-sm">
        {/* Month navigation + filter */}
        <div className="mb-6 flex items-center justify-between">
          {/* 필터 버튼 */}
          <div className="flex items-center gap-1 rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] p-1">
            {([
              { key: 'all',    label: '전체' },
              { key: 'todo',   label: '할일' },
              { key: 'rent',   label: '월세 납부' },
              { key: 'expiry', label: '계약 만료' },
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
                        : 'bg-indigo-500/20 text-indigo-300'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 월 이동 */}
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
            const dayRentReminders = rentRemindersByDate[dateKey] ?? [];
            const dayExpiryReminders = contractExpiryRemindersByDate[dateKey] ?? [];
            const isToday = dateKey === todayKey;
            const isSun = idx % 7 === 0;
            const isSat = idx % 7 === 6;

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
                  {viewFilter !== 'rent' && viewFilter !== 'expiry' && dayTodos.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {viewFilter === 'all' && <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-600">할일</span>}
                      {dayTodos.map((todo) => (
                        <div key={todo.id} className={`truncate rounded px-1.5 py-1 text-xs leading-tight ${colorStyle(todo.color, todo.done)}`}>
                          {todo.text}
                        </div>
                      ))}
                    </div>
                  )}
                  {viewFilter !== 'todo' && viewFilter !== 'expiry' && dayRentReminders.length > 0 && (
                    <div className={`flex flex-col gap-1 ${viewFilter === 'all' && dayTodos.length > 0 ? 'mt-2 pt-2 border-t border-[#2A2A2A]' : ''}`}>
                      {viewFilter === 'all' && <span className="text-[9px] font-semibold uppercase tracking-wide text-amber-600/80">월세</span>}
                      {dayRentReminders.map((name) => (
                        <div key={`rent-${name}`} className="truncate rounded px-1.5 py-1 text-xs leading-tight bg-amber-500/15 text-amber-300 border border-amber-500/20">
                          {name} 납부
                        </div>
                      ))}
                    </div>
                  )}
                  {viewFilter !== 'todo' && viewFilter !== 'rent' && dayExpiryReminders.length > 0 && (
                    <div className={`flex flex-col gap-1 ${viewFilter === 'all' && (dayTodos.length > 0 || dayRentReminders.length > 0) ? 'mt-2 pt-2 border-t border-[#2A2A2A]' : ''}`}>
                      {viewFilter === 'all' && <span className="text-[9px] font-semibold uppercase tracking-wide text-rose-600/80">만료 예정</span>}
                      {dayExpiryReminders.map((name) => (
                        <div key={`expiry-${name}`} className="truncate rounded px-1.5 py-1 text-xs leading-tight bg-rose-500/15 text-rose-300 border border-rose-500/20">
                          {name} 만료 1개월 전
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
          rentReminders={rentRemindersByDate[selectedDate] ?? []}
          expiryReminders={contractExpiryRemindersByDate[selectedDate] ?? []}
          onAdd={addTodo}
          onEdit={editTodo}
          onDelete={deleteTodo}
          onToggle={toggleTodo}
          onColorChange={changeTodoColor}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </main>
  );
}
