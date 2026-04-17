import type { Room } from "../../lib/mock-data";
export type { Room } from "../../lib/mock-data";

export function RoomCard({ room, isSelected, onClick, className = "flex-1" }: { room: Room, isSelected: boolean, onClick: () => void, className?: string }) {
  let bgColor = "bg-[#1A1A1A]";
  let borderColor = "border-[#2A2A2A]";
  let textColor = "text-gray-400";

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
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </button>
  );
}
