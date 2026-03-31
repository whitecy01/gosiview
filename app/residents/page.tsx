'use client';

import { useState } from "react";
import { X } from "lucide-react";
import TenantListTable from "../components/TenantListTable";
import { getDashboardStats, ALL_ROOMS } from "../lib/mock-data";
import type { Room } from "../lib/mock-data";

type ModalType = "occupied" | "vacant" | "contract" | null;

function RoomListModal({
  type,
  rooms,
  onClose,
}: {
  type: ModalType;
  rooms: Room[];
  onClose: () => void;
}) {
  if (!type) return null;

  const config = {
    occupied: { title: "현재 입실자 목록", badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", badge: "입실중" },
    vacant: { title: "현재 공실 목록", badgeClass: "bg-gray-500/20 text-gray-400 border-gray-500/30", badge: "공실" },
    contract: { title: "계약 방 목록", badgeClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", badge: "계약" },
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl border border-[#2A2A2A] bg-[#111] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-white">{config.title}</h2>
            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${config.badgeClass}`}>
              {rooms.length}개
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {rooms.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">해당 방이 없습니다.</p>
          ) : (
            rooms.map((room) => (
              <div key={room.id} className="flex items-center justify-between rounded-xl border border-[#2A2A2A] bg-[#161616] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1A1A] text-sm font-semibold text-white">
                    {room.id}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{room.name}</p>
                    <p className="text-xs text-gray-500">{room.roomType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  {type === "occupied" && room.resident ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-white">{room.resident}</p>
                        <div className="flex items-center justify-end gap-1.5 mt-0.5">
                          {room.gender && (
                            <span className={`text-xs ${room.gender === '남' ? 'text-blue-400' : 'text-pink-400'}`}>{room.gender}</span>
                          )}
                          {room.age && <span className="text-xs text-gray-500">{room.age}세</span>}
                        </div>
                      </div>
                    </>
                  ) : (
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.badgeClass}`}>
                      {config.badge}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResidentsPage() {
  const stats = getDashboardStats();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const modalRooms: Room[] = activeModal
    ? ALL_ROOMS.filter((r) => r.status === activeModal)
    : [];

  const statCards = [
    { key: null, title: "총 방 개수", value: `${stats.totalRooms}개`, subtitle: "전체 관리 방" },
    { key: "occupied" as ModalType, title: "총 입실자 수", value: `${stats.occupiedRooms}명`, subtitle: `${stats.occupancyRate}% 입실률` },
    { key: "vacant" as ModalType, title: "현재 공실", value: `${stats.vacantRooms}개`, subtitle: "즉시 입실 가능" },
    { key: "contract" as ModalType, title: "계약", value: `${stats.contractRooms}개`, subtitle: "계약 진행 방" },
  ];

  return (
    <main className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">입실자 관리</h1>
        <p className="mt-1 text-sm text-gray-400">
          전체 호실의 입실 현황과 예정 일정, 방 관리 이력을 확인할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            onClick={() => stat.key && setActiveModal(stat.key)}
            className={`rounded-xl border border-[#2A2A2A] bg-[#111] p-6 shadow-sm transition-colors ${
              stat.key ? "cursor-pointer hover:border-[#3A3A3A] hover:bg-[#161616]" : ""
            }`}
          >
            <h3 className="text-sm font-medium text-gray-400">{stat.title}</h3>
            <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
            <p className="mt-1 text-sm text-gray-500">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      <TenantListTable />

      <RoomListModal
        type={activeModal}
        rooms={modalRooms}
        onClose={() => setActiveModal(null)}
      />
    </main>
  );
}
