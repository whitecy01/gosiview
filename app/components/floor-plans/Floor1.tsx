import Image from "next/image";
import { Room } from "./shared";

interface FloorProps {
  rooms: Room[];
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
}

// 실제 도면 이미지 기준 각 방의 위치 (%, 이미지 좌상단 기준)
const ROOM_OVERLAYS: { id: string; top: string; left: string; width: string; height: string }[] = [
  { id: "105", top: "54%", left: "13.5%",  width: "9%", height: "20%" },
  { id: "104", top: "54%", left: "23%",   width: "9%", height: "20%" },
  { id: "103", top: "54%", left: "32%", width: "9%", height: "20%" },
  { id: "102", top: "54%", left: "41.7%",   width: "9%", height: "20%" },
  { id: "101", top: "54%", left: "51.3%", width: "9%", height: "20%" },
];

function statusColor(status: Room["status"], selected: boolean) {
  if (status === "occupied")    return selected ? "bg-indigo-500/60 border-indigo-300 border-2"   : "bg-indigo-500/20 border-indigo-400/60 hover:bg-indigo-500/35";
  if (status === "vacant")      return selected ? "bg-emerald-500/60 border-emerald-300 border-2" : "bg-emerald-500/20 border-emerald-400/60 hover:bg-emerald-500/35";
  if (status === "contract") return selected ? "bg-rose-500/60 border-rose-300 border-2"       : "bg-rose-500/20 border-rose-400/60 hover:bg-rose-500/35";
  return "";
}


export default function Floor1({ rooms, selectedRoom, onSelectRoom }: FloorProps) {
  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-[#2A2A2A]">
      {/* 실제 도면 이미지 */}
      <Image
        src="/floor-plans/1f-plan.png"
        alt="1층 도면"
        width={1600}
        height={600}
        className="w-full h-auto block"
        priority
      />

      {/* 방 오버레이 */}
      {ROOM_OVERLAYS.map(({ id, top, left, width, height }) => {
        const room = rooms.find((r) => r.id === id);
        if (!room) return null;
        const isSelected = selectedRoom?.id === id;

        return (
          <button
            key={id}
            onClick={() => onSelectRoom(room)}
            style={{ top, left, width, height }}
            className={`absolute rounded border cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-0.5 ${statusColor(room.status, isSelected)}`}
          >
          </button>
        );
      })}
    </div>
  );
}
