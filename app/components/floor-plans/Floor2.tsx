import Image from "next/image";
import { Room } from "./shared";

interface FloorProps {
  rooms: Room[];
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
}

// 실제 도면 이미지 기준 각 방의 위치 (%, 이미지 좌상단 기준)
const ROOM_OVERLAYS: { id: string; top: string; left: string; width: string; height: string }[] = [
  // 위 줄: 207, 208, 209, 210, 211, 212
  { id: "207", top: "35%", left: "22.5%",  width: "9%", height: "19%" },
  { id: "208", top: "35%", left: "32%",  width: "9%", height: "19%" },
  { id: "209", top: "35%", left: "41.8%",  width: "9%", height: "19%" },
  { id: "210", top: "35%", left: "51.5%",  width: "9%", height: "19%" },
  { id: "211", top: "35%", left: "62%",  width: "10%", height: "19%" },

  { id: "212", top: "35%", left: "76%",  width: "14%", height: "15%" },
  { id: "213", top: "51%", left: "76%",  width: "14%", height: "14%" },

  // 아래 줄: 206, 205, 204, 203, 202, 201, 213
  { id: "206", top: "61%", left: "15%",  width: "8%", height: "18.5%" },
  { id: "205", top: "61%", left: "24%",  width: "8%", height: "18.5%" },
  { id: "204", top: "61%", left: "34%",  width: "8%", height: "18.5%" },
  { id: "203", top: "61%", left: "42%",  width: "9%", height: "18.5%" },
  { id: "202", top: "61%", left: "52%",  width: "8%", height: "18.5%" },
  { id: "201", top: "61%", left: "60.5%",  width: "11.5%", height: "18.5%" },
];

function statusColor(status: Room["status"], selected: boolean) {
  if (status === "occupied")    return selected ? "bg-indigo-500/60 border-indigo-300 border-2"   : "bg-indigo-500/20 border-indigo-400/60 hover:bg-indigo-500/35";
  if (status === "vacant")      return selected ? "bg-emerald-500/60 border-emerald-300 border-2" : "bg-emerald-500/20 border-emerald-400/60 hover:bg-emerald-500/35";
  if (status === "contract") return selected ? "bg-rose-500/60 border-rose-300 border-2"       : "bg-rose-500/20 border-rose-400/60 hover:bg-rose-500/35";
  return "";
}


export default function Floor2({ rooms, selectedRoom, onSelectRoom }: FloorProps) {
  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-[#2A2A2A]">
      {/* 실제 도면 이미지 */}
      <Image
        src="/floor-plans/2f-plan.png"
        alt="2층 도면"
        width={1600}
        height={914}
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
            className={`absolute rounded border cursor-pointer transition-all duration-150 ${statusColor(room.status, isSelected)}`}
          />
        );
      })}
    </div>
  );
}
