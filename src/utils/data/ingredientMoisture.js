/**
 * 재료별 수분 함량 데이터
 * 제빵 계산시 정확한 수화율 계산을 위한 참조 데이터
 */

export const ingredientMoisture = {
  // 액체류
  '물': { moisture: 100, category: 'liquid' },
  'water': { moisture: 100, category: 'liquid' },
  '우유': { moisture: 87, category: 'liquid' },
  'milk': { moisture: 87, category: 'liquid' },
  '생크림': { moisture: 60, category: 'liquid' },
  'cream': { moisture: 60, category: 'liquid' },
  
  // 계란류
  '계란': { moisture: 75, category: 'egg' },
  '전란': { moisture: 75, category: 'egg' },
  'egg': { moisture: 75, category: 'egg' },
  '계란흰자': { moisture: 88, category: 'egg' },
  '계란노른자': { moisture: 50, category: 'egg' },
  
  // 유지류
  '버터': { moisture: 16, category: 'fat' },
  'butter': { moisture: 16, category: 'fat' },
  '마가린': { moisture: 16, category: 'fat' },
  '식용유': { moisture: 0, category: 'fat' },
  '올리브유': { moisture: 0, category: 'fat' },
  
  // 당류
  '설탕': { moisture: 0, category: 'sugar' },
  '꿀': { moisture: 17, category: 'sugar' },
  'honey': { moisture: 17, category: 'sugar' },
  '물엿': { moisture: 20, category: 'sugar' },
  
  // 밀가루류
  '강력분': { moisture: 14, category: 'flour' },
  '중력분': { moisture: 14, category: 'flour' },
  '박력분': { moisture: 14, category: 'flour' },
  'flour': { moisture: 14, category: 'flour' },
  
  // 기타
  '이스트': { moisture: 70, category: 'yeast' },
  'yeast': { moisture: 70, category: 'yeast' },
  '소금': { moisture: 0, category: 'salt' },
  'salt': { moisture: 0, category: 'salt' }
}

/**
 * 재료의 실제 수분량 계산
 * @param {string} ingredientName - 재료 이름
 * @param {number} amount - 재료 양
 * @returns {number} 실제 수분량
 */
export function calculateMoisture(ingredientName, amount) {
  const ingredient = ingredientMoisture[ingredientName.toLowerCase()] || 
                    ingredientMoisture[ingredientName] || 
                    { moisture: 0 }
  
  return (amount * ingredient.moisture) / 100
}

/**
 * 재료가 액체인지 판별
 * @param {string} ingredientName - 재료 이름
 * @param {string} ingredientType - 사용자가 지정한 타입
 * @returns {boolean} 액체 여부
 */
export function isLiquidIngredient(ingredientName, ingredientType) {
  // 사용자가 지정한 타입을 우선 적용
  if (ingredientType === 'liquid') return true
  
  // 수분 함량이 50% 이상인 재료를 액체로 분류
  const ingredient = ingredientMoisture[ingredientName.toLowerCase()] || 
                    ingredientMoisture[ingredientName]
  
  return ingredient && ingredient.moisture >= 50
}

export default ingredientMoisture