/**
 * 제과제빵 재료 영양 정보 데이터베이스
 * 100g 기준 영양 성분
 */

export interface NutritionData {
  name: string
  nameKo: string
  calories: number      // kcal
  protein: number       // g
  carbohydrates: number // g
  fat: number          // g
  fiber: number        // g
  sugar: number        // g
  sodium: number       // mg
  cholesterol: number  // mg
  saturatedFat?: number // g
  transFat?: number    // g
  calcium?: number     // mg
  iron?: number        // mg
  vitaminA?: number    // IU
  vitaminC?: number    // mg
}

// 제과제빵 재료 영양 데이터베이스
export const nutritionDatabase: Record<string, NutritionData> = {
  // === 밀가루류 ===
  '강력분': {
    name: 'bread_flour',
    nameKo: '강력분',
    calories: 361,
    protein: 11.7,
    carbohydrates: 75.3,
    fat: 1.2,
    fiber: 2.7,
    sugar: 0.3,
    sodium: 2,
    cholesterol: 0,
    calcium: 15,
    iron: 1.2
  },
  '중력분': {
    name: 'all_purpose_flour',
    nameKo: '중력분',
    calories: 364,
    protein: 10.3,
    carbohydrates: 76.3,
    fat: 1.0,
    fiber: 2.7,
    sugar: 0.3,
    sodium: 2,
    cholesterol: 0
  },
  '박력분': {
    name: 'cake_flour',
    nameKo: '박력분',
    calories: 362,
    protein: 8.3,
    carbohydrates: 78.3,
    fat: 0.9,
    fiber: 2.4,
    sugar: 0.3,
    sodium: 2,
    cholesterol: 0
  },
  '통밀가루': {
    name: 'whole_wheat_flour',
    nameKo: '통밀가루',
    calories: 340,
    protein: 13.2,
    carbohydrates: 71.9,
    fat: 2.5,
    fiber: 10.7,
    sugar: 0.4,
    sodium: 2,
    cholesterol: 0,
    iron: 3.6
  },
  '호밀가루': {
    name: 'rye_flour',
    nameKo: '호밀가루',
    calories: 349,
    protein: 9.8,
    carbohydrates: 75.9,
    fat: 1.3,
    fiber: 11.8,
    sugar: 0.9,
    sodium: 2,
    cholesterol: 0
  },

  // === 당류 ===
  '설탕': {
    name: 'sugar',
    nameKo: '설탕',
    calories: 387,
    protein: 0,
    carbohydrates: 99.9,
    fat: 0,
    fiber: 0,
    sugar: 99.9,
    sodium: 1,
    cholesterol: 0
  },
  '황설탕': {
    name: 'brown_sugar',
    nameKo: '황설탕',
    calories: 380,
    protein: 0.1,
    carbohydrates: 98.1,
    fat: 0,
    fiber: 0,
    sugar: 97.3,
    sodium: 28,
    cholesterol: 0,
    calcium: 83
  },
  '꿀': {
    name: 'honey',
    nameKo: '꿀',
    calories: 304,
    protein: 0.3,
    carbohydrates: 82.4,
    fat: 0,
    fiber: 0.2,
    sugar: 82.1,
    sodium: 4,
    cholesterol: 0
  },
  '메이플시럽': {
    name: 'maple_syrup',
    nameKo: '메이플시럽',
    calories: 260,
    protein: 0.1,
    carbohydrates: 67.0,
    fat: 0.1,
    fiber: 0,
    sugar: 60.5,
    sodium: 12,
    cholesterol: 0,
    calcium: 102
  },

  // === 유지류 ===
  '버터': {
    name: 'butter',
    nameKo: '버터',
    calories: 717,
    protein: 0.9,
    carbohydrates: 0.1,
    fat: 81.1,
    fiber: 0,
    sugar: 0.1,
    sodium: 11,
    cholesterol: 215,
    saturatedFat: 51.4,
    vitaminA: 2499
  },
  '마가린': {
    name: 'margarine',
    nameKo: '마가린',
    calories: 719,
    protein: 0.2,
    carbohydrates: 0.9,
    fat: 80.5,
    fiber: 0,
    sugar: 0,
    sodium: 751,
    cholesterol: 0,
    saturatedFat: 13.0,
    transFat: 14.9
  },
  '쇼트닝': {
    name: 'shortening',
    nameKo: '쇼트닝',
    calories: 884,
    protein: 0,
    carbohydrates: 0,
    fat: 100,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0,
    saturatedFat: 25.0
  },
  '올리브오일': {
    name: 'olive_oil',
    nameKo: '올리브오일',
    calories: 884,
    protein: 0,
    carbohydrates: 0,
    fat: 100,
    fiber: 0,
    sugar: 0,
    sodium: 2,
    cholesterol: 0,
    saturatedFat: 13.8
  },

  // === 유제품 ===
  '우유': {
    name: 'milk',
    nameKo: '우유',
    calories: 61,
    protein: 3.2,
    carbohydrates: 4.8,
    fat: 3.3,
    fiber: 0,
    sugar: 5.1,
    sodium: 43,
    cholesterol: 10,
    calcium: 113
  },
  '생크림': {
    name: 'heavy_cream',
    nameKo: '생크림',
    calories: 345,
    protein: 2.1,
    carbohydrates: 2.8,
    fat: 37.0,
    fiber: 0,
    sugar: 2.9,
    sodium: 38,
    cholesterol: 137,
    saturatedFat: 23.0
  },
  '크림치즈': {
    name: 'cream_cheese',
    nameKo: '크림치즈',
    calories: 342,
    protein: 5.9,
    carbohydrates: 4.1,
    fat: 34.2,
    fiber: 0,
    sugar: 3.2,
    sodium: 321,
    cholesterol: 110,
    saturatedFat: 19.3
  },
  '요거트': {
    name: 'yogurt',
    nameKo: '요거트',
    calories: 59,
    protein: 3.5,
    carbohydrates: 4.7,
    fat: 3.3,
    fiber: 0,
    sugar: 4.7,
    sodium: 46,
    cholesterol: 13,
    calcium: 121
  },

  // === 계란 ===
  '계란': {
    name: 'egg',
    nameKo: '계란',
    calories: 155,
    protein: 13.0,
    carbohydrates: 1.1,
    fat: 10.6,
    fiber: 0,
    sugar: 1.1,
    sodium: 124,
    cholesterol: 373,
    saturatedFat: 3.1,
    iron: 1.8
  },
  '계란흰자': {
    name: 'egg_white',
    nameKo: '계란흰자',
    calories: 52,
    protein: 10.9,
    carbohydrates: 0.7,
    fat: 0.2,
    fiber: 0,
    sugar: 0.7,
    sodium: 166,
    cholesterol: 0
  },
  '계란노른자': {
    name: 'egg_yolk',
    nameKo: '계란노른자',
    calories: 322,
    protein: 15.9,
    carbohydrates: 3.6,
    fat: 26.5,
    fiber: 0,
    sugar: 0.6,
    sodium: 48,
    cholesterol: 1085,
    saturatedFat: 9.6
  },

  // === 견과류 ===
  '아몬드': {
    name: 'almond',
    nameKo: '아몬드',
    calories: 579,
    protein: 21.2,
    carbohydrates: 21.6,
    fat: 49.9,
    fiber: 12.5,
    sugar: 4.4,
    sodium: 1,
    cholesterol: 0,
    calcium: 269,
    iron: 3.7
  },
  '호두': {
    name: 'walnut',
    nameKo: '호두',
    calories: 654,
    protein: 15.2,
    carbohydrates: 13.7,
    fat: 65.2,
    fiber: 6.7,
    sugar: 2.6,
    sodium: 2,
    cholesterol: 0
  },
  '피스타치오': {
    name: 'pistachio',
    nameKo: '피스타치오',
    calories: 560,
    protein: 20.2,
    carbohydrates: 27.2,
    fat: 45.3,
    fiber: 10.6,
    sugar: 7.7,
    sodium: 1,
    cholesterol: 0
  },

  // === 초콜릿 ===
  '다크초콜릿': {
    name: 'dark_chocolate',
    nameKo: '다크초콜릿',
    calories: 546,
    protein: 4.9,
    carbohydrates: 61.2,
    fat: 31.3,
    fiber: 7.0,
    sugar: 47.9,
    sodium: 24,
    cholesterol: 3,
    saturatedFat: 18.5
  },
  '밀크초콜릿': {
    name: 'milk_chocolate',
    nameKo: '밀크초콜릿',
    calories: 535,
    protein: 7.6,
    carbohydrates: 59.4,
    fat: 29.7,
    fiber: 3.4,
    sugar: 51.5,
    sodium: 79,
    cholesterol: 23,
    saturatedFat: 18.5
  },
  '코코아파우더': {
    name: 'cocoa_powder',
    nameKo: '코코아파우더',
    calories: 228,
    protein: 19.6,
    carbohydrates: 57.9,
    fat: 13.7,
    fiber: 33.2,
    sugar: 1.8,
    sodium: 21,
    cholesterol: 0
  },

  // === 기타 ===
  '이스트': {
    name: 'yeast',
    nameKo: '이스트',
    calories: 325,
    protein: 40.4,
    carbohydrates: 41.2,
    fat: 7.6,
    fiber: 26.9,
    sugar: 0,
    sodium: 51,
    cholesterol: 0
  },
  '베이킹파우더': {
    name: 'baking_powder',
    nameKo: '베이킹파우더',
    calories: 53,
    protein: 0,
    carbohydrates: 27.7,
    fat: 0,
    fiber: 0.2,
    sugar: 0,
    sodium: 10600,
    cholesterol: 0
  },
  '소금': {
    name: 'salt',
    nameKo: '소금',
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 38758,
    cholesterol: 0
  },
  '바닐라추출물': {
    name: 'vanilla_extract',
    nameKo: '바닐라추출물',
    calories: 288,
    protein: 0.1,
    carbohydrates: 12.7,
    fat: 0.1,
    fiber: 0,
    sugar: 12.7,
    sodium: 9,
    cholesterol: 0
  }
}

/**
 * 재료명으로 영양 정보 조회
 */
export function getNutritionData(ingredientName: string): NutritionData | null {
  // 정확한 매칭 먼저 시도
  if (nutritionDatabase[ingredientName]) {
    return nutritionDatabase[ingredientName]
  }
  
  // 부분 매칭 시도
  for (const [key, value] of Object.entries(nutritionDatabase)) {
    if (ingredientName.includes(key) || key.includes(ingredientName)) {
      return value
    }
  }
  
  return null
}

/**
 * 영양 정보 계산 (주어진 양에 대해)
 */
export function calculateNutrition(
  ingredientName: string, 
  amount: number, 
  unit: 'g' | 'kg' | 'ml' | 'L' = 'g'
): NutritionData | null {
  const baseData = getNutritionData(ingredientName)
  if (!baseData) return null
  
  // 단위 변환
  let amountInGrams = amount
  if (unit === 'kg') amountInGrams = amount * 1000
  if (unit === 'L') amountInGrams = amount * 1000
  if (unit === 'ml') amountInGrams = amount
  
  // 100g 기준으로 계산
  const ratio = amountInGrams / 100
  
  return {
    ...baseData,
    calories: Math.round(baseData.calories * ratio),
    protein: Math.round(baseData.protein * ratio * 10) / 10,
    carbohydrates: Math.round(baseData.carbohydrates * ratio * 10) / 10,
    fat: Math.round(baseData.fat * ratio * 10) / 10,
    fiber: Math.round(baseData.fiber * ratio * 10) / 10,
    sugar: Math.round(baseData.sugar * ratio * 10) / 10,
    sodium: Math.round(baseData.sodium * ratio),
    cholesterol: Math.round(baseData.cholesterol * ratio),
    saturatedFat: baseData.saturatedFat ? Math.round(baseData.saturatedFat * ratio * 10) / 10 : undefined,
    transFat: baseData.transFat ? Math.round(baseData.transFat * ratio * 10) / 10 : undefined,
    calcium: baseData.calcium ? Math.round(baseData.calcium * ratio) : undefined,
    iron: baseData.iron ? Math.round(baseData.iron * ratio * 10) / 10 : undefined
  }
}