import FloorPlan from "./components/FloorPlan";
import { getDashboardStats } from "./lib/mock-data";
// import LedgerList from "./components/LedgerList";

export default function Home() {
  const stats = getDashboardStats();

  return (
    <main className="w-full">
      <div className="mb-6 flex flex-col items-start justify-between sm:flex-row sm:items-center">
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-2 sm:mb-0">대시보드 개요</h1>
        <div className="flex gap-2">
          <button className="rounded-lg bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-white hover:bg-[#2A2A2A] transition-colors border border-[#2A2A2A]">
            보고서 다운로드
          </button>
          <button className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20">
            신규 입실자 등록
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: "총 입실자 수", value: `${stats.occupiedRooms}명`, subtitle: `${stats.occupancyRate}% 입실률` },
          /* { title: "이번 달 총 매출", value: "₩12.5M", subtitle: "당월 기준" },
          { title: "이번 달 미납 현황", value: "3건", subtitle: "총 ₩1.2M 미납" }, */
          { title: "현재 공실", value: `${stats.vacantRooms}개`, subtitle: "즉시 입실 가능" },
          { title: "유지보수", value: `${stats.maintenanceRooms}개`, subtitle: "점검 필요 방" },
        ].map((stat, idx) => (
          <div key={idx} className="rounded-xl border border-[#2A2A2A] bg-[#111] p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-400">{stat.title}</h3>
            <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
            <p className="mt-1 text-sm text-gray-500">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <FloorPlan />
      </div>

      {/* <div className="mb-8">
        <LedgerList />
      </div> */}
    </main>
  );
}
