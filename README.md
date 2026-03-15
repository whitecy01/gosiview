# 고시원 관리 시스템 (gosiview)

트렌디하고 직관적인 도면 뷰, 장부 관리, 안전한 인증 시스템을 갖춘 현대적인 Gosiwon(고시원) 웹 기반 관리 시스템입니다.

## 프로젝트 작업 목표 (Tasks)

### 1. UI 기획 및 디자인
- [x] Next.js 초기 레이아웃 및 글로벌 스타일 설정 (tailwind, dark mode 등)
- [x] 대시보드 레이아웃 생성 (사이드바, 헤더, 메인 콘텐츠 영역)
- [x] 도면 뷰(Floor Plan) 컴포넌트 구현 (방 클릭 시 상세 정보 모달/패널)
- [x] 장부 리스트(Ledger List) 컴포넌트 구현
- [ ] 피드백을 반영하여 프리미엄하고 트렌디한 동적 UI로 폴리싱

### 2. 인증 및 Supabase 연동
- [ ] Supabase 클라이언트 세팅
- [ ] 로그인 페이지 구현 (외부 사용자 접근 차단)
- [ ] 라우터 보호를 위한 Middleware(인증) 구현
- [ ] 장부 및 방 데이터를 Supabase 데이터베이스와 연동

---

## Next.js 시작하기

먼저 개발 서버를 실행하세요:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 를 열어 결과를 확인하세요.

`app/page.tsx` 파일을 수정하여 페이지 편집을 시작할 수 있습니다. 파일을 편집하면 페이지가 자동으로 업데이트됩니다.

이 프로젝트는 [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)를 사용하여 Vercel의 새로운 폰트 제품군인 [Geist](https://vercel.com/font)를 자동으로 최적화하고 로드합니다.

## 더 알아보기

Next.js에 대해 더 알아보려면 다음 리소스를 확인하세요:

- [Next.js 문서](https://nextjs.org/docs) - Next.js 기능과 API에 대해 알아봅니다.
- [Next.js 배우기](https://nextjs.org/learn) - 대화형 Next.js 튜토리얼입니다.

[Next.js GitHub 리포지토리](https://github.com/vercel/next.js)를 확인할 수 있습니다. 여러분의 피드백과 기여를 환영합니다!

## Vercel에 배포하기

Next.js 앱을 배포하는 가장 쉬운 방법은 Next.js 제작자가 만든 [Vercel 플랫폼](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)을 사용하는 것입니다.

자세한 내용은 [Next.js 배포 문서](https://nextjs.org/docs/app/building-your-application/deploying)를 확인하세요.
