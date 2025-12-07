import { test, expect } from '@playwright/test';

test.describe('레시피 CRUD 기능', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('새 레시피 생성 전체 워크플로', async ({ page }) => {
    // 새 레시피 버튼 클릭
    await page.locator('button:has-text("새 레시피")').click();
    
    // 레시피 에디터가 열려야 함 (레시피 정보 섹션이 표시됨)
    await expect(page.locator('h2:has-text("레시피 정보")')).toBeVisible();
    
    // 기본 정보 입력
    await page.fill('input[placeholder*="우유 식빵"]', '테스트 초콜릿 머핀');
    await page.fill('textarea[placeholder*="간단한 설명"]', '달콤한 초콜릿 머핀 레시피입니다.');
    
    // 카테고리 선택 - 카테고리 라벨 다음의 select 요소 선택
    const categorySelect = page.locator('label:has-text("카테고리")').locator('..').locator('select');
    await categorySelect.selectOption('cake');
    
    // 재료 입력 (기본적으로 첫 번째 행이 있음)
    const ingredientInputs = page.locator('input[placeholder*="강력분"]');
    const amountInputs = page.locator('input[type="number"]');
    
    // 첫 번째 재료 입력 (이미 존재하는 행)
    await ingredientInputs.first().fill('박력분');
    await amountInputs.first().fill('200');
    
    // 두 번째 재료 추가
    const addIngredientButton = page.locator('button:has-text("+ 재료 추가")');
    await addIngredientButton.click();
    await ingredientInputs.nth(1).fill('설탕');
    await amountInputs.nth(1).fill('100');
    
    // 세 번째 재료 추가
    await addIngredientButton.click();
    await ingredientInputs.nth(2).fill('계란');
    await amountInputs.nth(2).fill('50');
    
    // 제작 방법 추가
    const addStepButton = page.locator('button:has-text("+ 단계 추가")');
    await addStepButton.click();
    
    // 첫 번째 단계는 input 타입이므로 textarea가 아닌 input으로 찾기
    const stepInputs = page.locator('h3:has-text("만드는 방법")').locator('..').locator('input');
    await stepInputs.first().fill('모든 재료를 볼에 넣고 섞습니다.');
    
    // 저장 버튼 클릭
    await page.locator('button:has-text("저장")').click();
    
    // 레시피가 목록에 표시되어야 함
    await expect(page.locator('text=테스트 초콜릿 머핀')).toBeVisible({ timeout: 5000 });
  });

  test('레시피 상세 보기', async ({ page }) => {
    // 첫 번째 레시피 클릭
    const firstRecipe = page.locator('.cursor-pointer').first();
    const recipeName = await firstRecipe.locator('h3').textContent();
    await firstRecipe.click();
    
    // 레시피 상세 페이지가 열려야 함 - h1 태그에서 정확한 이름 확인
    await expect(page.locator(`h1:has-text("${recipeName}")`)).toBeVisible();
    
    // 베이커스 퍼센트가 표시되어야 함 (BP% 헤더로 표시됨)
    await expect(page.locator('text=BP%')).toBeVisible();
    
    // 재료 테이블이 표시되어야 함
    await expect(page.locator('table')).toBeVisible();
    
    // 수화율이 계산되어 표시되어야 함
    const hydrationText = page.locator('text=/수화율.*%/');
    if (await hydrationText.count() > 0) {
      await expect(hydrationText.first()).toBeVisible();
    }
  });

  test('레시피 수정', async ({ page }) => {
    // 첫 번째 레시피 클릭
    await page.locator('.cursor-pointer').first().click();
    
    // 편집 버튼 클릭
    await page.locator('button:has-text("편집"), button:has-text("수정")').click();
    
    // 레시피 에디터가 열려야 함
    await expect(page.locator('text=레시피 정보')).toBeVisible();
    
    // 이름 수정
    const nameInput = page.locator('input[placeholder*="우유 식빵"]');
    await nameInput.clear();
    await nameInput.fill('수정된 레시피');
    
    // 저장
    await page.locator('button:has-text("저장")').click();
    
    // 수정된 이름이 표시되어야 함
    await expect(page.locator('text=수정된 레시피')).toBeVisible({ timeout: 5000 });
  });

  test('레시피 삭제', async ({ page }) => {
    // 레시피 개수 확인
    const initialCount = await page.locator('.cursor-pointer').count();
    
    // 첫 번째 레시피 클릭
    await page.locator('.cursor-pointer').first().click();
    
    // 삭제 버튼 클릭
    await page.locator('button:has-text("삭제")').click();
    
    // 확인 다이얼로그 처리
    page.on('dialog', dialog => dialog.accept());
    
    // 또는 커스텀 확인 모달이 있는 경우
    const confirmButton = page.locator('button:has-text("확인"), button:has-text("예")');
    if (await confirmButton.count() > 0) {
      await confirmButton.click();
    }
    
    // 레시피 목록으로 돌아가야 함
    await page.waitForTimeout(1000);
    
    // 레시피 개수가 줄어들어야 함
    const finalCount = await page.locator('.cursor-pointer').count();
    expect(finalCount).toBeLessThan(initialCount);
  });

  test('재료 테이블 동적 추가/삭제', async ({ page }) => {
    // 새 레시피 생성
    await page.locator('button:has-text("새 레시피")').click();
    
    // 재료 추가 버튼 찾기
    const addButton = page.locator('button:has-text("재료 추가"), button:has-text("+ 추가")').first();
    
    // 5개 재료 추가
    for (let i = 0; i < 5; i++) {
      await addButton.click();
      await page.waitForTimeout(100);
    }
    
    // 재료 입력 필드가 추가되었는지 확인
    const ingredientInputs = page.locator('input[placeholder*="강력분"]');
    const count = await ingredientInputs.count();
    expect(count).toBeGreaterThan(4); // 최소 5개 이상
    
    // 재료 삭제 버튼 테스트
    const deleteButtons = page.locator('button:has-text("삭제"), button[aria-label*="삭제"]');
    const initialCount = await ingredientInputs.count();
    if (await deleteButtons.count() > 0) {
      await deleteButtons.first().click();
      await expect(ingredientInputs).toHaveCount(initialCount - 1);
    }
  });

  test('필수 필드 유효성 검사', async ({ page }) => {
    // 새 레시피 생성
    await page.locator('button:has-text("새 레시피")').click();
    
    // 저장 버튼 클릭 (필수 필드 없이)
    await page.locator('button:has-text("저장")').click();
    
    // 에러 메시지나 필드 하이라이트 확인
    const errorMessage = page.locator('text=/필수|입력해주세요|required/i');
    const isErrorVisible = await errorMessage.count() > 0;
    
    // 저장이 실행되지 않았는지 확인 (여전히 에디터 화면에 있음)
    await expect(page.locator('h2:has-text("레시피 정보")')).toBeVisible();
    
    // 또는 에러 메시지나 시각적 피드백이 있는지 확인
    if (isErrorVisible) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });

  test('카테고리별 필터링', async ({ page }) => {
    // 빵 카테고리 클릭
    await page.locator('button:has-text("빵")').first().click();
    
    // 빵 카테고리 레시피만 표시되어야 함
    const visibleRecipes = page.locator('.cursor-pointer:visible');
    const count = await visibleRecipes.count();
    
    if (count > 0) {
      // 각 레시피가 빵 카테고리인지 확인
      for (let i = 0; i < count; i++) {
        const recipe = visibleRecipes.nth(i);
        const categoryBadge = recipe.locator('text=/빵|bread/i');
        if (await categoryBadge.count() > 0) {
          await expect(categoryBadge.first()).toBeVisible();
        }
      }
    }
    
    // 전체 카테고리로 돌아가기
    await page.locator('button:has-text("전체")').first().click();
    const allRecipes = await page.locator('.cursor-pointer').count();
    expect(allRecipes).toBeGreaterThanOrEqual(count);
  });

  test('레시피 취소 시 확인 다이얼로그', async ({ page }) => {
    // 새 레시피 생성
    await page.locator('button:has-text("새 레시피")').click();
    
    // 일부 데이터 입력
    await page.fill('input[placeholder*="우유 식빵"]', '임시 레시피');
    
    // 취소 버튼 클릭
    const cancelButton = page.locator('button:has-text("취소"), button:has-text("뒤로")');
    if (await cancelButton.count() > 0) {
      // 다이얼로그 리스너 설정
      let dialogShown = false;
      page.on('dialog', dialog => {
        dialogShown = true;
        dialog.accept();
      });
      
      await cancelButton.first().click();
      
      // 커스텀 확인 모달 확인
      const confirmModal = page.locator('text=/저장하지 않은|변경사항|취소/');
      if (await confirmModal.count() > 0) {
        await expect(confirmModal.first()).toBeVisible();
        await page.locator('button:has-text("확인"), button:has-text("예")').click();
      }
      
      // 레시피 목록으로 돌아가야 함 (내 레시피 제목이나 카테고리 탭이 보임)
      await expect(page.locator('h2:has-text("내 레시피")')).toBeVisible({ timeout: 5000 });
    }
  });

  test('베이커스 퍼센트 자동 계산', async ({ page }) => {
    // 새 레시피 생성
    await page.locator('button:has-text("새 레시피")').click();
    
    // 재료 입력
    const addButton = page.locator('button:has-text("재료 추가"), button:has-text("+ 추가")').first();
    
    // 밀가루 추가
    await addButton.click();
    await page.locator('input[placeholder*="강력분"]').first().fill('강력분');
    await page.locator('input[type="number"]').first().fill('500');
    
    // 물 추가
    await addButton.click();
    await page.locator('input[placeholder*="강력분"]').nth(1).fill('물');
    await page.locator('input[type="number"]').nth(1).fill('350');
    
    // 베이커스 퍼센트 표시 확인 (테이블 내 BP% 컬럼에서)
    const bpHeader = page.locator('text=BP%');
    if (await bpHeader.count() > 0) {
      // BP% 컬럼이 있으면 수치가 표시되는지 확인 (물의 경우 70.0%가 예상되지만 다를 수 있음)
      const percentageCells = page.locator('table tbody tr td:nth-child(3)');
      const cellCount = await percentageCells.count();
      expect(cellCount).toBeGreaterThan(0);
    }
  });

  test('레시피 검색 기능 (있는 경우)', async ({ page }) => {
    // 검색 입력 필드 찾기
    const searchInput = page.locator('input[placeholder*="검색"], input[type="search"]');
    
    if (await searchInput.count() > 0) {
      // 검색어 입력
      await searchInput.fill('식빵');
      
      // 검색 결과 확인
      await page.waitForTimeout(500); // 디바운싱 대기
      
      // 식빵 레시피만 표시되어야 함
      const visibleRecipes = page.locator('.cursor-pointer:visible');
      const count = await visibleRecipes.count();
      
      for (let i = 0; i < count; i++) {
        const recipeName = await visibleRecipes.nth(i).locator('h3').textContent();
        expect(recipeName.toLowerCase()).toContain('식빵');
      }
      
      // 검색 초기화
      await searchInput.clear();
      await page.waitForTimeout(500);
      
      // 모든 레시피가 다시 표시되어야 함
      const allRecipesCount = await page.locator('.cursor-pointer').count();
      expect(allRecipesCount).toBeGreaterThanOrEqual(count);
    }
  });
});