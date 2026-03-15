import LedgerList from "../components/LedgerList";

export default function ResidentsPage() {
  return (
    <main className="w-full space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">입실자 관리</h1>
          <p className="mt-1 text-sm text-gray-400">
            입실 현황과 계약 일정, 월세 납부 시점을 함께 관리할 수 있는 페이지입니다.
          </p>
        </div>
        <button className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2A2A2A]">
          신규 입실자 등록
        </button>
      </div>

      <LedgerList />
    </main>
  );
}
