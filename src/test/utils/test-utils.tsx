import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'

// 커스텀 렌더링 함수
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    // wrapper를 추가하려면 여기에 Provider 래핑
    ...options,
  })
}

// Mock 데이터 생성 함수들
export const createMockRecipe = (overrides = {}) => ({
  id: 'test-recipe-1',
  name: '테스트 빵',
  nameKo: '테스트 빵',
  category: 'bread' as const,
  type: 'yeast' as const,
  difficulty: 'beginner' as const,
  yield: {
    quantity: 2,
    unit: '개',
    pieceWeight: 500
  },
  servings: 2,
  prepTime: 30,
  bakingTime: 45,
  totalTime: 75,
  ingredients: [
    {
      id: 'flour',
      name: '강력분',
      category: 'flour' as const,
      amount: 500,
      unit: 'g' as const,
      bakersPercentage: 100,
      isFlour: true
    },
    {
      id: 'water',
      name: '물',
      category: 'liquid' as const,
      amount: 350,
      unit: 'ml' as const,
      bakersPercentage: 70
    }
  ],
  totalWeight: 850,
  totalHydration: 70,
  method: {
    method: 'straight' as const,
    prefermentRatio: 0,
    fermentationTime: {
      bulk: { min: 60, max: 90, unit: 'min' as const },
      final: { min: 45, max: 60, unit: 'min' as const }
    },
    temperature: {
      bulk: { min: 26, max: 28, unit: 'C' as const },
      final: { min: 28, max: 30, unit: 'C' as const }
    }
  },
  ovenSettings: {
    temperature: 220,
    mode: 'conventional' as const,
    preheating: true,
    deck: 'middle' as const
  },
  panConfig: {
    id: 'loaf-pan-1',
    name: '식빵틀 1호',
    type: 'loaf' as const,
    dimensions: {
      length: 240,
      width: 120,
      height: 100
    },
    volume: 2880,
    material: 'aluminum' as const,
    fillRatio: 0.7
  },
  steps: [
    {
      id: 'mix',
      order: 1,
      action: 'mix' as const,
      duration: { min: 5, max: 7, unit: 'min' as const }
    }
  ],
  tags: ['테스트', '빵'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides
})

// LocalStorage 모킹 함수
export const mockLocalStorage = () => {
  const storage: { [key: string]: string } = {}
  
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
    return storage[key] || null
  })
  
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
    storage[key] = value
  })
  
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
    delete storage[key]
  })
  
  vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => {
    for (const key in storage) {
      delete storage[key]
    }
  })
  
  return storage
}

// DOM 이벤트 헬퍼 함수
export const fireChangeEvent = (element: Element, value: string | number) => {
  const event = new Event('change', { bubbles: true })
  Object.defineProperty(event, 'target', { value: { value }, enumerable: true })
  element.dispatchEvent(event)
}

// 수학적 계산 테스트 헬퍼
export const expectApproximately = (actual: number, expected: number, precision = 2) => {
  expect(Math.round(actual * Math.pow(10, precision)) / Math.pow(10, precision))
    .toBe(Math.round(expected * Math.pow(10, precision)) / Math.pow(10, precision))
}

export * from '@testing-library/react'
export { customRender as render }