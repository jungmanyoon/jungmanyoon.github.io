import { test, expect } from '@playwright/test';

test.describe('디버깅 테스트', () => {
  test('앱 구조 확인', async ({ page }) => {
    await page.goto('/');
    
    // 페이지 타이틀
    const title = await page.title();
    console.log('페이지 타이틀:', title);
    
    // 모든 h1 태그
    const h1Elements = await page.locator('h1').allTextContents();
    console.log('H1 요소들:', h1Elements);
    
    // 모든 h2 태그
    const h2Elements = await page.locator('h2').allTextContents();
    console.log('H2 요소들:', h2Elements);
    
    // 모든 버튼 텍스트
    const buttons = await page.locator('button').allTextContents();
    console.log('버튼들:', buttons);
    
    // 전체 HTML 구조 출력 (주요 부분만)
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('Body HTML (첫 500자):', bodyHTML.substring(0, 500));
    
    // 스크린샷 저장
    await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
    console.log('스크린샷 저장됨: debug-screenshot.png');
    
    // localStorage 확인
    const localStorageData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });
    console.log('localStorage 키들:', Object.keys(localStorageData));
    
    // 테스트 실패하지 않도록
    expect(true).toBe(true);
  });
});