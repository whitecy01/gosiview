import { Room, RoomCard } from "./shared";

interface FloorProps {
  rooms: Room[];
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
}

export default function Floor5({ rooms, selectedRoom, onSelectRoom }: FloorProps) {
  return (
    <div className="relative w-full aspect-[40/9] bg-[#1A1A1A] rounded-lg p-3 border border-[#2A2A2A] flex justify-between overflow-hidden gap-1">

      {/* Main Container */}
      <div className="flex w-full h-full">

        {/* Leftmost Block (Room 506) */}
        <div className="w-[12%] h-full flex pt-1 pb-1 pr-1">
          {(() => {
            const room506 = rooms.find(r => r.id === "506");
            return room506 ? (
              <RoomCard
                key={room506.id}
                room={room506}
                isSelected={selectedRoom?.id === room506.id}
                onClick={() => onSelectRoom(room506)}
                className="h-full w-full"
              />
            ) : null;
          })()}
        </div>

        {/* Center Block (Corridor + 505~501 + Utilities) */}
        <div className="flex-[4] flex flex-col justify-between h-full px-1">

          {/* Top Corridor Area (Empty as requested) */}
          <div className="flex h-[35%] w-full items-end pb-2">
            {/* Corridor line removed */}
          </div>

          {/* Bottom Row - Rooms 505 to 501 */}
          <div className="flex h-[60%] gap-1 w-full pb-1">

            {/* Rooms 505 to 501 */}
            <div className="flex-1 flex gap-1">
              {[505, 504, 503, 502, 501].map(num => {
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

          </div>
        </div>

        {/* Rightmost Block (507 Above + Stairs Below) */}
        <div className="w-[20%] flex flex-col gap-1 pb-1 pt-1 pl-1">

          {/* Room 507 (Top half) */}
          <div className="h-[50%] w-[80%] ml-auto flex">
            {(() => {
              const room507 = rooms.find(r => r.id === "507");
              return room507 ? (
                <RoomCard
                  key={room507.id}
                  room={room507}
                  isSelected={selectedRoom?.id === room507.id}
                  onClick={() => onSelectRoom(room507)}
                  className="h-full w-full"
                />
              ) : null;
            })()}
          </div>

          {/* Stairs (Bottom half) - positioned strictly below 507 */}
          <div className="flex-1 bg-[#222] border border-[#333] rounded flex items-center justify-between text-xs text-gray-500 relative overflow-hidden px-2 mb-1">
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
