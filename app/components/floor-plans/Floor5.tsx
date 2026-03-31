import Image from "next/image";
import { Room } from "./shared";

interface FloorProps {
  rooms: Room[];
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
}

// 실제 도면 이미지 기준 각 방의 위치 (%, 이미지 좌상단 기준)
const ROOM_OVERLAYS: { id: string; top: string; left: string; width: string; height: string }[] = [
  { id: "506", top: "52%", left: "12.8%",   width: "9.5%", height: "28%" },
  { id: "505", top: "60%", left: "23.5%",  width: "8%", height: "20%" },
  { id: "504", top: "60%", left: "33%",  width: "8%", height: "20%" },
  { id: "503", top: "60%", left: "42%",  width: "8%", height: "20%" },
  { id: "502", top: "60%", left: "51%",  width: "8%", height: "20%" },
  { id: "501", top: "60%", left: "60%",  width: "11%", height: "20%" },
  { id: "507", top: "52%", left: "76%",  width: "13.5%", height: "15%" },
];

function statusColor(status: Room["status"], selected: boolean) {
  if (status === "occupied")    return selected ? "bg-indigo-500/60 border-indigo-300 border-2"   : "bg-indigo-500/20 border-indigo-400/60 hover:bg-indigo-500/35";
  if (status === "vacant")      return selected ? "bg-emerald-500/60 border-emerald-300 border-2" : "bg-emerald-500/20 border-emerald-400/60 hover:bg-emerald-500/35";
  if (status === "contract") return selected ? "bg-rose-500/60 border-rose-300 border-2"       : "bg-rose-500/20 border-rose-400/60 hover:bg-rose-500/35";
  return "";
}

export default function Floor5({ rooms, selectedRoom, onSelectRoom }: FloorProps) {
  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-[#2A2A2A]">
      <Image
        src="/floor-plans/5f-plan.png"
        alt="5층 도면"
        width={1600}
        height={600}
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
