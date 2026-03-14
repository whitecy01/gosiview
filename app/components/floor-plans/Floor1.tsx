import { Room, RoomCard } from "./shared";

interface FloorProps {
  rooms: Room[];
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
}

export default function Floor1({ rooms, selectedRoom, onSelectRoom }: FloorProps) {
  return (
    <div className="relative w-full aspect-[21/9] bg-[#1A1A1A] rounded-lg p-4 border border-[#2A2A2A] flex flex-col justify-between overflow-hidden">
      {/* Top Row - Facilities */}
      <div className="flex h-[35%] gap-2 w-full">
        <div className="w-[8%] bg-[#222] border border-[#333] rounded flex items-center justify-center text-xs text-gray-500 text-center break-words">보일러실</div>
        <div className="flex-1 bg-[#222] border border-[#333] rounded flex items-center justify-center text-sm text-gray-500 relative overflow-hidden">
          <span className="z-10 bg-[#222] px-2">공용 공간 (식당 / 휴게실)</span>
          {/* Tables visual */}
          <div className="absolute inset-0 flex items-center justify-around opacity-10">
            <div className="w-16 h-8 border-2 border-white rounded"></div>
            <div className="w-16 h-8 border-2 border-white rounded"></div>
            <div className="w-16 h-8 border-2 border-white rounded"></div>
          </div>
        </div>
        <div className="w-[20%] flex flex-col gap-2">
          <div className="flex-1 bg-[#222] border border-[#333] rounded flex items-center justify-center text-xs text-gray-500">주방 (Kitchen)</div>
          <div className="flex-1 bg-[#222] border border-[#333] rounded flex items-center justify-center text-[10px] text-gray-600">세탁실 (Laundry)</div>
        </div>
      </div>
      
      {/* Corridor */}
      <div className="flex h-[15%] w-full items-center justify-center pr-[12%]">
        <div className="w-full h-1 bg-[#333] rounded-full opacity-30"></div>
      </div>
      
      {/* Bottom Row - Rooms & Office */}
      <div className="flex h-[40%] gap-2 w-full pl-8">
        {/* Rooms 105 to 101 */}
        {[105, 104, 103, 102, 101].map(num => {
          const room = rooms.find(r => r.id === num.toString());
          return room ? (
            <RoomCard 
              key={room.id}
              room={room} 
              isSelected={selectedRoom?.id === room.id}
              onClick={() => onSelectRoom(room)} 
              className="w-[12%]"
            />
          ) : null;
        })}
        
        {/* Office */}
        <div className="w-[15%] bg-[#222] border border-indigo-500/30 rounded flex items-center justify-center text-[10px] text-indigo-400 font-medium whitespace-nowrap px-1 break-keep">관리실(OFFICE)</div>
        
        {/* Stairs/Entrance */}
        <div className="flex-[1.5] bg-[#222] border border-[#333] rounded flex flex-col items-center justify-between text-xs text-gray-500 relative overflow-hidden pr-2">
          {/* Entrance Door */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-8 border-y border-l border-white rounded-l opacity-40"></div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] tracking-widest rotate-90 opacity-60">입구(ENT)</div>

          <span className="z-10 bg-[#222] px-1 text-[10px] mt-1 whitespace-nowrap">계단실</span>
          
          {/* Vertical Stairs */}
          <div className="absolute inset-y-0 left-4 right-8 flex justify-between opacity-20">
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
