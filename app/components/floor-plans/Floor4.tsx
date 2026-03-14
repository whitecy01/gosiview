import { Room, RoomCard } from "./shared";

interface FloorProps {
  rooms: Room[];
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
}

export default function Floor4({ rooms, selectedRoom, onSelectRoom }: FloorProps) {
  return (
    <div className="relative w-full aspect-[32/9] bg-[#1A1A1A] rounded-lg p-4 border border-[#2A2A2A] flex justify-between overflow-hidden gap-4">
      
      {/* Left Block (Boiler + 401~407) */}
      <div className="flex-[4] flex flex-col justify-between">
        
        {/* Top Row - Boiler & 405~407 */}
        <div className="flex h-[40%] gap-2 w-full">
          {/* Rooms 405 to 407 */}
          <div className="flex-[3] flex gap-2">
            {[405, 406, 407].map(num => {
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

          {/* Boiler Room */}
          <div className="w-[10%] bg-[#222] border border-[#333] rounded flex items-center justify-center text-[11px] text-gray-500 text-center break-words">
            보일러실<br/>(4F)
          </div>

          {/* Kitchen Area */}
          <div className="flex-[1.5] bg-[#222] border border-[#333] rounded flex items-center justify-center text-[11px] text-gray-500 text-center break-words relative overflow-hidden">
            <span className="z-10 bg-[#222] px-1">주방</span>
            <div className="absolute inset-0 flex flex-col justify-around opacity-10 p-2">
               <div className="w-full h-2 border-2 border-white rounded"></div>
               <div className="w-full h-2 border-2 border-white rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Corridor */}
        <div className="flex h-[20%] w-full items-center">
          <div className="w-full h-1 bg-[#333] rounded-full opacity-30 mt-1"></div>
        </div>

        {/* Bottom Row - Rooms 404 to 401 */}
        <div className="flex h-[40%] gap-2 w-full pr-[8%]">
          {[404, 403, 402, 401].map(num => {
            const room = rooms.find(r => r.id === num.toString());
            return room ? (
              <RoomCard 
                key={room.id}
                room={room} 
                isSelected={selectedRoom?.id === room.id}
                onClick={() => onSelectRoom(room)} 
                className={num === 402 ? "flex-[1.3]" : "flex-1"}
              />
            ) : null;
          })}
        </div>
      </div>

      {/* Right Block (408, Stairs) */}
      <div className="flex-1 flex flex-col gap-2">
        
        {/* Room 408 (Top) */}
        <div className="flex-[1.2] flex">
          {(() => {
            const room408 = rooms.find(r => r.id === "408");
            return room408 ? (
              <RoomCard 
                room={room408} 
                isSelected={selectedRoom?.id === room408.id}
                onClick={() => onSelectRoom(room408)} 
              />
            ) : null;
          })()}
        </div>

        {/* Stairs/Entrance (Bottom) */}
        <div className="flex-1 bg-[#222] border border-[#333] rounded flex items-center justify-between text-xs text-gray-500 relative overflow-hidden px-2 mt-auto h-[40%]">
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
