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
