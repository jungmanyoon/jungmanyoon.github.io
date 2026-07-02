/**
 * PanScalingTS 및 팬닝 계산 함수 단위 테스트
 * 손으로 계산한 정확한 기대값 + 경계/에러 케이스
 */

import { describe, it, expect } from 'vitest'
import {
  PanScalingTS,
  calculateRecommendedPanningWeight,
  calculateRecommendedPanVolume,
  validatePanning,
  LOAF_TRAPEZOID_FACTOR,
  PULLMAN_SHAPE_FACTOR,
  type PanConfigTS
} from '@utils/calculations/panScaling'

describe('PanScalingTS - 부피 계산', () => {
  describe('calculateRoundPanVolume', () => {
    it('원형 팬 부피 = pi * r^2 * h', () => {
      // diameter 20, height 10 -> pi * 10^2 * 10 = 1000pi
      const volume = PanScalingTS.calculateRoundPanVolume(20, 10)
      expect(volume).toBeCloseTo(Math.PI * 1000, 4)
    })

    it('지름 0이면 부피 0', () => {
      expect(PanScalingTS.calculateRoundPanVolume(0, 10)).toBe(0)
    })
  })

  describe('calculateSquarePanVolume', () => {
    it('사각 팬 부피 = l * w * h', () => {
      expect(PanScalingTS.calculateSquarePanVolume(10, 10, 5)).toBe(500)
    })

    it('한 변이 0이면 부피 0', () => {
      expect(PanScalingTS.calculateSquarePanVolume(0, 10, 5)).toBe(0)
    })
  })

  describe('calculateLoafPanVolume', () => {
    it('식빵틀(사다리꼴) 부피 = ((top+bottom)/2) * w * h', () => {
      // (20 + 15) / 2 = 17.5, * 10 * 8 = 1400
      expect(PanScalingTS.calculateLoafPanVolume(20, 15, 10, 8)).toBe(1400)
    })
  })

  describe('calculateChiffonPanVolume', () => {
    it('시폰 팬 부피 = 외경부피 - 내경부피', () => {
      // 외경 20, 내경 8, 높이 10 -> pi*10^2*10 - pi*4^2*10 = pi*840
      const volume = PanScalingTS.calculateChiffonPanVolume(20, 8, 10)
      expect(volume).toBeCloseTo(Math.PI * 840, 4)
    })
  })

  describe('calculateBoxLoafVolume', () => {
    it('loaf는 사다리꼴 보정계수(0.85)를 적용', () => {
      // 20 * 10 * 10 * 0.85 = 1700
      expect(PanScalingTS.calculateBoxLoafVolume(20, 10, 10, 'loaf')).toBe(1700)
    })

    it('pullman은 형상 보정 없음(계수 1.0)', () => {
      // 20 * 10 * 10 * 1.0 = 2000
      expect(PanScalingTS.calculateBoxLoafVolume(20, 10, 10, 'pullman')).toBe(2000)
    })

    it('panType 기본값은 loaf(0.85 적용)', () => {
      expect(PanScalingTS.calculateBoxLoafVolume(20, 10, 10)).toBe(1700)
    })

    it('보정계수 상수는 loaf=0.85, pullman=1.0', () => {
      expect(LOAF_TRAPEZOID_FACTOR).toBe(0.85)
      expect(PULLMAN_SHAPE_FACTOR).toBe(1.0)
    })
  })

  describe('calculatePanVolume (타입별 분기)', () => {
    it('round 타입', () => {
      const pan: PanConfigTS = { type: 'round', dimensions: { diameter: 20, height: 10 } }
      expect(PanScalingTS.calculatePanVolume(pan)).toBeCloseTo(Math.PI * 1000, 4)
    })

    it('square/rectangular 타입', () => {
      const square: PanConfigTS = { type: 'square', dimensions: { length: 10, width: 10, height: 5 } }
      const rect: PanConfigTS = { type: 'rectangular', dimensions: { length: 20, width: 10, height: 5 } }
      expect(PanScalingTS.calculatePanVolume(square)).toBe(500)
      expect(PanScalingTS.calculatePanVolume(rect)).toBe(1000)
    })

    it('loaf 타입', () => {
      const pan: PanConfigTS = {
        type: 'loaf',
        dimensions: { topLength: 20, bottomLength: 15, width: 10, height: 8 }
      }
      expect(PanScalingTS.calculatePanVolume(pan)).toBe(1400)
    })

    it('chiffon 타입', () => {
      const pan: PanConfigTS = {
        type: 'chiffon',
        dimensions: { outerDiameter: 20, innerDiameter: 8, height: 10 }
      }
      expect(PanScalingTS.calculatePanVolume(pan)).toBeCloseTo(Math.PI * 840, 4)
    })

    it('알 수 없는 타입이면 에러를 던진다', () => {
      const pan = { type: 'unknown', dimensions: {} } as unknown as PanConfigTS
      expect(() => PanScalingTS.calculatePanVolume(pan)).toThrow('알 수 없는 팬 타입')
    })

    it('필수 치수(지름)가 누락되면 NaN을 반환한다(방어 안 됨을 고정)', () => {
      const pan: PanConfigTS = { type: 'round', dimensions: { height: 10 } }
      expect(Number.isNaN(PanScalingTS.calculatePanVolume(pan))).toBe(true)
    })
  })

  describe('weightToVolume / volumeToWeight', () => {
    it('기본 밀도(0.55) 기준 무게<->부피 변환', () => {
      // 550g / 0.55 = 1000ml
      expect(PanScalingTS.weightToVolume(550)).toBeCloseTo(1000, 6)
      // 1000ml * 0.55 = 550g
      expect(PanScalingTS.volumeToWeight(1000)).toBeCloseTo(550, 6)
    })

    it('사용자 지정 밀도 적용', () => {
      expect(PanScalingTS.weightToVolume(550, 0.5)).toBe(1100)
      expect(PanScalingTS.volumeToWeight(1000, 0.5)).toBe(500)
    })
  })
})

describe('팬닝 추천 함수', () => {
  describe('calculateRecommendedPanningWeight', () => {
    it('알려진 제품(pullman) 기준 추천 반죽량 계산', () => {
      // pullman: fillRatio 0.85, specificVolume 3.6
      // usable = 2000 * 0.85 = 1700, weight = round(1700 / 3.6) = 472
      const result = calculateRecommendedPanningWeight(2000, 'pullman')
      expect(result.weight).toBe(472)
      expect(result.tips).toBe('2차 발효시 팬 높이 90%까지')
    })

    it('알 수 없는 제품 타입이면 기본값(부피/3.5) 사용', () => {
      // round(3500 / 3.5) = 1000
      const result = calculateRecommendedPanningWeight(3500, 'unknownProduct' as any)
      expect(result.weight).toBe(1000)
      expect(result.tips).toBeUndefined()
    })
  })

  describe('calculateRecommendedPanVolume', () => {
    it('알려진 제품(pullman) 기준 추천 부피 계산', () => {
      // required = (472 * 3.6) / 0.85 = 1999.05... -> round 1999
      const result = calculateRecommendedPanVolume(472, 'pullman')
      expect(result.volume).toBe(1999)
    })

    it('알 수 없는 제품 타입이면 기본값(무게*3.5) 사용', () => {
      // round(1000 * 3.5) = 3500
      const result = calculateRecommendedPanVolume(1000, 'unknownProduct' as any)
      expect(result.volume).toBe(3500)
    })
  })

  describe('validatePanning', () => {
    it('적정 팬닝량이면 status=ok', () => {
      // 추천량 472g, 동일 투입 -> ratio 1.0
      const result = validatePanning(2000, 472, 'pullman')
      expect(result.status).toBe('ok')
      expect(result.recommendedWeight).toBe(472)
    })

    it('과충전(ratio > 1.15)이면 status=overfill', () => {
      // 600 / 472 = 1.27
      const result = validatePanning(2000, 600, 'pullman')
      expect(result.status).toBe('overfill')
    })

    it('과소충전(ratio < 0.85)이면 status=underfill', () => {
      // 300 / 472 = 0.64
      const result = validatePanning(2000, 300, 'pullman')
      expect(result.status).toBe('underfill')
    })
  })
})
