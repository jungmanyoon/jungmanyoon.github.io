/**
 * 제과제빵 재료별 가격 데이터베이스
 * 2024년 한국 기준 소매가격 (단위: KRW/kg 또는 KRW/L)
 * 출처: 온라인 마트, 제과제빵 전문점 평균가
 */

export const priceDatabase = {
  // === 밀가루류 ===
  '강력분': {
    price: 3500,       // 원/kg
    unit: 'kg',
    supplier: '일반마트',
    brand: '평균가',
    lastUpdated: '2024-01-01',
    packageSize: 2.5,  // kg
    wholesalePrice: 3000, // 대량구매시
    category: 'flour'
  },
  
  '중력분': {
    price: 3200,
    unit: 'kg',
    supplier: '일반마트',
    brand: '평균가',
    lastUpdated: '2024-01-01',
    packageSize: 2.5,
    wholesalePrice: 2800,
    category: 'flour'
  },
  
  '박력분': {
    price: 3000,
    unit: 'kg',
    supplier: '일반마트',
    brand: '평균가',
    lastUpdated: '2024-01-01',
    packageSize: 2.5,
    wholesalePrice: 2600,
    category: 'flour'
  },
  
  '통밀가루': {
    price: 5500,
    unit: 'kg',
    supplier: '건강식품점',
    brand: '유기농',
    lastUpdated: '2024-01-01',
    packageSize: 1,
    wholesalePrice: 4800,
    category: 'flour'
  },

  // === 당류 ===
  '설탕': {
    price: 2800,
    unit: 'kg',
    supplier: '일반마트',
    brand: '백설탕',
    lastUpdated: '2024-01-01',
    packageSize: 3,
    wholesalePrice: 2400,
    category: 'sugar'
  },
  
  '흑설탕': {
    price: 4200,
    unit: 'kg',
    supplier: '일반마트',
    brand: '평균가',
    lastUpdated: '2024-01-01',
    packageSize: 1,
    wholesalePrice: 3600,
    category: 'sugar'
  },
  
  '꿀': {
    price: 25000,
    unit: 'L',
    supplier: '전문점',
    brand: '국산꿀',
    lastUpdated: '2024-01-01',
    packageSize: 1,
    wholesalePrice: 22000,
    category: 'sugar'
  },

  // === 유지류 ===
  '버터': {
    price: 12000,
    unit: 'kg',
    supplier: '일반마트',
    brand: '서울우유',
    lastUpdated: '2024-01-01',
    packageSize: 0.45,
    wholesalePrice: 10500,
    category: 'fat'
  },
  
  '무염버터': {
    price: 13000,
    unit: 'kg',
    supplier: '일반마트',
    brand: '서울우유',
    lastUpdated: '2024-01-01',
    packageSize: 0.45,
    wholesalePrice: 11500,
    category: 'fat'
  },
  
  '식용유': {
    price: 4500,
    unit: 'L',
    supplier: '일반마트',
    brand: '평균가',
    lastUpdated: '2024-01-01',
    packageSize: 1.8,
    wholesalePrice: 4000,
    category: 'fat'
  },
  
  '올리브유': {
    price: 15000,
    unit: 'L',
    supplier: '일반마트',
    brand: '엑스트라버진',
    lastUpdated: '2024-01-01',
    packageSize: 0.5,
    wholesalePrice: 13500,
    category: 'fat'
  },

  // === 액체류 ===
  '물': {
    price: 1000,      // 정수된 물 기준
    unit: 'L',
    supplier: '일반마트',
    brand: '생수',
    lastUpdated: '2024-01-01',
    packageSize: 2,
    wholesalePrice: 800,
    category: 'liquid'
  },
  
  '우유': {
    price: 2800,
    unit: 'L',
    supplier: '일반마트',
    brand: '서울우유',
    lastUpdated: '2024-01-01',
    packageSize: 1,
    wholesalePrice: 2500,
    category: 'liquid'
  },
  
  '생크림': {
    price: 8000,
    unit: 'L',
    supplier: '제과점 전문',
    brand: '휘핑크림',
    lastUpdated: '2024-01-01',
    packageSize: 1,
    wholesalePrice: 7200,
    category: 'liquid'
  },

  // === 계란류 ===
  '계란': {
    price: 350,       // 원/개
    unit: '개',
    supplier: '일반마트',
    brand: '특란',
    lastUpdated: '2024-01-01',
    packageSize: 30,
    wholesalePrice: 320,
    category: 'egg',
    averageWeight: 60 // g
  },

  // === 팽창제 ===
  '이스트': {
    price: 15000,
    unit: 'kg',
    supplier: '제과점 전문',
    brand: '드라이이스트',
    lastUpdated: '2024-01-01',
    packageSize: 0.5,
    wholesalePrice: 13500,
    category: 'leavening'
  },
  
  '베이킹파우더': {
    price: 12000,
    unit: 'kg',
    supplier: '일반마트',
    brand: '평균가',
    lastUpdated: '2024-01-01',
    packageSize: 0.1,
    wholesalePrice: 10800,
    category: 'leavening'
  },

  // === 조미료 ===
  '소금': {
    price: 1500,
    unit: 'kg',
    supplier: '일반마트',
    brand: '천일염',
    lastUpdated: '2024-01-01',
    packageSize: 3,
    wholesalePrice: 1200,
    category: 'salt'
  },
  
  '바닐라익스트랙': {
    price: 45000,
    unit: 'L',
    supplier: '제과점 전문',
    brand: '천연바닐라',
    lastUpdated: '2024-01-01',
    packageSize: 0.1,
    wholesalePrice: 42000,
    category: 'flavoring'
  },

  // === 견과류 ===
  '아몬드가루': {
    price: 18000,
    unit: 'kg',
    supplier: '제과점 전문',
    brand: '미국산',
    lastUpdated: '2024-01-01',
    packageSize: 1,
    wholesalePrice: 16200,
    category: 'flour'
  },
  
  '호두': {
    price: 24000,
    unit: 'kg',
    supplier: '견과류 전문점',
    brand: '미국산',
    lastUpdated: '2024-01-01',
    packageSize: 1,
    wholesalePrice: 21600,
    category: 'nuts'
  }
}

/**
 * 재료명으로 가격 정보 검색
 */
export function getPriceInfo(ingredientName, useWholesale = false) {
  // 정확한 일치 우선
  if (priceDatabase[ingredientName]) {
    const info = priceDatabase[ingredientName]
    return {
      ...info,
      currentPrice: useWholesale ? info.wholesalePrice : info.price
    }
  }
  
  // 부분 일치 검색
  const lowerName = ingredientName.toLowerCase()
  const matchingKey = Object.keys(priceDatabase).find(key => 
    key.toLowerCase().includes(lowerName) || 
    lowerName.includes(key.toLowerCase())
  )
  
  if (matchingKey) {
    const info = priceDatabase[matchingKey]
    return {
      ...info,
      currentPrice: useWholesale ? info.wholesalePrice : info.price,
      matchedName: matchingKey
    }
  }
  
  // 기본값 반환
  return getDefaultPrice(ingredientName)
}

/**
 * 카테고리별 기본 가격 정보
 */
function getDefaultPrice(ingredientName) {
  const name = ingredientName.toLowerCase()
  
  if (name.includes('가루') || name.includes('flour')) {
    return {
      price: 4000,
      unit: 'kg',
      supplier: '추정가격',
      brand: '평균가',
      lastUpdated: '2024-01-01',
      packageSize: 1,
      wholesalePrice: 3600,
      category: 'flour',
      currentPrice: 4000,
      isEstimated: true
    }
  }
  
  if (name.includes('설탕') || name.includes('sugar')) {
    return {
      price: 3500,
      unit: 'kg',
      supplier: '추정가격',
      brand: '평균가',
      lastUpdated: '2024-01-01',
      packageSize: 1,
      wholesalePrice: 3150,
      category: 'sugar',
      currentPrice: 3500,
      isEstimated: true
    }
  }
  
  // 알 수 없는 재료에 대한 기본값
  return {
    price: 5000,
    unit: 'kg',
    supplier: '추정가격',
    brand: '평균가',
    lastUpdated: '2024-01-01',
    packageSize: 1,
    wholesalePrice: 4500,
    category: 'unknown',
    currentPrice: 5000,
    isEstimated: true
  }
}

/**
 * 가격 업데이트 기능
 */
export function updatePrice(ingredientName, newPrice, supplier = null) {
  if (priceDatabase[ingredientName]) {
    priceDatabase[ingredientName].price = newPrice
    priceDatabase[ingredientName].lastUpdated = new Date().toISOString().split('T')[0]
    
    if (supplier) {
      priceDatabase[ingredientName].supplier = supplier
    }
    
    // 도매가격도 비례하여 조정 (보통 10-15% 할인)
    priceDatabase[ingredientName].wholesalePrice = Math.round(newPrice * 0.9)
    
    return true
  }
  
  return false
}

/**
 * 시장 가격 동향 분석 (향후 구현)
 */
export function analyzePriceTrends(ingredientName, period = '3months') {
  // 실제 구현시 가격 변동 이력 데이터베이스 연동
  return {
    ingredientName,
    period,
    trend: 'stable', // rising, falling, stable
    averagePrice: getPriceInfo(ingredientName).price,
    priceChange: 0,
    volatility: 'low',
    recommendation: '현재가 적정 구매 시점입니다.'
  }
}

export default priceDatabase