import { createClient } from '@/app/lib/supabase/client';
import { type FloorNumber, type RoomStatus, type Room, type RoomType, ROOM_TYPE_INFO } from '@/app/lib/mock-data';

// ──────────── DB 타입 ────────────

export type DbRoom = {
  id: string;
  floor: number;
  name: string;
  room_type: string;
  monthly_price: number;
  created_at: string;
};

export type DbContract = {
  id: string;
  room_id: string;
  name: string;
  phone: string;
  gender: '남' | '여' | null;
  birth_date: string | null;
  purpose: string | null;
  real_estate_agency: string | null;
  contract_start_date: string;
  contract_start_end: string | null;
  actual_move_in_date: string | null;
  actual_move_out_date: string | null;
  monthly_rent: number | null;
  contract_deposit: number | null;
  earnest_money: number | null;
  deposit_total: number | null;
  payment_due_day: number | null;
  deposit_returned: boolean;
  deposit_returned_at: string | null;
  status: 'scheduled' | 'completed';
  created_at: string;
  updated_at: string;
};

// ──────────── 변환 ────────────

/**
 * DB 데이터(rooms + contracts)를 UI Room[] 타입으로 변환합니다.
 * - active 계약이 있으면 occupied
 * - scheduled 계약만 있으면 contract
 * - 계약 없으면 vacant
 */
export function buildRooms(dbRooms: DbRoom[], dbContracts: DbContract[]): Room[] {
  return dbRooms.map((dbRoom) => {
    const roomType = dbRoom.room_type as RoomType;
    const roomPrice = `₩${dbRoom.monthly_price.toLocaleString('ko-KR')}`;
    const floor = dbRoom.floor as FloorNumber;

    const scheduledContracts = dbContracts.filter(
      (c) => c.room_id === dbRoom.id && c.status === 'scheduled'
    );

    let status: RoomStatus;
    if (scheduledContracts.length > 0) {
      status = 'contract';
    } else {
      status = 'vacant';
    }

    const typeInfo = ROOM_TYPE_INFO[roomType];
    const amenities = typeInfo?.amenities ?? [];

    return {
      id: dbRoom.id,
      name: dbRoom.name,
      floor,
      status,
      roomType,
      roomPrice,
      monthlyPriceRaw: dbRoom.monthly_price,
      amenities,
      resident: null,
      phone: null,
      gender: null,
      birth_date: null,
      moveInDate: null,
      moveOutDate: null,
      monthlyRent: null,
      contractId: null,
      paidMonth: null,
      paidAt: null,
      paymentStatus: null,
      rentStatus: status,
      paymentHistory: [],
    };
  });
}

// ──────────── Supabase CRUD ────────────

export async function fetchRoomsAndContracts() {
  const supabase = createClient();
  const [{ data: rooms, error: re }, { data: contracts, error: ce }] = await Promise.all([
    supabase.from('rooms').select('*').order('id'),
    supabase.from('contracts').select('*').in('status', ['scheduled', 'completed']).order('contract_start_date'),
  ]);
  if (re) throw re;
  if (ce) throw ce;
  return { rooms: rooms as DbRoom[], contracts: contracts as DbContract[] };
}

export type NewContractInput = {
  room_id: string;
  name: string;
  phone: string;
  gender: '남' | '여' | null;
  birth_date: string | null;
  purpose: string | null;
  real_estate_agency: string | null;
  contract_start_date: string;
  contract_start_end?: string | null;
  actual_move_in_date: string | null;
  actual_move_out_date: string | null;
  monthly_rent: number | null;
  contract_deposit: number | null;
  earnest_money?: number | null;
  deposit_total: number | null;
  payment_due_day?: number | null;
  deposit_returned?: boolean;
  deposit_returned_at?: string | null;
  status: 'scheduled' | 'completed';
};

export async function insertContract(input: NewContractInput): Promise<DbContract> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('contracts')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as DbContract;
}

export async function updateContract(id: string, input: Partial<NewContractInput>): Promise<DbContract> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('contracts')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as DbContract;
}

export async function updateRoomPrice(roomId: string, monthlyPrice: number): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('rooms').update({ monthly_price: monthlyPrice }).eq('id', roomId);
  if (error) throw error;
}

export async function deleteContract(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('contracts').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchCompletedContracts(roomId: string): Promise<DbContract[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('room_id', roomId)
    .eq('status', 'completed')
    .order('actual_move_in_date', { ascending: false });
  if (error) throw error;
  return data as DbContract[];
}

/**
 * 방 이력 조회: completed 계약 + 퇴실일이 오늘 이전인 scheduled 계약을 모두 반환합니다.
 * 퇴실 처리를 하지 않았더라도 계약 종료일이 지나면 이력에 표시됩니다.
 */
export async function fetchRoomHistory(roomId: string, today: string): Promise<DbContract[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('room_id', roomId)
    .order('contract_start_date', { ascending: false });
  if (error) throw error;

  return (data as DbContract[]).filter((c) => {
    if (c.status === 'completed') return true;
    const out = c.actual_move_out_date ?? c.contract_start_end;
    return !!out && out < today;
  });
}

export async function fetchAllCompletedContracts(): Promise<DbContract[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('status', 'completed')
    .order('actual_move_in_date', { ascending: false });
  if (error) throw error;
  return data as DbContract[];
}

export async function fetchAllContractsForCalendar(): Promise<DbContract[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .order('contract_start_date', { ascending: true });
  if (error) throw error;
  return data as DbContract[];
}

// ──────────── 보증금 차감 이력 ────────────

export type DbDepositDeduction = {
  id: string;
  contract_id: string;
  date: string;
  amount: number;
  reason: string;
  created_at: string;
};

export async function fetchDeductions(contractId: string): Promise<DbDepositDeduction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('deposit_deductions')
    .select('*')
    .eq('contract_id', contractId)
    .order('date', { ascending: true });
  if (error) throw error;
  return data as DbDepositDeduction[];
}

export async function insertDeduction(input: {
  contract_id: string;
  date: string;
  amount: number;
  reason: string;
}): Promise<DbDepositDeduction> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('deposit_deductions')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as DbDepositDeduction;
}

export async function deleteDeductionById(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('deposit_deductions').delete().eq('id', id);
  if (error) throw error;
}

// ──────────── 현금 승계 ────────────

export type DbCashSuccession = {
  id: string;
  contract_id: string;
  billing_start: string | null;
  billing_end: string | null;
  landlord_start: string | null;
  landlord_end: string | null;
  tenant_start: string | null;
  tenant_end: string | null;
  total_amount: number | null;
  total_kwh: number | null;
  landlord_amount: number | null;
  landlord_kwh: number | null;
  landlord_start_meter: number | null;
  landlord_end_meter: number | null;
  tenant_amount: number | null;
  tenant_kwh: number | null;
  bank_name: string | null;
  account_holder: string | null;
  account_number: string | null;
  payment_date: string | null;
  notes: string | null;
  created_at: string;
};

export type CashSuccessionInput = Omit<DbCashSuccession, 'id' | 'created_at'>;

export async function fetchCashSuccessions(contractId: string): Promise<DbCashSuccession[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('cash_successions')
    .select('*')
    .eq('contract_id', contractId)
    .order('billing_start', { ascending: true });
  if (error) throw error;
  return data as DbCashSuccession[];
}

export async function insertCashSuccession(input: CashSuccessionInput): Promise<DbCashSuccession> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('cash_successions')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as DbCashSuccession;
}

export async function updateCashSuccession(id: string, input: Partial<CashSuccessionInput>): Promise<DbCashSuccession> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('cash_successions')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as DbCashSuccession;
}

export async function deleteCashSuccession(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('cash_successions').delete().eq('id', id);
  if (error) throw error;
}

// ──────────── 할일 목록 ────────────

export type DbTodo = {
  id: string;
  date: string;
  text: string;
  done: boolean;
  color: string;
  created_at: string;
};

export async function fetchTodos(): Promise<DbTodo[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('date', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as DbTodo[];
}

export async function insertTodo(input: { date: string; text: string; color: string }): Promise<DbTodo> {
  const supabase = createClient();
  const { data, error } = await supabase.from('todos').insert(input).select().single();
  if (error) throw error;
  return data as DbTodo;
}

export async function updateTodo(id: string, input: Partial<{ text: string; done: boolean; color: string }>): Promise<DbTodo> {
  const supabase = createClient();
  const { data, error } = await supabase.from('todos').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as DbTodo;
}

export async function deleteTodoById(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('todos').delete().eq('id', id);
  if (error) throw error;
}

// ──────────── 유지보수 이력 ────────────

export type DbMaintenanceRecord = {
  id: string;
  room_id: string;
  date: string;
  amount: number;
  details: string[];
  memo: string | null;
  created_at: string;
};

export async function fetchAllMaintenanceRecords(): Promise<DbMaintenanceRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('maintenance_records')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data as DbMaintenanceRecord[];
}

export async function insertMaintenanceRecord(input: {
  room_id: string;
  date: string;
  amount: number;
  details: string[];
}): Promise<DbMaintenanceRecord> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('maintenance_records')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as DbMaintenanceRecord;
}

export async function deleteMaintenanceRecord(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('maintenance_records').delete().eq('id', id);
  if (error) throw error;
}

// ──────────── 월세 납부 ────────────

export type DbRentPayment = {
  id: string;
  contract_id: string;
  month: string;
  amount: number;
  paid_at: string | null;
  payment_method: string | null;
  status: 'paid' | 'upcoming' | 'overdue';
  created_at: string;
};

export async function fetchRentPayments(contractId: string): Promise<DbRentPayment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rent_payments')
    .select('*')
    .eq('contract_id', contractId)
    .order('month', { ascending: true });
  if (error) throw error;
  return data as DbRentPayment[];
}

export async function fetchAllRentPayments(): Promise<DbRentPayment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rent_payments')
    .select('*')
    .order('month', { ascending: true });
  if (error) throw error;
  return data as DbRentPayment[];
}

export async function upsertRentPayment(input: {
  contract_id: string;
  month: string;
  amount: number;
  paid_at: string | null;
  payment_method: string | null;
  status: 'paid' | 'upcoming' | 'overdue';
}): Promise<DbRentPayment> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rent_payments')
    .upsert(input, { onConflict: 'contract_id,month' })
    .select()
    .single();
  if (error) throw error;
  return data as DbRentPayment;
}
