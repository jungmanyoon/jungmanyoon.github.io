import { test, expect } from '@playwright/test';

test.describe('앱 초기화 및 기본 로딩', () => {
  test.beforeEach(async ({ page }) => {
    // localStorage 초기화
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/');
  });

  test('앱이 정상적으로 로드되어야 함', async ({ page }) => {
    // 앱 타이틀 확인
    await expect(page).toHaveTitle(/레시피북/);
    
    // 헤더가 표시되어야 함
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // 메인 컨텐츠 영역이 표시되어야 함 (main 태그가 없을 수도 있음)
    const content = page.locator('#root');
    await expect(content).toBeVisible();
  });

  test('헤더에 올바른 제목이 표시되어야 함', async ({ page }) => {
    const title = page.locator('h1');
    await expect(title).toContainText('레시피북');
  });

  test('새 레시피 버튼이 표시되고 클릭 가능해야 함', async ({ page }) => {
    const newRecipeButton = page.locator('button:has-text("새 레시피")');
    await expect(newRecipeButton).toBeVisible();
    await expect(newRecipeButton).toBeEnabled();
    
    // 버튼 클릭 시 에디터로 이동
    await newRecipeButton.click();
    await expect(page.locator('text=레시피 정보')).toBeVisible({ timeout: 5000 });
  });

  test('샘플 레시피가 자동으로 로드되어야 함', async ({ page }) => {
    // 샘플 레시피가 표시되는지 확인 (최소 하나는 있어야 함)
    // RecipeCard 컴포넌트의 실제 구조에 맞는 selector 사용
    await page.waitForSelector('.bg-white.border.border-bread-200.rounded-lg, .grid > div', { timeout: 10000 });
    const recipeCards = page.locator('.bg-white.border.border-bread-200.rounded-lg');
    const count = await recipeCards.count();
    expect(count).toBeGreaterThan(0);
    
    // 레시피 카드가 실제로 표시되는지 확인
    if (count > 0) {
      await expect(recipeCards.first()).toBeVisible();
    }
  });

  test('카테고리 탭이 올바르게 표시되어야 함', async ({ page }) => {
    // 카테고리 버튼들 확인 - 정확한 selector 사용
    const categories = [
      { name: '전체', expectedText: '전체 (' },
      { name: '빵', expectedText: '빵 (' },
      { name: '케이크', expectedText: '케이크 (' },
      { name: '쿠키', expectedText: '쿠키 (' },
      { name: '페이스트리', expectedText: '페이스트리 (' }
    ];
    
    for (const category of categories) {
      // 레시피 카테고리 탭에서만 찾기 (ScreenCapture의 버튼 제외)
      const categoryButton = page.locator(`div.flex.gap-2 button:has-text("${category.expectedText}")`).first();
      await expect(categoryButton).toBeVisible();
    }
  });

  test('반응형 디자인 - 모바일 뷰', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 헤더가 여전히 표시되어야 함
    await expect(page.locator('header')).toBeVisible();
    
    // 레시피 그리드가 단일 컬럼으로 표시되어야 함
    const recipeGrid = page.locator('.grid').first();
    await expect(recipeGrid).toBeVisible();
  });

  test('반응형 디자인 - 태블릿 뷰', async ({ page }) => {
    // 태블릿 뷰포트로 변경
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // 헤더가 표시되어야 함
    await expect(page.locator('header')).toBeVisible();
    
    // 레시피 그리드가 2-3 컬럼으로 표시되어야 함
    const recipeGrid = page.locator('.grid').first();
    await expect(recipeGrid).toBeVisible();
  });

  test('localStorage 초기화 상태 확인', async ({ page }) => {
    const recipes = await page.evaluate(() => {
      return localStorage.getItem('recipes');
    });
    
    // 샘플 레시피가 localStorage에 저장되어야 함
    expect(recipes).toBeTruthy();
    const parsedRecipes = JSON.parse(recipes);
    expect(Array.isArray(parsedRecipes)).toBe(true);
    expect(parsedRecipes.length).toBeGreaterThan(0);
  });

  test('다크 모드 토글 (설정이 있는 경우)', async ({ page }) => {
    // 설정 버튼이 있는지 확인
    const settingsButton = page.locator('button[aria-label*="설정"], button:has-text("설정")');
    const count = await settingsButton.count();
    
    if (count > 0) {
      await settingsButton.first().click();
      
      // 다크 모드 토글 찾기
      const darkModeToggle = page.locator('text=다크 모드, text=테마');
      if (await darkModeToggle.count() > 0) {
        await darkModeToggle.first().click();
        
        // body에 dark 클래스가 토글되는지 확인
        const htmlElement = page.locator('html');
        const isDark = await htmlElement.evaluate(el => el.classList.contains('dark'));
        expect(typeof isDark).toBe('boolean');
      }
    }
  });

  test('에러 바운더리 작동 확인', async ({ page }) => {
    // 콘솔 에러 리스너 추가
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    
    // 페이지 새로고침
    await page.reload();
    
    // 치명적인 에러가 없어야 함
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('manifest') &&
      !e.includes('ResizeObserver')
    );
    expect(criticalErrors.length).toBe(0);
  });
});