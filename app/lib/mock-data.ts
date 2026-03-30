export type FloorNumber = 1 | 2 | 3 | 4 | 5 | 6;
export type RoomStatus = "occupied" | "vacant" | "maintenance";
export type PaymentStatus = "paid" | "upcoming" | "overdue";

export type ScheduledResident = {
  name: string;
  phone: string;
  gender: '남' | '여';
  age: number;
  contractMoveInDate: string;   // 계약서상 입실 예정일
  actualMoveInDate?: string;    // 실제 입실 날짜 (다를 경우)
  moveOutDate?: string;
};

export type MaintenanceRecord = {
  date: string;   // "YYYY-MM-DD"
  amount: number;
  details: string[];
};

export const SCHEDULED_BY_ROOM: Record<string, ScheduledResident[]> = {
  "101": [{ name: "강민호", phone: "010-6374-8291", gender: '남', age: 25, contractMoveInDate: "2026-07-01", actualMoveInDate: "2026-07-03", moveOutDate: "2027-06-30" }],
  "104": [
    { name: "김태양", phone: "010-5823-9104", gender: '남', age: 24, contractMoveInDate: "2026-03-26", actualMoveInDate: "2026-03-27", moveOutDate: "2027-03-25" },
    { name: "이소현", phone: "010-7291-3847", gender: '여', age: 22, contractMoveInDate: "2026-08-01", moveOutDate: "2027-07-31" },
  ],
  "203": [{ name: "박현준", phone: "010-3847-6291", gender: '남', age: 27, contractMoveInDate: "2026-04-01", moveOutDate: "2027-03-31" }],
  "302": [
    { name: "최수빈", phone: "010-9182-4756", gender: '여', age: 23, contractMoveInDate: "2026-03-30", moveOutDate: "2027-03-29" },
    { name: "한도준", phone: "010-2938-5471", gender: '남', age: 25, contractMoveInDate: "2026-03-27", moveOutDate: "2027-03-26" },
  ],
  "404": [{ name: "손지원", phone: "010-2847-5931", gender: '여', age: 26, contractMoveInDate: "2026-04-05", moveOutDate: "2027-04-04" }],
  "506": [{ name: "윤재훈", phone: "010-7382-1947", gender: '남', age: 29, contractMoveInDate: "2026-04-15", moveOutDate: "2027-04-14" }],
  "606": [{ name: "정하율", phone: "010-8374-2918", gender: '여', age: 21, contractMoveInDate: "2026-04-10", moveOutDate: "2027-04-09" }],
};

export const MAINTENANCE_BY_ROOM: Record<string, MaintenanceRecord[]> = {
  "101": [{ date: "2026-03-10", amount: 150000, details: ["에어컨청소", "전구교체"] }],
  "102": [{ date: "2026-02-15", amount: 350000, details: ["도배", "장판교체"] }],
  "104": [
    { date: "2026-03-01", amount: 280000, details: ["도배", "에어컨청소"] },
    { date: "2026-01-20", amount: 120000, details: ["전구교체"] },
  ],
  "203": [{ date: "2026-03-05", amount: 450000, details: ["도배", "매트리스교체", "에어컨청소"] }],
  "207": [{ date: "2026-02-28", amount: 80000, details: ["전구교체"] }],
  "302": [{ date: "2026-03-15", amount: 520000, details: ["도배", "매트리스교체", "장판교체"] }],
  "311": [{ date: "2026-03-20", amount: 680000, details: ["도배", "매트리스교체", "에어컨청소", "전구교체"] }],
  "404": [{ date: "2026-03-22", amount: 390000, details: ["도배", "매트리스교체"] }],
  "407": [{ date: "2026-01-15", amount: 200000, details: ["에어컨청소", "전구교체"] }],
  "506": [{ date: "2026-03-18", amount: 250000, details: ["에어컨청소", "전구교체"] }],
  "603": [{ date: "2026-03-25", amount: 720000, details: ["도배", "매트리스교체", "에어컨청소", "전구교체"] }],
  "606": [{ date: "2026-02-10", amount: 310000, details: ["도배", "장판교체"] }],
};
export type RoomType = "Cozy" | "Standard A-1" | "Standard A-1 +" | "Standard A-2" | "Standard A-2 +" | "Standard A-2 (넓은 사이즈)" | "Standard A-3" | "Standard B-1" | "Standard B-2" | "Deluxe A" | "Deluxe B";

const ROOM_TYPE_BY_ID: Record<string, RoomType> = {
  "101": "Standard A-1", "102": "Standard A-1", "103": "Standard A-1", "104": "Standard A-1", "105": "Standard A-1",
  "201": "Standard A-1 +", "202": "Standard A-1", "203": "Standard A-1", "204": "Standard A-1", "205": "Standard A-1",
  "206": "Standard A-1", "207": "Standard A-2 (넓은 사이즈)", "208": "Standard A-2", "209": "Standard A-2", "210": "Standard A-2",
  "211": "Standard A-2 +", "212": "Standard A-3", "213": "Standard A-2 (넓은 사이즈)",
  "301": "Standard A-1 +", "302": "Standard A-1", "303": "Standard A-1", "304": "Standard A-1", "305": "Standard A-1",
  "306": "Standard A-1", "307": "Standard A-2 (넓은 사이즈)", "308": "Standard A-2", "309": "Standard A-2", "310": "Standard A-2",
  "311": "Standard A-2 +", "312": "Standard A-3", "313": "Standard A-2 (넓은 사이즈)",
  "401": "Standard B-1", "402": "Standard B-1", "403": "Standard B-1", "404": "Standard B-2", "405": "Standard B-2",
  "406": "Standard B-2", "407": "Deluxe B", "408": "Standard B-2",
  "501": "Standard A-3", "502": "Standard A-3", "503": "Standard A-3", "504": "Standard A-3", "505": "Standard A-3",
  "506": "Deluxe A", "507": "Standard A-3",
  "601": "Cozy", "602": "Cozy", "603": "Cozy", "604": "Cozy", "605": "Cozy", "606": "Standard A-3", "607": "Standard A-3",
};

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

const ROOM_TYPE_PRICE: Record<RoomType, number> = Object.fromEntries(
  Object.entries(ROOM_TYPE_INFO).map(([k, v]) => [k, v.price])
) as Record<RoomType, number>;

export type PaymentHistoryEntry = {
  month: string;       // "2025-10"
  paidAt: string | null; // "2025-10-05" or null
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

const FLOOR_ROOM_IDS: Record<FloorNumber, string[]> = {
  1: ["101", "102", "103", "104", "105"],
  2: ["201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "211", "212", "213"],
  3: ["301", "302", "303", "304", "305", "306", "307", "308", "309", "310", "311", "312", "313"],
  4: ["401", "402", "403", "404", "405", "406", "407", "408"],
  5: ["501", "502", "503", "504", "505", "506", "507"],
  6: ["601", "602", "603", "604", "605", "606", "607"],
};

const STATUS_BY_ROOM_ID: Partial<Record<string, RoomStatus>> = {
  "104": "vacant",
  "203": "vacant",
  "210": "maintenance",
  "302": "vacant",
  "311": "maintenance",
  "404": "vacant",
  "506": "vacant",
  "603": "maintenance",
  "606": "vacant",
};

const RESIDENT_NAMES = [
  "김민준",
  "이서연",
  "박지훈",
  "최은우",
  "정하윤",
  "한도윤",
  "윤서진",
  "송지우",
  "강서준",
  "오지민",
  "임수아",
  "조현우",
  "배유진",
  "문도현",
  "신가은",
  "유시후",
  "노서아",
  "장민성",
  "서지안",
  "홍도윤",
  "고하린",
  "백지호",
  "남서윤",
  "차우진",
  "심예린",
  "안태민",
  "황지아",
  "권도현",
  "류세은",
  "주하준",
  "구서현",
  "유다온",
  "손재윤",
  "전아린",
  "허지후",
  "양유나",
  "문지호",
  "강나연",
  "서민재",
  "주예빈",
  "남시우",
  "채하율",
  "백도윤",
  "추지안",
];

function getStatus(id: string): RoomStatus {
  return STATUS_BY_ROOM_ID[id] ?? "occupied";
}

function getResidentName(index: number) {
  return RESIDENT_NAMES[index % RESIDENT_NAMES.length];
}


function getPaymentStatus(roomNumber: number): PaymentStatus {
  if (roomNumber % 11 === 0) return "overdue";
  if (roomNumber % 7 === 0) return "upcoming";
  return "paid";
}

function getPaidMonth(paymentStatus: PaymentStatus, roomNumber: number) {
  const day = String((roomNumber % 20) + 1).padStart(2, "0");
  return paymentStatus === "upcoming" ? `2026-04-${day}` : `2026-03-${day}`;
}

function getPaidAt(paymentStatus: PaymentStatus, roomNumber: number) {
  if (paymentStatus === "overdue") return "미납";
  if (paymentStatus === "upcoming") return `2026-03-${String((roomNumber % 9) + 20).padStart(2, "0")}`;
  return `2026-03-${String((roomNumber % 9) + 1).padStart(2, "0")}`;
}

const HISTORY_MONTHS = [
  { year: 2025, month: 10 },
  { year: 2025, month: 11 },
  { year: 2025, month: 12 },
  { year: 2026, month: 1 },
  { year: 2026, month: 2 },
  { year: 2026, month: 3 },
];

function buildPaymentHistory(roomNumber: number, monthlyRent: string, currentStatus: PaymentStatus): PaymentHistoryEntry[] {
  const payDay = String((roomNumber % 9) + 1).padStart(2, "0");
  return HISTORY_MONTHS.map(({ year, month }, i) => {
    const monthStr = String(month).padStart(2, "0");
    const isLast = i === HISTORY_MONTHS.length - 1;
    let status: PaymentStatus;
    if (isLast) {
      status = currentStatus;
    } else {
      status = (roomNumber * 7 + i * 3) % 17 === 0 ? "overdue" : "paid";
    }
    return {
      month: `${year}-${monthStr}`,
      paidAt: status === "paid" ? `${year}-${monthStr}-${payDay}` : null,
      amount: monthlyRent,
      status,
    };
  });
}

function buildRoom(id: string, occupiedIndex: number): Room {
  const floor = Number(id[0]) as FloorNumber;
  const roomNumber = Number(id);
  const status = getStatus(id);

  const roomType = ROOM_TYPE_BY_ID[id] ?? "Standard A-1";
  const roomPrice = `₩${ROOM_TYPE_PRICE[roomType].toLocaleString("ko-KR")}`;

  if (status !== "occupied") {
    return {
      id,
      name: `${floor}층 ${id.slice(1)}호`,
      floor,
      status,
      roomType,
      roomPrice,
      resident: null,
      phone: null,
      gender: null,
      age: null,
      moveInDate: null,
      moveOutDate: null,
      monthlyRent: null,
      paidMonth: null,
      paidAt: null,
      paymentStatus: null,
      rentStatus: status === "maintenance" ? "maintenance" : "vacant",
      paymentHistory: [],
    };
  }

  const paymentStatus = getPaymentStatus(roomNumber);
  const moveInMonth = String((roomNumber % 9) + 1).padStart(2, "0");
  const moveInDay = String((roomNumber % 19) + 1).padStart(2, "0");
  const moveOutMonth = String((roomNumber % 9) + 1).padStart(2, "0");
  const moveOutDay = String((roomNumber % 19)).padStart(2, "0") || "01";

  return {
    id,
    name: `${floor}층 ${id.slice(1)}호`,
    floor,
    status,
    roomType,
    roomPrice,
    resident: getResidentName(occupiedIndex),
    phone: `010-${String(((roomNumber * 73 + occupiedIndex * 31) % 9000) + 1000)}-${String(((roomNumber * 37 + occupiedIndex * 53) % 9000) + 1000)}`,
    gender: occupiedIndex % 2 === 0 ? '남' : '여',
    age: 20 + ((roomNumber * 3 + occupiedIndex * 7) % 16),
    moveInDate: `2025-${moveInMonth}-${moveInDay}`,
    moveOutDate: `2026-${moveOutMonth}-${moveOutDay === "00" ? "01" : moveOutDay}`,
    monthlyRent: roomPrice,
    paidMonth: getPaidMonth(paymentStatus, roomNumber),
    paidAt: getPaidAt(paymentStatus, roomNumber),
    paymentStatus,
    rentStatus: paymentStatus === "overdue" ? "overdue" : "paid",
    paymentHistory: buildPaymentHistory(roomNumber, roomPrice, paymentStatus),
  };
}

function buildRoomsByFloor(): Record<FloorNumber, Room[]> {
  let occupiedIndex = 0;

  return (Object.entries(FLOOR_ROOM_IDS) as Array<[string, string[]]>).reduce((acc, [floorKey, ids]) => {
    const floor = Number(floorKey) as FloorNumber;
    acc[floor] = ids.map((id) => {
      const room = buildRoom(id, occupiedIndex);
      if (room.status === "occupied") occupiedIndex += 1;
      return room;
    });
    return acc;
  }, {} as Record<FloorNumber, Room[]>);
}

export const ROOMS_BY_FLOOR = buildRoomsByFloor();
export const ALL_ROOMS = (Object.values(ROOMS_BY_FLOOR) as Room[][]).flat();

export function getRoomsByFloor(floor: FloorNumber) {
  return ROOMS_BY_FLOOR[floor];
}

export function getOccupiedRooms() {
  return ALL_ROOMS.filter((room) => room.status === "occupied");
}

export function getDashboardStats() {
  const occupiedRooms = ALL_ROOMS.filter((room) => room.status === "occupied").length;
  const vacantRooms = ALL_ROOMS.filter((room) => room.status === "vacant").length;
  const maintenanceRooms = ALL_ROOMS.filter((room) => room.status === "maintenance").length;

  return {
    totalRooms: ALL_ROOMS.length,
    occupiedRooms,
    vacantRooms,
    maintenanceRooms,
    occupancyRate: Math.round((occupiedRooms / ALL_ROOMS.length) * 100),
  };
}

// ────────────────────────────────────────────────────────────
// 4.2.2 입실자 상세 조회
// ────────────────────────────────────────────────────────────

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
  month: string; // "YYYY-MM"
  paidAt: string | null;
  amount: number;
  paymentMethod: RentPaymentMethod | null;
  status: "paid" | "overdue" | "upcoming";
};

export type GasBill = {
  month: string; // "YYYY-MM"
  amount: number;
};

export type ElectricityHandover = {
  scheduledMoveOutDate: string;
  actualMoveOutDate: string;
  usageAmount: number;
};

export type ResidentDetail = {
  roomId: string;
  purpose: ResidencePurpose;
  utilityIncludedRent: number; // 만원 단위
  actualMonthlyRent: number;   // 만원 단위
  paymentDueDay: number;       // 매월 N일
  contractDeposit: { date: string; amount: number };
  contractExpiry: string;
  realEstateAgency: RealEstateAgency;
  depositTotal: number;
  depositDeductions: DepositDeduction[];
  rentPayments: RentPayment[];
  gasBills: GasBill[];
  electricityHandover: ElectricityHandover | null;
};

export const RESIDENT_DETAIL_BY_ROOM: Record<string, ResidentDetail> = {
  "101": {
    roomId: "101",
    purpose: "공시생(일행)",
    utilityIncludedRent: 70,
    actualMonthlyRent: 70,
    paymentDueDay: 10,
    contractDeposit: { date: "2025-10-14", amount: 200000 },
    contractExpiry: "2026-10-13",
    realEstateAgency: "부동산 A",
    depositTotal: 500000,
    depositDeductions: [
      { date: "2026-01-15", amount: 50000, reason: "미납" },
      { date: "2026-03-05", amount: 30000, reason: "공과금정산" },
    ],
    rentPayments: [
      { month: "2025-10", paidAt: "2025-10-08", amount: 700000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-10", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-09", amount: 700000, paymentMethod: "현금", status: "paid" },
      { month: "2026-01", paidAt: null, amount: 700000, paymentMethod: null, status: "overdue" },
      { month: "2026-02", paidAt: "2026-02-07", amount: 700000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: "2026-03-10", amount: 700000, paymentMethod: "이체", status: "paid" },
    ],
    gasBills: [
      { month: "2025-10", amount: 8500 },
      { month: "2025-11", amount: 12300 },
      { month: "2025-12", amount: 18900 },
      { month: "2026-01", amount: 22100 },
      { month: "2026-02", amount: 19500 },
      { month: "2026-03", amount: 15200 },
    ],
    electricityHandover: null,
  },
  "102": {
    roomId: "102",
    purpose: "취준생",
    utilityIncludedRent: 70,
    actualMonthlyRent: 70,
    paymentDueDay: 5,
    contractDeposit: { date: "2025-09-02", amount: 200000 },
    contractExpiry: "2026-09-01",
    realEstateAgency: "부동산 B",
    depositTotal: 500000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-09", paidAt: "2025-09-04", amount: 700000, paymentMethod: "이체", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-05", amount: 700000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-03", amount: 700000, paymentMethod: "현금", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-05", amount: 700000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-04", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-05", amount: 700000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 700000, paymentMethod: null, status: "overdue" },
    ],
    gasBills: [
      { month: "2025-09", amount: 7200 },
      { month: "2025-10", amount: 9100 },
      { month: "2025-11", amount: 14600 },
      { month: "2025-12", amount: 21300 },
      { month: "2026-01", amount: 19800 },
      { month: "2026-02", amount: 16400 },
      { month: "2026-03", amount: 11200 },
    ],
    electricityHandover: null,
  },
};
