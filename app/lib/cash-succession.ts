import { type CashSuccessionRecord } from "@/app/lib/mock-data";
import { type DbCashSuccession } from "@/app/lib/supabase-data";

export function fromDbCash(db: DbCashSuccession): CashSuccessionRecord {
  return {
    billingStart: db.billing_start ?? undefined,
    billingEnd: db.billing_end ?? undefined,
    landlordStart: db.landlord_start ?? undefined,
    landlordEnd: db.landlord_end ?? undefined,
    tenantStart: db.tenant_start ?? undefined,
    tenantEnd: db.tenant_end ?? undefined,
    totalAmount: db.total_amount ?? undefined,
    totalKwh: db.total_kwh ?? undefined,
    landlordAmount: db.landlord_amount ?? undefined,
    landlordKwh: db.landlord_kwh ?? undefined,
    landlordStartMeter: db.landlord_start_meter ?? undefined,
    landlordEndMeter: db.landlord_end_meter ?? undefined,
    tenantAmount: db.tenant_amount ?? undefined,
    tenantKwh: db.tenant_kwh ?? undefined,
    bankName: db.bank_name ?? undefined,
    accountHolder: db.account_holder ?? undefined,
    accountNumber: db.account_number ?? undefined,
    paymentDate: db.payment_date ?? undefined,
    notes: db.notes ?? undefined,
  };
}

export function toDbCashInput(contractId: string, rec: CashSuccessionRecord) {
  return {
    contract_id: contractId,
    billing_start: rec.billingStart ?? null,
    billing_end: rec.billingEnd ?? null,
    landlord_start: rec.landlordStart ?? null,
    landlord_end: rec.landlordEnd ?? null,
    tenant_start: rec.tenantStart ?? null,
    tenant_end: rec.tenantEnd ?? null,
    total_amount: rec.totalAmount ?? null,
    total_kwh: rec.totalKwh ?? null,
    landlord_amount: rec.landlordAmount ?? null,
    landlord_kwh: rec.landlordKwh ?? null,
    landlord_start_meter: rec.landlordStartMeter ?? null,
    landlord_end_meter: rec.landlordEndMeter ?? null,
    tenant_amount: rec.tenantAmount ?? null,
    tenant_kwh: rec.tenantKwh ?? null,
    bank_name: rec.bankName ?? null,
    account_holder: rec.accountHolder ?? null,
    account_number: rec.accountNumber ?? null,
    payment_date: rec.paymentDate ?? null,
    notes: rec.notes ?? null,
  };
}
