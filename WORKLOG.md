# WORKLOG - 작업 진행 로그 (단일 마스터 파일)

> 이 파일 하나에만 모든 작업 진행상황을 기록한다. 새 문서를 여러 개 만들지 않는다.
> 세션이 바뀌어도 이 파일 맨 위 "다음 세션 재개 지점"부터 이어서 작업한다.
> 최종 갱신: 2026-07-04

---

## [다음 세션 재개 지점] <- 여기부터 읽고 이어서

**현재 작업: UI/UX 개선 Phase 1 - de-amber 전면 적용 + 좌우표 통합 완료 (미커밋)**

- 브랜치: `fix/uiux-phase1`. 커밋 `8c0d810`(Phase 1a) 이후 **46개 파일 수정, 아직 커밋/push 안 함**.
- 근본원인 확정: 뉴트럴 팔레트 토큰을 tailwind에 정의만 하고 화면에 미적용(gray 879회·bread 잔존). "안 바뀐" 진짜 이유.
- **Phase 1b(완료, 2026-07-04):**
  - de-amber 전면: 기반 4파일(index.css/.input·.btn-secondary·.card, Input.jsx, Button.jsx, App.tsx) 직접 + 파일별 병렬 워크플로우 12그룹(색상 1196건, 이모지→lucide 19건). 휴지=뉴트럴, 앰버는 CTA/활성/포커스링/핵심숫자만. 잔존 bread는 전부 정당한 KEEP(선택카드/포커스링/카운트배지) 확인.
  - #3 좌우표 통합(AdvancedDashboard): `isConverted=|배수-1|>=0.0001`. ×1이면 원본표 단일 전체폭+조용한 힌트배너(surface-muted), 변환 시 2열 복원. 데스크톱/모바일/×2 스크린샷 검증 완료.
  - 검증 3종 통과: typecheck 0 / test 164 / build(PWA 포함) OK.
- **남은 Phase 1 항목(미착수): #4 필터 접기 -> #5 새레시피 빈시작 -> #6 용어통일** (기존 계획 유지).
- **UI 후속(선택):** 데이터맵 이모지(PHASE_META.icon 📦, CATEGORY_ICONS 🍞🎂, 공정칩 ⏱🌡) → lucide 통일은 데이터구조 리팩터 필요라 보류. 설정 탭 섹션헤더 이모지 일부 잔존.
- 다음: 사용자 확인 후 커밋(무관파일 .claude/settings.local.json·DEPLOYMENT_GUIDE.md·diag-*.py 제외) -> #4~#6 -> Codex 리뷰 -> PR.

### 다음 4개 항목 상세 + Codex(gpt-5.5) 확정 접근
1. **#4 필터 접기** (src/components/recipe/FilterControls.tsx, RecipeListPage.tsx)
   - `productType` 드롭다운 제거 -> 레시피목록의 카테고리칩을 제품/카테고리 단일 소스로.
   - 나머지 필터(difficulty/timeRange/tags)는 "필터" 토글 버튼 뒤로 **항상 접힘 + activeFilterCount 배지**.
   - 배지에 카테고리칩 선택은 미포함(숨겨진 필터만 카운트).
2. **#5 새 레시피 빈 시작 + 예시 분리**
   - 지금은 "새 레시피" 눌러도 강력분 식빵 예시가 채워져 내 데이터/샘플 구분 불가.
   - 새레시피 = 빈 재료 1행으로 시작 + 상단 안내배너. 예시는 별도 "예시 불러오기" 버튼 + "예시 데이터" 배지.
3. **#6 용어 통일** (src/i18n/locales/ko.json + 각 컴포넌트)
   - 프리퍼먼트 -> 사전반죽 등 화면마다 다른 표기 통일. 전문용어 보조설명/툴팁.
4. **#3 좌우표 통합** (src/components/dashboard/AdvancedDashboard.tsx, 약 2688행 좌우표)
   - 변환 판정: `Math.abs(effectiveMultiplier - 1) < 0.0001` (부동소수 안전).
   - 변환 없음: 변환표 렌더 안 하고 원본표 `lg:col-span-2` 전체폭 + 조용한 힌트배너(`bg-surface-muted border-line text-ink-muted`) "배수/팬을 바꾸면 여기 표시".
   - 변환 있음: 기존 좌우 2열 유지 + 변환표 헤더에 `×배수` 배지 + `총량 800g -> 1200g` 요약.
   - 행별 변화 강조는 비추천(전부 같은 배수라 노이즈). 완전 단일표 통합은 Phase 2로.
   - 원본표=편집폼(6컬럼), 변환표=읽기전용(3컬럼), 변환은 `effectiveMultiplier` 단일값(AdvancedDashboard.tsx:980).

### 뉴트럴 팔레트 토큰(추가됨, 앞으로 활용)
tailwind.config.js에 추가: `surface`(canvas #F8FAFC / paper #FFFFFF / muted #F1F5F9), `line`(DEFAULT #E2E8F0 / soft #F1F5F9 / strong #CBD5E1), `ink`(DEFAULT #0F172A / muted #475569 / subtle #64748B / disabled #94A3B8 / inverse #FFFFFF). brand(amber)는 액센트로만. bread는 하위호환 유지.

---

## [작업 규칙 / 검증 방법]

- git: main이 기본. 작업은 별도 브랜치 -> PR -> merge. 무관 파일(.claude/settings.local.json, DEPLOYMENT_GUIDE.md, diag-*.py)은 커밋 제외.
- 검증 3종: `npm run typecheck`(0) / `npm run test:run`(현재 164 통과) / `npm run build`(tsc 게이트+PWA 포함). 커버리지 `npm run test:coverage`(green).
- 커밋 말미: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`. PR 말미: Claude Code 생성 표기.
- 외부 모델: 사용자가 "코덱스랑"이라 하면 Codex(mcp__codex__codex, model gpt-5.5) 협업. UI/UX는 전문가 페르소나 적용.
- UI 변경은 실제 앱을 dev(5173)/preview로 띄우고 playwright 스크린샷으로 눈으로 확인(임시 스크립트/스크린샷은 작업 후 삭제).
- 상세 코드리뷰 체크리스트는 `CODE_REVIEW_2026-07-02.md`(참고용, 102건). 이 WORKLOG가 마스터 진행 로그.

---

## [완료 이력] (최신 -> 과거)

### UI/UX 집중 리뷰 + 개선 (2026-07-03~04)
- **UI/UX 집중 리뷰**: 실제 앱 preview+playwright 스크린샷 직접 관찰 + 7렌즈 코드분석(59건). 근본원인 3: 올드=주황 단색 광역(brand=bread 동일 amber, 뉴트럴 팔레트 부재)/복잡=AdvancedDashboard 3063줄 동시편집/어려움=온보딩·용어 부재. (워크플로우 wf_3f7a3e5b-277)
- **Phase 0 완료 (PR#3 병합, main 2838d5e)**: Header 화이트 sticky 반전(활성탭만 amber), 전역 h1~h3 슬레이트화(히어로 h1만 text-white), 변환기 오븐/제법 섹션 접기, 지표 title 툴팁, 버튼위계(저장만 primary/복사 아웃라인/JSON ghost), 공정카드 hover버튼 모바일 상시노출.
- **Phase 1a (브랜치 fix/uiux-phase1, 커밋 8c0d810, 로컬 미push)**: 뉴트럴 팔레트 토큰 추가 + 홈 히어로 화이트화. 스크린샷으로 "화이트 앱 + 주황 포인트" 인상 반전 확인.

### 전면 코드리뷰 리메디에이션 (2026-07-02~03) - 발견 102건 중 96건(94%) 반영
- **PR#1 (main 4397b43)**: P0~P3 핵심. P0=RecipeEditor 크래시/DDT predictDoughTemp 섭씨정합(C-5 완결)/import sanitize. P1=타입오류 111->0 + build tsc게이트 승격/i18n 치환파괴/설정 오버라이드 삭제액션/데드코드 12파일/stores 크래시/App @ts-nocheck 해제. P2=접근성·PWA색·path traversal. P3=테스트 102->164·커버리지 게이트.
- **PR#1 후속 (78693d0)**: 잔여 low/info 40건(stores/계산/컴포넌트/설정).
- **PR#2 (main 421bc94, 947e929)**: PWA 이중화 통합(VitePWA 단일화, 앱 실행 검증) + File System API 타입보강 + e2e 정비(header 2개 strict violation 해소).
- 방법: 12축 병렬감사(63 에이전트) -> 적대적 검증. 상세 체크리스트 CODE_REVIEW_2026-07-02.md.

---

## [보류 항목] (코드리뷰 잔여 6건 + UI/UX Phase 2)

### 코드리뷰 보류 6건 (사유 있음, 별도 판단 필요)
- alias 중복(vitest/tsconfig): 번들러 vs TS컴파일러 별개 시스템이라 완전 통합 불가.
- 루트 스크립트(run.py/analyze_excel*.py/create-cafe-post.js): **사용자 자산 - 삭제 여부 사용자 결정 필요**.
- i18n 언어소스 이중화(LanguageDetector vs useLocaleStore): 언어전환 회귀 위험, 구조 리팩터 필요.
- declarations.d.ts any + noUncheckedIndexedAccess: 켜면 앱 전반 대량 타입오류(사실상 전체 JS->TS 마이그레이션 필요).
- 대시보드 as any 7건: 표준 Recipe와 근본적으로 다른 저장/로드 구조라 회귀 방지 위해 유지.

### UI/UX Phase 2 (주 단위, 나중에)
- AdvancedDashboard 3063줄 컴포넌트 분해(섹션별 + useDashboardStore 이관).
- 변환기 간단/전문가 2모드.
- 모바일 결과우선 탭/바텀시트 레이아웃.
- 좌우표 완전 단일화(원본g|변환g 인라인 컬럼).
