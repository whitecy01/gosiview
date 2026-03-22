import LedgerList from "../components/LedgerList";

export default function ResidentsPage() {
  return (
    <main className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">입실자 관리</h1>
        <p className="mt-1 text-sm text-gray-400">
          입실 현황과 계약 일정, 월세 납부 시점을 함께 관리할 수 있는 페이지입니다.
        </p>
      </div>

      <LedgerList />
    </main>
  );
}
