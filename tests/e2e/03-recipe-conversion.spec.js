import { test, expect } from '@playwright/test';

test.describe('레시피 변환 시스템', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 첫 번째 레시피 선택하여 변환 콘솔로 이동
    await page.locator('.cursor-pointer').first().click();
    await page.locator('button:has-text("레시피 변환"), button:has-text("변환")').click();
  });

  test('변환 콘솔이 올바르게 열려야 함', async ({ page }) => {
    // 변환 콘솔 타이틀 확인 (h2 태그의 정확한 제목)
    await expect(page.locator('h2').filter({ hasText: '레시피 변환:' })).toBeVisible();
    
    // 변환 옵션 탭들이 표시되어야 함
    const tabs = ['제법 변환', '팬 크기 조정', '환경 보정', 'DDT 계산'];
    for (const tab of tabs) {
      await expect(page.locator(`button:has-text("${tab}")`)).toBeVisible();
    }
  });

  test('스트레이트법 → 중종법 변환', async ({ page }) => {
    // 제법 변환 탭 클릭
    await page.locator('button:has-text("제법 변환")').click();
    
    // 중종법 카드 클릭 (클릭 가능한 div)
    await page.locator('.cursor-pointer:has(h4:has-text("중종법"))').click();
    
    // 변환 버튼 클릭
    await page.locator('button:has-text("변환 계산")').click();
    
    // 변환 결과 확인
    await expect(page.locator('text=/중종|예비.*발효|1차.*반죽/')).toBeVisible();
    
    // 재료가 분할되어 표시되어야 함
    await expect(page.locator('text=/본반죽|2차.*반죽/')).toBeVisible();
  });

  test('스트레이트법 → 폴리쉬법 변환', async ({ page }) => {
    // 제법 변환 탭
    await page.locator('button:has-text("제법 변환")').click();
    
    // 폴리쉬법 선택
    // 폴리쉬법 카드 클릭
    await page.locator('.cursor-pointer:has(h4:has-text("폴리쉬법"))').click();
    
    // 변환 적용
    await page.locator('button:has-text("변환 계산")').click();
    
    // 폴리쉬법 특징 확인 (높은 수화율)
    await expect(page.locator('text=/폴리쉬|100%.*수화/')).toBeVisible();
  });

  test('스트레이트법 → 비가법 변환', async ({ page }) => {
    // 제법 변환 탭
    await page.locator('button:has-text("제법 변환")').click();
    
    // 비가법 선택
    // 비가법 카드 클릭
    await page.locator('.cursor-pointer:has(h4:has-text("비가법"))').click();
    
    // 변환 적용
    await page.locator('button:has-text("변환 계산")').click();
    
    // 비가법 특징 확인
    await expect(page.locator('text=/비가|Biga|이탈리아/')).toBeVisible();
  });

  test('스트레이트법 → 저온숙성법 변환', async ({ page }) => {
    // 제법 변환 탭
    await page.locator('button:has-text("제법 변환")').click();
    
    // 저온숙성법 선택
    // 저온숙성법 카드 클릭
    await page.locator('.cursor-pointer:has(h4:has-text("저온숙성법"))').click();
    
    // 변환 적용
    await page.locator('button:has-text("변환 계산")').click();
    
    // 저온숙성 특징 확인 (냉장 발효)
    await expect(page.locator('text=/저온|냉장|4℃|12.*24시간/')).toBeVisible();
  });

  test('스트레이트법 → 노타임법 변환', async ({ page }) => {
    // 제법 변환 탭
    await page.locator('button:has-text("제법 변환")').click();
    
    // 노타임법 선택
    // 노타임법 카드 클릭
    await page.locator('.cursor-pointer:has(h4:has-text("노타임법"))').click();
    
    // 변환 적용
    await page.locator('button:has-text("변환 계산")').click();
    
    // 노타임법 특징 확인 (반죽 없음)
    await expect(page.locator('text=/노타임|No.*[Kk]nead|반죽.*없/')).toBeVisible();
  });

  test('팬 크기 조정 - 표준 팬 선택', async ({ page }) => {
    // 팬 크기 탭 클릭
    await page.locator('button:has-text("팬 크기 조정")').click();
    
    // 원본 팬 선택
    const fromPan = page.locator('select').first();
    if (await fromPan.count() > 0) {
      await fromPan.selectOption({ label: '8인치 원형' });
    }
    
    // 대상 팬 선택
    const toPan = page.locator('select').nth(1);
    if (await toPan.count() > 0) {
      await toPan.selectOption({ label: '10인치 원형' });
    }
    
    // 변환 계산 버튼 클릭
    await page.locator('button:has-text("변환 계산")').click();
    
    // 스케일링 비율 표시 확인
    await expect(page.locator('text=/%|배|scale/')).toBeVisible();
    
    // 조정된 재료량 확인
    const adjustedAmounts = page.locator('text=/조정|변경|새로운.*량/');
    if (await adjustedAmounts.count() > 0) {
      await expect(adjustedAmounts.first()).toBeVisible();
    }
  });

  test('팬 크기 조정 - 커스텀 치수 입력', async ({ page }) => {
    // 팬 크기 탭
    await page.locator('button:has-text("팬 크기 조정")').click();
    
    // 고급 옵션 또는 커스텀 입력 활성화
    const advancedButton = page.locator('text=/고급|커스텀|직접.*입력/');
    if (await advancedButton.count() > 0) {
      await advancedButton.click();
    }
    
    // 커스텀 치수 입력
    const widthInput = page.locator('input[placeholder*="가로"], input[placeholder*="너비"]');
    const heightInput = page.locator('input[placeholder*="세로"], input[placeholder*="높이"]');
    
    if (await widthInput.count() > 0) {
      await widthInput.fill('30');
      await heightInput.fill('40');
    }
    
    // 계산
    await page.locator('button:has-text("계산"), button:has-text("조정")').click();
    
    // 부피 계산 결과 확인
    await expect(page.locator('text=/부피|volume|㎤|ml/')).toBeVisible();
  });

  test('환경 보정 - 온도 조정', async ({ page }) => {
    // 환경 보정 탭
    await page.locator('text=환경 보정').click();
    
    // 온도 입력
    const tempInput = page.locator('input[placeholder*="온도"], input[type="number"]').first();
    await tempInput.fill('30');
    
    // 보정 계산
    await page.locator('button:has-text("보정"), button:has-text("계산")').click();
    
    // 이스트량 조정 확인
    await expect(page.locator('text=/이스트.*조정|yeast.*adjust/')).toBeVisible();
  });

  test('환경 보정 - 습도 조정', async ({ page }) => {
    // 환경 보정 탭
    await page.locator('text=환경 보정').click();
    
    // 습도 입력
    const humidityInput = page.locator('input[placeholder*="습도"]');
    if (await humidityInput.count() > 0) {
      await humidityInput.fill('80');
      
      // 보정 계산
      await page.locator('button:has-text("보정"), button:has-text("계산")').click();
      
      // 밀가루량 조정 확인
      await expect(page.locator('text=/밀가루.*조정|flour.*adjust/')).toBeVisible();
    }
  });

  test('환경 보정 - 고도 조정', async ({ page }) => {
    // 환경 보정 탭
    await page.locator('text=환경 보정').click();
    
    // 고도 입력
    const altitudeInput = page.locator('input[placeholder*="고도"], input[placeholder*="해발"]');
    if (await altitudeInput.count() > 0) {
      await altitudeInput.fill('1500');
      
      // 보정 계산
      await page.locator('button:has-text("보정"), button:has-text("계산")').click();
      
      // 고도 보정 결과 확인
      await expect(page.locator('text=/고도|altitude|기압/')).toBeVisible();
    }
  });

  test('DDT 계산기', async ({ page }) => {
    // DDT 계산 탭
    await page.locator('text=DDT').click();
    
    // 목표 반죽 온도 입력
    const targetTemp = page.locator('input[placeholder*="목표"], input[placeholder*="DDT"]').first();
    await targetTemp.fill('27');
    
    // 재료 온도 입력
    const flourTemp = page.locator('input[placeholder*="밀가루"]');
    const roomTemp = page.locator('input[placeholder*="실온"], input[placeholder*="room"]');
    
    if (await flourTemp.count() > 0) {
      await flourTemp.fill('22');
    }
    if (await roomTemp.count() > 0) {
      await roomTemp.fill('25');
    }
    
    // 계산
    await page.locator('button:has-text("계산")').click();
    
    // 물 온도 결과 확인
    await expect(page.locator('text=/물.*온도|water.*temperature/')).toBeVisible();
    
    // 계산된 온도 값 확인
    const waterTempResult = page.locator('text=/\d+.*℃|\d+.*°C/');
    await expect(waterTempResult.first()).toBeVisible();
  });

  test('변환 결과 저장', async ({ page }) => {
    // 제법 변환 수행
    await page.locator('text=제법 변환').click();
    
    // 중종법 카드 클릭
    await page.locator('.cursor-pointer:has(h4:has-text("중종법"))').click();
    
    await page.locator('button:has-text("변환 계산")').click();
    
    // 저장 버튼 클릭
    const saveButton = page.locator('button:has-text("저장"), button:has-text("새 레시피로 저장")');
    if (await saveButton.count() > 0) {
      await saveButton.click();
      
      // 레시피 목록으로 이동 확인
      await expect(page.locator('text=레시피 목록')).toBeVisible({ timeout: 5000 });
      
      // 변환된 레시피가 저장되었는지 확인
      await expect(page.locator('text=/중종법|변환/')).toBeVisible();
    }
  });

  test('변환 전후 비교 뷰', async ({ page }) => {
    // 제법 변환 수행
    await page.locator('text=제법 변환').click();
    
    // 중종법 카드 클릭
    await page.locator('.cursor-pointer:has(h4:has-text("중종법"))').click();
    
    await page.locator('button:has-text("변환 계산")').click();
    
    // 비교 뷰 확인
    const compareView = page.locator('text=/원본|변환.*전|before/');
    if (await compareView.count() > 0) {
      await expect(compareView.first()).toBeVisible();
      
      // 변환 후 뷰도 확인
      await expect(page.locator('text=/변환.*후|after|결과/')).toBeVisible();
    }
  });

  test('발효 시간 정보 표시', async ({ page }) => {
    // 제법 변환으로 발효 시간 변경 확인
    await page.locator('text=제법 변환').click();
    
    // 저온숙성법 선택 (긴 발효시간)
    // 저온숙성법 카드 클릭
    await page.locator('.cursor-pointer:has(h4:has-text("저온숙성법"))').click();
    
    await page.locator('button:has-text("변환 계산")').click();
    
    // 발효 시간 정보 확인
    await expect(page.locator('text=/\d+.*시간|발효.*시간|ferment/')).toBeVisible();
  });

  test('변환 설정 초기화', async ({ page }) => {
    // 여러 변환 설정 적용
    await page.locator('text=제법 변환').click();
    
    if (await page.locator('select').count() > 0) {
      await page.locator('select').selectOption({ label: '중종법' });
    }
    
    // 초기화 버튼 찾기
    const resetButton = page.locator('button:has-text("초기화"), button:has-text("리셋")');
    if (await resetButton.count() > 0) {
      await resetButton.click();
      
      // 원본 상태로 돌아갔는지 확인
      const originalMethod = page.locator('text=/스트레이트|원본/');
      await expect(originalMethod.first()).toBeVisible();
    }
  });
});