import Image from "next/image";
import { Room } from "./shared";

interface FloorProps {
  rooms: Room[];
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
}

// 실제 도면 이미지 기준 각 방의 위치 (%, 이미지 좌상단 기준)
const ROOM_OVERLAYS: { id: string; top: string; left: string; width: string; height: string }[] = [
  // 위 줄: 405, 406, 407, 408
  { id: "405", top: "55.5%", left: "14%",  width: "14%", height: "17%" },
  { id: "406", top: "55.5%", left: "28.5%", width: "13.5%", height: "17%" },
  { id: "407", top: "55.5%", left: "43%", width: "14%", height: "17%" },
  { id: "408", top: "55%", left: "76.5%", width: "13%", height: "26%" },
  // 아래 줄: 404, 403, 402, 401
  { id: "404", top: "81.5%", left: "14%",  width: "10%", height: "17%" },
  { id: "403", top: "81.5%", left: "24%", width: "15%", height: "17%" },
  { id: "402", top: "81.5%", left: "40%", width: "16%", height: "17%" },
  { id: "401", top: "81.5%", left: "56.5%", width: "15%",  height: "17%" },
];

function statusColor(status: Room["status"], selected: boolean) {
  if (status === "occupied")    return selected ? "bg-indigo-500/60 border-indigo-300 border-2"   : "bg-indigo-500/20 border-indigo-400/60 hover:bg-indigo-500/35";
  if (status === "vacant")      return selected ? "bg-emerald-500/60 border-emerald-300 border-2" : "bg-emerald-500/20 border-emerald-400/60 hover:bg-emerald-500/35";
  if (status === "contract") return selected ? "bg-rose-500/60 border-rose-300 border-2"       : "bg-rose-500/20 border-rose-400/60 hover:bg-rose-500/35";
  return "";
}

export default function Floor4({ rooms, selectedRoom, onSelectRoom }: FloorProps) {
  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-[#2A2A2A]">
      <Image
        src="/floor-plans/4f-plan.png"
        alt="4층 도면"
        width={1600}
        height={700}
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
