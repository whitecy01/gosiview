import { Room, RoomCard } from "./shared";

interface FloorProps {
  rooms: Room[];
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
}

export default function Floor6({ rooms, selectedRoom, onSelectRoom }: FloorProps) {
  return (
    <div className="relative w-full aspect-[40/9] bg-[#1A1A1A] rounded-lg p-2 border border-[#2A2A2A] flex flex-col justify-end overflow-hidden gap-1">
      <div className="flex w-full h-[85%] gap-2 relative mt-4">

        {/* Left Block: Rooms 607 to 601 */}
        <div className="flex-[3] flex gap-1 h-full">
          {/* Room 607 & 606 (Wider pair on left) */}
          <div className="flex-[1.5] flex gap-1">
            {[607, 606].map(num => {
              const room = rooms.find(r => r.id === num.toString());
              return room ? (
                <RoomCard
                  key={room.id}
                  room={room}
                  isSelected={selectedRoom?.id === room.id}
                  onClick={() => onSelectRoom(room)}
                  className="flex-1"
                />
              ) : null;
            })}
          </div>

          {/* Rooms 605 down to 601 */}
          <div className="flex-[2] flex gap-1">
            {[605, 604, 603, 602, 601].map(num => {
              const room = rooms.find(r => r.id === num.toString());
              return room ? (
                <RoomCard
                  key={room.id}
                  room={room}
                  isSelected={selectedRoom?.id === room.id}
                  onClick={() => onSelectRoom(room)}
                  className="flex-[1]"
                />
              ) : null;
            })}
          </div>
        </div>

        {/* Right Block: Boiler & Stairs */}
        <div className="flex-1 flex flex-col text-xs text-gray-400 gap-1 h-full pr-2">

          {/* Top Utility (Boiler Room 3 Daes) */}
          <div className="h-[40%] bg-[#222] border border-[#333] rounded flex items-center justify-center p-2 text-center break-keep w-[83%] ml-auto">
            <span className="text-[10px]">6F / 5F 보일러 / 3대</span>
          </div>

          {/* Stairs / Entrance below it */}
          <div className="h-[60%] bg-[#222] border border-[#333] rounded flex items-center justify-between text-xs text-gray-500 relative overflow-hidden px-2 mt-auto w-full ml-auto">
            <span className="z-10 bg-[#222] px-1 text-[10px] whitespace-nowrap">계단실</span>
            {/* Vertical Stairs */}
            <div className="absolute inset-y-0 right-4 left-10 flex justify-between opacity-20">
              <div className="w-px h-full bg-white"></div>
              <div className="w-px h-full bg-white"></div>
              <div className="w-px h-full bg-white"></div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
