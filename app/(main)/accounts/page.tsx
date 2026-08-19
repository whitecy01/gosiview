'use client';

import { useEffect, useState, useCallback } from 'react';
import { UserCog, Plus, Trash2, KeyRound, X, Loader2 } from 'lucide-react';

type Role = '사장' | '원장' | '총무' | '개발자';
type AccountUser = {
  id: string;
  email: string;
  role: Role | null;
  name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
};

const ROLES: Role[] = ['사장', '원장', '총무', '개발자'];
const ROLE_STYLE: Record<Role, string> = {
  사장: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  원장: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
  총무: 'border-gray-500/30 bg-gray-500/10 text-gray-300',
  개발자: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
};

function fmtDate(d: string | null) {
  if (!d) return '-';
  const dt = new Date(d);
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, '0')}.${String(dt.getDate()).padStart(2, '0')}`;
}

export default function AccountsPage() {
  const [users, setUsers] = useState<AccountUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 추가 폼
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('총무');
  const [saving, setSaving] = useState(false);

  // 비번 재설정
  const [resetId, setResetId] = useState<string | null>(null);
  const [resetPw, setResetPw] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '불러오기 실패');
      setUsers(data.users);
    } catch (e) {
      setError(e instanceof Error ? e.message : '불러오기 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createUser() {
    if (!email || !password || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '생성 실패');
      setEmail(''); setPassword(''); setName(''); setRole('총무'); setShowForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : '생성 실패');
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(id: string) {
    if (!confirm('이 계정을 삭제할까요?')) return;
    setError(null);
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? '삭제 실패'); return; }
    await load();
  }

  async function resetPassword(id: string) {
    if (resetPw.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return; }
    setError(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: resetPw }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? '변경 실패'); return; }
    setResetId(null); setResetPw('');
    alert('비밀번호가 변경되었습니다.');
  }

  const inputCls = 'w-full rounded-lg border border-[#2A2A2A] bg-[#161616] px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-indigo-500';

  return (
    <main className="w-full space-y-6">
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#111] shadow-sm overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-4">
          <div className="flex items-center gap-2">
            <UserCog className="h-4 w-4 text-indigo-400" />
            <div>
              <h2 className="text-base font-semibold text-white">계정 관리</h2>
              <p className="mt-0.5 text-xs text-gray-500">사장·원장·총무·개발자 계정 추가 및 관리</p>
            </div>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400 transition-colors"
            >
              <Plus size={14} />계정 추가
            </button>
          )}
        </div>

        {error && (
          <div className="border-b border-rose-500/20 bg-rose-500/10 px-6 py-3 text-sm text-rose-300">{error}</div>
        )}

        {/* 추가 폼 */}
        {showForm && (
          <div className="border-b border-[#2A2A2A] bg-[#0E0E0E] px-6 py-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">새 계정 추가</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-400">아이디(이메일 형식)</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="boss@gosi.local" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">비밀번호 (6자 이상)</label>
                <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">이름 (선택)</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="사장님" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">역할</label>
                <select value={role} onChange={(e) => setRole(e.target.value as Role)} className={inputCls}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <p className="text-[11px] text-gray-600">※ 이메일은 실제 메일이 아니어도 됩니다. 자동 인증되어 바로 로그인 가능합니다.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowForm(false); setError(null); }} className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-xs text-gray-400 hover:text-white">취소</button>
              <button onClick={createUser} disabled={!email || !password || saving} className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-400 disabled:opacity-40">
                {saving ? '생성 중…' : '생성'}
              </button>
            </div>
          </div>
        )}

        {/* 목록 */}
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-indigo-400" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2A2A] bg-[#0D0D0D] text-xs text-gray-400">
                <th className="px-6 py-3 text-left font-medium">아이디</th>
                <th className="px-4 py-3 text-left font-medium">이름</th>
                <th className="px-4 py-3 text-center font-medium">역할</th>
                <th className="px-4 py-3 text-left font-medium">마지막 로그인</th>
                <th className="px-4 py-3 text-right font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E1E]">
              {users.map((u) => (
                <tr key={u.id} className="text-gray-200">
                  <td className="px-6 py-3">{u.email}</td>
                  <td className="px-4 py-3 text-gray-400">{u.name ?? '-'}</td>
                  <td className="px-4 py-3 text-center">
                    {u.role
                      ? <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${ROLE_STYLE[u.role]}`}>{u.role}</span>
                      : <span className="text-xs text-gray-600">미지정</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{fmtDate(u.last_sign_in_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => { setResetId(u.id); setResetPw(''); setError(null); }} title="비밀번호 재설정"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-[#222] hover:text-indigo-400">
                        <KeyRound className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteUser(u.id)} title="삭제"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-rose-500/10 hover:text-rose-400">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">등록된 계정이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* 비밀번호 재설정 모달 */}
      {resetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setResetId(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-[#2A2A2A] bg-[#111] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-4">
              <h3 className="text-base font-semibold text-white">비밀번호 재설정</h3>
              <button onClick={() => setResetId(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-[#1A1A1A] hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <input type="text" value={resetPw} onChange={(e) => setResetPw(e.target.value)} placeholder="새 비밀번호 (6자 이상)" className={inputCls} autoFocus />
            </div>
            <div className="flex justify-end gap-2 border-t border-[#2A2A2A] px-6 py-4">
              <button onClick={() => setResetId(null)} className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-xs text-gray-400 hover:text-white">취소</button>
              <button onClick={() => resetPassword(resetId)} disabled={resetPw.length < 6} className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-400 disabled:opacity-40">변경</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
