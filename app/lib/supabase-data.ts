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
  age: number | null;
  purpose: string | null;
  real_estate_agency: string | null;
  contract_start_date: string;
  contract_end_date: string | null;
  contract_months: number | null;
  actual_move_in_date: string | null;
  actual_move_out_date: string | null;
  monthly_rent: number | null;
  contract_deposit: number | null;
  deposit_total: number | null;
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
      amenities,
      resident: null,
      phone: null,
      gender: null,
      age: null,
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
    supabase.from('contracts').select('*').in('status', ['scheduled']).order('contract_start_date'),
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
  age: number | null;
  purpose: string | null;
  real_estate_agency: string | null;
  contract_start_date: string;
  contract_end_date: string | null;
  contract_months: number | null;
  actual_move_in_date: string | null;
  actual_move_out_date: string | null;
  monthly_rent: number | null;
  contract_deposit: number | null;
  deposit_total: number | null;
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
