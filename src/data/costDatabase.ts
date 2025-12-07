/**
 * 제과제빵 재료 원가 데이터베이스
 * 2024년 한국 시장 기준 (단위: 원/kg 또는 원/L)
 */

export interface CostData {
  name: string
  nameKo: string
  unit: 'kg' | 'L' | 'ea' | 'pack'
  retailPrice: number      // 소매가
  wholesalePrice: number   // 도매가
  bulkPrice?: number       // 대량구매가
  brand?: string           // 브랜드
  quality?: 'premium' | 'standard' | 'economy'
  lastUpdated: string      // 최종 업데이트 날짜
  supplier?: string        // 공급처
  notes?: string          // 비고
}

// 제과제빵 재료 원가 데이터베이스
export const costDatabase: Record<string, CostData> = {
  // === 밀가루류 ===
  '강력분': {
    name: 'bread_flour',
    nameKo: '강력분',
    unit: 'kg',
    retailPrice: 2500,
    wholesalePrice: 1800,
    bulkPrice: 1500,
    brand: '큐원/백설',
    quality: 'standard',
    lastUpdated: '2024-01',
    supplier: '제과재료상'
  },
  '중력분': {
    name: 'all_purpose_flour',
    nameKo: '중력분',
    unit: 'kg',
    retailPrice: 2300,
    wholesalePrice: 1700,
    bulkPrice: 1400,
    brand: '큐원/백설',
    quality: 'standard',
    lastUpdated: '2024-01'
  },
  '박력분': {
    name: 'cake_flour',
    nameKo: '박력분',
    unit: 'kg',
    retailPrice: 2400,
    wholesalePrice: 1750,
    bulkPrice: 1450,
    brand: '큐원/백설',
    quality: 'standard',
    lastUpdated: '2024-01'
  },
  '통밀가루': {
    name: 'whole_wheat_flour',
    nameKo: '통밀가루',
    unit: 'kg',
    retailPrice: 3500,
    wholesalePrice: 2800,
    bulkPrice: 2400,
    brand: '백설',
    quality: 'premium',
    lastUpdated: '2024-01'
  },

  // === 당류 ===
  '설탕': {
    name: 'sugar',
    nameKo: '설탕',
    unit: 'kg',
    retailPrice: 2000,
    wholesalePrice: 1500,
    bulkPrice: 1200,
    brand: '백설/큐원',
    quality: 'standard',
    lastUpdated: '2024-01'
  },
  '황설탕': {
    name: 'brown_sugar',
    nameKo: '황설탕',
    unit: 'kg',
    retailPrice: 2500,
    wholesalePrice: 2000,
    bulkPrice: 1700,
    brand: '백설',
    quality: 'standard',
    lastUpdated: '2024-01'
  },
  '꿀': {
    name: 'honey',
    nameKo: '꿀',
    unit: 'kg',
    retailPrice: 15000,
    wholesalePrice: 12000,
    bulkPrice: 10000,
    brand: '동서벌꿀',
    quality: 'premium',
    lastUpdated: '2024-01',
    notes: '아카시아꿀 기준'
  },

  // === 유지류 ===
  '버터': {
    name: 'butter',
    nameKo: '버터',
    unit: 'kg',
    retailPrice: 18000,
    wholesalePrice: 14000,
    bulkPrice: 12000,
    brand: '앵커/롯데',
    quality: 'premium',
    lastUpdated: '2024-01',
    notes: '무염버터 기준'
  },
  '마가린': {
    name: 'margarine',
    nameKo: '마가린',
    unit: 'kg',
    retailPrice: 8000,
    wholesalePrice: 6000,
    bulkPrice: 5000,
    brand: '오뚜기',
    quality: 'standard',
    lastUpdated: '2024-01'
  },
  '쇼트닝': {
    name: 'shortening',
    nameKo: '쇼트닝',
    unit: 'kg',
    retailPrice: 7000,
    wholesalePrice: 5500,
    bulkPrice: 4800,
    brand: '오뚜기',
    quality: 'standard',
    lastUpdated: '2024-01'
  },

  // === 유제품 ===
  '우유': {
    name: 'milk',
    nameKo: '우유',
    unit: 'L',
    retailPrice: 3000,
    wholesalePrice: 2500,
    bulkPrice: 2200,
    brand: '서울우유/매일',
    quality: 'standard',
    lastUpdated: '2024-01'
  },
  '생크림': {
    name: 'heavy_cream',
    nameKo: '생크림',
    unit: 'L',
    retailPrice: 12000,
    wholesalePrice: 9000,
    bulkPrice: 8000,
    brand: '매일/서울',
    quality: 'premium',
    lastUpdated: '2024-01',
    notes: '동물성 생크림'
  },
  '크림치즈': {
    name: 'cream_cheese',
    nameKo: '크림치즈',
    unit: 'kg',
    retailPrice: 20000,
    wholesalePrice: 16000,
    bulkPrice: 14000,
    brand: '필라델피아',
    quality: 'premium',
    lastUpdated: '2024-01'
  },

  // === 계란 ===
  '계란': {
    name: 'egg',
    nameKo: '계란',
    unit: 'ea',
    retailPrice: 300,
    wholesalePrice: 250,
    bulkPrice: 200,
    brand: '풀무원',
    quality: 'standard',
    lastUpdated: '2024-01',
    notes: '특란 기준, 개당 가격'
  },

  // === 초콜릿 ===
  '다크초콜릿': {
    name: 'dark_chocolate',
    nameKo: '다크초콜릿',
    unit: 'kg',
    retailPrice: 25000,
    wholesalePrice: 20000,
    bulkPrice: 18000,
    brand: '발로나/칼리바우트',
    quality: 'premium',
    lastUpdated: '2024-01',
    notes: '카카오 70% 기준'
  },
  '밀크초콜릿': {
    name: 'milk_chocolate',
    nameKo: '밀크초콜릿',
    unit: 'kg',
    retailPrice: 22000,
    wholesalePrice: 18000,
    bulkPrice: 16000,
    brand: '가나',
    quality: 'standard',
    lastUpdated: '2024-01'
  },
  '코코아파우더': {
    name: 'cocoa_powder',
    nameKo: '코코아파우더',
    unit: 'kg',
    retailPrice: 15000,
    wholesalePrice: 12000,
    bulkPrice: 10000,
    brand: '발로나',
    quality: 'premium',
    lastUpdated: '2024-01'
  },

  // === 견과류 ===
  '아몬드': {
    name: 'almond',
    nameKo: '아몬드',
    unit: 'kg',
    retailPrice: 20000,
    wholesalePrice: 16000,
    bulkPrice: 14000,
    quality: 'standard',
    lastUpdated: '2024-01',
    notes: '생아몬드 기준'
  },
  '호두': {
    name: 'walnut',
    nameKo: '호두',
    unit: 'kg',
    retailPrice: 25000,
    wholesalePrice: 20000,
    bulkPrice: 18000,
    quality: 'standard',
    lastUpdated: '2024-01'
  },

  // === 기타 ===
  '이스트': {
    name: 'yeast',
    nameKo: '이스트',
    unit: 'kg',
    retailPrice: 8000,
    wholesalePrice: 6000,
    bulkPrice: 5000,
    brand: '사프/레사프',
    quality: 'standard',
    lastUpdated: '2024-01',
    notes: '인스턴트 드라이이스트'
  },
  '베이킹파우더': {
    name: 'baking_powder',
    nameKo: '베이킹파우더',
    unit: 'kg',
    retailPrice: 12000,
    wholesalePrice: 9000,
    bulkPrice: 7500,
    brand: '백설',
    quality: 'standard',
    lastUpdated: '2024-01'
  },
  '소금': {
    name: 'salt',
    nameKo: '소금',
    unit: 'kg',
    retailPrice: 1500,
    wholesalePrice: 1000,
    bulkPrice: 800,
    brand: '백설',
    quality: 'standard',
    lastUpdated: '2024-01',
    notes: '꽃소금 기준'
  },
  '바닐라추출물': {
    name: 'vanilla_extract',
    nameKo: '바닐라추출물',
    unit: 'L',
    retailPrice: 50000,
    wholesalePrice: 40000,
    bulkPrice: 35000,
    quality: 'premium',
    lastUpdated: '2024-01',
    notes: '천연 바닐라'
  }
}

/**
 * 원가 계산 클래스
 */
export class CostCalculator {
  /**
   * 재료명으로 원가 정보 조회
   */
  static getCostData(ingredientName: string): CostData | null {
    // 정확한 매칭 먼저 시도
    if (costDatabase[ingredientName]) {
      return costDatabase[ingredientName]
    }
    
    // 부분 매칭 시도
    for (const [key, value] of Object.entries(costDatabase)) {
      if (ingredientName.includes(key) || key.includes(ingredientName)) {
        return value
      }
    }
    
    return null
  }

  /**
   * 재료 원가 계산
   */
  static calculateIngredientCost(
    ingredientName: string,
    amount: number,
    unit: string = 'g',
    priceType: 'retail' | 'wholesale' | 'bulk' = 'wholesale'
  ): number {
    const costData = this.getCostData(ingredientName)
    if (!costData) return 0
    
    // 단위 변환
    let amountInBaseUnit = amount
    if (unit === 'g' && costData.unit === 'kg') {
      amountInBaseUnit = amount / 1000
    } else if (unit === 'ml' && costData.unit === 'L') {
      amountInBaseUnit = amount / 1000
    }
    
    // 가격 선택
    let price = costData.wholesalePrice
    if (priceType === 'retail') {
      price = costData.retailPrice
    } else if (priceType === 'bulk' && costData.bulkPrice) {
      price = costData.bulkPrice
    }
    
    // 계란은 개수 단위 특별 처리
    if (costData.unit === 'ea') {
      // 계란 1개 = 약 50g 기준
      const eggCount = Math.ceil(amount / 50)
      return eggCount * price
    }
    
    return Math.round(amountInBaseUnit * price)
  }

  /**
   * 레시피 총 재료비 계산
   */
  static calculateRecipeCost(
    ingredients: Array<{ name: string; amount: number; unit?: string }>,
    priceType: 'retail' | 'wholesale' | 'bulk' = 'wholesale'
  ): {
    totalCost: number
    itemizedCosts: Array<{ name: string; cost: number }>
    missingPrices: string[]
  } {
    let totalCost = 0
    const itemizedCosts: Array<{ name: string; cost: number }> = []
    const missingPrices: string[] = []
    
    for (const ingredient of ingredients) {
      const cost = this.calculateIngredientCost(
        ingredient.name,
        ingredient.amount,
        ingredient.unit || 'g',
        priceType
      )
      
      if (cost === 0 && !this.getCostData(ingredient.name)) {
        missingPrices.push(ingredient.name)
      }
      
      totalCost += cost
      itemizedCosts.push({ name: ingredient.name, cost })
    }
    
    return { totalCost, itemizedCosts, missingPrices }
  }

  /**
   * 수익성 분석
   */
  static analyzeProfitability(
    materialCost: number,
    laborCost: number = 0,
    overheadCost: number = 0,
    sellingPrice: number,
    quantity: number = 1
  ): {
    totalCost: number
    unitCost: number
    grossProfit: number
    grossMargin: number // %
    netProfit: number
    netMargin: number // %
    breakEvenPrice: number
    recommendedPrice: number // 30% 마진 기준
  } {
    const totalCost = materialCost + laborCost + overheadCost
    const unitCost = totalCost / quantity
    const grossProfit = sellingPrice - materialCost
    const grossMargin = (grossProfit / sellingPrice) * 100
    const netProfit = sellingPrice - totalCost
    const netMargin = (netProfit / sellingPrice) * 100
    const breakEvenPrice = totalCost
    const recommendedPrice = Math.round(totalCost * 1.43) // 30% 마진 확보
    
    return {
      totalCost,
      unitCost,
      grossProfit,
      grossMargin: Math.round(grossMargin * 10) / 10,
      netProfit,
      netMargin: Math.round(netMargin * 10) / 10,
      breakEvenPrice,
      recommendedPrice
    }
  }

  /**
   * 인건비 계산 (시간당)
   */
  static calculateLaborCost(
    hours: number,
    hourlyWage: number = 10000 // 시급 기본값
  ): number {
    return Math.round(hours * hourlyWage)
  }

  /**
   * 간접비 계산 (전기, 가스, 임대료 등)
   */
  static calculateOverheadCost(
    materialCost: number,
    overheadRate: number = 0.15 // 재료비의 15% 기본값
  ): number {
    return Math.round(materialCost * overheadRate)
  }
}