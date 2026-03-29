import TenantListTable from "../components/TenantListTable";

export default function ResidentsPage() {
  return (
    <main className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">입실자 관리</h1>
        <p className="mt-1 text-sm text-gray-400">
          전체 호실의 입실 현황과 예정 일정, 방 관리 이력을 확인할 수 있습니다.
        </p>
      </div>

      <TenantListTable />
    </main>
  );
}
