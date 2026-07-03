/**
 * RealtimeRecipeCalculator 단위 테스트
 * 손으로 계산한 정확한 기대값 + 경계/에러 케이스
 * (leavening 카테고리 이스트 인식 회귀 방지 포함)
 */

import { describe, it, expect } from 'vitest'
import { RealtimeRecipeCalculator, PAN_PRESETS } from '@utils/calculations/realtimeCalculator'
import type { Ingredient, PanConfig, Recipe } from '@/types/recipe.types'

// 최소 재료 팩토리
const ing = (over: Partial<Ingredient> & { id: string }): Ingredient => ({
  name: '',
  category: 'other',
  amount: 0,
  unit: 'g',
  ...over
})

describe('RealtimeRecipeCalculator.calculatePanVolume', () => {
  it('round: pi * r^2 * h', () => {
    const pan = { type: 'round', dimensions: { diameter: 20, height: 10 } } as unknown as PanConfig
    expect(RealtimeRecipeCalculator.calculatePanVolume(pan)).toBeCloseTo(Math.PI * 1000, 4)
  })

  it('square: l * w * h', () => {
    const pan = { type: 'square', dimensions: { length: 10, width: 10, height: 5 } } as unknown as PanConfig
    expect(RealtimeRecipeCalculator.calculatePanVolume(pan)).toBe(500)
  })

  it('loaf: 사다리꼴 보정(0.85) 적용', () => {
    const pan = { type: 'loaf', dimensions: { length: 20, width: 10, height: 10 } } as unknown as PanConfig
    // 20 * 10 * 10 * 0.85 = 1700
    expect(RealtimeRecipeCalculator.calculatePanVolume(pan)).toBe(1700)
  })

  it('pullman: 형상 보정 없음(각형)', () => {
    const pan = { type: 'pullman', dimensions: { length: 20, width: 10, height: 10 } } as unknown as PanConfig
    // 20 * 10 * 10 * 1.0 = 2000
    expect(RealtimeRecipeCalculator.calculatePanVolume(pan)).toBe(2000)
  })

  it('tube/bundt: 외경 - 내경(내경 40%)', () => {
    const pan = { type: 'tube', dimensions: { diameter: 20, height: 10 } } as unknown as PanConfig
    // 외경 pi*10^2*10, 내경 pi*4^2*10 -> pi*840
    expect(RealtimeRecipeCalculator.calculatePanVolume(pan)).toBeCloseTo(Math.PI * 840, 4)
  })

  it('dimensions가 없으면 기본값 1000 반환', () => {
    const pan = { type: 'round' } as unknown as PanConfig
    expect(RealtimeRecipeCalculator.calculatePanVolume(pan)).toBe(1000)
  })

  it('필수 치수(지름)가 누락되면 기본값 1000 반환', () => {
    const pan = { type: 'round', dimensions: { height: 10 } } as unknown as PanConfig
    expect(RealtimeRecipeCalculator.calculatePanVolume(pan)).toBe(1000)
  })

  it('알 수 없는 타입이면 기본값 1000 반환', () => {
    const pan = { type: 'nonsense', dimensions: { length: 1, width: 1, height: 1 } } as unknown as PanConfig
    expect(RealtimeRecipeCalculator.calculatePanVolume(pan)).toBe(1000)
  })
})

describe('RealtimeRecipeCalculator.scaleIngredients / scaleByMultiplier', () => {
  it('배율을 적용하고 소수 첫째자리로 반올림한다', () => {
    const list = [ing({ id: 'a', amount: 100 }), ing({ id: 'b', amount: 50 })]
    const scaled = RealtimeRecipeCalculator.scaleIngredients(list, 2)
    expect(scaled[0].amount).toBe(200)
    expect(scaled[1].amount).toBe(100)
  })

  it('amount가 없으면 0으로 처리한다', () => {
    const list = [ing({ id: 'x' })] // amount 기본 0
    const missing = [{ id: 'y', name: '', category: 'other', unit: 'g' } as unknown as Ingredient]
    expect(RealtimeRecipeCalculator.scaleIngredients(list, 2)[0].amount).toBe(0)
    expect(RealtimeRecipeCalculator.scaleIngredients(missing, 2)[0].amount).toBe(0)
  })

  it('scaleByMultiplier는 scaleIngredients와 동일하게 동작한다', () => {
    const list = [ing({ id: 'a', amount: 33.33 })]
    // round(33.33 * 1 * 10) / 10 = 33.3
    expect(RealtimeRecipeCalculator.scaleByMultiplier(list, 1)[0].amount).toBe(33.3)
  })
})

describe('RealtimeRecipeCalculator.recalculateForPan', () => {
  it('원본/신규 팬 부피 비율로 재료를 스케일한다', () => {
    const recipe = {
      panConfig: { type: 'loaf', dimensions: { length: 20, width: 10, height: 10 } },
      ingredients: [ing({ id: 'a', amount: 100 })]
    } as unknown as Recipe
    // 원본 1700, 신규 3400 -> 배율 2
    const newPan = { type: 'loaf', dimensions: { length: 20, width: 10, height: 20 } } as unknown as PanConfig
    const result = RealtimeRecipeCalculator.recalculateForPan(recipe, newPan)
    expect(result[0].amount).toBe(200)
  })

  it('panConfig가 없으면 재료를 그대로 반환한다', () => {
    const recipe = { ingredients: [ing({ id: 'a', amount: 100 })] } as unknown as Recipe
    const newPan = { type: 'loaf', dimensions: { length: 20, width: 10, height: 20 } } as unknown as PanConfig
    const result = RealtimeRecipeCalculator.recalculateForPan(recipe, newPan)
    expect(result[0].amount).toBe(100)
  })
})

describe('RealtimeRecipeCalculator.convertToSpongeMethod', () => {
  const buildRecipe = (yeastName: string): Recipe => ({
    ingredients: [
      ing({ id: 'f', category: 'flour', name: '강력분', amount: 1000 }),
      ing({ id: 'w', name: '물', amount: 650 }),
      ing({ id: 'y', category: 'leavening', name: yeastName, amount: 10 }),
      ing({ id: 's', category: 'salt', name: '소금', amount: 20 })
    ]
  } as unknown as Recipe)

  it('스펀지 비율 0.4로 밀가루/물/이스트를 분리한다', () => {
    const result = RealtimeRecipeCalculator.convertToSpongeMethod(buildRecipe('이스트'), 0.4)
    // spongeFlour = 400, spongeWater = 400*0.6 = 240, spongeYeast = 10
    expect(result.preferment.ingredients[0].amount).toBe(400)
    expect(result.preferment.ingredients[1].amount).toBe(240)
    expect(result.preferment.ingredients[2].amount).toBe(10)
    // mainFlour = 600, mainWater = 650-240 = 410, + 소금
    expect(result.mainDough.ingredients[0].amount).toBe(600)
    expect(result.mainDough.ingredients[1].amount).toBe(410)
    expect(result.mainDough.ingredients.find(i => i.id === 's')?.amount).toBe(20)
    expect(result.notes.some(n => n.includes('40%'))).toBe(true)
  })

  it('회귀 방지: 이름에 "이스트"가 없어도 category=leavening이면 인식한다', () => {
    // 구 버그(category==='yeast')였다면 여기서 throw 발생
    const recipe = buildRecipe('saf 인스턴트')
    expect(() => RealtimeRecipeCalculator.convertToSpongeMethod(recipe)).not.toThrow()
    const result = RealtimeRecipeCalculator.convertToSpongeMethod(recipe)
    expect(result.preferment.ingredients[2].amount).toBe(10) // 이스트 전량 스펀지로
  })

  it('밀가루/물/이스트 중 하나라도 없으면 throw', () => {
    const noYeast = {
      ingredients: [
        ing({ id: 'f', category: 'flour', name: '강력분', amount: 1000 }),
        ing({ id: 'w', name: '물', amount: 650 })
      ]
    } as unknown as Recipe
    expect(() => RealtimeRecipeCalculator.convertToSpongeMethod(noYeast))
      .toThrow('밀가루, 물, 이스트를 찾을 수 없습니다.')
  })
})

describe('RealtimeRecipeCalculator.convertToPolishMethod', () => {
  const recipe = {
    ingredients: [
      ing({ id: 'f', category: 'flour', name: '강력분', amount: 1000 }),
      ing({ id: 'w', name: '물', amount: 650 }),
      ing({ id: 'y', category: 'leavening', name: '이스트', amount: 10 })
    ]
  } as unknown as Recipe

  it('폴리시 비율 0.25로 밀가루/물/이스트를 분리한다(폴리시=밀가루+동량 물, 100% 수화율)', () => {
    const result = RealtimeRecipeCalculator.convertToPolishMethod(recipe, 0.25)
    // polishFlour = 1000*0.25 = 250, polishWater = polishFlour = 250, polishYeast = 10*0.2 = 2
    expect(result.preferment.ingredients[0].amount).toBe(250) // 밀가루
    expect(result.preferment.ingredients[1].amount).toBe(250) // 물(동량, 100% 수화율)
    expect(result.preferment.ingredients[2].amount).toBe(2)   // 이스트
    // 본반죽: mainFlour = 1000-250 = 750, mainWater = 650-250 = 400, mainYeast = 10-2 = 8
    expect(result.mainDough.ingredients[0].amount).toBe(750)
    expect(result.mainDough.ingredients[1].amount).toBe(400)
    expect(result.mainDough.ingredients[2].amount).toBe(8)
  })

  it('재료 부족 시 throw', () => {
    const bad = { ingredients: [ing({ id: 'w', name: '물', amount: 650 })] } as unknown as Recipe
    expect(() => RealtimeRecipeCalculator.convertToPolishMethod(bad))
      .toThrow('밀가루, 물, 이스트를 찾을 수 없습니다.')
  })
})

describe('RealtimeRecipeCalculator - 퍼센트/총량', () => {
  const list = [
    ing({ id: 'f', category: 'flour', name: '강력분', amount: 1000 }),
    ing({ id: 'w', name: '물', amount: 650 })
  ]

  it('calculateBakersPercentage: 밀가루=100%, 물=65%', () => {
    const result = RealtimeRecipeCalculator.calculateBakersPercentage(list)
    expect(result[0].bakersPercentage).toBe(100)
    expect(result[1].bakersPercentage).toBe(65)
  })

  it('calculateBakersPercentage: 밀가루가 없으면 그대로 반환(0 나눗셈 방지)', () => {
    const noFlour = [ing({ id: 'w', name: '물', amount: 100 })]
    const result = RealtimeRecipeCalculator.calculateBakersPercentage(noFlour)
    expect(result[0].bakersPercentage).toBeUndefined()
  })

  it('calculateWeightPercentage: 총 반죽량 대비 비율', () => {
    // total 1650 -> flour round(60.606)=60.6, water round(39.39)=39.4
    const result = RealtimeRecipeCalculator.calculateWeightPercentage(list)
    expect((result[0] as any).weightPercentage).toBe(60.6)
    expect((result[1] as any).weightPercentage).toBe(39.4)
  })

  it('calculateWeightPercentage: 총량 0이면 그대로 반환', () => {
    const zero = [ing({ id: 'a', amount: 0 })]
    const result = RealtimeRecipeCalculator.calculateWeightPercentage(zero)
    expect((result[0] as any).weightPercentage).toBeUndefined()
  })

  it('calculateTotalWeight: 합산 후 반올림', () => {
    expect(RealtimeRecipeCalculator.calculateTotalWeight(list)).toBe(1650)
    expect(RealtimeRecipeCalculator.calculateTotalWeight([])).toBe(0)
    expect(RealtimeRecipeCalculator.calculateTotalWeight([
      ing({ id: 'a', amount: 100 }),
      { id: 'b', name: '', category: 'other', unit: 'g' } as unknown as Ingredient
    ])).toBe(100)
  })
})

describe('PAN_PRESETS', () => {
  it('주요 팬 프리셋이 정의되어 있다', () => {
    expect(PAN_PRESETS.small).toBeDefined()
    expect(PAN_PRESETS.medium.type).toBe('loaf')
    expect(PAN_PRESETS.pullman.type).toBe('pullman')
    expect(Object.keys(PAN_PRESETS).length).toBeGreaterThanOrEqual(6)
  })
})
