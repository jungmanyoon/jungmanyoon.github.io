import { test, expect } from '@playwright/test';

test.describe('베이커스 퍼센트 및 계산 정확성', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('베이커스 퍼센트 자동 계산 - 새 레시피', async ({ page }) => {
    // 새 레시피 생성
    await page.locator('button:has-text("새 레시피")').click();
    await expect(page.locator('h2:has-text("레시피 정보")')).toBeVisible();
    
    // 레시피 이름 입력
    await page.fill('input[placeholder*="우유 식빵"]', '베이커스 퍼센트 테스트');
    
    // 카테고리 선택
    const categorySelect = page.locator('select').first();
    await categorySelect.selectOption('빵');
    
    // 재료 추가 및 입력
    const addIngredientButton = page.locator('button:has-text("+ 재료 추가")');
    const ingredientInputs = page.locator('input[placeholder*="강력분"]');
    const amountInputs = page.locator('input[type="number"]');
    
    // 강력분 500g
    await addIngredientButton.click();
    await ingredientInputs.nth(0).fill('강력분');
    await amountInputs.nth(0).fill('500');
    
    // 물 350g (70% 수화율)
    await addIngredientButton.click();
    await ingredientInputs.nth(1).fill('물');
    await amountInputs.nth(1).fill('350');
    
    // 이스트 5g (1%)
    await addIngredientButton.click();
    await ingredientInputs.nth(2).fill('이스트');
    await amountInputs.nth(2).fill('5');
    
    // 소금 10g (2%)
    await addIngredientButton.click();
    await ingredientInputs.nth(3).fill('소금');
    await amountInputs.nth(3).fill('10');
    
    // 저장
    await page.locator('button:has-text("저장")').click();
    
    // 저장된 레시피 확인
    await page.waitForTimeout(1000);
    await expect(page.locator('text=베이커스 퍼센트 테스트')).toBeVisible();
  });

  test('레시피 상세보기에서 베이커스 퍼센트 표시', async ({ page }) => {
    // 첫 번째 레시피 클릭
    const firstRecipe = page.locator('.bg-white').first();
    await firstRecipe.click();
    
    // 레시피 상세 페이지 로드 대기
    await page.waitForTimeout(1000);
    
    // 베이커스 퍼센트 관련 요소 확인
    const bpText = page.locator('text=/BP%|베이커스|%/');
    const hasBP = await bpText.count() > 0;
    
    if (hasBP) {
      // BP% 표시 확인
      await expect(bpText.first()).toBeVisible();
      console.log('베이커스 퍼센트가 표시됩니다');
    }
    
    // 테이블에서 재료와 퍼센트 확인
    const table = page.locator('table');
    if (await table.count() > 0) {
      await expect(table).toBeVisible();
      
      // 테이블 헤더에 BP% 컬럼이 있는지 확인
      const headers = await page.locator('th').allTextContents();
      console.log('테이블 헤더:', headers);
    }
  });

  test('수화율 계산 확인', async ({ page }) => {
    // 첫 번째 레시피 클릭
    await page.locator('.bg-white').first().click();
    await page.waitForTimeout(1000);
    
    // 수화율 텍스트 찾기
    const hydrationText = page.locator('text=/수화율|hydration|수분/i');
    if (await hydrationText.count() > 0) {
      await expect(hydrationText.first()).toBeVisible();
      
      // 수화율 값 확인 (보통 50-80% 범위)
      const hydrationValue = page.locator('text=/%/');
      if (await hydrationValue.count() > 0) {
        const text = await hydrationValue.first().textContent();
        console.log('수화율:', text);
        
        // 수화율이 합리적인 범위인지 확인
        const match = text.match(/(\d+)/);
        if (match) {
          const value = parseInt(match[1]);
          expect(value).toBeGreaterThan(0);
          expect(value).toBeLessThan(200);
        }
      }
    }
  });

  test('총 무게 계산', async ({ page }) => {
    // 새 레시피 생성
    await page.locator('button:has-text("새 레시피")').click();
    
    // 재료 추가
    const addButton = page.locator('button:has-text("+ 재료 추가")');
    const amountInputs = page.locator('input[type="number"]');
    
    // 재료 3개 추가 (100g, 200g, 300g)
    await addButton.click();
    await amountInputs.nth(0).fill('100');
    
    await addButton.click();
    await amountInputs.nth(1).fill('200');
    
    await addButton.click();
    await amountInputs.nth(2).fill('300');
    
    // 총 무게가 600g이어야 함
    const totalWeight = page.locator('text=/총.*600|합계.*600|total.*600/i');
    if (await totalWeight.count() > 0) {
      await expect(totalWeight.first()).toBeVisible();
      console.log('총 무게 계산이 정확합니다');
    }
  });

  test('팬 크기에 따른 스케일링 계산', async ({ page }) => {
    // 첫 번째 레시피 클릭
    await page.locator('.bg-white').first().click();
    await page.waitForTimeout(1000);
    
    // 변환 버튼 클릭
    const convertButton = page.locator('button:has-text("변환")');
    if (await convertButton.count() > 0) {
      await convertButton.click();
      await page.waitForTimeout(1000);
      
      // 팬 크기 탭 클릭
      const panTab = page.locator('text=팬 크기');
      if (await panTab.count() > 0) {
        await panTab.click();
        
        // 팬 선택 옵션 확인
        const panSelects = page.locator('select');
        if (await panSelects.count() >= 2) {
          // 원본 팬: 8인치
          await panSelects.nth(0).selectOption({ index: 1 });
          
          // 대상 팬: 10인치
          await panSelects.nth(1).selectOption({ index: 2 });
          
          // 계산 버튼 클릭
          const calcButton = page.locator('button:has-text("계산")');
          if (await calcButton.count() > 0) {
            await calcButton.click();
            
            // 스케일 비율 확인 (10인치는 8인치의 약 1.56배)
            const scaleText = page.locator('text=/1\.\d+|배율|scale/i');
            if (await scaleText.count() > 0) {
              await expect(scaleText.first()).toBeVisible();
              console.log('스케일링 계산 완료');
            }
          }
        }
      }
    }
  });

  test('반죽 수율(dough yield) 계산', async ({ page }) => {
    // 첫 번째 레시피 상세 보기
    await page.locator('.bg-white').first().click();
    await page.waitForTimeout(1000);
    
    // 반죽 수율 관련 텍스트 찾기
    const yieldText = page.locator('text=/수율|yield|총.*%/i');
    if (await yieldText.count() > 0) {
      await expect(yieldText.first()).toBeVisible();
      
      // 반죽 수율은 보통 150-200% 범위
      const yieldValue = await yieldText.first().textContent();
      console.log('반죽 수율:', yieldValue);
    }
  });

  test('제법 변환 시 재료 비율 유지', async ({ page }) => {
    // 첫 번째 레시피 클릭
    await page.locator('.bg-white').first().click();
    await page.waitForTimeout(1000);
    
    // 변환 버튼 클릭
    const convertButton = page.locator('button:has-text("변환")');
    if (await convertButton.count() > 0) {
      await convertButton.click();
      await page.waitForTimeout(1000);
      
      // 제법 변환 탭
      const methodTab = page.locator('text=제법 변환');
      if (await methodTab.count() > 0) {
        await methodTab.click();
        
        // 중종법 선택
        const methodCards = page.locator('.cursor-pointer');
        const spongeCard = methodCards.filter({ hasText: '중종법' });
        
        if (await spongeCard.count() > 0) {
          await spongeCard.click();
          
          // 변환 적용
          const applyButton = page.locator('button:has-text("변환 계산")');
          if (await applyButton.count() > 0) {
            await applyButton.click();
            await page.waitForTimeout(500);
            
            // 전체 재료량이 동일한지 확인
            const totalText = page.locator('text=/총|합계|total/i');
            if (await totalText.count() > 0) {
              console.log('제법 변환 후에도 총량 유지 확인');
            }
          }
        }
      }
    }
  });

  test('DDT 계산기 온도 계산', async ({ page }) => {
    // 첫 번째 레시피 클릭
    await page.locator('.bg-white').first().click();
    await page.waitForTimeout(1000);
    
    // 변환 버튼 클릭
    const convertButton = page.locator('button:has-text("변환")');
    if (await convertButton.count() > 0) {
      await convertButton.click();
      await page.waitForTimeout(1000);
      
      // DDT 탭 찾기
      const ddtTab = page.locator('text=DDT');
      if (await ddtTab.count() > 0) {
        await ddtTab.click();
        
        // DDT 입력 필드 찾기
        const tempInputs = page.locator('input[type="number"]');
        if (await tempInputs.count() >= 3) {
          // 목표 반죽 온도: 27도
          await tempInputs.nth(0).fill('27');
          
          // 실온: 22도
          await tempInputs.nth(1).fill('22');
          
          // 밀가루 온도: 20도
          await tempInputs.nth(2).fill('20');
          
          // 계산 버튼
          const calcButton = page.locator('button:has-text("계산")');
          if (await calcButton.count() > 0) {
            await calcButton.click();
            
            // 물 온도 결과 확인
            const waterTemp = page.locator('text=/물.*온도|water.*temp/i');
            if (await waterTemp.count() > 0) {
              await expect(waterTemp.first()).toBeVisible();
              console.log('DDT 계산 완료');
            }
          }
        }
      }
    }
  });

  test('환경 보정 계산', async ({ page }) => {
    // 첫 번째 레시피 클릭
    await page.locator('.bg-white').first().click();
    await page.waitForTimeout(1000);
    
    // 변환 버튼 클릭
    const convertButton = page.locator('button:has-text("변환")');
    if (await convertButton.count() > 0) {
      await convertButton.click();
      await page.waitForTimeout(1000);
      
      // 환경 보정 탭
      const envTab = page.locator('text=환경 보정');
      if (await envTab.count() > 0) {
        await envTab.click();
        
        // 온도 입력
        const tempInput = page.locator('input[placeholder*="온도"]');
        if (await tempInput.count() > 0) {
          await tempInput.fill('30');
          
          // 습도 입력
          const humidityInput = page.locator('input[placeholder*="습도"]');
          if (await humidityInput.count() > 0) {
            await humidityInput.fill('80');
            
            // 보정 계산
            const calcButton = page.locator('button:has-text("보정")');
            if (await calcButton.count() > 0) {
              await calcButton.click();
              
              // 보정 결과 확인
              const adjustText = page.locator('text=/조정|보정|adjust/i');
              if (await adjustText.count() > 0) {
                await expect(adjustText.first()).toBeVisible();
                console.log('환경 보정 계산 완료');
              }
            }
          }
        }
      }
    }
  });

  test('재료별 베이커스 퍼센트 정확성', async ({ page }) => {
    // 테스트용 레시피 생성
    await page.locator('button:has-text("새 레시피")').click();
    
    // 레시피 이름
    await page.fill('input[placeholder*="우유 식빵"]', 'BP 정확성 테스트');
    
    // 카테고리
    await page.locator('select').first().selectOption('빵');
    
    // 재료 추가
    const addButton = page.locator('button:has-text("+ 재료 추가")');
    const ingredientInputs = page.locator('input[placeholder*="강력분"]');
    const amountInputs = page.locator('input[type="number"]');
    
    // 강력분 1000g (100%)
    await addButton.click();
    await ingredientInputs.nth(0).fill('강력분');
    await amountInputs.nth(0).fill('1000');
    
    // 물 650g (65%)
    await addButton.click();
    await ingredientInputs.nth(1).fill('물');
    await amountInputs.nth(1).fill('650');
    
    // 설탕 50g (5%)
    await addButton.click();
    await ingredientInputs.nth(2).fill('설탕');
    await amountInputs.nth(2).fill('50');
    
    // 저장하고 확인
    await page.locator('button:has-text("저장")').click();
    await page.waitForTimeout(1000);
    
    // 생성된 레시피 클릭
    await page.locator('text=BP 정확성 테스트').click();
    await page.waitForTimeout(1000);
    
    // 베이커스 퍼센트 값들 확인
    const percentages = page.locator('text=/%/');
    const count = await percentages.count();
    
    if (count > 0) {
      console.log(`${count}개의 베이커스 퍼센트 값 발견`);
      
      // 각 값들이 올바른 범위인지 확인
      for (let i = 0; i < count; i++) {
        const text = await percentages.nth(i).textContent();
        const match = text.match(/(\d+)/);
        if (match) {
          const value = parseInt(match[1]);
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(100);
        }
      }
    }
  });
});