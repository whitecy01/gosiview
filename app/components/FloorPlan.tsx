"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { getRoomsByFloor, type FloorNumber, type Room } from "../lib/mock-data";
import RoomDetailDrawer from "./RoomDetailDrawer";
import { useNewResident } from "./NewResidentContext";
import Floor1 from "./floor-plans/Floor1";
import Floor2 from "./floor-plans/Floor2";
import Floor3 from "./floor-plans/Floor3";
import Floor4 from "./floor-plans/Floor4";
import Floor5 from "./floor-plans/Floor5";
import Floor6 from "./floor-plans/Floor6";

const REAL_FLOOR_PLANS: Partial<Record<FloorNumber, { src: string; alt: string }>> = {
  1: { src: "/floor-plans/1f-plan.png", alt: "1층 실제 도면" },
  2: { src: "/floor-plans/2f-plan.png", alt: "2층 실제 도면" },
  3: { src: "/floor-plans/3f-plan.png", alt: "3층 실제 도면" },
  4: { src: "/floor-plans/4f-plan.png", alt: "4층 실제 도면" },
  5: { src: "/floor-plans/5f-plan.png", alt: "5층 실제 도면" },
  6: { src: "/floor-plans/6f-plan.png", alt: "6층 실제 도면" },
};
const FLOOR_PLAN_PDF_SRC = "/floor-plans/spacehorim-floorplan.pdf";

export default function FloorPlan() {
  const [currentFloor, setCurrentFloor] = useState<FloorNumber>(1);
  const rooms = getRoomsByFloor(currentFloor);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isRealPlanOpen, setIsRealPlanOpen] = useState(false);
  const currentRealPlan = REAL_FLOOR_PLANS[currentFloor];
  const openNewResident = useNewResident();

  function handleSelectRoom(room: Room) {
    if (room.status === 'vacant') {
      openNewResident(room.id);
    } else {
      setSelectedRoom(room);
    }
  }

  const renderFloor = () => {
    switch (currentFloor) {
      case 1: return <Floor1 rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={handleSelectRoom} />;
      case 2: return <Floor2 rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={handleSelectRoom} />;
      case 3: return <Floor3 rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={handleSelectRoom} />;
      case 4: return <Floor4 rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={handleSelectRoom} />;
      case 5: return <Floor5 rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={handleSelectRoom} />;
      case 6: return <Floor6 rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={handleSelectRoom} />;
      default: return null;
    }
  };

  return (
    <div>
      {/* Floor Plan Area */}
      <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-6 shadow-sm overflow-hidden flex flex-col">
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
              도면 전체 PDF 다운로드
            </a>
          </div>

          {/* Floor Selector */}
          <div className="flex bg-[#1A1A1A] rounded-lg p-1 border border-[#2A2A2A]">
            {[1, 2, 3, 4, 5, 6].map((floor) => (
              <button
                key={floor}
                onClick={() => {
                  setCurrentFloor(floor as FloorNumber);
                  setSelectedRoom(null);
                }}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  currentFloor === floor
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
                }`}
              >
                {floor}F
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-[1100px]">
            {renderFloor()}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-6 text-sm text-gray-400 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500/20 border border-indigo-500" />
            <span>입실 중</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500" />
            <span>공실</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500" />
            <span>계약</span>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer */}
      <RoomDetailDrawer
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
      />

      {/* 실제 도면 모달 */}
      {isRealPlanOpen && currentRealPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-6xl rounded-2xl border border-[#2A2A2A] bg-[#111] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{currentFloor}층 실제 도면</h3>
              <button
                onClick={() => setIsRealPlanOpen(false)}
                className="rounded-md border border-[#2A2A2A] bg-[#1A1A1A] p-2 text-gray-300 transition-colors hover:bg-[#222] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative max-h-[80vh] overflow-auto rounded-xl bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentRealPlan.src} alt={currentRealPlan.alt} className="h-auto w-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
