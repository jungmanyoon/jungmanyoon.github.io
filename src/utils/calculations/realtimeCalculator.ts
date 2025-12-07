/**
 * realtimeCalculator.ts
 *
 * 실시간 레시피 계산 엔진
 * - 팬 크기 변경 시 재료 재계산
 * - 제법 변환 (직반죽 → 스펀지법, 폴리시법 등)
 * - 배수 조정
 * - 퍼센트 계산
 *
 * 성능 목표: <50ms
 */

import type { Recipe, Ingredient, PanConfig, MethodConfig } from '@/types/recipe.types'

export interface ConvertedRecipe {
  preferment: {
    name: string
    ingredients: Ingredient[]
    fermentationTime: { min: number; max: number }
    temperature: { min: number; max: number }
  }
  mainDough: {
    ingredients: Ingredient[]
  }
  steps: string[]
  notes: string[]
}

export class RealtimeRecipeCalculator {
  /**
   * 팬 크기 변경 시 재료 재계산
   *
   * 알고리즘:
   * 1. 원본 팬 부피 계산
   * 2. 새 팬 부피 계산
   * 3. 배율 = 새 팬 부피 / 원본 팬 부피
   * 4. 모든 재료 무게 * 배율
   *
   * @param recipe 원본 레시피
   * @param newPan 새로운 팬 설정
   * @returns 재계산된 재료 목록
   */
  static recalculateForPan(recipe: Recipe, newPan: PanConfig): Ingredient[] {
    if (!recipe.panConfig || !newPan) return recipe.ingredients

    const originalVolume = this.calculatePanVolume(recipe.panConfig)
    const newVolume = this.calculatePanVolume(newPan)

    if (originalVolume === 0 || newVolume === 0) return recipe.ingredients

    const scaleFactor = newVolume / originalVolume

    return this.scaleIngredients(recipe.ingredients, scaleFactor)
  }

  /**
   * 팬 부피 계산 (cm³)
   */
  static calculatePanVolume(pan: PanConfig): number {
    if (!pan?.dimensions) return 1000

    const { length, width, height, diameter } = pan.dimensions

    switch (pan.type) {
      case 'round':
        if (diameter && height) {
          const radius = diameter / 2
          return Math.PI * radius * radius * height
        }
        break

      case 'square':
      case 'rectangular':
        if (length && width && height) {
          return length * width * height
        }
        break

      case 'loaf': // 식빵틀
        if (length && width && height) {
          // 식빵틀은 위가 더 넓음 - 사다리꼴 근사
          // 평균값 사용: 0.85 계수
          return length * width * height * 0.85
        }
        break

      case 'pullman': // 풀먼 식빵틀 (뚜껑 있음)
        if (length && width && height) {
          return length * width * height
        }
        break

      case 'tube': // 튜브 팬 (시폰 케이크)
      case 'bundt':
        if (diameter && height) {
          const outerRadius = diameter / 2
          const innerRadius = outerRadius * 0.4 // 내경 40%
          const outerVolume = Math.PI * outerRadius * outerRadius * height
          const innerVolume = Math.PI * innerRadius * innerRadius * height
          return outerVolume - innerVolume
        }
        break
    }

    return 1000 // 기본값
  }

  /**
   * 재료 배율 적용
   */
  static scaleIngredients(
    ingredients: Ingredient[],
    scaleFactor: number
  ): Ingredient[] {
    return ingredients.map((ingredient) => ({
      ...ingredient,
      amount: Math.round((ingredient.amount || 0) * scaleFactor * 10) / 10,
    }))
  }

  /**
   * 배수 조정 (2배, 3배 등)
   */
  static scaleByMultiplier(
    ingredients: Ingredient[],
    multiplier: number
  ): Ingredient[] {
    return this.scaleIngredients(ingredients, multiplier)
  }

  /**
   * 직반죽 → 스펀지법 변환
   *
   * 알고리즘:
   * 1. 밀가루의 30-60% 를 스펀지용으로 분리
   * 2. 스펀지용 물 = 밀가루 * 60% (60% 수화율)
   * 3. 모든 이스트를 스펀지에 사용
   * 4. 나머지 재료는 본반죽으로
   * 5. 발효 시간: 스펀지 3-4시간 + 본반죽 발효
   *
   * @param recipe 원본 레시피 (직반죽)
   * @param prefermentRatio 스펀지 비율 (0.3 ~ 0.6)
   * @returns 변환된 레시피
   */
  static convertToSpongeMethod(
    recipe: Recipe,
    prefermentRatio: number = 0.4
  ): ConvertedRecipe {
    const ingredients = recipe.ingredients || []

    // 밀가루, 물, 이스트 찾기
    const flour = ingredients.find(
      (i) =>
        i.category === 'flour' ||
        i.name?.includes('밀가루') ||
        i.name?.includes('강력분')
    )
    const water = ingredients.find((i) => i.name?.includes('물'))
    const yeast = ingredients.find(
      (i) => i.category === 'yeast' || i.name?.includes('이스트')
    )

    if (!flour || !water || !yeast) {
      throw new Error('밀가루, 물, 이스트를 찾을 수 없습니다.')
    }

    // 스펀지 재료 계산
    const spongeFlour = Math.round(flour.amount * prefermentRatio * 10) / 10
    const spongeWater = Math.round(spongeFlour * 0.6 * 10) / 10 // 60% 수화율
    const spongeYeast = yeast.amount // 모든 이스트를 스펀지에

    // 본반죽 재료 계산
    const mainFlour = Math.round((flour.amount - spongeFlour) * 10) / 10
    const mainWater = Math.round((water.amount - spongeWater) * 10) / 10

    return {
      preferment: {
        name: '스펀지',
        ingredients: [
          { ...flour, amount: spongeFlour },
          { ...water, amount: spongeWater },
          { ...yeast, amount: spongeYeast },
        ],
        fermentationTime: { min: 180, max: 240 }, // 3-4시간
        temperature: { min: 24, max: 27 },
      },
      mainDough: {
        ingredients: [
          { ...flour, amount: mainFlour },
          { ...water, amount: mainWater },
          // 나머지 재료들 (소금, 설탕, 버터 등)
          ...ingredients.filter(
            (i) =>
              i.id !== flour.id &&
              i.id !== water.id &&
              i.id !== yeast.id
          ),
        ],
      },
      steps: [
        '1. 스펀지 만들기: 밀가루 + 물 + 이스트를 섞어 부드러운 반죽 만들기',
        '2. 스펀지 발효: 3-4시간, 24-27°C (2배로 부풀고 기포가 생길 때까지)',
        '3. 본반죽: 발효된 스펀지 + 나머지 재료 믹싱',
        '4. 1차 발효: 60-90분 (직반죽보다 짧음)',
        '5. 분할 → 둥글리기 → 벤치타임 15분',
        '6. 성형 → 팬닝',
        '7. 2차 발효: 40-50분, 35-38°C',
        '8. 굽기',
      ],
      notes: [
        `스펀지 비율: ${Math.round(prefermentRatio * 100)}%`,
        '장점: 풍미 향상, 노화 지연, 부드러운 식감',
        '주의: 스펀지가 과발효되면 신맛이 강해짐',
      ],
    }
  }

  /**
   * 직반죽 → 폴리시법 변환
   *
   * 폴리시 = 물 + 이스트 (밀가루 없음)
   * 비율: 밀가루의 20-30%에 해당하는 물 + 소량 이스트
   */
  static convertToPolishMethod(
    recipe: Recipe,
    prefermentRatio: number = 0.25
  ): ConvertedRecipe {
    const ingredients = recipe.ingredients || []

    const flour = ingredients.find(
      (i) =>
        i.category === 'flour' ||
        i.name?.includes('밀가루') ||
        i.name?.includes('강력분')
    )
    const water = ingredients.find((i) => i.name?.includes('물'))
    const yeast = ingredients.find(
      (i) => i.category === 'yeast' || i.name?.includes('이스트')
    )

    if (!flour || !water || !yeast) {
      throw new Error('밀가루, 물, 이스트를 찾을 수 없습니다.')
    }

    // 폴리시 재료 계산 (밀가루는 본반죽에만, 물과 이스트만 폴리시에)
    const polishWater = Math.round(flour.amount * prefermentRatio * 10) / 10
    const polishYeast = Math.round(yeast.amount * 0.2 * 10) / 10 // 20%만 사용

    // 본반죽 재료
    const mainWater = Math.round((water.amount - polishWater) * 10) / 10
    const mainYeast = Math.round((yeast.amount - polishYeast) * 10) / 10

    return {
      preferment: {
        name: '폴리시',
        ingredients: [
          { ...water, amount: polishWater },
          { ...yeast, amount: polishYeast },
        ],
        fermentationTime: { min: 720, max: 960 }, // 12-16시간
        temperature: { min: 15, max: 18 },
      },
      mainDough: {
        ingredients: [
          flour, // 모든 밀가루
          { ...water, amount: mainWater },
          { ...yeast, amount: mainYeast },
          ...ingredients.filter(
            (i) =>
              i.id !== flour.id &&
              i.id !== water.id &&
              i.id !== yeast.id
          ),
        ],
      },
      steps: [
        '1. 폴리시 만들기: 물 + 이스트만 섞기 (밀가루 없음)',
        '2. 폴리시 발효: 12-16시간, 15-18°C (냉장 발효 가능)',
        '3. 본반죽: 발효된 폴리시 + 모든 재료 믹싱',
        '4. 1차 발효: 60-90분',
        '5. 분할 → 둥글리기 → 벤치타임',
        '6. 성형 → 팬닝',
        '7. 2차 발효: 40-50분',
        '8. 굽기',
      ],
      notes: [
        `폴리시 비율: 밀가루 대비 ${Math.round(prefermentRatio * 100)}% 물`,
        '장점: 강한 밀 풍미, 크러스트 발달, 구멍 큼',
        '특징: 프랑스빵, 바게트 등에 적합',
      ],
    }
  }

  /**
   * 베이커스 퍼센트 계산
   * 밀가루 = 100%
   */
  static calculateBakersPercentage(ingredients: Ingredient[]): Ingredient[] {
    const flourWeight = ingredients
      .filter(
        (i) =>
          i.category === 'flour' ||
          i.name?.includes('밀가루') ||
          i.name?.includes('강력분')
      )
      .reduce((sum, i) => sum + (i.amount || 0), 0)

    if (flourWeight === 0) return ingredients

    return ingredients.map((ing) => ({
      ...ing,
      bakersPercentage:
        Math.round(((ing.amount || 0) / flourWeight) * 1000) / 10,
    }))
  }

  /**
   * 중량 퍼센트 계산
   * 총 반죽량 = 100%
   */
  static calculateWeightPercentage(ingredients: Ingredient[]): Ingredient[] {
    const totalWeight = ingredients.reduce(
      (sum, i) => sum + (i.amount || 0),
      0
    )

    if (totalWeight === 0) return ingredients

    return ingredients.map((ing) => ({
      ...ing,
      weightPercentage:
        Math.round(((ing.amount || 0) / totalWeight) * 1000) / 10,
    }))
  }

  /**
   * 총 반죽량 계산
   */
  static calculateTotalWeight(ingredients: Ingredient[]): number {
    return Math.round(
      ingredients.reduce((sum, ing) => sum + (ing.amount || 0), 0)
    )
  }
}

/**
 * 팬 프리셋 (자주 사용하는 팬 크기)
 * 현대적 단위: cm, ml
 */
export const PAN_PRESETS: Record<string, PanConfig> = {
  'small': {
    id: 'loaf-small',
    name: '소형 (15×7×6cm, 630ml)',
    type: 'loaf',
    dimensions: { length: 15, width: 7, height: 6 },
    volume: 630,
    material: 'aluminum',
    fillRatio: 0.7,
  },
  'medium': {
    id: 'loaf-medium',
    name: '중형 (18×9×8cm, 1100ml)',
    type: 'loaf',
    dimensions: { length: 18, width: 9, height: 8 },
    volume: 1100,
    material: 'aluminum',
    fillRatio: 0.7,
  },
  'large': {
    id: 'loaf-large',
    name: '대형 (21×11×10cm, 1960ml)',
    type: 'loaf',
    dimensions: { length: 21, width: 11, height: 10 },
    volume: 1960,
    material: 'aluminum',
    fillRatio: 0.7,
  },
  'pullman': {
    id: 'pullman',
    name: '풀먼 (20×10×10cm, 2000ml)',
    type: 'pullman',
    dimensions: { length: 20, width: 10, height: 10 },
    volume: 2000,
    material: 'aluminum',
    fillRatio: 0.8,
  },
  'round-18': {
    id: 'round-18',
    name: '원형 18cm (1500ml)',
    type: 'round',
    dimensions: { diameter: 18, height: 6 },
    volume: 1500,
    material: 'aluminum',
    fillRatio: 0.7,
  },
  'round-21': {
    id: 'round-21',
    name: '원형 21cm (2100ml)',
    type: 'round',
    dimensions: { diameter: 21, height: 6 },
    volume: 2100,
    material: 'aluminum',
    fillRatio: 0.7,
  },
}
