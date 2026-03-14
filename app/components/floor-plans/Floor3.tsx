import { Room, RoomCard } from "./shared";

interface FloorProps {
  rooms: Room[];
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
}

export default function Floor3({ rooms, selectedRoom, onSelectRoom }: FloorProps) {
  return (
    <div className="relative w-full aspect-[25/9] bg-[#1A1A1A] rounded-lg p-4 border border-[#2A2A2A] flex justify-between overflow-hidden gap-4">
      
      {/* Left Block (Boiler + 301~311) */}
      <div className="flex-1 flex flex-col justify-between">
        
        {/* Top Row - Boiler & 307~311 */}
        <div className="flex h-[40%] gap-2 w-full">
          {/* Boiler Room */}
          <div className="w-[12%] bg-[#222] border border-[#333] rounded flex items-center justify-center text-[11px] text-gray-500 text-center break-words">
            보일러실<br/>(3F)
          </div>
          
          {/* Rooms 307 to 311 */}
          {[307, 308, 309, 310, 311].map(num => {
            const room = rooms.find(r => r.id === num.toString());
            return room ? (
              <RoomCard 
                key={room.id}
                room={room} 
                isSelected={selectedRoom?.id === room.id}
                onClick={() => onSelectRoom(room)} 
              />
            ) : null;
          })}
        </div>
        
        {/* Corridor */}
        <div className="flex h-[20%] w-full items-center">
          <div className="w-full h-1 bg-[#333] rounded-full opacity-30 mt-1"></div>
        </div>

        {/* Bottom Row - Rooms 306 to 301 */}
        <div className="flex h-[40%] gap-2 w-full pr-[12%]">
          {[306, 305, 304, 303, 302, 301].map(num => {
            const room = rooms.find(r => r.id === num.toString());
            return room ? (
              <RoomCard 
                key={room.id}
                room={room} 
                isSelected={selectedRoom?.id === room.id}
                onClick={() => onSelectRoom(room)} 
              />
            ) : null;
          })}
        </div>

      </div>

      {/* Right Block (312, 313, Stairs) */}
      <div className="w-[18%] flex flex-col gap-2">
        
        {/* Room 312 */}
        <div className="flex-[1.2] flex">
          {(() => {
            const room312 = rooms.find(r => r.id === "312");
            return room312 ? (
              <RoomCard 
                room={room312} 
                isSelected={selectedRoom?.id === room312.id}
                onClick={() => onSelectRoom(room312)} 
              />
            ) : null;
          })()}
        </div>

        {/* Room 313 */}
        <div className="flex-1 flex">
          {(() => {
            const room313 = rooms.find(r => r.id === "313");
            return room313 ? (
              <RoomCard 
                room={room313} 
                isSelected={selectedRoom?.id === room313.id}
                onClick={() => onSelectRoom(room313)} 
              />
            ) : null;
          })()}
        </div>

        {/* Stairs/Entrance */}
        <div className="flex-[1.2] bg-[#222] border border-[#333] rounded flex items-center justify-between text-xs text-gray-500 relative overflow-hidden px-2">
          <span className="z-10 bg-[#222] px-1 text-[10px] whitespace-nowrap">계단실</span>
          
          {/* Vertical Stairs */}
          <div className="absolute inset-y-0 right-4 left-10 flex justify-between opacity-20">
              <div className="w-px h-full bg-white"></div>
              <div className="w-px h-full bg-white"></div>
              <div className="w-px h-full bg-white"></div>
              <div className="w-px h-full bg-white"></div>
              <div className="w-px h-full bg-white"></div>
          </div>
        </div>

      </div>

    </div>
  );
}
