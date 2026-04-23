// ============================================================
// mock-data.ts — 타입 정의 및 정적 설정값
// 실제 데이터는 Supabase에서 관리합니다.
// ============================================================

export type FloorNumber = 1 | 2 | 3 | 4 | 5 | 6;
export type RoomStatus = "occupied" | "vacant" | "contract";
export type PaymentStatus = "paid" | "upcoming" | "overdue";

// ──────────── 계약 관련 타입 ────────────

export type ScheduledResident = {
  name: string;
  phone: string;
  gender: '남' | '여';
  age: number;
  contractMoveInDate: string;
  contractEndDate?: string;
  contractMonths?: number;
  actualMoveInDate?: string;
  moveOutDate?: string;
  purpose?: ResidencePurpose;
  monthlyRent?: number;
  contractDeposit?: number;
  realEstateAgency?: RealEstateAgency;
};

export type MaintenanceRecord = {
  id?: string;
  date: string;
  amount: number;
  details: string[];
};

export type TenantBar = {
  name: string;
  moveInDate: string;
  moveOutDate: string;
  gender?: '남' | '여';
  age?: number;
  monthlyRent?: number;
  phone?: string;
  purpose?: string;
  realEstateAgency?: string;
  depositTotal?: number;
  depositDeducted?: number;
  depositReturned?: boolean;
  depositReturnedAt?: string | null;
  electricityHandover?: {
    moveOutMeter: number;
    vacancyMeter: number;
    vacancyCost: number | null;
    giroCost: number | null;
  } | null;
};

// ──────────── 방 타입 ────────────

export type RoomType =
  | "Cozy"
  | "Standard A-1"
  | "Standard A-1 +"
  | "Standard A-2"
  | "Standard A-2 +"
  | "Standard A-2 (넓은 사이즈)"
  | "Standard A-3"
  | "Standard B-1"
  | "Standard B-2"
  | "Deluxe A"
  | "Deluxe B";

export type RoomTypeInfo = {
  price: number;
  amenities: string[];
  illustration: string | null;
};

export const ROOM_TYPE_INFO: Record<RoomType, RoomTypeInfo> = {
  "Cozy": {
    price: 650000,
    amenities: ["침대", "책상", "의자", "옷장", "수납장", "냉장고", "에어컨", "인터넷", "스마트도어락"],
    illustration: null,
  },
  "Standard A-1": {
    price: 700000,
    amenities: ["침대", "책상", "의자", "옷장", "수납장", "2도어냉장고", "에어컨", "인터넷", "스마트도어락"],
    illustration: "/room-types/standard-a.png",
  },
  "Standard A-1 +": {
    price: 700000,
    amenities: ["침대", "책상", "의자", "옷장", "수납장", "2도어냉장고", "에어컨", "인터넷", "스마트도어락"],
    illustration: "/room-types/standard-a.png",
  },
  "Standard A-2": {
    price: 720000,
    amenities: ["침대", "책상", "의자", "옷장", "수납장", "2도어냉장고", "에어컨", "인터넷", "스마트도어락"],
    illustration: "/room-types/standard-a.png",
  },
  "Standard A-2 +": {
    price: 720000,
    amenities: ["침대", "책상", "의자", "옷장", "수납장", "2도어냉장고", "에어컨", "인터넷", "스마트도어락"],
    illustration: "/room-types/standard-a.png",
  },
  "Standard A-2 (넓은 사이즈)": {
    price: 720000,
    amenities: ["침대", "책상", "의자", "옷장", "수납장", "2도어냉장고", "에어컨", "인터넷", "스마트도어락"],
    illustration: "/room-types/standard-a.png",
  },
  "Standard A-3": {
    price: 850000,
    amenities: ["침대", "책상", "의자", "옷장", "수납장", "2도어냉장고", "에어컨", "인터넷", "스마트도어락"],
    illustration: "/room-types/standard-a.png",
  },
  "Standard B-1": {
    price: 780000,
    amenities: ["침대", "책상", "의자", "옷장", "수납장", "2도어냉장고", "에어컨", "인터넷", "스마트도어락"],
    illustration: "/room-types/standard-b.png",
  },
  "Standard B-2": {
    price: 850000,
    amenities: ["침대", "책상", "의자", "옷장", "수납장", "2도어냉장고", "에어컨", "인터넷", "스마트도어락"],
    illustration: "/room-types/standard-b.png",
  },
  "Deluxe A": {
    price: 850000,
    amenities: ["침대", "책상", "의자", "옷장", "수납장", "2도어냉장고", "에어컨", "인터넷", "스마트도어락"],
    illustration: "/room-types/deluxe-a.png",
  },
  "Deluxe B": {
    price: 850000,
    amenities: ["침대", "책상", "의자", "옷장", "수납장", "2도어냉장고", "에어컨", "인터넷", "스마트도어락"],
    illustration: "/room-types/deluxe-b.png",
  },
};

// ──────────── 방 타입 ────────────

export type PaymentHistoryEntry = {
  month: string;
  paidAt: string | null;
  amount: string;
  status: PaymentStatus;
};

export type Room = {
  id: string;
  name: string;
  floor: FloorNumber;
  status: RoomStatus;
  roomType: RoomType;
  roomPrice: string;
  amenities?: string[];
  contractId?: string | null;
  resident: string | null;
  phone: string | null;
  gender: '남' | '여' | null;
  age: number | null;
  moveInDate: string | null;
  moveOutDate: string | null;
  monthlyRent: string | null;
  paidMonth: string | null;
  paidAt: string | null;
  paymentStatus: PaymentStatus | null;
  rentStatus: string;
  paymentHistory: PaymentHistoryEntry[];
};

// ──────────── 대시보드 통계 ────────────

export function getDashboardStats(rooms: Room[]) {
  const occupiedRooms = rooms.filter((r) => r.status === "occupied").length;
  const vacantRooms   = rooms.filter((r) => r.status === "vacant").length;
  const contractRooms = rooms.filter((r) => r.status === "contract").length;
  return {
    totalRooms: rooms.length,
    occupiedRooms,
    vacantRooms,
    contractRooms,
    occupancyRate: rooms.length ? Math.round((occupiedRooms / rooms.length) * 100) : 0,
  };
}

// ──────────── 입실자 상세 관련 타입 ────────────

export type ResidencePurpose =
  | "공시생(임용)"
  | "공시생(일행)"
  | "공시생(소방)"
  | "공시생(경찰)"
  | "세무·회계·계리"
  | "취준생"
  | "수능"
  | "직장";

export type RealEstateAgency = "부동산 A" | "부동산 B" | "부동산 C" | "직거래";

export type DepositDeductionReason =
  | "차임"
  | "미납"
  | "공과금정산"
  | "도배"
  | "타일"
  | "시설손상";

export type RentPaymentMethod = "이체(자진발급)" | "이체" | "현금";

export type DepositDeduction = {
  date: string;
  amount: number;
  reason: DepositDeductionReason;
};

export type RentPayment = {
  month: string;
  paidAt: string | null;
  amount: number;
  paymentMethod: RentPaymentMethod | null;
  status: "paid" | "overdue" | "upcoming";
};

export type GasBill = {
  month: string;
  amount: number;
};

export type CashSuccessionRecord = {
  billingStart?: string;
  billingEnd?: string;
  landlordStart?: string;
  landlordEnd?: string;
  tenantStart?: string;
  tenantEnd?: string;
  totalAmount?: number;
  totalKwh?: number;
  landlordAmount?: number;
  landlordKwh?: number;
  landlordStartMeter?: number;
  landlordEndMeter?: number;
  tenantAmount?: number;
  tenantKwh?: number;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  paymentDate?: string;
  notes?: string;
};

export type ResidentDetail = {
  roomId: string;
  purpose: ResidencePurpose;
  utilityIncludedRent: number;
  actualMonthlyRent: number;
  paymentDueDay: number;
  contractMoveInDate?: string;
  contractExpiry: string;
  actualMoveInDate?: string;
  actualMoveOutDate?: string;
  contractDeposit: { date: string; amount: number };
  realEstateAgency: RealEstateAgency;
  depositTotal: number;
  depositDeductions: DepositDeduction[];
  depositReturn: { returned: boolean; returnedAt: string | null };
  rentPayments: RentPayment[];
  gasBills: GasBill[];
  cashSuccessions: CashSuccessionRecord[];
};

// ──────────── 빈 데이터 (Supabase 연동 전까지 빈 상태) ────────────

export const MAINTENANCE_BY_ROOM: Record<string, MaintenanceRecord[]> = {};
export const ROOM_TENANT_HISTORY: Record<string, TenantBar[]> = {};
export const RESIDENT_DETAIL_BY_ROOM: Record<string, ResidentDetail> = {};
