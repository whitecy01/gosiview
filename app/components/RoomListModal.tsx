"use client";

import { X } from "lucide-react";
import type { Room } from "../lib/mock-data";

export type RoomModalType = "occupied" | "vacant" | "contract" | null;

const CONFIG = {
  occupied: { title: "현재 입실자 목록", badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", badge: "입실중" },
  vacant:   { title: "현재 공실 목록",   badgeClass: "bg-gray-500/20 text-gray-400 border-gray-500/30",     badge: "공실" },
  contract: { title: "계약 방 목록",     badgeClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", badge: "계약" },
};

interface Props {
  type: RoomModalType;
  rooms: Room[];
  onClose: () => void;
}

export default function RoomListModal({ type, rooms, onClose }: Props) {
  if (!type) return null;

  const config = CONFIG[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl border border-[#2A2A2A] bg-[#111] shadow-2xl"
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
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[#1A1A1A] hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {rooms.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">해당 방이 없습니다.</p>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between rounded-xl border border-[#2A2A2A] bg-[#161616] px-4 py-3"
              >
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
                    <div>
                      <p className="text-sm font-medium text-white">{room.resident}</p>
                      <div className="mt-0.5 flex items-center justify-end gap-1.5">
                        {room.gender && (
                          <span className={`text-xs ${room.gender === "남" ? "text-blue-400" : "text-pink-400"}`}>
                            {room.gender}
                          </span>
                        )}
                        {room.birth_date && <span className="text-xs text-gray-500">{new Date().getFullYear() - parseInt(room.birth_date.slice(0, 4), 10)}세</span>}
                      </div>
                    </div>
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
