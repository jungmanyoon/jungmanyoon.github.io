/**
 * 제과제빵 재료별 영양 성분 데이터베이스
 * 100g 기준 영양 성분 정보
 * 출처: 식품의약품안전처 식품영양성분데이터베이스, USDA FoodData Central
 */

export const nutritionDatabase = {
  // === 밀가루류 ===
  '강력분': {
    calories: 364,
    protein: 11.5,
    carbohydrates: 73.3,
    fat: 1.9,
    fiber: 2.7,
    sugar: 0.3,
    sodium: 2,
    cholesterol: 0,
    category: 'flour',
    density: 0.6 // g/ml 부피-무게 변환용
  },
  
  '중력분': {
    calories: 364,
    protein: 10.3,
    carbohydrates: 75.0,
    fat: 1.5,
    fiber: 2.7,
    sugar: 0.3,
    sodium: 2,
    cholesterol: 0,
    category: 'flour',
    density: 0.6
  },
  
  '박력분': {
    calories: 368,
    protein: 8.0,
    carbohydrates: 75.8,
    fat: 1.4,
    fiber: 2.5,
    sugar: 0.3,
    sodium: 2,
    cholesterol: 0,
    category: 'flour',
    density: 0.6
  },
  
  '통밀가루': {
    calories: 340,
    protein: 13.2,
    carbohydrates: 72.0,
    fat: 2.5,
    fiber: 10.7,
    sugar: 0.4,
    sodium: 2,
    cholesterol: 0,
    category: 'flour',
    density: 0.55
  },
  
  '호밀가루': {
    calories: 338,
    protein: 10.3,
    carbohydrates: 75.9,
    fat: 1.6,
    fiber: 15.1,
    sugar: 0.9,
    sodium: 2,
    cholesterol: 0,
    category: 'flour',
    density: 0.52
  },

  // === 당류 ===
  '설탕': {
    calories: 387,
    protein: 0,
    carbohydrates: 99.8,
    fat: 0,
    fiber: 0,
    sugar: 99.8,
    sodium: 1,
    cholesterol: 0,
    category: 'sugar',
    density: 0.85
  },
  
  '흑설탕': {
    calories: 380,
    protein: 0.1,
    carbohydrates: 97.3,
    fat: 0.1,
    fiber: 0,
    sugar: 97.3,
    sodium: 28,
    cholesterol: 0,
    category: 'sugar',
    density: 0.9
  },
  
  '꿀': {
    calories: 304,
    protein: 0.3,
    carbohydrates: 82.4,
    fat: 0,
    fiber: 0.2,
    sugar: 82.1,
    sodium: 4,
    cholesterol: 0,
    category: 'sugar',
    density: 1.4
  },
  
  '메이플시럽': {
    calories: 260,
    protein: 0.04,
    carbohydrates: 67.0,
    fat: 0.06,
    fiber: 0,
    sugar: 60.5,
    sodium: 12,
    cholesterol: 0,
    category: 'sugar',
    density: 1.3
  },

  // === 유지류 ===
  '버터': {
    calories: 717,
    protein: 0.9,
    carbohydrates: 0.1,
    fat: 81.1,
    fiber: 0,
    sugar: 0.1,
    sodium: 643,
    cholesterol: 215,
    category: 'fat',
    density: 0.91
  },
  
  '무염버터': {
    calories: 717,
    protein: 0.9,
    carbohydrates: 0.1,
    fat: 81.1,
    fiber: 0,
    sugar: 0.1,
    sodium: 11,
    cholesterol: 215,
    category: 'fat',
    density: 0.91
  },
  
  '마가린': {
    calories: 717,
    protein: 0.2,
    carbohydrates: 0.9,
    fat: 80.5,
    fiber: 0,
    sugar: 0.9,
    sodium: 943,
    cholesterol: 0,
    category: 'fat',
    density: 0.9
  },
  
  '식용유': {
    calories: 884,
    protein: 0,
    carbohydrates: 0,
    fat: 100,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0,
    category: 'fat',
    density: 0.92
  },
  
  '올리브유': {
    calories: 884,
    protein: 0,
    carbohydrates: 0,
    fat: 100,
    fiber: 0,
    sugar: 0,
    sodium: 2,
    cholesterol: 0,
    category: 'fat',
    density: 0.915
  },

  // === 액체류 ===
  '물': {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0,
    category: 'liquid',
    density: 1.0
  },
  
  '우유': {
    calories: 42,
    protein: 3.4,
    carbohydrates: 5.0,
    fat: 1.0,
    fiber: 0,
    sugar: 5.0,
    sodium: 44,
    cholesterol: 5,
    category: 'liquid',
    density: 1.03
  },
  
  '생크림': {
    calories: 345,
    protein: 2.1,
    carbohydrates: 3.4,
    fat: 37.0,
    fiber: 0,
    sugar: 3.4,
    sodium: 38,
    cholesterol: 109,
    category: 'liquid',
    density: 1.0
  },
  
  '요거트': {
    calories: 59,
    protein: 10.0,
    carbohydrates: 3.6,
    fat: 0.4,
    fiber: 0,
    sugar: 3.2,
    sodium: 36,
    cholesterol: 5,
    category: 'dairy',
    density: 1.05
  },

  // === 계란류 ===
  '계란': {
    calories: 155,
    protein: 12.6,
    carbohydrates: 1.1,
    fat: 11.1,
    fiber: 0,
    sugar: 1.1,
    sodium: 124,
    cholesterol: 373,
    category: 'egg',
    density: 1.03,
    averageWeight: 60 // 개당 평균 중량(껍질 포함)
  },
  
  '계란흰자': {
    calories: 52,
    protein: 10.9,
    carbohydrates: 0.7,
    fat: 0.2,
    fiber: 0,
    sugar: 0.7,
    sodium: 166,
    cholesterol: 0,
    category: 'egg',
    density: 1.03
  },
  
  '계란노른자': {
    calories: 322,
    protein: 15.9,
    carbohydrates: 1.8,
    fat: 26.5,
    fiber: 0,
    sugar: 0.6,
    sodium: 48,
    cholesterol: 1234,
    category: 'egg',
    density: 1.03
  },

  // === 팽창제 ===
  '이스트': {
    calories: 325,
    protein: 40.4,
    carbohydrates: 36.5,
    fat: 7.6,
    fiber: 26.9,
    sugar: 0,
    sodium: 51,
    cholesterol: 0,
    category: 'leavening',
    density: 0.8
  },
  
  '베이킹파우더': {
    calories: 53,
    protein: 0,
    carbohydrates: 27.7,
    fat: 0,
    fiber: 0.2,
    sugar: 0,
    sodium: 10600,
    cholesterol: 0,
    category: 'leavening',
    density: 0.9
  },
  
  '베이킹소다': {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 27360,
    cholesterol: 0,
    category: 'leavening',
    density: 2.2
  },

  // === 조미료 ===
  '소금': {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 38758,
    cholesterol: 0,
    category: 'salt',
    density: 2.16
  },
  
  '바닐라익스트랙': {
    calories: 288,
    protein: 0.1,
    carbohydrates: 12.6,
    fat: 0.1,
    fiber: 0,
    sugar: 12.6,
    sodium: 9,
    cholesterol: 0,
    category: 'flavoring',
    density: 0.87
  },

  // === 견과류 ===
  '아몬드가루': {
    calories: 579,
    protein: 21.4,
    carbohydrates: 21.6,
    fat: 49.9,
    fiber: 12.5,
    sugar: 4.4,
    sodium: 1,
    cholesterol: 0,
    category: 'flour',
    density: 0.4
  },
  
  '호두': {
    calories: 654,
    protein: 15.2,
    carbohydrates: 13.7,
    fat: 65.2,
    fiber: 6.7,
    sugar: 2.6,
    sodium: 2,
    cholesterol: 0,
    category: 'nuts',
    density: 0.65
  }
}

/**
 * 재료명으로 영양 정보 검색
 */
export function getNutritionInfo(ingredientName) {
  // 정확한 일치 우선
  if (nutritionDatabase[ingredientName]) {
    return nutritionDatabase[ingredientName]
  }
  
  // 부분 일치 검색 (소문자 변환)
  const lowerName = ingredientName.toLowerCase()
  const matchingKey = Object.keys(nutritionDatabase).find(key => 
    key.toLowerCase().includes(lowerName) || 
    lowerName.includes(key.toLowerCase())
  )
  
  if (matchingKey) {
    return nutritionDatabase[matchingKey]
  }
  
  // 카테고리별 기본값 반환
  return getDefaultNutrition(ingredientName)
}

/**
 * 카테고리별 기본 영양 정보
 */
function getDefaultNutrition(ingredientName) {
  const name = ingredientName.toLowerCase()
  
  if (name.includes('가루') || name.includes('flour')) {
    return {
      calories: 350,
      protein: 10,
      carbohydrates: 75,
      fat: 2,
      fiber: 3,
      sugar: 1,
      sodium: 5,
      cholesterol: 0,
      category: 'flour',
      density: 0.6,
      isEstimated: true
    }
  }
  
  if (name.includes('설탕') || name.includes('sugar') || name.includes('시럽')) {
    return {
      calories: 380,
      protein: 0,
      carbohydrates: 95,
      fat: 0,
      fiber: 0,
      sugar: 95,
      sodium: 5,
      cholesterol: 0,
      category: 'sugar',
      density: 0.85,
      isEstimated: true
    }
  }
  
  // 알 수 없는 재료에 대한 기본값
  return {
    calories: 100,
    protein: 5,
    carbohydrates: 10,
    fat: 2,
    fiber: 1,
    sugar: 5,
    sodium: 50,
    cholesterol: 0,
    category: 'unknown',
    density: 1.0,
    isEstimated: true
  }
}

export default nutritionDatabase