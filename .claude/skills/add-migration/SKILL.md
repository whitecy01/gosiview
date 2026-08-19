---
name: add-migration
description: Supabase 테이블에 컬럼(또는 신규 테이블)을 추가할 때, DB SQL부터 타입·쿼리 함수·UI 반영까지 gosiview의 일관된 풀스택 변경 절차를 따른다. "컬럼 추가", "필드 추가", "새 테이블", "마이그레이션" 요청 시 사용.
---

# add-migration — gosiview 풀스택 스키마 변경 루틴

gosiview에서 DB 필드 하나를 추가하려면 항상 아래 4개 층을 **같은 순서로** 손봐야 한다.
(과거에 `memo`, `contract_months`, `sort_order`, `common_spaces`를 모두 이 패턴으로 추가했다.)

## 1. 마이그레이션 SQL 제시 (앱에서 실행하지 않음)

사용자가 Supabase SQL Editor에서 직접 실행하도록 SQL을 먼저 제시한다. 예:

```sql
alter table <table> add column <col> <type>;          -- 컬럼 추가
-- 또는 신규 테이블
create table <table> (
  id uuid primary key default gen_random_uuid(),
  ...,
  created_at timestamptz not null default now()
);
```

RLS를 쓰는 프로젝트이므로, **신규 테이블**이면 정책도 함께 안내한다:

```sql
alter table <table> enable row level security;
create policy "allow all" on <table> for all using (true);
```

사용자가 "실행했다"고 확인하기 전까지 저장 동작은 런타임에서 실패할 수 있음을 명시한다.

## 2. `app/lib/supabase-data.ts` — 타입 + 쿼리 함수

- 해당 `DbXxx` 타입에 필드를 추가한다 (nullable 여부를 실제 컬럼과 일치시킬 것).
- `fetchXxx` select는 보통 `select('*')`라 자동 반영되지만, **정렬이 필요하면** `.order()`를 추가한다.
- `insertXxx` / `updateXxx` 의 input 타입과 payload에 필드를 추가한다.
- 신규 테이블이면 `DbXxx` 타입 + `fetchXxx`/`insertXxx`/`deleteXxx`(필요 시 `updateXxx`)를 새로 만든다. 기존 섹션 주석(`// ──────────── Xxx ────────────`) 스타일을 따른다.

## 3. UI 타입 (`app/lib/mock-data.ts`)

DB 필드가 화면 상세(`ResidentDetail` 등)나 폼(`ScheduledResident` 등)에 노출되면 대응 UI 타입에도 camelCase 필드를 추가한다. `DbXxx`(snake_case) ↔ UI 타입(camelCase) 변환 지점을 모두 갱신한다 (`fromDb`, `toForm`, `saveInfo` 등).

## 4. UI 반영 — 입력·표시 지점 전부

**놓치기 쉬운 부분**: 같은 데이터를 다루는 화면이 여러 곳이다. 하나라도 빠지면 불일치가 생긴다. 최소 아래를 점검한다:

- 신규 입실자 등록: `app/components/NewResidentModal.tsx`
- 예약(예정 입실) 폼: `app/components/TenantListTable.tsx` 의 `ResidentForm`
- 입실자 상세: `app/(main)/residents/[id]/page.tsx` (조회 뷰 + 수정 폼 둘 다)
- 대시보드 방 상세 드로어: `app/components/RoomDetailDrawer.tsx`
- 이력 상세 패널: `app/components/ContractDetailPanel.tsx`

금액 필드면 단위 규칙(월세=만원 `step={0.1}`, 보증금/계약금=원 `step={1000}`)을 지킨다.

## 5. 검증

```
npx tsc --noEmit
npx next build
```

둘 다 통과해야 완료. 필요하면 `changelog.ts`에 업데이트 소식 항목도 추가한다.

## 완료 보고

- 실행할 SQL
- 건드린 파일 목록과 각 층에서 한 일
- 아직 SQL 미실행 시 저장이 실패할 수 있다는 주의
