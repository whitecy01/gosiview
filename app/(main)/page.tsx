'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

// ──────────── 타입 ────────────

type Todo = {
  id: string;
  date: string;
  text: string;
  done: boolean;
};

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
function uid() {
  return Math.random().toString(36).slice(2);
}

// ──────────── Todo 모달 ────────────

function TodoModal({
  date, todos, onAdd, onEdit, onDelete, onToggle, onClose,
}: {
  date: string;
  todos: Todo[];
  onAdd: (text: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const [y, m, d] = date.split('-');
  const label = `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;

  function submitAdd() {
    if (!input.trim()) return;
    onAdd(input.trim());
    setInput('');
  }
  function submitEdit() {
    if (!editText.trim() || !editId) return;
    onEdit(editId, editText.trim());
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

        {/* Todo list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 max-h-72">
          {todos.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">등록된 할일이 없습니다.</p>
          )}
          {todos.map((todo) => (
            <div key={todo.id} className="flex items-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#161616] px-3 py-2.5">
              <button
                onClick={() => onToggle(todo.id)}
                className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  todo.done ? 'bg-indigo-500 border-indigo-500' : 'border-gray-600 hover:border-indigo-400'
                }`}
              >
                {todo.done && <Check size={11} className="text-white" />}
              </button>

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

              <div className="flex items-center gap-1 shrink-0">
                {editId === todo.id ? (
                  <button onClick={submitEdit} className="rounded p-1 text-indigo-400 hover:bg-[#222] transition-colors">
                    <Check size={14} />
                  </button>
                ) : (
                  <button onClick={() => { setEditId(todo.id); setEditText(todo.text); }} className="rounded p-1 text-gray-500 hover:text-gray-300 hover:bg-[#222] transition-colors">
                    <Pencil size={13} />
                  </button>
                )}
                <button onClick={() => onDelete(todo.id)} className="rounded p-1 text-gray-500 hover:text-rose-400 hover:bg-[#222] transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add input */}
        <div className="flex gap-2 border-t border-[#2A2A2A] px-6 py-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submitAdd(); }}
            placeholder="할일 입력 후 Enter"
            className="flex-1 rounded-xl border border-[#2A2A2A] bg-[#161616] px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={submitAdd}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors"
          >
            <Plus size={15} />
            추가
          </button>
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
  const [todos, setTodos] = useState<Todo[]>([
    { id: uid(), date: '2026-04-01', text: '101호 에어컨 필터 청소',       done: true  },
    { id: uid(), date: '2026-04-01', text: '월세 미납자 연락 (205호)',      done: false },
    { id: uid(), date: '2026-04-01', text: '공과금 정산 자료 정리',         done: false },
    { id: uid(), date: '2026-04-03', text: '302호 도배 업체 견적 요청',     done: false },
    { id: uid(), date: '2026-04-03', text: '신규 입실자 열쇠 준비 (401호)', done: false },
    { id: uid(), date: '2026-04-05', text: '관리비 납부 마감 확인',         done: false },
    { id: uid(), date: '2026-04-07', text: '507호 배수구 수리 업체 예약',   done: false },
    { id: uid(), date: '2026-04-07', text: '4월 도시가스 검침',             done: false },
    { id: uid(), date: '2026-04-10', text: '월세 납부 마감일',              done: false },
    { id: uid(), date: '2026-04-10', text: '203호 계약 갱신 상담',          done: false },
    { id: uid(), date: '2026-04-14', text: '소화기 점검',                   done: false },
    { id: uid(), date: '2026-04-15', text: '한전 검침 및 승계 처리',        done: false },
    { id: uid(), date: '2026-04-15', text: '106호 퇴실 청소 업체 예약',     done: false },
    { id: uid(), date: '2026-04-18', text: '공용 세탁기 필터 청소',         done: false },
    { id: uid(), date: '2026-04-21', text: '건물 외벽 점검',                done: false },
    { id: uid(), date: '2026-04-25', text: '다음 달 입실 예정자 확인',      done: false },
    { id: uid(), date: '2026-04-28', text: '302호 도배 완료 확인',          done: false },
    { id: uid(), date: '2026-04-30', text: '4월 수입/지출 정산',            done: false },
  ]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const todayKey = toDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  function todosFor(date: string) { return todos.filter(t => t.date === date); }

  function addTodo(text: string) {
    if (!selectedDate) return;
    setTodos(prev => [...prev, { id: uid(), date: selectedDate, text, done: false }]);
  }
  function editTodo(id: string, text: string) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text } : t));
  }
  function deleteTodo(id: string) {
    setTodos(prev => prev.filter(t => t.id !== id));
  }
  function toggleTodo(id: string) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
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
        {/* Month navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-colors">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-bold text-white">{year}년 {month}월</h2>
          <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-colors">
            <ChevronRight size={18} />
          </button>
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
                <div className="flex flex-col gap-1">
                  {dayTodos.map((todo) => (
                    <div key={todo.id} className={`truncate rounded px-1.5 py-1 text-xs leading-tight ${
                      todo.done ? 'bg-gray-700/50 text-gray-500 line-through' : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {todo.text}
                    </div>
                  ))}
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
          onAdd={addTodo}
          onEdit={editTodo}
          onDelete={deleteTodo}
          onToggle={toggleTodo}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </main>
  );
}
