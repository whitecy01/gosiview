'use client';

import { useEffect, useState, useCallback } from 'react';
import { History, Loader2, RefreshCw } from 'lucide-react';

type AccessLog = { email: string | null; ip: string | null; user_agent: string | null; event: string; at: string };

function fmtDateTime(s: string) {
  const d = new Date(s);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** user-agent 문자열에서 대략적인 기기(OS·브라우저) 추출 */
function shortUA(ua: string | null) {
  if (!ua) return '-';
  const os = /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'Mac' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Linux/.test(ua) ? 'Linux' : '';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : /Firefox/.test(ua) ? 'Firefox' : '';
  return [os, browser].filter(Boolean).join(' · ') || '기타';
}

export default function LoginHistoryPage() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/access-history');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '불러오기 실패');
      setLogs(data.logs);
    } catch (e) {
      setError(e instanceof Error ? e.message : '불러오기 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <main className="w-full space-y-6">
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#111] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-indigo-400" />
            <div>
              <h2 className="text-base font-semibold text-white">로그인 이력</h2>
              <p className="mt-0.5 text-xs text-gray-500">계정별 로그인·접속 기록 · IP · 기기</p>
            </div>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 text-xs text-gray-400 transition-colors hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />새로고침
          </button>
        </div>

        {error && (
          <div className="border-b border-rose-500/20 bg-rose-500/10 px-6 py-3 text-sm text-rose-300">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-indigo-400" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2A2A] bg-[#0D0D0D] text-xs text-gray-400">
                <th className="px-6 py-3 text-left font-medium">아이디</th>
                <th className="px-4 py-3 text-center font-medium">구분</th>
                <th className="px-4 py-3 text-left font-medium">접속 IP</th>
                <th className="px-4 py-3 text-left font-medium">기기</th>
                <th className="px-4 py-3 text-left font-medium">일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E1E]">
              {logs.map((log, i) => (
                <tr key={i} className="text-gray-200">
                  <td className="px-6 py-2.5">{log.email ?? '-'}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                      log.event === 'login'
                        ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300'
                        : 'border-gray-500/30 bg-gray-500/10 text-gray-400'
                    }`}>
                      {log.event === 'login' ? '로그인' : '접속'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{log.ip ?? '-'}</td>
                  <td className="px-4 py-2.5 text-gray-400">{shortUA(log.user_agent)}</td>
                  <td className="px-4 py-2.5 text-gray-400">{fmtDateTime(log.at)}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">기록이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
