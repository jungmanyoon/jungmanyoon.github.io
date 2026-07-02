/**
 * Zustand 계산기 스토어
 * 모든 계산 기능 상태 관리
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { 
  CalculatorStore, 
  CalculatorType,
  BakersPercentageState,
  DDTState,
  YieldState,
  PanConversionState,
  MethodConversionState
} from '@/types/store.types'

const initialBakersPercentage: BakersPercentageState = {
  flourAmount: 1000,
  ingredients: [],
  totalHydration: 0,
  totalPercentage: 100,
  results: null
}

const initialDDT: DDTState = {
  targetTemp: 25,
  flourTemp: 20,
  roomTemp: 22,
  // 섭씨 물온도 DDT 공식 전용 기본값 (스탠드 믹서 FRICTION_FACTORS_CELSIUS.stand = 8)
  // 기존 화씨 기본값 24 를 그대로 섭씨 공식에 넣으면 물온도가 비현실적으로 낮아짐(C-5 결함)
  frictionFactor: 8,
  includePreferment: false,
  results: null
}

const initialYield: YieldState = {
  originalYield: 1,
  targetYield: 1,
  ingredients: [],
  scaleFactor: 1,
  results: null
}

const initialPanConversion: PanConversionState = {
  originalPan: null,
  targetPan: null,
  recipe: null,
  results: null
}

const initialMethodConversion: MethodConversionState = {
  originalMethod: 'straight',
  targetMethod: 'sponge',
  recipe: null,
  results: null
}

export const useCalculatorStore = create<CalculatorStore>()(
  devtools(
    (set) => ({
      // 상태
      bakersPercentage: initialBakersPercentage,
      ddtCalculation: initialDDT,
      yieldCalculation: initialYield,
      panConversion: initialPanConversion,
      methodConversion: initialMethodConversion,

      // 액션
      updateBakersPercentage: (data) => {
        set((state) => ({
          bakersPercentage: { ...state.bakersPercentage, ...data }
        }))
      },

      updateDDT: (data) => {
        set((state) => ({
          ddtCalculation: { ...state.ddtCalculation, ...data }
        }))
      },

      updateYield: (data) => {
        set((state) => ({
          yieldCalculation: { ...state.yieldCalculation, ...data }
        }))
      },

      updatePanConversion: (data) => {
        set((state) => ({
          panConversion: { ...state.panConversion, ...data }
        }))
      },

      updateMethodConversion: (data) => {
        set((state) => ({
          methodConversion: { ...state.methodConversion, ...data }
        }))
      },

      resetCalculator: (type: CalculatorType) => {
        switch (type) {
          case 'bakersPercentage':
            set({ bakersPercentage: initialBakersPercentage })
            break
          case 'ddt':
            set({ ddtCalculation: initialDDT })
            break
          case 'yield':
            set({ yieldCalculation: initialYield })
            break
          case 'pan':
            set({ panConversion: initialPanConversion })
            break
          case 'method':
            set({ methodConversion: initialMethodConversion })
            break
        }
      }
    }),
    {
      name: 'CalculatorStore'
    }
  )
)