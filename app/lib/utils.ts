/** 해당 연·월의 마지막 날 (2월=28/29, 4·6·9·11월=30, 나머지=31) */
export function lastDayOfMonth(year: number, month1: number): number {
  return new Date(year, month1, 0).getDate();
}

/**
 * 월세 납부일을 해당 월에 맞게 보정합니다.
 * 납부일이 그 달의 마지막 날보다 크면 마지막 날로 clamp합니다.
 * 예: 납부일 31 → 2월 28(29), 6월 30, 7월 31
 * @param month1 1~12
 */
export function effectiveDueDay(dueDay: number, year: number, month1: number): number {
  return Math.min(dueDay, lastDayOfMonth(year, month1));
}

export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/** 입실일 + N개월 - 1일 (2월=28일, 나머지=30일 고정) */
export function calcEndDate(startDate: string, months: number): string {
  const start = new Date(startDate);
  let totalDays = 0;
  for (let i = 0; i < months; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);
    totalDays += d.getMonth() === 1 ? 28 : 30;
  }
  const result = new Date(start);
  result.setDate(result.getDate() + totalDays - 1);
  return result.toISOString().slice(0, 10);
}
