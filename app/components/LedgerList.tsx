import { MoreHorizontal, FileText, CheckCircle2, XCircle, Clock } from "lucide-react";

const MOCK_LEDGER = [
  { id: "TRX-001", room: "101", resident: "김철수", amount: "₩450,000", date: "2023-11-01", status: "paid" },
  { id: "TRX-002", room: "105", resident: "이영희", amount: "₩400,000", date: "2023-11-02", status: "paid" },
  { id: "TRX-003", room: "108", resident: "박지민", amount: "₩420,000", date: "2023-11-05", status: "pending" },
  { id: "TRX-004", room: "112", resident: "최동훈", amount: "₩450,000", date: "2023-10-28", status: "overdue" },
  { id: "TRX-005", room: "115", resident: "정수진", amount: "₩380,000", date: "2023-11-03", status: "paid" },
];

export default function LedgerList() {
  return (
    <div className="rounded-xl border border-[#2A2A2A] bg-[#111] shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-[#2A2A2A] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">최근 거래 내역</h2>
          <p className="text-sm text-gray-400 mt-1">임대료 납부 및 입실자 장부 관리</p>
        </div>
        <button className="bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white border border-[#2A2A2A] px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <FileText className="h-4 w-4" />
          전체 보기
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400 whitespace-nowrap">
          <thead className="bg-[#1A1A1A] text-xs uppercase text-gray-500 border-b border-[#2A2A2A]">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">거래 ID</th>
              <th scope="col" className="px-6 py-4 font-medium">호실 / 입실자</th>
              <th scope="col" className="px-6 py-4 font-medium">금액</th>
              <th scope="col" className="px-6 py-4 font-medium">납부 기한</th>
              <th scope="col" className="px-6 py-4 font-medium">상태</th>
              <th scope="col" className="px-6 py-4 font-medium text-right">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2A]">
            {MOCK_LEDGER.map((tx) => (
              <tr key={tx.id} className="hover:bg-[#161616] transition-colors group">
                <td className="px-6 py-4 font-mono text-xs font-medium text-gray-500">
                  {tx.id}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center font-medium text-xs text-white">
                      {tx.room}
                    </div>
                    <div>
                      <p className="font-medium text-white">{tx.resident}</p>
                      <p className="text-xs text-gray-500">호실 {tx.room}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-white">
                  {tx.amount}
                </td>
                <td className="px-6 py-4">
                  {tx.date}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={tx.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-[#2A2A2A]">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="h-3.5 w-3.5" />
        납부 완료
      </span>
    );
  }
  if (status === 'overdue') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <XCircle className="h-3.5 w-3.5" />
        미납 (연체)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
      <Clock className="h-3.5 w-3.5" />
      대기 중
    </span>
  );
}
