'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles } from 'lucide-react';
import { CHANGELOG, type Change, type ChangeType } from '@/app/lib/changelog';

const TYPE_STYLE: Record<ChangeType, string> = {
  추가: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  개선: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400',
  수정: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
};

function fmtDate(d: string) {
  const [y, m, dd] = d.split('-');
  return `${y}년 ${parseInt(m)}월 ${parseInt(dd)}일`;
}

/** 페이지 순서를 유지하며 변경 항목을 묶습니다. */
function groupByPage(changes: Change[]) {
  const groups: { page: string; items: Change[] }[] = [];
  for (const c of changes) {
    const last = groups.find((g) => g.page === c.page);
    if (last) last.items.push(c);
    else groups.push({ page: c.page, items: [c] });
  }
  return groups;
}

export default function ChangelogModal({ onClose }: { onClose: () => void }) {
  // 헤더의 backdrop-blur가 fixed 요소의 기준이 되므로 body에 직접 렌더링합니다.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#111] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">업데이트 소식</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[#1A1A1A] hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {CHANGELOG.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">등록된 업데이트가 없습니다.</p>
          ) : (
            <div className="space-y-8">
              {CHANGELOG.map((entry, idx) => (
                <section key={entry.version} className={idx > 0 ? 'border-t border-[#2A2A2A] pt-8' : ''}>
                  <div className="mb-4 flex items-baseline gap-2">
                    <h3 className="text-sm font-bold text-white">{fmtDate(entry.date)}</h3>
                    {idx === 0 && (
                      <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
                        최신
                      </span>
                    )}
                  </div>

                  <div className="space-y-5">
                    {groupByPage(entry.changes).map((group) => (
                      <div key={group.page}>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded-md bg-[#1F1F1F] px-2 py-1 text-xs font-semibold text-gray-200">
                            {group.page}
                          </span>
                          <div className="h-px flex-1 bg-[#2A2A2A]" />
                        </div>
                        <ul className="space-y-2.5 pl-1">
                          {group.items.map((c, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <span className={`mt-0.5 shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${TYPE_STYLE[c.type]}`}>
                                {c.type}
                              </span>
                              <span className="text-sm leading-relaxed text-gray-300">{c.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        {/* 하단 */}
        <div className="border-t border-[#2A2A2A] px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
