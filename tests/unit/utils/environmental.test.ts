/**
 * EnvironmentalTS 환경 보정 계산 단위 테스트
 * 손으로 계산한 정확한 기대값 + 경계 케이스
 */

import { describe, it, expect } from 'vitest'
import { EnvironmentalTS } from '@utils/calculations/environmental'

describe('EnvironmentalTS - 기압/끓는점', () => {
  it('해수면(고도 0) 기압은 약 101.3 kPa', () => {
    expect(EnvironmentalTS.calculatePressure(0)).toBeCloseTo(101.3, 1)
  })

  it('고도가 높을수록 기압이 낮아진다', () => {
    expect(EnvironmentalTS.calculatePressure(3000))
      .toBeLessThan(EnvironmentalTS.calculatePressure(0))
  })

  it('해수면 끓는점은 약 100도', () => {
    expect(EnvironmentalTS.calculateBoilingPoint(0)).toBeCloseTo(100, 0)
  })

  it('고도가 높을수록 끓는점이 낮아진다', () => {
    expect(EnvironmentalTS.calculateBoilingPoint(3000))
      .toBeLessThan(EnvironmentalTS.calculateBoilingPoint(0))
  })
})

describe('EnvironmentalTS - 습도에 따른 밀가루/액체 보정', () => {
  it('건조(습도<=40)하면 밀가루/액체를 2% 증량', () => {
    expect(EnvironmentalTS.adjustFlourForHumidity(30, 1000)).toBe(1020)
    expect(EnvironmentalTS.adjustLiquidForHumidity(30, 650)).toBe(663)
  })

  it('습함(습도>=70)하면 밀가루/액체를 2% 감량', () => {
    expect(EnvironmentalTS.adjustFlourForHumidity(80, 1000)).toBe(980)
    expect(EnvironmentalTS.adjustLiquidForHumidity(80, 650)).toBe(637)
  })

  it('중간 습도(41~69)면 그대로 유지', () => {
    expect(EnvironmentalTS.adjustFlourForHumidity(55, 1000)).toBe(1000)
    expect(EnvironmentalTS.adjustLiquidForHumidity(55, 650)).toBe(650)
  })
})

describe('EnvironmentalTS - 온도에 따른 이스트 보정', () => {
  it('기준 온도(26도)면 이스트 변화 없음', () => {
    expect(EnvironmentalTS.adjustYeastForTemperature(26, 10)).toBeCloseTo(10, 2)
    expect(EnvironmentalTS.getTemperatureFactor(26)).toBeCloseTo(1.0, 6)
  })

  it('고온(31도)이면 이스트 감량 (5도 상승 -> 약 7% 감량)', () => {
    // pow(0.93, 5/5) = 0.93 -> 10 * 0.93 = 9.3
    expect(EnvironmentalTS.adjustYeastForTemperature(31, 10)).toBeCloseTo(9.3, 2)
    expect(EnvironmentalTS.getTemperatureFactor(31)).toBeCloseTo(0.93, 2)
  })

  it('저온(21도)이면 이스트 증량 (5도 하강 -> 약 8% 증량)', () => {
    // pow(1.08, 5/5) = 1.08 -> 10 * 1.08 = 10.8
    expect(EnvironmentalTS.adjustYeastForTemperature(21, 10)).toBeCloseTo(10.8, 2)
    expect(EnvironmentalTS.getTemperatureFactor(21)).toBeCloseTo(1.08, 2)
  })
})

describe('EnvironmentalTS - 고도에 따른 이스트 보정', () => {
  it('구간별 고도 계수', () => {
    expect(EnvironmentalTS.getAltitudeFactor(0)).toBe(1.0)
    expect(EnvironmentalTS.getAltitudeFactor(500)).toBe(1.0)
    expect(EnvironmentalTS.getAltitudeFactor(1000)).toBe(0.92)
    expect(EnvironmentalTS.getAltitudeFactor(1600)).toBe(0.80)
    expect(EnvironmentalTS.getAltitudeFactor(2200)).toBe(0.75)
  })

  it('adjustYeastForAltitude는 계수를 적용한다', () => {
    // 1000m -> 0.92 -> 10 * 0.92 = 9.2
    expect(EnvironmentalTS.adjustYeastForAltitude(1000, 10)).toBeCloseTo(9.2, 2)
  })
})

describe('EnvironmentalTS - 습도에 따른 이스트 보정', () => {
  it('구간별 습도 계수', () => {
    expect(EnvironmentalTS.getHumidityFactor(30)).toBe(1.05)
    expect(EnvironmentalTS.getHumidityFactor(55)).toBe(1.0)
    expect(EnvironmentalTS.getHumidityFactor(80)).toBe(0.95)
  })

  it('adjustYeastForHumidity는 계수를 적용한다', () => {
    expect(EnvironmentalTS.adjustYeastForHumidity(30, 10)).toBeCloseTo(10.5, 2)
    expect(EnvironmentalTS.adjustYeastForHumidity(80, 10)).toBeCloseTo(9.5, 2)
  })
})

describe('EnvironmentalTS - 저온발효 계수', () => {
  it('발효시간 0 이하면 감량 없음(1.0)', () => {
    expect(EnvironmentalTS.getColdFermentFactor(0)).toBe(1.0)
    expect(EnvironmentalTS.getColdFermentFactor(-5)).toBe(1.0)
  })

  it('4도 냉장 발효 시간대별 계수', () => {
    // tempBase(4도)=0.30
    expect(EnvironmentalTS.getColdFermentFactor(10, 4)).toBeCloseTo(0.45, 6) // <=12h: +0.15
    expect(EnvironmentalTS.getColdFermentFactor(20, 4)).toBeCloseTo(0.35, 6) // <=24h: +0.05
    expect(EnvironmentalTS.getColdFermentFactor(40, 4)).toBeCloseTo(0.30, 6) // <=48h: +0
    expect(EnvironmentalTS.getColdFermentFactor(72, 4)).toBeCloseTo(0.25, 6) // >48h: -0.05
  })

  it('발효 온도가 높을수록 감량 폭이 작다(계수가 큼)', () => {
    const at4 = EnvironmentalTS.getColdFermentFactor(10, 4)
    const at8 = EnvironmentalTS.getColdFermentFactor(10, 8)
    expect(at8).toBeGreaterThan(at4)
  })
})

describe('EnvironmentalTS - 통합 이스트 조정', () => {
  it('기본 조건(모두 기준값)이면 조정 없음', () => {
    const result = EnvironmentalTS.calculateIntegratedYeastAdjustment({ baseYeast: 10 })
    expect(result.adjustedYeast).toBeCloseTo(10, 2)
    expect(result.totalFactor).toBeCloseTo(1.0, 3)
  })

  it('제법 비율(0.5)이 적용된다', () => {
    const result = EnvironmentalTS.calculateIntegratedYeastAdjustment({
      baseYeast: 100,
      methodYeastRatio: 0.5
    })
    expect(result.adjustedYeast).toBeCloseTo(50, 2)
    expect(result.factors.method).toBe(0.5)
  })

  it('고도 2100m면 -25% 적용', () => {
    const result = EnvironmentalTS.calculateIntegratedYeastAdjustment({
      baseYeast: 100,
      altitude: 2100
    })
    expect(result.adjustedYeast).toBeCloseTo(75, 2)
    expect(result.factors.altitude).toBe(0.75)
  })

  it('저온발효 제법은 전용 계수를 쓰고 환경 온도 조정을 제외한다', () => {
    const result = EnvironmentalTS.calculateIntegratedYeastAdjustment({
      baseYeast: 10,
      methodType: 'coldFerment',
      fermentationHours: 24,
      temperature: 4
    })
    // coldFermentFactor(24,4)=0.35, humidity/altitude=1 -> 10*0.35=3.5
    expect(result.adjustedYeast).toBeCloseTo(3.5, 2)
    expect(result.factors.coldFerment).toBeCloseTo(0.35, 6)
    // 저온발효 제법은 tempFactor를 1.0으로 유지(중복 방지)
    expect(result.factors.temperature).toBe(1.0)
    expect(result.explanation.some(e => e.includes('저온발효 제법'))).toBe(true)
  })
})

describe('EnvironmentalTS - adjustRecipeForEnvironment', () => {
  const baseRecipe = {
    ingredients: [
      { type: 'flour', amount: 1000 },
      { type: 'liquid', amount: 650 },
      { type: 'yeast', amount: 10 }
    ],
    bakingTemp: 200,
    bakingTime: 30
  }

  it('습도/온도에 따라 재료를 보정하고 조정 메타를 첨부한다', () => {
    const adjusted = EnvironmentalTS.adjustRecipeForEnvironment(baseRecipe, {
      temp: 26,
      humidity: 30,
      altitude: 0
    })
    expect(adjusted.ingredients[0].amount).toBe(1020) // flour 건조 +2%
    expect(adjusted.ingredients[1].amount).toBe(663)  // liquid 건조 +2%
    expect(adjusted.ingredients[2].amount).toBeCloseTo(10, 2) // yeast 26도 변화 없음
    expect(adjusted.bakingTemp).toBe(200) // 저고도 -> 굽기온도 유지
    expect(adjusted.adjustments).toBeDefined()
    expect(adjusted.adjustments.temperature.boilingPoint).toBeDefined()
  })

  it('원본 recipe를 변형하지 않는다(deep clone)', () => {
    const adjusted = EnvironmentalTS.adjustRecipeForEnvironment(baseRecipe, {
      temp: 26,
      humidity: 30,
      altitude: 0
    })
    expect(baseRecipe.ingredients[0].amount).toBe(1000) // 원본 유지
    expect(adjusted).not.toBe(baseRecipe)
  })

  it('고도 1000m 초과면 굽기 온도/시간을 상향한다', () => {
    const adjusted = EnvironmentalTS.adjustRecipeForEnvironment(baseRecipe, {
      temp: 26,
      humidity: 55,
      altitude: 1500
    })
    expect(adjusted.bakingTemp).toBe(210) // +10도
    expect(adjusted.bakingTime).toBe(33)  // *1.1
  })
})
