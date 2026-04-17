'use client';

import { useState } from "react";
import TenantListTable from "@/app/components/TenantListTable";
import RoomListModal, { type RoomModalType } from "@/app/components/RoomListModal";
import { getDashboardStats, ALL_ROOMS } from "@/app/lib/mock-data";

export default function ResidentsPage() {
  const stats = getDashboardStats();
  const [activeModal, setActiveModal] = useState<RoomModalType>(null);

  const modalRooms = activeModal ? ALL_ROOMS.filter((r) => r.status === activeModal) : [];

  const statCards = [
    { key: null,          title: "총 방 개수",   value: `${stats.totalRooms}개`,    subtitle: "전체 관리 방" },
    { key: "occupied" as RoomModalType, title: "총 입실자 수", value: `${stats.occupiedRooms}명`, subtitle: `${stats.occupancyRate}% 입실률` },
    { key: "vacant"   as RoomModalType, title: "현재 공실",   value: `${stats.vacantRooms}개`,   subtitle: "즉시 입실 가능" },
    { key: "contract" as RoomModalType, title: "계약",        value: `${stats.contractRooms}개`, subtitle: "계약 진행 방" },
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
