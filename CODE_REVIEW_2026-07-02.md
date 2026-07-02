# 전면 코드리뷰 리메디에이션 체크리스트

> 생성일: 2026-07-02 | 방법: 12개 축 병렬 감사(63 에이전트) -> 적대적 검증. 원발견 97 -> 검증통과 92 + 타입축 재감사 10.
> 진행 규칙: 완료 시 `[x]`, 부분완료/보류 시 항목 아래 메모. 상단 P0->P3 순서대로 처리.
> 전체 원본 결과(참고): 워크플로우 run wf_8d3f5da0-072 journal.jsonl

## 진행 로그
- 2026-07-03: P0 전량 반영 완료(RecipeEditor 크래시 / predictDoughTemp C-5 섭씨정합 / importRecipes sanitize+정렬 널가드 + 부수 low 2건). 테스트 102/102 통과, 빌드 정상. 다음: P1.

- 2026-07-03(2): P1 진행 - typecheck 스크립트+@types 정리(오류 111->92), i18n 분/도 치환순서 수정, 설정 오버라이드 삭제액션 3종+3개탭 버튼 수정, 데드코드 11개파일 제거(calculator 폴더 전체/panScaling.js/environmental.js/magicNumbers.js/ToastExample/ToastIntegrationExample/lazyWithPreload/4개 데드 .jsx). 타입오류 92->86. 빌드/테스트102 통과. 남음: P1-b(@ts-nocheck 해제+타입오류 86->0), P2, P3.

- 2026-07-03(3): P1-b 완료 - stores/index.ts 크래시버그(re-export만 있고 로컬 바인딩 없어 resetAllStores/initializeStores 실행 시 ReferenceError) 수정, realtimeCalculator yeast->leavening, 서브에이전트로 잔여 타입오류 전량 정리(App.tsx @ts-nocheck 해제 포함, as any/@ts-ignore 신규 0, 로직변경 0). typecheck 0 달성 -> package.json build에 'tsc --noEmit &&' 게이트 승격. **P1 전체 완료.** test102/build 통과. 다음: P2.

- 2026-07-03(4): P2 완료 - UI/UX·a11y(Help닫기버튼 연결, Contact/Help 접근성 앵커·aria-label, 히어로 대비 AA, 난이도배지 4색 분리, 이모지 aria-hidden, 초소형텍스트 상향, 환경탭 터치노출, Help/UserGuide 하드코딩색 brand화) + 위생(PWA색 amber 5곳 정합[vite/manifest/html/icon/offline], sourcemap off, express·cors devDeps, repo url, screenshot-server path traversal 차단+cors제한, docx 죽은청크 제거). 갈색 완전 제거. build+test102 통과. 남음: P3.

- 2026-07-03(5): P3 완료 - 빈 디렉토리 2개+00-debug 스펙 3개 제거, 중복 단위테스트 통합(src/utils/calculations/__tests__ 삭제->tests/unit 정본화), 핵심 계산 신규 테스트(panScaling/yieldLoss/environmental/realtimeCalculator + recipeStore sanitize 라운드트립) -> 102->164 통과, setup.ts localStorage 목 in-memory 보강, 커버리지 include를 계산유틸로 좁혀 threshold green(Stmts97/Branch88/Funcs97/Lines97), CLAUDE.md 커버리지 문구 정합. **P0~P3 핵심 완료.**

## 진행 현황
- [x] P0 (Critical + 최우선 High) 완료
- [ ] P1 (타입 게이트 + High 잔여 + 설정 오버라이드/i18n) 완료
- [ ] P2 (UI/UX·a11y·위생) 완료
- [x] P3 (테스트·데드코드 정리) 완료

## [CRITICAL] (1건)

- [x] **(레시피/변환/공통)** RecipeEditor가 instructions 없는 레시피 편집 시 렌더 중 크래시 — `src/components/recipe/RecipeEditor.jsx:160`
  - 수정: setFormData 시 누락 필드를 기본값으로 보강하라. 예: setFormData({ name:'', description:'', category:'bread', method:'straight', servings:1, ingredients:[], instructions:[], notes:'', ...recipe, instructions: recipe.instructions ?? [] }). 최소한 map 사용 전 (formData.instructions || []) 로 방어하고, ingredients도 마찬가지로 정규화할 것.

## [HIGH] (2건)

- [x] **(핵심계산)** predictDoughTemp가 화씨 마찰계수를 섭씨 온도에 섞어 예측 반죽온도를 약 5°C 과대 산출 (C-5 미수정 잔존) — `src/utils/calculations/ddtCalculator.ts:152`
  - 수정: predictDoughTemp가 FRICTION_FACTORS_CELSIUS를 사용하도록 변경하거나, mixingTime 스케일을 유지하되 섭씨 마찰상수를 기준으로 adjustedFriction을 산출하도록 수정한다. 예: const frictionFactor = this.FRICTION_FACTORS_CELSIUS[mixerType] ?? 8. 그러면 목표 DDT와 예측 반죽온도가 정합된다.
- [x] **(스토어)** importRecipes가 신뢰할 수 없는 JSON을 검증 없이 그대로 스토어에 병합 — `src/stores/useRecipeStore.ts:78`
  - 수정: 스토어 진입점에서 각 레시피를 검증/정규화하는 함수(예: sanitizeRecipe)를 두어 (1) id 없으면 새로 생성, (2) name/category/difficulty 기본값 채움, (3) ingredients가 배열이 아니면 [] 로 강제, (4) createdAt/updatedAt를 Date로 정규화하고, 검증 실패 항목은 스킵+개수 반환하도록 한다. UI가 아니라 스토어 액션 자체에서 불변식을 보장해야 handleLoadFromFile 경로까지 안전해진다.

## [MEDIUM] (15건)

- [ ] **(빌드/설정)** 손으로 만든 PWA(public/sw.js·manifest.json·index.html 링크)와 VitePWA 플러그인 이중 공존 — `vite.config.js:39`
  - 수정: PWA 소스를 하나로 통일: (a) VitePWA를 쓸 거면 public/sw.js·public/manifest.json을 삭제하고 index.html의 수동 manifest 링크도 제거해 VitePWA가 주입하도록 위임, 또는 (b) 손수 만든 SW/manifest만 쓸 거면 VitePWA 플러그인을 제거. 빌드 후 dist/sw.js와 실제 링크된 manifest 파일명이 하나로 수렴하는지 검증.
- [x] **(빌드/설정)** screenshot-server가 클라이언트 filename으로 경로 이탈 쓰기 가능(path traversal) — `server/screenshot-server.cjs:35`
  - 수정: path.basename(safeFilename)로 디렉토리 성분 제거 + 결과 경로가 rootDir 하위인지 path.resolve로 재검증, cors를 http://localhost:5173로 제한. 근본적으로는 이 서버 자체가 죽은 코드이므로 제거를 우선 검토.
- [ ] **(핵심계산)** 제법변환에서 저수화율 레시피 시 액체가 중종/폴리시에도 본반죽에도 없이 소실 (질량 비보존) — `src/utils/calculations/methodConversion.js:89`
  - 수정: 액체 차감을 투입과 동일 조건으로 묶고, spongeLiquid를 min(spongeLiquid, liquidTotal)로 클램프하거나 부족 시 변환을 거부/경고한다. liquidRatio를 [0,1]로 제한해 음수 발생을 원천 차단한다.
- [x] **(i18n)** 공정단계 번역기의 '분'->min, '도'->°C 무조건 치환이 한글 단어를 파괴 — `src/data/processStepTranslations.ts:242` (원high)
  - 수정: (1) termMap을 '길이 내림차순'으로 정렬해 긴 키('분할','정도','온도')를 먼저 치환하거나, (2) 단순 문자열 replace 대신 단어 경계/토큰 단위 매칭으로 바꾼다. 특히 '도'->'°C'처럼 단일 음절을 전역 치환하는 항목은 제거하고 숫자 컨텍스트(예: /(\d+)\s*도/) 패턴으로만 변환해야 한다. '분'도 /(\d+)\s*분/ 형태에서만 min으로 바꾸고 복합어를 보호하라.
- [x] **(i18n)** 베이킹 노트 번역기의 '분'->min 치환이 재료명(전분/중력분)을 오염 — `src/data/ingredientTranslations.ts:839` (원high)
  - 수정: termMap을 키 길이 내림차순으로 순회하도록 Object.entries(termMap).sort((a,b)=>b[0].length-a[0].length) 처리하고, '분':'min'은 /(\d+)\s*분/ 숫자+단위 패턴에서만 치환하도록 분리하라. 근본적으로는 이런 음절 단위 replace 방식 대신 사전 기반 토큰 치환으로 재설계 권장.
- [ ] **(레시피/변환/공통)** prefermentTemp 0°C가 '사전반죽 없음'으로 오판되어 잘못된 공식 사용 — `src/components/conversion/DDTCalculator.tsx:197`
  - 수정: 존재 판정을 truthiness가 아니라 null 체크로 바꿔라: `if (prefermentTemp !== null && prefermentTemp !== undefined)`. includePreferment 계산(245행)도 동일하게 !!prefermentTemp → prefermentTemp !== null 로 수정.
- [x] **(보안)** 스크린샷 파일명 경로 탈출 — `src/components/common/ScreenCapture.jsx:32` (원high)
  - 수정: basename 정규화와 경로 검증을 추가하라.
- [x] **(설정)** 재료 탭: 커스텀 재료의 수분함량 편집이 화면·데이터에 반영되지 않음 — `src/components/settings/IngredientSettingsTab.tsx:210`
  - 수정: 커스텀 분기에서도 오버라이드를 반영: `const moistureOverride = ingredient.moistureOverrides[custom.name]; moisture: moistureOverride ?? custom.moisture, moistureOverridden: moistureOverride !== undefined`. 혹은 커스텀 재료 수분은 updateCustomIngredient로 직접 갱신하도록 저장 경로를 분기.
- [x] **(설정)** 재료 탭: 수분함량 '초기화'가 오버라이드를 실제로 제거하지 못함 — `src/components/settings/IngredientSettingsTab.tsx:383`
  - 수정: 스토어에 `deleteMoistureOverride(ingredientName)`(해당 키 delete) 액션을 추가하고 초기화 시 이를 호출. 그래야 moistureOverridden이 false로 돌아가 강조/카운트가 해제된다.
- [x] **(설정)** 제품 탭: 비용적 '기본값 복원' 버튼이 오버라이드를 제거하지 못함 + 죽은 코드 — `src/components/settings/ProductSettingsTab.tsx:333`
  - 수정: 스토어에 `deleteVolumeOverride(category, name)`(키 delete) 액션을 추가하고 복원 시 호출. 죽은 `newOverrides` 블록은 삭제.
- [x] **(설정)** 환경 탭: 커스텀 프로필 편집/삭제 버튼이 hover 전용이라 터치 기기에서 접근 불가 — `src/components/settings/EnvironmentSettingsTab.tsx:532`
  - 수정: 부모 카드에 `group`을 주고 버튼 컨테이너를 `opacity-0 group-hover:opacity-100 focus-within:opacity-100`로 바꾸되, 터치 환경(`@media (hover: none)`)에서는 항상 표시되도록 하거나 모바일에서 상시 노출로 처리.
- [ ] **(스토어)** selectFilteredRecipes 정렬이 name/category 널가드 없이 localeCompare 호출 — `src/stores/useRecipeStore.ts:254` (원high)
  - 수정: (a.name ?? '').localeCompare(b.name ?? '') / (a.category ?? '').localeCompare(b.category ?? '') 로 방어. 근본적으로는 위 sanitizeRecipe로 필드를 보장하는 것과 병행.
- [x] **(테스트)** CLAUDE.md가 주장하는 80% 커버리지 임계값과 실제 테스트 범위의 심각한 괴리 — `vitest.config.ts:20` (원high)
  - 수정: (1) 도메인 핵심인 panScaling(부피 기준 팬 스케일링), yieldLoss(수율손실), environmental(환경보정)에 대해 알려진 입력->기대 출력 수치를 고정하는 단위 테스트를 우선 추가. (2) recipe store의 import/export 라운드트립 테스트 추가. (3) 목표에 도달하기 전까지는 thresholds를 현실적 수치로 낮추거나 커버리지 대상 파일을 명시(include)해 게이트가 거짓 통과/거짓 실패하지 않도록 정합화. CLAUDE.md 문구도 실제와 일치시킬 것.
- [x] **(UI/UX)** Contact 이메일/GitHub 연락 카드가 키보드·스크린리더로 접근 불가한 clickable div — `src/components/legal/Contact.tsx:47` (원high)
  - 수정: 두 카드를 <button type="button" onClick={...}> 또는 이메일은 <a href="mailto:...">, GitHub은 <a href="https://..." target="_blank" rel="noopener noreferrer">로 교체한다. div를 유지해야 한다면 최소한 role="button" tabIndex={0} onKeyDown으로 Enter/Space 처리와 focus-visible 스타일을 추가한다.
- [x] **(UI/UX)** 홈 히어로의 text-brand-100 라벨·부제가 amber 그라디언트 위에서 WCAG 대비 미달 — `src/components/home/HomePage.tsx:111`
  - 수정: 그라디언트를 더 어둡게(예: from-brand-700 to-brand-600) 하거나 부제/라벨 색을 text-white 또는 text-brand-50로 올린다. 통계 라벨은 text-white/90 수준으로 상향해 소형 텍스트에서도 4.5:1을 확보한다. 대비 검사기로 실측 후 조정 권장.

## [LOW] (67건)

- [x] **(빌드/설정)** express/cors가 프론트 앱 dependencies에 오분류 + 그 용도(ScreenCapture)는 죽은 코드 — `package.json:24` (원medium)
- [x] **(빌드/설정)** manualChunks의 docx 분리 브랜치가 죽은 설정 (docx는 클라이언트 미사용) — `vite.config.js:138`
- [ ] **(빌드/설정)** base:'/' 고정과 gh-pages 배포/저장소 URL 정합성 위험 — `vite.config.js:7`
- [x] **(빌드/설정)** package.json repository.url이 yourusername 플레이스홀더 — `package.json:69`
- [ ] **(빌드/설정)** 경로 alias가 vite/vitest/tsconfig 세 곳에 중복 정의(단일 출처 부재) — `vitest.config.ts:40`
- [x] **(빌드/설정)** 프로덕션 sourcemap:true로 소스 노출 및 배포 용량 증가 — `vite.config.js:108`
- [ ] **(빌드/설정)** 앱과 무관한 루트 스크립트들이 저장소에 잔존(run.py, analyze_excel*.py, create-cafe-post.js) — `package.json:1`
- [x] **(핵심계산)** calculateWaterTemp 기본 마찰계수가 화씨값 24로 남아 섭씨 공식에 대입 시 C-5 결함 재현 — `src/utils/calculations/ddtCalculator.ts:77` (원medium)
- [ ] **(핵심계산)** 영양표 총중량을 0.4kcal/g 가정으로 역산해 servingsPerContainer가 약 6~7배 과대 — `src/utils/calculations/nutritionCalculator.js:179` (원medium)
- [ ] **(핵심계산)** realtimeCalculator 폴리시 변환이 밀가루 없는 물+이스트로 모델링되어 폴리시 정의와 상충 — `src/utils/calculations/realtimeCalculator.ts:258` (원medium)
- [ ] **(핵심계산)** 제법변환 시 본반죽 물/이스트 음수 미방어 — `src/utils/calculations/realtimeCalculator.ts:176`
- [ ] **(핵심계산)** 팬 프리셋 'small' 표시 부피 630ml가 사다리꼴 보정(0.85) 실제 계산값 535.5ml와 불일치 — `src/utils/calculations/realtimeCalculator.ts:358`
- [ ] **(핵심계산)** 수화율 계산이 달걀 전체 중량을 100% 액체로 계산해 과대평가 — `src/utils/calculations/bakersPercentage.ts:91`
- [x] **(핵심계산)** environmental.ts와 environmental.js의 보정 로직이 상이하며 현재 어느 것도 사용되지 않는 죽은 코드 — `src/utils/calculations/environmental.js:128`
- [ ] **(핵심계산)** 영양/원가 계산의 0-나눗셈 미방어로 NaN/Infinity 전파 가능 — `src/utils/calculations/nutritionCalculator.js:188`
- [ ] **(대시보드)** saveRecipeData 의존성 배열 누락으로 비연동 모드에서 원래 팬/원제품 비용적이 stale 값으로 저장됨 — `src/components/dashboard/AdvancedDashboard.tsx:1728` (원medium)
- [x] **(대시보드)** PanVisualization: 조건부 early return 이후에 useMemo 호출 - React 훅 규칙 위반 — `src/components/calculator/PanVisualization.jsx:15` (원medium)
- [ ] **(대시보드)** useWorker: postMessage 성공/타임아웃 시 error(또는 message) 리스너가 제거되지 않아 누적됨 — `src/hooks/useWorker.ts:102` (원medium)
- [ ] **(대시보드)** useWorker: 공유 timeoutRef로 인해 동시 postMessage 호출 시 타임아웃 취소가 어긋남 — `src/hooks/useWorker.ts:65`
- [x] **(대시보드)** 미사용 파일 다수 - 계산기 컴포넌트/워커 훅이 App·라우팅에서 전혀 참조되지 않는 dead code — `src/components/calculator/QuickPanCalculator-Enhanced.jsx:18`
- [x] **(대시보드)** RecipeExcelView.addRow: 모든 행 삭제 후 추가 시 Math.max(...[])가 -Infinity가 되어 잘못된 id 생성 — `src/components/calculator/RecipeExcelView.tsx:101`
- [x] **(대시보드)** PanVisualization: 고유 id가 있음에도 반복 렌더에서 key로 배열 index 사용 — `src/components/calculator/PanVisualization.jsx:34`
- [x] **(대시보드)** PanVisualization: map 콜백 내부에서 maxDoughPerPan을 매 반복 재계산 — `src/components/calculator/PanVisualization.jsx:141`
- [x] **(데드코드)** panScaling.js는 미마운트 .jsx 전용 데드 중복본 (라이브 경로는 panScaling.ts) — `src/utils/calculations/panScaling.js:1` (원medium)
- [x] **(데드코드)** environmental.js는 미마운트 EnvironmentControls.jsx 전용 데드 중복본 — `src/utils/calculations/environmental.js:6` (원medium)
- [x] **(데드코드)** magicNumbers.js는 미마운트 .jsx 전용 데드 코드 (TS 대응본 없음) — `src/utils/calculations/magicNumbers.js:6` (원medium)
- [x] **(데드코드)** src/examples/ToastIntegrationExample.tsx 전체가 미사용 예제 (프로덕션 src에 혼입) — `src/examples/ToastIntegrationExample.tsx:1`
- [x] **(데드코드)** ToastExample.tsx는 '이해 후 삭제' 주석이 붙은 미사용 데모 컴포넌트 — `src/components/common/ToastExample.tsx:4`
- [x] **(데드코드)** lazyWithPreload.ts 전체가 소비처 없는 미사용 유틸리티 — `src/utils/lazyWithPreload.ts:16`
- [ ] **(i18n)** getSubstitutionRules 양방향 부분매칭으로 잘못된 대체규칙 반환 — `src/data/substitutionRules.ts:385` (원medium)
- [ ] **(i18n)** 굽기 시간 범위 패턴에서 상한 없을 때 '25- min' 잔여 하이픈 출력 — `src/data/processStepTranslations.ts:158` (원medium)
- [ ] **(i18n)** 재료명 표기 불일치로 영어 표시/교차조회 실패 및 오역 — `src/data/ingredientTranslations.ts:89` (원medium)
- [ ] **(i18n)** 언어 소스 이중화: LanguageDetector(i18nextLng) vs useLocaleStore 지속 상태 — `src/i18n/index.ts:65`
- [ ] **(i18n)** 공정 단계 자유 텍스트의 온도가 화씨 사용자에게도 °C로 고정 표기 — `src/hooks/useLocalization.ts:296`
- [ ] **(레시피/변환/공통)** DDT 계산기의 얼음 모드가 한 번 켜지면 이후 계산에 고착 — `src/components/conversion/DDTCalculator.tsx:213` (원medium)
- [ ] **(레시피/변환/공통)** IngredientTable: 추가/삭제 가능한 편집 행에 index를 key로 사용 — `src/components/recipe/IngredientTable.jsx:96` (원medium)
- [ ] **(레시피/변환/공통)** RecipeView: ingredient.type 필터로 베이커스%/수화율/수율 오산출 — `src/components/recipe/RecipeView.jsx:45` (원medium)
- [ ] **(레시피/변환/공통)** RecipeCard: div role=button 내부에 편집/삭제 button 중첩(상호작용 요소 중첩) — `src/components/recipe/RecipeCard.tsx:153`
- [ ] **(레시피/변환/공통)** PanSelector: 커스텀 팬 type 변경이 부모로 전파되지 않아 stale 값 사용 — `src/components/conversion/PanSelector.jsx:130`
- [ ] **(레시피/변환/공통)** MethodSelector: advantages/disadvantages 배열 존재를 가정한 slice 호출 — `src/components/conversion/MethodSelector.jsx:47`
- [ ] **(레시피/변환/공통)** YieldLossCalculator/AutocompleteInput: 매 렌더 새 객체·배열로 useMemo 무력화 — `src/components/common/YieldLossCalculator.tsx:124`
- [ ] **(보안)** quota 초과 무시 — `src/utils/storage/localStorage.js:36` (원medium)
- [x] **(설정)** 수율손실 탭: 제품 오버라이드 '제거' 버튼이 동작하지 않고, 변경 없이 저장해도 오버라이드로 오인됨 — `src/components/settings/YieldLossSettingsTab.tsx:392` (원medium)
- [ ] **(설정)** 환경 탭: 발효 영향 계산이 기준온도 26을 하드코딩해 제법 탭의 baseTemperature 설정을 무시 — `src/components/settings/EnvironmentSettingsTab.tsx:74`
- [ ] **(설정)** 제품 탭: 비용적 입력을 비우거나 0 입력 시 즉시 기본값으로 덮어써져 자유 입력이 어려움 — `src/components/settings/ProductSettingsTab.tsx:322`
- [ ] **(설정)** 저장 탭: 폴더에서 설정 로드 시 importSettings 실패해도 성공 토스트 표시 — `src/components/settings/StorageSettingsTab.tsx:130`
- [ ] **(설정)** 설정 페이지: 파일 가져오기 후 input 값 미초기화 + reader 에러 미처리 — `src/components/settings/SettingsPage.tsx:187`
- [ ] **(스토어)** 어떤 persist 스토어도 localStorage 용량 초과(QuotaExceededError)를 처리하지 않음 — `src/stores/useRecipeStore.ts:153` (원medium)
- [x] **(스토어)** importRecipes 중복 제거가 id 없는 레시피에 대해 무력화되어 중복/undefined-id 항목 유입 — `src/stores/useRecipeStore.ts:82` (원medium)
- [ ] **(스토어)** useSettingsStore가 partialize/Date 정규화 없이 기본 팬 60여 개를 통째로 persist하고 import 시 날짜 미정규화 — `src/stores/useSettingsStore.ts:426` (원medium)
- [x] **(스토어)** useAppStore.setActiveTab 구현 시그니처(pushHistory)가 공개 타입과 불일치 — `src/stores/useAppStore.ts:55`
- [ ] **(스토어)** useDashboardStore.saveAsNewRecipe가 레시피를 생성만 하고 저장하지 않으며 id만 반환 — `src/stores/useDashboardStore.ts:247`
- [ ] **(스토어)** usePanPresetStore가 상태 계층에서 confirm/alert 부작용 및 importPresets 스키마 미검증 — `src/stores/usePanPresetStore.ts:203`
- [ ] **(스토어)** resetAllStores가 5개 스토어를 누락해 전체 리셋 계약을 지키지 못함 — `src/stores/index.ts:24`
- [ ] **(테스트)** e2e basic-functionality 스펙의 조건부 스킵으로 인한 거짓 통과(false green) — `tests/e2e/basic-functionality.spec.ts:19` (원high)
- [ ] **(테스트)** 반응형 e2e 테스트가 항상 참인 무의미 단언만 수행 — `tests/e2e/basic-functionality.spec.ts:38` (원medium)
- [x] **(테스트)** 저장소에 남은 00-debug 스펙 3종 - assertion 없이 항상 통과하는 노이즈 테스트 — `tests/e2e/00-debug.spec.js:42` (원medium)
- [x] **(테스트)** 동일 유틸에 대한 중복·분기된 단위 테스트 스위트 이중 실행 — `tests/unit/utils/bakersPercentage.test.ts:1` (원medium)
- [x] **(테스트)** calculateIceAmount(안전 관련 열평형 계산) 테스트가 정확한 수치를 전혀 고정하지 않음 — `src/utils/calculations/__tests__/ddtCalculator.test.ts:46` (원medium)
- [x] **(테스트)** calculate()의 중간 온도 경고 분기와 adjustedWaterTemp 클램프가 미검증 — `src/utils/calculations/__tests__/ddtCalculator.test.ts:101`
- [x] **(테스트)** setup.ts의 localStorage 목이 항상 undefined 반환 - persist 기반 store 테스트 원천 차단 — `src/test/setup.ts:26`
- [x] **(UI/UX)** Help 화면의 X·닫기 버튼이 onClose 미전달로 완전히 동작하지 않음 — `src/App.tsx:179` (원high)
- [x] **(UI/UX)** 난이도 배지 색상 intermediate와 advanced가 동일 색으로 붕괴 (amber 통일 부작용) — `src/components/home/HomePage.tsx:44` (원medium)
- [x] **(UI/UX)** Help·UserGuide의 하드코딩 blue/green 박스가 amber 디자인시스템과 불일치 — `src/components/help/Help.jsx:270`
- [x] **(UI/UX)** 최근 레시피 카드의 text-[10px] 초소형 텍스트로 가독성·확대 대응 취약 — `src/components/home/HomePage.tsx:239`
- [x] **(UI/UX)** Help ✕ 버튼에 접근성 레이블 없음 (문자 ✕만 노출) — `src/components/help/Help.jsx:112`
- [x] **(UI/UX)** App.tsx 전역 // @ts-nocheck로 메인 라우팅 파일의 타입 안전망 무력화 — `src/App.tsx:1`

## [INFO] (7건)

- [ ] **(빌드/설정)** @vitejs/plugin-react v4에서 무효한 fastRefresh 옵션 + 빈 babel 설정 — `vite.config.js:31`
- [x] **(빌드/설정)** PWA theme_color/background_color가 amber 브랜드 확정 이후에도 갈색(#8B4513)으로 드리프트 — `vite.config.js:50`
- [x] **(대시보드)** QuickPanCalculator: 미사용 import(BakersPercentage) 및 미사용 ref(printRef) — `src/components/calculator/QuickPanCalculator.jsx:5`
- [ ] **(레시피/변환/공통)** RecipeListPage 초기화 useEffect의 빈 의존성 배열(exhaustive-deps 위반) — `src/components/recipe/RecipeListPage.tsx:56`
- [ ] **(설정)** 고급 탭: isCustom 판정이 항상 false인 죽은 분기 — `src/components/settings/AdvancedSettingsTab.tsx:169`
- [ ] **(스토어)** 팬 부피 0일 때 스케일 배율 division-by-zero로 Infinity/NaN 재료량 — `src/stores/useDashboardStore.ts:371`
- [x] **(UI/UX)** 장식용 이모지 다수가 aria-hidden 없이 콘텐츠로 노출 — `src/components/home/HomePage.tsx:233`

## [타입 안전성 재감사] (1차 누락분 보강, 10건)

- [x] **[High]** 빌드/배포 파이프라인에 tsc 타입체크 게이트가 전혀 없음(strict가 강제 안 됨) — `package.json`(scripts), `tsconfig.json`
  - 수정: "typecheck": "tsc --noEmit" 추가 후 "build": "npm run typecheck && vite build"로 게이트화. (P1 최우선)
- [x] **[High]** .js 소스 약 22개가 타입체크에서 완전 배제(main tsconfig에 allowJs/checkJs 없음) — `tsconfig.json`
  - 수정: 핵심 계산 .js를 .ts로 점진 이관. 즉시 대응 시 allowJs+checkJs 켜고 // @ts-check 점진 도입.
- [x] **[High]** // @ts-nocheck가 앱 루트 전체를 무검사로 만듦(any 5건) — `src/App.tsx:1`
  - 수정: @ts-nocheck 제거 후 드러난 오류 수정. HMR lazy 분기는 국소 @ts-expect-error로 좁힘.
- [x] **[High]** .js/.ts 중복 모듈이 다른 공식으로 발산(environmental 기압식 선형 vs 지수 등) — `src/utils/calculations/environmental.js` vs `.ts`, `panScaling.js` vs `.ts`
  - 수정: 라이브 미사용 .js(및 그것만 참조하는 dead .jsx) 제거, .ts 단일 진실원천 확정, import 확장자 규약 통일.
- [x] **[Medium]** RecipeExcelView의 @ts-ignore가 필수 필드 productType 누락 은폐 — `src/components/calculator/RecipeExcelView.tsx:115`
  - 수정: newRecipe에 명시 Recipe 타입 부여(productType 포함), @ts-ignore 제거.
- [ ] **[Medium]** AdvancedDashboard 전반 as any 27건(타입에 없는 yieldStageSelection 읽기/쓰기 포함) — `src/components/dashboard/AdvancedDashboard.tsx`
  - 수정: 확장 필드를 Recipe(또는 확장 인터페이스)에 정식 추가, as any 제거, 옵셔널 체이닝 사용.
- [ ] **[Medium]** panScaling.ts calculatePanVolume의 non-null 단언(!)이 undefined 치수를 은폐(NaN 위험) — `src/utils/calculations/panScaling.ts:359`
  - 수정: ! 대신 필수 치수 가드/throw, 또는 팬 타입별 discriminated union 설계.
- [ ] **[Low]** declarations.d.ts 와일드카드가 모든 .js 기본 import를 any로 만듦(sampleRecipes 포함) — `src/declarations.d.ts:3`
  - 수정: 시드 데이터 .ts화(Recipe[]) 또는 로드 시 런타임 검증.
- [ ] **[Low]** fileSystemStorage.ts @ts-ignore 4건(File System Access API 미지원 우회) — `src/utils/storage/fileSystemStorage.ts:112`
  - 수정: declaration merging으로 타입 보강 또는 @ts-expect-error로 범위 축소.
- [ ] **[Info]** 도메인 타입 잔여 any(ConversionChange.from/to, HistoryItem.data) + noUncheckedIndexedAccess 미설정 — `src/types/recipe.types.ts:355`, `store.types.ts:61`
  - 수정: 제네릭/판별유니온 대체, 여력 시 noUncheckedIndexedAccess 도입.

## 기각됨 (참고, 재작업 불필요)

- selectFilteredRecipes 매 호출 새 배열 반환 -> 무한루프 주장 (stores)
- useDashboardStore history 부분 persist orphan 상태 주장 (stores)
- RecipeEditor 조리단계 index key 포커스 밀림 주장 (recipe) — 단 IngredientTable의 동일 이슈는 Low로 유효
- 타입축 1차 빈 결과(placeholder) — 재감사로 대체
- C-5 calculate() 배선 테스트 부재 주장 (testing) — 단 커버리지 괴리는 Medium으로 유효
