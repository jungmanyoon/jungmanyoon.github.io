import { test, expect } from '@playwright/test';

test.describe('에디터 디버깅', () => {
  test('레시피 에디터 구조 확인', async ({ page }) => {
    await page.goto('/');
    
    // 새 레시피 버튼 클릭
    await page.locator('button:has-text("새 레시피")').click();
    
    // 1초 대기
    await page.waitForTimeout(1000);
    
    // 현재 URL 확인
    const url = page.url();
    console.log('현재 URL:', url);
    
    // 모든 h1, h2, h3 확인
    const h1 = await page.locator('h1').allTextContents();
    const h2 = await page.locator('h2').allTextContents();
    const h3 = await page.locator('h3').allTextContents();
    console.log('H1:', h1);
    console.log('H2:', h2);
    console.log('H3:', h3);
    
    // input 필드들 확인
    const inputs = await page.locator('input').evaluateAll(elements => 
      elements.map(el => ({
        placeholder: el.placeholder,
        type: el.type,
        name: el.name,
        id: el.id
      }))
    );
    console.log('Input 필드들:', inputs);
    
    // 버튼들 확인
    const buttons = await page.locator('button').allTextContents();
    console.log('버튼들:', buttons);
    
    // 스크린샷
    await page.screenshot({ path: 'debug-editor.png', fullPage: true });
    console.log('에디터 스크린샷 저장됨: debug-editor.png');
    
    expect(true).toBe(true);
  });
});