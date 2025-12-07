import { test, expect } from '@playwright/test';

test.describe('변환 콘솔 디버깅', () => {
  test('변환 콘솔 구조 확인', async ({ page }) => {
    await page.goto('/');
    
    // 첫 번째 레시피 클릭
    const firstRecipe = page.locator('.bg-white.rounded-lg.shadow').first();
    await firstRecipe.click();
    
    // 1초 대기
    await page.waitForTimeout(1000);
    
    // 변환 버튼 찾기 및 클릭
    const convertButton = page.locator('button').filter({ hasText: /변환|conversion|convert/i });
    if (await convertButton.count() > 0) {
      console.log('변환 버튼 찾음');
      await convertButton.first().click();
      await page.waitForTimeout(1000);
    } else {
      console.log('변환 버튼을 찾을 수 없음');
    }
    
    // 현재 URL
    console.log('현재 URL:', page.url());
    
    // 모든 탭/버튼 확인
    const tabs = await page.locator('button, [role="tab"]').allTextContents();
    console.log('탭/버튼들:', tabs);
    
    // h2, h3 제목들
    const h2 = await page.locator('h2').allTextContents();
    const h3 = await page.locator('h3').allTextContents();
    console.log('H2:', h2);
    console.log('H3:', h3);
    
    // select 요소들 확인
    const selects = await page.locator('select').count();
    console.log('Select 요소 개수:', selects);
    
    if (selects > 0) {
      const selectOptions = await page.locator('select').first().locator('option').allTextContents();
      console.log('첫 번째 select 옵션들:', selectOptions);
    }
    
    // 스크린샷
    await page.screenshot({ path: 'debug-conversion.png', fullPage: true });
    console.log('변환 콘솔 스크린샷 저장됨: debug-conversion.png');
    
    expect(true).toBe(true);
  });
});