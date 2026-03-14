"use client";

import Image from "next/image";
import { useState } from "react";
import { User, Calendar, X } from "lucide-react";
import { generateRoomsForFloor, Room } from "./floor-plans/shared";
import Floor1 from "./floor-plans/Floor1";
import Floor2 from "./floor-plans/Floor2";
import Floor3 from "./floor-plans/Floor3";
import Floor4 from "./floor-plans/Floor4";
import Floor5 from "./floor-plans/Floor5";
import Floor6 from "./floor-plans/Floor6";

const ALL_MOCK_ROOMS = {
  1: generateRoomsForFloor(1),
  2: generateRoomsForFloor(2),
  3: generateRoomsForFloor(3),
  4: generateRoomsForFloor(4),
  5: generateRoomsForFloor(5),
  6: generateRoomsForFloor(6),
};

const REAL_FLOOR_PLANS: Partial<Record<1 | 2 | 3 | 4 | 5 | 6, { src: string; alt: string }>> = {
  1: {
    src: "/floor-plans/1f-plan.png",
    alt: "1층 실제 도면",
  },
  2: {
    src: "/floor-plans/2f-plan.png",
    alt: "2층 실제 도면",
  },
  3: {
    src: "/floor-plans/3f-plan.png",
    alt: "3층 실제 도면",
  },
  4: {
    src: "/floor-plans/4f-plan.png",
    alt: "4층 실제 도면",
  },
  5: {
    src: "/floor-plans/5f-plan.png",
    alt: "5층 실제 도면",
  },
  6: {
    src: "/floor-plans/6f-plan.png",
    alt: "6층 실제 도면",
  },
};
const FLOOR_PLAN_PDF_SRC = "/floor-plans/spacehorim-floorplan.pdf";

export default function FloorPlan() {
  const [currentFloor, setCurrentFloor] = useState<1|2|3|4|5|6>(1);
  const rooms = ALL_MOCK_ROOMS[currentFloor];
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isRealPlanOpen, setIsRealPlanOpen] = useState(false);
  const currentRealPlan = REAL_FLOOR_PLANS[currentFloor];

  const renderFloor = () => {
    switch(currentFloor) {
      case 1: return <Floor1 rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={setSelectedRoom} />;
      case 2: return <Floor2 rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={setSelectedRoom} />;
      case 3: return <Floor3 rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={setSelectedRoom} />;
      case 4: return <Floor4 rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={setSelectedRoom} />;
      case 5: return <Floor5 rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={setSelectedRoom} />;
      case 6: return <Floor6 rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={setSelectedRoom} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Interactive Floor Plan Area */}
      <div className="flex-1 rounded-xl border border-[#2A2A2A] bg-[#111] p-6 shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">{currentFloor}층 도면</h2>
            {currentRealPlan && (
              <button
                onClick={() => setIsRealPlanOpen(true)}
                className="rounded-md border border-[#3A3A3A] bg-[#1A1A1A] px-3 py-1.5 text-sm text-gray-200 transition-colors hover:border-indigo-500/50 hover:bg-[#222]"
              >
                실제 도면 보기
              </button>
            )}
            <a
              href={FLOOR_PLAN_PDF_SRC}
              download
              className="rounded-md border border-[#3A3A3A] bg-[#1A1A1A] px-3 py-1.5 text-sm text-gray-200 transition-colors hover:border-indigo-500/50 hover:bg-[#222]"
            >
              PDF 다운로드
            </a>
          </div>
          
          {/* Floor Selector */}
          <div className="flex bg-[#1A1A1A] rounded-lg p-1 border border-[#2A2A2A]">
            {[1, 2, 3, 4, 5, 6].map((floor) => (
              <button
                key={floor}
                onClick={() => {
                  setCurrentFloor(floor as 1|2|3|4|5|6);
                  setSelectedRoom(null); // Reset selection on floor change
                }}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  currentFloor === floor 
                    ? 'bg-indigo-500 text-white shadow-sm' 
                    : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'
                }`}
              >
                {floor}F
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[1100px]">
            {renderFloor()}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-6 text-sm text-gray-400 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500/20 border border-indigo-500"></div>
            <span>입실 중</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500"></div>
            <span>공실</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500"></div>
            <span>유지보수</span>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <div className="w-full lg:w-80 rounded-xl border border-[#2A2A2A] bg-[#111] p-6 shadow-sm flex flex-col h-full lg:min-h-[600px]">
        {selectedRoom ? (
          <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2A2A2A]">
              <h3 className="text-2xl font-bold text-white">{selectedRoom.name}</h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                selectedRoom.status === 'occupied' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                selectedRoom.status === 'vacant' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {selectedRoom.status === 'occupied' ? '입실 중' : selectedRoom.status === 'vacant' ? '공실' : '유지보수'}
              </span>
            </div>

            {selectedRoom.status === "occupied" ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-800">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">입실자</p>
                    <p className="font-medium text-white">{selectedRoom.resident}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-400 w-24">입실일:</span>
                    <span className="text-white font-medium">{selectedRoom.moveInDate}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-400 w-24">퇴실일:</span>
                    <span className="text-white font-medium">{selectedRoom.moveOutDate}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#2A2A2A] flex gap-3">
                  <button className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg font-medium transition-colors text-sm">
                    상세 프로필 보기
                  </button>
                  <button className="flex-1 bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#2A2A2A] text-white py-2 rounded-lg font-medium transition-colors text-sm">
                    알림 보내기
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500">
                <p className="mb-4">{selectedRoom.status === 'vacant' ? '현재 비어 있는 방으로 입실 가능합니다.' : '이 방은 현재 유지보수 중입니다.'}</p>
                {selectedRoom.status === 'vacant' && (
                  <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-lg shadow-emerald-500/20">
                    신규 입실자 등록
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 animate-pulse">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50">
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            <p>도면에서 방을 선택하시면</p>
            <p className="text-sm mt-1">상세 정보를 보실 수 있습니다</p>
          </div>
        )}
      </div>

      {isRealPlanOpen && currentRealPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-6xl rounded-2xl border border-[#2A2A2A] bg-[#111] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{currentFloor}층 실제 도면</h3>
              <button
                onClick={() => setIsRealPlanOpen(false)}
                className="rounded-md border border-[#2A2A2A] bg-[#1A1A1A] p-2 text-gray-300 transition-colors hover:bg-[#222] hover:text-white"
                aria-label="실제 도면 닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative max-h-[80vh] overflow-auto rounded-xl bg-white">
              <Image
                src={currentRealPlan.src}
                alt={currentRealPlan.alt}
                width={1600}
                height={960}
                className="h-auto w-full"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
