'use client';

import { useState, useEffect } from 'react';
import {
  X, Loader2, Banknote, Home, CheckCircle2, XCircle,
  User, Calendar, CreditCard, Zap, Pencil, Plus,
} from 'lucide-react';
import {
  fetchRentPayments, fetchDeductions, fetchCashSuccessions,
  updateContract, upsertRentPayment,
  type DbContract, type DbRentPayment, type DbDepositDeduction, type DbCashSuccession,
} from '@/app/lib/supabase-data';

// ── 헬퍼 ──

function fmtDate(d: string) {
  const [y, m, dd] = d.split('-');
  return `${y}.${m}.${dd}`;
}

function fmtMoney(n: number) {
  return `₩${n.toLocaleString('ko-KR')}`;
}

function fmtStay(from: string, to: string) {
  const total = Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000);
  const months = Math.floor(total / 30);
  const days = total % 30;
  if (months > 0 && days > 0) return `${months}개월 ${days}일`;
  if (months > 0) return `${months}개월`;
  return `${days}일`;
}

function fmtMonthKo(m: string) {
  const [y, mo] = m.split('-');
  return `${y}년 ${parseInt(mo)}월`;
}

const PAYMENT_STATUS_STYLE: Record<string, string> = {
  paid: 'text-emerald-400',
  upcoming: 'text-gray-400',
  overdue: 'text-rose-400',
};
const PAYMENT_STATUS_LABEL: Record<string, string> = {
  paid: '납부',
  upcoming: '예정',
  overdue: '연체',
};

const PAYMENT_METHODS = ['이체(자진발급)', '이체', '현금'];

const IN = 'w-full rounded border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500 [color-scheme:dark]';

/** 계약의 기본/계약 정보 편집 폼 값 */
type ContractForm = {
  name: string; phone: string; gender: '남' | '여' | ''; birth_date: string;
  purpose: string; real_estate_agency: string;
  contract_start_date: string; contract_start_end: string; contract_months: string;
  actual_move_in_date: string; actual_move_out_date: string;
  monthly_rent: string; earnest_money: string; contract_deposit: string;
  deposit_total: string;
};

function toForm(c: DbContract): ContractForm {
  return {
    name: c.name ?? '', phone: c.phone ?? '', gender: c.gender ?? '', birth_date: c.birth_date ?? '',
    purpose: c.purpose ?? '', real_estate_agency: c.real_estate_agency ?? '',
    contract_start_date: c.contract_start_date ?? '',
    contract_start_end: c.contract_start_end ?? '',
    contract_months: c.contract_months != null ? String(c.contract_months) : '',
    actual_move_in_date: c.actual_move_in_date ?? '',
    actual_move_out_date: c.actual_move_out_date ?? '',
    monthly_rent: c.monthly_rent != null ? String(c.monthly_rent) : '',
    earnest_money: c.earnest_money != null ? String(c.earnest_money) : '',
    contract_deposit: c.contract_deposit != null ? String(c.contract_deposit) : '',
    deposit_total: c.deposit_total != null ? String(c.deposit_total) : '',
  };
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] text-gray-500">{label}</label>
      {children}
    </div>
  );
}

// ── 공통 UI ──

function Section({ icon, title, action, children }: { icon: React.ReactNode; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-[#2A2A2A] bg-[#111] px-4 py-2.5">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-semibold text-gray-300">{title}</span>
        </div>
        {action}
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 rounded border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-1 text-[11px] text-gray-400 transition-colors hover:text-white"
    >
      <Pencil className="h-3 w-3" />수정
    </button>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">{children}</div>;
}

function Field({
  label, value, highlight, valueClass,
}: {
  label: string; value: string; highlight?: boolean; valueClass?: string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-0.5 text-sm font-medium ${valueClass ?? (highlight ? 'text-white' : 'text-gray-300')}`}>{value}</p>
    </div>
  );
}

// ── 메인 패널 ──

type Props = {
  contract: DbContract;
  onClose: () => void;
  /** 계약이 수정되면 호출됩니다 (목록 갱신용) */
  onUpdated?: (updated: DbContract) => void;
};

export default function ContractDetailPanel({ contract: initialContract, onClose, onUpdated }: Props) {
  const [contract, setContract] = useState<DbContract>(initialContract);
  const [rentPayments, setRentPayments] = useState<DbRentPayment[]>([]);
  const [deductions, setDeductions] = useState<DbDepositDeduction[]>([]);
  const [cashSuccessions, setCashSuccessions] = useState<DbCashSuccession[]>([]);
  const [loading, setLoading] = useState(true);

  // 기본/계약 정보 편집
  const [editingInfo, setEditingInfo] = useState(false);
  const [form, setForm] = useState<ContractForm>(() => toForm(initialContract));
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);

  // 월세 납부 편집
  const [payEditMonth, setPayEditMonth] = useState<string | null>(null);
  const [payDate, setPayDate] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('이체');
  const [payStatus, setPayStatus] = useState<'paid' | 'upcoming' | 'overdue'>('paid');
  const [paySaving, setPaySaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchRentPayments(contract.id),
      fetchDeductions(contract.id),
      fetchCashSuccessions(contract.id),
    ]).then(([rp, dd, cs]) => {
      setRentPayments(rp);
      setDeductions(dd);
      setCashSuccessions(cs);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [contract.id]);

  const moveIn = contract.actual_move_in_date;
  const moveOut = contract.actual_move_out_date;
  const totalDeducted = deductions.reduce((s, d) => s + d.amount, 0);

  function applyUpdate(updated: DbContract) {
    setContract(updated);
    onUpdated?.(updated);
  }

  function startEditInfo() {
    setForm(toForm(contract));
    setInfoError(null);
    setEditingInfo(true);
  }

  async function saveInfo() {
    setInfoSaving(true);
    setInfoError(null);
    try {
      const updated = await updateContract(contract.id, {
        name: form.name,
        phone: form.phone,
        gender: form.gender || null,
        birth_date: form.birth_date || null,
        purpose: form.purpose || null,
        real_estate_agency: form.real_estate_agency || null,
        contract_start_date: form.contract_start_date,
        contract_start_end: form.contract_start_end || null,
        contract_months: form.contract_months ? Number(form.contract_months) : null,
        actual_move_in_date: form.actual_move_in_date || null,
        actual_move_out_date: form.actual_move_out_date || null,
        monthly_rent: form.monthly_rent ? Number(form.monthly_rent) : null,
        earnest_money: form.earnest_money ? Number(form.earnest_money) : null,
        contract_deposit: form.contract_deposit ? Number(form.contract_deposit) : null,
        deposit_total: form.deposit_total ? Number(form.deposit_total) : null,
      });
      applyUpdate(updated);
      setEditingInfo(false);
    } catch (e) {
      setInfoError(e instanceof Error ? e.message : '저장에 실패했습니다.');
    } finally {
      setInfoSaving(false);
    }
  }

  async function toggleReturn(returned: boolean, returnedAt: string | null) {
    const updated = await updateContract(contract.id, {
      deposit_returned: returned,
      deposit_returned_at: returnedAt,
    });
    applyUpdate(updated);
  }

  function startPayEdit(p: DbRentPayment) {
    setPayEditMonth(p.month);
    setPayDate(p.paid_at ?? new Date().toISOString().slice(0, 10));
    setPayAmount(String(p.amount));
    setPayMethod(p.payment_method ?? '이체');
    setPayStatus(p.status);
  }

  async function savePayment(month: string) {
    setPaySaving(true);
    try {
      const saved = await upsertRentPayment({
        contract_id: contract.id,
        month,
        amount: Number(payAmount) || 0,
        paid_at: payStatus === 'paid' ? (payDate || null) : null,
        payment_method: payStatus === 'paid' ? payMethod : null,
        status: payStatus,
      });
      setRentPayments((prev) => prev.map((p) => (p.month === month ? saved : p)));
      setPayEditMonth(null);
    } finally {
      setPaySaving(false);
    }
  }

  /** 계약 기간 중 레코드가 없는 달을 '예정' 상태로 생성 */
  async function addMissingMonths() {
    const start = contract.actual_move_in_date;
    const end = contract.actual_move_out_date ?? contract.contract_start_end;
    if (!start || !end) return;
    const existing = new Set(rentPayments.map((p) => p.month));
    const cur = new Date(start.slice(0, 7) + '-01');
    const last = new Date(end.slice(0, 7) + '-01');
    const missing: string[] = [];
    while (cur <= last) {
      const m = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`;
      if (!existing.has(m)) missing.push(m);
      cur.setMonth(cur.getMonth() + 1);
    }
    if (missing.length === 0) return;
    setPaySaving(true);
    try {
      const created = await Promise.all(
        missing.map((m) => upsertRentPayment({
          contract_id: contract.id,
          month: m,
          amount: contract.monthly_rent ?? 0,
          paid_at: null,
          payment_method: null,
          status: 'upcoming',
        }))
      );
      setRentPayments((prev) => [...prev, ...created].sort((a, b) => a.month.localeCompare(b.month)));
    } finally {
      setPaySaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* 배경 오버레이 */}
      <div className="flex-1 bg-black/60" onClick={onClose} />

      {/* 패널 */}
      <div className="w-full max-w-2xl overflow-y-auto bg-[#0D0D0D] border-l border-[#2A2A2A] flex flex-col">
        {/* 헤더 */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#2A2A2A] bg-[#0D0D0D] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${contract.gender === '여' ? 'bg-rose-500/15 text-rose-400' : 'bg-indigo-500/15 text-indigo-400'}`}>
              {contract.name[0]}
            </div>
            <div>
              <p className="font-bold text-white">{contract.name}</p>
              <p className="text-xs text-gray-500">
                {contract.status === 'completed' ? '퇴실 처리 완료' : '계약 중'} · {moveIn ? fmtDate(moveIn) : '—'} ~ {moveOut ? fmtDate(moveOut) : (contract.contract_start_end ? fmtDate(contract.contract_start_end) : '—')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2A2A2A] text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
          </div>
        ) : (
          <div className="flex-1 space-y-4 p-6">

            {editingInfo ? (
              /* ── 기본 정보 / 계약 정보 / 금액 통합 편집 폼 ── */
              <Section icon={<Pencil className="h-3.5 w-3.5 text-indigo-400" />} title="정보 수정">
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">기본 정보</p>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="이름">
                        <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={IN} />
                      </FormField>
                      <FormField label="연락처">
                        <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={IN} />
                      </FormField>
                      <FormField label="성별">
                        <select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as '남' | '여' | '' }))} className={IN}>
                          <option value="">—</option>
                          <option value="남">남</option>
                          <option value="여">여</option>
                        </select>
                      </FormField>
                      <FormField label="출생년도">
                        <input value={form.birth_date} onChange={(e) => setForm((f) => ({ ...f, birth_date: e.target.value }))} placeholder="1998" className={IN} />
                      </FormField>
                      <FormField label="거주 목적">
                        <input value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))} className={IN} />
                      </FormField>
                      <FormField label="부동산">
                        <input value={form.real_estate_agency} onChange={(e) => setForm((f) => ({ ...f, real_estate_agency: e.target.value }))} className={IN} />
                      </FormField>
                    </div>
                  </div>

                  <div className="border-t border-[#2A2A2A] pt-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">계약 정보</p>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="계약 시작일">
                        <input type="date" value={form.contract_start_date} onChange={(e) => setForm((f) => ({ ...f, contract_start_date: e.target.value }))} className={IN} />
                      </FormField>
                      <FormField label="계약 만료일">
                        <input type="date" value={form.contract_start_end} onChange={(e) => setForm((f) => ({ ...f, contract_start_end: e.target.value }))} className={IN} />
                      </FormField>
                      <FormField label="계약 개월 수">
                        <input type="number" min={1} value={form.contract_months} onChange={(e) => setForm((f) => ({ ...f, contract_months: e.target.value }))} placeholder="24" className={IN} />
                      </FormField>
                      <FormField label="실제 입실일">
                        <input type="date" value={form.actual_move_in_date} onChange={(e) => setForm((f) => ({ ...f, actual_move_in_date: e.target.value }))} className={IN} />
                      </FormField>
                      <FormField label="확정 퇴실일">
                        <input type="date" value={form.actual_move_out_date} onChange={(e) => setForm((f) => ({ ...f, actual_move_out_date: e.target.value }))} className={IN} />
                      </FormField>
                    </div>
                  </div>

                  <div className="border-t border-[#2A2A2A] pt-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">월세 / 보증금</p>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="월세 (원)">
                        <input type="number" step={1000} value={form.monthly_rent} onChange={(e) => setForm((f) => ({ ...f, monthly_rent: e.target.value }))} className={IN} />
                      </FormField>
                      <FormField label="계약금 (원)">
                        <input type="number" step={1000} value={form.earnest_money} onChange={(e) => setForm((f) => ({ ...f, earnest_money: e.target.value }))} className={IN} />
                      </FormField>
                      <FormField label="보증금 총액 (원)">
                        <input type="number" step={1000} value={form.contract_deposit} onChange={(e) => setForm((f) => ({ ...f, contract_deposit: e.target.value }))} className={IN} />
                      </FormField>
                      <FormField label="실반환액 (원)">
                        <input type="number" step={1000} value={form.deposit_total} onChange={(e) => setForm((f) => ({ ...f, deposit_total: e.target.value }))} className={IN} />
                      </FormField>
                    </div>
                  </div>

                  {infoError && <p className="text-[11px] text-rose-400">{infoError}</p>}

                  <div className="flex justify-end gap-2 border-t border-[#2A2A2A] pt-3">
                    <button onClick={() => setEditingInfo(false)} disabled={infoSaving} className="rounded border border-[#2A2A2A] px-3 py-1.5 text-[11px] text-gray-400 hover:text-white disabled:opacity-40">취소</button>
                    <button onClick={saveInfo} disabled={infoSaving} className="rounded bg-indigo-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-400 disabled:opacity-40">
                      {infoSaving ? '저장 중…' : '저장'}
                    </button>
                  </div>
                </div>
              </Section>
            ) : (
              <>
                {/* 기본 정보 */}
                <Section
                  icon={<User className="h-3.5 w-3.5 text-indigo-400" />}
                  title="기본 정보"
                  action={<EditButton onClick={startEditInfo} />}
                >
                  <Grid2>
                    <Field label="이름" value={contract.name} />
                    <Field label="연락처" value={contract.phone || '—'} />
                    <Field label="성별" value={contract.gender ?? '—'} />
                    <Field label="나이" value={contract.birth_date ? `${new Date().getFullYear() - parseInt(contract.birth_date.slice(0, 4), 10)}세` : '—'} />
                    <Field label="거주 목적" value={contract.purpose ?? '—'} />
                    <Field label="부동산" value={contract.real_estate_agency ?? '—'} />
                  </Grid2>
                </Section>

                {/* 계약 정보 */}
                <Section
                  icon={<Calendar className="h-3.5 w-3.5 text-sky-400" />}
                  title="계약 정보"
                  action={<EditButton onClick={startEditInfo} />}
                >
                  <Grid2>
                    <Field label="계약 시작일" value={fmtDate(contract.contract_start_date)} />
                    <Field label="계약 만료일" value={contract.contract_start_end ? fmtDate(contract.contract_start_end) : '—'} />
                    <Field label="계약 개월 수" value={contract.contract_months != null ? `${contract.contract_months}개월` : '—'} />
                    <Field label="실제 입실일" value={contract.actual_move_in_date ? fmtDate(contract.actual_move_in_date) : '—'} />
                    <Field label="확정 퇴실일" value={contract.actual_move_out_date ? fmtDate(contract.actual_move_out_date) : '—'} />
                    {moveIn && moveOut && (
                      <Field label="실거주 기간" value={fmtStay(moveIn, moveOut)} highlight />
                    )}
                    <Field
                      label="퇴실 상태"
                      value={contract.status === 'completed' ? '퇴실 처리 완료' : '미처리'}
                      valueClass={contract.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}
                    />
                  </Grid2>
                </Section>

                {/* 월세 정보 */}
                <Section
                  icon={<CreditCard className="h-3.5 w-3.5 text-emerald-400" />}
                  title="월세 / 보증금"
                  action={<EditButton onClick={startEditInfo} />}
                >
                  <Grid2>
                    <Field label="월세" value={contract.monthly_rent != null ? fmtMoney(contract.monthly_rent) : '—'} highlight />
                    <Field label="계약금" value={contract.earnest_money != null ? fmtMoney(contract.earnest_money) : '—'} />
                    <Field label="보증금 총액" value={contract.contract_deposit != null ? fmtMoney(contract.contract_deposit) : '—'} />
                    {totalDeducted > 0 && <Field label="차감 합계" value={fmtMoney(totalDeducted)} valueClass="text-rose-400" />}
                    <Field label="실반환액" value={contract.deposit_total != null ? fmtMoney(contract.deposit_total) : '—'} highlight />
                    <div>
                      <p className="text-xs text-gray-500">보증금 반환</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className={`text-sm font-medium ${contract.deposit_returned ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {contract.deposit_returned
                            ? (contract.deposit_returned_at ? fmtDate(contract.deposit_returned_at) : '완료')
                            : '미반환'}
                        </span>
                        {contract.deposit_returned ? (
                          <button onClick={() => toggleReturn(false, null)} className="text-[11px] text-gray-600 hover:text-rose-400">취소</button>
                        ) : (
                          <button
                            onClick={() => toggleReturn(true, new Date().toISOString().slice(0, 10))}
                            className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] text-emerald-400 hover:bg-emerald-500/20"
                          >
                            반환 처리
                          </button>
                        )}
                      </div>
                    </div>
                  </Grid2>
                </Section>
              </>
            )}

            {/* 월세 납부 이력 */}
            <Section
              icon={<Banknote className="h-3.5 w-3.5 text-yellow-400" />}
              title={`월세 납부 이력 (${rentPayments.length}건)`}
              action={
                <button
                  onClick={addMissingMonths}
                  disabled={paySaving}
                  className="flex items-center gap-1 rounded border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-1 text-[11px] text-gray-400 transition-colors hover:text-white disabled:opacity-40"
                >
                  <Plus className="h-3 w-3" />누락 월 생성
                </button>
              }
            >
              {rentPayments.length === 0 ? (
                <p className="py-3 text-center text-xs text-gray-500">납부 내역이 없습니다.</p>
              ) : (
                <>
                  <div className="divide-y divide-[#1E1E1E]">
                    {rentPayments.map((rp) => (
                      <div key={rp.id}>
                        <div className="flex items-center justify-between py-2.5 px-1">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-medium ${PAYMENT_STATUS_STYLE[rp.status]}`}>
                              {PAYMENT_STATUS_LABEL[rp.status]}
                            </span>
                            <span className="text-sm text-gray-300">{fmtMonthKo(rp.month)}</span>
                            {rp.payment_method && (
                              <span className="text-xs text-gray-500">{rp.payment_method}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-sm font-semibold text-white">{fmtMoney(rp.amount)}</p>
                              {rp.paid_at && <p className="text-xs text-gray-500">{fmtDate(rp.paid_at)}</p>}
                            </div>
                            <button
                              onClick={() => (payEditMonth === rp.month ? setPayEditMonth(null) : startPayEdit(rp))}
                              className="flex h-6 w-6 items-center justify-center rounded text-gray-600 transition-colors hover:bg-[#222] hover:text-indigo-400"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {payEditMonth === rp.month && (
                          <div className="mb-2 space-y-2 rounded-lg border border-[#2A2A2A] bg-[#111] p-3">
                            <div className="grid grid-cols-2 gap-2">
                              <FormField label="상태">
                                <select value={payStatus} onChange={(e) => setPayStatus(e.target.value as 'paid' | 'upcoming' | 'overdue')} className={IN}>
                                  <option value="paid">납부완료</option>
                                  <option value="upcoming">예정</option>
                                  <option value="overdue">미납</option>
                                </select>
                              </FormField>
                              <FormField label="금액 (원)">
                                <input type="number" step={1000} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className={IN} />
                              </FormField>
                              <FormField label="납부 날짜">
                                <input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} disabled={payStatus !== 'paid'} className={`${IN} disabled:opacity-40`} />
                              </FormField>
                              <FormField label="결제 방식">
                                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} disabled={payStatus !== 'paid'} className={`${IN} disabled:opacity-40`}>
                                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                                </select>
                              </FormField>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setPayEditMonth(null)} className="rounded border border-[#2A2A2A] px-3 py-1.5 text-[11px] text-gray-400 hover:text-white">취소</button>
                              <button onClick={() => savePayment(rp.month)} disabled={paySaving} className="rounded bg-indigo-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-400 disabled:opacity-40">
                                {paySaving ? '저장 중…' : '저장'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between border-t border-[#2A2A2A] pt-2">
                    <span className="text-xs text-gray-500">납부 합계</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {fmtMoney(rentPayments.filter((r) => r.status === 'paid').reduce((s, r) => s + r.amount, 0))}
                    </span>
                  </div>
                </>
              )}
            </Section>

            {/* 보증금 차감 이력 */}
            <Section icon={<XCircle className="h-3.5 w-3.5 text-rose-400" />} title={`보증금 차감 이력 (${deductions.length}건)`}>
              {deductions.length > 0 ? (
                <>
                  <div className="divide-y divide-[#1E1E1E]">
                    {deductions.map((d) => (
                      <div key={d.id} className="flex items-center justify-between py-2.5 px-1">
                        <div>
                          <p className="text-sm text-white">{d.reason}</p>
                          <p className="text-xs text-gray-500">{fmtDate(d.date)}</p>
                        </div>
                        <p className="text-sm font-semibold text-rose-400">-{fmtMoney(d.amount)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between border-t border-[#2A2A2A] pt-2">
                    <span className="text-xs text-gray-500">차감 합계</span>
                    <span className="text-sm font-bold text-rose-400">-{fmtMoney(totalDeducted)}</span>
                  </div>
                </>
              ) : (
                <p className="py-3 text-center text-xs text-gray-500">차감 이력이 없습니다.</p>
              )}
            </Section>

            {/* 현금 승계 */}
            {cashSuccessions.length > 0 && (
              <Section icon={<Zap className="h-3.5 w-3.5 text-amber-400" />} title={`현금 승계 (${cashSuccessions.length}건)`}>
                <div className="space-y-3">
                  {cashSuccessions.map((cs, idx) => (
                    <div key={cs.id} className="rounded-lg border border-[#2A2A2A] p-3">
                      <p className="mb-2 text-xs font-semibold text-gray-400">
                        #{idx + 1} {cs.billing_start && cs.billing_end ? `${fmtDate(cs.billing_start)} ~ ${fmtDate(cs.billing_end)}` : ''}
                      </p>
                      <Grid2>
                        {cs.total_amount != null && <Field label="총액" value={fmtMoney(cs.total_amount)} highlight />}
                        {cs.total_kwh != null && <Field label="총 kWh" value={`${cs.total_kwh} kWh`} />}
                        {cs.landlord_amount != null && <Field label="임대인 부담" value={fmtMoney(cs.landlord_amount)} />}
                        {cs.tenant_amount != null && <Field label="임차인 부담" value={fmtMoney(cs.tenant_amount)} />}
                        {cs.payment_date && <Field label="납부일" value={fmtDate(cs.payment_date)} />}
                        {cs.bank_name && <Field label="은행" value={`${cs.bank_name} ${cs.account_holder ?? ''}`} />}
                        {cs.account_number && <Field label="계좌번호" value={cs.account_number} />}
                        {cs.notes && <Field label="메모" value={cs.notes} />}
                      </Grid2>
                    </div>
                  ))}
                </div>
              </Section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
