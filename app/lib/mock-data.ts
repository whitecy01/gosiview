export type FloorNumber = 1 | 2 | 3 | 4 | 5 | 6;
export type RoomStatus = "occupied" | "vacant" | "contract";
export type PaymentStatus = "paid" | "upcoming" | "overdue";

export type ScheduledResident = {
  name: string;
  phone: string;
  gender: '남' | '여';
  age: number;
  contractMoveInDate: string;   // 계약일(시작) — 계약서상 입실 예정일
  contractEndDate?: string;     // 계약일(끝) — contractMoveInDate + contractMonths - 1일
  contractMonths?: number;      // 계약 개월 수
  actualMoveInDate?: string;    // 실제 입실일 (계약일과 다를 경우)
  moveOutDate?: string;         // 실제 퇴실일 (actualMoveInDate + contractMonths - 1일)
  // 추가 계약 정보
  purpose?: ResidencePurpose;       // 거주 목적
  monthlyRent?: number;             // 실제 납부 월세 (만원 단위)
  contractDeposit?: number;         // 계약금 (원 단위)
  realEstateAgency?: RealEstateAgency; // 부동산
};

export type MaintenanceRecord = {
  date: string;   // "YYYY-MM-DD"
  amount: number;
  details: string[];
};

export const SCHEDULED_BY_ROOM: Record<string, ScheduledResident[]> = {
  "101": [{ name: "강민호", phone: "010-6374-8291", gender: '남', age: 25, contractMoveInDate: "2026-07-01", contractEndDate: "2026-09-30", contractMonths: 3, actualMoveInDate: "2026-07-03", moveOutDate: "2027-10-02" }],
  "104": [{ name: "김태양", phone: "010-5823-9104", gender: '남', age: 24, contractMoveInDate: "2026-03-26", actualMoveInDate: "2026-03-27", moveOutDate: "2027-03-25" }],
  "203": [{ name: "박현준", phone: "010-3847-6291", gender: '남', age: 27, contractMoveInDate: "2026-04-01", moveOutDate: "2027-03-31" }],
  "302": [{ name: "최수빈", phone: "010-9182-4756", gender: '여', age: 23, contractMoveInDate: "2026-03-30", moveOutDate: "2027-03-29" }],
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
  electricityHandover?: { moveOutMeter: number; vacancyMeter: number; vacancyCost: number | null; giroCost: number | null } | null;
};

export const ROOM_TENANT_HISTORY: Record<string, TenantBar[]> = {
  "101": [
    {
      name: "이수현", moveInDate: "2023-09-01", moveOutDate: "2024-02-29",
      gender: '남', age: 26, monthlyRent: 700000, phone: "010-4821-3947",
      purpose: "공시생(일행)", realEstateAgency: "부동산 A",
      depositTotal: 500000, depositDeducted: 20000,
      depositReturned: true, depositReturnedAt: "2024-03-05",
      electricityHandover: null,
    },
    {
      name: "박지수", moveInDate: "2024-03-05", moveOutDate: "2025-02-28",
      gender: '여', age: 24, monthlyRent: 700000, phone: "010-3928-5174",
      purpose: "취준생", realEstateAgency: "부동산 B",
      depositTotal: 500000, depositDeducted: 50000,
      depositReturned: true, depositReturnedAt: "2025-03-03",
      electricityHandover: { moveOutMeter: 930, vacancyMeter: 931, vacancyCost: 660, giroCost: 38000 },
    },
  ],
  "102": [
    {
      name: "최준혁", moveInDate: "2023-06-10", moveOutDate: "2024-06-09",
      gender: '남', age: 29, monthlyRent: 700000, phone: "010-7291-4836",
      purpose: "직장", realEstateAgency: "직거래",
      depositTotal: 500000, depositDeducted: 0,
      depositReturned: true, depositReturnedAt: "2024-06-12",
      electricityHandover: null,
    },
    {
      name: "송민아", moveInDate: "2024-07-01", moveOutDate: "2025-08-31",
      gender: '여', age: 22, monthlyRent: 700000, phone: "010-5847-2913",
      purpose: "수능", realEstateAgency: "부동산 C",
      depositTotal: 500000, depositDeducted: 30000,
      depositReturned: true, depositReturnedAt: "2025-09-04",
      electricityHandover: { moveOutMeter: 1150, vacancyMeter: 1152, vacancyCost: 1320, giroCost: 40500 },
    },
  ],
  "103": [
    {
      name: "김동현", moveInDate: "2024-01-15", moveOutDate: "2024-07-14",
      gender: '남', age: 27, monthlyRent: 650000, phone: "010-9283-6174",
      purpose: "공시생(임용)", realEstateAgency: "부동산 A",
      depositTotal: 300000, depositDeducted: 15000,
      depositReturned: true, depositReturnedAt: "2024-07-18",
      electricityHandover: null,
    },
    {
      name: "윤서연", moveInDate: "2024-08-01", moveOutDate: "2025-07-31",
      gender: '여', age: 23, monthlyRent: 650000, phone: "010-4736-8192",
      purpose: "세무·회계·계리", realEstateAgency: "부동산 B",
      depositTotal: 300000, depositDeducted: 0,
      depositReturned: true, depositReturnedAt: "2025-08-05",
      electricityHandover: null,
    },
  ],
  "206": [
    {
      name: "정태민", moveInDate: "2023-03-10", moveOutDate: "2024-03-09",
      gender: '남', age: 30, monthlyRent: 750000, phone: "010-2847-5931",
      purpose: "직장", realEstateAgency: "직거래",
      depositTotal: 700000, depositDeducted: 40000,
      depositReturned: true, depositReturnedAt: "2024-03-12",
      electricityHandover: null,
    },
    {
      name: "한지원", moveInDate: "2024-03-15", moveOutDate: "2025-03-04",
      gender: '여', age: 25, monthlyRent: 750000, phone: "010-6382-1947",
      purpose: "공시생(소방)", realEstateAgency: "부동산 A",
      depositTotal: 700000, depositDeducted: 60000,
      depositReturned: false, depositReturnedAt: null,
      electricityHandover: { moveOutMeter: 1060, vacancyMeter: 1062, vacancyCost: 1330, giroCost: 42000 },
    },
  ],
  "302": [
    {
      name: "오민준", moveInDate: "2023-05-01", moveOutDate: "2024-04-30",
      gender: '남', age: 24, monthlyRent: 700000, phone: "010-8473-2918",
      purpose: "공시생(경찰)", realEstateAgency: "부동산 C",
      depositTotal: 500000, depositDeducted: 20000,
      depositReturned: true, depositReturnedAt: "2024-05-03",
      electricityHandover: null,
    },
    {
      name: "강예은", moveInDate: "2024-05-10", moveOutDate: "2025-02-14",
      gender: '여', age: 21, monthlyRent: 700000, phone: "010-3948-7261",
      purpose: "수능", realEstateAgency: "부동산 B",
      depositTotal: 500000, depositDeducted: 0,
      depositReturned: true, depositReturnedAt: "2025-02-17",
      electricityHandover: { moveOutMeter: 980, vacancyMeter: 981, vacancyCost: 660, giroCost: 38500 },
    },
  ],
  "407": [
    {
      name: "임성호", moveInDate: "2023-11-01", moveOutDate: "2024-10-31",
      gender: '남', age: 33, monthlyRent: 850000, phone: "010-7382-4918",
      purpose: "직장", realEstateAgency: "직거래",
      depositTotal: 700000, depositDeducted: 35000,
      depositReturned: true, depositReturnedAt: "2024-11-04",
      electricityHandover: null,
    },
    {
      name: "조하나", moveInDate: "2024-11-15", moveOutDate: "2025-03-14",
      gender: '여', age: 28, monthlyRent: 850000, phone: "010-5928-3174",
      purpose: "취준생", realEstateAgency: "부동산 A",
      depositTotal: 700000, depositDeducted: 0,
      depositReturned: true, depositReturnedAt: "2025-03-17",
      electricityHandover: { moveOutMeter: 1120, vacancyMeter: 1123, vacancyCost: 1980, giroCost: 41000 },
    },
  ],
  "506": [
    {
      name: "박성준", moveInDate: "2023-07-01", moveOutDate: "2024-06-30",
      gender: '남', age: 31, monthlyRent: 850000, phone: "010-4827-6391",
      purpose: "직장", realEstateAgency: "부동산 B",
      depositTotal: 700000, depositDeducted: 50000,
      depositReturned: true, depositReturnedAt: "2024-07-05",
      electricityHandover: null,
    },
  ],
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
  "210": "contract",
  "302": "vacant",
  "311": "contract",
  "404": "vacant",
  "506": "vacant",
  "603": "contract",
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
      rentStatus: status === "contract" ? "contract" : "vacant",
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

const ROOM_DATA_OVERRIDE: Partial<Record<string, Partial<Room>>> = {
  "101": {
    resident: "김민준",
    phone: "010-3821-5947",
    gender: '남',
    age: 25,
    moveInDate: "2026-04-07",
    moveOutDate: "2026-06-06",
    paymentStatus: "upcoming",
    rentStatus: "paid",
  },
};

function buildRoomsByFloor(): Record<FloorNumber, Room[]> {
  let occupiedIndex = 0;

  return (Object.entries(FLOOR_ROOM_IDS) as Array<[string, string[]]>).reduce((acc, [floorKey, ids]) => {
    const floor = Number(floorKey) as FloorNumber;
    acc[floor] = ids.map((id) => {
      const room = buildRoom(id, occupiedIndex);
      if (room.status === "occupied") occupiedIndex += 1;
      const override = ROOM_DATA_OVERRIDE[id];
      return override ? { ...room, ...override } : room;
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
  const contractRooms = ALL_ROOMS.filter((room) => room.status === "contract").length;

  return {
    totalRooms: ALL_ROOMS.length,
    occupiedRooms,
    vacantRooms,
    contractRooms,
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
  moveOutDate: string;         // 퇴실일
  moveOutMeter: number;        // 퇴실 시 계량기 (kWh)
  vacancyDate: string;         // 공백기간 계량기 기록일
  vacancyMeter: number;        // 공백기간 계량기 (kWh)
  vacancyCost: number | null;  // 공백기간 전기요금 (원) - 네이버 계산기로 입력
  giroCost: number | null;     // 지로 금액 (원)
};

export type CashSuccessionRecord = {
  billingStart?: string;      // 청구기간 시작
  billingEnd?: string;        // 청구기간 종료
  landlordStart?: string;     // 임대인 현금승계 기간 시작
  landlordEnd?: string;       // 임대인 현금승계 기간 종료
  tenantStart?: string;       // 임차인 실 사용 기간 시작
  tenantEnd?: string;         // 임차인 실 사용 기간 종료
  totalAmount?: number;       // 총 금액 (원)
  totalKwh?: number;          // 총 사용량 (kWh)
  landlordAmount?: number;    // 임대인 금액 (원)
  landlordKwh?: number;       // 임대인 사용량 (kWh)
  tenantAmount?: number;      // 임차인 금액 (원)
  tenantKwh?: number;         // 임차인 사용량 (kWh)
  bankName?: string;          // 은행명
  accountHolder?: string;     // 예금주
  accountNumber?: string;     // 계좌번호
  paymentDate?: string;       // 납부 일자
  notes?: string;             // 비고
};

export type ResidentDetail = {
  roomId: string;
  purpose: ResidencePurpose;
  utilityIncludedRent: number; // 만원 단위
  actualMonthlyRent: number;   // 만원 단위
  paymentDueDay: number;       // 매월 N일
  contractMoveInDate?: string;  // 계약서상 입실일(시작) — 계약일(시작)
  contractExpiry: string;        // 계약서상 종료일 — 계약일(끝)
  actualMoveInDate?: string;     // 실제 입실일
  actualMoveOutDate?: string;    // 실제 퇴실일 (입실일 + N개월 - 1일)
  contractDeposit: { date: string; amount: number };
  realEstateAgency: RealEstateAgency;
  depositTotal: number;
  depositDeductions: DepositDeduction[];
  depositReturn: { returned: boolean; returnedAt: string | null };
  rentPayments: RentPayment[];
  gasBills: GasBill[];
  cashSuccessions: CashSuccessionRecord[];
};

export const RESIDENT_DETAIL_BY_ROOM: Record<string, ResidentDetail> = {
  "101": {
    roomId: "101",
    purpose: "공시생(일행)",
    utilityIncludedRent: 70,
    actualMonthlyRent: 70,
    paymentDueDay: 7,
    contractMoveInDate: "2026-04-05",
    contractExpiry: "2026-06-04",
    actualMoveInDate: "2026-04-07",
    actualMoveOutDate: "2026-06-06",
    contractDeposit: { date: "2026-04-05", amount: 200000 },
    realEstateAgency: "부동산 A",
    depositTotal: 500000,
    depositDeductions: [],
    rentPayments: [
      { month: "2026-04", paidAt: "2026-04-07", amount: 700000, paymentMethod: "현금", status: "paid" },
      { month: "2026-05", paidAt: null, amount: 700000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2026-04", amount: 9800 },
      { month: "2026-05", amount: 7200 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
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
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },

  // ─── 1층 ───
  "103": {
    roomId: "103",
    purpose: "공시생(소방)",
    utilityIncludedRent: 65,
    actualMonthlyRent: 65,
    paymentDueDay: 15,
    contractDeposit: { date: "2025-08-20", amount: 150000 },
    contractExpiry: "2026-08-19",
    realEstateAgency: "부동산 C",
    depositTotal: 500000,
    depositDeductions: [{ date: "2026-02-10", amount: 20000, reason: "공과금정산" }],
    rentPayments: [
      { month: "2025-08", paidAt: "2025-08-14", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-15", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-13", amount: 650000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-15", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-14", amount: 650000, paymentMethod: "현금", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-15", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-15", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 650000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-08", amount: 6800 },
      { month: "2025-09", amount: 7500 },
      { month: "2025-10", amount: 10200 },
      { month: "2025-11", amount: 15600 },
      { month: "2025-12", amount: 20100 },
      { month: "2026-01", amount: 23400 },
      { month: "2026-02", amount: 17800 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "105": {
    roomId: "105",
    purpose: "수능",
    utilityIncludedRent: 60,
    actualMonthlyRent: 60,
    paymentDueDay: 20,
    contractDeposit: { date: "2025-11-01", amount: 100000 },
    contractExpiry: "2026-10-31",
    realEstateAgency: "직거래",
    depositTotal: 300000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-11", paidAt: "2025-11-19", amount: 600000, paymentMethod: "현금", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-20", amount: 600000, paymentMethod: "현금", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-18", amount: 600000, paymentMethod: "현금", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-20", amount: 600000, paymentMethod: "현금", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 600000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-11", amount: 11200 },
      { month: "2025-12", amount: 19800 },
      { month: "2026-01", amount: 25600 },
      { month: "2026-02", amount: 21300 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },

  // ─── 2층 ───
  "201": {
    roomId: "201",
    purpose: "공시생(경찰)",
    utilityIncludedRent: 68,
    actualMonthlyRent: 65,
    paymentDueDay: 10,
    contractDeposit: { date: "2025-07-15", amount: 200000 },
    contractExpiry: "2026-07-14",
    realEstateAgency: "부동산 A",
    depositTotal: 500000,
    depositDeductions: [
      { date: "2025-12-20", amount: 30000, reason: "도배" },
      { date: "2026-02-05", amount: 50000, reason: "시설손상" },
    ],
    rentPayments: [
      { month: "2025-07", paidAt: "2025-07-09", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-08", paidAt: "2025-08-10", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-08", amount: 650000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-10", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-09", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-10", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-10", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-10", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 650000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-07", amount: 5400 },
      { month: "2025-08", amount: 4900 },
      { month: "2025-09", amount: 6200 },
      { month: "2025-10", amount: 9800 },
      { month: "2025-11", amount: 14500 },
      { month: "2025-12", amount: 20300 },
      { month: "2026-01", amount: 22700 },
      { month: "2026-02", amount: 18100 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "202": {
    roomId: "202",
    purpose: "세무·회계·계리",
    utilityIncludedRent: 72,
    actualMonthlyRent: 70,
    paymentDueDay: 5,
    contractDeposit: { date: "2025-06-01", amount: 200000 },
    contractExpiry: "2026-05-31",
    realEstateAgency: "부동산 B",
    depositTotal: 600000,
    depositDeductions: [{ date: "2026-01-08", amount: 40000, reason: "차임" }],
    rentPayments: [
      { month: "2025-06", paidAt: "2025-06-03", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-07", paidAt: "2025-07-05", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-08", paidAt: "2025-08-04", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-05", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-03", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-05", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-04", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-01", paidAt: null, amount: 700000, paymentMethod: null, status: "overdue" },
      { month: "2026-02", paidAt: "2026-02-05", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-03", paidAt: "2026-03-05", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
    ],
    gasBills: [
      { month: "2025-06", amount: 4100 },
      { month: "2025-07", amount: 3800 },
      { month: "2025-08", amount: 3600 },
      { month: "2025-09", amount: 5900 },
      { month: "2025-10", amount: 11200 },
      { month: "2025-11", amount: 16800 },
      { month: "2025-12", amount: 22400 },
      { month: "2026-01", amount: 25100 },
      { month: "2026-02", amount: 19600 },
      { month: "2026-03", amount: 13400 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "204": {
    roomId: "204",
    purpose: "취준생",
    utilityIncludedRent: 65,
    actualMonthlyRent: 65,
    paymentDueDay: 1,
    contractDeposit: { date: "2025-09-25", amount: 150000 },
    contractExpiry: "2026-09-24",
    realEstateAgency: "부동산 C",
    depositTotal: 500000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-10", paidAt: "2025-10-01", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-01", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-01", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-02", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-01", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: "2026-03-01", amount: 650000, paymentMethod: "이체", status: "paid" },
    ],
    gasBills: [
      { month: "2025-10", amount: 8700 },
      { month: "2025-11", amount: 13900 },
      { month: "2025-12", amount: 19200 },
      { month: "2026-01", amount: 21800 },
      { month: "2026-02", amount: 17300 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "205": {
    roomId: "205",
    purpose: "공시생(임용)",
    utilityIncludedRent: 68,
    actualMonthlyRent: 68,
    paymentDueDay: 15,
    contractDeposit: { date: "2025-05-10", amount: 200000 },
    contractExpiry: "2026-05-09",
    realEstateAgency: "부동산 A",
    depositTotal: 500000,
    depositDeductions: [
      { date: "2025-11-12", amount: 15000, reason: "공과금정산" },
      { date: "2026-02-18", amount: 35000, reason: "타일" },
    ],
    rentPayments: [
      { month: "2025-05", paidAt: "2025-05-14", amount: 680000, paymentMethod: "이체", status: "paid" },
      { month: "2025-06", paidAt: "2025-06-15", amount: 680000, paymentMethod: "이체", status: "paid" },
      { month: "2025-07", paidAt: "2025-07-14", amount: 680000, paymentMethod: "이체", status: "paid" },
      { month: "2025-08", paidAt: "2025-08-15", amount: 680000, paymentMethod: "이체", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-13", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-15", amount: 680000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-15", amount: 680000, paymentMethod: "이체", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-13", amount: 680000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-15", amount: 680000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-14", amount: 680000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 680000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-05", amount: 3200 },
      { month: "2025-06", amount: 2900 },
      { month: "2025-07", amount: 2700 },
      { month: "2025-08", amount: 3100 },
      { month: "2025-09", amount: 5800 },
      { month: "2025-10", amount: 10400 },
      { month: "2025-11", amount: 16200 },
      { month: "2025-12", amount: 23500 },
      { month: "2026-01", amount: 26800 },
      { month: "2026-02", amount: 21100 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "206": {
    roomId: "206",
    purpose: "직장",
    utilityIncludedRent: 75,
    actualMonthlyRent: 75,
    paymentDueDay: 10,
    contractDeposit: { date: "2025-03-05", amount: 300000 },
    contractExpiry: "2026-03-04",
    realEstateAgency: "직거래",
    depositTotal: 700000,
    depositDeductions: [{ date: "2026-03-10", amount: 60000, reason: "시설손상" }],
    rentPayments: [
      { month: "2025-03", paidAt: "2025-03-09", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-04", paidAt: "2025-04-10", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-05", paidAt: "2025-05-08", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-06", paidAt: "2025-06-10", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-07", paidAt: "2025-07-09", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-08", paidAt: "2025-08-10", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-10", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-09", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-10", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-10", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-10", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-10", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-03", paidAt: "2026-03-10", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
    ],
    gasBills: [
      { month: "2025-03", amount: 18500 },
      { month: "2025-04", amount: 10200 },
      { month: "2025-05", amount: 5600 },
      { month: "2025-06", amount: 3800 },
      { month: "2025-07", amount: 3200 },
      { month: "2025-08", amount: 3500 },
      { month: "2025-09", amount: 6100 },
      { month: "2025-10", amount: 11800 },
      { month: "2025-11", amount: 18400 },
      { month: "2025-12", amount: 24600 },
      { month: "2026-01", amount: 27900 },
      { month: "2026-02", amount: 22300 },
      { month: "2026-03", amount: 16100 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "207": {
    roomId: "207",
    purpose: "공시생(일행)",
    utilityIncludedRent: 63,
    actualMonthlyRent: 63,
    paymentDueDay: 20,
    contractDeposit: { date: "2025-10-18", amount: 150000 },
    contractExpiry: "2026-10-17",
    realEstateAgency: "부동산 B",
    depositTotal: 500000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-10", paidAt: "2025-10-19", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-20", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-19", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-20", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-19", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 630000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-10", amount: 9300 },
      { month: "2025-11", amount: 14700 },
      { month: "2025-12", amount: 20500 },
      { month: "2026-01", amount: 23100 },
      { month: "2026-02", amount: 18600 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "208": {
    roomId: "208",
    purpose: "공시생(소방)",
    utilityIncludedRent: 63,
    actualMonthlyRent: 60,
    paymentDueDay: 5,
    contractDeposit: { date: "2025-08-01", amount: 150000 },
    contractExpiry: "2026-07-31",
    realEstateAgency: "부동산 A",
    depositTotal: 400000,
    depositDeductions: [{ date: "2026-01-20", amount: 25000, reason: "미납" }],
    rentPayments: [
      { month: "2025-08", paidAt: "2025-08-04", amount: 600000, paymentMethod: "이체", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-05", amount: 600000, paymentMethod: "이체", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-03", amount: 600000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-05", amount: 600000, paymentMethod: "이체", status: "paid" },
      { month: "2025-12", paidAt: null, amount: 600000, paymentMethod: null, status: "overdue" },
      { month: "2026-01", paidAt: "2026-01-05", amount: 600000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-05", amount: 600000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 600000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-08", amount: 4200 },
      { month: "2025-09", amount: 6500 },
      { month: "2025-10", amount: 10900 },
      { month: "2025-11", amount: 15400 },
      { month: "2025-12", amount: 21700 },
      { month: "2026-01", amount: 24300 },
      { month: "2026-02", amount: 19000 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "209": {
    roomId: "209",
    purpose: "취준생",
    utilityIncludedRent: 65,
    actualMonthlyRent: 65,
    paymentDueDay: 15,
    contractDeposit: { date: "2025-12-10", amount: 200000 },
    contractExpiry: "2026-12-09",
    realEstateAgency: "부동산 C",
    depositTotal: 500000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-12", paidAt: "2025-12-14", amount: 650000, paymentMethod: "현금", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-15", amount: 650000, paymentMethod: "현금", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-13", amount: 650000, paymentMethod: "현금", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 650000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-12", amount: 17600 },
      { month: "2026-01", amount: 22900 },
      { month: "2026-02", amount: 18300 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "211": {
    roomId: "211",
    purpose: "공시생(경찰)",
    utilityIncludedRent: 63,
    actualMonthlyRent: 63,
    paymentDueDay: 10,
    contractDeposit: { date: "2025-09-05", amount: 150000 },
    contractExpiry: "2026-09-04",
    realEstateAgency: "직거래",
    depositTotal: 400000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-09", paidAt: "2025-09-09", amount: 630000, paymentMethod: "현금", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-10", amount: 630000, paymentMethod: "현금", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-09", amount: 630000, paymentMethod: "현금", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-10", amount: 630000, paymentMethod: "현금", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-10", amount: 630000, paymentMethod: "현금", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-08", amount: 630000, paymentMethod: "현금", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 630000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-09", amount: 5700 },
      { month: "2025-10", amount: 9400 },
      { month: "2025-11", amount: 14100 },
      { month: "2025-12", amount: 19800 },
      { month: "2026-01", amount: 23600 },
      { month: "2026-02", amount: 17200 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "212": {
    roomId: "212",
    purpose: "세무·회계·계리",
    utilityIncludedRent: 75,
    actualMonthlyRent: 72,
    paymentDueDay: 25,
    contractDeposit: { date: "2025-04-20", amount: 300000 },
    contractExpiry: "2026-04-19",
    realEstateAgency: "부동산 A",
    depositTotal: 700000,
    depositDeductions: [
      { date: "2025-10-25", amount: 20000, reason: "공과금정산" },
      { date: "2026-01-28", amount: 45000, reason: "도배" },
    ],
    rentPayments: [
      { month: "2025-04", paidAt: "2025-04-24", amount: 720000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-05", paidAt: "2025-05-25", amount: 720000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-06", paidAt: "2025-06-23", amount: 720000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-07", paidAt: "2025-07-25", amount: 720000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-08", paidAt: "2025-08-25", amount: 720000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-24", amount: 720000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-25", amount: 720000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-25", amount: 720000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-24", amount: 720000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-25", amount: 720000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-25", amount: 720000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 720000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-04", amount: 8900 },
      { month: "2025-05", amount: 4300 },
      { month: "2025-06", amount: 3100 },
      { month: "2025-07", amount: 2800 },
      { month: "2025-08", amount: 3400 },
      { month: "2025-09", amount: 6700 },
      { month: "2025-10", amount: 12500 },
      { month: "2025-11", amount: 18900 },
      { month: "2025-12", amount: 25200 },
      { month: "2026-01", amount: 28400 },
      { month: "2026-02", amount: 22600 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "213": {
    roomId: "213",
    purpose: "공시생(임용)",
    utilityIncludedRent: 60,
    actualMonthlyRent: 60,
    paymentDueDay: 1,
    contractDeposit: { date: "2026-01-05", amount: 100000 },
    contractExpiry: "2027-01-04",
    realEstateAgency: "부동산 B",
    depositTotal: 300000,
    depositDeductions: [],
    rentPayments: [
      { month: "2026-01", paidAt: "2026-01-05", amount: 600000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-01", amount: 600000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: "2026-03-01", amount: 600000, paymentMethod: "이체", status: "paid" },
    ],
    gasBills: [
      { month: "2026-01", amount: 20100 },
      { month: "2026-02", amount: 16800 },
      { month: "2026-03", amount: 12400 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },

  // ─── 3층 ───
  "301": {
    roomId: "301",
    purpose: "공시생(일행)",
    utilityIncludedRent: 65,
    actualMonthlyRent: 65,
    paymentDueDay: 10,
    contractDeposit: { date: "2025-07-01", amount: 200000 },
    contractExpiry: "2026-06-30",
    realEstateAgency: "부동산 C",
    depositTotal: 500000,
    depositDeductions: [{ date: "2025-12-15", amount: 30000, reason: "미납" }],
    rentPayments: [
      { month: "2025-07", paidAt: "2025-07-09", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-08", paidAt: "2025-08-10", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-09", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-10", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: null, amount: 650000, paymentMethod: null, status: "overdue" },
      { month: "2025-12", paidAt: "2025-12-10", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-10", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-10", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 650000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-07", amount: 4800 },
      { month: "2025-08", amount: 4100 },
      { month: "2025-09", amount: 6300 },
      { month: "2025-10", amount: 11600 },
      { month: "2025-11", amount: 17200 },
      { month: "2025-12", amount: 23400 },
      { month: "2026-01", amount: 26100 },
      { month: "2026-02", amount: 19800 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "303": {
    roomId: "303",
    purpose: "수능",
    utilityIncludedRent: 58,
    actualMonthlyRent: 58,
    paymentDueDay: 20,
    contractDeposit: { date: "2025-11-15", amount: 100000 },
    contractExpiry: "2026-11-14",
    realEstateAgency: "직거래",
    depositTotal: 300000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-11", paidAt: "2025-11-19", amount: 580000, paymentMethod: "현금", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-20", amount: 580000, paymentMethod: "현금", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-19", amount: 580000, paymentMethod: "현금", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-20", amount: 580000, paymentMethod: "현금", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 580000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-11", amount: 13800 },
      { month: "2025-12", amount: 20600 },
      { month: "2026-01", amount: 24500 },
      { month: "2026-02", amount: 18700 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "304": {
    roomId: "304",
    purpose: "공시생(경찰)",
    utilityIncludedRent: 65,
    actualMonthlyRent: 63,
    paymentDueDay: 5,
    contractDeposit: { date: "2025-06-20", amount: 200000 },
    contractExpiry: "2026-06-19",
    realEstateAgency: "부동산 A",
    depositTotal: 500000,
    depositDeductions: [{ date: "2026-02-22", amount: 40000, reason: "시설손상" }],
    rentPayments: [
      { month: "2025-06", paidAt: "2025-06-04", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-07", paidAt: "2025-07-05", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-08", paidAt: "2025-08-04", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-05", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-03", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-05", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-04", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-05", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-05", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 630000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-06", amount: 3900 },
      { month: "2025-07", amount: 3300 },
      { month: "2025-08", amount: 3600 },
      { month: "2025-09", amount: 6800 },
      { month: "2025-10", amount: 12300 },
      { month: "2025-11", amount: 17900 },
      { month: "2025-12", amount: 24100 },
      { month: "2026-01", amount: 27300 },
      { month: "2026-02", amount: 21500 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "305": {
    roomId: "305",
    purpose: "취준생",
    utilityIncludedRent: 63,
    actualMonthlyRent: 63,
    paymentDueDay: 15,
    contractDeposit: { date: "2025-10-05", amount: 150000 },
    contractExpiry: "2026-10-04",
    realEstateAgency: "부동산 B",
    depositTotal: 400000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-10", paidAt: "2025-10-14", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-15", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-13", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-15", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-14", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 630000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-10", amount: 9100 },
      { month: "2025-11", amount: 14800 },
      { month: "2025-12", amount: 21400 },
      { month: "2026-01", amount: 25000 },
      { month: "2026-02", amount: 19200 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "306": {
    roomId: "306",
    purpose: "공시생(소방)",
    utilityIncludedRent: 65,
    actualMonthlyRent: 65,
    paymentDueDay: 1,
    contractDeposit: { date: "2025-09-28", amount: 150000 },
    contractExpiry: "2026-09-27",
    realEstateAgency: "부동산 C",
    depositTotal: 500000,
    depositDeductions: [{ date: "2026-01-03", amount: 20000, reason: "공과금정산" }],
    rentPayments: [
      { month: "2025-10", paidAt: "2025-10-01", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-01", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-01", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-02", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-01", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: "2026-03-01", amount: 650000, paymentMethod: "이체", status: "paid" },
    ],
    gasBills: [
      { month: "2025-10", amount: 8600 },
      { month: "2025-11", amount: 13900 },
      { month: "2025-12", amount: 20800 },
      { month: "2026-01", amount: 24200 },
      { month: "2026-02", amount: 18500 },
      { month: "2026-03", amount: 12900 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "307": {
    roomId: "307",
    purpose: "직장",
    utilityIncludedRent: 73,
    actualMonthlyRent: 70,
    paymentDueDay: 10,
    contractDeposit: { date: "2025-02-15", amount: 300000 },
    contractExpiry: "2026-02-14",
    realEstateAgency: "직거래",
    depositTotal: 700000,
    depositDeductions: [
      { date: "2025-08-20", amount: 25000, reason: "타일" },
      { date: "2026-01-12", amount: 50000, reason: "도배" },
    ],
    rentPayments: [
      { month: "2025-02", paidAt: "2025-02-09", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-03", paidAt: "2025-03-10", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-04", paidAt: "2025-04-09", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-05", paidAt: "2025-05-10", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-06", paidAt: "2025-06-09", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-07", paidAt: "2025-07-10", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-08", paidAt: "2025-08-08", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-10", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-09", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-10", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-10", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-10", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-02", paidAt: null, amount: 700000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-02", amount: 22100 },
      { month: "2025-03", amount: 16400 },
      { month: "2025-04", amount: 9700 },
      { month: "2025-05", amount: 4800 },
      { month: "2025-06", amount: 3400 },
      { month: "2025-07", amount: 3100 },
      { month: "2025-08", amount: 3700 },
      { month: "2025-09", amount: 7200 },
      { month: "2025-10", amount: 13100 },
      { month: "2025-11", amount: 19700 },
      { month: "2025-12", amount: 26300 },
      { month: "2026-01", amount: 29100 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "308": {
    roomId: "308",
    purpose: "공시생(임용)",
    utilityIncludedRent: 65,
    actualMonthlyRent: 65,
    paymentDueDay: 15,
    contractDeposit: { date: "2025-08-10", amount: 200000 },
    contractExpiry: "2026-08-09",
    realEstateAgency: "부동산 A",
    depositTotal: 500000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-08", paidAt: "2025-08-14", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-15", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-14", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-15", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-13", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-15", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-14", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 650000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-08", amount: 4500 },
      { month: "2025-09", amount: 6900 },
      { month: "2025-10", amount: 11400 },
      { month: "2025-11", amount: 16700 },
      { month: "2025-12", amount: 22800 },
      { month: "2026-01", amount: 25700 },
      { month: "2026-02", amount: 20300 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "309": {
    roomId: "309",
    purpose: "세무·회계·계리",
    utilityIncludedRent: 70,
    actualMonthlyRent: 68,
    paymentDueDay: 5,
    contractDeposit: { date: "2025-05-25", amount: 200000 },
    contractExpiry: "2026-05-24",
    realEstateAgency: "부동산 B",
    depositTotal: 600000,
    depositDeductions: [{ date: "2025-12-08", amount: 35000, reason: "차임" }],
    rentPayments: [
      { month: "2025-05", paidAt: "2025-05-04", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-06", paidAt: "2025-06-05", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-07", paidAt: "2025-07-04", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-08", paidAt: "2025-08-05", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-05", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-03", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-11", paidAt: null, amount: 680000, paymentMethod: null, status: "overdue" },
      { month: "2025-12", paidAt: "2025-12-05", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-05", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-04", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 680000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-05", amount: 3600 },
      { month: "2025-06", amount: 2900 },
      { month: "2025-07", amount: 2600 },
      { month: "2025-08", amount: 3300 },
      { month: "2025-09", amount: 6500 },
      { month: "2025-10", amount: 11700 },
      { month: "2025-11", amount: 17300 },
      { month: "2025-12", amount: 23900 },
      { month: "2026-01", amount: 27000 },
      { month: "2026-02", amount: 20800 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "310": {
    roomId: "310",
    purpose: "공시생(일행)",
    utilityIncludedRent: 63,
    actualMonthlyRent: 63,
    paymentDueDay: 20,
    contractDeposit: { date: "2025-10-12", amount: 150000 },
    contractExpiry: "2026-10-11",
    realEstateAgency: "부동산 C",
    depositTotal: 400000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-10", paidAt: "2025-10-19", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-20", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-19", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-20", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-20", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 630000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-10", amount: 8100 },
      { month: "2025-11", amount: 13500 },
      { month: "2025-12", amount: 19700 },
      { month: "2026-01", amount: 22800 },
      { month: "2026-02", amount: 17600 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "312": {
    roomId: "312",
    purpose: "직장",
    utilityIncludedRent: 75,
    actualMonthlyRent: 73,
    paymentDueDay: 1,
    contractDeposit: { date: "2025-03-28", amount: 300000 },
    contractExpiry: "2026-03-27",
    realEstateAgency: "직거래",
    depositTotal: 700000,
    depositDeductions: [
      { date: "2025-09-05", amount: 20000, reason: "공과금정산" },
      { date: "2026-02-01", amount: 55000, reason: "도배" },
    ],
    rentPayments: [
      { month: "2025-04", paidAt: "2025-04-01", amount: 730000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-05", paidAt: "2025-05-01", amount: 730000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-06", paidAt: "2025-06-02", amount: 730000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-07", paidAt: "2025-07-01", amount: 730000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-08", paidAt: "2025-08-01", amount: 730000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-01", amount: 730000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-01", amount: 730000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-01", amount: 730000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-01", amount: 730000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-02", amount: 730000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-01", amount: 730000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-03", paidAt: "2026-03-01", amount: 730000, paymentMethod: "이체(자진발급)", status: "paid" },
    ],
    gasBills: [
      { month: "2025-04", amount: 9600 },
      { month: "2025-05", amount: 4200 },
      { month: "2025-06", amount: 3100 },
      { month: "2025-07", amount: 2800 },
      { month: "2025-08", amount: 3500 },
      { month: "2025-09", amount: 7100 },
      { month: "2025-10", amount: 13400 },
      { month: "2025-11", amount: 20200 },
      { month: "2025-12", amount: 27100 },
      { month: "2026-01", amount: 30200 },
      { month: "2026-02", amount: 24400 },
      { month: "2026-03", amount: 17600 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "313": {
    roomId: "313",
    purpose: "공시생(경찰)",
    utilityIncludedRent: 60,
    actualMonthlyRent: 60,
    paymentDueDay: 15,
    contractDeposit: { date: "2025-12-20", amount: 100000 },
    contractExpiry: "2026-12-19",
    realEstateAgency: "부동산 A",
    depositTotal: 300000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-12", paidAt: "2025-12-14", amount: 600000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-15", amount: 600000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-14", amount: 600000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 600000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-12", amount: 18400 },
      { month: "2026-01", amount: 22100 },
      { month: "2026-02", amount: 17000 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },

  // ─── 4층 ───
  "401": {
    roomId: "401",
    purpose: "취준생",
    utilityIncludedRent: 65,
    actualMonthlyRent: 65,
    paymentDueDay: 10,
    contractDeposit: { date: "2025-09-10", amount: 200000 },
    contractExpiry: "2026-09-09",
    realEstateAgency: "부동산 B",
    depositTotal: 500000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-09", paidAt: "2025-09-09", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-10", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-09", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-10", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-10", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-09", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 650000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-09", amount: 6100 },
      { month: "2025-10", amount: 10500 },
      { month: "2025-11", amount: 15900 },
      { month: "2025-12", amount: 21600 },
      { month: "2026-01", amount: 24800 },
      { month: "2026-02", amount: 19400 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "402": {
    roomId: "402",
    purpose: "공시생(임용)",
    utilityIncludedRent: 68,
    actualMonthlyRent: 68,
    paymentDueDay: 5,
    contractDeposit: { date: "2025-07-20", amount: 200000 },
    contractExpiry: "2026-07-19",
    realEstateAgency: "부동산 C",
    depositTotal: 500000,
    depositDeductions: [{ date: "2026-02-10", amount: 30000, reason: "미납" }],
    rentPayments: [
      { month: "2025-07", paidAt: "2025-07-04", amount: 680000, paymentMethod: "이체", status: "paid" },
      { month: "2025-08", paidAt: "2025-08-05", amount: 680000, paymentMethod: "이체", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-04", amount: 680000, paymentMethod: "이체", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-05", amount: 680000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: null, amount: 680000, paymentMethod: null, status: "overdue" },
      { month: "2025-12", paidAt: "2025-12-05", amount: 680000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-05", amount: 680000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-05", amount: 680000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 680000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-07", amount: 5000 },
      { month: "2025-08", amount: 4300 },
      { month: "2025-09", amount: 6700 },
      { month: "2025-10", amount: 12100 },
      { month: "2025-11", amount: 18300 },
      { month: "2025-12", amount: 24500 },
      { month: "2026-01", amount: 27600 },
      { month: "2026-02", amount: 21900 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "403": {
    roomId: "403",
    purpose: "공시생(소방)",
    utilityIncludedRent: 63,
    actualMonthlyRent: 60,
    paymentDueDay: 20,
    contractDeposit: { date: "2025-11-20", amount: 150000 },
    contractExpiry: "2026-11-19",
    realEstateAgency: "직거래",
    depositTotal: 400000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-11", paidAt: "2025-11-19", amount: 600000, paymentMethod: "현금", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-20", amount: 600000, paymentMethod: "현금", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-19", amount: 600000, paymentMethod: "현금", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-20", amount: 600000, paymentMethod: "현금", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 600000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-11", amount: 12700 },
      { month: "2025-12", amount: 18900 },
      { month: "2026-01", amount: 23100 },
      { month: "2026-02", amount: 17800 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "405": {
    roomId: "405",
    purpose: "공시생(일행)",
    utilityIncludedRent: 65,
    actualMonthlyRent: 65,
    paymentDueDay: 15,
    contractDeposit: { date: "2025-08-25", amount: 200000 },
    contractExpiry: "2026-08-24",
    realEstateAgency: "부동산 A",
    depositTotal: 500000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-08", paidAt: "2025-08-14", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-15", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-14", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-15", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-13", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-15", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-14", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 650000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-08", amount: 4700 },
      { month: "2025-09", amount: 7100 },
      { month: "2025-10", amount: 11900 },
      { month: "2025-11", amount: 17500 },
      { month: "2025-12", amount: 23800 },
      { month: "2026-01", amount: 26900 },
      { month: "2026-02", amount: 21200 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "406": {
    roomId: "406",
    purpose: "세무·회계·계리",
    utilityIncludedRent: 70,
    actualMonthlyRent: 68,
    paymentDueDay: 1,
    contractDeposit: { date: "2025-06-10", amount: 200000 },
    contractExpiry: "2026-06-09",
    realEstateAgency: "부동산 B",
    depositTotal: 600000,
    depositDeductions: [{ date: "2026-01-05", amount: 45000, reason: "시설손상" }],
    rentPayments: [
      { month: "2025-06", paidAt: "2025-06-30", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-07", paidAt: "2025-07-01", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-08", paidAt: "2025-08-01", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-01", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-01", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-01", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-01", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-02", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-01", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 680000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-06", amount: 3700 },
      { month: "2025-07", amount: 3000 },
      { month: "2025-08", amount: 3400 },
      { month: "2025-09", amount: 7000 },
      { month: "2025-10", amount: 12600 },
      { month: "2025-11", amount: 19100 },
      { month: "2025-12", amount: 25900 },
      { month: "2026-01", amount: 28700 },
      { month: "2026-02", amount: 22900 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "407": {
    roomId: "407",
    purpose: "취준생",
    utilityIncludedRent: 65,
    actualMonthlyRent: 65,
    paymentDueDay: 10,
    contractDeposit: { date: "2025-10-01", amount: 150000 },
    contractExpiry: "2026-09-30",
    realEstateAgency: "부동산 C",
    depositTotal: 500000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-10", paidAt: "2025-10-09", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-10", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-09", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-10", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-09", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 650000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-10", amount: 9700 },
      { month: "2025-11", amount: 15100 },
      { month: "2025-12", amount: 21300 },
      { month: "2026-01", amount: 24600 },
      { month: "2026-02", amount: 18900 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "408": {
    roomId: "408",
    purpose: "직장",
    utilityIncludedRent: 75,
    actualMonthlyRent: 75,
    paymentDueDay: 25,
    contractDeposit: { date: "2025-04-05", amount: 300000 },
    contractExpiry: "2026-04-04",
    realEstateAgency: "직거래",
    depositTotal: 700000,
    depositDeductions: [
      { date: "2025-10-28", amount: 30000, reason: "타일" },
      { date: "2026-02-26", amount: 60000, reason: "도배" },
    ],
    rentPayments: [
      { month: "2025-04", paidAt: "2025-04-24", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-05", paidAt: "2025-05-25", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-06", paidAt: "2025-06-24", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-07", paidAt: "2025-07-25", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-08", paidAt: "2025-08-25", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-24", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-25", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-25", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-24", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-25", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-25", amount: 750000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 750000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-04", amount: 10200 },
      { month: "2025-05", amount: 4900 },
      { month: "2025-06", amount: 3300 },
      { month: "2025-07", amount: 2900 },
      { month: "2025-08", amount: 3600 },
      { month: "2025-09", amount: 7500 },
      { month: "2025-10", amount: 13800 },
      { month: "2025-11", amount: 20700 },
      { month: "2025-12", amount: 27600 },
      { month: "2026-01", amount: 30900 },
      { month: "2026-02", amount: 25100 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },

  // ─── 5층 ───
  "501": {
    roomId: "501",
    purpose: "공시생(임용)",
    utilityIncludedRent: 65,
    actualMonthlyRent: 65,
    paymentDueDay: 5,
    contractDeposit: { date: "2025-08-05", amount: 200000 },
    contractExpiry: "2026-08-04",
    realEstateAgency: "부동산 A",
    depositTotal: 500000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-08", paidAt: "2025-08-04", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-05", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-03", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-05", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-04", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-05", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-05", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 650000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-08", amount: 4600 },
      { month: "2025-09", amount: 7000 },
      { month: "2025-10", amount: 11800 },
      { month: "2025-11", amount: 17400 },
      { month: "2025-12", amount: 23700 },
      { month: "2026-01", amount: 26500 },
      { month: "2026-02", amount: 20700 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "502": {
    roomId: "502",
    purpose: "공시생(경찰)",
    utilityIncludedRent: 63,
    actualMonthlyRent: 63,
    paymentDueDay: 15,
    contractDeposit: { date: "2025-10-20", amount: 150000 },
    contractExpiry: "2026-10-19",
    realEstateAgency: "부동산 B",
    depositTotal: 400000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-10", paidAt: "2025-10-14", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-15", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-13", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-15", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-14", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 630000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-10", amount: 8400 },
      { month: "2025-11", amount: 13600 },
      { month: "2025-12", amount: 20100 },
      { month: "2026-01", amount: 23400 },
      { month: "2026-02", amount: 17900 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "503": {
    roomId: "503",
    purpose: "취준생",
    utilityIncludedRent: 65,
    actualMonthlyRent: 63,
    paymentDueDay: 10,
    contractDeposit: { date: "2025-07-08", amount: 200000 },
    contractExpiry: "2026-07-07",
    realEstateAgency: "부동산 C",
    depositTotal: 500000,
    depositDeductions: [{ date: "2026-01-15", amount: 35000, reason: "시설손상" }],
    rentPayments: [
      { month: "2025-07", paidAt: "2025-07-09", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-08", paidAt: "2025-08-10", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-09", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-10", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-09", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-10", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-10", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-09", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 630000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-07", amount: 5200 },
      { month: "2025-08", amount: 4400 },
      { month: "2025-09", amount: 6900 },
      { month: "2025-10", amount: 12200 },
      { month: "2025-11", amount: 18100 },
      { month: "2025-12", amount: 24400 },
      { month: "2026-01", amount: 27800 },
      { month: "2026-02", amount: 22000 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "504": {
    roomId: "504",
    purpose: "수능",
    utilityIncludedRent: 58,
    actualMonthlyRent: 58,
    paymentDueDay: 20,
    contractDeposit: { date: "2025-11-08", amount: 100000 },
    contractExpiry: "2026-11-07",
    realEstateAgency: "직거래",
    depositTotal: 300000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-11", paidAt: "2025-11-19", amount: 580000, paymentMethod: "현금", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-20", amount: 580000, paymentMethod: "현금", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-19", amount: 580000, paymentMethod: "현금", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-20", amount: 580000, paymentMethod: "현금", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 580000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-11", amount: 12500 },
      { month: "2025-12", amount: 19300 },
      { month: "2026-01", amount: 23800 },
      { month: "2026-02", amount: 18200 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "505": {
    roomId: "505",
    purpose: "공시생(소방)",
    utilityIncludedRent: 63,
    actualMonthlyRent: 63,
    paymentDueDay: 1,
    contractDeposit: { date: "2025-09-22", amount: 150000 },
    contractExpiry: "2026-09-21",
    realEstateAgency: "부동산 A",
    depositTotal: 400000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-10", paidAt: "2025-10-01", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-01", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-01", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-02", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-01", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: "2026-03-01", amount: 630000, paymentMethod: "이체", status: "paid" },
    ],
    gasBills: [
      { month: "2025-10", amount: 8900 },
      { month: "2025-11", amount: 14400 },
      { month: "2025-12", amount: 20900 },
      { month: "2026-01", amount: 24300 },
      { month: "2026-02", amount: 18600 },
      { month: "2026-03", amount: 13100 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "507": {
    roomId: "507",
    purpose: "직장",
    utilityIncludedRent: 73,
    actualMonthlyRent: 70,
    paymentDueDay: 15,
    contractDeposit: { date: "2025-05-18", amount: 300000 },
    contractExpiry: "2026-05-17",
    realEstateAgency: "부동산 B",
    depositTotal: 700000,
    depositDeductions: [
      { date: "2025-11-20", amount: 25000, reason: "공과금정산" },
      { date: "2026-02-17", amount: 50000, reason: "도배" },
    ],
    rentPayments: [
      { month: "2025-05", paidAt: "2025-05-14", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-06", paidAt: "2025-06-15", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-07", paidAt: "2025-07-14", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-08", paidAt: "2025-08-15", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-13", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-15", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-15", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-14", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-15", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-14", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 700000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-05", amount: 3800 },
      { month: "2025-06", amount: 3100 },
      { month: "2025-07", amount: 2800 },
      { month: "2025-08", amount: 3400 },
      { month: "2025-09", amount: 6800 },
      { month: "2025-10", amount: 12700 },
      { month: "2025-11", amount: 19500 },
      { month: "2025-12", amount: 26300 },
      { month: "2026-01", amount: 29700 },
      { month: "2026-02", amount: 23800 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },

  // ─── 6층 ───
  "601": {
    roomId: "601",
    purpose: "공시생(임용)",
    utilityIncludedRent: 65,
    actualMonthlyRent: 65,
    paymentDueDay: 10,
    contractDeposit: { date: "2025-09-15", amount: 200000 },
    contractExpiry: "2026-09-14",
    realEstateAgency: "부동산 A",
    depositTotal: 500000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-09", paidAt: "2025-09-09", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-10", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-09", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-10", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-10", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-09", amount: 650000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 650000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-09", amount: 5900 },
      { month: "2025-10", amount: 10700 },
      { month: "2025-11", amount: 16300 },
      { month: "2025-12", amount: 22600 },
      { month: "2026-01", amount: 25900 },
      { month: "2026-02", amount: 20100 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "602": {
    roomId: "602",
    purpose: "취준생",
    utilityIncludedRent: 63,
    actualMonthlyRent: 63,
    paymentDueDay: 5,
    contractDeposit: { date: "2025-11-25", amount: 150000 },
    contractExpiry: "2026-11-24",
    realEstateAgency: "부동산 C",
    depositTotal: 400000,
    depositDeductions: [],
    rentPayments: [
      { month: "2025-11", paidAt: "2025-11-04", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-05", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-04", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-05", amount: 630000, paymentMethod: "이체", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 630000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-11", amount: 13200 },
      { month: "2025-12", amount: 20400 },
      { month: "2026-01", amount: 24100 },
      { month: "2026-02", amount: 18400 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "604": {
    roomId: "604",
    purpose: "공시생(일행)",
    utilityIncludedRent: 63,
    actualMonthlyRent: 63,
    paymentDueDay: 20,
    contractDeposit: { date: "2025-10-08", amount: 150000 },
    contractExpiry: "2026-10-07",
    realEstateAgency: "직거래",
    depositTotal: 400000,
    depositDeductions: [{ date: "2026-02-22", amount: 20000, reason: "공과금정산" }],
    rentPayments: [
      { month: "2025-10", paidAt: "2025-10-19", amount: 630000, paymentMethod: "현금", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-20", amount: 630000, paymentMethod: "현금", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-19", amount: 630000, paymentMethod: "현금", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-20", amount: 630000, paymentMethod: "현금", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-19", amount: 630000, paymentMethod: "현금", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 630000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-10", amount: 8000 },
      { month: "2025-11", amount: 13100 },
      { month: "2025-12", amount: 19500 },
      { month: "2026-01", amount: 22600 },
      { month: "2026-02", amount: 17300 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "605": {
    roomId: "605",
    purpose: "세무·회계·계리",
    utilityIncludedRent: 70,
    actualMonthlyRent: 68,
    paymentDueDay: 1,
    contractDeposit: { date: "2025-06-30", amount: 200000 },
    contractExpiry: "2026-06-29",
    realEstateAgency: "부동산 B",
    depositTotal: 600000,
    depositDeductions: [{ date: "2025-12-03", amount: 40000, reason: "시설손상" }],
    rentPayments: [
      { month: "2025-07", paidAt: "2025-07-01", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-08", paidAt: "2025-08-01", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-01", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-01", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-01", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-12", paidAt: null, amount: 680000, paymentMethod: null, status: "overdue" },
      { month: "2026-01", paidAt: "2026-01-02", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-01", amount: 680000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 680000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-07", amount: 4000 },
      { month: "2025-08", amount: 3500 },
      { month: "2025-09", amount: 6600 },
      { month: "2025-10", amount: 12000 },
      { month: "2025-11", amount: 18700 },
      { month: "2025-12", amount: 25500 },
      { month: "2026-01", amount: 28800 },
      { month: "2026-02", amount: 23000 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
  "607": {
    roomId: "607",
    purpose: "직장",
    utilityIncludedRent: 73,
    actualMonthlyRent: 70,
    paymentDueDay: 15,
    contractDeposit: { date: "2025-03-15", amount: 300000 },
    contractExpiry: "2026-03-14",
    realEstateAgency: "부동산 A",
    depositTotal: 700000,
    depositDeductions: [
      { date: "2025-09-18", amount: 30000, reason: "차임" },
      { date: "2026-01-17", amount: 55000, reason: "타일" },
    ],
    rentPayments: [
      { month: "2025-03", paidAt: "2025-03-14", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-04", paidAt: "2025-04-15", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-05", paidAt: "2025-05-14", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-06", paidAt: "2025-06-15", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-07", paidAt: "2025-07-14", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-08", paidAt: "2025-08-15", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-09", paidAt: "2025-09-13", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-10", paidAt: "2025-10-15", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-11", paidAt: "2025-11-14", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2025-12", paidAt: "2025-12-15", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-01", paidAt: "2026-01-15", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-02", paidAt: "2026-02-14", amount: 700000, paymentMethod: "이체(자진발급)", status: "paid" },
      { month: "2026-03", paidAt: null, amount: 700000, paymentMethod: null, status: "upcoming" },
    ],
    gasBills: [
      { month: "2025-03", amount: 17800 },
      { month: "2025-04", amount: 9900 },
      { month: "2025-05", amount: 4600 },
      { month: "2025-06", amount: 3200 },
      { month: "2025-07", amount: 2900 },
      { month: "2025-08", amount: 3600 },
      { month: "2025-09", amount: 7300 },
      { month: "2025-10", amount: 13600 },
      { month: "2025-11", amount: 20500 },
      { month: "2025-12", amount: 27400 },
      { month: "2026-01", amount: 30600 },
      { month: "2026-02", amount: 24700 },
    ],
    cashSuccessions: [],
    depositReturn: { returned: false, returnedAt: null },
  },
};
