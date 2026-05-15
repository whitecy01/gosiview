'use client';

import { useState, useEffect } from 'react';
import {
  X, Loader2, Banknote, Home, CheckCircle2, XCircle,
  User, Calendar, CreditCard, Zap,
} from 'lucide-react';
import {
  fetchRentPayments, fetchDeductions, fetchCashSuccessions,
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

// ── 공통 UI ──

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[#2A2A2A] bg-[#111] px-4 py-2.5">
        {icon}
        <span className="text-xs font-semibold text-gray-300">{title}</span>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
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
};

export default function ContractDetailPanel({ contract, onClose }: Props) {
  const [rentPayments, setRentPayments] = useState<DbRentPayment[]>([]);
  const [deductions, setDeductions] = useState<DbDepositDeduction[]>([]);
  const [cashSuccessions, setCashSuccessions] = useState<DbCashSuccession[]>([]);
  const [loading, setLoading] = useState(true);

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
                {contract.status === 'completed' ? '퇴실 처리 완료' : '계약 중'} · {moveIn ? fmtDate(moveIn) : '—'} ~ {moveOut ? fmtDate(moveOut) : '—'}
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

            {/* 기본 정보 */}
            <Section icon={<User className="h-3.5 w-3.5 text-indigo-400" />} title="기본 정보">
              <Grid2>
                <Field label="이름" value={contract.name} />
                <Field label="연락처" value={contract.phone || '—'} />
                {contract.gender && <Field label="성별" value={contract.gender} />}
                {contract.birth_date && <Field label="나이" value={`${new Date().getFullYear() - parseInt(contract.birth_date.slice(0, 4), 10)}세`} />}
                {contract.purpose && <Field label="거주 목적" value={contract.purpose} />}
                {contract.real_estate_agency && <Field label="부동산" value={contract.real_estate_agency} />}
              </Grid2>
            </Section>

            {/* 계약 정보 */}
            <Section icon={<Calendar className="h-3.5 w-3.5 text-sky-400" />} title="계약 정보">
              <Grid2>
                <Field label="계약 시작일" value={fmtDate(contract.contract_start_date)} />
                <Field label="실제 입실일" value={contract.actual_move_in_date ? fmtDate(contract.actual_move_in_date) : '—'} />
                <Field label="실제 퇴실일" value={contract.actual_move_out_date ? fmtDate(contract.actual_move_out_date) : '—'} />
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
            <Section icon={<CreditCard className="h-3.5 w-3.5 text-emerald-400" />} title="월세 / 보증금">
              <Grid2>
                {contract.monthly_rent != null && <Field label="월세" value={fmtMoney(contract.monthly_rent)} highlight />}
                {contract.contract_deposit != null && <Field label="보증금 총액" value={fmtMoney(contract.contract_deposit)} />}
                {totalDeducted > 0 && <Field label="차감 합계" value={fmtMoney(totalDeducted)} valueClass="text-rose-400" />}
                {contract.deposit_total != null && <Field label="실반환액" value={fmtMoney(contract.deposit_total)} highlight />}
                <Field
                  label="보증금 반환"
                  value={contract.deposit_returned
                    ? (contract.deposit_returned_at ? fmtDate(contract.deposit_returned_at) : '완료')
                    : '미반환'}
                  valueClass={contract.deposit_returned ? 'text-emerald-400' : 'text-rose-400'}
                />
              </Grid2>
            </Section>

            {/* 월세 납부 이력 */}
            {rentPayments.length > 0 && (
              <Section icon={<Banknote className="h-3.5 w-3.5 text-yellow-400" />} title={`월세 납부 이력 (${rentPayments.length}건)`}>
                <div className="divide-y divide-[#1E1E1E]">
                  {rentPayments.map((rp) => (
                    <div key={rp.id} className="flex items-center justify-between py-2.5 px-1">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium ${PAYMENT_STATUS_STYLE[rp.status]}`}>
                          {PAYMENT_STATUS_LABEL[rp.status]}
                        </span>
                        <span className="text-sm text-gray-300">{rp.month}</span>
                        {rp.payment_method && (
                          <span className="text-xs text-gray-500">{rp.payment_method}</span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">{fmtMoney(rp.amount)}</p>
                        {rp.paid_at && <p className="text-xs text-gray-500">{fmtDate(rp.paid_at)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between border-t border-[#2A2A2A] pt-2">
                  <span className="text-xs text-gray-500">납부 합계</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {fmtMoney(rentPayments.filter((r) => r.status === 'paid').reduce((s, r) => s + r.amount, 0))}
                  </span>
                </div>
              </Section>
            )}

            {/* 보증금 차감 이력 */}
            {deductions.length > 0 && (
              <Section icon={<XCircle className="h-3.5 w-3.5 text-rose-400" />} title={`보증금 차감 이력 (${deductions.length}건)`}>
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
              </Section>
            )}

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
