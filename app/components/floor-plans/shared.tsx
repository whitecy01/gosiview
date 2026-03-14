export type Room = {
  id: string;
  name: string;
  status: "occupied" | "vacant" | "maintenance";
  resident: string | null;
  moveInDate: string | null;
  moveOutDate: string | null;
  rentStatus: string;
};

export const generateRoomsForFloor = (floor: number): Room[] => {
  let roomCount = 24;
  if (floor === 1) roomCount = 5;
  if (floor === 2 || floor === 3) roomCount = 13;
  if (floor === 4) roomCount = 8;
  if (floor === 5 || floor === 6) roomCount = 7;
  
  return Array.from({ length: roomCount }).map((_, i) => {
    const statusNumber = Math.random();
    let status: "occupied" | "vacant" | "maintenance" = "occupied";
    if (statusNumber > 0.8) status = "vacant";
    else if (statusNumber > 0.95) status = "maintenance";
    
    // Add padded room number (e.g. 01 to 24)
    const roomNum = (i + 1).toString().padStart(2, '0');

    return {
      id: `${floor}${roomNum}`,
      name: `${floor}층 ${roomNum}호`,
      status,
      resident: status === "occupied" ? `입실자 ${roomNum}` : null,
      moveInDate: status === "occupied" ? "2023-11-01" : null,
      moveOutDate: status === "occupied" ? "2025-10-31" : null,
      rentStatus: Math.random() > 0.8 ? "overdue" : "paid",
    };
  });
};

export function RoomCard({ room, isSelected, onClick, className = "flex-1" }: { room: Room, isSelected: boolean, onClick: () => void, className?: string }) {
  let bgColor = "bg-[#1A1A1A]";
  let borderColor = "border-[#2A2A2A]";
  let textColor = "text-gray-400";
  let statusBadge = "";

  if (room.status === "occupied") {
    bgColor = "bg-indigo-500/10";
    borderColor = "border-indigo-500/30";
    textColor = "text-indigo-200";
  } else if (room.status === "vacant") {
    bgColor = "bg-emerald-500/10";
    borderColor = "border-emerald-500/30";
    textColor = "text-emerald-200";
  } else {
    bgColor = "bg-rose-500/5";
    borderColor = "border-rose-500/20";
    textColor = "text-rose-300";
  }

  if (isSelected) {
    borderColor = "border-white";
    bgColor = "bg-[#2A2A2A]";
    if (room.status === 'occupied') bgColor = "bg-indigo-500/30";
    if (room.status === 'vacant') bgColor = "bg-emerald-500/30";
  }

  return (
    <button
      onClick={onClick}
      className={`${className} rounded border overflow-hidden flex flex-col items-center justify-center relative transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${bgColor} ${borderColor} cursor-pointer group`}
    >
      <span className={`text-xs font-medium z-10 ${textColor}`}>{room.id}</span>
      {statusBadge && (
        <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${statusBadge} animate-pulse`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </button>
  );
}
