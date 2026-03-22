export type FloorNumber = 1 | 2 | 3 | 4 | 5 | 6;
export type RoomStatus = "occupied" | "vacant" | "maintenance";
export type PaymentStatus = "paid" | "upcoming" | "overdue";
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
