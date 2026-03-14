import { Room, RoomCard } from "./shared";

interface FloorProps {
  rooms: Room[];
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
}

export default function Floor2({ rooms, selectedRoom, onSelectRoom }: FloorProps) {
  return (
    <div className="relative w-full aspect-[25/9] bg-[#1A1A1A] rounded-lg p-4 border border-[#2A2A2A] flex justify-between overflow-hidden gap-4">
      
      {/* Left Block (Boiler + 201~211) */}
      <div className="flex-1 flex flex-col justify-between">
        
        {/* Top Row - Boiler & 207~211 */}
        <div className="flex h-[40%] gap-2 w-full">
          {/* Boiler Room */}
          <div className="w-[12%] bg-[#222] border border-[#333] rounded flex items-center justify-center text-[11px] text-gray-500 text-center break-words">
            보일러실<br/>(2F)
          </div>
          
          {/* Rooms 207 to 211 */}
          {[207, 208, 209, 210, 211].map(num => {
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

        {/* Bottom Row - Rooms 206 to 201 */}
        <div className="flex h-[40%] gap-2 w-full pr-[12%]">
          {[206, 205, 204, 203, 202, 201].map(num => {
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

      {/* Right Block (212, 213, Stairs) */}
      <div className="w-[18%] flex flex-col gap-2">
        
        {/* Room 212 */}
        <div className="flex-[1.2] flex">
          {(() => {
            const room212 = rooms.find(r => r.id === "212");
            return room212 ? (
              <RoomCard 
                room={room212} 
                isSelected={selectedRoom?.id === room212.id}
                onClick={() => onSelectRoom(room212)} 
              />
            ) : null;
          })()}
        </div>

        {/* Room 213 */}
        <div className="flex-1 flex">
          {(() => {
            const room213 = rooms.find(r => r.id === "213");
            return room213 ? (
              <RoomCard 
                room={room213} 
                isSelected={selectedRoom?.id === room213.id}
                onClick={() => onSelectRoom(room213)} 
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
