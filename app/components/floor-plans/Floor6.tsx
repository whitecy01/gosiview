import Image from "next/image";
import { Room } from "./shared";

interface FloorProps {
  rooms: Room[];
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
}

// 실제 도면 이미지 기준 각 방의 위치 (%, 이미지 좌상단 기준)
const ROOM_OVERLAYS: { id: string; top: string; left: string; width: string; height: string }[] = [
  { id: "607", top: "56.5%", left: "12%",   width: "10%", height: "21%" },
  { id: "606", top: "56.5%", left: "22.5%",  width: "9%", height: "21%" },
  { id: "605", top: "56.5%", left: "32%",  width: "6%", height: "21%" },
  { id: "604", top: "56.5%", left: "38.6%",  width: "6%", height: "21%" },
  { id: "603", top: "56.5%", left: "45.2%",  width: "6%", height: "21%" },
  { id: "602", top: "56.5%", left: "51.7%",  width: "6%", height: "21%" },
  { id: "601", top: "56.5%", left: "58.5%",  width: "6%", height: "21%" },
];

function statusColor(status: Room["status"], selected: boolean) {
  if (status === "occupied")    return selected ? "bg-indigo-500/60 border-indigo-300 border-2"   : "bg-indigo-500/20 border-indigo-400/60 hover:bg-indigo-500/35";
  if (status === "vacant")      return selected ? "bg-emerald-500/60 border-emerald-300 border-2" : "bg-emerald-500/20 border-emerald-400/60 hover:bg-emerald-500/35";
  if (status === "contract") return selected ? "bg-rose-500/60 border-rose-300 border-2"       : "bg-rose-500/20 border-rose-400/60 hover:bg-rose-500/35";
  return "";
}

export default function Floor6({ rooms, selectedRoom, onSelectRoom }: FloorProps) {
  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-[#2A2A2A]">
      <Image
        src="/floor-plans/6f-plan.png"
        alt="6층 도면"
        width={1600}
        height={500}
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
