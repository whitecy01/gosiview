export type FloorNumber = 1 | 2 | 3 | 4 | 5 | 6;
export type RoomStatus = "occupied" | "vacant" | "maintenance";
export type PaymentStatus = "paid" | "upcoming" | "overdue";

export type Room = {
  id: string;
  name: string;
  floor: FloorNumber;
  status: RoomStatus;
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

function getMonthlyRent(roomNumber: number) {
  const amount = 390000 + (roomNumber % 5) * 20000;
  return `₩${amount.toLocaleString("ko-KR")}`;
}

function getPaymentStatus(roomNumber: number): PaymentStatus {
  if (roomNumber % 11 === 0) return "overdue";
  if (roomNumber % 7 === 0) return "upcoming";
  return "paid";
}

function getPaidMonth(paymentStatus: PaymentStatus) {
  return paymentStatus === "upcoming" ? "2026년 4월" : "2026년 3월";
}

function getPaidAt(paymentStatus: PaymentStatus, roomNumber: number) {
  if (paymentStatus === "overdue") return "미납";
  if (paymentStatus === "upcoming") return `예정: 2026-03-${String((roomNumber % 9) + 20).padStart(2, "0")}`;
  return `2026-03-${String((roomNumber % 9) + 1).padStart(2, "0")}`;
}

function buildRoom(id: string, occupiedIndex: number): Room {
  const floor = Number(id[0]) as FloorNumber;
  const roomNumber = Number(id);
  const status = getStatus(id);

  if (status !== "occupied") {
    return {
      id,
      name: `${floor}층 ${id.slice(1)}호`,
      floor,
      status,
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
    resident: getResidentName(occupiedIndex),
    gender: occupiedIndex % 2 === 0 ? '남' : '여',
    age: 20 + ((roomNumber * 3 + occupiedIndex * 7) % 16),
    moveInDate: `2025-${moveInMonth}-${moveInDay}`,
    moveOutDate: `2026-${moveOutMonth}-${moveOutDay === "00" ? "01" : moveOutDay}`,
    monthlyRent: getMonthlyRent(roomNumber),
    paidMonth: getPaidMonth(paymentStatus),
    paidAt: getPaidAt(paymentStatus, roomNumber),
    paymentStatus,
    rentStatus: paymentStatus === "overdue" ? "overdue" : "paid",
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
    occupiedRooms,
    vacantRooms,
    maintenanceRooms,
    occupancyRate: Math.round((occupiedRooms / ALL_ROOMS.length) * 100),
  };
}
