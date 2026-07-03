/**
 * yieldLoss 수율 손실 계산 단위 테스트
 * 손으로 계산한 정확한 기대값 + 경계 케이스
 */

import { describe, it, expect } from 'vitest'
import {
  calculateYieldLoss,
  calculateEnvironmentAdjustment,
  calculateRequiredInput,
  getYieldSummary,
  DEFAULT_LOSS_RATES,
  type ProcessStageSelection
} from '@utils/calculations/yieldLoss'

describe('calculateYieldLoss', () => {
  it('bread 기본 손실률로 단계별 순차 손실을 계산한다', () => {
    // input 1000g, bread 기본: mixing2, ferment1, dividing1.5, shaping1, baking12, cooling2
    // mixing:  round(1000*0.02)=20  -> 980
    // ferment: round(980*0.01)=10   -> 970
    // dividing:round(970*0.015)=15  -> 955
    // shaping: round(955*0.01)=10   -> 945
    // baking:  round(945*0.12)=113  -> 832
    // cooling: round(832*0.02)=17   -> 815
    const result = calculateYieldLoss(1000, 'bread')

    expect(result.outputWeight).toBe(815)
    expect(result.totalLossWeight).toBe(185)
    expect(result.totalLossPercent).toBe(18.5)
    expect(result.yieldPercent).toBe(81.5)
    expect(result.processLosses).toHaveLength(6)
    expect(result.processLosses[0]).toMatchObject({ stage: '믹싱', lossWeight: 20, remainingWeight: 980 })
    expect(result.processLosses[4]).toMatchObject({ stage: '굽기', lossWeight: 113, remainingWeight: 832 })
    expect(Array.isArray(result.tips)).toBe(true)
  })

  it('cake는 손실률 0인 공정(발효/분할/성형)을 건너뛴다', () => {
    // cake: mixing3, ferment0, dividing0, shaping0, baking15, cooling1.5
    // 활성 공정은 mixing, baking, cooling 3개뿐
    // mixing:  round(1000*0.03)=30  -> 970
    // baking:  round(970*0.15)=146  -> 824
    // cooling: round(824*0.015)=12  -> 812
    const result = calculateYieldLoss(1000, 'cake')

    expect(result.processLosses).toHaveLength(3)
    expect(result.processLosses.map(p => p.stage)).toEqual(['믹싱', '굽기', '냉각'])
    expect(result.outputWeight).toBe(812)
  })

  it('제품별 조정(pullman 굽기 10%)이 기본값을 덮어쓴다', () => {
    // bread + pullman: baking 12 -> 10 으로 조정
    const base = calculateYieldLoss(1000, 'bread')
    const pullman = calculateYieldLoss(1000, 'bread', 'pullman')
    // 굽기 손실이 줄어 최종 산출이 더 많아야 함
    expect(pullman.outputWeight).toBeGreaterThan(base.outputWeight)
    const bakingStage = pullman.processLosses.find(p => p.stage === '굽기')
    expect(bakingStage?.lossPercent).toBe(10)
  })

  it('enabledStages로 특정 공정만 활성화할 수 있다', () => {
    const onlyBaking: ProcessStageSelection = {
      mixing: false,
      fermentation: false,
      dividing: false,
      shaping: false,
      baking: true,
      cooling: false
    }
    // bread baking 12% -> round(1000*0.12)=120 -> 880
    const result = calculateYieldLoss(1000, 'bread', undefined, undefined, onlyBaking)
    expect(result.processLosses).toHaveLength(1)
    expect(result.outputWeight).toBe(880)
  })

  it('환경(건조/고온)은 굽기 손실을 증가시킨다', () => {
    const normal = calculateYieldLoss(1000, 'bread')
    const dryHot = calculateYieldLoss(1000, 'bread', undefined, { humidity: 30, temperature: 35 })
    // 건조+고온 -> 굽기 손실 증가 -> 산출량 감소
    expect(dryHot.outputWeight).toBeLessThan(normal.outputWeight)
  })

  it('입력 0g이면 총손실률/수율이 NaN이 된다(0 나눗셈 경계)', () => {
    const result = calculateYieldLoss(0, 'bread')
    expect(result.outputWeight).toBe(0)
    expect(Number.isNaN(result.totalLossPercent)).toBe(true)
    expect(Number.isNaN(result.yieldPercent)).toBe(true)
  })
})

describe('calculateEnvironmentAdjustment', () => {
  it('빈 환경이면 조정 없음(1.0)', () => {
    expect(calculateEnvironmentAdjustment({})).toBe(1.0)
  })

  it('기준값(습도60/온도25)이면 1.0', () => {
    expect(calculateEnvironmentAdjustment({ humidity: 60, temperature: 25 })).toBeCloseTo(1.0, 6)
  })

  it('습도 40%면 증발 증가(1.1)', () => {
    // (60-40)*0.005 = 0.1 -> 1.1
    expect(calculateEnvironmentAdjustment({ humidity: 40 })).toBeCloseTo(1.1, 6)
  })

  it('습도 80%면 증발 감소(0.9)', () => {
    // (60-80)*0.005 = -0.1 -> 0.9
    expect(calculateEnvironmentAdjustment({ humidity: 80 })).toBeCloseTo(0.9, 6)
  })

  it('온도 35도면 증발 증가(1.1)', () => {
    // (35-25)*0.01 = 0.1 -> 1.1
    expect(calculateEnvironmentAdjustment({ temperature: 35 })).toBeCloseTo(1.1, 6)
  })

  it('조정 계수는 0.8~1.3 범위로 제한된다', () => {
    const extremeHigh = calculateEnvironmentAdjustment({ humidity: 0, temperature: 60 })
    const extremeLow = calculateEnvironmentAdjustment({ humidity: 100, temperature: -40 })
    expect(extremeHigh).toBeLessThanOrEqual(1.3)
    expect(extremeHigh).toBeGreaterThanOrEqual(0.8)
    expect(extremeLow).toBeGreaterThanOrEqual(0.8)
    expect(extremeLow).toBeLessThanOrEqual(1.3)
  })
})

describe('calculateRequiredInput', () => {
  it('목표 산출량에 필요한 투입량을 역산한다', () => {
    // bread 수율 81.5% -> 815g 산출에 필요한 투입 = ceil(815/0.815)
    // 0.815의 부동소수 표현으로 결과는 원본 투입량(1000)을 근사 복원(1000~1001, ceil)
    const required = calculateRequiredInput(815, 'bread')
    expect(required).toBeGreaterThanOrEqual(1000)
    expect(required).toBeLessThanOrEqual(1001)
  })

  it('수율이 100% 미만이면 필요 투입량은 목표보다 크다', () => {
    const required = calculateRequiredInput(1000, 'bread')
    expect(required).toBeGreaterThan(1000)
  })
})

describe('getYieldSummary', () => {
  it('수율 요약 문자열을 생성한다', () => {
    const result = calculateYieldLoss(1000, 'bread')
    const summary = getYieldSummary(result)
    expect(summary).toBe('투입 1000g → 예상 산출 815g (수율 81.5%, 손실 18.5%)')
  })
})

describe('DEFAULT_LOSS_RATES', () => {
  it('모든 카테고리에 6개 공정 손실률이 정의되어 있다', () => {
    const categories = ['bread', 'cake', 'pastry', 'cookie', 'other'] as const
    categories.forEach(cat => {
      const rates = DEFAULT_LOSS_RATES[cat]
      expect(rates).toBeDefined()
      const stages = ['mixing', 'fermentation', 'dividing', 'shaping', 'baking', 'cooling'] as const
      stages.forEach(stage => {
        expect(typeof rates[stage]).toBe('number')
        expect(rates[stage]).toBeGreaterThanOrEqual(0)
      })
    })
  })
})
