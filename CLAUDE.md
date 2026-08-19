# gosiview — 고시원 관리 시스템

Next.js 14 (App Router) · TypeScript · Supabase · Tailwind CSS 기반 고시원 운영 관리 웹앱.

## 아키텍처 요지

- **데이터 계층**: 모든 Supabase 접근은 `app/lib/supabase-data.ts`에 모아둔다. UI 컴포넌트에서 직접 `createClient()`를 부르지 않는다.
  - DB row 타입은 `DbXxx` (예: `DbContract`, `DbTodo`, `DbMaintenanceRecord`).
  - 함수 네이밍: `fetchXxx` / `insertXxx` / `updateXxx` / `deleteXxx`.
- **전역 상태**: `app/context/RoomsContext.tsx`가 `rooms`, `contracts`를 로드하고 `addContract`/`editContract`/`removeContract`/`refetch`를 제공한다.
- **오늘 날짜 기준 방 상태**: `app/context/useEffectiveRooms.ts`가 `contracts`를 오늘(`todayStr`) 기준으로 계산해 각 방의 현재 입실자/공실/예정을 만든다. **화면에 보이는 방 상태의 단일 소스.**
- **페이지**: `app/(main)/` 아래. 주요 페이지 — `page.tsx`(Todo List), `dashboard`, `residents`(+`[id]` 상세), `rooms/[id]/history`(입실 이력), `calendar`, `stats`, `print`.

## 핵심 도메인 규칙 (중요)

- **계약(contracts) 상태**: `scheduled`(진행/예정) 또는 `completed`(퇴실 완료).
- **날짜 필드 구분**:
  - `contract_start_end` = 계약 만료일(문서상)
  - `actual_move_in_date` = 실제 입실일, `actual_move_out_date` = 확정(실제) 퇴실일
- **현재 입실자 선택** (`useEffectiveRooms`): 같은 방의 `scheduled` 계약 중 `입실일 ≤ 오늘 AND (실제퇴실일 없음 OR 실제퇴실일 > 오늘)` 인 것들에서 **입실일이 가장 최근인 계약**을 current로 잡는다.
- **이력 표시 조건** (`fetchRoomHistory`): `status === 'completed'` 이거나 `(actual_move_out_date ?? contract_start_end) < 오늘`.
  - ⚠️ **정합성 함정**: 이전 입실자에게 `actual_move_out_date`가 없고 `contract_start_end`가 미래면, 더 늦게 입실한 사람이 current가 되면서 이전 입실자가 **현재에도 이력에도 안 뜨는 "유령"**이 된다. 예약/신규 입실 등록 시 `findOccupantNeedingMoveOut`으로 가드한다.
- **월세 미납 누적**: 지난 달까지 `paid` 레코드가 없는 달이 하나라도 있으면 계속 미납.
- **월세 납부일 말일 보정**: `effectiveDueDay(dueDay, year, month)` (`app/lib/utils.ts`) — 납부일이 그 달 마지막 날보다 크면 말일로 clamp (31일 → 2월 28일 등).

## 금액 단위 규칙

- 월세/금액(관포) 등은 화면에서 **만원 단위**로 입력받아 `× 10000` 해서 원으로 저장 (`step={0.1}` 로 천원 단위 허용).
- 보증금/계약금은 **원 단위** 입력 (`step={1000}`).

## 작업 규칙

- 변경 후 반드시 `npx tsc --noEmit` 과 `npx next build`로 검증한다.
- DB 스키마를 바꾸는 변경은 사용자가 Supabase에서 직접 실행할 SQL을 함께 제시한다 (앱에서 마이그레이션하지 않는다).
- 헤더 종 아이콘 업데이트 소식은 `app/lib/changelog.ts` 배열 맨 위에 항목을 추가한다.
- 커밋 메시지는 한국어, `feat:`/`fix:`/`chore:` 접두사.
