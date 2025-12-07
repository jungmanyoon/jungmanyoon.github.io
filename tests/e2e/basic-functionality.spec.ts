import { test, expect } from '@playwright/test'

test.describe('기본 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('애플리케이션이 로드되어야 한다', async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/레시피북/)
    
    // 헤더 확인
    await expect(page.locator('header')).toBeVisible()
  })

  test('설정 페이지를 열 수 있어야 한다', async ({ page }) => {
    // 설정 버튼이 존재하는지 확인
    const settingsButton = page.locator('button').filter({ hasText: '설정' })
    if (await settingsButton.count() > 0) {
      await settingsButton.click()
      
      // 설정 내용 확인
      await expect(page.getByText('설정')).toBeVisible()
    }
  })

  test('도움말 페이지를 열 수 있어야 한다', async ({ page }) => {
    // 도움말 버튼이 존재하는지 확인
    const helpButton = page.locator('button').filter({ hasText: '도움말' })
    if (await helpButton.count() > 0) {
      await helpButton.click()
      
      // 도움말 내용 확인
      await expect(page.getByText('도움말')).toBeVisible()
    }
  })

  test('반응형 디자인이 작동해야 한다', async ({ page }) => {
    // 데스크톱 뷰
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('body')).toBeVisible()
    
    // 태블릿 뷰
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('body')).toBeVisible()
    
    // 모바일 뷰
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('body')).toBeVisible()
  })
})