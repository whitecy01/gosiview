import Image from "next/image";
import { Room } from "./shared";

interface FloorProps {
  rooms: Room[];
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
}

// 실제 도면 이미지 기준 각 방의 위치 (%, 이미지 좌상단 기준)
const ROOM_OVERLAYS: { id: string; top: string; left: string; width: string; height: string }[] = [
  // 위 줄: 307, 308, 309, 310, 311, 312
  { id: "307", top: "35%", left: "22.5%", width: "9%",   height: "19%" },
  { id: "308", top: "35%", left: "32%",   width: "9%",   height: "19%" },
  { id: "309", top: "35%", left: "41.8%", width: "9%",   height: "19%" },
  { id: "310", top: "35%", left: "51.5%", width: "9%",   height: "19%" },
  { id: "311", top: "35%", left: "62%",   width: "10%",  height: "19%" },
  { id: "312", top: "35%", left: "76%",   width: "14%",  height: "15%" },
  { id: "313", top: "51%", left: "76%",   width: "14%",  height: "14%" },
  // 아래 줄: 306, 305, 304, 303, 302, 301
  { id: "306", top: "61%", left: "15%",   width: "8%",   height: "18.5%" },
  { id: "305", top: "61%", left: "24%",   width: "8%",   height: "18.5%" },
  { id: "304", top: "61%", left: "33%",   width: "8%",   height: "18.5%" },
  { id: "303", top: "61%", left: "42%",   width: "9%",   height: "18.5%" },
  { id: "302", top: "61%", left: "52%",   width: "8%",   height: "18.5%" },
  { id: "301", top: "61%", left: "60.5%", width: "11.5%", height: "18.5%" },
];

function statusColor(status: Room["status"], selected: boolean) {
  if (status === "occupied")    return selected ? "bg-indigo-500/60 border-indigo-300 border-2"   : "bg-indigo-500/20 border-indigo-400/60 hover:bg-indigo-500/35";
  if (status === "vacant")      return selected ? "bg-emerald-500/60 border-emerald-300 border-2" : "bg-emerald-500/20 border-emerald-400/60 hover:bg-emerald-500/35";
  if (status === "contract") return selected ? "bg-rose-500/60 border-rose-300 border-2"       : "bg-rose-500/20 border-rose-400/60 hover:bg-rose-500/35";
  return "";
}

export default function Floor3({ rooms, selectedRoom, onSelectRoom }: FloorProps) {
  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-[#2A2A2A]">
      <Image
        src="/floor-plans/3f-plan.png"
        alt="3층 도면"
        width={1600}
        height={914}
        className="w-full h-auto block"
        priority
      />

      {ROOM_OVERLAYS.map(({ id, top, left, width, height }) => {
        const room = rooms.find((r) => r.id === id);
        if (!room) return null;
        const isSelected = selectedRoom?.id === id;

        return (
          <button
            key={id}
            onClick={() => onSelectRoom(room)}
            style={{ top, left, width, height }}
            className={`absolute rounded border cursor-pointer transition-all duration-150 ${statusColor(room.status, isSelected)}`}
          />
        );
      })}
    </div>
  );
}
