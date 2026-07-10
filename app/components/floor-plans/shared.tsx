import type { Room } from "../../lib/mock-data";
export type { Room } from "../../lib/mock-data";

/** "이름 (별칭)" 형태를 ["이름", "(별칭)"]으로 분리합니다. 괄호가 없으면 두 번째 값은 null. */
export function splitResidentName(name: string): [string, string | null] {
  const m = name.match(/^(.*?)\s*(\(.*\))\s*$/);
  return m ? [m[1], m[2]] : [name, null];
}

/** 좁은 도면 오버레이에 들어가도록 방 타입을 축약합니다. */
export function shortRoomType(roomType: string) {
  return roomType
    .replace(/^Standard\s+/, "")
    .replace(/\s+\+$/, "+")
    .replace(/\(넓은 사이즈\)/, "(넓)");
}

/**
 * 도면 오버레이 위에 입실자 이름과 방 타입을 표시합니다.
 * className으로 위치를 조정합니다 (기본: 가운데).
 *   세로 — justify-start(위) / justify-end(아래) / translate-y-*
 *   가로 — items-start(왼쪽) / items-end(오른쪽) / translate-x-*
 * inline=true면 이름·별칭·방타입을 한 줄에 가로로 나열합니다 (가로로 넓은 방용).
 */
export function RoomOverlayLabel({
  room, className = "", inline = false,
}: { room: Room; className?: string; inline?: boolean }) {
  const [name, alias] = room.resident ? splitResidentName(room.resident) : ["공실", null];

  if (inline) {
    return (
      <span className={`pointer-events-none absolute inset-0 flex items-center justify-center px-0.5 leading-tight ${className}`}>
        <span className="flex max-w-full items-center gap-1 whitespace-nowrap rounded bg-black/80 px-1.5 py-0.5">
          <span className="text-[13px] font-bold text-white">{name}</span>
          {alias && <span className="text-[12px] font-semibold text-white/80">{alias}</span>}
          <span className="text-[12px] font-medium text-white/75">{shortRoomType(room.roomType)}</span>
        </span>
      </span>
    );
  }

  return (
    <span className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-0.5 text-center leading-tight ${className}`}>
      <span className="flex max-w-full flex-col items-center rounded bg-black/80 px-1.5 py-0.5">
        <span className="w-full break-all text-[13px] font-bold leading-tight text-white">
          {name}
        </span>
        {alias && (
          <span className="w-full break-all text-[12px] font-semibold leading-tight text-white/80">
            {alias}
          </span>
        )}
        <span className="w-full break-all text-[12px] font-medium leading-tight text-white/75">
          {shortRoomType(room.roomType)}
        </span>
      </span>
    </span>
  );
}

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
